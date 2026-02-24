import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Search, Send, Mail, Users, Tag, RefreshCw, BarChart3, Plus, X, UserPlus, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface Prospect {
  id: string;
  university_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_title: string | null;
  status: string | null;
}

interface ManualRecipient {
  id: string;
  name: string;
  email: string;
}

interface OutreachRecord {
  id: string;
  to_email: string | null;
  to_name: string | null;
  subject: string | null;
  delivery_status: string | null;
  created_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  delivered_at: string | null;
}

const FROM_EMAILS = [
  "noreply@campusvoice.ai",
  "sales@campusvoice.ai",
  "support@campusvoice.ai",
  "tyler@campusvoice.ai",
];

const STATUS_FILTERS = ["all", "new", "contacted", "qualified", "demo_scheduled", "closed"];

const MERGE_TAGS = [
  { tag: "{{first_name}}", label: "First Name" },
  { tag: "{{university_name}}", label: "University" },
  { tag: "{{contact_title}}", label: "Title" },
];

function replaceMergeTags(text: string, prospect: Prospect | ManualRecipient): string {
  const isProspect = "university_name" in prospect;
  const firstName = (isProspect ? (prospect as Prospect).contact_name : (prospect as ManualRecipient).name)?.split(" ")[0] || "there";
  const universityName = isProspect ? (prospect as Prospect).university_name : "";
  const contactTitle = isProspect ? ((prospect as Prospect).contact_title || "") : "";
  return text
    .replace(/\{\{first_name\}\}/g, firstName)
    .replace(/\{\{university_name\}\}/g, universityName)
    .replace(/\{\{contact_title\}\}/g, contactTitle);
}

function statusBadgeVariant(status: string | null): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "delivered": return "default";
    case "opened":
    case "clicked": return "secondary";
    case "bounced":
    case "complained": return "destructive";
    default: return "outline";
  }
}

export default function ProspectOutreachPage() {
  const { user } = useAuth();

  // Prospect selector state
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingProspects, setLoadingProspects] = useState(true);

  // Manual recipients
  const [manualRecipients, setManualRecipients] = useState<ManualRecipient[]>([]);
  const [newRecipientName, setNewRecipientName] = useState("");
  const [newRecipientEmail, setNewRecipientEmail] = useState("");

  // Composer state
  const [fromName, setFromName] = useState("Dan Simmons");
  const [fromEmail, setFromEmail] = useState(FROM_EMAILS[0]);
  const [replyTo, setReplyTo] = useState("tyler@campusvoice.ai");
  const [subject, setSubject] = useState("");
  const [composerTab, setComposerTab] = useState("richtext");
  const [richTextContent, setRichTextContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [plainTextContent, setPlainTextContent] = useState("");
   const [isSending, setIsSending] = useState(false);
   const [sendProgress, setSendProgress] = useState(0);
   const [sendTotal, setSendTotal] = useState(0);
   const [previewIndex, setPreviewIndex] = useState(0);
   const [showPreview, setShowPreview] = useState(false);

  // History state
  const [history, setHistory] = useState<OutreachRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load prospects
  useEffect(() => {
    async function load() {
      setLoadingProspects(true);
      const { data, error } = await supabase
        .from("sales_prospects")
        .select("id, university_name, contact_name, contact_email, contact_title, status")
        .order("university_name");
      if (error) {
        toast.error("Failed to load prospects");
      } else {
        setProspects(data || []);
      }
      setLoadingProspects(false);
    }
    load();
  }, []);

  // Load history — new columns aren't in generated types yet, so select only base columns + cast
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from("outreach_history")
      .select("id, subject, created_at, prospect_id, body, type")
      .eq("type", "email")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      // Re-fetch with raw query to get the new tracking columns
      const ids = data.map((d: any) => d.id);
      if (ids.length > 0) {
        const { data: fullData } = await supabase
          .from("outreach_history")
          .select("*")
          .in("id", ids)
          .order("created_at", { ascending: false });
        setHistory((fullData as any[] || []).map((row: any) => ({
          id: row.id,
          to_email: row.to_email || null,
          to_name: row.to_name || null,
          subject: row.subject || null,
          delivery_status: row.delivery_status || "sent",
          created_at: row.created_at || null,
          opened_at: row.opened_at || null,
          clicked_at: row.clicked_at || null,
          bounced_at: row.bounced_at || null,
          delivered_at: row.delivered_at || null,
        })));
      } else {
        setHistory([]);
      }
    }
    setLoadingHistory(false);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // Filtered prospects
  const filtered = prospects.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.university_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contact_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const filteredWithEmail = filtered.filter((p) => p.contact_email);
    setSelectedIds(new Set(filteredWithEmail.map((p) => p.id)));
  };

  const deselectAll = () => setSelectedIds(new Set());

  // Manual recipient management
  const addManualRecipient = () => {
    const email = newRecipientEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) { toast.error("Enter a valid email address"); return; }
    if (manualRecipients.some((r) => r.email === email)) { toast.error("Email already added"); return; }
    setManualRecipients((prev) => [...prev, { id: `manual-${Date.now()}`, name: newRecipientName.trim() || email.split("@")[0], email }]);
    setNewRecipientName("");
    setNewRecipientEmail("");
  };

  const removeManualRecipient = (id: string) => {
    setManualRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  // Total recipients count
  const totalRecipients = selectedIds.size + manualRecipients.length;

  // Get body based on active tab
  const getEmailContent = () => {
    if (composerTab === "richtext") return { body: "", html_body: richTextContent };
    if (composerTab === "html") return { body: "", html_body: htmlContent };
    return { body: plainTextContent, html_body: undefined };
  };

  const getPreviewHtml = (): string => {
    if (composerTab === "richtext") return richTextContent;
    if (composerTab === "html") return htmlContent;
    return `<p>${plainTextContent.replace(/\n/g, "<br/>")}</p>`;
  };

  // All recipients for preview cycling
  const allPreviewRecipients: (Prospect | ManualRecipient)[] = [
    ...prospects.filter((p) => selectedIds.has(p.id) && p.contact_email),
    ...manualRecipients,
  ];

  const currentPreviewRecipient = allPreviewRecipients[previewIndex] || null;
  const previewSubject = currentPreviewRecipient ? replaceMergeTags(subject, currentPreviewRecipient) : subject;
  const previewBody = currentPreviewRecipient ? replaceMergeTags(getPreviewHtml(), currentPreviewRecipient) : getPreviewHtml();

  // Send emails
  const handleSend = async () => {
    const selectedProspects = prospects.filter((p) => selectedIds.has(p.id) && p.contact_email);
    const allRecipients = [
      ...selectedProspects.map((p) => ({ type: "prospect" as const, data: p })),
      ...manualRecipients.map((r) => ({ type: "manual" as const, data: r })),
    ];

    if (allRecipients.length === 0) { toast.error("No recipients selected"); return; }
    if (!subject.trim()) { toast.error("Subject is required"); return; }
    const content = getEmailContent();
    if (!content.body && !content.html_body) { toast.error("Email body is required"); return; }

    setIsSending(true);
    setSendProgress(0);
    setSendTotal(allRecipients.length);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < allRecipients.length; i++) {
      const recipient = allRecipients[i];
      try {
        let toEmail: string;
        let toName: string;
        let prospectId: string;
        let mergeTarget: Prospect | ManualRecipient;

        if (recipient.type === "prospect") {
          const p = recipient.data as Prospect;
          toEmail = p.contact_email!;
          toName = p.contact_name || "";
          prospectId = p.id;
          mergeTarget = p;
        } else {
          const r = recipient.data as ManualRecipient;
          toEmail = r.email;
          toName = r.name;
          // For manual recipients, we create a temporary prospect ID placeholder
          prospectId = "";
          mergeTarget = r;
        }

        const mergedSubject = replaceMergeTags(subject, mergeTarget);
        const mergedBody = content.body ? replaceMergeTags(content.body, mergeTarget) : "";
        const mergedHtml = content.html_body ? replaceMergeTags(content.html_body, mergeTarget) : undefined;

        const payload: Record<string, any> = {
          to_email: toEmail,
          to_name: toName,
          subject: mergedSubject,
          body: mergedBody,
          html_body: mergedHtml,
          from_name: fromName,
          from_email: fromEmail,
          reply_to: replyTo || undefined,
        };

        // Only include prospect_id if it's a real prospect
        if (prospectId) payload.prospect_id = prospectId;

        const { data, error } = await supabase.functions.invoke("send-prospect-email", { body: payload });

        if (error || !data?.success) {
          failCount++;
          console.error(`Failed to send to ${toEmail}:`, error || data?.error);
        } else {
          successCount++;
        }
      } catch (err) {
        failCount++;
        console.error(`Error sending:`, err);
      }
      setSendProgress(i + 1);
    }

    setIsSending(false);
    setSendProgress(0);
    setSendTotal(0);
    if (successCount > 0) toast.success(`✅ Sent ${successCount} email${successCount > 1 ? "s" : ""} successfully`);
    if (failCount > 0) toast.error(`❌ ${failCount} email${failCount > 1 ? "s" : ""} failed to send`);
    loadHistory();
    setSelectedIds(new Set());
    setManualRecipients([]);
  };

  // Insert merge tag into active editor
  const insertMergeTag = (tag: string) => {
    if (composerTab === "plaintext") {
      setPlainTextContent((prev) => prev + tag);
    } else if (composerTab === "html") {
      setHtmlContent((prev) => prev + tag);
    } else {
      setRichTextContent((prev) => prev + tag);
    }
  };

  // History stats
  const totalSent = history.length;
  const delivered = history.filter((h) => ["delivered", "opened", "clicked"].includes(h.delivery_status || "")).length;
  const opened = history.filter((h) => ["opened", "clicked"].includes(h.delivery_status || "")).length;
  const clicked = history.filter((h) => h.delivery_status === "clicked").length;
  const bounced = history.filter((h) => h.delivery_status === "bounced").length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Mail className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prospect Outreach</h1>
          <p className="text-sm text-muted-foreground">Compose and send mass emails to sales prospects</p>
        </div>
      </div>

      {/* Send Progress */}
      {isSending && sendTotal > 0 && (
        <Card className="border-primary/30">
          <CardContent className="pt-4 pb-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Sending emails...</span>
              <span className="text-muted-foreground">{sendProgress} / {sendTotal}</span>
            </div>
            <Progress value={(sendProgress / sendTotal) * 100} className="h-2" />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Prospect Selector */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Prospects
              <Badge variant="secondary" className="ml-auto">{totalRecipients} selected</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Add Individual Recipient */}
            <div className="p-3 rounded-md border border-dashed border-border bg-muted/30 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <UserPlus className="h-3.5 w-3.5" />
                Add Individual Recipient
              </div>
              <Input
                placeholder="Name (optional)"
                value={newRecipientName}
                onChange={(e) => setNewRecipientName(e.target.value)}
                className="h-8 text-sm"
              />
              <div className="flex gap-2">
                <Input
                  placeholder="email@example.com"
                  value={newRecipientEmail}
                  onChange={(e) => setNewRecipientEmail(e.target.value)}
                  className="h-8 text-sm"
                  type="email"
                  onKeyDown={(e) => e.key === "Enter" && addManualRecipient()}
                />
                <Button variant="outline" size="sm" className="h-8 px-2 shrink-0" onClick={addManualRecipient}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              {manualRecipients.length > 0 && (
                <div className="space-y-1 pt-1">
                  {manualRecipients.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 text-xs bg-background rounded px-2 py-1.5">
                      <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="truncate font-medium">{r.name}</span>
                      <span className="truncate text-muted-foreground">{r.email}</span>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 ml-auto shrink-0" onClick={() => removeManualRecipient(r.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search & Filter */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or university..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll} className="flex-1">Select All</Button>
              <Button variant="outline" size="sm" onClick={deselectAll} className="flex-1">Deselect All</Button>
            </div>
            <div className="max-h-[350px] overflow-y-auto space-y-1 border rounded-md p-2">
              {loadingProspects ? (
                <p className="text-sm text-muted-foreground p-2">Loading...</p>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">No prospects found</p>
              ) : (
                filtered.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedIds.has(p.id)}
                      onCheckedChange={() => toggleSelect(p.id)}
                      disabled={!p.contact_email}
                      className="mt-0.5"
                    />
                    <div className="text-sm min-w-0">
                      <div className="font-medium truncate">{p.contact_name || "No contact"}</div>
                      <div className="text-muted-foreground truncate text-xs">{p.university_name}</div>
                      <div className="text-muted-foreground truncate text-xs">{p.contact_email || "No email"}</div>
                    </div>
                    {p.status && (
                      <Badge variant="outline" className="ml-auto text-[10px] shrink-0">
                        {p.status}
                      </Badge>
                    )}
                  </label>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Email Composer */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Compose Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">From Name</Label>
                <Input value={fromName} onChange={(e) => setFromName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">From Email</Label>
                <Select value={fromEmail} onValueChange={setFromEmail}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FROM_EMAILS.map((e) => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Reply-To</Label>
                <Input
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  placeholder="reply-to@example.com"
                  type="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Subject</Label>
                <span className="text-xs text-muted-foreground">{subject.length} chars</span>
              </div>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject line..."
              />
            </div>

            {/* Merge Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Insert:</span>
              {MERGE_TAGS.map((m) => (
                <Button key={m.tag} variant="outline" size="sm" className="h-6 text-xs px-2" onClick={() => insertMergeTag(m.tag)}>
                  {m.label}
                </Button>
              ))}
            </div>

            {/* Composition Tabs */}
            <Tabs value={composerTab} onValueChange={setComposerTab}>
              <TabsList>
                <TabsTrigger value="richtext">Rich Text</TabsTrigger>
                <TabsTrigger value="html">HTML Code</TabsTrigger>
                <TabsTrigger value="plaintext">Plain Text</TabsTrigger>
              </TabsList>
              <TabsContent value="richtext">
                <RichTextEditor
                  content={richTextContent}
                  onChange={setRichTextContent}
                  placeholder="Compose your email with rich formatting..."
                  className="min-h-[200px]"
                />
              </TabsContent>
              <TabsContent value="html">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">HTML Source</Label>
                    <Textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      placeholder="<html>...</html>"
                      className="min-h-[200px] font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Preview</Label>
                    <div className="border rounded-md bg-background min-h-[200px] overflow-hidden">
                      <iframe
                        srcDoc={htmlContent || "<p style='color:#999;padding:16px;'>Preview will appear here...</p>"}
                        className="w-full h-[200px] border-0"
                        sandbox="allow-same-origin"
                        title="HTML Preview"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="plaintext">
                <Textarea
                  value={plainTextContent}
                  onChange={(e) => setPlainTextContent(e.target.value)}
                  placeholder="Write your plain text email..."
                  className="min-h-[200px]"
                />
              </TabsContent>
            </Tabs>

            {/* Personalization Preview */}
            {allPreviewRecipients.length > 0 && (
              <div className="border rounded-md overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => setShowPreview((v) => !v)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {showPreview ? "Hide" : "Preview"} Personalization
                  </Button>
                  {showPreview && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={previewIndex <= 0}
                        onClick={() => setPreviewIndex((i) => Math.max(0, i - 1))}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-xs font-medium tabular-nums min-w-[60px] text-center">
                        {previewIndex + 1} / {allPreviewRecipients.length}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={previewIndex >= allPreviewRecipients.length - 1}
                        onClick={() => setPreviewIndex((i) => Math.min(allPreviewRecipients.length - 1, i + 1))}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
                {showPreview && currentPreviewRecipient && (
                  <div className="p-3 space-y-2 text-sm">
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">To:</span>
                      <span>
                        {"university_name" in currentPreviewRecipient
                          ? `${(currentPreviewRecipient as Prospect).contact_name || "—"} <${(currentPreviewRecipient as Prospect).contact_email}>`
                          : `${(currentPreviewRecipient as ManualRecipient).name} <${(currentPreviewRecipient as ManualRecipient).email}>`}
                      </span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="font-medium text-muted-foreground">Subject:</span>
                      <span>{previewSubject}</span>
                    </div>
                    <div className="border rounded bg-background p-3 max-h-[200px] overflow-auto">
                      <div dangerouslySetInnerHTML={{ __html: previewBody }} className="prose prose-sm max-w-none" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Send Button */}
            <div className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={totalRecipients === 0 || isSending} className="gap-2">
                    <Send className="h-4 w-4" />
                    {isSending ? "Sending..." : `Send to ${totalRecipients} recipient${totalRecipients !== 1 ? "s" : ""}`}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Send</AlertDialogTitle>
                    <AlertDialogDescription>
                      You are about to send an email to <strong>{totalRecipients}</strong> recipient{totalRecipients !== 1 ? "s" : ""}
                      {" "}from <strong>{fromName} &lt;{fromEmail}&gt;</strong>.
                      {manualRecipients.length > 0 && (
                        <span className="block mt-1 text-xs">Includes {manualRecipients.length} manually added email{manualRecipients.length > 1 ? "s" : ""}.</span>
                      )}
                      <span className="block mt-1">This cannot be undone.</span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSend}>Send Emails</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Send History */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Send History
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={loadHistory} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="text-center p-2 rounded-md bg-muted/50">
              <div className="text-lg font-bold text-foreground">{totalSent}</div>
              <div className="text-xs text-muted-foreground">Total Sent</div>
            </div>
            <div className="text-center p-2 rounded-md bg-muted/50">
              <div className="text-lg font-bold text-foreground">{totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 0}%</div>
              <div className="text-xs text-muted-foreground">Delivered</div>
            </div>
            <div className="text-center p-2 rounded-md bg-muted/50">
              <div className="text-lg font-bold text-foreground">{totalSent > 0 ? Math.round((opened / totalSent) * 100) : 0}%</div>
              <div className="text-xs text-muted-foreground">Opened</div>
            </div>
            <div className="text-center p-2 rounded-md bg-muted/50">
              <div className="text-lg font-bold text-foreground">{totalSent > 0 ? Math.round((clicked / totalSent) * 100) : 0}%</div>
              <div className="text-xs text-muted-foreground">Clicked</div>
            </div>
            <div className="text-center p-2 rounded-md bg-muted/50">
              <div className="text-lg font-bold text-foreground">{totalSent > 0 ? Math.round((bounced / totalSent) * 100) : 0}%</div>
              <div className="text-xs text-muted-foreground">Bounced</div>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingHistory ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell></TableRow>
                ) : history.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No emails sent yet</TableCell></TableRow>
                ) : (
                  history.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="text-sm">
                        <div className="font-medium">{h.to_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{h.to_email || "—"}</div>
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{h.subject || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {h.created_at ? format(new Date(h.created_at), "MMM d, h:mm a") : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(h.delivery_status)} className="text-xs capitalize">
                          {h.delivery_status || "sent"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
