import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TONES = ["Warm & Welcoming", "Bold & Energizing", "Professional & Polished", "Conversational & Friendly", "Inspiring & Aspirational"];

interface Props {
  onInsert: (caption: string) => void;
  platforms: string[];
  institutionName?: string;
}

export function SocialCaptionGenerator({ onInsert, platforms, institutionName }: Props) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Conversational & Friendly");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) { toast.error("Enter a topic first"); return; }
    setLoading(true);
    try {
      const platformLabel = platforms.length ? platforms.join(", ") : "social media";
      const { data, error } = await supabase.functions.invoke("generate-message", {
        body: {
          type: "single",
          context: {
            audience: "General audience",
            tone,
            channel: "Social Media",
            topic: topic.trim(),
            additionalContext: `Write a single social media caption for ${platformLabel}. Keep it concise (under 280 characters for Twitter, up to 2200 for other platforms). Include 2-3 relevant hashtags. ${institutionName ? `Institution: ${institutionName}` : ""}`,
          },
        },
      });
      if (error) throw error;
      const text = data?.message || data?.messages?.[0]?.content || "";
      if (text) {
        onInsert(text);
        toast.success("Caption generated!");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate caption");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
      <Label className="text-xs font-medium flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-primary" /> AI Caption Generator
      </Label>
      <Input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="What's this post about? e.g. Spring open house event"
        className="text-xs h-8"
      />
      <div className="flex items-center gap-2">
        <Select value={tone} onValueChange={setTone}>
          <SelectTrigger className="text-xs h-8 flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TONES.map((t) => (
              <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={generate} disabled={loading} className="h-8 text-xs">
          {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
          Generate
        </Button>
      </div>
    </div>
  );
}
