import { useEffect, useRef, useState } from "react";
import {
  Building2,
  Upload,
  BookOpen,
  Dna,
  Mail,
  Route,
  Image,
  MessageSquare,
  Library,
  Share2,
  ChevronRight,
  Sparkles,
  Check,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

const phases = [
  {
    number: "01",
    title: "Set Up Your Institution",
    accent: "hsl(200 100% 50%)",     // blue
    accentMuted: "hsl(200 100% 50% / 0.15)",
    icon: Building2,
    bullets: [
      "University name, colors & logo",
      "Department / sub-unit profiles",
      "Audience segments & terminology",
    ],
  },
  {
    number: "02",
    title: "Build Your Content DNA",
    accent: "hsl(270 70% 60%)",       // purple
    accentMuted: "hsl(270 70% 60% / 0.15)",
    icon: Dna,
    bullets: [
      "Upload brand guidelines & samples",
      "Import fact book & story bank",
      "AI extracts voice + brand platform",
    ],
  },
  {
    number: "03",
    title: "Create On-Brand Content",
    accent: "hsl(82 85% 55%)",        // green
    accentMuted: "hsl(82 85% 55% / 0.15)",
    icon: Sparkles,
    tools: [
      { icon: Mail, label: "Messages" },
      { icon: Route, label: "Journeys" },
      { icon: Image, label: "Branded Images" },
      { icon: MessageSquare, label: "AI Copywriter" },
    ],
  },
  {
    number: "04",
    title: "Store & Share",
    accent: "hsl(48 100% 60%)",       // gold
    accentMuted: "hsl(48 100% 60% / 0.15)",
    icon: Library,
    bullets: [
      "Personal & shared libraries",
      "Collections & approval workflow",
      "Export to CRM, SFMC & more",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Animated connector (desktop)                                      */
/* ------------------------------------------------------------------ */

function Connector({ color }: { color: string }) {
  return (
    <div className="hidden lg:flex items-center justify-center" style={{ width: 56 }}>
      <div className="relative flex items-center w-full">
        {/* base line */}
        <div
          className="absolute inset-y-1/2 left-0 right-0 h-px"
          style={{ background: `${color}55` }}
        />
        {/* pulse overlay */}
        <div
          className="absolute inset-y-1/2 left-0 right-0 h-px animate-pulse"
          style={{ background: color, filter: "blur(1px)" }}
        />
        {/* chevron */}
        <ChevronRight
          className="relative ml-auto -mr-2 w-4 h-4"
          style={{ color }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Phase card                                                        */
/* ------------------------------------------------------------------ */

function PhaseCard({
  phase,
  index,
  activePhase,
}: {
  phase: (typeof phases)[number];
  index: number;
  activePhase: number;
}) {
  const isActive = index === activePhase;

  return (
    <div
      className="relative flex-1 min-w-[220px] rounded-2xl border transition-all duration-700"
      style={{
        background: isActive
          ? `linear-gradient(135deg, hsl(222 40% 14%), hsl(222 40% 18%))`
          : "hsl(222 40% 13%)",
        borderColor: isActive ? phase.accent : "hsl(0 0% 100% / 0.06)",
        boxShadow: isActive
          ? `0 0 32px ${phase.accent}25, inset 0 1px 0 ${phase.accent}20`
          : "none",
        transform: isActive ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      {/* number badge */}
      <div
        className="absolute -top-3 left-5 text-xs font-bold px-2.5 py-0.5 rounded-full"
        style={{
          background: phase.accent,
          color: "hsl(222 47% 11%)",
        }}
      >
        {phase.number}
      </div>

      <div className="p-5 pt-6">
        {/* icon + title */}
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: phase.accentMuted }}
          >
            <phase.icon className="w-4.5 h-4.5" style={{ color: phase.accent }} />
          </div>
          <h3 className="text-white font-semibold text-sm leading-tight">
            {phase.title}
          </h3>
        </div>

        {/* bullets or tools grid */}
        {phase.bullets ? (
          <ul className="space-y-2">
            {phase.bullets.map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs leading-relaxed transition-all duration-500"
                style={{
                  color: isActive ? "hsl(0 0% 100% / 0.75)" : "hsl(0 0% 100% / 0.4)",
                }}
              >
                <Check
                  className="w-3 h-3 mt-0.5 shrink-0"
                  style={{ color: isActive ? phase.accent : "hsl(0 0% 100% / 0.2)" }}
                />
                {b}
              </li>
            ))}
          </ul>
        ) : phase.tools ? (
          <div className="grid grid-cols-2 gap-2">
            {phase.tools.map((tool, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-all duration-500"
                style={{
                  background: isActive ? phase.accentMuted : "hsl(0 0% 100% / 0.03)",
                  color: isActive ? "hsl(0 0% 100% / 0.85)" : "hsl(0 0% 100% / 0.4)",
                }}
              >
                <tool.icon
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: isActive ? phase.accent : "hsl(0 0% 100% / 0.25)" }}
                />
                {tool.label}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* bottom progress bar */}
      <div className="h-0.5 rounded-b-2xl overflow-hidden">
        <div
          className="h-full transition-all duration-700"
          style={{
            width: isActive ? "100%" : "0%",
            background: `linear-gradient(90deg, transparent, ${phase.accent})`,
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile phase card (vertical)                                      */
/* ------------------------------------------------------------------ */

function MobilePhaseCard({
  phase,
  index,
  isLast,
}: {
  phase: (typeof phases)[number];
  index: number;
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      {/* timeline spine */}
      <div className="flex flex-col items-center">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: phase.accent, color: "hsl(222 47% 11%)" }}
        >
          {phase.number}
        </div>
        {!isLast && (
          <div
            className="w-px flex-1 my-1"
            style={{ background: `linear-gradient(to bottom, ${phase.accent}60, ${phases[index + 1].accent}60)` }}
          />
        )}
      </div>

      {/* card */}
      <div
        className="flex-1 rounded-xl border p-4 mb-4"
        style={{
          background: "hsl(222 40% 14%)",
          borderColor: `${phase.accent}30`,
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <phase.icon className="w-4 h-4" style={{ color: phase.accent }} />
          <h3 className="text-white font-semibold text-sm">{phase.title}</h3>
        </div>

        {phase.bullets ? (
          <ul className="space-y-1.5">
            {phase.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                <Check className="w-3 h-3 mt-0.5 shrink-0" style={{ color: phase.accent }} />
                {b}
              </li>
            ))}
          </ul>
        ) : phase.tools ? (
          <div className="grid grid-cols-2 gap-1.5">
            {phase.tools.map((tool, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-white/60"
                style={{ background: phase.accentMuted }}
              >
                <tool.icon className="w-3 h-3" style={{ color: phase.accent }} />
                {tool.label}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function HowItWorksSection() {
  const [activePhase, setActivePhase] = useState(0);

  // Auto-cycle through phases
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhase((prev) => (prev + 1) % phases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="how-it-works"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[hsl(222_47%_11%)] relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(270_50%_20%_/_0.12),_transparent_70%)]" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="font-serif text-4xl sm:text-5xl mb-4">
            <span className="text-white">How It </span>
            <span className="bg-gradient-to-r from-[hsl(200_100%_60%)] to-[hsl(270_70%_65%)] bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-white/55 text-lg max-w-2xl mx-auto">
            From institutional setup to on-brand content at scale—four steps to
            transform how your campus communicates.
          </p>
        </div>

        {/* Phase indicator dots (desktop) */}
        <div className="hidden lg:flex justify-center gap-2 mb-10">
          {phases.map((phase, i) => (
            <button
              key={i}
              onClick={() => setActivePhase(i)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-500"
              style={{
                background: i === activePhase ? `${phase.accent}20` : "transparent",
                color: i === activePhase ? phase.accent : "hsl(0 0% 100% / 0.3)",
                border: `1px solid ${i === activePhase ? `${phase.accent}40` : "transparent"}`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                style={{
                  background: i === activePhase ? phase.accent : "hsl(0 0% 100% / 0.2)",
                  boxShadow: i === activePhase ? `0 0 6px ${phase.accent}` : "none",
                }}
              />
              {phase.title}
            </button>
          ))}
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:flex items-stretch gap-0">
          {phases.map((phase, i) => (
            <div key={i} className="contents">
              <PhaseCard phase={phase} index={i} activePhase={activePhase} />
              {i < phases.length - 1 && (
                <Connector color={phases[i + 1].accent} />
              )}
            </div>
          ))}
        </div>

        {/* Mobile layout */}
        <div className="lg:hidden mt-8">
          {phases.map((phase, i) => (
            <MobilePhaseCard
              key={i}
              phase={phase}
              index={i}
              isLast={i === phases.length - 1}
            />
          ))}
        </div>

        {/* Bottom tagline */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06]">
            <Dna className="w-3.5 h-3.5 text-[hsl(270_70%_60%)]" />
            <span className="text-white/40 text-xs">
              Every output is grounded in your Content DNA — voice, brand platform & institutional facts
            </span>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute -bottom-px left-0 right-0">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80L48 70C96 60 192 40 288 35C384 30 480 40 576 45C672 50 768 50 864 45C960 40 1056 30 1152 30C1248 30 1344 40 1392 45L1440 50V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z"
            fill="hsl(48 100% 90%)"
          />
        </svg>
      </div>
    </section>
  );
}
