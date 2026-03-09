import { useState, useEffect, useRef } from 'react';
import { Palette, Type, Layers, Sparkles, CheckCircle2, Wand2 } from 'lucide-react';
import showcaseImage from '@/assets/showcase-student-image.png';

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useShouldLoop() {
  const [shouldLoop, setShouldLoop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)');
    const update = () => setShouldLoop(!mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return shouldLoop;
}

function BrowserChrome({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl shadow-2xl border border-border/60 overflow-hidden">
      <div className="px-5 py-3 flex items-center gap-3" style={{ background: 'hsl(222, 47%, 14%)' }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-amber-400/80" />
          <div className="w-3 h-3 rounded-full bg-green-400/80" />
        </div>
        <span className="text-white/50 text-xs ml-2">{title}</span>
      </div>
      {children}
    </div>
  );
}

const logoVariants = ['Primary', 'Secondary', 'Athletic', 'Presidential'];
const patterns = [
  { label: 'None', active: false },
  { label: 'Diagonal', active: false },
  { label: 'Chevron', active: true },
  { label: 'Dots', active: false },
];

export default function BrandStudioShowcaseDemo() {
  const { ref, visible } = useInView(0.1);
  const [step, setStep] = useState(0);
  const shouldLoop = useShouldLoop();

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timers.push(setTimeout(() => setStep(1), 1000));   // Logo appears
      timers.push(setTimeout(() => setStep(2), 2800));   // Pattern overlay
      timers.push(setTimeout(() => setStep(3), 5000));   // Headline + CTA
      timers.push(setTimeout(() => setStep(4), 7000));   // Brand score
      if (shouldLoop) timers.push(setTimeout(() => { setStep(0); run(); }, 10000));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [visible, shouldLoop]);

  return (
    <div ref={ref} className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <BrowserChrome title="CampusVoice — AI Brand Studio">
        <div className="p-5 flex gap-4">
          {/* Controls sidebar */}
          <div className="w-36 flex-shrink-0 space-y-3">
            <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Logo Variant</p>
            <div className="space-y-1.5">
              {logoVariants.map((v, i) => (
                <div
                  key={v}
                  className={`text-[10px] font-medium px-2 py-1.5 rounded-lg border transition-all duration-300 cursor-default ${
                    step >= 1 && i === 0 ? 'border-purple-400 text-purple-500' : 'border-border/40 text-muted-foreground'
                  }`}
                  style={step >= 1 && i === 0 ? { background: 'hsl(270 70% 60% / 0.1)' } : {}}
                >
                  {v}
                </div>
              ))}
            </div>

            <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground pt-2">Pattern</p>
            <div className="space-y-1">
              {patterns.map((p, i) => (
                <div
                  key={p.label}
                  className={`text-[9px] text-center py-1 rounded border transition-all ${
                    step >= 2 && p.active ? 'border-blue-400 text-blue-500' : 'border-border/40 text-muted-foreground'
                  }`}
                  style={step >= 2 && p.active ? { background: 'hsl(200 100% 50% / 0.1)' } : {}}
                >
                  {p.label}
                </div>
              ))}
            </div>

            <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground pt-2">Brand Colors</p>
            <div className="flex gap-1.5">
              {['hsl(270 70% 45%)', 'hsl(200 100% 50%)', 'hsl(82 85% 55%)', 'hsl(0 0% 100%)'].map((c, i) => (
                <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all ${step >= 2 ? 'border-border' : 'border-border/40'}`} style={{ background: c }} />
              ))}
            </div>

            {step >= 3 && (
              <div className="pt-2 transition-all duration-500">
                <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1">AI Headline</p>
                <div className="flex items-center gap-1 text-[9px] text-purple-500 font-medium px-2 py-1 rounded border border-purple-300/40" style={{ background: 'hsl(270 70% 60% / 0.05)' }}>
                  <Wand2 className="w-3 h-3" /> Generated
                </div>
              </div>
            )}
          </div>

          {/* Canvas */}
          <div className="flex-1 rounded-xl border border-border/60 overflow-hidden relative" style={{ aspectRatio: '1/1', maxHeight: '340px' }}>
            <img src={showcaseImage} alt="Student studying" className="absolute inset-0 w-full h-full object-cover" />

            {/* Pattern overlay */}
            {step >= 2 && (
              <>
                <div
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{
                    background: 'linear-gradient(to top, hsl(270 70% 20% / 0.85) 10%, hsl(270 70% 20% / 0.4) 45%, transparent 70%)',
                    opacity: step >= 2 ? 1 : 0,
                  }}
                />
                <div
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    opacity: 0.07,
                    backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 10px, hsl(270 70% 60%) 10px, hsl(270 70% 60%) 11px)',
                  }}
                />
              </>
            )}

            {/* Logo */}
            {step >= 1 && (
              <div className="absolute top-3 left-3 transition-all duration-500" style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? 'scale(1)' : 'scale(0.8)' }}>
                <div className="w-12 h-12 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <span className="text-[7px] text-purple-900 font-bold leading-tight text-center">LAKEWOOD<br/>STATE</span>
                </div>
              </div>
            )}

            {/* Headline + CTA */}
            {step >= 3 && (
              <div className="absolute bottom-3 left-3 right-3 transition-all duration-600" style={{ opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? 'translateY(0)' : 'translateY(12px)' }}>
                <p className="text-white font-serif text-base font-bold leading-tight drop-shadow-lg">
                  Your Future in<br />Computer Science
                </p>
                <p className="text-white/60 text-[9px] mt-1">100% Online · ABET Accredited</p>
                <div className="mt-2 text-[9px] font-bold px-3 py-1 rounded w-fit" style={{ background: 'hsl(82 85% 55%)', color: 'hsl(270 70% 20%)' }}>
                  Apply Now →
                </div>
              </div>
            )}

            {/* Brand Score */}
            {step >= 4 && (
              <div className="absolute top-3 right-3 transition-all duration-500" style={{ opacity: step >= 4 ? 1 : 0 }}>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  <p className="text-[8px] font-bold text-green-700">On Brand — 96</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Layer indicator bar */}
        <div className="px-5 pb-4 flex items-center gap-3">
          {[
            { label: 'Image', color: 'hsl(340 75% 55%)', active: true },
            { label: 'Pattern', color: 'hsl(200 100% 50%)', active: step >= 2 },
            { label: 'Logo & Headlines', color: 'hsl(82 85% 55%)', active: step >= 3 },
            { label: 'CTA Bar', color: 'hsl(270 70% 60%)', active: step >= 3 },
          ].map((layer, i) => (
            <div key={layer.label} className="flex items-center gap-1.5 transition-all duration-300" style={{ opacity: layer.active ? 1 : 0.3 }}>
              <div className="w-2 h-2 rounded-full" style={{ background: layer.color }} />
              <span className="text-[8px] font-medium text-muted-foreground">{layer.label}</span>
            </div>
          ))}
        </div>
      </BrowserChrome>
    </div>
  );
}
