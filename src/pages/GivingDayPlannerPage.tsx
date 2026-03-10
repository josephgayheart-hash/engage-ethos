import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useUserDrafts } from "@/hooks/useUserDrafts";
import ReactMarkdown from "react-markdown";
import { Link, useNavigate } from "react-router-dom";
import { format, differenceInDays, addDays, parseISO, isBefore, isToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdvancementCampaigns, CampaignTouchpoint } from "@/hooks/useAdvancementCampaigns";
import { InstitutionalProfileSelector } from "@/components/InstitutionalProfileSelector";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";
import { useContentDNAForGeneration } from "@/hooks/useContentDNAForGeneration";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { QuickGenerateDialog } from "@/components/giving-day/QuickGenerateDialog";
import { SEOHead } from "@/components/SEOHead";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft, Plus, CalendarIcon, Target, Mail, MessageSquare, Megaphone, Phone,
  Globe, Clock, ChevronRight, ChevronDown, Sparkles, CheckCircle2, FileEdit,
  Send, Trash2, Gift, DollarSign, LayoutList, PartyPopper, Timer, Copy,
  GraduationCap, Layers, Building, Briefcase, Building2, Download, FileText,
  ClipboardCopy, Loader2
} from "lucide-react";
import { campaignToText } from "@/lib/campaignExport";
import { openInGoogleDocs } from "@/lib/googleDocsExport";

import { jsPDF } from "jspdf";

const PROFILE_TYPE_LABELS: Record<string, { label: string; icon: typeof Building2 }> = {
  university: { label: "University", icon: Building2 },
  college: { label: "College", icon: GraduationCap },
  division: { label: "Division", icon: Layers },
  unit: { label: "Unit", icon: Building },
  department: { label: "Department", icon: Briefcase },
};

// T-minus milestones for giving day countdown
const T_MINUS_MILESTONES = [
  { days: -30, label: "T-30", phase: "Cultivation", color: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300" },
  { days: -21, label: "T-21", phase: "Cultivation", color: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300" },
  { days: -14, label: "T-14", phase: "Solicitation", color: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300" },
  { days: -7,  label: "T-7",  phase: "Solicitation", color: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300" },
  { days: -3,  label: "T-3",  phase: "Urgency", color: "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300" },
  { days: -1,  label: "T-1",  phase: "Urgency", color: "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300" },
  { days: 0,   label: "DAY OF", phase: "Giving Day", color: "bg-primary/10 border-primary/30 text-primary" },
  { days: 1,   label: "T+1",  phase: "Stewardship", color: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300" },
  { days: 3,   label: "T+3",  phase: "Stewardship", color: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300" },
  { days: 7,   label: "T+7",  phase: "Stewardship", color: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300" },
];

const SEGMENTS = [
  { value: "all-donors", label: "All Donors" },
  { value: "first-time", label: "First-Time Donors" },
  { value: "lapsed", label: "Lapsed Donors" },
  { value: "recurring", label: "Recurring Donors" },
  { value: "major-gift", label: "Major Gift Prospects" },
  { value: "alumni", label: "Alumni" },
  { value: "parents", label: "Parents & Families" },
  { value: "faculty-staff", label: "Faculty & Staff" },
];

const CHANNELS = [
  { value: "email", label: "Email", icon: Mail },
  { value: "sms", label: "SMS", icon: MessageSquare },
  { value: "social-media", label: "Social", icon: Megaphone },
  { value: "phone-call", label: "Phone", icon: Phone },
  { value: "landing-page", label: "Landing Page", icon: Globe },
];

const MESSAGE_TYPES: Record<string, { types: string[] }> = {
  "Cultivation": { types: ["Save the Date", "Impact Story", "Peer Testimonial", "Challenge Announcement"] },
  "Solicitation": { types: ["Direct Ask", "Matching Gift Alert", "Countdown Teaser", "Goal Update"] },
  "Urgency": { types: ["Last Chance", "Live Progress", "Peer Pressure", "Final Push"] },
  "Giving Day": { types: ["Launch Alert", "Hourly Update", "Milestone Reached", "Thank-You Flash"] },
  "Stewardship": { types: ["Thank You", "Impact Update", "Receipt + Next Steps", "Donor Spotlight"] },
};

/** Build touchpoints distributed across selected channels */
function buildDefaultTouchpoints(selectedChannels: string[]): CampaignTouchpoint[] {
  if (selectedChannels.length === 0) return [];
  return T_MINUS_MILESTONES.map((m, i) => {
    // Round-robin across the selected channels
    const channel = selectedChannels[i % selectedChannels.length];
    return {
      id: `default-${i}`,
      tMinusDays: m.days,
      label: m.days === 0
        ? `Launch ${CHANNELS.find(c => c.value === channel)?.label || "Message"}`
        : `${m.label} ${m.phase}`,
      channel,
      segment: "all-donors",
      messageType: MESSAGE_TYPES[m.phase]?.types[0] || "Direct Ask",
      tone: m.phase === "Urgency" ? "urgent" : m.phase === "Stewardship" ? "celebratory" : "encouraging",
      status: "planned",
    };
  });
}

const GivingDayPlannerPage = () => {
  const { campaigns, isLoading, createCampaign, updateCampaign, deleteCampaign } = useAdvancementCampaigns();
  const { tenant } = useAuth();
  const { profiles } = useInstitutionalProfiles();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveDraft, currentDraft } = useUserDrafts('campaign');

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [newGoal, setNewGoal] = useState("");
  const [newProfileId, setNewProfileId] = useState<string | null>(null);
  const [newChannels, setNewChannels] = useState<string[]>(["email", "social-media"]);
  const [quickGenTouchpoint, setQuickGenTouchpoint] = useState<CampaignTouchpoint | null>(null);
  const [quickGenOpen, setQuickGenOpen] = useState(false);
  const [expandedTouchpoints, setExpandedTouchpoints] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const campaignDetailRef = useRef<HTMLDivElement>(null);

  // Add touchpoint dialog state
  const [addTpMilestone, setAddTpMilestone] = useState<typeof T_MINUS_MILESTONES[0] | null>(null);
  const [addTpChannel, setAddTpChannel] = useState("email");
  const [addTpOpen, setAddTpOpen] = useState(false);

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  // Get the institutional profile config for the selected campaign
  const selectedProfile = profiles.find(p => p.id === selectedCampaign?.profile_id);
  const { contentDNA } = useContentDNAForGeneration({ profileId: selectedCampaign?.profile_id });

  // Fetch facts & stories for the selected campaign's profile for AI context
  const [profileFacts, setProfileFacts] = useState<{ label: string; value: string; category: string }[]>([]);
  const [profileStories, setProfileStories] = useState<{ title: string; narrative: string; pull_quote: string | null; story_type: string }[]>([]);

  useEffect(() => {
    if (!selectedCampaign?.profile_id) {
      setProfileFacts([]);
      setProfileStories([]);
      return;
    }
    const pid = selectedCampaign.profile_id;
    // Fetch facts
    supabase
      .from('fact_book')
      .select('label, value, category, is_highlight')
      .eq('profile_id', pid)
      .order('is_highlight', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setProfileFacts((data || []).map(f => ({ label: f.label, value: f.value, category: f.category })));
      });
    // Fetch stories
    supabase
      .from('story_bank')
      .select('title, narrative, pull_quote, story_type')
      .eq('profile_id', pid)
      .eq('is_approved', true)
      .order('is_featured', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setProfileStories((data || []).map(s => ({ title: s.title, narrative: s.narrative, pull_quote: s.pull_quote, story_type: s.story_type })));
      });
  }, [selectedCampaign?.profile_id]);

  const toggleNewChannel = (ch: string) => {
    setNewChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const handleCreate = async () => {
    if (!newName || !newDate || newChannels.length === 0) return;
    const result = await createCampaign({
      name: newName,
      giving_day_date: format(newDate, 'yyyy-MM-dd'),
      goal_amount: newGoal || undefined,
      profile_id: newProfileId,
      target_segments: SEGMENTS.map(s => s.value),
    });
    if (result) {
      const touchpoints = buildDefaultTouchpoints(newChannels);
      await updateCampaign(result.id, { touchpoints: touchpoints as any });
      setSelectedCampaignId(result.id);
      setShowNewDialog(false);
      setNewName("");
      setNewDate(undefined);
      setNewGoal("");
      setNewChannels(["email", "social-media"]);
    }
  };

  const handleTouchpointUpdate = async (touchpointId: string, updates: Partial<CampaignTouchpoint>) => {
    if (!selectedCampaign) return;
    const updated = selectedCampaign.touchpoints.map(tp =>
      tp.id === touchpointId ? { ...tp, ...updates } : tp
    );
    await updateCampaign(selectedCampaign.id, { touchpoints: updated as any });
  };

  const handleGenerateCopy = (touchpoint: CampaignTouchpoint) => {
    setQuickGenTouchpoint(touchpoint);
    setQuickGenOpen(true);
  };

  const handleAddTouchpoint = () => {
    if (!selectedCampaign || !addTpMilestone) return;
    const newTp: CampaignTouchpoint = {
      id: `tp-${Date.now()}`,
      tMinusDays: addTpMilestone.days,
      label: `${addTpMilestone.phase} ${CHANNELS.find(c => c.value === addTpChannel)?.label || "Message"}`,
      channel: addTpChannel,
      segment: "all-donors",
      messageType: MESSAGE_TYPES[addTpMilestone.phase]?.types[0] || "Direct Ask",
      tone: addTpMilestone.phase === "Urgency" ? "urgent" : "encouraging",
      status: "planned",
    };
    updateCampaign(selectedCampaign.id, {
      touchpoints: [...selectedCampaign.touchpoints, newTp] as any,
    });
    setAddTpOpen(false);
  };

  const openAddTouchpoint = (milestone: typeof T_MINUS_MILESTONES[0]) => {
    setAddTpMilestone(milestone);
    setAddTpChannel("email");
    setAddTpOpen(true);
  };

  const getCampaignText = useCallback(() => {
    if (!selectedCampaign) return "";
    return campaignToText(selectedCampaign, selectedProfile?.name);
  }, [selectedCampaign, selectedProfile]);

  const handleCopyToClipboard = useCallback(async () => {
    const text = getCampaignText();
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Campaign plan copied to clipboard. Paste it anywhere." });
  }, [getCampaignText, toast]);

  const handleExportGoogleDocs = useCallback(async () => {
    const text = getCampaignText();
    const success = await openInGoogleDocs(text, selectedCampaign?.name);
    if (success) {
      toast({ title: "Opening Google Docs", description: "Your campaign plan is on the clipboard — paste it in the new doc." });
    }
  }, [getCampaignText, selectedCampaign?.name, toast]);

  const handleExportPdf = useCallback(async () => {
    if (!selectedCampaign) return;
    setIsExporting(true);
    try {
      const text = getCampaignText();
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 50;
      const maxW = pageW - margin * 2;
      const lineHeight = 14;
      let y = margin;

      const addPage = () => { pdf.addPage(); y = margin; };

      const lines = text.split("\n");
      for (const rawLine of lines) {
        // Detect section headers
        const isSectionDivider = /^-{5,}$/.test(rawLine.trim());
        const isTitle = /^={5,}$/.test(rawLine.trim());
        const isPhaseHeader = rawLine.startsWith("## ");

        if (isTitle) continue; // skip underline decoration

        if (isSectionDivider) {
          y += 6;
          pdf.setDrawColor(180);
          pdf.line(margin, y, pageW - margin, y);
          y += 12;
          continue;
        }

        if (isPhaseHeader) {
          if (y > pageH - margin - 60) addPage();
          y += 8;
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(13);
          pdf.setTextColor(40, 40, 40);
          pdf.text(rawLine.replace("## ", ""), margin, y);
          y += lineHeight + 6;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(60, 60, 60);
          continue;
        }

        // First line (campaign name) gets special treatment
        if (lines.indexOf(rawLine) === 0) {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(16);
          pdf.setTextColor(20, 20, 20);
          pdf.text(rawLine, margin, y);
          y += 22;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(60, 60, 60);
          continue;
        }

        // Status icon lines (touchpoint headers)
        const isTouchpointLine = /^[✅📝📤⬜]/.test(rawLine.trim());
        if (isTouchpointLine) {
          if (y > pageH - margin - 40) addPage();
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          pdf.setTextColor(40, 40, 40);
          // Replace emoji with text markers for PDF compatibility
          const cleanLine = rawLine
            .replace("✅", "[APPROVED]")
            .replace("📝", "[DRAFT]")
            .replace("📤", "[SENT]")
            .replace("⬜", "[PENDING]");
          const wrapped = pdf.splitTextToSize(cleanLine, maxW);
          for (const wl of wrapped) {
            if (y > pageH - margin) addPage();
            pdf.text(wl, margin, y);
            y += lineHeight;
          }
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(60, 60, 60);
          continue;
        }

        // Metadata lines (indented with Channel/Segment info)
        const isMetaLine = rawLine.startsWith("    Channel:");
        if (isMetaLine) {
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          const wrapped = pdf.splitTextToSize(rawLine.trim(), maxW - 10);
          for (const wl of wrapped) {
            if (y > pageH - margin) addPage();
            pdf.text(wl, margin + 10, y);
            y += lineHeight - 1;
          }
          pdf.setFontSize(10);
          pdf.setTextColor(60, 60, 60);
          continue;
        }

        // Indented content (generated drafts)
        if (rawLine.startsWith("    ")) {
          pdf.setFontSize(9);
          pdf.setTextColor(80, 80, 80);
          const wrapped = pdf.splitTextToSize(rawLine.trim(), maxW - 20);
          for (const wl of wrapped) {
            if (y > pageH - margin) addPage();
            pdf.text(wl, margin + 15, y);
            y += lineHeight - 1;
          }
          pdf.setFontSize(10);
          pdf.setTextColor(60, 60, 60);
          continue;
        }

        // Empty lines
        if (rawLine.trim() === "") {
          y += 6;
          if (y > pageH - margin) addPage();
          continue;
        }

        // Regular text (header fields, notes, footer)
        const wrapped = pdf.splitTextToSize(rawLine, maxW);
        for (const wl of wrapped) {
          if (y > pageH - margin) addPage();
          pdf.text(wl, margin, y);
          y += lineHeight;
        }
      }

      const fileName = `${(selectedCampaign?.name || "campaign").replace(/\s+/g, "-").toLowerCase()}-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      pdf.save(fileName);
      toast({ title: "PDF exported", description: `Saved as ${fileName}` });
    } catch (err) {
      console.error("PDF export error:", err);
      toast({ title: "Export failed", description: "Could not generate PDF.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  }, [selectedCampaign, getCampaignText, toast]);


  const groupedTouchpoints = useMemo(() => {
    if (!selectedCampaign) return {};
    const groups: Record<string, { milestone: typeof T_MINUS_MILESTONES[0]; touchpoints: CampaignTouchpoint[] }> = {};
    for (const m of T_MINUS_MILESTONES) {
      const tps = selectedCampaign.touchpoints.filter(tp => tp.tMinusDays === m.days);
      groups[m.label] = { milestone: m, touchpoints: tps };
    }
    return groups;
  }, [selectedCampaign]);

  // Campaign countdown stats
  const countdownInfo = useMemo(() => {
    if (!selectedCampaign) return null;
    const givingDay = parseISO(selectedCampaign.giving_day_date);
    const today = new Date();
    const daysUntil = differenceInDays(givingDay, today);
    const totalTouchpoints = selectedCampaign.touchpoints.length;
    const draftedCount = selectedCampaign.touchpoints.filter(t => t.status !== 'planned').length;
    return { givingDay, daysUntil, totalTouchpoints, draftedCount };
  }, [selectedCampaign]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading campaigns...</div>;
  }

  // Campaign list view
  if (!selectedCampaignId) {
    return (
      <>
      <SEOHead
        title="Giving Day Planner | CampusVoice.AI"
        description="Plan and execute giving day campaigns with countdown-driven content calendars for every college, division, and unit."
      />
      <div className="bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
                </Link>
                <div>
                  <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                    <Gift className="w-7 h-7 text-primary" />
                    Giving Day Planner
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Plan and execute giving day campaigns with a countdown-driven content calendar
                  </p>
                </div>
              </div>
              <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                <DialogTrigger asChild>
                  <Button><Plus className="w-4 h-4 mr-2" /> New Campaign</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Giving Day Campaign</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Campaign Name</Label>
                      <Input placeholder="e.g., Spring Giving Day 2026" value={newName} onChange={e => setNewName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Giving Day Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left", !newDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newDate ? format(newDate, 'PPP') : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newDate} onSelect={setNewDate} /></PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Fundraising Goal (optional)</Label>
                      <Input placeholder="e.g., $250,000" value={newGoal} onChange={e => setNewGoal(e.target.value)} />
                    </div>

                    {/* Channel Mix Selection */}
                    <div className="space-y-2">
                      <Label>Channel Mix</Label>
                      <p className="text-xs text-muted-foreground">Select the channels you'll use. Touchpoints will be distributed across your mix.</p>
                      <div className="grid grid-cols-2 gap-2 mt-1.5">
                        {CHANNELS.map(ch => {
                          const Icon = ch.icon;
                          const selected = newChannels.includes(ch.value);
                          return (
                            <button
                              key={ch.value}
                              type="button"
                              onClick={() => toggleNewChannel(ch.value)}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm transition-all text-left",
                                selected
                                  ? "border-primary bg-primary/5 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-primary/30"
                              )}
                            >
                              <div className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                                selected ? "bg-primary border-primary" : "border-muted-foreground/30"
                              )}>
                                {selected && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                              </div>
                              <Icon className="w-4 h-4 shrink-0" />
                              <span className="font-medium">{ch.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      {newChannels.length === 0 && (
                        <p className="text-xs text-destructive mt-1">Select at least one channel</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Institutional Profile</Label>
                      <p className="text-xs text-muted-foreground">Select a university, college, or division to scope this campaign. AI-generated content will use that unit's stories, facts, and brand voice.</p>
                      <InstitutionalProfileSelector selectedProfileId={newProfileId} onProfileChange={(id) => setNewProfileId(id)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={!newName || !newDate || newChannels.length === 0}>Create Campaign</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {campaigns.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Gift className="w-12 h-12 text-muted-foreground/40 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Campaigns Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Create your first giving day campaign to get a countdown-driven content calendar with pre-mapped touchpoints across channels and segments.
                  </p>
                  <Button onClick={() => setShowNewDialog(true)}><Plus className="w-4 h-4 mr-2" /> Create Campaign</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {campaigns.map(campaign => {
                  const givingDay = parseISO(campaign.giving_day_date);
                  const daysUntil = differenceInDays(givingDay, new Date());
                  const draftedCount = campaign.touchpoints.filter((t: any) => t.status !== 'planned').length;
                  const isPast = daysUntil < 0;
                  const campProfile = profiles.find(p => p.id === campaign.profile_id);
                  const profileMeta = campProfile ? PROFILE_TYPE_LABELS[campProfile.profileType] || PROFILE_TYPE_LABELS.university : null;
                  const ProfileIcon = profileMeta?.icon || Building2;

                  return (
                    <Card
                      key={campaign.id}
                      className="cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => setSelectedCampaignId(campaign.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{campaign.name}</CardTitle>
                            <CardDescription>{format(givingDay, 'EEEE, MMMM d, yyyy')}</CardDescription>
                            {campProfile && (
                              <div className="flex items-center gap-1.5 pt-1">
                                <Badge variant="outline" className="gap-1 text-[10px] px-2 py-0.5 border-primary/30 text-primary">
                                  <ProfileIcon className="w-3 h-3" />
                                  {profileMeta?.label} Plan
                                </Badge>
                                <span className="text-xs text-muted-foreground">{campProfile.name}</span>
                              </div>
                            )}
                          </div>
                          <Badge variant={isPast ? "secondary" : daysUntil <= 7 ? "destructive" : "default"}>
                            {isPast ? `${Math.abs(daysUntil)}d ago` : daysUntil === 0 ? "TODAY" : `${daysUntil}d away`}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5" />
                            {campaign.goal_amount ? `$${campaign.goal_amount.replace(/^\$/, '')}` : 'No goal set'}
                          </div>
                          <div className="flex items-center gap-1.5"><FileEdit className="w-3.5 h-3.5" /> {draftedCount}/{campaign.touchpoints.length} drafted</div>
                        </div>
                        <div className="flex items-center justify-end mt-3">
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
      </>
    );
  }

  // Campaign detail / countdown view
  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto" ref={campaignDetailRef}>
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setSelectedCampaignId(null)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-xl md:text-2xl font-bold text-foreground">
                    {selectedCampaign?.name}
                  </h1>
                  {selectedProfile && (() => {
                    const meta = PROFILE_TYPE_LABELS[selectedProfile.profileType] || PROFILE_TYPE_LABELS.university;
                    const Icon = meta.icon;
                    return (
                      <Badge variant="outline" className="gap-1 text-[11px] border-primary/30 text-primary">
                        <Icon className="w-3 h-3" /> {meta.label} Plan
                      </Badge>
                    );
                  })()}
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedProfile && <span className="font-medium">{selectedProfile.name} · </span>}
                  Giving Day: {selectedCampaign && format(parseISO(selectedCampaign.giving_day_date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isExporting}>
                    {isExporting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Download className="w-4 h-4 mr-1.5" />}
                    Share / Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCopyToClipboard}>
                    <ClipboardCopy className="w-4 h-4 mr-2" /> Copy to Clipboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportGoogleDocs}>
                    <FileText className="w-4 h-4 mr-2" /> Open in Google Docs
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPdf}>
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="text-destructive" onClick={async () => {
                if (selectedCampaign && confirm('Delete this campaign?')) {
                  await deleteCampaign(selectedCampaign.id);
                  setSelectedCampaignId(null);
                }
              }}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </div>

          {/* Countdown Hero */}
          {countdownInfo && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <Card className={cn("border-l-4", countdownInfo.daysUntil <= 0 ? "border-l-primary" : countdownInfo.daysUntil <= 7 ? "border-l-destructive" : "border-l-primary")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      countdownInfo.daysUntil === 0 ? "bg-primary/10" : "bg-muted"
                    )}>
                      {countdownInfo.daysUntil === 0 
                        ? <PartyPopper className="w-5 h-5 text-primary" />
                        : <Timer className="w-5 h-5 text-muted-foreground" />
                      }
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {countdownInfo.daysUntil <= 0 ? (countdownInfo.daysUntil === 0 ? "Today" : `+${Math.abs(countdownInfo.daysUntil)}`) : countdownInfo.daysUntil}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {countdownInfo.daysUntil === 0 ? "It's Giving Day!" : countdownInfo.daysUntil > 0 ? "Days Until" : "Days Since"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <LayoutList className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{countdownInfo.totalTouchpoints}</div>
                      <div className="text-xs text-muted-foreground">Touchpoints</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <FileEdit className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{countdownInfo.draftedCount}</div>
                      <div className="text-xs text-muted-foreground">Content Drafted</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <DollarSign className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {selectedCampaign?.goal_amount ? `$${selectedCampaign.goal_amount.replace(/^\$/, '')}` : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">Goal</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-3">
            {Object.entries(groupedTouchpoints).map(([label, { milestone, touchpoints }]) => {
              const actualDate = selectedCampaign ? addDays(parseISO(selectedCampaign.giving_day_date), milestone.days) : new Date();
              const isPast = isBefore(actualDate, new Date()) && !isToday(actualDate);
              const isGivingDay = milestone.days === 0;

              return (
                <div key={label} className={cn("relative", isPast && "opacity-60")}>
                  <div className="flex items-stretch gap-4">
                    {/* Timeline marker */}
                    <div className="flex flex-col items-center w-20 shrink-0">
                      <div className={cn(
                        "rounded-lg border px-2 py-1 text-xs font-bold text-center w-full",
                        milestone.color,
                        isGivingDay && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      )}>
                        {label}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {format(actualDate, 'MMM d')}
                      </div>
                      <div className="w-px flex-1 bg-border mt-1" />
                    </div>

                    {/* Touchpoint cards */}
                    <div className="flex-1 pb-4">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                        {milestone.phase}
                      </div>
                      {touchpoints.length === 0 ? (
                        <Card className="border-dashed">
                          <CardContent className="p-3 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">No touchpoint planned</span>
                            <Button size="sm" variant="ghost" onClick={() => openAddTouchpoint(milestone)}>
                              <Plus className="w-3.5 h-3.5 mr-1" /> Add
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-2">
                          {touchpoints.map(tp => {
                            const ChannelIcon = CHANNELS.find(c => c.value === tp.channel)?.icon || Mail;
                            const statusIcon = tp.status === 'drafted' ? <FileEdit className="w-3.5 h-3.5 text-amber-500" /> :
                              tp.status === 'approved' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> :
                              tp.status === 'sent' ? <Send className="w-3.5 h-3.5 text-primary" /> :
                              <Clock className="w-3.5 h-3.5 text-muted-foreground" />;

                            return (
                              <Card key={tp.id} className="hover:border-primary/30 transition-colors">
                                <CardContent className="p-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                      <div className="shrink-0">{statusIcon}</div>
                                      <ChannelIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
                                      <div className="min-w-0">
                                        <div className="text-sm font-medium truncate">{tp.label}</div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                            {SEGMENTS.find(s => s.value === tp.segment)?.label || tp.segment}
                                          </Badge>
                                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                            {tp.messageType}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {tp.generatedContent && (
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-7 w-7"
                                          onClick={() => {
                                            setExpandedTouchpoints(prev => {
                                              const next = new Set(prev);
                                              if (next.has(tp.id)) next.delete(tp.id);
                                              else next.add(tp.id);
                                              return next;
                                            });
                                          }}
                                        >
                                          <ChevronDown className={cn(
                                            "w-3.5 h-3.5 transition-transform",
                                            expandedTouchpoints.has(tp.id) && "rotate-180"
                                          )} />
                                        </Button>
                                      )}
                                      <Select
                                        value={tp.status}
                                        onValueChange={(v) => handleTouchpointUpdate(tp.id, { status: v as any })}
                                      >
                                        <SelectTrigger className="h-7 text-xs w-24">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="planned">Planned</SelectItem>
                                          <SelectItem value="drafted">Drafted</SelectItem>
                                          <SelectItem value="approved">Approved</SelectItem>
                                          <SelectItem value="sent">Sent</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleGenerateCopy(tp)}>
                                            <Sparkles className="w-3.5 h-3.5" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Generate AI copy</TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </div>
                                  {/* Collapsible generated content */}
                                  {tp.generatedContent && expandedTouchpoints.has(tp.id) && (
                                    <div className="mt-3 pt-3 border-t">
                                      <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none bg-muted/30 rounded-lg p-3 [&_p]:my-1.5 [&_p]:leading-relaxed [&_ul]:my-1.5 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-1.5 [&_ol]:pl-5 [&_ol]:list-decimal [&_strong]:font-semibold [&_strong]:text-foreground [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-medium">
                                        <ReactMarkdown>{tp.generatedContent}</ReactMarkdown>
                                      </div>
                                      <div className="flex justify-end mt-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(tp.generatedContent || '');
                                            toast({ title: "Copied to clipboard" });
                                          }}
                                        >
                                          <Copy className="w-3 h-3" /> Copy
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                          {/* Add another touchpoint */}
                          <Button size="sm" variant="ghost" className="text-xs w-full" onClick={() => openAddTouchpoint(milestone)}>
                            <Plus className="w-3 h-3 mr-1" /> Add touchpoint
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Touchpoint Dialog */}
          <Dialog open={addTpOpen} onOpenChange={setAddTpOpen}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-base">Add Touchpoint{addTpMilestone ? ` — ${addTpMilestone.label}` : ''}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Channel</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CHANNELS.map(ch => {
                      const Icon = ch.icon;
                      const selected = addTpChannel === ch.value;
                      return (
                        <button
                          key={ch.value}
                          type="button"
                          onClick={() => setAddTpChannel(ch.value)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all text-left",
                            selected
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border text-muted-foreground hover:border-primary/30"
                          )}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="font-medium">{ch.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setAddTpOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={handleAddTouchpoint}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Quick Generate Dialog */}
          <QuickGenerateDialog
            open={quickGenOpen}
            onOpenChange={setQuickGenOpen}
            touchpoint={quickGenTouchpoint}
            campaignName={selectedCampaign?.name || "Giving Day"}
            phase={T_MINUS_MILESTONES.find(m => m.days === quickGenTouchpoint?.tMinusDays)?.phase || ""}
            goalAmount={selectedCampaign?.goal_amount}
            givingDayDate={selectedCampaign?.giving_day_date}
            institutionalConfig={selectedProfile?.config}
            contentDNA={contentDNA}
            profileFacts={profileFacts}
            profileStories={profileStories}
            profileName={selectedProfile?.name}
            profileType={selectedProfile?.profileType}
            onSaveDraft={(id, content, updates) => {
              handleTouchpointUpdate(id, {
                ...updates,
                generatedContent: content,
              } as any);
              setExpandedTouchpoints(prev => new Set(prev).add(id));
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default GivingDayPlannerPage;
