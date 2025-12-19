import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { SmsCharCounter } from "@/components/ui/sms-char-counter";
import type { SavedMessage } from "@/types/library";
import { JourneyViewer, isJourneyContent, parseJourneyContent } from "./JourneyViewer";
import { openInGoogleDocs, formatForGoogleDocs } from "@/lib/googleDocsExport";
import { CheckCircle, Copy, Trash2, History, Map, ExternalLink, FileText, Pencil, X, Save } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

interface MessageDetailDialogProps {
  message: SavedMessage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
  onDelete: () => void;
}

export function MessageDetailDialog({ message, open, onOpenChange, onApprove, onDelete }: MessageDetailDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const isJourney = useMemo(() => isJourneyContent(message.content), [message.content]);
  const journeyData = useMemo(() => isJourney ? parseJourneyContent(message.content) : null, [message.content, isJourney]);

  const displayContent = isEditing ? editedContent : message.content;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayContent);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenInGoogleDocs = async () => {
    const formattedContent = formatForGoogleDocs(displayContent, {
      title: message.title,
      channel: message.channel,
      audience: message.audience,
      generatedAt: new Date(),
    });
    const success = await openInGoogleDocs(formattedContent, message.title);
    if (success) {
      toast({ 
        title: "Opening Google Docs", 
        description: "Content copied! Paste (Ctrl/Cmd+V) into the new document." 
      });
    }
  };

  const handleStartEdit = () => {
    setEditedContent(message.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    toast({ title: "Content updated", description: "Changes saved locally for this session." });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isJourney ? "max-w-5xl max-h-[90vh]" : "max-w-2xl max-h-[90vh]"}>
        <DialogHeader>
          <DialogTitle className="font-serif">{message.title}</DialogTitle>
          <DialogDescription>
            Created {new Date(message.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" className="mt-4">
          <TabsList>
            <TabsTrigger value="content">
              <FileText className="w-3 h-3 mr-1.5" />
              Content
            </TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center gap-1">
              <History className="w-4 h-4" />
              Versions ({message.versions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-4">
            <ScrollArea className={isJourney ? "h-[550px]" : "h-[350px]"}>
              {isJourney && journeyData ? (
                <div className="pr-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Map className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Strategy Journey</span>
                  </div>
                  <JourneyViewer journey={journeyData} />
                </div>
              ) : (
                <div className="pr-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Pencil className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-600">Editing Content</span>
                      </div>
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[250px] font-sans text-sm leading-relaxed resize-y"
                      />
                      {message.channel === 'sms' && (
                        <SmsCharCounter text={editedContent} className="mt-2" />
                      )}
                    </div>
                  ) : (
                    <div className="bg-card rounded-lg p-4 mb-4 border border-border shadow-sm">
                      <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{displayContent}</pre>
                      {message.channel === 'sms' && (
                        <SmsCharCounter text={displayContent} className="mt-3" />
                      )}
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
            <div className="flex flex-wrap gap-2 mt-4">
              {!isEditing ? (
                <Button onClick={handleStartEdit} variant="outline" className="flex items-center gap-2">
                  <Pencil className="w-4 h-4" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button onClick={handleSaveEdit} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                  <Button onClick={handleCancelEdit} variant="ghost" className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </>
              )}
              <Button onClick={handleCopy} variant="outline" className="flex items-center gap-2">
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button onClick={handleOpenInGoogleDocs} variant="outline" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Open in Google Docs
              </Button>
              {!message.approved && (
                <Button onClick={onApprove} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Mark Approved
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="metadata" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Channel</p>
                  <Badge variant="secondary">{message.channel}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Audience</p>
                  <Badge variant="secondary">{message.audience}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Moment</p>
                  <Badge variant="outline">{message.moment}</Badge>
                </div>
                {message.domain && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Domain</p>
                    <Badge variant="outline">{message.domain}</Badge>
                  </div>
                )}
                {message.goal && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Goal</p>
                    <Badge variant="outline">{message.goal}</Badge>
                  </div>
                )}
                {message.tone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Tone</p>
                    <Badge variant="outline">{message.tone}</Badge>
                  </div>
                )}
              </div>
              {message.senderRecommendation && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Sender Recommendation</p>
                  <p className="text-sm">{message.senderRecommendation}</p>
                </div>
              )}
              {message.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{message.notes}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="versions" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {message.versions.map((version, idx) => (
                  <div key={version.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Version {message.versions.length - idx}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(version.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {version.changeNotes && (
                      <p className="text-xs text-muted-foreground mb-2 italic">
                        {version.changeNotes}
                      </p>
                    )}
                    <pre className="whitespace-pre-wrap text-xs bg-muted rounded p-2 font-sans">
                      {version.content}
                    </pre>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <div className="flex justify-between">
          <Button variant="destructive" size="sm" onClick={onDelete} className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
