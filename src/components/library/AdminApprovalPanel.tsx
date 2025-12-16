import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { SharedTemplate, LibraryEntryStatus } from "@/types/library";
import { JourneyViewer, isJourneyContent, parseJourneyContent } from "./JourneyViewer";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  FileText,
  Eye,
  Send,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

interface AdminApprovalPanelProps {
  templates: SharedTemplate[];
  onUpdateStatus: (id: string, status: LibraryEntryStatus, notes?: string) => void;
}

export function AdminApprovalPanel({ templates, onUpdateStatus }: AdminApprovalPanelProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<SharedTemplate | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'review' | null>(null);

  const pendingTemplates = templates.filter(t => t.status === 'submitted');
  const reviewingTemplates = templates.filter(t => t.status === 'draft' && t.approvalNotes);

  const handleAction = (template: SharedTemplate, action: 'approve' | 'reject' | 'review') => {
    setSelectedTemplate(template);
    setActionType(action);
    setApprovalNotes("");
  };

  const confirmAction = () => {
    if (!selectedTemplate || !actionType) return;

    let newStatus: LibraryEntryStatus;
    let toastTitle: string;
    let toastDesc: string;

    switch (actionType) {
      case 'approve':
        newStatus = 'approved';
        toastTitle = "Template Approved";
        toastDesc = "The template has been approved and is ready for publishing.";
        break;
      case 'review':
        newStatus = 'draft';
        toastTitle = "Under Review";
        toastDesc = "The template is marked for further review with notes.";
        break;
      case 'reject':
      default:
        newStatus = 'draft';
        toastTitle = "Template Returned";
        toastDesc = "The template has been returned with feedback.";
        break;
    }

    onUpdateStatus(selectedTemplate.id, newStatus, approvalNotes);
    
    toast({ title: toastTitle, description: toastDesc });

    setSelectedTemplate(null);
    setActionType(null);
    setApprovalNotes("");
  };

  const handlePublish = (template: SharedTemplate) => {
    onUpdateStatus(template.id, 'published');
    toast({
      title: "Template Published",
      description: "The template is now available in the shared library.",
    });
  };

  // Check if content is a journey
  const renderContent = (content: string) => {
    if (isJourneyContent(content)) {
      const journey = parseJourneyContent(content);
      if (journey) {
        return <JourneyViewer journey={journey} />;
      }
    }
    return (
      <div className="bg-muted rounded-lg p-4">
        <pre className="whitespace-pre-wrap text-sm font-sans">{content}</pre>
      </div>
    );
  };

  if (pendingTemplates.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Pending Approvals</h3>
          <p className="text-sm text-muted-foreground">
            All submitted templates have been reviewed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Pending Approvals</h3>
          <Badge variant="secondary">{pendingTemplates.length}</Badge>
        </div>
      </div>

      <div className="space-y-3">
        {pendingTemplates.map((template) => (
          <Card key={template.id} className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{template.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {template.intentStatement}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Send className="w-3 h-3" />
                  Submitted
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preview Content */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Content Preview</Label>
                <ScrollArea className="h-[200px] border rounded-lg">
                  <div className="p-3">
                    {renderContent(template.content)}
                  </div>
                </ScrollArea>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Submitted by: {template.owner}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(template.updatedAt).toLocaleDateString()}
                </div>
                {template.playbook && (
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Playbook: {template.playbook}
                  </div>
                )}
              </div>

              {/* Required Fields */}
              <div className="flex flex-wrap gap-2">
                {template.requiredFields.audience.map(a => (
                  <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                ))}
                {template.requiredFields.channel.map(c => (
                  <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                ))}
              </div>

              {/* Ethical Guardrails */}
              {template.ethicalGuardrails.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-xs font-medium flex items-center gap-1 mb-2">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    Ethical Guardrails
                  </p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {template.ethicalGuardrails.slice(0, 3).map((g, i) => (
                      <li key={i}>• {g}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => handleAction(template, 'approve')}
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleAction(template, 'review')}
                  className="flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Mark for Review
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAction(template, 'reject')}
                  className="flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  Return
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approved templates ready to publish */}
      {templates.filter(t => t.status === 'approved').length > 0 && (
        <>
          <Separator className="my-6" />
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold">Ready to Publish</h3>
              <Badge variant="outline">{templates.filter(t => t.status === 'approved').length}</Badge>
            </div>

            {templates.filter(t => t.status === 'approved').map((template) => (
              <Card key={template.id} className="border-l-4 border-l-emerald-500">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{template.title}</p>
                      <p className="text-sm text-muted-foreground">{template.intentStatement}</p>
                    </div>
                    <Button onClick={() => handlePublish(template)} size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Publish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedTemplate && !!actionType} onOpenChange={() => {
        setSelectedTemplate(null);
        setActionType(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Template' : 
               actionType === 'review' ? 'Mark for Review' : 'Return Template'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'This template will be approved and ready for publishing.'
                : actionType === 'review'
                ? 'Mark this template for further review before final decision.'
                : 'Return this template to the submitter with feedback.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{selectedTemplate?.title}</p>
              <p className="text-sm text-muted-foreground">{selectedTemplate?.intentStatement}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                {actionType === 'approve' ? 'Approval Notes (optional)' : 
                 actionType === 'review' ? 'Review Notes' : 'Feedback for Submitter'}
              </Label>
              <Textarea
                id="notes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder={actionType === 'approve' 
                  ? 'Any notes about this approval...'
                  : actionType === 'review'
                  ? 'What needs to be reviewed or clarified...'
                  : 'Explain what changes are needed...'}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedTemplate(null);
              setActionType(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAction}
              variant={actionType === 'approve' ? 'default' : 'secondary'}
            >
              {actionType === 'approve' ? 'Approve' : 
               actionType === 'review' ? 'Mark for Review' : 'Return with Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
