import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Send, Save } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Sparkles } from "lucide-react";
import { SocialCaptionGenerator } from "./SocialCaptionGenerator";
import { SocialImagePicker } from "./SocialImagePicker";
import type { SocialPost } from "@/hooks/useSocialPosts";

const PLATFORMS = [
  { id: "twitter", label: "X / Twitter" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
];

const CADENCES = [
  { value: "", label: "None (one-time)" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
];

interface Props {
  post?: SocialPost | null;
  onSave: (data: Partial<SocialPost>) => void;
  onPublish: (id: string) => void;
  isSaving: boolean;
  isPublishing: boolean;
  brandColors?: string[];
  logoUrl?: string;
  logoUrls?: string[];
  institutionName?: string;
}

export function PostComposerCard({ post, onSave, onPublish, isSaving, isPublishing, brandColors, logoUrl, logoUrls, institutionName }: Props) {
  const [caption, setCaption] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState("10:00");
  const [cadence, setCadence] = useState("");
  const [showAiCaption, setShowAiCaption] = useState(false);

  useEffect(() => {
    if (post) {
      setCaption(post.caption ?? "");
      setCtaText(post.cta_text ?? "");
      setCtaUrl(post.cta_url ?? "");
      setImageUrl(post.image_url ?? "");
      setPlatforms(post.platform ?? []);
      setCadence(post.cadence ?? "");
      if (post.scheduled_at) {
        const d = new Date(post.scheduled_at);
        setScheduledDate(d);
        setScheduledTime(format(d, "HH:mm"));
      } else {
        setScheduledDate(undefined);
        setScheduledTime("10:00");
      }
    } else {
      setCaption(""); setCtaText(""); setCtaUrl(""); setImageUrl("");
      setPlatforms([]); setScheduledDate(undefined); setScheduledTime("10:00"); setCadence("");
    }
  }, [post]);

  const togglePlatform = (id: string) => {
    setPlatforms((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  const buildScheduledAt = (): string | null => {
    if (!scheduledDate) return null;
    const [h, m] = scheduledTime.split(":").map(Number);
    const d = new Date(scheduledDate);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };

  const handleSave = (status: string = "draft") => {
    onSave({
      ...(post?.id ? { id: post.id } : {}),
      caption,
      cta_text: ctaText || null,
      cta_url: ctaUrl || null,
      image_url: imageUrl || null,
      platform: platforms,
      scheduled_at: buildScheduledAt(),
      cadence: cadence || null,
      status,
    });
  };

  const charLimit = platforms.includes("twitter") ? 280 : 2200;
  const isOverLimit = caption.length > charLimit;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          {post ? "Edit Post" : "New Post"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Platforms */}
        <div className="space-y-1.5">
          <Label className="text-xs">Platforms</Label>
          <div className="flex flex-wrap gap-1.5">
            {PLATFORMS.map((p) => (
              <Badge
                key={p.id}
                variant={platforms.includes(p.id) ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => togglePlatform(p.id)}
              >
                {p.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Image Picker with AI Generate + Brand Overlay */}
        <SocialImagePicker
          imageUrl={imageUrl}
          onImageChange={setImageUrl}
          brandColors={brandColors}
          logoUrl={logoUrl}
          logoUrls={logoUrls}
          institutionName={institutionName}
        />

        {/* Caption with AI toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Caption</Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] gap-1 text-primary"
              onClick={() => setShowAiCaption(!showAiCaption)}
            >
              <Sparkles className="h-3 w-3" />
              {showAiCaption ? "Hide AI" : "AI Draft"}
            </Button>
          </div>

          {showAiCaption && (
            <SocialCaptionGenerator
              onInsert={setCaption}
              platforms={platforms}
              institutionName={institutionName}
            />
          )}

          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write your post..."
            className="text-xs min-h-[100px]"
          />
          <p className={`text-[10px] text-right ${isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"}`}>
            {caption.length}/{charLimit} chars
          </p>
        </div>

        {/* CTA */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">CTA Text</Label>
            <Input
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="Learn More"
              className="text-xs h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">CTA URL</Label>
            <Input
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="https://..."
              className="text-xs h-8"
            />
          </div>
        </div>

        {/* Schedule */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Schedule Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-xs h-8 font-normal">
                  <CalendarIcon className="mr-1.5 h-3 w-3" />
                  {scheduledDate ? format(scheduledDate, "MMM d, yyyy") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={scheduledDate} onSelect={setScheduledDate} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Time</Label>
            <Input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="text-xs h-8"
            />
          </div>
        </div>

        {/* Cadence */}
        <div className="space-y-1.5">
          <Label className="text-xs">Cadence</Label>
          <Select value={cadence} onValueChange={setCadence}>
            <SelectTrigger className="text-xs h-8">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              {CADENCES.map((c) => (
                <SelectItem key={c.value} value={c.value || "none"} className="text-xs">
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => handleSave("draft")}
            disabled={isSaving}
          >
            <Save className="h-3 w-3 mr-1" />
            {post?.id ? "Update Draft" : "Save Draft"}
          </Button>
          {scheduledDate && (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handleSave("scheduled")}
              disabled={isSaving || platforms.length === 0}
            >
              <CalendarIcon className="h-3 w-3 mr-1" />
              Schedule
            </Button>
          )}
          {post?.id && (
            <Button
              size="sm"
              className="flex-1 text-xs"
              onClick={() => onPublish(post.id)}
              disabled={isPublishing || platforms.length === 0}
            >
              <Send className="h-3 w-3 mr-1" />
              Publish Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
