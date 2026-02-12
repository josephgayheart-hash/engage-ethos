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
  completedMessage: string;
  detail?: string;
  icon: typeof Building2;
}

function buildPhases(ctx: GenerationContext): PhaseItem[] {
  const profileDetail = ctx.profileName ? `for ${ctx.profileName}` : "";

  if (ctx.mode === "journey") {
    return [
      { message: "Loading institutional profile…", completedMessage: "Institutional profile loaded", detail: profileDetail, icon: Building2 },
      { message: "Analyzing Content DNA & voice patterns…", completedMessage: "Content DNA & voice patterns analyzed", detail: ctx.useContentDNA ? "Tone, vocabulary, sentence style" : "Skipped — DNA off", icon: Dna },
      { message: "Mapping brand pillars to journey arcs…", completedMessage: "Brand pillars mapped to journey arcs", detail: ctx.brandPillarCount ? `${ctx.brandPillarCount} pillar${ctx.brandPillarCount > 1 ? "s" : ""} selected` : undefined, icon: Target },
      { message: "Applying behavioral science research…", completedMessage: "Behavioral science research applied", detail: "Cialdini, Petty & Cacioppo, Kaptein", icon: Brain },
      { message: "Designing multi-channel touchpoint flow…", completedMessage: "Multi-channel touchpoint flow designed", detail: ctx.journeyWeeks ? `${ctx.journeyWeeks}-week timeline` : undefined, icon: Map },
      { message: "Weaving in stories & proof points…", completedMessage: "Stories & proof points woven in", detail: ctx.hasStories || ctx.hasFacts ? `${ctx.storyCount || 0} stories, ${ctx.factCount || 0} facts` : "No stories/facts selected", icon: BookMarked },
      { message: "Generating on-brand journey content…", completedMessage: "On-brand journey content generated", detail: `${ctx.channels?.length || 0} channels`, icon: Mail },
      { message: "Scoring brand adherence & finalizing…", completedMessage: "Brand adherence scored & finalized", detail: undefined, icon: Sparkles },
    ];
  }

  return [
    { message: "Loading institutional profile…", completedMessage: "Institutional profile loaded", detail: profileDetail, icon: Building2 },
    { message: "Analyzing Content DNA & voice patterns…", completedMessage: "Content DNA & voice patterns analyzed", detail: ctx.useContentDNA ? "Tone, vocabulary, sentence style" : "Skipped — DNA off", icon: Dna },
    { message: "Applying brand pillars & proof points…", completedMessage: "Brand pillars & proof points applied", detail: ctx.brandPillarCount ? `${ctx.brandPillarCount} pillar${ctx.brandPillarCount > 1 ? "s" : ""} selected` : undefined, icon: Target },
    { message: "Matching audience psychology & research…", completedMessage: "Audience psychology & research matched", detail: "Cialdini, Petty & Cacioppo, Kaptein", icon: Brain },
    { message: "Weaving in stories & data points…", completedMessage: "Stories & data points woven in", detail: ctx.hasStories || ctx.hasFacts ? `${ctx.storyCount || 0} stories, ${ctx.factCount || 0} facts` : "No stories/facts selected", icon: BookMarked },
    { message: "Generating on-brand drafts per channel…", completedMessage: "On-brand drafts generated per channel", detail: `${ctx.channels?.length || 0} channel${(ctx.channels?.length || 0) > 1 ? "s" : ""}`, icon: Mail },
    { message: "Scoring brand adherence & finalizing…", completedMessage: "Brand adherence scored & finalized", detail: undefined, icon: Sparkles },
  ];
}

export function GenerationLoadingOverlay({ isVisible, context }: GenerationLoadingOverlayProps) {
  const [phase, setPhase] = useState(0);
  const [showTags, setShowTags] = useState(false);
  // Track which phases have been "revealed" so they stay visible
  const [revealedPhases, setRevealedPhases] = useState<number[]>([]);

  const phases = useMemo(() => buildPhases(context), [context]);
  const maxPhase = phases.length - 1;

  useEffect(() => {
    if (!isVisible) {
      setPhase(0);
      setShowTags(false);
      setRevealedPhases([]);
      return;
    }
    // Reveal phase 0 immediately
    setRevealedPhases([0]);
    const tagTimer = setTimeout(() => setShowTags(true), 600);

    const interval = setInterval(() => {
      setPhase(prev => {
        const next = prev < maxPhase ? prev + 1 : prev;
        // Add to revealed list
        setRevealedPhases(r => r.includes(next) ? r : [...r, next]);
        return next;
      });
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
    <div className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/[0.03] to-card p-8 shadow-sm overflow-hidden">
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

        {/* Phase list — slides each item in one at a time, all stay visible */}
        <div className="w-full max-w-md space-y-0">
          {phases.map((p, i) => {
            const isRevealed = revealedPhases.includes(i);
            const isComplete = i < phase;
            const isCurrent = i === phase;
            const PhaseIcon = p.icon;

            if (!isRevealed) return null;

            return (
              <div
                key={i}
                className="overflow-hidden"
                style={{
                  animation: "slideInPhase 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                  animationDelay: i === 0 ? "0ms" : "0ms",
                }}
              >
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-400 ${
                    isCurrent
                      ? "bg-primary/[0.07] border border-primary/20 shadow-sm"
                      : isComplete
                        ? "border border-transparent"
                        : ""
                  }`}
                >
                  {/* Status icon with animated transition */}
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isComplete
                      ? "bg-primary/15 text-primary scale-100"
                      : isCurrent
                        ? "bg-primary/10 text-primary scale-110"
                        : "bg-muted text-muted-foreground"
                  }`}
                  style={{
                    transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  >
                    {isComplete ? (
                      <Check className="w-3.5 h-3.5" style={{ animation: "popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }} />
                    ) : isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <PhaseIcon className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Message text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-tight transition-all duration-300 ${
                      isCurrent ? "font-semibold text-foreground" : isComplete ? "font-medium text-foreground/70" : "font-medium text-muted-foreground"
                    }`}>
                      {isComplete ? p.completedMessage : p.message}
                    </p>
                    {p.detail && (
                      <p className={`text-[11px] mt-0.5 transition-all duration-500 ${
                        isCurrent ? "text-primary/70 font-medium" : "text-muted-foreground/50"
                      }`}>
                        {p.detail}
                      </p>
                    )}
                  </div>

                  {/* Completion check */}
                  {isComplete && (
                    <div className="flex-shrink-0" style={{ animation: "popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                    </div>
                  )}
                </div>
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
                className="text-[10px] gap-1 border-primary/20"
                style={{
                  animation: "slideInTag 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                  animationDelay: `${300 + i * 100}ms`,
                  opacity: 0,
                  transform: "translateY(8px)",
                }}
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

      {/* Keyframe animations */}
      <style>{`
        @keyframes slideInPhase {
          0% {
            opacity: 0;
            transform: translateY(16px);
            max-height: 0;
          }
          30% {
            max-height: 80px;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            max-height: 80px;
          }
        }
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          60% {
            transform: scale(1.2);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideInTag {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
