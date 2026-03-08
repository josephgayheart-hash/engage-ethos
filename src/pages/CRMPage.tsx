import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Progress } from "@/components/ui/progress";
import {
  Search, Users, Building2, Mail, Phone, Linkedin, StickyNote,
  Clock, Send, ExternalLink, User, CheckCircle2, XCircle, Activity,
  Plus, PhoneCall, CalendarCheck, ArrowUpDown, Eye,
  ChevronRight, Pencil, Save, X, Contact, BarChart3, Wrench,
  FileText, MousePointerClick, Loader2, Radar, Target, DollarSign,
  TrendingUp, Calendar, Inbox, AlertTriangle, UserPlus, Briefcase,
  Globe, AtSign, Upload, Trash2, Download, Paperclip, Sparkles, Image as ImageIcon
} from "lucide-react";
import { BrandRadarTab } from "@/components/admin/BrandRadarTab";
import { EmailTemplatesTab } from "@/components/admin/EmailTemplatesTab";
import { SendEmailDialog } from "@/components/admin/SendEmailDialog";
import { firecrawlApi } from "@/lib/api/firecrawl";

// ── Types ──────────────────────────────────────────────────────────────────

interface Prospect {
  id: string;
  university_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_title: string | null;
  contact_phone: string | null;
  linkedin_url: string | null;
  status: string | null;
  notes: string | null;
  brand_launch_date: string | null;
  url: string;
  logo_url: string | null;
  source_article_url: string | null;
  source_article_title: string | null;
  discovered_at: string | null;
  updated_at: string | null;
}

interface OppFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploaded_at: string;
  uploaded_by?: string;
}

interface Opportunity {
  id: string;
  prospect_id: string | null;
  contact_ids: string[];
  contact_roles: Record<string, string>;
  name: string;
  stage: string;
  amount: number | null;
  close_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by_user_id: string | null;
  files: OppFile[];
  subscription_type: string | null;
  contract_term_months: number | null;
  seat_count: number | null;
  arr: number | null;
  price_per_seat: number | null;
  renewal_date: string | null;
  product_tier: string | null;
}

const CONTACT_ROLES = [
  "Decision Maker",
  "Champion",
  "Economic Buyer",
  "Technical Evaluator",
  "End User",
  "Executive Sponsor",
  "Influencer",
  "Blocker",
  "Legal/Procurement",
  "Other",
] as const;

interface OutreachRecord {
  id: string;
  subject: string | null;
  created_at: string | null;
  delivery_status: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  delivered_at: string | null;
  to_email: string | null;
  from_email: string | null;
  from_name: string | null;
  type: string;
  body?: string;
  html_body?: string;
}

interface NudgeRecord {
  id: string;
  subject: string | null;
  sent_at: string;
  nudge_type: string;
  email_type: string | null;
  delivery_status: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  delivered_at: string | null;
  recipient_email: string | null;
  events: any;
  metadata: any;
}

interface CRMNote {
  id: string;
  prospect_id: string;
  note_text: string;
  note_type: string;
  created_at: string;
  created_by_user_id: string;
}

interface AppSignup {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  last_login_at: string | null;
  created_at: string;
  tenant_id: string;
}

interface ToolUsageItem {
  tool_name: string;
  action: string;
  created_at: string;
}

interface OnboardingRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  title: string | null;
  institution_name_input: string | null;
  department: string | null;
  notes: string | null;
  referral_source: string | null;
  request_type: string;
  request_status: string;
  submitted_at: string;
  reviewed_at: string | null;
  agency_name: string | null;
  agency_website: string | null;
  estimated_client_count: number | null;
}

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["new", "contacted", "qualified", "demo_scheduled", "closed"];
const OPPORTUNITY_STAGES = [
  { value: "discovery", label: "Discovery", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "qualification", label: "Qualification", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
  { value: "demo", label: "Demo", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  { value: "proposal", label: "Proposal", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  { value: "negotiation", label: "Negotiation", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  { value: "closed_won", label: "Closed Won", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { value: "closed_lost", label: "Closed Lost", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
];
const NOTE_TYPES = [
  { value: "general", label: "General", icon: StickyNote },
  { value: "call", label: "Call", icon: PhoneCall },
  { value: "meeting", label: "Meeting", icon: CalendarCheck },
  { value: "follow-up", label: "Follow-up", icon: Clock },
];

const FROM_EMAILS = [
  "noreply@campusvoice.ai",
  "sales@campusvoice.ai",
  "support@campusvoice.ai",
  "tyler@campusvoice.ai",
];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  qualified: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  demo_scheduled: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

// ── Main Component ─────────────────────────────────────────────────────────

export default function CRMPage() {
  const { user } = useAuth();

  // Contacts state
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [appStatusFilter, setAppStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"contact_name" | "university_name" | "updated_at" | "last_contacted">("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // App signups cross-ref
  const [signups, setSignups] = useState<Map<string, AppSignup>>(new Map());

  // Outreach counts
  const [outreachCounts, setOutreachCounts] = useState<Map<string, { count: number; lastDate: string | null }>>(new Map());
  const [nudgeCountsByEmail, setNudgeCountsByEmail] = useState<Map<string, { count: number; lastDate: string | null }>>(new Map());

  // Detail panel
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState("overview");

  // Notes
  const [notes, setNotes] = useState<CRMNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newNoteType, setNewNoteType] = useState("general");
  const [savingNote, setSavingNote] = useState(false);

  // Outreach emails for detail
  const [outreachEmails, setOutreachEmails] = useState<OutreachRecord[]>([]);
  // Nudge/auto emails for detail (by email match)
  const [nudgeEmails, setNudgeEmails] = useState<NudgeRecord[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [emailTemplateCache, setEmailTemplateCache] = useState<Record<string, string>>({});
  // App usage analytics
  const [toolUsage, setToolUsage] = useState<ToolUsageItem[]>([]);
  const [messagesCreated, setMessagesCreated] = useState(0);
  const [loadingUsage, setLoadingUsage] = useState(false);

  // Inline editing
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Prospect>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Email composer
  const [composerOpen, setComposerOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [fromEmail, setFromEmail] = useState(FROM_EMAILS[0]);
  const fromName = fromEmail.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const [sendingEmail, setSendingEmail] = useState(false);

  // LinkedIn search
  const [searchingLinkedIn, setSearchingLinkedIn] = useState(false);
  const [linkedInResults, setLinkedInResults] = useState<{ linkedin_url: string; title: string; description?: string }[]>([]);

  // Email search
  const [searchingEmail, setSearchingEmail] = useState(false);
  const [emailResults, setEmailResults] = useState<{ email: string; source: string; confidence: string }[]>([]);

  // Website scrape
  const [scrapingWebsite, setScrapingWebsite] = useState(false);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);

  // Top-level CRM tab
  const [crmTab, setCrmTab] = useState("contacts");

  // Tenants & users for email tools
  const [tenants, setTenants] = useState<{ id: string; institution_name: string }[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [sendBulkOpen, setSendBulkOpen] = useState(false);

  // Opportunities
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  const [newOppName, setNewOppName] = useState("");
  const [newOppProspectId, setNewOppProspectId] = useState("");
  const [newOppContactIds, setNewOppContactIds] = useState<string[]>([]);
  const [creatingOpp, setCreatingOpp] = useState(false);
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [editingOpp, setEditingOpp] = useState(false);
  const [oppEditData, setOppEditData] = useState<Partial<Opportunity>>({});
  const [quickOppDialog, setQuickOppDialog] = useState<{ open: boolean; prospectId?: string; contactIds?: string[]; defaultName?: string }>({ open: false });
  const [quickOppName, setQuickOppName] = useState("");
  const [stageCelebration, setStageCelebration] = useState<"won" | "lost" | null>(null);
  const [stageConfirm, setStageConfirm] = useState<{ oppId: string; stage: "closed_won" | "closed_lost" } | null>(null);

  // Requests
  const [requests, setRequests] = useState<OnboardingRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestFilter, setRequestFilter] = useState("all");
  const [requestTypeFilter, setRequestTypeFilter] = useState("all");
  const [requestSearch, setRequestSearch] = useState("");

  // New Contact dialog
  const [newContactOpen, setNewContactOpen] = useState(false);
  const [newContactSaving, setNewContactSaving] = useState(false);
  const [quickFillText, setQuickFillText] = useState("");
  const [quickFillParsing, setQuickFillParsing] = useState(false);
  const [logoSearching, setLogoSearching] = useState<string | null>(null); // prospect id or "new"
  const [backfillingLogos, setBackfillingLogos] = useState(false);
  const [newContactData, setNewContactData] = useState({
    university_name: "",
    contact_name: "",
    contact_email: "",
    contact_title: "",
    contact_phone: "",
    linkedin_url: "",
    url: "",
    status: "new",
    notes: "",
    brand_launch_date: "",
    logo_url: "",
  });

  const selected = prospects.find((p) => p.id === selectedId) || null;

  // ── Load Prospects ───────────────────────────────────────────────────────
  const loadProspects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sales_prospects")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) toast.error("Failed to load contacts");
    else setProspects((data as any[]) || []);
    setLoading(false);
  }, []);

  // ── Load App Signups ────────────────────────────────────────────────────
  const loadSignups = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name, status, last_login_at, created_at, tenant_id");
    if (data) {
      const map = new Map<string, AppSignup>();
      (data as any[]).forEach((p) => map.set(p.email?.toLowerCase(), p));
      setSignups(map);
    }
  }, []);

  // ── Load Outreach Counts ────────────────────────────────────────────────
  const loadOutreachCounts = useCallback(async () => {
    // Get outreach_history counts by prospect_id
    const { data: outreachData } = await supabase
      .from("outreach_history")
      .select("prospect_id, created_at")
      .order("created_at", { ascending: false });

    // Get email_nudges counts by recipient_email
    const { data: nudgeData } = await supabase
      .from("email_nudges")
      .select("recipient_email, sent_at")
      .order("sent_at", { ascending: false });

    const map = new Map<string, { count: number; lastDate: string | null }>();

    // Count outreach_history by prospect_id
    if (outreachData) {
      (outreachData as any[]).forEach((row) => {
        if (!row.prospect_id) return;
        const existing = map.get(row.prospect_id);
        if (existing) { existing.count++; }
        else map.set(row.prospect_id, { count: 1, lastDate: row.created_at });
      });
    }

    // We'll store nudge counts keyed by email to merge later
    const nudgeByEmail = new Map<string, { count: number; lastDate: string | null }>();
    if (nudgeData) {
      (nudgeData as any[]).forEach((row) => {
        if (!row.recipient_email) return;
        const key = row.recipient_email.toLowerCase();
        const existing = nudgeByEmail.get(key);
        if (existing) existing.count++;
        else nudgeByEmail.set(key, { count: 1, lastDate: row.sent_at });
      });
    }

    setOutreachCounts(map);
    setNudgeCountsByEmail(nudgeByEmail);
  }, []);

  // ── Load Opportunities ──────────────────────────────────────────────────
  const loadOpportunities = useCallback(async () => {
    setLoadingOpportunities(true);
    const { data, error } = await supabase
      .from("crm_opportunities" as any)
      .select("*")
      .order("updated_at", { ascending: false });
    if (!error && data) setOpportunities(data as any[]);
    setLoadingOpportunities(false);
  }, []);

  // ── Load Requests ───────────────────────────────────────────────────────
  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    const { data, error } = await supabase
      .from("onboarding_requests")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (!error && data) setRequests(data as any[]);
    setLoadingRequests(false);
  }, []);

  // ── Convert Request to Prospect ─────────────────────────────────────────
  const handleConvertToProspect = async (req: OnboardingRequest) => {
    // Check for duplicate
    const existing = prospects.find(p => p.contact_email?.toLowerCase() === req.email.toLowerCase());
    if (existing) {
      toast.error(`A contact with email ${req.email} already exists (${existing.contact_name || existing.university_name})`);
      return;
    }
    const { error } = await supabase.from("sales_prospects").insert({
      university_name: req.institution_name_input || req.agency_name || "Unknown",
      contact_name: `${req.first_name} ${req.last_name}`,
      contact_email: req.email,
      contact_title: req.title || null,
      contact_phone: req.phone || null,
      url: req.agency_website || "",
      status: "new",
      notes: `Converted from ${req.request_type} request on ${format(new Date(), "yyyy-MM-dd")}. ${req.notes || ""}`.trim(),
    });
    if (error) toast.error("Failed to create contact");
    else {
      toast.success("Contact created from request");
      loadProspects();
    }
  };

  // ── Update Request Status ───────────────────────────────────────────────
  const handleUpdateRequestStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("onboarding_requests")
      .update({ request_status: status, reviewed_at: new Date().toISOString(), reviewed_by_admin_user_id: user?.id } as any)
      .eq("id", id);
    if (error) toast.error("Failed to update status");
    else { toast.success("Status updated"); loadRequests(); }
  };

  const handleLinkedInSearch = async () => {
    if (!editData.contact_name) {
      toast.error("Need contact name to search");
      return;
    }
    setSearchingLinkedIn(true);
    setLinkedInResults([]);
    try {
      const { data, error } = await supabase.functions.invoke("find-linkedin-profile", {
        body: {
          name: editData.contact_name,
          title: editData.contact_title || "",
          institution: editData.university_name || "",
        },
      });
      if (error || !data?.success) {
        toast.error("LinkedIn search failed");
      } else if (data.data?.length > 0) {
        setLinkedInResults(data.data);
        toast.success(`Found ${data.data.length} LinkedIn result(s)`);
      } else {
        toast.info("No LinkedIn profiles found");
      }
    } catch {
      toast.error("LinkedIn search failed");
    }
    setSearchingLinkedIn(false);
  };

  const handleSelectLinkedIn = (url: string) => {
    setEditData((d) => ({ ...d, linkedin_url: url }));
    setLinkedInResults([]);
    toast.success("LinkedIn URL set");
  };

  // ── Email Search ────────────────────────────────────────────────────────
  const handleEmailSearch = async () => {
    if (!editData.contact_name) {
      toast.error("Need contact name to search");
      return;
    }
    setSearchingEmail(true);
    setEmailResults([]);
    try {
      const { data, error } = await supabase.functions.invoke("find-contact-email", {
        body: {
          name: editData.contact_name,
          title: editData.contact_title || "",
          institution: editData.university_name || "",
        },
      });
      if (error || !data?.success) {
        toast.error("Email search failed");
      } else if (data.data?.length > 0) {
        setEmailResults(data.data);
        toast.success(`Found ${data.data.length} email(s)`);
      } else {
        toast.info("No email addresses found");
      }
    } catch {
      toast.error("Email search failed");
    }
    setSearchingEmail(false);
  };

  const handleSelectEmail = (email: string) => {
    setEditData((d) => ({ ...d, contact_email: email }));
    setEmailResults([]);
    toast.success("Email set");
  };

  // ── Website Scrape ──────────────────────────────────────────────────────
  const handleWebsiteScrape = async () => {
    const url = (editData as any).url;
    if (!url) {
      toast.error("Enter a website URL first");
      return;
    }
    setScrapingWebsite(true);
    try {
      const result = await firecrawlApi.scrape(url, { formats: ['markdown'], onlyMainContent: true });
      if (result.success && result.data) {
        const metadata = result.data.metadata;
        const markdown = result.data.markdown || '';
        
        // Extract useful info from the scraped content
        const updates: Partial<Prospect> = {};
        
        // If account name is empty, use the page title
        if (!editData.university_name && metadata?.title) {
          updates.university_name = metadata.title.split('|')[0].split('-')[0].trim();
        }
        
        // Try to extract a phone number from content
        if (!editData.contact_phone) {
          const phoneMatch = markdown.match(/(?:\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
          if (phoneMatch) updates.contact_phone = phoneMatch[0];
        }
        
        // Append scraped summary to notes
        const description = metadata?.description;
        if (description) {
          const currentNotes = editData.notes || '';
          updates.notes = currentNotes 
            ? `${currentNotes}\n\n--- Website Info ---\n${description}`
            : `--- Website Info ---\n${description}`;
        }
        
        if (Object.keys(updates).length > 0) {
          setEditData((d) => ({ ...d, ...updates }));
          toast.success("Website info imported");
        } else {
          toast.info("Scraped successfully but no new info extracted");
        }
      } else {
        toast.error(result.error || "Failed to scrape website");
      }
    } catch {
      toast.error("Website scrape failed");
    }
    setScrapingWebsite(false);
  };

  // ── Create Opportunity ──────────────────────────────────────────────────
  const handleCreateOpportunity = async (overrideProspectId?: string, overrideContactIds?: string[], overrideName?: string) => {
    const oppName = overrideName || newOppName.trim();
    if (!oppName) return;
    setCreatingOpp(true);
    const prospectId = overrideProspectId !== undefined ? overrideProspectId : (newOppProspectId && newOppProspectId !== "none" ? newOppProspectId : null);
    const contactIds = overrideContactIds || newOppContactIds;
    const { error } = await supabase.from("crm_opportunities" as any).insert({
      name: oppName,
      prospect_id: prospectId || null,
      contact_ids: contactIds,
      stage: "discovery",
      created_by_user_id: user?.id,
    } as any);
    if (error) toast.error("Failed to create opportunity");
    else {
      toast.success("Opportunity created");
      setNewOppName("");
      setNewOppProspectId("");
      setNewOppContactIds([]);
      loadOpportunities();
    }
    setCreatingOpp(false);
  };

  // ── Update Opportunity Stage ────────────────────────────────────────────
  const handleUpdateOppStage = async (oppId: string, newStage: string) => {
    // Require confirmation for terminal stages
    if (newStage === "closed_won" || newStage === "closed_lost") {
      setStageConfirm({ oppId, stage: newStage });
      return;
    }
    await executeStageUpdate(oppId, newStage);
  };

  const executeStageUpdate = async (oppId: string, newStage: string) => {
    const { error } = await supabase
      .from("crm_opportunities" as any)
      .update({ stage: newStage, updated_at: new Date().toISOString() } as any)
      .eq("id", oppId);
    if (error) toast.error("Failed to update stage");
    else {
      if (newStage === "closed_won") {
        setStageCelebration("won");
        setTimeout(() => setStageCelebration(null), 3500);
      } else if (newStage === "closed_lost") {
        setStageCelebration("lost");
        setTimeout(() => setStageCelebration(null), 3500);
      }
      loadOpportunities();
    }
  };

  // ── Delete Opportunity ──────────────────────────────────────────────────
  const handleDeleteOpportunity = async (oppId: string) => {
    if (!confirm("Delete this opportunity? This cannot be undone.")) return;
    const { error } = await supabase.from("crm_opportunities" as any).delete().eq("id", oppId);
    if (error) toast.error("Failed to delete opportunity");
    else {
      toast.success("Opportunity deleted");
      setSelectedOppId(null);
      loadOpportunities();
    }
  };

  // ── Update Opportunity Fields ───────────────────────────────────────────
  const handleUpdateOpportunity = async (oppId: string, updates: Partial<Opportunity>) => {
    // Auto-calculate ARR from price_per_seat, seat_count, and subscription_type
    const pps = updates.price_per_seat ?? null;
    const seats = updates.seat_count ?? null;
    const sub = updates.subscription_type ?? null;
    const term = updates.contract_term_months ?? null;
    let computedArr: number | null = null;
    if (pps && seats) {
      let annualMultiplier = 1;
      if (sub === "monthly") annualMultiplier = 12;
      else if (sub === "multi_year" && term) annualMultiplier = 12 / term;
      computedArr = Math.round(pps * seats * annualMultiplier);
    }

    const { error } = await supabase
      .from("crm_opportunities" as any)
      .update({ ...updates, arr: computedArr, updated_at: new Date().toISOString() } as any)
      .eq("id", oppId);
    if (error) toast.error("Failed to update opportunity");
    else {
      toast.success("Opportunity updated");
      setEditingOpp(false);
      loadOpportunities();
    }
  };

  // ── Upload Files to Opportunity ─────────────────────────────────────────
  const [uploadingOppFiles, setUploadingOppFiles] = useState(false);
  const oppFileInputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) node.setAttribute("multiple", "true");
  }, []);

  const handleUploadOppFiles = async (oppId: string, fileList: FileList) => {
    const opp = opportunities.find(o => o.id === oppId);
    if (!opp) return;
    setUploadingOppFiles(true);
    const existingFiles: OppFile[] = opp.files || [];
    const newFiles: OppFile[] = [];

    for (const file of Array.from(fileList)) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 20MB limit`);
        continue;
      }
      const fileId = crypto.randomUUID();
      const ext = file.name.split(".").pop() || "";
      const storagePath = `${oppId}/${fileId}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("crm-opportunity-files")
        .upload(storagePath, file);
      if (upErr) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }
      const { data: urlData } = supabase.storage
        .from("crm-opportunity-files")
        .getPublicUrl(storagePath);

      newFiles.push({
        id: fileId,
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type || "application/octet-stream",
        uploaded_at: new Date().toISOString(),
        uploaded_by: user?.id || undefined,
      });
    }

    if (newFiles.length > 0) {
      const allFiles = [...existingFiles, ...newFiles];
      const { error } = await supabase
        .from("crm_opportunities" as any)
        .update({ files: allFiles, updated_at: new Date().toISOString() } as any)
        .eq("id", oppId);
      if (error) toast.error("Failed to save file metadata");
      else {
        toast.success(`${newFiles.length} file(s) uploaded`);
        loadOpportunities();
      }
    }
    setUploadingOppFiles(false);
  };

  const handleDeleteOppFile = async (oppId: string, fileId: string) => {
    const opp = opportunities.find(o => o.id === oppId);
    if (!opp) return;
    const file = (opp.files || []).find((f: OppFile) => f.id === fileId);
    if (!file) return;

    // Delete from storage
    const pathPart = file.url.split("/crm-opportunity-files/")[1];
    if (pathPart) {
      await supabase.storage.from("crm-opportunity-files").remove([decodeURIComponent(pathPart)]);
    }

    const updatedFiles = (opp.files || []).filter((f: OppFile) => f.id !== fileId);
    const { error } = await supabase
      .from("crm_opportunities" as any)
      .update({ files: updatedFiles, updated_at: new Date().toISOString() } as any)
      .eq("id", oppId);
    if (error) toast.error("Failed to remove file");
    else {
      toast.success("File removed");
      loadOpportunities();
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("sheet") || type.includes("excel")) return "📊";
    if (type.includes("presentation") || type.includes("powerpoint")) return "📑";
    if (type.startsWith("image/")) return "🖼️";
    return "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  useEffect(() => {
    loadProspects();
    loadSignups();
    loadOutreachCounts();
    loadOpportunities();
    loadRequests();
    // Load tenants & users for email tools
    supabase.from("tenants").select("id, institution_name").then(({ data }) => {
      if (data) setTenants(data as any[]);
    });
    supabase.from("profiles").select("id, first_name, last_name, email, status, tenant_id, last_login_at, created_at").then(({ data }) => {
      if (data) setAllUsers(data as any[]);
    });
  }, [loadProspects, loadSignups, loadOutreachCounts, loadOpportunities, loadRequests]);

  // ── Load Detail Data ────────────────────────────────────────────────────
  const loadDetailData = useCallback(async (prospectId: string, contactEmail: string | null) => {
    setLoadingNotes(true);
    setLoadingEmails(true);
    setLoadingUsage(true);

    // Notes
    const notesPromise = supabase
      .from("crm_notes" as any)
      .select("*")
      .eq("prospect_id", prospectId)
      .order("created_at", { ascending: false });

    // Outreach emails
    const outreachPromise = supabase
      .from("outreach_history")
      .select("*")
      .eq("prospect_id", prospectId)
      .order("created_at", { ascending: false });

    // Nudge emails by email match
    const nudgePromise = contactEmail
      ? supabase
          .from("email_nudges")
          .select("id, subject, sent_at, nudge_type, email_type, delivery_status, opened_at, clicked_at, bounced_at, delivered_at, recipient_email, events, metadata")
          .eq("recipient_email", contactEmail)
          .order("sent_at", { ascending: false })
      : Promise.resolve({ data: [] });

    // App usage: find user profile by email
    const profileMatch = contactEmail ? signups.get(contactEmail.toLowerCase()) : null;

    const toolPromise = profileMatch
      ? supabase
          .from("tool_usage_events")
          .select("tool_name, action, created_at")
          .eq("user_id", profileMatch.id)
          .order("created_at", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [] });

    const messagesPromise = profileMatch
      ? supabase
          .from("personal_messages")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profileMatch.id)
      : Promise.resolve({ data: null, count: 0 });

    const [notesRes, outreachRes, nudgeRes, toolRes, messagesRes] = await Promise.all([
      notesPromise, outreachPromise, nudgePromise, toolPromise, messagesPromise,
    ]);

    setNotes((notesRes.data as any[]) || []);
    setLoadingNotes(false);

    setOutreachEmails((outreachRes.data as any[]) || []);
    const nudges = (nudgeRes.data as any[]) || [];
    setNudgeEmails(nudges);
    setLoadingEmails(false);

    // Fetch all email templates for nudge body preview (cached)
    if (Object.keys(emailTemplateCache).length === 0) {
      const { data: templates } = await supabase
        .from("email_templates")
        .select("id, html_content, template_key");
      if (templates) {
        const cache: Record<string, string> = {};
        (templates as any[]).forEach((t) => {
          cache[t.id] = t.html_content;
          cache[t.template_key] = t.html_content;
        });
        setEmailTemplateCache(cache);
      }
    }

    setToolUsage((toolRes.data as any[]) || []);
    setMessagesCreated((messagesRes as any).count || 0);
    setLoadingUsage(false);
  }, [signups]);

  useEffect(() => {
    if (selectedId) {
      const p = prospects.find((pr) => pr.id === selectedId);
      loadDetailData(selectedId, p?.contact_email || null);
      setDetailTab("overview");
      setEditing(false);
      setComposerOpen(false);
    }
  }, [selectedId, loadDetailData, prospects]);

  // ── Add Note ────────────────────────────────────────────────────────────
  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedId || !user) return;
    setSavingNote(true);
    const { error } = await supabase.from("crm_notes" as any).insert({
      prospect_id: selectedId,
      created_by_user_id: user.id,
      note_text: newNote.trim(),
      note_type: newNoteType,
    } as any);
    if (error) toast.error("Failed to save note");
    else {
      toast.success("Note added");
      setNewNote("");
      setNewNoteType("general");
      if (selectedId) {
        const p = prospects.find((pr) => pr.id === selectedId);
        loadDetailData(selectedId, p?.contact_email || null);
      }
    }
    setSavingNote(false);
  };

  // ── Save Edit ───────────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!selectedId) return;
    const { error } = await supabase
      .from("sales_prospects")
      .update(editData as any)
      .eq("id", selectedId);
    if (error) toast.error("Failed to update contact");
    else { toast.success("Contact updated"); setEditing(false); loadProspects(); }
  };

  // ── Delete Contact ──────────────────────────────────────────────────────
  const handleDeleteContact = async () => {
    if (!selectedId) return;
    // Delete related records first
    await supabase.from("crm_notes" as any).delete().eq("prospect_id", selectedId);
    const { error } = await supabase.from("sales_prospects" as any).delete().eq("id", selectedId);
    if (error) toast.error("Failed to delete contact");
    else {
      toast.success("Contact deleted");
      setSelectedId(null);
      setDeleteConfirmOpen(false);
      loadProspects();
    }
  };

  // ── Quick Fill with AI ───────────────────────────────────────────────────
  const handleQuickFill = async () => {
    if (!quickFillText.trim()) return;
    setQuickFillParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke("parse-contact-text", {
        body: { text: quickFillText.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const parsed = data?.data || {};
      setNewContactData((d) => ({
        ...d,
        university_name: parsed.university_name || d.university_name,
        contact_name: parsed.contact_name || d.contact_name,
        contact_email: parsed.contact_email || d.contact_email,
        contact_title: parsed.contact_title || d.contact_title,
        contact_phone: parsed.contact_phone || d.contact_phone,
        linkedin_url: parsed.linkedin_url || d.linkedin_url,
        url: parsed.url || d.url,
        notes: parsed.notes ? (d.notes ? d.notes + "\n" + parsed.notes : parsed.notes) : d.notes,
      }));
      setQuickFillText("");
      toast.success("Contact fields filled from text");
    } catch (e: any) {
      console.error("Quick fill error:", e);
      toast.error(e?.message || "Failed to parse text");
    } finally {
      setQuickFillParsing(false);
    }
  };

  // ── Logo Search ─────────────────────────────────────────────────────────
  const searchLogoForProspect = async (prospectId: string, universityName: string) => {
    setLogoSearching(prospectId);
    try {
      const { data, error } = await supabase.functions.invoke("search-university-logo", {
        body: { university_name: universityName },
      });
      if (error) throw new Error(error.message || "Edge function error");
      if (data?.success === false) {
        toast.info(data.reason || `No logo found for ${universityName}`);
      } else if (data?.logo_url) {
        await supabase.from("sales_prospects").update({ logo_url: data.logo_url } as any).eq("id", prospectId);
        setProspects((prev) =>
          prev.map((p) => (p.id === prospectId ? { ...p, logo_url: data.logo_url } : p))
        );
        toast.success(`Logo found for ${universityName}`);
      } else {
        toast.info(`No logo found for ${universityName}`);
      }
    } catch (e: any) {
      console.error("Logo search error:", e);
      toast.error(`Logo search failed: ${e?.message || "Unknown error"}`);
    } finally {
      setLogoSearching(null);
    }
  };

  const searchLogoForNewContact = async () => {
    if (!newContactData.university_name.trim()) return;
    setLogoSearching("new");
    try {
      const { data, error } = await supabase.functions.invoke("search-university-logo", {
        body: { university_name: newContactData.university_name.trim() },
      });
      if (error) throw new Error(error.message || "Edge function error");
      if (data?.success === false) {
        toast.info(data.reason || "No logo found");
      } else if (data?.logo_url) {
        setNewContactData((d) => ({ ...d, logo_url: data.logo_url }));
        toast.success("Logo found!");
      } else {
        toast.info("No logo found");
      }
    } catch (e: any) {
      console.error("Logo search error:", e);
      toast.error(`Logo search failed: ${e?.message || "Unknown error"}`);
    } finally {
      setLogoSearching(null);
    }
  };

  const backfillLogos = async () => {
    const withoutLogos = prospects.filter((p) => !p.logo_url && p.university_name);
    if (withoutLogos.length === 0) {
      toast.info("All contacts already have logos");
      return;
    }
    setBackfillingLogos(true);
    let found = 0;
    for (const p of withoutLogos) {
      try {
        const { data } = await supabase.functions.invoke("search-university-logo", {
          body: { university_name: p.university_name },
        });
        if (data?.logo_url) {
          await supabase.from("sales_prospects").update({ logo_url: data.logo_url } as any).eq("id", p.id);
          setProspects((prev) =>
            prev.map((pr) => (pr.id === p.id ? { ...pr, logo_url: data.logo_url } : pr))
          );
          found++;
        }
      } catch {
        // continue with next
      }
    }
    setBackfillingLogos(false);
    toast.success(`Found logos for ${found} of ${withoutLogos.length} contacts`);
  };

  // ── Create New Contact ─────────────────────────────────────────────────
  const handleCreateContact = async () => {
    if (!newContactData.university_name.trim()) {
      toast.error("Account name is required");
      return;
    }
    setNewContactSaving(true);
    const { error, data: inserted } = await supabase.from("sales_prospects").insert({
      university_name: newContactData.university_name.trim(),
      contact_name: newContactData.contact_name.trim() || null,
      contact_email: newContactData.contact_email.trim() || null,
      contact_title: newContactData.contact_title.trim() || null,
      contact_phone: newContactData.contact_phone.trim() || null,
      linkedin_url: newContactData.linkedin_url.trim() || null,
      url: newContactData.url.trim() || newContactData.university_name.trim(),
      status: newContactData.status || "new",
      notes: newContactData.notes.trim() || null,
      brand_launch_date: newContactData.brand_launch_date || null,
      logo_url: newContactData.logo_url.trim() || null,
    } as any).select("id").single();
    setNewContactSaving(false);
    if (error) {
      toast.error("Failed to create contact");
    } else {
      toast.success("Contact created");
      // Auto-search logo if none was set
      if (!newContactData.logo_url && newContactData.university_name.trim() && inserted?.id) {
        searchLogoForProspect(inserted.id, newContactData.university_name.trim());
      }
      setNewContactOpen(false);
      setNewContactData({
        university_name: "",
        contact_name: "",
        contact_email: "",
        contact_title: "",
        contact_phone: "",
        linkedin_url: "",
        url: "",
        status: "new",
        notes: "",
        brand_launch_date: "",
        logo_url: "",
      });
      loadProspects();
    }
  };

  // ── Send Email ──────────────────────────────────────────────────────────
  const handleSendEmail = async () => {
    if (!selected?.contact_email || !emailSubject.trim() || !emailBody.trim()) {
      toast.error("Subject and body are required");
      return;
    }
    setSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-prospect-email", {
        body: {
          to_email: selected.contact_email,
          to_name: selected.contact_name || "",
          subject: emailSubject,
          body: "",
          html_body: emailBody,
          from_name: fromName,
          from_email: fromEmail,
          prospect_id: selected.id,
        },
      });
      if (error || !data?.success) {
        toast.error("Failed to send email");
      } else {
        toast.success("Email sent!");
        setEmailSubject("");
        setEmailBody("");
        setComposerOpen(false);
        loadOutreachCounts();
        loadDetailData(selected.id, selected.contact_email);
      }
    } catch {
      toast.error("Send failed");
    }
    setSendingEmail(false);
  };

  // ── Helpers ─────────────────────────────────────────────────────────────
  const getAppStatus = (email: string | null) => {
    if (!email) return "none";
    const signup = signups.get(email.toLowerCase());
    if (!signup) return "none";
    if (signup.last_login_at) return "active";
    return "signed_up";
  };

  // Combined email count for a prospect (outreach by id + nudges by email)
  const getTotalEmailCount = (prospectId: string, email: string | null) => {
    const outreach = outreachCounts.get(prospectId);
    const nudge = email ? nudgeCountsByEmail.get(email.toLowerCase()) : null;
    const count = (outreach?.count || 0) + (nudge?.count || 0);
    // Pick the most recent date
    const dates = [outreach?.lastDate, nudge?.lastDate].filter(Boolean) as string[];
    const lastDate = dates.length > 0 ? dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] : null;
    return { count, lastDate };
  };

  const filtered = prospects
    .filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        p.contact_name?.toLowerCase().includes(q) ||
        p.university_name?.toLowerCase().includes(q) ||
        p.contact_email?.toLowerCase().includes(q) ||
        p.contact_title?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const appStatus = getAppStatus(p.contact_email);
      const matchesApp = appStatusFilter === "all" || appStatus === appStatusFilter;
      return matchesSearch && matchesStatus && matchesApp;
    })
    .sort((a, b) => {
      if (sortField === "last_contacted") {
        const aDate = getTotalEmailCount(a.id, a.contact_email).lastDate;
        const bDate = getTotalEmailCount(b.id, b.contact_email).lastDate;
        const aTime = aDate ? new Date(aDate).getTime() : 0;
        const bTime = bDate ? new Date(bDate).getTime() : 0;
        return sortDir === "asc" ? aTime - bTime : bTime - aTime;
      }
      const aVal = (a as any)[sortField] || "";
      const bVal = (b as any)[sortField] || "";
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  // KPIs
  const totalContacts = prospects.length;
  const totalSignedUp = prospects.filter((p) => getAppStatus(p.contact_email) !== "none").length;
  const totalActive = prospects.filter((p) => getAppStatus(p.contact_email) === "active").length;
  const totalEmails = prospects.reduce((sum, p) => sum + getTotalEmailCount(p.id, p.contact_email).count, 0);

  const AppStatusBadge = ({ email }: { email: string | null }) => {
    const status = getAppStatus(email);
    if (status === "active") return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs">Active</Badge>;
    if (status === "signed_up") return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">Signed Up</Badge>;
    return <Badge variant="outline" className="text-xs text-muted-foreground">Not Yet</Badge>;
  };

  // Merge ALL emails for timeline + emails tab
  const allEmails: Array<{
    id: string; subject: string | null; date: string; source: "outreach" | "auto";
    delivery_status: string | null; opened_at: string | null; clicked_at: string | null;
    bounced_at: string | null; delivered_at: string | null; to_email: string | null;
    from_name: string | null; from_email: string | null;
    email_type?: string | null; body?: string; html_body?: string;
  }> = [
    ...outreachEmails.map((e) => ({
      id: e.id, subject: e.subject, date: e.created_at || "", source: "outreach" as const,
      delivery_status: e.delivery_status, opened_at: e.opened_at, clicked_at: e.clicked_at,
      bounced_at: e.bounced_at, delivered_at: e.delivered_at, to_email: e.to_email,
      from_name: e.from_name, from_email: e.from_email,
      body: e.body, html_body: e.html_body,
    })),
    ...nudgeEmails.map((e) => {
      // Extract from info from events
      const sentEvent = e.events?.["email.sent"]?.data || e.events?.["email.delivered"]?.data;
      const fromRaw = sentEvent?.from || "";
      const fromMatch = typeof fromRaw === "string" ? fromRaw.match(/^(.+?)\s*<(.+?)>$/) : null;
      const nudgeFrom = fromMatch ? fromMatch[1] : (fromRaw || null);
      const nudgeFromEmail = fromMatch ? fromMatch[2] : (typeof fromRaw === "string" && fromRaw.includes("@") ? fromRaw : null);
      // Look up template body
      const templateId = e.metadata?.template_id;
      const templateKey = e.email_type || e.nudge_type;
      const templateHtml = (templateId && emailTemplateCache[templateId]) || emailTemplateCache[templateKey] || null;
      return {
        id: e.id, subject: e.subject, date: e.sent_at, source: "auto" as const,
        delivery_status: e.delivery_status, opened_at: e.opened_at, clicked_at: e.clicked_at,
        bounced_at: e.bounced_at, delivered_at: e.delivered_at, to_email: e.recipient_email,
        from_name: nudgeFrom as string | null, from_email: nudgeFromEmail as string | null,
        email_type: e.email_type || e.nudge_type,
        html_body: templateHtml as string | undefined,
      };
    }),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Tool usage summary
  const toolSummary = toolUsage.reduce<Record<string, number>>((acc, t) => {
    acc[t.tool_name] = (acc[t.tool_name] || 0) + 1;
    return acc;
  }, {});

  // Duplicate detection: build a map of emails that appear in multiple places
  const getDuplicateInfo = (email: string | null) => {
    if (!email) return null;
    const lower = email.toLowerCase();
    const dupes: string[] = [];
    // Check if there's an onboarding request with same email
    const matchingReq = requests.find(r => r.email.toLowerCase() === lower);
    if (matchingReq) dupes.push(`${matchingReq.request_type} request`);
    // Check if there's another prospect with same email
    const matchingProspects = prospects.filter(p => p.contact_email?.toLowerCase() === lower);
    if (matchingProspects.length > 1) dupes.push(`${matchingProspects.length} contacts`);
    return dupes.length > 0 ? dupes : null;
  };

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    const q = requestSearch.toLowerCase();
    const matchesSearch = !q ||
      `${r.first_name} ${r.last_name}`.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.institution_name_input?.toLowerCase().includes(q) ||
      r.agency_name?.toLowerCase().includes(q);
    const matchesStatus = requestFilter === "all" || r.request_status === requestFilter;
    const matchesType = requestTypeFilter === "all" || r.request_type === requestTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border bg-background">
        <div className="flex items-center gap-3 mb-2">
          <Contact className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">CRM</h1>
            <p className="text-sm text-muted-foreground">Manage contacts, notes, outreach, and tools</p>
          </div>
        </div>
        <Tabs value={crmTab} onValueChange={setCrmTab} className="mt-3">
          <TabsList className="grid grid-cols-6 w-full max-w-3xl">
            <TabsTrigger value="contacts" className="gap-1.5 text-xs"><Users className="h-3 w-3" /> Contacts</TabsTrigger>
            <TabsTrigger value="requests" className="gap-1.5 text-xs relative">
              <Inbox className="h-3 w-3" /> Requests
              {requests.filter(r => r.request_status === "submitted").length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {requests.filter(r => r.request_status === "submitted").length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="gap-1.5 text-xs"><Target className="h-3 w-3" /> Opportunities</TabsTrigger>
            <TabsTrigger value="radar" className="gap-1.5 text-xs"><Radar className="h-3 w-3" /> Radar</TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5 text-xs"><FileText className="h-3 w-3" /> Templates</TabsTrigger>
            <TabsTrigger value="bulk-email" className="gap-1.5 text-xs"><Mail className="h-3 w-3" /> Compose</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {crmTab === "contacts" && (
        <>
        {/* KPIs */}
        <div className="px-6 py-3 border-b border-border bg-background">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-muted/30"><CardContent className="p-3"><div className="text-xs text-muted-foreground">Contacts</div><div className="text-2xl font-bold text-foreground">{totalContacts}</div></CardContent></Card>
            <Card className="bg-muted/30"><CardContent className="p-3"><div className="text-xs text-muted-foreground">Signed Up</div><div className="text-2xl font-bold text-foreground">{totalSignedUp}</div></CardContent></Card>
            <Card className="bg-muted/30"><CardContent className="p-3"><div className="text-xs text-muted-foreground">Active Users</div><div className="text-2xl font-bold text-primary">{totalActive}</div></CardContent></Card>
            <Card className="bg-muted/30"><CardContent className="p-3"><div className="text-xs text-muted-foreground">Emails Sent</div><div className="text-2xl font-bold text-foreground">{totalEmails}</div></CardContent></Card>
          </div>
        </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-border flex flex-wrap items-center gap-3 bg-background">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contacts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Statuses</SelectItem>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={appStatusFilter} onValueChange={setAppStatusFilter}>
          <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="App Status" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="signed_up">Signed Up</SelectItem><SelectItem value="none">Not Yet</SelectItem></SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} contacts</span>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={backfillLogos} disabled={backfillingLogos} className="h-9 gap-1.5">
            {backfillingLogos ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Finding Logos...</> : <><Globe className="h-3.5 w-3.5" /> Backfill Logos</>}
          </Button>
          <Button size="sm" onClick={() => setNewContactOpen(true)} className="h-9 gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New Contact
          </Button>
        </div>
      </div>

      {/* Contacts Table */}
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("contact_name")}><div className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3" /></div></TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("university_name")}><div className="flex items-center gap-1">Account Name <ArrowUpDown className="h-3 w-3" /></div></TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Emails</TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("last_contacted")}><div className="flex items-center gap-1">Last Contacted <ArrowUpDown className="h-3 w-3" /></div></TableHead>
              <TableHead>App Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">No contacts found</TableCell></TableRow>
            ) : filtered.map((p) => {
              const ec = getTotalEmailCount(p.id, p.contact_email);
              return (
                <TableRow key={p.id} className={`cursor-pointer transition-colors ${selectedId === p.id ? "bg-accent" : ""}`} onClick={() => setSelectedId(p.id)}>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground">{p.contact_name || "—"}</span>
                        {getDuplicateInfo(p.contact_email) && (
                          <span title={`Duplicate: ${getDuplicateInfo(p.contact_email)!.join(", ")}`}>
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          </span>
                        )}
                      </div>
                      {p.contact_title && <div className="text-xs text-muted-foreground">{p.contact_title}</div>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-2">
                      {p.logo_url ? (
                        <img src={p.logo_url} alt="" className="h-5 w-5 rounded object-contain flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span>{p.university_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.contact_email || "—"}</TableCell>
                  <TableCell><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[p.status || "new"]}`}>{(p.status || "new").replace("_", " ")}</span></TableCell>
                  <TableCell className="text-sm text-center">{ec.count}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{ec.lastDate ? format(new Date(ec.lastDate), "MMM d, yyyy") : "—"}</TableCell>
                  <TableCell><AppStatusBadge email={p.contact_email} /></TableCell>
                  <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground" /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Detail Sheet */}
      <Sheet open={!!selectedId} onOpenChange={(open) => { if (!open) setSelectedId(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
          <SheetHeader className="p-5 pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selected?.logo_url ? (
                  <img src={selected.logo_url} alt="" className="h-10 w-10 rounded-lg object-contain border border-border bg-background p-0.5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <SheetTitle className="text-lg">{selected?.contact_name || "Contact"}</SheetTitle>
                  <SheetDescription className="text-sm flex items-center gap-1.5">
                    {selected?.university_name}
                    {selected && !selected.logo_url && (
                      <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px]" onClick={() => searchLogoForProspect(selected.id, selected.university_name)} disabled={logoSearching === selected.id}>
                        {logoSearching === selected.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Globe className="h-3 w-3" />}
                      </Button>
                    )}
                  </SheetDescription>
                </div>
              </div>
              <AppStatusBadge email={selected?.contact_email || null} />
            </div>
          </SheetHeader>

          <Tabs value={detailTab} onValueChange={setDetailTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-5 mt-2 grid grid-cols-5">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
              <TabsTrigger value="emails" className="text-xs">Emails</TabsTrigger>
              <TabsTrigger value="usage" className="text-xs">Usage</TabsTrigger>
              <TabsTrigger value="compose" className="text-xs">Compose</TabsTrigger>
            </TabsList>

            {/* ── Overview Tab ─────────────────────────────────── */}
            <TabsContent value="overview" className="flex-1 overflow-auto px-5 pb-5 mt-0">
              <div className="space-y-4 pt-4">
                <div className="flex justify-end">
                  {editing ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(false)}><X className="h-3 w-3 mr-1" /> Cancel</Button>
                      <Button size="sm" onClick={handleSaveEdit}><Save className="h-3 w-3 mr-1" /> Save</Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditing(true); setEditData(selected || {}); }}>
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setDeleteConfirmOpen(true)}>
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <InfoRow icon={User} label="Name" value={selected?.contact_name} editing={editing} field="contact_name" editData={editData} setEditData={setEditData} />
                  
                  {/* Email field with search */}
                  {editing ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center"><AtSign className="h-4 w-4 text-muted-foreground" /></div>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">Email</div>
                        <div className="flex gap-2">
                          <Input value={(editData as any).contact_email || ""} onChange={(e) => setEditData((d) => ({ ...d, contact_email: e.target.value }))} className="h-8 text-sm flex-1" placeholder="email@example.com" />
                          <Button size="sm" variant="outline" className="h-8 text-xs shrink-0" onClick={handleEmailSearch} disabled={searchingEmail}>
                            {searchingEmail ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Search className="h-3 w-3 mr-1" /> Find</>}
                          </Button>
                        </div>
                        {emailResults.length > 0 && (
                          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto border rounded-md p-2 bg-muted/30">
                            <div className="text-xs text-muted-foreground mb-1 font-medium">Select an email:</div>
                            {emailResults.map((r, i) => (
                              <button
                                key={i}
                                onClick={() => handleSelectEmail(r.email)}
                                className="w-full text-left p-2 rounded-md hover:bg-accent/50 transition-colors border border-transparent hover:border-border"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{r.email}</span>
                                  <Badge variant={r.confidence === 'high' ? 'default' : 'secondary'} className="text-[10px] h-4">
                                    {r.confidence}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground truncate mt-0.5">{r.source}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <InfoRow icon={Mail} label="Email" value={selected?.contact_email} editing={false} field="contact_email" editData={editData} setEditData={setEditData} />
                  )}

                  <InfoRow icon={Building2} label="Title" value={selected?.contact_title} editing={editing} field="contact_title" editData={editData} setEditData={setEditData} />
                  <InfoRow icon={Phone} label="Phone" value={selected?.contact_phone} editing={editing} field="contact_phone" editData={editData} setEditData={setEditData} />
                  
                  {/* LinkedIn field with search */}
                  {editing ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center"><Linkedin className="h-4 w-4 text-muted-foreground" /></div>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">LinkedIn</div>
                        <div className="flex gap-2">
                          <Input value={(editData as any).linkedin_url || ""} onChange={(e) => setEditData((d) => ({ ...d, linkedin_url: e.target.value }))} className="h-8 text-sm flex-1" placeholder="https://linkedin.com/in/..." />
                          <Button size="sm" variant="outline" className="h-8 text-xs shrink-0" onClick={handleLinkedInSearch} disabled={searchingLinkedIn}>
                            {searchingLinkedIn ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Search className="h-3 w-3 mr-1" /> Find</>}
                          </Button>
                        </div>
                        {linkedInResults.length > 0 && (
                          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto border rounded-md p-2 bg-muted/30">
                            <div className="text-xs text-muted-foreground mb-1 font-medium">Select a profile:</div>
                            {linkedInResults.map((r, i) => (
                              <button
                                key={i}
                                onClick={() => handleSelectLinkedIn(r.linkedin_url)}
                                className="w-full text-left p-2 rounded-md hover:bg-accent/50 transition-colors border border-transparent hover:border-border"
                              >
                                <div className="text-sm font-medium truncate">{r.title || r.linkedin_url}</div>
                                {r.description && <div className="text-xs text-muted-foreground truncate mt-0.5">{r.description}</div>}
                                <div className="text-xs text-primary/70 truncate mt-0.5">{r.linkedin_url}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <InfoRow icon={Linkedin} label="LinkedIn" value={selected?.linkedin_url} editing={false} field="linkedin_url" editData={editData} setEditData={setEditData} link />
                  )}

                  <InfoRow icon={Building2} label="Account Name" value={selected?.university_name} editing={editing} field="university_name" editData={editData} setEditData={setEditData} />

                  {/* Logo URL field with search */}
                  {editing ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center">
                        {(editData as any).logo_url ? (
                          <img src={(editData as any).logo_url} alt="" className="h-5 w-5 rounded object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">Logo URL</div>
                        <div className="flex gap-2">
                          <Input value={(editData as any).logo_url || ""} onChange={(e) => setEditData((d) => ({ ...d, logo_url: e.target.value }))} className="h-8 text-sm flex-1" placeholder="https://example.edu/logo.png" />
                          <Button size="sm" variant="outline" className="h-8 text-xs shrink-0" onClick={async () => {
                            const name = (editData as any).university_name || selected?.university_name;
                            if (!name) return;
                            setLogoSearching(selected?.id || "edit");
                            try {
                              const { data, error } = await supabase.functions.invoke("search-university-logo", { body: { university_name: name } });
                              if (error) throw new Error(error.message);
                              if (data?.logo_url) {
                                setEditData((d) => ({ ...d, logo_url: data.logo_url }));
                                toast.success("Logo found!");
                              } else {
                                toast.info(data?.reason || "No logo found");
                              }
                            } catch (e: any) {
                              toast.error(`Logo search failed: ${e?.message || "Unknown error"}`);
                            } finally {
                              setLogoSearching(null);
                            }
                          }} disabled={logoSearching != null}>
                            {logoSearching ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Search className="h-3 w-3 mr-1" /> Find</>}
                          </Button>
                        </div>
                        {(editData as any).logo_url && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <img src={(editData as any).logo_url} alt="Logo preview" className="h-8 w-8 rounded-md object-contain border border-border bg-background p-0.5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs text-destructive" onClick={() => setEditData((d) => ({ ...d, logo_url: "" }))}>
                              <X className="h-3 w-3 mr-0.5" /> Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center">
                        {selected?.logo_url ? (
                          <img src={selected.logo_url} alt="" className="h-5 w-5 rounded object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">Logo</div>
                        {selected?.logo_url ? (
                          <div className="flex items-center gap-2">
                            <img src={selected.logo_url} alt="Logo" className="h-8 w-8 rounded-md object-contain border border-border bg-background p-0.5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            <span className="text-sm text-muted-foreground truncate max-w-[200px]">{selected.logo_url}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No logo</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Website URL field with scrape */}
                  {editing ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center"><Globe className="h-4 w-4 text-muted-foreground" /></div>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">Website</div>
                        <div className="flex gap-2">
                          <Input value={(editData as any).url || ""} onChange={(e) => setEditData((d) => ({ ...d, url: e.target.value }))} className="h-8 text-sm flex-1" placeholder="https://example.edu" />
                          <Button size="sm" variant="outline" className="h-8 text-xs shrink-0" onClick={handleWebsiteScrape} disabled={scrapingWebsite}>
                            {scrapingWebsite ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Globe className="h-3 w-3 mr-1" /> Import</>}
                          </Button>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">Click Import to pull account info from this URL</div>
                      </div>
                    </div>
                  ) : (
                    <InfoRow icon={Globe} label="Website" value={selected?.url} editing={false} field="url" editData={editData} setEditData={setEditData} link />
                  )}

                  {/* Source Article (from Radar) */}
                  {selected?.source_article_url && !editing && (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center"><Radar className="h-4 w-4 text-muted-foreground" /></div>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">Source Article</div>
                        <a href={selected.source_article_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate block max-w-[400px]">
                          {selected.source_article_title || selected.source_article_url}
                        </a>
                      </div>
                    </div>
                  )}
                  {editing && (
                    <>
                      <InfoRow icon={Radar} label="Source Article Title" value={selected?.source_article_title} editing={editing} field="source_article_title" editData={editData} setEditData={setEditData} />
                      <InfoRow icon={Radar} label="Source Article URL" value={selected?.source_article_url} editing={editing} field="source_article_url" editData={editData} setEditData={setEditData} />
                    </>
                  )}

                  {editing ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center"><Activity className="h-4 w-4 text-muted-foreground" /></div>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">Status</div>
                        <Select value={editData.status || "new"} onValueChange={(v) => setEditData((d) => ({ ...d, status: v }))}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Status</div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[selected?.status || "new"]}`}>
                          {(selected?.status || "new").replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* App Status */}
                {selected?.contact_email && (() => {
                  const signup = signups.get(selected.contact_email.toLowerCase());
                  if (!signup) return (
                    <div className="p-3 rounded-lg border border-border bg-muted/20">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <XCircle className="h-4 w-4" /> Not yet signed up for the app
                      </div>
                    </div>
                  );
                  return (
                    <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary" /> App User
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>Status: <span className="font-medium text-foreground capitalize">{signup.status}</span></div>
                        <div>Joined: {format(new Date(signup.created_at), "MMM d, yyyy")}</div>
                        {signup.last_login_at && <div className="col-span-2">Last login: {format(new Date(signup.last_login_at), "MMM d, yyyy h:mm a")}</div>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => window.open(`/admin/user/${signup.id}`, "_blank")}>
                          <ExternalLink className="h-3 w-3 mr-1" /> View User Detail
                        </Button>
                      </div>
                    </div>
                  );
                })()}

                <Separator />

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-foreground">{allEmails.length}</div>
                    <div className="text-xs text-muted-foreground">Emails</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-foreground">{notes.length}</div>
                    <div className="text-xs text-muted-foreground">Notes</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-foreground">{messagesCreated}</div>
                    <div className="text-xs text-muted-foreground">Messages</div>
                  </div>
                </div>

                {/* Notes field */}
                {editing ? (
                  <div><div className="text-xs text-muted-foreground mb-1">Notes</div><Textarea value={editData.notes || ""} onChange={(e) => setEditData((d) => ({ ...d, notes: e.target.value }))} rows={3} /></div>
                ) : selected?.notes ? (
                  <div><div className="text-xs text-muted-foreground mb-1">Notes</div><p className="text-sm text-foreground whitespace-pre-wrap">{selected.notes}</p></div>
                ) : null}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={() => setDetailTab("compose")}>
                    <Send className="h-3 w-3 mr-1" /> Compose Email
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setQuickOppName(`Deal - ${selected?.university_name || ""}`);
                    setQuickOppDialog({ open: true, prospectId: selected?.id, contactIds: selected ? [selected.id] : [], defaultName: `Deal - ${selected?.university_name || ""}` });
                  }}>
                    <Target className="h-3 w-3 mr-1" /> Create Opportunity
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* ── Compose Tab ──────────────────────────────────── */}
            <TabsContent value="compose" className="flex-1 overflow-auto px-5 pb-5 mt-0">
              <div className="space-y-4 pt-4">
                <div className="text-sm font-medium text-foreground">
                  To: {selected?.contact_name} &lt;{selected?.contact_email}&gt;
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">From</label>
                  <Select value={fromEmail} onValueChange={setFromEmail}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select sender" /></SelectTrigger>
                    <SelectContent>{FROM_EMAILS.map((e) => <SelectItem key={e} value={e}>{e.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} &lt;{e}&gt;</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
                  <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Email subject..." className="h-9" />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Body</label>
                  <RichTextEditor content={emailBody} onChange={setEmailBody} placeholder="Write your email..." />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => { setEmailSubject(""); setEmailBody(""); }}>Clear</Button>
                  <Button size="sm" onClick={handleSendEmail} disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}>
                    {sendingEmail ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Sending...</> : <><Send className="h-3 w-3 mr-1" /> Send Email</>}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* ── Timeline Tab ─────────────────────────────────── */}
            <TabsContent value="timeline" className="flex-1 overflow-auto px-5 pb-5 mt-0">
              <div className="space-y-4 pt-4">
                <Card>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Select value={newNoteType} onValueChange={setNewNoteType}>
                        <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{NOTE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}><div className="flex items-center gap-1.5"><t.icon className="h-3 w-3" />{t.label}</div></SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <Textarea placeholder="Add a note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={2} className="text-sm" />
                    <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim() || savingNote}>
                      <Plus className="h-3 w-3 mr-1" /> {savingNote ? "Saving..." : "Add Note"}
                    </Button>
                  </CardContent>
                </Card>

                {loadingNotes ? (
                  <div className="text-center text-sm text-muted-foreground py-4">Loading...</div>
                ) : (() => {
                  const timeline: { type: "note" | "email" | "radar"; date: string; data: any }[] = [
                    ...notes.map((n) => ({ type: "note" as const, date: n.created_at, data: n })),
                    ...allEmails.map((e) => ({ type: "email" as const, date: e.date, data: e })),
                    // Add radar source article as a discovery event
                    ...(selected?.source_article_url ? [{
                      type: "radar" as const,
                      date: selected.discovered_at || selected.updated_at || new Date().toISOString(),
                      data: {
                        id: `radar-${selected.id}`,
                        source_article_url: selected.source_article_url,
                        source_article_title: selected.source_article_title,
                        university_name: selected.university_name,
                      },
                    }] : []),
                  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                  if (timeline.length === 0) return <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>;

                  return (
                    <div className="space-y-3">
                      {timeline.map((item, i) => (
                        <div key={`${item.type}-${item.data.id}-${i}`} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              item.type === "radar" ? "bg-accent text-accent-foreground" :
                              item.type === "note" ? "bg-primary/10 text-primary" : 
                              item.data.source === "auto" ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"
                            }`}>
                              {item.type === "radar" ? <Radar className="h-3.5 w-3.5" /> : item.type === "note" ? <StickyNote className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                            </div>
                            <div className="w-px flex-1 bg-border" />
                          </div>
                          <div className="pb-4 flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-medium text-foreground capitalize">
                                {item.type === "radar" ? "Brand Radar Discovery" : item.type === "note" ? item.data.note_type : (item.data.source === "auto" ? `Auto: ${item.data.email_type || "system"}` : "Outreach Email")}
                              </span>
                              <span className="text-xs text-muted-foreground">{format(new Date(item.date), "MMM d, yyyy h:mm a")}</span>
                              {item.type === "radar" && <Badge variant="secondary" className="text-[10px] h-4">Radar</Badge>}
                            </div>
                            {item.type === "radar" ? (
                              <div className="text-sm space-y-1">
                                <p className="text-foreground">Discovered via Brand Radar article scan</p>
                                {item.data.source_article_title && (
                                  <p className="text-muted-foreground text-xs">"{item.data.source_article_title}"</p>
                                )}
                                {item.data.source_article_url && (
                                  <a href={item.data.source_article_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                    <ExternalLink className="h-3 w-3" /> View source article
                                  </a>
                                )}
                              </div>
                            ) : item.type === "note" ? (
                              <p className="text-sm text-foreground">{item.data.note_text}</p>
                            ) : (
                              <div className="text-sm">
                                <div 
                                  className="cursor-pointer hover:bg-muted/50 rounded p-1 -m-1 transition-colors"
                                  onClick={() => setExpandedEmailId(expandedEmailId === item.data.id ? null : item.data.id)}
                                >
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-foreground">{item.data.subject || "(no subject)"}</span>
                                    {item.data.delivery_status && <Badge variant="outline" className="text-xs">{item.data.delivery_status}</Badge>}
                                    {item.data.source === "auto" && <Badge variant="secondary" className="text-xs">Auto</Badge>}
                                    <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform ${expandedEmailId === item.data.id ? "rotate-90" : ""}`} />
                                  </div>
                                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                                    {item.data.from_name && <span>From: {item.data.from_name}</span>}
                                    {item.data.to_email && <span>To: {item.data.to_email}</span>}
                                  </div>
                                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                                    {item.data.delivered_at && <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> Delivered</span>}
                                    {item.data.opened_at && <span className="flex items-center gap-1"><Eye className="h-3 w-3 text-primary" /> Opened {format(new Date(item.data.opened_at), "MMM d, h:mm a")}</span>}
                                    {item.data.clicked_at && <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3 text-primary" /> Clicked {format(new Date(item.data.clicked_at), "MMM d")}</span>}
                                    {item.data.bounced_at && <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-destructive" /> Bounced</span>}
                                  </div>
                                </div>
                                {expandedEmailId === item.data.id && (
                                  <div className="mt-2 border rounded-md bg-muted/30 overflow-hidden">
                                    <div className="px-3 py-2 border-b bg-muted/50 text-xs space-y-0.5">
                                      <div><span className="text-muted-foreground">From:</span> {item.data.from_name || "—"} {item.data.from_email ? `<${item.data.from_email}>` : ""}</div>
                                      <div><span className="text-muted-foreground">To:</span> {item.data.to_email || "—"}</div>
                                      <div><span className="text-muted-foreground">Date:</span> {item.date ? format(new Date(item.date), "EEEE, MMM d, yyyy 'at' h:mm a") : "—"}</div>
                                      <div><span className="text-muted-foreground">Subject:</span> {item.data.subject || "(no subject)"}</div>
                                    </div>
                                    {item.data.html_body ? (
                                      <div className="p-3 text-xs max-h-64 overflow-auto" dangerouslySetInnerHTML={{ __html: item.data.html_body }} />
                                    ) : item.data.body ? (
                                      <div className="p-3 text-xs whitespace-pre-wrap max-h-64 overflow-auto">{item.data.body}</div>
                                    ) : (
                                      <div className="p-3 text-xs text-muted-foreground italic">
                                        {item.data.source === "auto" ? "System-generated email — body not stored" : "No message body available"}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </TabsContent>

            {/* ── Emails Tab ───────────────────────────────────── */}
            <TabsContent value="emails" className="flex-1 overflow-auto px-5 pb-5 mt-0">
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-foreground">{allEmails.length} emails total</div>
                  <Button size="sm" variant="outline" onClick={() => setDetailTab("compose")}><Send className="h-3 w-3 mr-1" /> Compose</Button>
                </div>

                {loadingEmails ? (
                  <div className="text-center text-sm text-muted-foreground py-4">Loading...</div>
                ) : allEmails.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No emails sent</p>
                ) : allEmails.map((e) => (
                  <Card key={e.id}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-sm font-medium text-foreground truncate">{e.subject || "(no subject)"}</div>
                            {e.source === "auto" && <Badge variant="secondary" className="text-xs shrink-0">Auto</Badge>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {e.to_email && `To: ${e.to_email} · `}{e.date ? format(new Date(e.date), "MMM d, yyyy h:mm a") : ""}
                            {e.email_type && ` · Type: ${e.email_type}`}
                          </div>
                        </div>
                        <Badge variant={e.delivery_status === "bounced" ? "destructive" : "outline"} className="text-xs shrink-0">
                          {e.delivery_status || "sent"}
                        </Badge>
                      </div>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        {e.delivered_at && <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> Delivered</span>}
                        {e.opened_at && <span className="flex items-center gap-1"><Eye className="h-3 w-3 text-primary" /> Opened {format(new Date(e.opened_at), "MMM d")}</span>}
                        {e.clicked_at && <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3 text-primary" /> Clicked</span>}
                        {e.bounced_at && <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-destructive" /> Bounced</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ── Usage Tab ────────────────────────────────────── */}
            <TabsContent value="usage" className="flex-1 overflow-auto px-5 pb-5 mt-0">
              <div className="space-y-4 pt-4">
                {(() => {
                  const signup = selected?.contact_email ? signups.get(selected.contact_email.toLowerCase()) : null;
                  if (!signup) return (
                    <div className="text-center py-10">
                      <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">This contact hasn't signed up for the app yet</p>
                    </div>
                  );

                  return (
                    <>
                      {/* User stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <Card className="bg-muted/30"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-foreground">{messagesCreated}</div><div className="text-xs text-muted-foreground">Messages Created</div></CardContent></Card>
                        <Card className="bg-muted/30"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-foreground">{toolUsage.length}</div><div className="text-xs text-muted-foreground">Tool Actions</div></CardContent></Card>
                        <Card className="bg-muted/30"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-foreground">{Object.keys(toolSummary).length}</div><div className="text-xs text-muted-foreground">Tools Used</div></CardContent></Card>
                      </div>

                      {/* Tool breakdown */}
                      {Object.keys(toolSummary).length > 0 && (
                        <Card>
                          <CardHeader className="pb-2 pt-3 px-3">
                            <CardTitle className="text-sm flex items-center gap-2"><Wrench className="h-4 w-4" /> Tool Usage Breakdown</CardTitle>
                          </CardHeader>
                          <CardContent className="px-3 pb-3">
                            <div className="space-y-2">
                              {Object.entries(toolSummary)
                                .sort(([, a], [, b]) => b - a)
                                .map(([tool, count]) => {
                                  const max = Math.max(...Object.values(toolSummary));
                                  return (
                                    <div key={tool} className="space-y-1">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-foreground capitalize">{tool.replace(/_/g, " ")}</span>
                                        <span className="text-muted-foreground">{count}</span>
                                      </div>
                                      <Progress value={(count / max) * 100} className="h-1.5" />
                                    </div>
                                  );
                                })}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Recent activity */}
                      {toolUsage.length > 0 && (
                        <Card>
                          <CardHeader className="pb-2 pt-3 px-3">
                            <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Recent Activity</CardTitle>
                          </CardHeader>
                          <CardContent className="px-3 pb-3">
                            <div className="space-y-2 max-h-[300px] overflow-auto">
                              {toolUsage.slice(0, 20).map((t, i) => (
                                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border last:border-0">
                                  <div className="flex items-center gap-2">
                                    <Wrench className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-foreground capitalize">{t.tool_name.replace(/_/g, " ")}</span>
                                    <Badge variant="outline" className="text-[10px]">{t.action}</Badge>
                                  </div>
                                  <span className="text-muted-foreground">{format(new Date(t.created_at), "MMM d, h:mm a")}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {toolUsage.length === 0 && (
                        <div className="text-center py-6">
                          <BarChart3 className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No app usage recorded yet</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
      </>
      )}

      {crmTab === "opportunities" && (() => {
        const selectedOpp = opportunities.find(o => o.id === selectedOppId) || null;
        const linkedProspect = selectedOpp ? prospects.find(p => p.id === selectedOpp.prospect_id) : null;
        const linkedContacts = selectedOpp?.contact_ids?.map(cid => prospects.find(p => p.id === cid)).filter(Boolean) || [];
        const creatorUser = selectedOpp?.created_by_user_id ? allUsers.find(u => u.id === selectedOpp.created_by_user_id) : null;
        const creatorName = creatorUser ? `${creatorUser.first_name} ${creatorUser.last_name}` : null;

        // ── DETAIL VIEW ──
        if (selectedOpp) {
          const currentIdx = OPPORTUNITY_STAGES.findIndex(s => s.value === selectedOpp.stage);
          const stageInfo = OPPORTUNITY_STAGES.find(s => s.value === selectedOpp.stage);
          return (
          <div className="flex-1 overflow-auto">
            {/* Breadcrumb bar */}
            <div className="border-b bg-muted/30 px-6 py-3">
              <div className="flex items-center gap-2 text-sm">
                <button onClick={() => setSelectedOppId(null)} className="text-primary hover:underline font-medium">Opportunities</button>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-foreground font-medium truncate">{selectedOpp.name}</span>
              </div>
            </div>

            {/* Hero header */}
            <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-b">
              <div className="max-w-6xl mx-auto px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-sm">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">Opportunity</div>
                      <h1 className="text-xl font-bold text-foreground">{selectedOpp.name}</h1>
                      <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
                        {linkedProspect && (
                          <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {linkedProspect.university_name}</span>
                        )}
                        {selectedOpp.close_date && (
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Close: {format(new Date(selectedOpp.close_date), "MMM d, yyyy")}</span>
                        )}
                        {selectedOpp.amount && (
                          <span className="flex items-center gap-1 font-semibold text-foreground"><DollarSign className="h-3.5 w-3.5" /> ${Number(selectedOpp.amount).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditingOpp(!editingOpp);
                      if (!editingOpp) setOppEditData({ ...selectedOpp });
                    }}>
                      {editingOpp ? <><X className="h-3.5 w-3.5 mr-1" /> Cancel</> : <><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</>}
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleDeleteOpportunity(selectedOpp.id)}>
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage Confirmation Dialog */}
            <AlertDialog open={!!stageConfirm} onOpenChange={(open) => !open && setStageConfirm(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {stageConfirm?.stage === "closed_won" ? "🏆 Mark as Closed Won?" : "Mark as Closed Lost?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {stageConfirm?.stage === "closed_won"
                      ? "This will mark the opportunity as won. This action moves it to a terminal stage."
                      : "This will mark the opportunity as lost. This action moves it to a terminal stage."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={stageConfirm?.stage === "closed_won" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                    onClick={() => {
                      if (stageConfirm) {
                        executeStageUpdate(stageConfirm.oppId, stageConfirm.stage);
                        setStageConfirm(null);
                      }
                    }}
                  >
                    {stageConfirm?.stage === "closed_won" ? "Confirm Won" : "Confirm Lost"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Stage Celebration Overlay */}
            {stageCelebration === "won" && (
              <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
                {Array.from({ length: 60 }).map((_, i) => {
                  const left = Math.random() * 100;
                  const delay = Math.random() * 0.8;
                  const duration = 2 + Math.random() * 1.5;
                  const size = 8 + Math.random() * 14;
                  const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE"];
                  const color = colors[i % colors.length];
                  const rotate = Math.random() * 720;
                  const shapes = ["■", "●", "▲", "★", "◆", "♦"];
                  const shape = shapes[i % shapes.length];
                  return (
                    <div
                      key={i}
                      className="absolute text-2xl"
                      style={{
                        left: `${left}%`,
                        top: "-5%",
                        fontSize: `${size}px`,
                        color,
                        animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
                        transform: `rotate(${rotate}deg)`,
                      }}
                    >
                      {shape}
                    </div>
                  );
                })}
                <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
                  <div className="text-6xl animate-bounce">🎉</div>
                </div>
              </div>
            )}
            {stageCelebration === "lost" && (
              <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
                {Array.from({ length: 8 }).map((_, i) => {
                  const left = 15 + Math.random() * 70;
                  const delay = Math.random() * 0.6;
                  const duration = 2.5 + Math.random() * 1;
                  return (
                    <div
                      key={i}
                      className="absolute text-4xl"
                      style={{
                        left: `${left}%`,
                        top: "-8%",
                        animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
                        transform: `rotate(${Math.random() * 360}deg)`,
                      }}
                    >
                      💩
                    </div>
                  );
                })}
                <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
                  <div className="text-7xl" style={{ animation: "turd-plop 0.6s ease-out" }}>💩</div>
                </div>
              </div>
            )}

            {/* Stage pipeline - Monday.com style */}
            <div className="max-w-6xl mx-auto px-6 mt-5">
              <div className="flex items-center gap-1">
                {OPPORTUNITY_STAGES.map((stage, idx) => {
                  const isActive = stage.value === selectedOpp.stage;
                  const isPast = idx < currentIdx;
                  const isClosedWon = selectedOpp.stage === "closed_won";
                  const isClosedLost = selectedOpp.stage === "closed_lost";
                  const isFirst = idx === 0;
                  const isLast = idx === OPPORTUNITY_STAGES.length - 1;

                  let bgClass = "bg-muted/50 text-muted-foreground hover:bg-muted/70";
                  if (isActive) {
                    if (isClosedWon) bgClass = "bg-emerald-500 text-white hover:bg-emerald-600";
                    else if (isClosedLost) bgClass = "bg-destructive text-destructive-foreground hover:bg-destructive/90";
                    else bgClass = "bg-primary text-primary-foreground hover:bg-primary/90";
                  } else if (isPast) {
                    bgClass = "bg-primary/15 text-primary hover:bg-primary/25";
                  }

                  const roundedClass = isFirst ? "rounded-l-full" : isLast ? "rounded-r-full" : "";

                  return (
                    <button
                      key={stage.value}
                      onClick={() => handleUpdateOppStage(selectedOpp.id, stage.value)}
                      className={`flex-1 py-2.5 text-xs font-semibold text-center transition-all duration-200 ${bgClass} ${roundedClass}`}
                    >
                      <span className="flex items-center justify-center gap-1">
                        {isPast && <CheckCircle2 className="h-3 w-3" />}
                        {isActive && stage.value === "closed_won" && <span>🏆</span>}
                        {isActive && stage.value === "closed_lost" && <span>💩</span>}
                        {stage.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedOpp.stage !== "closed_won" && selectedOpp.stage !== "closed_lost" && (
                <div className="flex justify-end mt-3">
                  <Button size="sm" onClick={() => {
                    if (currentIdx < OPPORTUNITY_STAGES.length - 2) {
                      handleUpdateOppStage(selectedOpp.id, OPPORTUNITY_STAGES[currentIdx + 1].value);
                    }
                  }}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Mark Stage as Complete
                  </Button>
                </div>
              )}
            </div>

            {/* Content grid */}
            <div className="max-w-6xl mx-auto px-6 mt-6 pb-8 grid grid-cols-3 gap-6">
              {/* Left: Key Fields + Notes */}
              <div className="col-span-2 space-y-5">
                {editingOpp ? (
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm">Edit Opportunity</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Opportunity Name</label>
                        <Input value={oppEditData.name || ""} onChange={(e) => setOppEditData({ ...oppEditData, name: e.target.value })} className="h-9" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Deal Value</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                            <Input
                              className="h-9 pl-7"
                              value={oppEditData.amount ? Number(oppEditData.amount).toLocaleString() : ""}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/[^0-9.]/g, "");
                                setOppEditData({ ...oppEditData, amount: raw ? Number(raw) : null });
                              }}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Price per Seat</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                            <Input
                              className="h-9 pl-7"
                              value={oppEditData.price_per_seat ? Number(oppEditData.price_per_seat).toLocaleString() : ""}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/[^0-9.]/g, "");
                                setOppEditData({ ...oppEditData, price_per_seat: raw ? Number(raw) : null });
                              }}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Subscription</label>
                          <Select value={oppEditData.subscription_type || "none"} onValueChange={(v) => setOppEditData({ ...oppEditData, subscription_type: v === "none" ? null : v })}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">—</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="annual">Annual</SelectItem>
                              <SelectItem value="multi_year">Multi-Year</SelectItem>
                              <SelectItem value="perpetual">Perpetual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Term (months)</label>
                          <Input type="number" value={oppEditData.contract_term_months || ""} onChange={(e) => setOppEditData({ ...oppEditData, contract_term_months: e.target.value ? Number(e.target.value) : null })} className="h-9" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Seats / Users</label>
                          <Input type="number" value={oppEditData.seat_count || ""} onChange={(e) => setOppEditData({ ...oppEditData, seat_count: e.target.value ? Number(e.target.value) : null })} className="h-9" />
                        </div>
                      </div>
                      {/* Auto-calculated ARR preview */}
                      {(() => {
                        const pps = oppEditData.price_per_seat;
                        const seats = oppEditData.seat_count;
                        const term = oppEditData.contract_term_months;
                        const sub = oppEditData.subscription_type;
                        if (pps && seats) {
                          let annualMultiplier = 1;
                          if (sub === "monthly") annualMultiplier = 12;
                          else if (sub === "multi_year" && term) annualMultiplier = 12 / term;
                          else annualMultiplier = 1; // annual / perpetual = price is already annual
                          const computedArr = pps * seats * annualMultiplier;
                          return (
                            <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Calculated ARR</span>
                              <span className="text-sm font-semibold text-primary">${computedArr.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr</span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Product Tier</label>
                          <Select value={oppEditData.product_tier || "none"} onValueChange={(v) => setOppEditData({ ...oppEditData, product_tier: v === "none" ? null : v })}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">—</SelectItem>
                              <SelectItem value="starter">Starter</SelectItem>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Close Date</label>
                          <Input type="date" value={oppEditData.close_date || ""} onChange={(e) => setOppEditData({ ...oppEditData, close_date: e.target.value || null })} className="h-9" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Renewal Date</label>
                          <Input type="date" value={oppEditData.renewal_date || ""} onChange={(e) => setOppEditData({ ...oppEditData, renewal_date: e.target.value || null })} className="h-9" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Account</label>
                          <Select value={oppEditData.prospect_id || "none"} onValueChange={(v) => setOppEditData({ ...oppEditData, prospect_id: v === "none" ? null : v })}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="Link to account..." /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {Array.from(new Map(prospects.map(p => [p.university_name, p])).values()).map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.university_name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                        <Textarea value={oppEditData.notes || ""} onChange={(e) => setOppEditData({ ...oppEditData, notes: e.target.value })} rows={4} />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdateOpportunity(selectedOpp.id, oppEditData)} className="h-9">
                          <Save className="h-3.5 w-3.5 mr-1" /> Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setEditingOpp(false)} className="h-9">Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card>
                      <CardHeader className="pb-2 flex-row items-center justify-between">
                        <CardTitle className="text-sm font-semibold">Key Fields</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { label: "Stage", value: stageInfo?.label || selectedOpp.stage },
                            { label: "Deal Value", value: selectedOpp.amount ? `$${Number(selectedOpp.amount).toLocaleString()}` : "—" },
                            { label: "Price / Seat", value: selectedOpp.price_per_seat ? `$${Number(selectedOpp.price_per_seat).toLocaleString()}` : "—" },
                            { label: "ARR", value: selectedOpp.arr ? `$${Number(selectedOpp.arr).toLocaleString()}/yr` : "—" },
                            { label: "Subscription", value: selectedOpp.subscription_type ? selectedOpp.subscription_type.replace("_", "-").replace(/\b\w/g, c => c.toUpperCase()) : "—" },
                            { label: "Term", value: selectedOpp.contract_term_months ? `${selectedOpp.contract_term_months} months` : "—" },
                            { label: "Seats / Users", value: selectedOpp.seat_count ? selectedOpp.seat_count.toLocaleString() : "—" },
                            { label: "Product Tier", value: selectedOpp.product_tier ? selectedOpp.product_tier.replace(/\b\w/g, c => c.toUpperCase()) : "—" },
                            { label: "Close Date", value: selectedOpp.close_date ? format(new Date(selectedOpp.close_date), "MMM d, yyyy") : "—" },
                            { label: "Renewal Date", value: selectedOpp.renewal_date ? format(new Date(selectedOpp.renewal_date), "MMM d, yyyy") : "—" },
                            { label: "Account", value: linkedProspect?.university_name || "—" },
                            { label: "Created Date", value: format(new Date(selectedOpp.created_at), "MMM d, yyyy 'at' h:mm a") },
                            { label: "Last Modified", value: format(new Date(selectedOpp.updated_at), "MMM d, yyyy 'at' h:mm a") },
                            { label: "Created By", value: creatorName || "—" },
                            { label: "Opportunity Owner", value: creatorName || "—" },
                          ].map(f => (
                            <div key={f.label} className="flex flex-col py-2 border-b border-border/50 last:border-0">
                              <span className="text-xs text-muted-foreground mb-0.5">{f.label}</span>
                              <span className="text-sm font-medium text-foreground">{f.value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5"><StickyNote className="h-4 w-4" /> Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedOpp.notes ? (
                          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{selectedOpp.notes}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No notes yet. Click Edit to add notes.</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Files / Documents */}
                    <Card>
                      <CardHeader className="pb-2 flex-row items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                          <Paperclip className="h-4 w-4" /> Files ({(selectedOpp.files || []).length})
                        </CardTitle>
                        <div>
                          <input
                            type="file"
                            id="opp-file-upload"
                            className="hidden"
                            multiple
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.svg,.txt,.csv"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                handleUploadOppFiles(selectedOpp.id, e.target.files);
                                e.target.value = "";
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={uploadingOppFiles}
                            onClick={() => document.getElementById("opp-file-upload")?.click()}
                          >
                            {uploadingOppFiles ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Upload className="h-3 w-3 mr-1" />}
                            Upload
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {(selectedOpp.files || []).length === 0 ? (
                          <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
                            <Paperclip className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">No files uploaded yet</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Upload contracts, NDAs, proposals, etc.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {(selectedOpp.files as OppFile[]).map((file) => {
                              const uploaderUser = file.uploaded_by ? allUsers.find(u => u.id === file.uploaded_by) : null;
                              const uploaderName = uploaderUser ? `${uploaderUser.first_name} ${uploaderUser.last_name}` : null;
                              return (
                                <div key={file.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors group">
                                  <span className="text-lg shrink-0">{getFileIcon(file.type)}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-foreground truncate">{file.name}</div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                      <span>{formatFileSize(file.size)}</span>
                                      <span>·</span>
                                      <span>{format(new Date(file.uploaded_at), "MMM d, yyyy")}</span>
                                      {uploaderName && (
                                        <>
                                          <span>·</span>
                                          <span>{uploaderName}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
                                      <a href={file.url} target="_blank" rel="noopener noreferrer" title="Download">
                                        <Download className="h-3.5 w-3.5" />
                                      </a>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                      onClick={() => handleDeleteOppFile(selectedOpp.id, file.id)}
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Right sidebar: Contacts + Details */}
              <div className="space-y-5">
                {/* Contact Roles */}
                <Card>
                  <CardHeader className="pb-2 flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                      <Contact className="h-4 w-4" /> Contact Roles ({linkedContacts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {linkedContacts.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No contacts linked yet</p>
                    ) : (
                      <div className="space-y-2">
                        {linkedContacts.map((c: any) => {
                          const role = (selectedOpp.contact_roles as Record<string, string>)?.[c.id] || "";
                          return (
                            <div key={c.id} className="flex items-start gap-2 p-2 rounded-lg border border-border/50 bg-muted/30">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                <User className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-foreground truncate">{c.contact_name || "Unknown"}</div>
                                <div className="text-xs text-muted-foreground truncate">{c.contact_title || c.university_name}</div>
                                <Select
                                  value={role || "unset"}
                                  onValueChange={async (v) => {
                                    const newRoles = { ...(selectedOpp.contact_roles || {}), [c.id]: v === "unset" ? "" : v };
                                    await supabase.from("crm_opportunities" as any).update({ contact_roles: newRoles, updated_at: new Date().toISOString() } as any).eq("id", selectedOpp.id);
                                    loadOpportunities();
                                  }}
                                >
                                  <SelectTrigger className="h-7 text-xs mt-1 w-full">
                                    <SelectValue placeholder="Assign role..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="unset">No role</SelectItem>
                                    {CONTACT_ROLES.map(r => (
                                      <SelectItem key={r} value={r}>{r}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={async () => {
                                  const newIds = (selectedOpp.contact_ids || []).filter((id: string) => id !== c.id);
                                  const newRoles = { ...(selectedOpp.contact_roles || {}) };
                                  delete (newRoles as any)[c.id];
                                  await supabase.from("crm_opportunities" as any).update({ contact_ids: newIds, contact_roles: newRoles, updated_at: new Date().toISOString() } as any).eq("id", selectedOpp.id);
                                  loadOpportunities();
                                }}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add contact – searchable */}
                    <div className="pt-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full h-8 text-xs justify-start text-muted-foreground">
                            <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Add contact...
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search contacts..." className="h-9" />
                            <CommandList>
                              <CommandEmpty>No contacts found</CommandEmpty>
                              <CommandGroup>
                                {prospects
                                  .filter(p => p.contact_name && !selectedOpp.contact_ids?.includes(p.id))
                                  .map(p => (
                                    <CommandItem
                                      key={p.id}
                                      value={`${p.contact_name} ${p.university_name}`}
                                      onSelect={async () => {
                                        const newIds = [...(selectedOpp.contact_ids || []), p.id];
                                        await supabase.from("crm_opportunities" as any).update({ contact_ids: newIds, updated_at: new Date().toISOString() } as any).eq("id", selectedOpp.id);
                                        loadOpportunities();
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium">{p.contact_name}</span>
                                        <span className="text-xs text-muted-foreground">{p.contact_title ? `${p.contact_title} · ` : ""}{p.university_name}</span>
                                      </div>
                                    </CommandItem>
                                  ))
                                }
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Details */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-1.5"><Activity className="h-4 w-4" /> Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Owner</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                        <span className="font-medium text-foreground text-xs">{creatorName || "Unassigned"}</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Created By</span>
                      <span className="font-medium text-foreground text-xs">{creatorName || "—"}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Created</span>
                      <span className="text-xs text-foreground">{format(new Date(selectedOpp.created_at), "MMM d, yyyy")}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Modified</span>
                      <span className="text-xs text-foreground">{format(new Date(selectedOpp.updated_at), "MMM d, yyyy")}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          );
        }

        // ── LIST VIEW ──
        return (
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <div className="border-b bg-gradient-to-r from-primary/5 via-transparent to-transparent px-6 py-5">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" /> Opportunities
                </h2>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span>{opportunities.length} total</span>
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <DollarSign className="h-3.5 w-3.5" />
                    ${opportunities.reduce((s, o) => s + (Number(o.amount) || 0), 0).toLocaleString()} pipeline
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    {opportunities.filter(o => o.stage === "closed_won").length} won
                  </span>
                </div>
              </div>
              <Button onClick={() => {
                setNewOppName("");
                setNewOppProspectId("");
                setNewOppContactIds([]);
                setCreatingOpp(!creatingOpp);
              }} className="shadow-sm">
                {creatingOpp ? <><X className="h-4 w-4 mr-1.5" /> Cancel</> : <><Plus className="h-4 w-4 mr-1.5" /> New Opportunity</>}
              </Button>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-6 py-5 space-y-4">
            {/* Inline create form */}
            {creatingOpp && (
              <Card className="border-primary/20 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-end gap-3 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Opportunity Name</label>
                      <Input value={newOppName} onChange={(e) => setNewOppName(e.target.value)} placeholder="e.g. Enterprise Deal - State University" className="h-9" />
                    </div>
                    <div className="w-[220px]">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Account</label>
                      <Select value={newOppProspectId} onValueChange={setNewOppProspectId}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Link to account..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {Array.from(new Map(prospects.map(p => [p.university_name, p])).values()).map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.university_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={() => handleCreateOpportunity()} disabled={!newOppName.trim()} className="h-9">
                      <Plus className="h-4 w-4 mr-1" /> Create
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stage summary pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {OPPORTUNITY_STAGES.map((stage) => {
                const count = opportunities.filter(o => o.stage === stage.value).length;
                if (count === 0) return null;
                return (
                  <Badge key={stage.value} variant="outline" className={`text-xs gap-1 ${stage.color}`}>
                    {stage.label} <span className="font-bold">{count}</span>
                  </Badge>
                );
              })}
            </div>

            {/* Table */}
            {loadingOpportunities ? (
              <div className="text-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" /> Loading...</div>
            ) : opportunities.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 mx-auto flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">No opportunities yet</p>
                <p className="text-sm text-muted-foreground mt-1">Create your first opportunity to start tracking deals</p>
              </div>
            ) : (
              <Card className="shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-[250px] font-semibold">Opportunity</TableHead>
                      <TableHead className="font-semibold">Account</TableHead>
                      <TableHead className="font-semibold">Contact</TableHead>
                      <TableHead className="font-semibold">Stage</TableHead>
                      <TableHead className="text-right font-semibold">Amount</TableHead>
                      <TableHead className="text-right font-semibold">ARR</TableHead>
                      <TableHead className="font-semibold">Close Date</TableHead>
                      <TableHead className="font-semibold">Created</TableHead>
                      <TableHead className="font-semibold">Owner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opportunities.map((opp) => {
                      const prospect = prospects.find(p => p.id === opp.prospect_id);
                      const stageInfo = OPPORTUNITY_STAGES.find(s => s.value === opp.stage);
                      const owner = opp.created_by_user_id ? allUsers.find(u => u.id === opp.created_by_user_id) : null;
                      const ownerName = owner ? `${owner.first_name} ${owner.last_name}` : "—";
                      const primaryContact = opp.contact_ids?.[0] ? prospects.find(p => p.id === opp.contact_ids![0]) : null;
                      return (
                        <TableRow
                          key={opp.id}
                          className="cursor-pointer hover:bg-primary/5 transition-colors group"
                          onClick={() => { setSelectedOppId(opp.id); setEditingOpp(false); }}
                        >
                          <TableCell>
                            <div className="font-medium text-primary group-hover:underline">{opp.name}</div>
                          </TableCell>
                          <TableCell>
                            {prospect ? (
                              <div className="flex items-center gap-1.5 text-sm">
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{prospect.university_name}</span>
                              </div>
                            ) : <span className="text-muted-foreground text-sm">—</span>}
                          </TableCell>
                          <TableCell>
                            {primaryContact ? (
                              <div className="text-sm">
                                <div className="font-medium truncate max-w-[140px]">{primaryContact.contact_name}</div>
                                {opp.contact_ids && opp.contact_ids.length > 1 && (
                                  <span className="text-xs text-muted-foreground">+{opp.contact_ids.length - 1} more</span>
                                )}
                              </div>
                            ) : <span className="text-muted-foreground text-sm">—</span>}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-xs font-medium ${stageInfo?.color || ""}`}>
                              {stageInfo?.label || opp.stage}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {opp.amount ? `$${Number(opp.amount).toLocaleString()}` : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {opp.arr ? <span className="font-medium text-primary">${Number(opp.arr).toLocaleString()}/yr</span> : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="text-sm">
                            {opp.close_date ? format(new Date(opp.close_date), "MMM d, yyyy") : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(opp.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-xs text-foreground">{ownerName}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        </div>
        );
      })()}

      {crmTab === "radar" && (
        <div className="flex-1 overflow-auto p-6">
          <BrandRadarTab />
        </div>
      )}

      {crmTab === "templates" && (
        <div className="flex-1 overflow-auto p-6">
          <EmailTemplatesTab
            tenants={tenants}
            users={allUsers}
            onEmailSent={loadOutreachCounts}
          />
        </div>
      )}

      {crmTab === "requests" && (
        <div className="flex-1 overflow-auto flex flex-col">
          {/* Request KPIs */}
          <div className="px-6 py-3 border-b border-border bg-background">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="bg-muted/30"><CardContent className="p-3"><div className="text-xs text-muted-foreground">Total Requests</div><div className="text-2xl font-bold text-foreground">{requests.length}</div></CardContent></Card>
              <Card className="bg-muted/30"><CardContent className="p-3"><div className="text-xs text-muted-foreground">Pending Review</div><div className="text-2xl font-bold text-primary">{requests.filter(r => r.request_status === "submitted").length}</div></CardContent></Card>
              <Card className="bg-muted/30"><CardContent className="p-3"><div className="text-xs text-muted-foreground">University</div><div className="text-2xl font-bold text-foreground">{requests.filter(r => r.request_type === "university").length}</div></CardContent></Card>
              <Card className="bg-muted/30"><CardContent className="p-3"><div className="text-xs text-muted-foreground">Agency</div><div className="text-2xl font-bold text-foreground">{requests.filter(r => r.request_type === "agency").length}</div></CardContent></Card>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-3 border-b border-border flex flex-wrap items-center gap-3 bg-background">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search requests..." value={requestSearch} onChange={(e) => setRequestSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            <Select value={requestFilter} onValueChange={setRequestFilter}>
              <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={requestTypeFilter} onValueChange={setRequestTypeFilter}>
              <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="university">University</SelectItem>
                <SelectItem value="agency">Agency</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{filteredRequests.length} requests</span>
          </div>

          {/* Requests Table */}
          <ScrollArea className="flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Institution / Agency</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingRequests ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No requests found</TableCell></TableRow>
                ) : filteredRequests.map((r) => {
                  const hasDuplicate = prospects.some(p => p.contact_email?.toLowerCase() === r.email.toLowerCase());
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-foreground">{r.first_name} {r.last_name}</span>
                            {hasDuplicate && (
                              <span title="Already exists as a contact">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                              </span>
                            )}
                          </div>
                          {r.title && <div className="text-xs text-muted-foreground">{r.title}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs gap-1">
                          {r.request_type === "agency" ? <Briefcase className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                          {r.request_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{r.institution_name_input || r.agency_name || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          r.request_status === "submitted" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" :
                          r.request_status === "approved" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" :
                          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}>
                          {r.request_status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{format(new Date(r.submitted_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {r.request_status === "submitted" && (
                            <>
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleUpdateRequestStatus(r.id, "approved")}>
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleUpdateRequestStatus(r.id, "rejected")}>
                                <XCircle className="h-3 w-3 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          {!hasDuplicate && (
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleConvertToProspect(r)}>
                              <UserPlus className="h-3 w-3 mr-1" /> Convert
                            </Button>
                          )}
                          {hasDuplicate && (
                            <Badge variant="secondary" className="text-xs">Already a contact</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}

      {crmTab === "bulk-email" && (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto text-center py-10 space-y-4">
            <Mail className="h-10 w-10 mx-auto text-primary" />
            <h2 className="text-xl font-bold text-foreground">Compose & Send</h2>
            <p className="text-sm text-muted-foreground">Send targeted emails to users filtered by tenant, status, or retention criteria.</p>
            <Button onClick={() => setSendBulkOpen(true)}><Send className="h-4 w-4 mr-2" /> Open Email Composer</Button>
          </div>
        </div>
      )}

      <SendEmailDialog
        open={sendBulkOpen}
        onOpenChange={setSendBulkOpen}
        tenants={tenants}
        users={allUsers}
        onEmailSent={loadOutreachCounts}
      />

      {/* Quick Create Opportunity Dialog */}
      <Dialog open={quickOppDialog.open} onOpenChange={(open) => setQuickOppDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Create Opportunity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Opportunity Name</label>
              <Input
                value={quickOppName}
                onChange={(e) => setQuickOppName(e.target.value)}
                placeholder="e.g. Enterprise Deal - State University"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && quickOppName.trim()) {
                    handleCreateOpportunity(
                      quickOppDialog.prospectId,
                      quickOppDialog.contactIds || [],
                      quickOppName.trim()
                    );
                    setQuickOppDialog({ open: false });
                    setQuickOppName("");
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setQuickOppDialog({ open: false }); setQuickOppName(""); }}>
              Cancel
            </Button>
            <Button
              disabled={!quickOppName.trim()}
              onClick={() => {
                handleCreateOpportunity(
                  quickOppDialog.prospectId,
                  quickOppDialog.contactIds || [],
                  quickOppName.trim()
                );
                setQuickOppDialog({ open: false });
                setQuickOppName("");
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Contact Dialog */}
      <Dialog open={newContactOpen} onOpenChange={setNewContactOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> New Contact / Lead</DialogTitle>
          </DialogHeader>
          <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Quick Fill with AI
            </label>
            <Textarea
              placeholder="Paste a signature, directory listing, or any block of contact info here..."
              value={quickFillText}
              onChange={(e) => setQuickFillText(e.target.value)}
              rows={4}
              className="text-sm"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleQuickFill}
              disabled={quickFillParsing || !quickFillText.trim()}
              className="w-full"
            >
              {quickFillParsing ? (
                <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Parsing...</>
              ) : (
                <><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Parse & Fill Fields</>
              )}
            </Button>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Account Name *</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. University of Michigan"
                    value={newContactData.university_name}
                    onChange={(e) => setNewContactData(d => ({ ...d, university_name: e.target.value }))}
                    className="h-9 flex-1"
                    maxLength={200}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 gap-1 px-2.5 whitespace-nowrap"
                    disabled={!newContactData.university_name.trim() || logoSearching === "new"}
                    onClick={searchLogoForNewContact}
                  >
                    {logoSearching === "new" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
                    Find Logo
                  </Button>
                </div>
                {newContactData.logo_url && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <img src={newContactData.logo_url} alt="Logo" className="h-6 w-6 rounded object-contain border border-border" />
                    <span className="text-xs text-muted-foreground truncate">{newContactData.logo_url}</span>
                    <Button variant="ghost" size="sm" className="h-5 px-1" onClick={() => setNewContactData(d => ({ ...d, logo_url: "" }))}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Contact Name</label>
                <Input
                  placeholder="Full name"
                  value={newContactData.contact_name}
                  onChange={(e) => setNewContactData(d => ({ ...d, contact_name: e.target.value }))}
                  className="h-9"
                  maxLength={150}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Title / Role</label>
                <Input
                  placeholder="e.g. VP of Marketing"
                  value={newContactData.contact_title}
                  onChange={(e) => setNewContactData(d => ({ ...d, contact_title: e.target.value }))}
                  className="h-9"
                  maxLength={150}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                <Input
                  type="email"
                  placeholder="email@example.edu"
                  value={newContactData.contact_email}
                  onChange={(e) => setNewContactData(d => ({ ...d, contact_email: e.target.value }))}
                  className="h-9"
                  maxLength={255}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={newContactData.contact_phone}
                  onChange={(e) => setNewContactData(d => ({ ...d, contact_phone: e.target.value }))}
                  className="h-9"
                  maxLength={30}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">LinkedIn URL</label>
                <Input
                  placeholder="https://linkedin.com/in/..."
                  value={newContactData.linkedin_url}
                  onChange={(e) => setNewContactData(d => ({ ...d, linkedin_url: e.target.value }))}
                  className="h-9"
                  maxLength={500}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Website URL</label>
                <Input
                  placeholder="https://university.edu"
                  value={newContactData.url}
                  onChange={(e) => setNewContactData(d => ({ ...d, url: e.target.value }))}
                  className="h-9"
                  maxLength={500}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                <Select value={newContactData.status} onValueChange={(v) => setNewContactData(d => ({ ...d, status: v }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Brand Launch Date</label>
                <Input
                  type="date"
                  value={newContactData.brand_launch_date}
                  onChange={(e) => setNewContactData(d => ({ ...d, brand_launch_date: e.target.value }))}
                  className="h-9"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
              <Textarea
                placeholder="Any additional context..."
                value={newContactData.notes}
                onChange={(e) => setNewContactData(d => ({ ...d, notes: e.target.value }))}
                rows={3}
                maxLength={2000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewContactOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateContact} disabled={newContactSaving || !newContactData.university_name.trim()}>
              {newContactSaving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...</> : <><Plus className="h-4 w-4 mr-1" /> Create Contact</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Info Row Component ─────────────────────────────────────────────────────

function InfoRow({
  icon: Icon, label, value, editing, field, editData, setEditData, link
}: {
  icon: any;
  label: string;
  value: string | null | undefined;
  editing: boolean;
  field: string;
  editData: Partial<Prospect>;
  setEditData: React.Dispatch<React.SetStateAction<Partial<Prospect>>>;
  link?: boolean;
}) {
  if (editing) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 flex items-center justify-center"><Icon className="h-4 w-4 text-muted-foreground" /></div>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground mb-1">{label}</div>
          <Input value={(editData as any)[field] || ""} onChange={(e) => setEditData((d) => ({ ...d, [field]: e.target.value }))} className="h-8 text-sm" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        {link && value ? (
          <a href={value} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">{value}</a>
        ) : (
          <div className="text-sm text-foreground">{value || "—"}</div>
        )}
      </div>
    </div>
  );
}
