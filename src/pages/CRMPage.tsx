import { useState, useEffect, useCallback } from "react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Progress } from "@/components/ui/progress";
import {
  Search, Users, Building2, Mail, Phone, Linkedin, StickyNote,
  Clock, Send, ExternalLink, User, CheckCircle2, XCircle, Activity,
  Plus, PhoneCall, CalendarCheck, ArrowUpDown, Eye,
  ChevronRight, Pencil, Save, X, Contact, BarChart3, Wrench,
  FileText, MousePointerClick, Loader2, Radar, Target, DollarSign,
  TrendingUp, Calendar
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
  discovered_at: string | null;
  updated_at: string | null;
}

interface Opportunity {
  id: string;
  prospect_id: string | null;
  name: string;
  stage: string;
  amount: number | null;
  close_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

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
  type: string;
  body?: string;
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
  const [sortField, setSortField] = useState<"contact_name" | "university_name" | "updated_at">("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // App signups cross-ref
  const [signups, setSignups] = useState<Map<string, AppSignup>>(new Map());

  // Outreach counts
  const [outreachCounts, setOutreachCounts] = useState<Map<string, { count: number; lastDate: string | null }>>(new Map());

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

  // App usage analytics
  const [toolUsage, setToolUsage] = useState<ToolUsageItem[]>([]);
  const [messagesCreated, setMessagesCreated] = useState(0);
  const [loadingUsage, setLoadingUsage] = useState(false);

  // Inline editing
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Prospect>>({});

  // Email composer
  const [composerOpen, setComposerOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [fromEmail, setFromEmail] = useState(FROM_EMAILS[0]);
  const [fromName, setFromName] = useState("Dan Simmons");
  const [sendingEmail, setSendingEmail] = useState(false);

  // LinkedIn search
  const [searchingLinkedIn, setSearchingLinkedIn] = useState(false);

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
  const [creatingOpp, setCreatingOpp] = useState(false);

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
    const { data } = await supabase
      .from("outreach_history")
      .select("prospect_id, created_at")
      .eq("type", "email")
      .order("created_at", { ascending: false });
    if (data) {
      const map = new Map<string, { count: number; lastDate: string | null }>();
      (data as any[]).forEach((row) => {
        if (!row.prospect_id) return;
        const existing = map.get(row.prospect_id);
        if (existing) existing.count++;
        else map.set(row.prospect_id, { count: 1, lastDate: row.created_at });
      });
      setOutreachCounts(map);
    }
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

  // ── LinkedIn Search ─────────────────────────────────────────────────────
  const handleLinkedInSearch = async () => {
    if (!editData.contact_name || !editData.university_name) {
      toast.error("Need contact name and account name to search");
      return;
    }
    setSearchingLinkedIn(true);
    try {
      const { data, error } = await supabase.functions.invoke("find-linkedin-profile", {
        body: {
          name: editData.contact_name,
          title: editData.contact_title || "",
          institution: editData.university_name,
        },
      });
      if (error || !data?.success) {
        toast.error("LinkedIn search failed");
      } else if (data.data?.linkedin_url) {
        setEditData((d) => ({ ...d, linkedin_url: data.data.linkedin_url }));
        toast.success(`Found profile (${data.data.confidence} confidence)`);
      } else {
        toast.info("No LinkedIn profile found");
      }
    } catch {
      toast.error("LinkedIn search failed");
    }
    setSearchingLinkedIn(false);
  };

  // ── Create Opportunity ──────────────────────────────────────────────────
  const handleCreateOpportunity = async () => {
    if (!newOppName.trim()) return;
    setCreatingOpp(true);
    const { error } = await supabase.from("crm_opportunities" as any).insert({
      name: newOppName.trim(),
      prospect_id: newOppProspectId && newOppProspectId !== "none" ? newOppProspectId : null,
      stage: "discovery",
      created_by_user_id: user?.id,
    } as any);
    if (error) toast.error("Failed to create opportunity");
    else {
      toast.success("Opportunity created");
      setNewOppName("");
      setNewOppProspectId("");
      loadOpportunities();
    }
    setCreatingOpp(false);
  };

  // ── Update Opportunity Stage ────────────────────────────────────────────
  const handleUpdateOppStage = async (oppId: string, newStage: string) => {
    const { error } = await supabase
      .from("crm_opportunities" as any)
      .update({ stage: newStage, updated_at: new Date().toISOString() } as any)
      .eq("id", oppId);
    if (error) toast.error("Failed to update stage");
    else loadOpportunities();
  };

  useEffect(() => {
    loadProspects();
    loadSignups();
    loadOutreachCounts();
    loadOpportunities();
    // Load tenants & users for email tools
    supabase.from("tenants").select("id, institution_name").then(({ data }) => {
      if (data) setTenants(data as any[]);
    });
    supabase.from("profiles").select("id, first_name, last_name, email, status, tenant_id, last_login_at, created_at").then(({ data }) => {
      if (data) setAllUsers(data as any[]);
    });
  }, [loadProspects, loadSignups, loadOutreachCounts, loadOpportunities]);

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
          .select("id, subject, sent_at, nudge_type, email_type, delivery_status, opened_at, clicked_at, bounced_at, delivered_at, recipient_email")
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
    setNudgeEmails((nudgeRes.data as any[]) || []);
    setLoadingEmails(false);

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
  const totalEmails = Array.from(outreachCounts.values()).reduce((s, v) => s + v.count, 0);

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
    email_type?: string | null;
  }> = [
    ...outreachEmails.map((e) => ({
      id: e.id, subject: e.subject, date: e.created_at || "", source: "outreach" as const,
      delivery_status: e.delivery_status, opened_at: e.opened_at, clicked_at: e.clicked_at,
      bounced_at: e.bounced_at, delivered_at: e.delivered_at, to_email: e.to_email,
    })),
    ...nudgeEmails.map((e) => ({
      id: e.id, subject: e.subject, date: e.sent_at, source: "auto" as const,
      delivery_status: e.delivery_status, opened_at: e.opened_at, clicked_at: e.clicked_at,
      bounced_at: e.bounced_at, delivered_at: e.delivered_at, to_email: e.recipient_email,
      email_type: e.email_type || e.nudge_type,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Tool usage summary
  const toolSummary = toolUsage.reduce<Record<string, number>>((acc, t) => {
    acc[t.tool_name] = (acc[t.tool_name] || 0) + 1;
    return acc;
  }, {});

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
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="contacts" className="gap-1.5 text-xs"><Users className="h-3 w-3" /> Contacts</TabsTrigger>
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
              <TableHead>Last Contacted</TableHead>
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
              const oc = outreachCounts.get(p.id);
              return (
                <TableRow key={p.id} className={`cursor-pointer transition-colors ${selectedId === p.id ? "bg-accent" : ""}`} onClick={() => setSelectedId(p.id)}>
                  <TableCell><div><div className="font-medium text-foreground">{p.contact_name || "—"}</div>{p.contact_title && <div className="text-xs text-muted-foreground">{p.contact_title}</div>}</div></TableCell>
                  <TableCell className="text-sm">{p.university_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.contact_email || "—"}</TableCell>
                  <TableCell><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[p.status || "new"]}`}>{(p.status || "new").replace("_", " ")}</span></TableCell>
                  <TableCell className="text-sm text-center">{oc?.count || 0}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{oc?.lastDate ? format(new Date(oc.lastDate), "MMM d, yyyy") : "—"}</TableCell>
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
              <div>
                <SheetTitle className="text-lg">{selected?.contact_name || "Contact"}</SheetTitle>
                <SheetDescription className="text-sm">{selected?.university_name}</SheetDescription>
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
                    <Button size="sm" variant="outline" onClick={() => { setEditing(true); setEditData(selected || {}); }}>
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <InfoRow icon={User} label="Name" value={selected?.contact_name} editing={editing} field="contact_name" editData={editData} setEditData={setEditData} />
                  <InfoRow icon={Mail} label="Email" value={selected?.contact_email} editing={editing} field="contact_email" editData={editData} setEditData={setEditData} />
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
                      </div>
                    </div>
                  ) : (
                    <InfoRow icon={Linkedin} label="LinkedIn" value={selected?.linkedin_url} editing={false} field="linkedin_url" editData={editData} setEditData={setEditData} link />
                  )}

                  <InfoRow icon={Building2} label="Account Name" value={selected?.university_name} editing={editing} field="university_name" editData={editData} setEditData={setEditData} />

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
                </div>
              </div>
            </TabsContent>

            {/* ── Compose Tab ──────────────────────────────────── */}
            <TabsContent value="compose" className="flex-1 overflow-auto px-5 pb-5 mt-0">
              <div className="space-y-4 pt-4">
                <div className="text-sm font-medium text-foreground">
                  To: {selected?.contact_name} &lt;{selected?.contact_email}&gt;
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">From Name</label>
                    <Input value={fromName} onChange={(e) => setFromName(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">From Email</label>
                    <Select value={fromEmail} onValueChange={setFromEmail}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{FROM_EMAILS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
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
                  const timeline: { type: "note" | "email"; date: string; data: any }[] = [
                    ...notes.map((n) => ({ type: "note" as const, date: n.created_at, data: n })),
                    ...allEmails.map((e) => ({ type: "email" as const, date: e.date, data: e })),
                  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                  if (timeline.length === 0) return <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>;

                  return (
                    <div className="space-y-3">
                      {timeline.map((item, i) => (
                        <div key={`${item.type}-${item.data.id}-${i}`} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.type === "note" ? "bg-primary/10 text-primary" : item.data.source === "auto" ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"}`}>
                              {item.type === "note" ? <StickyNote className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                            </div>
                            <div className="w-px flex-1 bg-border" />
                          </div>
                          <div className="pb-4 flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-medium text-foreground capitalize">
                                {item.type === "note" ? item.data.note_type : (item.data.source === "auto" ? `Auto: ${item.data.email_type || "system"}` : "Outreach Email")}
                              </span>
                              <span className="text-xs text-muted-foreground">{format(new Date(item.date), "MMM d, yyyy h:mm a")}</span>
                            </div>
                            {item.type === "note" ? (
                              <p className="text-sm text-foreground">{item.data.note_text}</p>
                            ) : (
                              <div className="text-sm">
                                <span className="font-medium text-foreground">{item.data.subject || "(no subject)"}</span>
                                {item.data.delivery_status && <Badge variant="outline" className="ml-2 text-xs">{item.data.delivery_status}</Badge>}
                                {item.data.source === "auto" && <Badge variant="secondary" className="ml-1 text-xs">Auto</Badge>}
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

      {crmTab === "opportunities" && (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Create Opportunity */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Opportunity Name</label>
                    <Input value={newOppName} onChange={(e) => setNewOppName(e.target.value)} placeholder="e.g. Enterprise Deal - State University" className="h-9" />
                  </div>
                  <div className="w-[200px]">
                    <label className="text-xs text-muted-foreground mb-1 block">Account</label>
                    <Select value={newOppProspectId} onValueChange={setNewOppProspectId}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Link to account..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {prospects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.university_name} — {p.contact_name || "No contact"}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateOpportunity} disabled={!newOppName.trim() || creatingOpp} className="h-9">
                    {creatingOpp ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" /> Create</>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pipeline Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {OPPORTUNITY_STAGES.map((stage) => {
                const stageOpps = opportunities.filter((o) => o.stage === stage.value);
                return (
                  <Card key={stage.value} className="min-h-[200px]">
                    <CardHeader className="pb-2 pt-3 px-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stage.color}`}>
                          {stage.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{stageOpps.length}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 space-y-2">
                      {stageOpps.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">No opportunities</p>
                      )}
                      {stageOpps.map((opp) => {
                        const linkedProspect = prospects.find((p) => p.id === opp.prospect_id);
                        return (
                          <Card key={opp.id} className="bg-muted/30 border-border/50">
                            <CardContent className="p-2.5 space-y-1.5">
                              <div className="text-sm font-medium text-foreground">{opp.name}</div>
                              {linkedProspect && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Building2 className="h-3 w-3" /> {linkedProspect.university_name}
                                </div>
                              )}
                              {opp.amount && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" /> ${Number(opp.amount).toLocaleString()}
                                </div>
                              )}
                              {opp.close_date && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" /> {format(new Date(opp.close_date), "MMM d, yyyy")}
                                </div>
                              )}
                              <Select value={opp.stage} onValueChange={(v) => handleUpdateOppStage(opp.id, v)}>
                                <SelectTrigger className="h-7 text-xs mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {OPPORTUNITY_STAGES.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {loadingOpportunities && (
              <div className="text-center py-10 text-muted-foreground">Loading opportunities...</div>
            )}
          </div>
        </div>
      )}

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
