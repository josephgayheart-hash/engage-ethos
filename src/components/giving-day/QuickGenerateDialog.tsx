import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Sparkles, Copy, Check, BookmarkPlus, RefreshCw,
  Mail, MessageSquare, Megaphone, Phone, Globe,
  Lock, ArrowRight
} from "lucide-react";
import type { CampaignTouchpoint } from "@/hooks/useAdvancementCampaigns";

interface QuickGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  touchpoint: CampaignTouchpoint | null;
  campaignName: string;
  phase: string;
  onStatusUpdate?: (touchpointId: string, status: string) => void;
}

const CHANNEL_META: Record<string, { label: string; icon: React.ElementType }> = {
  email: { label: "Email", icon: Mail },
  sms: { label: "SMS", icon: MessageSquare },
  "social-media": { label: "Social Media", icon: Megaphone },
  "phone-call": { label: "Phone Script", icon: Phone },
  "landing-page": { label: "Landing Page", icon: Globe },
};

const TONE_OPTIONS = [
  { value: "encouraging", label: "Encouraging" },
  { value: "urgent", label: "Urgent" },
  { value: "celebratory", label: "Celebratory" },
  { value: "grateful", label: "Grateful" },
  { value: "inspirational", label: "Inspirational" },
  { value: "conversational", label: "Conversational" },
  { value: "formal", label: "Formal" },
];

const proseClasses = [
  "[&_p]:my-2 [&_p]:leading-relaxed",
  "[&_ul]:my-2 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1",
  "[&_ol]:my-2 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1",
  "[&_strong]:font-semibold [&_strong]:text-foreground",
  "[&_h1]:text-base [&_h1]:font-semibold [&_h1]:mt-3 [&_h1]:mb-1.5",
  "[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-2.5 [&_h2]:mb-1",
  "[&_h3]:text-sm [&_h3]:font-medium [&_h3]:mt-2 [&_h3]:mb-1",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2 [&_blockquote]:text-muted-foreground",
].join(" ");

export function QuickGenerateDialog({
  open,
  onOpenChange,
  touchpoint,
  campaignName,
  phase,
  onStatusUpdate,
}: QuickGenerateDialogProps) {
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [tone, setTone] = useState(touchpoint?.tone || "encouraging");
  const [cta, setCta] = useState("");
  const [notes, setNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [copied, setCopied] = useState(false);

  // Reset state when touchpoint changes
  useEffect(() => {
    if (touchpoint) {
      setTone(touchpoint.tone || "encouraging");
      setCta("");
      setNotes("");
      setGeneratedContent("");
      setStreamingContent("");
    }
  }, [touchpoint?.id]);

  // Auto-scroll during streaming
  useEffect(() => {
    if (scrollRef.current && streamingContent) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamingContent]);

  const handleGenerate = async () => {
    if (!touchpoint) return;
    setIsGenerating(true);
    setGeneratedContent("");
    setStreamingContent("");

    const channelLabel = CHANNEL_META[touchpoint.channel]?.label || touchpoint.channel;
    const contextStr = [
      `${campaignName} – ${phase} phase`,
      `Message type: ${touchpoint.messageType}`,
      `Channel: ${channelLabel}`,
      `Segment: ${touchpoint.segment}`,
      cta ? `Call-to-action: ${cta}` : null,
      notes ? `Additional context: ${notes}` : null,
    ].filter(Boolean).join(". ");

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            type: "single",
            context: {
              audience: touchpoint.segment === "alumni" ? "alumni" : "donors",
              channel: touchpoint.channel,
              moment: "giving-day",
              tone,
              context: contextStr,
            },
          }),
        }
      );

      if (!resp.ok) {
        if (resp.status === 429) throw new Error("Rate limit exceeded. Try again in a moment.");
        if (resp.status === 402) throw new Error("AI credits exhausted. Please add credits.");
        throw new Error("Generation failed");
      }
      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";
      let done = false;

      while (!done) {
        const { done: readerDone, value } = await reader.read();
        if (readerDone) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              full += content;
              setStreamingContent(full);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      setGeneratedContent(full);
      setStreamingContent("");
    } catch (err) {
      console.error("Quick generate error:", err);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const handleMarkDrafted = () => {
    if (touchpoint && onStatusUpdate) {
      onStatusUpdate(touchpoint.id, "drafted");
      toast({ title: "Touchpoint marked as drafted" });
    }
  };

  if (!touchpoint) return null;
  const ChannelIcon = CHANNEL_META[touchpoint.channel]?.icon || Mail;
  const hasResult = generatedContent.length > 0;
  const displayContent = streamingContent || generatedContent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-primary" />
            Quick Generate
          </DialogTitle>
          {/* Locked context chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <Badge variant="secondary" className="gap-1 text-[11px]">
              <Lock className="w-2.5 h-2.5" /> {campaignName}
            </Badge>
            <Badge variant="secondary" className="gap-1 text-[11px]">
              <Lock className="w-2.5 h-2.5" /> {phase}
            </Badge>
            <Badge variant="secondary" className="gap-1 text-[11px]">
              <ChannelIcon className="w-2.5 h-2.5" /> {CHANNEL_META[touchpoint.channel]?.label || touchpoint.channel}
            </Badge>
            <Badge variant="secondary" className="gap-1 text-[11px]">
              <Lock className="w-2.5 h-2.5" /> {touchpoint.segment}
            </Badge>
            <Badge variant="secondary" className="gap-1 text-[11px]">
              <Lock className="w-2.5 h-2.5" /> {touchpoint.messageType}
            </Badge>
          </div>
        </DialogHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Input fields — only show before generation or when regenerating */}
          {!hasResult && !isGenerating && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONE_OPTIONS.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Call-to-Action</Label>
                  <Input
                    placeholder="e.g., Donate now, Share your story"
                    value={cta}
                    onChange={e => setCta(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Anything specific?</Label>
                <Textarea
                  placeholder="e.g., Mention the new science building, reference last year's record..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="min-h-[60px] resize-none"
                  rows={2}
                />
              </div>
              <Button onClick={handleGenerate} className="w-full gap-2">
                <Sparkles className="w-4 h-4" /> Generate {CHANNEL_META[touchpoint.channel]?.label || "Content"}
              </Button>
            </div>
          )}

          {/* Loading state */}
          {isGenerating && !streamingContent && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground">
                Writing your {phase.toLowerCase()} {CHANNEL_META[touchpoint.channel]?.label?.toLowerCase() || "message"}...
              </p>
            </div>
          )}

          {/* Streaming / Generated content */}
          {displayContent && (
            <div className="space-y-3">
              <div className={cn(
                "text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none",
                "bg-muted/30 rounded-xl p-4 border",
                proseClasses,
              )}>
                <ReactMarkdown>{displayContent}</ReactMarkdown>
                {isGenerating && (
                  <span className="inline-block w-1.5 h-4 bg-primary/60 rounded-sm animate-pulse ml-0.5 align-middle" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom actions — show when result is ready */}
        {hasResult && !isGenerating && (
          <div className="border-t px-6 py-3 flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setGeneratedContent("");
                setStreamingContent("");
              }}
              className="gap-1.5 text-muted-foreground"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button size="sm" onClick={handleMarkDrafted} className="gap-1.5">
                <BookmarkPlus className="w-3.5 h-3.5" /> Mark as Drafted
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
