import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Building2, Dna, Users, Target, BookMarked, Mail, Sparkles, Map,
  Check, Shield, Palette, MessageSquare, FileText, Brain, Zap, BarChart3,
  Quote, Type, Gauge, Hash, Layers, GraduationCap
} from "lucide-react";

interface DNAStats {
  sampleCount?: number;
  overallTone?: string;
  formalityLevel?: string;
  sentenceStyle?: string;
  emotionalTone?: string;
  keyCharacteristics?: string[];
  vocabularyPatterns?: string[];
  commonPhrases?: string[];
  customInstructions?: boolean;
  adjustmentCount?: number;
}

interface ProfileStats {
  institutionType?: string;
  profileType?: string;
  parentProfileName?: string;
  leadershipTitle?: string;
  leadershipName?: string;
  tagline?: string;
}

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
  dnaStats?: DNAStats;
  profileStats?: ProfileStats;
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
  proofItems?: ProofItem[];
}

interface ProofItem {
  label: string;
  value: string;
  icon: typeof Building2;
}

function buildProofItems(ctx: GenerationContext, phaseKey: string): ProofItem[] {
  const items: ProofItem[] = [];
  const dns = ctx.dnaStats;
  const ps = ctx.profileStats;

  if (phaseKey === "profile") {
    if (ps?.institutionType) items.push({ label: "Type", value: ps.institutionType, icon: GraduationCap });
    if (ps?.tagline) items.push({ label: "Tagline", value: ps.tagline.length > 50 ? ps.tagline.slice(0, 50) + "…" : ps.tagline, icon: Quote });
    if (ps?.leadershipName) items.push({ label: "Leadership", value: `${ps.leadershipName}${ps.leadershipTitle ? `, ${ps.leadershipTitle}` : ""}`, icon: Users });
    if (ps?.parentProfileName) items.push({ label: "Parent", value: ps.parentProfileName, icon: Layers });
  }

  if (phaseKey === "dna") {
    if (dns?.sampleCount) items.push({ label: "Samples analyzed", value: `${dns.sampleCount} document${dns.sampleCount > 1 ? "s" : ""}`, icon: FileText });
    if (dns?.overallTone) items.push({ label: "Voice tone", value: dns.overallTone, icon: Gauge });
    if (dns?.formalityLevel) items.push({ label: "Formality", value: dns.formalityLevel, icon: BarChart3 });
    if (dns?.sentenceStyle) items.push({ label: "Style", value: dns.sentenceStyle, icon: Type });
    if (dns?.emotionalTone) items.push({ label: "Emotion", value: dns.emotionalTone, icon: Sparkles });
    if (dns?.keyCharacteristics && dns.keyCharacteristics.length > 0) {
      items.push({ label: "Traits", value: dns.keyCharacteristics.slice(0, 3).join(", "), icon: Hash });
    }
    if (dns?.vocabularyPatterns && dns.vocabularyPatterns.length > 0) {
      items.push({ label: "Vocabulary", value: dns.vocabularyPatterns.slice(0, 3).join(", "), icon: Quote });
    }
    if (dns?.customInstructions) items.push({ label: "Custom rules", value: "Applied", icon: Shield });
    if (dns?.adjustmentCount && dns.adjustmentCount > 0) items.push({ label: "Tuning adjustments", value: `${dns.adjustmentCount} active`, icon: Gauge });
  }

  if (phaseKey === "brand") {
    if (ctx.brandPillarCount) items.push({ label: "Brand pillars", value: `${ctx.brandPillarCount} selected`, icon: Target });
  }

  if (phaseKey === "stories") {
    if (ctx.storyCount) items.push({ label: "Stories", value: `${ctx.storyCount} woven in`, icon: BookMarked });
    if (ctx.factCount) items.push({ label: "Proof points", value: `${ctx.factCount} data facts`, icon: Zap });
  }

  return items;
}

function buildPhases(ctx: GenerationContext): (PhaseItem & { key: string })[] {
  const profileDetail = ctx.profileName ? `for ${ctx.profileName}` : "";

  if (ctx.mode === "journey") {
    return [
      { key: "profile", message: "Loading institutional profile…", completedMessage: "Institutional profile loaded", detail: profileDetail, icon: Building2, proofItems: buildProofItems(ctx, "profile") },
      { key: "dna", message: "Analyzing Content DNA & voice patterns…", completedMessage: "Content DNA & voice patterns analyzed", detail: ctx.useContentDNA ? "Tone, vocabulary, sentence style" : "Skipped — DNA off", icon: Dna, proofItems: buildProofItems(ctx, "dna") },
      { key: "brand", message: "Mapping brand pillars to journey arcs…", completedMessage: "Brand pillars mapped to journey arcs", detail: ctx.brandPillarCount ? `${ctx.brandPillarCount} pillar${ctx.brandPillarCount > 1 ? "s" : ""} selected` : undefined, icon: Target, proofItems: buildProofItems(ctx, "brand") },
      { key: "research", message: "Applying behavioral science research…", completedMessage: "Behavioral science research applied", detail: "Cialdini, Petty & Cacioppo, Kaptein", icon: Brain, proofItems: [] },
      { key: "flow", message: "Designing multi-channel touchpoint flow…", completedMessage: "Multi-channel touchpoint flow designed", detail: ctx.journeyWeeks ? `${ctx.journeyWeeks}-week timeline` : undefined, icon: Map, proofItems: [] },
      { key: "stories", message: "Weaving in stories & proof points…", completedMessage: "Stories & proof points woven in", detail: ctx.hasStories || ctx.hasFacts ? `${ctx.storyCount || 0} stories, ${ctx.factCount || 0} facts` : "No stories/facts selected", icon: BookMarked, proofItems: buildProofItems(ctx, "stories") },
      { key: "generate", message: "Generating on-brand journey content…", completedMessage: "On-brand journey content generated", detail: `${ctx.channels?.length || 0} channels`, icon: Mail, proofItems: [] },
      { key: "score", message: "Scoring brand adherence & finalizing…", completedMessage: "Brand adherence scored & finalized", detail: undefined, icon: Sparkles, proofItems: [] },
    ];
  }

  return [
    { key: "profile", message: "Loading institutional profile…", completedMessage: "Institutional profile loaded", detail: profileDetail, icon: Building2, proofItems: buildProofItems(ctx, "profile") },
    { key: "dna", message: "Analyzing Content DNA & voice patterns…", completedMessage: "Content DNA & voice patterns analyzed", detail: ctx.useContentDNA ? "Tone, vocabulary, sentence style" : "Skipped — DNA off", icon: Dna, proofItems: buildProofItems(ctx, "dna") },
    { key: "brand", message: "Applying brand pillars & proof points…", completedMessage: "Brand pillars & proof points applied", detail: ctx.brandPillarCount ? `${ctx.brandPillarCount} pillar${ctx.brandPillarCount > 1 ? "s" : ""} selected` : undefined, icon: Target, proofItems: buildProofItems(ctx, "brand") },
    { key: "research", message: "Matching audience psychology & research…", completedMessage: "Audience psychology & research matched", detail: "Cialdini, Petty & Cacioppo, Kaptein", icon: Brain, proofItems: [] },
    { key: "stories", message: "Weaving in stories & data points…", completedMessage: "Stories & data points woven in", detail: ctx.hasStories || ctx.hasFacts ? `${ctx.storyCount || 0} stories, ${ctx.factCount || 0} facts` : "No stories/facts selected", icon: BookMarked, proofItems: buildProofItems(ctx, "stories") },
    { key: "generate", message: "Generating on-brand drafts per channel…", completedMessage: "On-brand drafts generated per channel", detail: `${ctx.channels?.length || 0} channel${(ctx.channels?.length || 0) > 1 ? "s" : ""}`, icon: Mail, proofItems: [] },
    { key: "score", message: "Scoring brand adherence & finalizing…", completedMessage: "Brand adherence scored & finalized", detail: undefined, icon: Sparkles, proofItems: [] },
  ];
}

export function GenerationLoadingOverlay({ isVisible, context }: GenerationLoadingOverlayProps) {
  const [phase, setPhase] = useState(0);
  const [showTags, setShowTags] = useState(false);
  const [revealedPhases, setRevealedPhases] = useState<number[]>([]);
  // Track which proof items within a phase have been revealed (by phase index)
  const [revealedProofByPhase, setRevealedProofByPhase] = useState<Record<number, number>>({});

  const phases = useMemo(() => buildPhases(context), [context]);
  const maxPhase = phases.length - 1;

  useEffect(() => {
    if (!isVisible) {
      setPhase(0);
      setShowTags(false);
      setRevealedPhases([]);
      setRevealedProofByPhase({});
      return;
    }
    setRevealedPhases([0]);
    const tagTimer = setTimeout(() => setShowTags(true), 600);

    const interval = setInterval(() => {
      setPhase(prev => {
        const next = prev < maxPhase ? prev + 1 : prev;
        setRevealedPhases(r => r.includes(next) ? r : [...r, next]);
        return next;
      });
    }, context.mode === "journey" ? 3500 : 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(tagTimer);
    };
  }, [isVisible, context.mode, maxPhase]);

  // Reveal proof items one-by-one for the current phase
  useEffect(() => {
    if (!isVisible) return;
    const currentPhase = phases[phase];
    const proofCount = currentPhase?.proofItems?.length || 0;
    if (proofCount === 0) return;

    // Start revealing proof items with staggered delay
    let count = 0;
    const proofInterval = setInterval(() => {
      count++;
      setRevealedProofByPhase(prev => ({ ...prev, [phase]: count }));
      if (count >= proofCount) clearInterval(proofInterval);
    }, 350);

    return () => clearInterval(proofInterval);
  }, [phase, isVisible, phases]);

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
        <div className="w-full max-w-lg space-y-0">
          {phases.map((p, i) => {
            const isRevealed = revealedPhases.includes(i);
            const isComplete = i < phase;
            const isCurrent = i === phase;
            const PhaseIcon = p.icon;
            const proofItems = p.proofItems || [];
            const revealedProofCount = revealedProofByPhase[i] || 0;
            // Show all proof items for completed phases
            const visibleProofCount = isComplete ? proofItems.length : (isCurrent ? revealedProofCount : 0);

            if (!isRevealed) return null;

            return (
              <div
                key={i}
                className="overflow-hidden"
                style={{
                  animation: "slideInPhase 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                }}
              >
                <div
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-400 ${
                    isCurrent
                      ? "bg-primary/[0.07] border border-primary/20 shadow-sm"
                      : isComplete
                        ? "border border-transparent"
                        : ""
                  }`}
                >
                  {/* Status icon */}
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 transition-all duration-500 ${
                    isComplete
                      ? "bg-primary/15 text-primary scale-100"
                      : isCurrent
                        ? "bg-primary/10 text-primary scale-110"
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {isComplete ? (
                      <Check className="w-3.5 h-3.5" style={{ animation: "popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }} />
                    ) : isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <PhaseIcon className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Message text + proof items */}
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

                    {/* Proof items — flash in one by one */}
                    {proofItems.length > 0 && visibleProofCount > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {proofItems.slice(0, visibleProofCount).map((proof, pi) => {
                          const ProofIcon = proof.icon;
                          return (
                            <div
                              key={pi}
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-all ${
                                isComplete
                                  ? "bg-muted/60 text-muted-foreground/70"
                                  : "bg-primary/[0.08] text-primary/80 border border-primary/10"
                              }`}
                              style={{
                                animation: isComplete ? "none" : "proofFlashIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                              }}
                            >
                              <ProofIcon className="w-2.5 h-2.5 flex-shrink-0" />
                              <span className="text-muted-foreground/60">{proof.label}:</span>
                              <span className="truncate max-w-[160px]">{proof.value}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Completion check */}
                  {isComplete && (
                    <div className="flex-shrink-0 mt-0.5" style={{ animation: "popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
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

        {/* Readback tags */}
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
            max-height: 120px;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            max-height: 120px;
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
        @keyframes proofFlashIn {
          0% {
            opacity: 0;
            transform: translateX(-8px) scale(0.95);
          }
          50% {
            opacity: 1;
            transform: translateX(2px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
