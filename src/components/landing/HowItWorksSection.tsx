import { Upload, Database, Zap, Library } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

const leftSteps = [
  { icon: Upload, label: "Upload Your Content" },
  { icon: Database, label: "Import Brand Assets" },
  { icon: Zap, label: "Define Your Voice" },
];

const rightStep = { icon: Library, label: "University Library & Campus Comms" };

type Point = { x: number; y: number };

type LineLayout = {
  width: number;
  height: number;
  uploadToHub: string;
  assetsToHub: string;
  voiceToHub: string;
  hubToLibrary: string;
};

const DEFAULT_LAYOUT: LineLayout = {
  width: 100,
  height: 100,
  uploadToHub: "M 17 17 C 30 17, 38 34, 45 50",
  assetsToHub: "M 17 50 L 45 50",
  voiceToHub: "M 17 83 C 30 83, 38 66, 45 50",
  hubToLibrary: "M 55 50 L 83 50",
};

function curve(start: Point, end: Point) {
  const distance = Math.max(1, Math.abs(end.x - start.x));
  const bend = Math.min(220, Math.max(90, distance * 0.55));
  const dir = end.x >= start.x ? 1 : -1;
  const c1x = start.x + dir * bend;
  const c2x = end.x - dir * bend;
  return `M ${start.x} ${start.y} C ${c1x} ${start.y}, ${c2x} ${end.y}, ${end.x} ${end.y}`;
}

function rightCenter(container: DOMRect, el: HTMLElement): Point {
  const r = el.getBoundingClientRect();
  return { x: r.right - container.left, y: r.top - container.top + r.height / 2 };
}

function leftCenter(container: DOMRect, el: HTMLElement): Point {
  const r = el.getBoundingClientRect();
  return { x: r.left - container.left, y: r.top - container.top + r.height / 2 };
}

export default function HowItWorksSection() {
  const diagramRef = useRef<HTMLDivElement>(null);
  const uploadBoxRef = useRef<HTMLDivElement>(null);
  const assetsBoxRef = useRef<HTMLDivElement>(null);
  const voiceBoxRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const libraryBoxRef = useRef<HTMLDivElement>(null);

  const [layout, setLayout] = useState<LineLayout>(DEFAULT_LAYOUT);

  useLayoutEffect(() => {
    const recalc = () => {
      const diagramEl = diagramRef.current;
      const uploadEl = uploadBoxRef.current;
      const assetsEl = assetsBoxRef.current;
      const voiceEl = voiceBoxRef.current;
      const hubEl = hubRef.current;
      const libraryEl = libraryBoxRef.current;

      if (!diagramEl || !uploadEl || !assetsEl || !voiceEl || !hubEl || !libraryEl) return;

      const containerRect = diagramEl.getBoundingClientRect();

      const uploadStart = rightCenter(containerRect, uploadEl);
      const assetsStart = rightCenter(containerRect, assetsEl);
      const voiceStart = rightCenter(containerRect, voiceEl);

      const hubLeft = leftCenter(containerRect, hubEl);
      const hubRight = rightCenter(containerRect, hubEl);

      const libraryLeft = leftCenter(containerRect, libraryEl);

      setLayout({
        width: Math.max(1, containerRect.width),
        height: Math.max(1, containerRect.height),
        uploadToHub: curve(uploadStart, hubLeft),
        assetsToHub: curve(assetsStart, hubLeft),
        voiceToHub: curve(voiceStart, hubLeft),
        hubToLibrary: curve(hubRight, libraryLeft),
      });
    };

    const raf = requestAnimationFrame(recalc);
    const ro = new ResizeObserver(recalc);

    const diagramEl = diagramRef.current;
    if (diagramEl) ro.observe(diagramEl);

    [
      uploadBoxRef.current,
      assetsBoxRef.current,
      voiceBoxRef.current,
      hubRef.current,
      libraryBoxRef.current,
    ].forEach((el) => {
      if (el) ro.observe(el);
    });

    window.addEventListener("resize", recalc);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", recalc);
      ro.disconnect();
    };
  }, []);

  return (
    <section
      id="how-it-works"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[hsl(222_47%_11%)] relative overflow-hidden"
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(270_50%_20%_/_0.15),_transparent_70%)]" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl sm:text-5xl mb-4">
            <span className="text-white">How It </span>
            <span className="bg-gradient-to-r from-[hsl(200_100%_60%)] to-[hsl(270_70%_65%)] bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Feed your brand assets and content samples into CampusVoice—our AI extracts your Content DNA and brand layer, then crafts on-brand messages ready for review and distribution across your campus communications.
          </p>
        </div>

        {/* Hub and Spoke Diagram - Desktop */}
        <div
          ref={diagramRef}
          className="hidden md:block relative"
          style={{ height: "320px" }}
        >
          {/* Single SVG for all connecting lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            style={{ overflow: "visible" }}
          >
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(270 70% 60%)" stopOpacity="0.55" />
                <stop offset="100%" stopColor="hsl(200 100% 60%)" stopOpacity="0.85" />
              </linearGradient>
            </defs>

            {/* Base lines (always visible) */}
            <path
              d={layout.uploadToHub}
              stroke="url(#lineGrad)"
              strokeWidth={1.25}
              fill="none"
              strokeLinecap="round"
              opacity="0.55"
            />
            <path
              d={layout.assetsToHub}
              stroke="url(#lineGrad)"
              strokeWidth={1.25}
              fill="none"
              strokeLinecap="round"
              opacity="0.55"
            />
            <path
              d={layout.voiceToHub}
              stroke="url(#lineGrad)"
              strokeWidth={1.25}
              fill="none"
              strokeLinecap="round"
              opacity="0.55"
            />
            <path
              d={layout.hubToLibrary}
              stroke="url(#lineGrad)"
              strokeWidth={1.25}
              fill="none"
              strokeLinecap="round"
              opacity="0.55"
            />

            {/* Pulse overlays (throb + flow) */}
            <path
              d={layout.uploadToHub}
              stroke="url(#lineGrad)"
              strokeWidth={2.25}
              fill="none"
              strokeLinecap="round"
              className="animate-pulse-flow"
              style={{ filter: "blur(0.6px)" }}
            />
            <path
              d={layout.assetsToHub}
              stroke="url(#lineGrad)"
              strokeWidth={2.25}
              fill="none"
              strokeLinecap="round"
              className="animate-pulse-flow delay-1"
              style={{ filter: "blur(0.6px)" }}
            />
            <path
              d={layout.voiceToHub}
              stroke="url(#lineGrad)"
              strokeWidth={2.25}
              fill="none"
              strokeLinecap="round"
              className="animate-pulse-flow delay-2"
              style={{ filter: "blur(0.6px)" }}
            />
            <path
              d={layout.hubToLibrary}
              stroke="url(#lineGrad)"
              strokeWidth={2.25}
              fill="none"
              strokeLinecap="round"
              className="animate-pulse-flow delay-3"
              style={{ filter: "blur(0.6px)" }}
            />
          </svg>

          {/* Left Cards - Positioned absolutely */}
          <div
            className="absolute left-0 top-0 bottom-0 grid grid-rows-3 items-center"
            style={{ width: "170px" }}
          >
            {leftSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center justify-center">
                <div
                  ref={
                    index === 0
                      ? uploadBoxRef
                      : index === 1
                        ? assetsBoxRef
                        : voiceBoxRef
                  }
                  className="w-full h-14 rounded-xl bg-[hsl(222_40%_16%)] border border-white/10 flex items-center justify-center transition-all hover:border-[hsl(270_70%_60%_/_0.5)] hover:bg-[hsl(222_40%_18%)]"
                >
                  <step.icon className="w-5 h-5 text-white/70" />
                </div>
                <span className="mt-2 text-white/50 text-xs text-center">{step.label}</span>
              </div>
            ))}
          </div>

          {/* Center Hub */}
          <div
            ref={hubRef}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="w-40 h-40 rounded-full bg-[hsl(222_40%_14%)] border border-white/15 flex items-center justify-center relative overflow-hidden shadow-[0_0_40px_hsl(270_70%_50%_/_0.2)]">
              {/* Animated glow ring */}
              <div
                className="absolute inset-0 rounded-full opacity-70"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0%, hsl(270 70% 60% / 0.5) 20%, hsl(200 100% 60% / 0.5) 40%, transparent 60%)",
                  animation: "spin 5s linear infinite",
                }}
              />
              <div className="absolute inset-[3px] rounded-full bg-[hsl(222_40%_14%)] flex items-center justify-center">
                <div className="text-center">
                  <span className="text-white font-semibold text-xs leading-tight block">CampusVoice</span>
                  <span className="text-white/50 text-[10px]">AI Engine</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card - Positioned absolutely */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ width: "170px" }}
          >
            <div
              ref={libraryBoxRef}
              className="w-full h-14 rounded-xl bg-[hsl(222_40%_16%)] border border-white/10 flex items-center justify-center transition-all hover:border-[hsl(200_100%_60%_/_0.5)] hover:bg-[hsl(222_40%_18%)]"
            >
              <rightStep.icon className="w-5 h-5 text-white/70" />
            </div>
            <span className="mt-2 text-white/50 text-xs text-center">{rightStep.label}</span>
          </div>
        </div>

        {/* Mobile Layout - Vertical with SVG connecting lines */}
        <div className="md:hidden relative" style={{ minHeight: "580px" }}>
          {/* SVG overlay for connecting lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 200 580"
            preserveAspectRatio="xMidYMid meet"
            style={{ overflow: "visible" }}
          >
            <defs>
              <linearGradient id="mobileLineGradV" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(270 70% 60%)" stopOpacity="0.55" />
                <stop offset="100%" stopColor="hsl(200 100% 60%)" stopOpacity="0.85" />
              </linearGradient>
            </defs>

            {/* Line from Box 1 to Box 2 */}
            <line x1="100" y1="70" x2="100" y2="105" stroke="url(#mobileLineGradV)" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
            <line x1="100" y1="70" x2="100" y2="105" stroke="url(#mobileLineGradV)" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse-flow-vertical" style={{ filter: "blur(0.5px)" }} />

            {/* Line from Box 2 to Box 3 */}
            <line x1="100" y1="175" x2="100" y2="210" stroke="url(#mobileLineGradV)" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
            <line x1="100" y1="175" x2="100" y2="210" stroke="url(#mobileLineGradV)" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse-flow-vertical" style={{ animationDelay: "0.35s", filter: "blur(0.5px)" }} />

            {/* Line from Box 3 to Hub */}
            <line x1="100" y1="280" x2="100" y2="320" stroke="url(#mobileLineGradV)" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
            <line x1="100" y1="280" x2="100" y2="320" stroke="url(#mobileLineGradV)" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse-flow-vertical" style={{ animationDelay: "0.7s", filter: "blur(0.5px)" }} />

            {/* Line from Hub to Output */}
            <line x1="100" y1="430" x2="100" y2="470" stroke="url(#mobileLineGradV)" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
            <line x1="100" y1="430" x2="100" y2="470" stroke="url(#mobileLineGradV)" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse-flow-vertical" style={{ animationDelay: "1.05s", filter: "blur(0.5px)" }} />
          </svg>

          {/* Content positioned over SVG */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Box 1 - Upload */}
            <div className="flex flex-col items-center">
              <div className="w-52 h-14 rounded-xl bg-[hsl(222_40%_16%)] border border-white/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-white/70" />
              </div>
              <span className="mt-2 text-white/50 text-xs text-center">Upload Your Content</span>
            </div>

            {/* Spacer for line */}
            <div className="h-9" />

            {/* Box 2 - Import */}
            <div className="flex flex-col items-center">
              <div className="w-52 h-14 rounded-xl bg-[hsl(222_40%_16%)] border border-white/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-white/70" />
              </div>
              <span className="mt-2 text-white/50 text-xs text-center">Import Brand Assets</span>
            </div>

            {/* Spacer for line */}
            <div className="h-9" />

            {/* Box 3 - Voice */}
            <div className="flex flex-col items-center">
              <div className="w-52 h-14 rounded-xl bg-[hsl(222_40%_16%)] border border-white/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white/70" />
              </div>
              <span className="mt-2 text-white/50 text-xs text-center">Define Your Voice</span>
            </div>

            {/* Spacer for line to hub */}
            <div className="h-10" />

            {/* Hub with animated glow */}
            <div className="w-28 h-28 rounded-full bg-[hsl(222_40%_14%)] border border-white/15 flex items-center justify-center relative overflow-hidden shadow-[0_0_30px_hsl(270_70%_50%_/_0.2)]">
              {/* Animated glow ring */}
              <div
                className="absolute inset-0 rounded-full opacity-70"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0%, hsl(270 70% 60% / 0.5) 20%, hsl(200 100% 60% / 0.5) 40%, transparent 60%)",
                  animation: "spin 5s linear infinite",
                }}
              />
              <div className="absolute inset-[3px] rounded-full bg-[hsl(222_40%_14%)] flex items-center justify-center">
                <div className="text-center">
                  <span className="text-white font-semibold text-[11px] leading-tight block">CampusVoice</span>
                  <span className="text-white/50 text-[9px]">AI Engine</span>
                </div>
              </div>
            </div>

            {/* Spacer for line from hub */}
            <div className="h-10" />

            {/* Output */}
            <div className="flex flex-col items-center">
              <div className="w-52 h-14 rounded-xl bg-[hsl(222_40%_16%)] border border-white/10 flex items-center justify-center">
                <Library className="w-5 h-5 text-white/70" />
              </div>
              <span className="mt-2 text-white/50 text-xs text-center">{rightStep.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider to next section */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80L48 70C96 60 192 40 288 35C384 30 480 40 576 45C672 50 768 50 864 45C960 40 1056 30 1152 30C1248 30 1344 40 1392 45L1440 50V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z"
            fill="hsl(48 100% 90%)"
          />
        </svg>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-line {
          0%, 100% {
            opacity: 0.25;
          }
          50% {
            opacity: 0.95;
          }
        }

        @keyframes flow {
          0% {
            stroke-dasharray: 6 16;
            stroke-dashoffset: 60;
          }
          100% {
            stroke-dasharray: 6 16;
            stroke-dashoffset: 0;
          }
        }

        @keyframes flow-vertical {
          0% {
            stroke-dasharray: 4 12;
            stroke-dashoffset: 24;
          }
          100% {
            stroke-dasharray: 4 12;
            stroke-dashoffset: 0;
          }
        }

        .animate-pulse-flow {
          animation: pulse-line 2.2s ease-in-out infinite, flow 1.8s linear infinite;
        }

        .animate-pulse-flow-vertical {
          animation: pulse-line 2.2s ease-in-out infinite, flow-vertical 1.8s linear infinite;
        }

        .delay-1 { animation-delay: 0.35s, 0.35s; }
        .delay-2 { animation-delay: 0.7s, 0.7s; }
        .delay-3 { animation-delay: 1.05s, 1.05s; }
      `}</style>
    </section>
  );
}
