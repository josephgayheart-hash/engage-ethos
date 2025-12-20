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
  Zap
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

export function EmailTemplatesTab() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editHtmlContent, setEditHtmlContent] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

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
    setIsEditing(true);
  };

  const openPreviewDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewing(true);
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

  const renderPreviewHtml = (html: string) => {
    // Replace template variables with sample data for preview
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
                      <Badge variant={template.trigger_type === "auto" ? "default" : "secondary"}>
                        {template.trigger_type === "auto" ? (
                          <><Zap className="w-3 h-3 mr-1" />Auto</>
                        ) : (
                          <><Send className="w-3 h-3 mr-1" />Manual</>
                        )}
                      </Badge>
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
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPreviewDialog(template)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(template)}
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
