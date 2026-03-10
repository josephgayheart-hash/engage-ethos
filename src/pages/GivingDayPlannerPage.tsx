import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format, differenceInDays, addDays, parseISO, isBefore, isAfter, isToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAdvancementCampaigns, CampaignTouchpoint } from "@/hooks/useAdvancementCampaigns";
import { InstitutionalProfileSelector } from "@/components/InstitutionalProfileSelector";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { QuickGenerateDialog } from "@/components/giving-day/QuickGenerateDialog";
import {
  ArrowLeft, Plus, CalendarIcon, Target, Mail, MessageSquare, Megaphone, Phone,
  Globe, Heart, Users, Clock, ChevronRight, Sparkles, CheckCircle2, FileEdit,
  Send, Trash2, Gift, TrendingUp
} from "lucide-react";

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

const DEFAULT_TOUCHPOINTS: CampaignTouchpoint[] = T_MINUS_MILESTONES.map((m, i) => ({
  id: `default-${i}`,
  tMinusDays: m.days,
  label: m.days === 0 ? "Launch Email" : `${m.label} ${m.phase}`,
  channel: m.days === 0 ? "email" : (i % 2 === 0 ? "email" : "social-media"),
  segment: "all-donors",
  messageType: MESSAGE_TYPES[m.phase]?.types[0] || "Direct Ask",
  tone: m.phase === "Urgency" ? "urgent" : m.phase === "Stewardship" ? "celebratory" : "encouraging",
  status: "planned",
}));

const GivingDayPlannerPage = () => {
  const { campaigns, isLoading, createCampaign, updateCampaign, deleteCampaign } = useAdvancementCampaigns();
  const { tenant } = useAuth();
  const navigate = useNavigate();

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [newGoal, setNewGoal] = useState("");
  const [newProfileId, setNewProfileId] = useState<string | null>(null);

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  const handleCreate = async () => {
    if (!newName || !newDate) return;
    const result = await createCampaign({
      name: newName,
      giving_day_date: format(newDate, 'yyyy-MM-dd'),
      goal_amount: newGoal || undefined,
      profile_id: newProfileId,
      target_segments: SEGMENTS.map(s => s.value),
    });
    if (result) {
      // Save default touchpoints
      await updateCampaign(result.id, { touchpoints: DEFAULT_TOUCHPOINTS as any });
      setSelectedCampaignId(result.id);
      setShowNewDialog(false);
      setNewName("");
      setNewDate(undefined);
      setNewGoal("");
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
    // Navigate to message builder with pre-filled context
    const milestone = T_MINUS_MILESTONES.find(m => m.days === touchpoint.tMinusDays);
    const params = new URLSearchParams({
      audience: touchpoint.segment === 'alumni' ? 'alumni' : 'donors',
      channel: touchpoint.channel,
      moment: 'giving-day',
      tone: touchpoint.tone,
      context: `${selectedCampaign?.name || 'Giving Day'} campaign – ${milestone?.phase || ''} phase. Message type: ${touchpoint.messageType}. ${touchpoint.label}.`,
    });
    navigate(`/build?${params.toString()}`);
  };

  // Group touchpoints by phase
  const groupedTouchpoints = useMemo(() => {
    if (!selectedCampaign) return {};
    const groups: Record<string, { milestone: typeof T_MINUS_MILESTONES[0]; touchpoints: CampaignTouchpoint[] }> = {};
    for (const m of T_MINUS_MILESTONES) {
      const tps = selectedCampaign.touchpoints.filter(tp => tp.tMinusDays === m.days);
      if (tps.length > 0 || true) {
        groups[m.label] = { milestone: m, touchpoints: tps };
      }
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
                <DialogContent>
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
                    <div className="space-y-2">
                      <Label>Institutional Profile (optional)</Label>
                      <InstitutionalProfileSelector selectedProfileId={newProfileId} onProfileChange={(id) => setNewProfileId(id)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={!newName || !newDate}>Create Campaign</Button>
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

                  return (
                    <Card
                      key={campaign.id}
                      className="cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => setSelectedCampaignId(campaign.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{campaign.name}</CardTitle>
                            <CardDescription>{format(givingDay, 'EEEE, MMMM d, yyyy')}</CardDescription>
                          </div>
                          <Badge variant={isPast ? "secondary" : daysUntil <= 7 ? "destructive" : "default"}>
                            {isPast ? `${Math.abs(daysUntil)}d ago` : daysUntil === 0 ? "TODAY" : `${daysUntil}d away`}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> {campaign.goal_amount || 'No goal set'}</div>
                          <div className="flex items-center gap-1"><FileEdit className="w-3.5 h-3.5" /> {draftedCount}/{campaign.touchpoints.length} drafted</div>
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
    );
  }

  // Campaign detail / countdown view
  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setSelectedCampaignId(null)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-serif text-xl md:text-2xl font-bold text-foreground">
                  {selectedCampaign?.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Giving Day: {selectedCampaign && format(parseISO(selectedCampaign.giving_day_date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
              <Card className={cn("border-l-4", countdownInfo.daysUntil <= 0 ? "border-l-green-500" : countdownInfo.daysUntil <= 7 ? "border-l-orange-500" : "border-l-primary")}>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {countdownInfo.daysUntil <= 0 ? (countdownInfo.daysUntil === 0 ? "🎉" : `+${Math.abs(countdownInfo.daysUntil)}`) : countdownInfo.daysUntil}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {countdownInfo.daysUntil === 0 ? "It's Giving Day!" : countdownInfo.daysUntil > 0 ? "Days Until" : "Days Since"}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-foreground">{countdownInfo.totalTouchpoints}</div>
                  <div className="text-xs text-muted-foreground mt-1">Touchpoints</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-foreground">{countdownInfo.draftedCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">Content Drafted</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-foreground">{selectedCampaign?.goal_amount || "—"}</div>
                  <div className="text-xs text-muted-foreground mt-1">Goal</div>
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
                  {/* Phase connector line */}
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
                            <Button size="sm" variant="ghost" onClick={() => {
                              if (!selectedCampaign) return;
                              const newTp: CampaignTouchpoint = {
                                id: `tp-${Date.now()}`,
                                tMinusDays: milestone.days,
                                label: `${milestone.phase} Message`,
                                channel: "email",
                                segment: "all-donors",
                                messageType: MESSAGE_TYPES[milestone.phase]?.types[0] || "Direct Ask",
                                tone: milestone.phase === "Urgency" ? "urgent" : "encouraging",
                                status: "planned",
                              };
                              updateCampaign(selectedCampaign.id, {
                                touchpoints: [...selectedCampaign.touchpoints, newTp] as any,
                              });
                            }}>
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
                                        <TooltipContent>Generate copy in Message Builder</TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                          {/* Add another touchpoint at this milestone */}
                          <Button size="sm" variant="ghost" className="text-xs w-full" onClick={() => {
                            if (!selectedCampaign) return;
                            const newTp: CampaignTouchpoint = {
                              id: `tp-${Date.now()}`,
                              tMinusDays: milestone.days,
                              label: `Additional ${milestone.phase} Message`,
                              channel: "sms",
                              segment: "all-donors",
                              messageType: MESSAGE_TYPES[milestone.phase]?.types[1] || "Direct Ask",
                              tone: "encouraging",
                              status: "planned",
                            };
                            updateCampaign(selectedCampaign.id, {
                              touchpoints: [...selectedCampaign.touchpoints, newTp] as any,
                            });
                          }}>
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
        </div>
      </main>
    </div>
  );
};

export default GivingDayPlannerPage;
