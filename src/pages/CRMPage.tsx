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
import {
  Search, Users, Building2, Mail, Phone, Linkedin, StickyNote,
  Clock, Send, ExternalLink, User, CheckCircle2, XCircle, Activity,
  Plus, MessageSquare, PhoneCall, CalendarCheck, ArrowUpDown, Eye,
  FileText, ChevronRight, Pencil, Save, X, Contact
} from "lucide-react";

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

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["new", "contacted", "qualified", "demo_scheduled", "closed"];
const NOTE_TYPES = [
  { value: "general", label: "General", icon: StickyNote },
  { value: "call", label: "Call", icon: PhoneCall },
  { value: "meeting", label: "Meeting", icon: CalendarCheck },
  { value: "follow-up", label: "Follow-up", icon: Clock },
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

  // Email history for detail
  const [emails, setEmails] = useState<OutreachRecord[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);

  // Inline editing
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Prospect>>({});

  const selected = prospects.find((p) => p.id === selectedId) || null;

  // ── Load Prospects ───────────────────────────────────────────────────────
  const loadProspects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sales_prospects")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      toast.error("Failed to load contacts");
    } else {
      setProspects((data as any[]) || []);
    }
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
        if (existing) {
          existing.count++;
        } else {
          map.set(row.prospect_id, { count: 1, lastDate: row.created_at });
        }
      });
      setOutreachCounts(map);
    }
  }, []);

  useEffect(() => {
    loadProspects();
    loadSignups();
    loadOutreachCounts();
  }, [loadProspects, loadSignups, loadOutreachCounts]);

  // ── Load Notes for selected ─────────────────────────────────────────────
  const loadNotes = useCallback(async (prospectId: string) => {
    setLoadingNotes(true);
    const { data } = await supabase
      .from("crm_notes" as any)
      .select("*")
      .eq("prospect_id", prospectId)
      .order("created_at", { ascending: false });
    setNotes((data as any[]) || []);
    setLoadingNotes(false);
  }, []);

  // ── Load Emails for selected ────────────────────────────────────────────
  const loadEmails = useCallback(async (prospectId: string) => {
    setLoadingEmails(true);
    const { data } = await supabase
      .from("outreach_history")
      .select("*")
      .eq("prospect_id", prospectId)
      .order("created_at", { ascending: false });
    setEmails((data as any[]) || []);
    setLoadingEmails(false);
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadNotes(selectedId);
      loadEmails(selectedId);
      setDetailTab("overview");
      setEditing(false);
    }
  }, [selectedId, loadNotes, loadEmails]);

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
    if (error) {
      toast.error("Failed to save note");
    } else {
      toast.success("Note added");
      setNewNote("");
      setNewNoteType("general");
      loadNotes(selectedId);
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
    if (error) {
      toast.error("Failed to update contact");
    } else {
      toast.success("Contact updated");
      setEditing(false);
      loadProspects();
    }
  };

  // ── Filtering & Sorting ─────────────────────────────────────────────────
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

  // ── KPI Stats ───────────────────────────────────────────────────────────
  const totalContacts = prospects.length;
  const totalSignedUp = prospects.filter((p) => getAppStatus(p.contact_email) !== "none").length;
  const totalActive = prospects.filter((p) => getAppStatus(p.contact_email) === "active").length;
  const totalEmails = Array.from(outreachCounts.values()).reduce((s, v) => s + v.count, 0);

  // ── App Status Badge ────────────────────────────────────────────────────
  const AppStatusBadge = ({ email }: { email: string | null }) => {
    const status = getAppStatus(email);
    if (status === "active") return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs">Active</Badge>;
    if (status === "signed_up") return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">Signed Up</Badge>;
    return <Badge variant="outline" className="text-xs text-muted-foreground">Not Yet</Badge>;
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border bg-background">
        <div className="flex items-center gap-3 mb-4">
          <Contact className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">CRM</h1>
            <p className="text-sm text-muted-foreground">Manage contacts, notes, and outreach</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Contacts</div>
              <div className="text-2xl font-bold text-foreground">{totalContacts}</div>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Signed Up</div>
              <div className="text-2xl font-bold text-foreground">{totalSignedUp}</div>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Active Users</div>
              <div className="text-2xl font-bold text-emerald-600">{totalActive}</div>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Emails Sent</div>
              <div className="text-2xl font-bold text-foreground">{totalEmails}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-border flex flex-wrap items-center gap-3 bg-background">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={appStatusFilter} onValueChange={setAppStatusFilter}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="App Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="signed_up">Signed Up</SelectItem>
            <SelectItem value="none">Not Yet</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} contacts</span>
      </div>

      {/* Contacts Table */}
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("contact_name")}>
                <div className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3" /></div>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("university_name")}>
                <div className="flex items-center gap-1">University <ArrowUpDown className="h-3 w-3" /></div>
              </TableHead>
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
            ) : (
              filtered.map((p) => {
                const oc = outreachCounts.get(p.id);
                return (
                  <TableRow
                    key={p.id}
                    className={`cursor-pointer transition-colors ${selectedId === p.id ? "bg-accent" : ""}`}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{p.contact_name || "—"}</div>
                        {p.contact_title && <div className="text-xs text-muted-foreground">{p.contact_title}</div>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{p.university_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.contact_email || "—"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[p.status || "new"]}`}>
                        {(p.status || "new").replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-center">{oc?.count || 0}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {oc?.lastDate ? format(new Date(oc.lastDate), "MMM d, yyyy") : "—"}
                    </TableCell>
                    <TableCell><AppStatusBadge email={p.contact_email} /></TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Detail Sheet */}
      <Sheet open={!!selectedId} onOpenChange={(open) => { if (!open) setSelectedId(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
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
            <TabsList className="mx-5 mt-2 grid grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="emails">Emails</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="flex-1 overflow-auto px-5 pb-5 mt-0">
              <div className="space-y-4 pt-4">
                {/* Edit toggle */}
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

                {/* Contact Info */}
                <div className="space-y-3">
                  <InfoRow icon={User} label="Name" value={selected?.contact_name} editing={editing} field="contact_name" editData={editData} setEditData={setEditData} />
                  <InfoRow icon={Mail} label="Email" value={selected?.contact_email} editing={editing} field="contact_email" editData={editData} setEditData={setEditData} />
                  <InfoRow icon={Building2} label="Title" value={selected?.contact_title} editing={editing} field="contact_title" editData={editData} setEditData={setEditData} />
                  <InfoRow icon={Phone} label="Phone" value={selected?.contact_phone} editing={editing} field="contact_phone" editData={editData} setEditData={setEditData} />
                  <InfoRow icon={Linkedin} label="LinkedIn" value={selected?.linkedin_url} editing={editing} field="linkedin_url" editData={editData} setEditData={setEditData} link />
                  <InfoRow icon={Building2} label="University" value={selected?.university_name} editing={editing} field="university_name" editData={editData} setEditData={setEditData} />

                  {editing ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center"><Activity className="h-4 w-4 text-muted-foreground" /></div>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">Status</div>
                        <Select value={editData.status || "new"} onValueChange={(v) => setEditData((d) => ({ ...d, status: v }))}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                          </SelectContent>
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

                {/* App Status Section */}
                {selected?.contact_email && (() => {
                  const signup = signups.get(selected.contact_email.toLowerCase());
                  if (!signup) return (
                    <div className="p-3 rounded-lg border border-border bg-muted/20">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <XCircle className="h-4 w-4" />
                        Not yet signed up for the app
                      </div>
                    </div>
                  );
                  return (
                    <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        App User
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>Status: <span className="font-medium text-foreground capitalize">{signup.status}</span></div>
                        <div>Joined: {format(new Date(signup.created_at), "MMM d, yyyy")}</div>
                        {signup.last_login_at && <div className="col-span-2">Last login: {format(new Date(signup.last_login_at), "MMM d, yyyy h:mm a")}</div>}
                      </div>
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => window.open(`/admin/user/${signup.id}`, "_blank")}>
                        <ExternalLink className="h-3 w-3 mr-1" /> View User Detail
                      </Button>
                    </div>
                  );
                })()}

                <Separator />

                {/* Notes */}
                {editing ? (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Notes</div>
                    <Textarea
                      value={editData.notes || ""}
                      onChange={(e) => setEditData((d) => ({ ...d, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>
                ) : selected?.notes ? (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Notes</div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{selected.notes}</p>
                  </div>
                ) : null}

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    if (selected?.contact_email) {
                      window.open(`/admin/prospect-outreach?email=${encodeURIComponent(selected.contact_email)}`, "_blank");
                    }
                  }}>
                    <Send className="h-3 w-3 mr-1" /> Send Email
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Timeline Tab (Notes + Activity) */}
            <TabsContent value="timeline" className="flex-1 overflow-auto px-5 pb-5 mt-0">
              <div className="space-y-4 pt-4">
                {/* Add Note */}
                <Card>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Select value={newNoteType} onValueChange={setNewNoteType}>
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {NOTE_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              <div className="flex items-center gap-1.5">
                                <t.icon className="h-3 w-3" />
                                {t.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                    <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim() || savingNote}>
                      <Plus className="h-3 w-3 mr-1" /> {savingNote ? "Saving..." : "Add Note"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Timeline entries */}
                {loadingNotes ? (
                  <div className="text-center text-sm text-muted-foreground py-4">Loading...</div>
                ) : (
                  <div className="space-y-3">
                    {/* Merge notes + emails into timeline */}
                    {(() => {
                      const timeline: { type: "note" | "email"; date: string; data: any }[] = [
                        ...notes.map((n) => ({ type: "note" as const, date: n.created_at, data: n })),
                        ...emails.map((e) => ({ type: "email" as const, date: e.created_at || "", data: e })),
                      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                      if (timeline.length === 0) return <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>;

                      return timeline.map((item) => (
                        <div key={`${item.type}-${item.data.id}`} className="flex gap-3 group">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.type === "note" ? "bg-primary/10 text-primary" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"}`}>
                              {item.type === "note" ? <StickyNote className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                            </div>
                            <div className="w-px flex-1 bg-border" />
                          </div>
                          <div className="pb-4 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-foreground capitalize">
                                {item.type === "note" ? item.data.note_type : "Email"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(item.date), "MMM d, yyyy h:mm a")}
                              </span>
                            </div>
                            {item.type === "note" ? (
                              <p className="text-sm text-foreground">{item.data.note_text}</p>
                            ) : (
                              <div className="text-sm">
                                <span className="font-medium text-foreground">{item.data.subject || "(no subject)"}</span>
                                {item.data.delivery_status && (
                                  <Badge variant="outline" className="ml-2 text-xs">{item.data.delivery_status}</Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Emails Tab */}
            <TabsContent value="emails" className="flex-1 overflow-auto px-5 pb-5 mt-0">
              <div className="space-y-3 pt-4">
                {loadingEmails ? (
                  <div className="text-center text-sm text-muted-foreground py-4">Loading...</div>
                ) : emails.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No emails sent</p>
                ) : (
                  emails.map((e) => (
                    <Card key={e.id}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-medium text-foreground">{e.subject || "(no subject)"}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              To: {e.to_email} · {e.created_at ? format(new Date(e.created_at), "MMM d, yyyy h:mm a") : ""}
                            </div>
                          </div>
                          <Badge variant={e.delivery_status === "bounced" ? "destructive" : "outline"} className="text-xs shrink-0">
                            {e.delivery_status || "sent"}
                          </Badge>
                        </div>
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                          {e.delivered_at && <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Delivered</span>}
                          {e.opened_at && <span className="flex items-center gap-1"><Eye className="h-3 w-3 text-blue-500" /> Opened {format(new Date(e.opened_at), "MMM d")}</span>}
                          {e.clicked_at && <span className="flex items-center gap-1"><ExternalLink className="h-3 w-3 text-purple-500" /> Clicked</span>}
                          {e.bounced_at && <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-destructive" /> Bounced</span>}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
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
          <Input
            value={(editData as any)[field] || ""}
            onChange={(e) => setEditData((d) => ({ ...d, [field]: e.target.value }))}
            className="h-8 text-sm"
          />
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
