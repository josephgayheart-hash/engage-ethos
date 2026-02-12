import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Building2, Dna, Users, Target, BookMarked, Mail, Sparkles, Map,
  Check, Shield, Palette, MessageSquare, FileText, Brain, Zap
} from "lucide-react";

interface GenerationContext {
  profileName?: string;
  useContentDNA?: boolean;
  hasBrandPlatform?: boolean;
  brandPillarCount?: number;
  hasStories?: boolean;
  storyCount?: number;
  hasFacts?: boolean;
  factCount?: number;
  audience?: string;
  cohort?: string;
  moment?: string;
  channels?: string[];
  channelLabels?: string[];
  primaryColor?: string;
  accentColor?: string;
  mode: "builder" | "journey";
  journeyWeeks?: number;
}

interface GenerationLoadingOverlayProps {
  isVisible: boolean;
  context: GenerationContext;
}

interface PhaseItem {
  message: string;
  detail?: string;
  icon: typeof Building2;
}

function buildPhases(ctx: GenerationContext): PhaseItem[] {
  const profileDetail = ctx.profileName ? `for ${ctx.profileName}` : "";

  if (ctx.mode === "journey") {
    return [
      { message: "Loading institutional profile…", detail: profileDetail, icon: Building2 },
      { message: "Analyzing Content DNA & voice patterns…", detail: ctx.useContentDNA ? "Tone, vocabulary, sentence style" : "Skipped — DNA off", icon: Dna },
      { message: "Mapping brand pillars to journey arcs…", detail: ctx.brandPillarCount ? `${ctx.brandPillarCount} pillar${ctx.brandPillarCount > 1 ? "s" : ""} selected` : undefined, icon: Target },
      { message: "Applying behavioral science research…", detail: "Cialdini, Petty & Cacioppo, Kaptein", icon: Brain },
      { message: "Designing multi-channel touchpoint flow…", detail: ctx.journeyWeeks ? `${ctx.journeyWeeks}-week timeline` : undefined, icon: Map },
      { message: "Weaving in stories & proof points…", detail: ctx.hasStories || ctx.hasFacts ? `${ctx.storyCount || 0} stories, ${ctx.factCount || 0} facts` : "No stories/facts selected", icon: BookMarked },
      { message: "Generating on-brand journey content…", detail: `${ctx.channels?.length || 0} channels`, icon: Mail },
      { message: "Scoring brand adherence & finalizing…", detail: undefined, icon: Sparkles },
    ];
  }

  return [
    { message: "Loading institutional profile…", detail: profileDetail, icon: Building2 },
    { message: "Analyzing Content DNA & voice patterns…", detail: ctx.useContentDNA ? "Tone, vocabulary, sentence style" : "Skipped — DNA off", icon: Dna },
    { message: "Applying brand pillars & proof points…", detail: ctx.brandPillarCount ? `${ctx.brandPillarCount} pillar${ctx.brandPillarCount > 1 ? "s" : ""} selected` : undefined, icon: Target },
    { message: "Matching audience psychology & research…", detail: "Cialdini, Petty & Cacioppo, Kaptein", icon: Brain },
    { message: "Weaving in stories & data points…", detail: ctx.hasStories || ctx.hasFacts ? `${ctx.storyCount || 0} stories, ${ctx.factCount || 0} facts` : "No stories/facts selected", icon: BookMarked },
    { message: "Generating on-brand drafts per channel…", detail: `${ctx.channels?.length || 0} channel${(ctx.channels?.length || 0) > 1 ? "s" : ""}`, icon: Mail },
    { message: "Scoring brand adherence & finalizing…", detail: undefined, icon: Sparkles },
  ];
}

export function GenerationLoadingOverlay({ isVisible, context }: GenerationLoadingOverlayProps) {
  const [phase, setPhase] = useState(0);
  const [showTags, setShowTags] = useState(false);

  const phases = useMemo(() => buildPhases(context), [context]);
  const maxPhase = phases.length - 1;

  useEffect(() => {
    if (!isVisible) {
      setPhase(0);
      setShowTags(false);
      return;
    }
    // Show tags after a short delay
    const tagTimer = setTimeout(() => setShowTags(true), 600);
    const interval = setInterval(() => {
      setPhase(prev => (prev < maxPhase ? prev + 1 : prev));
    }, context.mode === "journey" ? 3500 : 2200);
    return () => {
      clearInterval(interval);
      clearTimeout(tagTimer);
    };
  }, [isVisible, context.mode, maxPhase]);

  if (!isVisible) return null;

  const colors = [context.primaryColor, context.accentColor].filter(Boolean) as string[];

  // Build readback tags
  const readbackTags: { label: string; icon: typeof Building2 }[] = [];
  if (context.profileName) readbackTags.push({ label: context.profileName, icon: Building2 });
  if (context.useContentDNA) readbackTags.push({ label: "Content DNA", icon: Dna });
  if (context.hasBrandPlatform) readbackTags.push({ label: "Brand Platform", icon: Shield });
  if (context.audience) readbackTags.push({ label: context.audience, icon: Users });
  if (context.cohort) readbackTags.push({ label: context.cohort, icon: Users });
  if (context.moment) readbackTags.push({ label: context.moment, icon: MessageSquare });
  if (context.hasStories) readbackTags.push({ label: `${context.storyCount || 0} Stories`, icon: FileText });
  if (context.hasFacts) readbackTags.push({ label: `${context.factCount || 0} Facts`, icon: Zap });
  if (context.channels && context.channels.length > 0) {
    readbackTags.push({ label: `${context.channels.length} Channel${context.channels.length > 1 ? "s" : ""}`, icon: Mail });
  }
  if (context.mode === "journey" && context.journeyWeeks) {
    readbackTags.push({ label: `${context.journeyWeeks}-week journey`, icon: Map });
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/[0.03] to-card p-8 animate-fade-in shadow-sm">
      <div className="flex flex-col items-center gap-5">

        {/* Brand color swatches */}
        {colors.length > 0 && (
          <div className={`flex items-center gap-2 transition-all duration-700 ${showTags ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
            <Palette className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mr-1">Brand Colors</span>
            {colors.map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-background shadow-sm animate-scale-in"
                style={{ backgroundColor: color, animationDelay: `${i * 150}ms` }}
                title={color}
              />
            ))}
          </div>
        )}

        {/* Checklist — each phase appears as it completes */}
        <div className="w-full max-w-md space-y-1">
          {phases.map((p, i) => {
            const isComplete = i < phase;
            const isCurrent = i === phase;
            const isFuture = i > phase;
            const PhaseIcon = p.icon;

            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-500 ${
                  isCurrent
                    ? "bg-primary/[0.07] border border-primary/20"
                    : isComplete
                      ? "opacity-70"
                      : "opacity-0 h-0 py-0 overflow-hidden"
                }`}
                style={{
                  transitionDelay: isFuture ? "0ms" : `${i * 50}ms`,
                }}
              >
                {/* Status icon */}
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isComplete
                    ? "bg-primary/15 text-primary"
                    : isCurrent
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}>
                  {isComplete ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <PhaseIcon className="w-3 h-3" />
                  )}
                </div>

                {/* Message */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-tight transition-colors duration-300 ${
                    isCurrent ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
                  }`}>
                    {isComplete ? p.message.replace("…", "") : p.message}
                  </p>
                  {p.detail && (isComplete || isCurrent) && (
                    <p className={`text-[11px] mt-0.5 transition-all duration-500 ${
                      isCurrent ? "text-primary/70" : "text-muted-foreground/60"
                    }`}>
                      {p.detail}
                    </p>
                  )}
                </div>

                {/* Completion indicator */}
                {isComplete && (
                  <span className="text-[10px] text-primary/50 font-medium">✓</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Readback tags — what the AI is working with */}
        <div className={`flex flex-wrap items-center justify-center gap-1.5 transition-all duration-700 ${showTags ? "opacity-100" : "opacity-0"}`}>
          {readbackTags.map((tag, i) => {
            const TagIcon = tag.icon;
            return (
              <Badge
                key={i}
                variant="outline"
                className="text-[10px] gap-1 animate-fade-in border-primary/20"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <TagIcon className="w-3 h-3 text-primary/60" />
                {tag.label}
              </Badge>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(8 + (phase / maxPhase) * 90, 95)}%` }}
            />
          </div>
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
