import { useState, useEffect, useRef } from 'react';
import {
  Image, Camera, Sparkles, CheckCircle2, Dna, Palette,
  BookOpen, Zap, Crown, Layers, Wand2, Building2, Loader2,
} from 'lucide-react';
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

const processingSteps = [
  { icon: Building2, label: 'Loading institutional profile…' },
  { icon: Dna, label: 'Analyzing Content DNA…' },
  { icon: Palette, label: 'Applying brand colors & palette…' },
  { icon: BookOpen, label: 'Referencing fact book & stories…' },
  { icon: Camera, label: 'Composing photorealistic scene…' },
];

const styles = [
  { icon: Camera, label: 'Photorealistic', active: true },
  { icon: Wand2, label: 'Artistic', active: false },
  { icon: Sparkles, label: 'Illustrative', active: false },
  { icon: Layers, label: 'Abstract', active: false },
];

const channels = ['Instagram Post', 'Email Header', 'LinkedIn', 'Billboard', 'Postcard'];

export default function ImageStudioShowcaseDemo() {
  const { ref, visible } = useInView(0.1);
  const [step, setStep] = useState(0);
  const shouldLoop = useShouldLoop();

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timers.push(setTimeout(() => setStep(1), 800));
      timers.push(setTimeout(() => setStep(2), 2200));
      timers.push(setTimeout(() => setStep(3), 3800));
      timers.push(setTimeout(() => setStep(4), 6400));
      timers.push(setTimeout(() => setStep(5), 8800));
      if (shouldLoop) timers.push(setTimeout(() => { setStep(0); run(); }, 12000));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [visible, shouldLoop]);

  return (
    <div ref={ref} className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <BrowserChrome title="CampusVoice — AI Image Studio">
        <div className="p-5 space-y-3">
          {/* Engine selector */}
          <div className="flex items-center gap-2">
            <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mr-1">Engine</p>
            <div className={`flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-all duration-300 ${step >= 1 ? 'border-border/60 text-muted-foreground' : 'border-border/40 text-muted-foreground/50'}`}>
              <Zap className="w-3 h-3" /> Fast
            </div>
            <div
              className={`flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-all duration-300 ${step >= 1 ? 'border-pink-400 text-pink-500' : 'border-border/40 text-muted-foreground/50'}`}
              style={step >= 1 ? { background: 'hsl(340 75% 55% / 0.1)' } : {}}
            >
              <Crown className="w-3 h-3" /> Premium
            </div>
          </div>

          {/* Style selector */}
          <div>
            <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">AI Style</p>
            <div className="flex gap-1.5">
              {styles.map((s) => (
                <div
                  key={s.label}
                  className={`flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded-lg border transition-all duration-300 ${
                    step >= 1 && s.active ? 'border-pink-400 text-pink-500' : 'border-border/40 text-muted-foreground/60'
                  }`}
                  style={step >= 1 && s.active ? { background: 'hsl(340 75% 55% / 0.1)' } : {}}
                >
                  <s.icon className="w-3 h-3" /> {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* Channel selector */}
          <div>
            <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Channel</p>
            <div className="flex gap-1.5 overflow-hidden">
              {channels.map((ch, i) => (
                <span
                  key={ch}
                  className={`text-[9px] font-medium px-2 py-1 rounded-full border whitespace-nowrap transition-all duration-300 ${
                    step >= 2 && i === 0 ? 'border-pink-400 text-pink-500' : 'border-border/50 text-muted-foreground/60'
                  }`}
                  style={step >= 2 && i === 0 ? { background: 'hsl(340 75% 55% / 0.1)' } : {}}
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>

          {/* Prompt bar */}
          {step >= 2 && (
            <div className="rounded-lg border border-border/60 px-3 py-2 flex items-center gap-2 transition-all duration-500" style={{ opacity: step >= 2 ? 1 : 0 }}>
              <span className="text-[10px] text-muted-foreground flex-1">A diverse group of students collaborating on a research project in a sunlit campus lab</span>
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            </div>
          )}

          {/* Main visual area */}
          <div className="rounded-xl border border-border/60 overflow-hidden relative" style={{ aspectRatio: '16/10', maxHeight: '300px' }}>
            {step < 3 && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3" style={{ background: 'hsl(222 47% 14% / 0.03)' }}>
                {step >= 2 ? (
                  <button className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all" style={{ background: 'hsl(340 75% 55% / 0.15)', color: 'hsl(340 75% 50%)', border: '1px solid hsl(340 75% 55% / 0.3)' }}>
                    <Sparkles className="w-3.5 h-3.5" /> Generate with Content DNA
                  </button>
                ) : (
                  <>
                    <Image className="w-10 h-10 text-muted-foreground/20" />
                    <span className="text-[10px] text-muted-foreground/40">Choose style & channel to begin</span>
                  </>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="w-full h-full flex flex-col items-center justify-center p-5" style={{ background: 'linear-gradient(135deg, hsl(222 47% 13%), hsl(222 47% 16%))' }}>
                <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin mb-3" style={{ borderColor: 'hsl(340 75% 55%)', borderTopColor: 'transparent' }} />
                <p className="text-[10px] font-semibold text-white/80 mb-3">Generating with Premium Engine…</p>
                <div className="w-full max-w-[220px] space-y-1.5">
                  {processingSteps.map((ps, i) => (
                    <div key={i} className="flex items-center gap-2 transition-all duration-500" style={{ transitionDelay: `${i * 400}ms` }}>
                      {i < 4 ? (
                        <CheckCircle2 className="w-3 h-3 shrink-0 text-pink-400" />
                      ) : (
                        <Loader2 className="w-3 h-3 shrink-0 animate-spin text-pink-400/60" />
                      )}
                      <span className={`text-[8px] ${i < 4 ? 'text-white/60' : 'text-white/40'}`}>{ps.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-1.5 flex-wrap justify-center">
                  {['Tone: Warm', 'Formality: 7/10', 'Style: Photorealistic'].map((tag, i) => (
                    <span key={i} className="text-[7px] px-1.5 py-0.5 rounded-full border border-pink-400/30 text-pink-300" style={{ background: 'hsl(340 75% 55% / 0.08)' }}>{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {step >= 4 && (
              <div className="w-full h-full relative">
                <img src={showcaseImage} alt="AI-generated campus" className="w-full h-full object-cover transition-all duration-700" style={{ opacity: step >= 4 ? 1 : 0 }} />
                <div className="absolute top-2 right-2 text-[8px] font-medium px-1.5 py-0.5 rounded-full text-white/80" style={{ background: 'hsl(222 47% 14% / 0.7)', backdropFilter: 'blur(4px)' }}>
                  1:1 — 1080×1080
                </div>
                <div className="absolute top-2 left-2 text-[8px] font-medium px-1.5 py-0.5 rounded-full text-white/80 flex items-center gap-1" style={{ background: 'hsl(222 47% 14% / 0.7)', backdropFilter: 'blur(4px)' }}>
                  <Camera className="w-2.5 h-2.5" /> Photorealistic · Premium
                </div>
                {step >= 5 && (
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between transition-all duration-500">
                    <div className="flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded-full" style={{ background: 'hsl(340 75% 55% / 0.2)', color: 'hsl(340 75% 60%)', backdropFilter: 'blur(4px)' }}>
                      <CheckCircle2 className="w-3 h-3" /> Ready for Brand Studio
                    </div>
                    <div className="text-[9px] font-bold px-2 py-1 rounded-full" style={{ background: 'hsl(340 75% 55% / 0.2)', color: 'hsl(340 75% 60%)', backdropFilter: 'blur(4px)' }}>
                      Brand Score: 94
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mode row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: 'hsl(340 75% 55% / 0.15)', color: 'hsl(340 75% 50%)' }}>
                <Camera className="w-2.5 h-2.5" /> Photo
              </span>
              <span className="text-[9px] font-semibold px-2.5 py-1 rounded-full border border-border/50 text-muted-foreground flex items-center gap-1">
                <Palette className="w-2.5 h-2.5" /> Graphic Design
              </span>
              <span className="text-[9px] font-semibold px-2.5 py-1 rounded-full border border-border/50 text-muted-foreground flex items-center gap-1">
                <Layers className="w-2.5 h-2.5" /> Blank Canvas
              </span>
            </div>
            {step >= 5 && (
              <span className="text-[8px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'hsl(200 100% 50% / 0.12)', color: 'hsl(200 100% 45%)' }}>
                In Context ▸
              </span>
            )}
          </div>
        </div>
      </BrowserChrome>
    </div>
  );
}
