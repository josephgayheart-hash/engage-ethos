import { useState, useEffect, useMemo, useRef, forwardRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Loader2, Building2, Dna, Users, Target, BookMarked, Mail, Sparkles, Map,
  Check, Shield, Palette, MessageSquare, FileText, Brain, Zap, BarChart3,
  Quote, Type, Gauge, Hash, Layers, GraduationCap, Camera, ExternalLink
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
  logoUrl?: string;
  mode: "builder" | "journey";
  journeyWeeks?: number;
  dnaStats?: DNAStats;
  profileStats?: ProfileStats;
  campusPhotoCount?: number;
}

interface GenerationLoadingOverlayProps {
  isVisible: boolean;
  context: GenerationContext;
  onCompletionShown?: () => void;
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

  if (phaseKey === "photos") {
    if (ctx.campusPhotoCount && ctx.campusPhotoCount > 0) {
      items.push({ label: "Reference photos", value: `${ctx.campusPhotoCount} active`, icon: Camera });
    }
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
    { key: "stories", message: "Weaving in stories & data points…", completedMessage: "Stories & data points woven in", detail: ctx.hasStories || ctx.hasFacts ? `${ctx.storyCount || 0} stories, ${ctx.factCount || 0} facts` : "No stories/facts selected", icon: BookMarked, proofItems: buildProofItems(ctx, "stories") },
    { key: "generate", message: "Generating on-brand drafts per channel…", completedMessage: "On-brand drafts generated per channel", detail: `${ctx.channels?.length || 0} channel${(ctx.channels?.length || 0) > 1 ? "s" : ""}`, icon: Mail, proofItems: [] },
    { key: "score", message: "Scoring brand adherence & finalizing…", completedMessage: "Brand adherence scored & finalized", detail: undefined, icon: Sparkles, proofItems: [] },
  ];
}

export const GenerationLoadingOverlay = forwardRef<HTMLDivElement, GenerationLoadingOverlayProps>(
  function GenerationLoadingOverlay({ isVisible, context, onCompletionShown }, ref) {
  const [phase, setPhase] = useState(0);
  const [showTags, setShowTags] = useState(false);
  const [revealedPhases, setRevealedPhases] = useState<number[]>([]);
  const [revealedProofByPhase, setRevealedProofByPhase] = useState<Record<number, number>>({});
  const [allDone, setAllDone] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const phases = useMemo(() => buildPhases(context), [context]);
  const maxPhase = phases.length - 1;

  useEffect(() => {
    if (!isVisible) {
      setPhase(0);
      setShowTags(false);
      setRevealedPhases([]);
      setRevealedProofByPhase({});
      setAllDone(false);
      setShowCompletion(false);
      return;
    }
    setRevealedPhases([0]);
    const tagTimer = setTimeout(() => setShowTags(true), 600);

    const interval = setInterval(() => {
      setPhase(prev => {
        if (prev >= maxPhase) {
          clearInterval(interval);
          setTimeout(() => setAllDone(true), 600);
          return prev;
        }
        const next = prev + 1;
        setRevealedPhases(r => r.includes(next) ? r : [...r, next]);
        return next;
      });
    }, context.mode === "journey" ? 3500 : 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(tagTimer);
    };
  }, [isVisible, context.mode, maxPhase]);

  // Scroll the carousel to keep the active phase centered
  useEffect(() => {
    if (!carouselRef.current) return;
    const activeCard = carouselRef.current.querySelector(`[data-phase-index="${phase}"]`) as HTMLElement | null;
    if (activeCard) {
      activeCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [phase]);

  // Reveal proof items one-by-one for the current phase
  useEffect(() => {
    if (!isVisible) return;
    const currentPhase = phases[phase];
    const proofCount = currentPhase?.proofItems?.length || 0;
    if (proofCount === 0) return;

    let count = 0;
    const proofInterval = setInterval(() => {
      count++;
      setRevealedProofByPhase(prev => ({ ...prev, [phase]: count }));
      if (count >= proofCount) clearInterval(proofInterval);
    }, 350);

    return () => clearInterval(proofInterval);
  }, [phase, isVisible, phases]);

  // When allDone fires, show completion celebration
  useEffect(() => {
    if (!allDone) return;
    const showTimer = setTimeout(() => setShowCompletion(true), 100);
    const doneTimer = setTimeout(() => {
      onCompletionShown?.();
    }, 2800);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(doneTimer);
    };
  }, [allDone, onCompletionShown]);

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

  const brandPrimary = context.primaryColor;
  const brandAccent = context.accentColor || brandPrimary;
  const hasBrandColors = !!brandPrimary;

  return (
    <div
      ref={ref}
      className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/[0.03] to-card p-6 shadow-sm overflow-hidden"
      style={hasBrandColors ? { borderColor: `${brandPrimary}30`, background: `linear-gradient(to bottom, ${brandPrimary}08, var(--card))` } : {}}
    >
      <div className="flex flex-col items-center gap-4">

        {/* Profile identity header */}
        {(context.profileName || context.logoUrl) && (
          <div className={`flex items-center gap-3 transition-all duration-700 ${showTags ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
            {context.logoUrl && (
              <img
                src={context.logoUrl}
                alt={context.profileName || "Institution logo"}
                className="w-9 h-9 rounded-lg object-contain border border-border/50 bg-background p-0.5 shadow-sm"
              />
            )}
            {context.profileName && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground leading-tight">{context.profileName}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {context.mode === "journey" ? "Journey Generation" : "Message Generation"}
                </span>
              </div>
            )}
          </div>
        )}

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

        {/* Horizontal phase carousel */}
        <div className="w-full relative">
          {/* Gradient fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-card to-transparent" style={hasBrandColors ? { background: `linear-gradient(to right, var(--card), transparent)` } : {}} />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-card to-transparent" style={hasBrandColors ? { background: `linear-gradient(to left, var(--card), transparent)` } : {}} />
          
          <div
            ref={carouselRef}
            className="flex gap-3 overflow-x-auto scroll-smooth px-8 py-2 no-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {phases.map((p, i) => {
              const isRevealed = revealedPhases.includes(i);
              const isComplete = i < phase;
              const isCurrent = i === phase;
              const PhaseIcon = p.icon;
              const proofItems = p.proofItems || [];
              const revealedProofCount = revealedProofByPhase[i] || 0;
              const visibleProofCount = isComplete ? proofItems.length : (isCurrent ? revealedProofCount : 0);

              return (
                <div
                  key={i}
                  data-phase-index={i}
                  className={`flex-shrink-0 w-56 rounded-xl border p-4 transition-all duration-500 ${
                    isRevealed ? "opacity-100" : "opacity-0 translate-x-8"
                  } ${
                    isCurrent
                      ? (hasBrandColors ? "shadow-md scale-105" : "bg-primary/[0.07] border-primary/25 shadow-md scale-105")
                      : isComplete
                        ? "border-border/40 bg-muted/30"
                        : "border-border/20 bg-muted/10"
                  }`}
                  style={{
                    ...(isCurrent && hasBrandColors ? { backgroundColor: `${brandPrimary}12`, borderColor: `${brandPrimary}40`, boxShadow: `0 4px 20px ${brandPrimary}15` } : {}),
                    ...(isRevealed ? { animation: "slideInFromRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" } : {}),
                  }}
                >
                  {/* Phase icon + status */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                        !hasBrandColors
                          ? (isComplete ? "bg-primary/15 text-primary" : isCurrent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")
                          : (isComplete || isCurrent ? "" : "bg-muted text-muted-foreground")
                      }`}
                      style={(isComplete || isCurrent) && hasBrandColors ? { backgroundColor: `${brandPrimary}${isComplete ? '26' : '1a'}`, color: brandPrimary } : {}}
                    >
                      {isComplete ? (
                        <Check className="w-4 h-4" style={{ animation: "popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }} />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <PhaseIcon className="w-4 h-4" />
                      )}
                    </div>
                    {isComplete && (
                      <div style={{ animation: "popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
                        <div
                          className={hasBrandColors ? "w-5 h-5 rounded-full flex items-center justify-center" : "w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center"}
                          style={hasBrandColors ? { backgroundColor: `${brandPrimary}1a` } : {}}
                        >
                          <Check className={hasBrandColors ? "w-3 h-3" : "w-3 h-3 text-primary"} style={hasBrandColors ? { color: brandPrimary } : {}} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message text */}
                  <p className={`text-xs leading-snug transition-all duration-300 ${
                    isCurrent ? "font-semibold text-foreground" : isComplete ? "font-medium text-foreground/70" : "font-medium text-muted-foreground"
                  }`}>
                    {isComplete ? p.completedMessage : p.message}
                  </p>
                  {p.detail && (
                    <p
                      className={`text-[10px] mt-1 transition-all duration-500 ${
                        isCurrent ? (hasBrandColors ? "font-medium" : "text-primary/70 font-medium") : "text-muted-foreground/50"
                      }`}
                      style={isCurrent && hasBrandColors ? { color: `${brandPrimary}b3` } : {}}
                    >
                      {p.detail}
                    </p>
                  )}

                  {/* No campus photos CTA */}
                  {(p as any).hasNoPhotos && (isCurrent || isComplete) && (
                    <p className="text-[9px] text-muted-foreground/70 mt-1">
                      Imagery guided by profile &amp; brand.{" "}
                      <Link
                        to="/admin/content-dna"
                        className="inline-flex items-center gap-0.5 text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        Add photos <ExternalLink className="w-2 h-2" />
                      </Link>
                    </p>
                  )}

                  {/* Proof items */}
                  {proofItems.length > 0 && visibleProofCount > 0 && (
                    <div className="mt-2 flex flex-col gap-1">
                      {proofItems.slice(0, visibleProofCount).map((proof, pi) => {
                        const ProofIcon = proof.icon;
                        return (
                          <div
                            key={pi}
                            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-medium transition-all ${
                              isComplete
                                ? "bg-muted/60 text-muted-foreground/70"
                                : (hasBrandColors ? "" : "bg-primary/[0.08] text-primary/80 border border-primary/10")
                            }`}
                            style={{
                              animation: isComplete ? "none" : "proofFlashIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                              ...(!isComplete && hasBrandColors ? { backgroundColor: `${brandPrimary}14`, color: `${brandPrimary}cc`, border: `1px solid ${brandPrimary}1a` } : {}),
                            }}
                          >
                            <ProofIcon className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="text-muted-foreground/60">{proof.label}:</span>
                            <span className="truncate max-w-[120px]">{proof.value}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase indicator dots */}
        <div className="flex items-center gap-1.5">
          {phases.map((_, i) => {
            const isComplete = i < phase;
            const isCurrent = i === phase;
            return (
              <div
                key={i}
                className={`rounded-full transition-all duration-500 ${
                  isCurrent ? "w-6 h-1.5" : "w-1.5 h-1.5"
                } ${
                  !hasBrandColors
                    ? (isComplete ? "bg-primary/40" : isCurrent ? "bg-primary" : "bg-muted-foreground/20")
                    : (isComplete || isCurrent ? "" : "bg-muted-foreground/20")
                }`}
                style={(isComplete || isCurrent) && hasBrandColors ? { backgroundColor: isCurrent ? brandPrimary : `${brandPrimary}66` } : {}}
              />
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
                className={hasBrandColors ? "text-[10px] gap-1" : "text-[10px] gap-1 border-primary/20"}
                style={{
                  animation: "slideInTag 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                  animationDelay: `${300 + i * 100}ms`,
                  opacity: 0,
                  transform: "translateY(8px)",
                  ...(hasBrandColors ? { borderColor: `${brandPrimary}33` } : {}),
                }}
              >
                <TagIcon className={hasBrandColors ? "w-3 h-3" : "w-3 h-3 text-primary/60"} style={hasBrandColors ? { color: `${brandPrimary}99` } : {}} />
                {tag.label}
              </Badge>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={hasBrandColors ? "h-full rounded-full transition-all duration-1000 ease-out" : "h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-1000 ease-out"}
              style={{
                width: allDone ? "100%" : `${Math.min(8 + (phase / maxPhase) * 90, 95)}%`,
                ...(hasBrandColors ? { background: `linear-gradient(to right, ${brandPrimary}cc, ${brandAccent || brandPrimary})` } : {}),
              }}
            />
          </div>
        </div>

        {/* Completion pop or estimated time */}
        {showCompletion ? (
          <div className="flex flex-col items-center gap-3 py-2" style={{ animation: "completionPop 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
            <div
              className={hasBrandColors ? "w-14 h-14 rounded-full flex items-center justify-center shadow-lg" : "w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center border-2 border-primary/30 shadow-lg"}
              style={{
                animation: "completionRing 1.5s ease-out forwards",
                ...(hasBrandColors ? { backgroundColor: `${brandPrimary}26`, border: `2px solid ${brandPrimary}4d` } : {}),
              }}
            >
              <Check className={hasBrandColors ? "w-7 h-7" : "w-7 h-7 text-primary"} style={{ animation: "completionCheck 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards", opacity: 0, ...(hasBrandColors ? { color: brandPrimary } : {}) }} />
            </div>
            <p className="text-base font-bold text-foreground" style={{ animation: "completionPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s forwards", opacity: 0 }}>Ready!</p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {context.mode === "journey"
              ? "Building your strategy — typically 30–60 seconds"
              : "Crafting your messages — typically 15–30 seconds"}
          </p>
        )}
      </div>

      {/* Keyframe animations */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes slideInFromRight {
          0% {
            opacity: 0;
            transform: translateX(40px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0); }
          40% { opacity: 1; transform: scale(1.35); }
          65% { transform: scale(0.9); }
          80% { transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInTag {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes completionPop {
          0% { opacity: 0; transform: scale(0); }
          35% { opacity: 1; transform: scale(1.4); }
          55% { transform: scale(0.85); }
          70% { transform: scale(1.15); }
          85% { transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes completionRing {
          0% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.5); }
          40% { box-shadow: 0 0 0 16px hsl(var(--primary) / 0.15); }
          100% { box-shadow: 0 0 0 24px hsl(var(--primary) / 0); }
        }
        @keyframes completionCheck {
          0% { opacity: 0; transform: scale(0) rotate(-45deg); }
          50% { opacity: 1; transform: scale(1.3) rotate(0deg); }
          75% { transform: scale(0.9) rotate(0deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes proofFlashIn {
          0% { opacity: 0; transform: translateX(-8px) scale(0.95); }
          50% { opacity: 1; transform: translateX(2px) scale(1.02); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
});
