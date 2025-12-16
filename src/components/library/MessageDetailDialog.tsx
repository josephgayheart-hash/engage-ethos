import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SavedMessage } from "@/types/library";
import { CheckCircle, Copy, Trash2, History } from "lucide-react";
import { useState } from "react";
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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-serif">{message.title}</DialogTitle>
          <DialogDescription>
            Created {new Date(message.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" className="mt-4">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center gap-1">
              <History className="w-4 h-4" />
              Versions ({message.versions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-4">
            <div className="bg-muted rounded-lg p-4 mb-4">
              <pre className="whitespace-pre-wrap text-sm font-sans">{message.content}</pre>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" className="flex items-center gap-2">
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy"}
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
