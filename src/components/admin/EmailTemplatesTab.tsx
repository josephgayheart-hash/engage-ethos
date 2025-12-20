import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Mail,
  Edit,
  Eye,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  Save,
  Zap,
  Plus,
  Settings,
} from "lucide-react";
import { format } from "date-fns";

interface EmailTemplate {
  id: string;
  template_key: string;
  name: string;
  subject: string;
  html_content: string;
  description: string | null;
  is_active: boolean;
  trigger_type: string;
  trigger_config: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  last_sent_at: string | null;
  send_count: number;
}

interface Tenant {
  id: string;
  institution_name: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  tenant_id: string;
  institution_name?: string;
}

interface EmailTemplatesTabProps {
  tenants?: Tenant[];
  users?: User[];
  onEmailSent?: () => void;
}

export function EmailTemplatesTab({ tenants = [], users = [], onEmailSent }: EmailTemplatesTabProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isSendingQuick, setIsSendingQuick] = useState(false);
  const [quickSendTemplate, setQuickSendTemplate] = useState<EmailTemplate | null>(null);
  const [quickSendUserId, setQuickSendUserId] = useState<string>("");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editHtmlContent, setEditHtmlContent] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editTemplateKey, setEditTemplateKey] = useState("");

  // Config form state
  const [configTriggerType, setConfigTriggerType] = useState<"manual" | "auto">("manual");
  const [configDelayHours, setConfigDelayHours] = useState<number>(24);
  const [configDelayDays, setConfigDelayDays] = useState<number>(0);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("name");

      if (error) throw error;
      setTemplates((data || []).map(t => ({
        ...t,
        trigger_config: t.trigger_config as Record<string, any> | null
      })));
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to load email templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditName(template.name);
    setEditSubject(template.subject);
    setEditHtmlContent(template.html_content);
    setEditDescription(template.description || "");
    setEditIsActive(template.is_active);
    setEditTemplateKey(template.template_key);
    setIsEditing(true);
  };

  const openPreviewDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewing(true);
  };

  const openConfigDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setConfigTriggerType(template.trigger_type as "manual" | "auto");
    const config = template.trigger_config || {};
    setConfigDelayHours(config.delay_hours || 24);
    setConfigDelayDays(config.delay_days || 0);
    setIsConfiguring(true);
  };

  const openCreateDialog = () => {
    setEditName("");
    setEditSubject("");
    setEditHtmlContent(getDefaultHtmlTemplate());
    setEditDescription("");
    setEditIsActive(true);
    setEditTemplateKey("");
    setIsCreating(true);
  };

  const openQuickSendDialog = (template: EmailTemplate) => {
    setQuickSendTemplate(template);
    setQuickSendUserId("");
    setIsSendingQuick(true);
  };

  const getDefaultHtmlTemplate = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://uplaybook.ai/uplaybook-logo.png" alt="UPlaybook.AI" style="height: 50px;">
  </div>
  
  <h1 style="color: #1F2A44; font-size: 24px; margin-bottom: 20px;">Hello {{first_name}},</h1>
  
  <p style="margin-bottom: 16px;">
    Your email content goes here. Use placeholders like {{first_name}}, {{last_name}}, {{institution}}, etc.
  </p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{app_url}}" style="background-color: #2C7A7B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
      Visit UPlaybook.AI
    </a>
  </div>
  
  <p style="margin-top: 30px; color: #666; font-size: 14px;">
    Best regards,<br>
    The UPlaybook.AI Team
  </p>
  
  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
  
  <p style="color: #999; font-size: 12px; text-align: center;">
    © 2024 UPlaybook.AI. All rights reserved.
  </p>
</body>
</html>`;
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("email_templates")
        .update({
          name: editName,
          subject: editSubject,
          html_content: editHtmlContent,
          description: editDescription,
          is_active: editIsActive,
        })
        .eq("id", selectedTemplate.id);

      if (error) throw error;

      toast({
        title: "Template Updated",
        description: `"${editName}" has been saved`,
      });

      setIsEditing(false);
      fetchTemplates();
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!editName || !editSubject || !editTemplateKey) {
      toast({
        title: "Missing Fields",
        description: "Please fill in template name, key, and subject",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("email_templates")
        .insert({
          name: editName,
          template_key: editTemplateKey.toLowerCase().replace(/\s+/g, "_"),
          subject: editSubject,
          html_content: editHtmlContent,
          description: editDescription,
          is_active: editIsActive,
          trigger_type: "manual",
        });

      if (error) throw error;

      toast({
        title: "Template Created",
        description: `"${editName}" has been created`,
      });

      setIsCreating(false);
      fetchTemplates();
    } catch (error: any) {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedTemplate) return;

    setIsSaving(true);
    try {
      const triggerConfig = configTriggerType === "auto" ? {
        delay_hours: configDelayHours,
        delay_days: configDelayDays,
        total_delay_hours: configDelayDays * 24 + configDelayHours,
      } : null;

      const { error } = await supabase
        .from("email_templates")
        .update({
          trigger_type: configTriggerType,
          trigger_config: triggerConfig,
        })
        .eq("id", selectedTemplate.id);

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: `Trigger settings for "${selectedTemplate.name}" have been saved`,
      });

      setIsConfiguring(false);
      fetchTemplates();
    } catch (error: any) {
      console.error("Error saving config:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickSend = async () => {
    if (!quickSendTemplate || !quickSendUserId) {
      toast({
        title: "Select User",
        description: "Please select a user to send the email to",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const userData = users.find(u => u.id === quickSendUserId);
      if (!userData) throw new Error("User not found");

      // Determine which edge function to call based on template key
      let functionName = "send-engagement-emails";
      let body: any = {
        singleUser: {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          institutionName: userData.institution_name,
        },
        templateKey: quickSendTemplate.template_key,
      };

      // Special handling for known templates
      if (quickSendTemplate.template_key === "beta_thank_you") {
        functionName = "send-beta-feedback-email";
        body = {
          userId: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          institutionName: userData.institution_name,
        };
      } else if (quickSendTemplate.template_key === "where_have_you_been" || quickSendTemplate.template_key === "reengagement") {
        functionName = "send-reengagement-email";
        body = {
          userId: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          institutionName: userData.institution_name,
        };
      } else if (quickSendTemplate.template_key === "resend_invite") {
        functionName = "resend-invite";
        body = { userId: userData.id };
      }

      const { error } = await supabase.functions.invoke(functionName, { body });

      if (error) throw error;

      // Log to email_nudges for activity tracking
      const { error: nudgeError } = await supabase.from("email_nudges").insert({
        tenant_id: userData.tenant_id,
        user_id: userData.id,
        nudge_type: `quick_send_${quickSendTemplate.template_key}`,
        email_count: 1,
        recipient_email: userData.email,
        recipient_name: `${userData.first_name} ${userData.last_name}`,
        subject: quickSendTemplate.subject,
        email_type: quickSendTemplate.template_key,
        status: "sent",
        metadata: { 
          manual: true, 
          template_id: quickSendTemplate.id,
          template_name: quickSendTemplate.name,
          sent_from: "templates_quick_send"
        },
      });

      if (nudgeError) {
        console.error("Failed to log email nudge:", nudgeError);
      }

      // Update template send count
      await supabase
        .from("email_templates")
        .update({
          send_count: (quickSendTemplate.send_count || 0) + 1,
          last_sent_at: new Date().toISOString(),
        })
        .eq("id", quickSendTemplate.id);

      toast({
        title: "Email Sent",
        description: `"${quickSendTemplate.name}" sent to ${userData.email}`,
      });

      setIsSendingQuick(false);
      fetchTemplates();
      onEmailSent?.();
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTemplateActive = async (template: EmailTemplate) => {
    try {
      const { error } = await supabase
        .from("email_templates")
        .update({ is_active: !template.is_active })
        .eq("id", template.id);

      if (error) throw error;

      toast({
        title: template.is_active ? "Template Disabled" : "Template Enabled",
        description: `"${template.name}" is now ${template.is_active ? "inactive" : "active"}`,
      });

      fetchTemplates();
    } catch (error: any) {
      console.error("Error toggling template:", error);
      toast({
        title: "Error",
        description: "Failed to update template status",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return format(new Date(date), "MMM d, yyyy h:mm a");
  };

  const formatTriggerTiming = (template: EmailTemplate) => {
    if (template.trigger_type !== "auto" || !template.trigger_config) return null;
    const config = template.trigger_config;
    const totalHours = config.total_delay_hours || config.delay_hours || 0;
    if (totalHours >= 24) {
      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
    return `${totalHours}h`;
  };

  const renderPreviewHtml = (html: string) => {
    return html
      .replace(/\{\{first_name\}\}/g, "John")
      .replace(/\{\{last_name\}\}/g, "Doe")
      .replace(/\{\{email\}\}/g, "john.doe@university.edu")
      .replace(/\{\{institution\}\}/g, "Sample University")
      .replace(/\{\{role\}\}/g, "user")
      .replace(/\{\{password\}\}/g, "TempPass123")
      .replace(/\{\{app_url\}\}/g, "https://uplaybook.ai")
      .replace(/\{\{inactive_message\}\}/g, "It's been 30 days since your last visit.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Email Templates
              </CardTitle>
              <CardDescription>
                {templates.length} templates configured
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sends</TableHead>
                  <TableHead>Last Sent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.template_key}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-sm truncate" title={template.subject}>
                        {template.subject}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge 
                          variant={template.trigger_type === "auto" ? "default" : "secondary"}
                          className="cursor-pointer w-fit"
                          onClick={() => openConfigDialog(template)}
                        >
                          {template.trigger_type === "auto" ? (
                            <><Zap className="w-3 h-3 mr-1" />Auto</>
                          ) : (
                            <><Send className="w-3 h-3 mr-1" />Manual</>
                          )}
                        </Badge>
                        {formatTriggerTiming(template) && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTriggerTiming(template)} delay
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={template.is_active}
                          onCheckedChange={() => toggleTemplateActive(template)}
                        />
                        <span className={`text-xs ${template.is_active ? "text-green-600" : "text-muted-foreground"}`}>
                          {template.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.send_count || 0}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(template.last_sent_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openQuickSendDialog(template)}
                          title="Quick Send"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openConfigDialog(template)}
                          title="Trigger Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPreviewDialog(template)}
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(template)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Send Dialog */}
      <Dialog open={isSendingQuick} onOpenChange={setIsSendingQuick}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Quick Send: {quickSendTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Send this email to a specific user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={quickSendUserId} onValueChange={setQuickSendUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendingQuick(false)}>
              Cancel
            </Button>
            <Button onClick={handleQuickSend} disabled={isSaving || !quickSendUserId}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trigger Config Dialog */}
      <Dialog open={isConfiguring} onOpenChange={setIsConfiguring}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Trigger Settings: {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Configure when this email should be sent
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Trigger Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={configTriggerType === "manual" ? "default" : "outline"}
                  className="justify-start h-auto py-3"
                  onClick={() => setConfigTriggerType("manual")}
                >
                  <Send className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Manual</div>
                    <div className="text-xs opacity-70">Send on demand</div>
                  </div>
                </Button>
                <Button
                  variant={configTriggerType === "auto" ? "default" : "outline"}
                  className="justify-start h-auto py-3"
                  onClick={() => setConfigTriggerType("auto")}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Automatic</div>
                    <div className="text-xs opacity-70">Scheduled trigger</div>
                  </div>
                </Button>
              </div>
            </div>

            {configTriggerType === "auto" && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <Label className="text-muted-foreground">Delay After Trigger Event</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Days</Label>
                    <Input
                      type="number"
                      min={0}
                      value={configDelayDays}
                      onChange={(e) => setConfigDelayDays(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hours</Label>
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      value={configDelayHours}
                      onChange={(e) => setConfigDelayHours(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Email will be sent {configDelayDays > 0 && `${configDelayDays} day${configDelayDays > 1 ? 's' : ''}`}
                  {configDelayDays > 0 && configDelayHours > 0 && ' and '}
                  {configDelayHours > 0 && `${configDelayHours} hour${configDelayHours > 1 ? 's' : ''}`}
                  {configDelayDays === 0 && configDelayHours === 0 && 'immediately'} after the trigger event.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfiguring(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfig} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewing} onOpenChange={setIsPreviewing}>
        <DialogContent className="max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview: {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Subject: {selectedTemplate?.subject}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="border rounded-lg overflow-hidden bg-white">
              {selectedTemplate && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderPreviewHtml(selectedTemplate.html_content),
                  }}
                />
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewing(false)}>
              Close
            </Button>
            <Button onClick={() => { setIsPreviewing(false); if (selectedTemplate) openEditDialog(selectedTemplate); }}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-[900px] max-h-[95vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Template
            </DialogTitle>
            <DialogDescription>
              Create a new email template
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh]">
            <div className="grid md:grid-cols-2 gap-6 py-4 pr-4">
              {/* Left: Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Template Name *</Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g., Welcome Email"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Template Key *</Label>
                  <Input
                    value={editTemplateKey}
                    onChange={(e) => setEditTemplateKey(e.target.value)}
                    placeholder="e.g., welcome_email"
                  />
                  <p className="text-xs text-muted-foreground">
                    Unique identifier (lowercase, no spaces)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Subject Line *</Label>
                  <Input
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    placeholder="e.g., Welcome to UPlaybook.AI!"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {"{{first_name}}"}, {"{{institution}}"} for personalization
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Brief description of when this email is used"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={editIsActive}
                    onCheckedChange={setEditIsActive}
                  />
                  <Label>Template is active</Label>
                </div>

                <div className="space-y-2">
                  <Label>HTML Content</Label>
                  <Textarea
                    value={editHtmlContent}
                    onChange={(e) => setEditHtmlContent(e.target.value)}
                    rows={20}
                    className="font-mono text-xs"
                    placeholder="<div>Your HTML email content...</div>"
                  />
                  <p className="text-xs text-muted-foreground">
                    Variables: {"{{first_name}}"}, {"{{last_name}}"}, {"{{email}}"}, {"{{institution}}"}, {"{{app_url}}"}, {"{{role}}"}, {"{{password}}"}
                  </p>
                </div>
              </div>

              {/* Right: Live Preview */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Live Preview</Label>
                <div className="border rounded-lg overflow-hidden bg-white h-[500px] overflow-y-auto">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: renderPreviewHtml(editHtmlContent),
                    }}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-[900px] max-h-[95vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Template
            </DialogTitle>
            <DialogDescription>
              Modify the email template content and settings
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh]">
            <div className="grid md:grid-cols-2 gap-6 py-4 pr-4">
              {/* Left: Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subject Line</Label>
                  <Input
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {"{{first_name}}"}, {"{{institution}}"} for personalization
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Brief description of when this email is used"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={editIsActive}
                    onCheckedChange={setEditIsActive}
                  />
                  <Label>Template is active</Label>
                </div>

                <div className="space-y-2">
                  <Label>HTML Content</Label>
                  <Textarea
                    value={editHtmlContent}
                    onChange={(e) => setEditHtmlContent(e.target.value)}
                    rows={20}
                    className="font-mono text-xs"
                    placeholder="<div>Your HTML email content...</div>"
                  />
                  <p className="text-xs text-muted-foreground">
                    Variables: {"{{first_name}}"}, {"{{last_name}}"}, {"{{email}}"}, {"{{institution}}"}, {"{{app_url}}"}, {"{{role}}"}, {"{{password}}"}
                  </p>
                </div>
              </div>

              {/* Right: Live Preview */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Live Preview</Label>
                <div className="border rounded-lg overflow-hidden bg-white h-[500px] overflow-y-auto">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: renderPreviewHtml(editHtmlContent),
                    }}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
