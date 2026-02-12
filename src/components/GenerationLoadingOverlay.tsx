import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, Dna, Users, Target, BookMarked, Mail, Sparkles, Map } from "lucide-react";

interface GenerationContext {
  profileName?: string;
  useContentDNA?: boolean;
  hasBrandPlatform?: boolean;
  hasStories?: boolean;
  hasFacts?: boolean;
  audience?: string;
  channels?: string[];
  mode: "builder" | "journey";
}

interface GenerationLoadingOverlayProps {
  isVisible: boolean;
  context: GenerationContext;
}

const builderPhases = [
  { message: "Loading institutional profile…", icon: Building2 },
  { message: "Reading Content DNA & voice analysis…", icon: Dna },
  { message: "Applying brand pillars & proof points…", icon: Target },
  { message: "Matching audience psychology & research…", icon: Users },
  { message: "Generating on-brand drafts for each channel…", icon: Mail },
  { message: "Scoring brand adherence & finalizing…", icon: Sparkles },
];

const journeyPhases = [
  { message: "Loading institutional profile…", icon: Building2 },
  { message: "Reading Content DNA & voice analysis…", icon: Dna },
  { message: "Applying brand pillars & proof points…", icon: Target },
  { message: "Mapping audience psychology across timeline…", icon: Users },
  { message: "Designing multi-channel touchpoint strategy…", icon: Map },
  { message: "Generating journey content & finalizing…", icon: Sparkles },
];

export function GenerationLoadingOverlay({ isVisible, context }: GenerationLoadingOverlayProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setPhase(0);
      return;
    }
    const interval = setInterval(() => {
      setPhase(prev => (prev < 5 ? prev + 1 : prev));
    }, context.mode === "journey" ? 4000 : 2500);
    return () => clearInterval(interval);
  }, [isVisible, context.mode]);

  if (!isVisible) return null;

  const phases = context.mode === "journey" ? journeyPhases : builderPhases;
  const currentPhase = phases[phase];
  const PhaseIcon = currentPhase.icon;

  // Build context tags to show what's being used
  const contextTags: { label: string; icon: typeof Building2 }[] = [];
  if (context.profileName) contextTags.push({ label: context.profileName, icon: Building2 });
  if (context.useContentDNA) contextTags.push({ label: "Content DNA Active", icon: Dna });
  if (context.hasBrandPlatform) contextTags.push({ label: "Brand Platform", icon: Target });
  if (context.hasStories) contextTags.push({ label: "Stories Attached", icon: BookMarked });
  if (context.hasFacts) contextTags.push({ label: "Facts Attached", icon: BookMarked });
  if (context.audience) contextTags.push({ label: context.audience, icon: Users });
  if (context.channels && context.channels.length > 0) {
    contextTags.push({ label: `${context.channels.length} channel${context.channels.length > 1 ? "s" : ""}`, icon: Mail });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        {/* Phase steps - visual progress */}
        <div className="flex items-center gap-1 w-full max-w-sm">
          {phases.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${
                i < phase ? "bg-primary" : i === phase ? "bg-primary/60 animate-pulse" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Current phase message */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <PhaseIcon className="w-5 h-5 text-primary" />
            <Loader2 className="w-3 h-3 animate-spin text-primary absolute -bottom-1 -right-1" />
          </div>
          <p className="text-sm font-medium text-foreground">{currentPhase.message}</p>
        </div>

        {/* Context tags showing what the AI is working with */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
          {contextTags.map((tag, i) => {
            const TagIcon = tag.icon;
            return (
              <Badge
                key={i}
                variant="outline"
                className="text-[10px] gap-1 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <TagIcon className="w-3 h-3" />
                {tag.label}
              </Badge>
            );
          })}
        </div>

        {/* Estimated time */}
        <p className="text-xs text-muted-foreground">
          {context.mode === "journey"
            ? "Building your strategy — typically 30–60 seconds"
            : "Crafting your messages — typically 15–30 seconds"}
        </p>
      </div>
    </div>
  );
}
