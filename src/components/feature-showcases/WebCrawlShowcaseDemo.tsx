import { useState, useEffect, useRef } from 'react';
import {
  Globe, Search, Dna, CheckCircle2, Sparkles, FileText,
  Loader2, Target, MessageCircle, LayoutGrid, Lightbulb, Shield,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

const crawlPages = [
  { url: '/about', words: 1240, status: 'done' },
  { url: '/admissions', words: 2180, status: 'done' },
  { url: '/academics', words: 1890, status: 'done' },
  { url: '/student-life', words: 1560, status: 'done' },
  { url: '/financial-aid', words: 2340, status: 'done' },
  { url: '/research', words: 980, status: 'processing' },
];

const extractionResults = [
  { icon: Target, label: 'Voice Patterns', value: 'Warm, authoritative, student-centric', color: 'text-blue-500' },
  { icon: FileText, label: 'Terminology', value: '34 preferred terms identified', color: 'text-green-500' },
  { icon: Shield, label: 'Brand Signals', value: 'Innovation, community, discovery', color: 'text-purple-500' },
  { icon: MessageCircle, label: 'Tone Markers', value: 'Conversational (admissions), formal (academic)', color: 'text-teal-500' },
  { icon: LayoutGrid, label: 'Page Structure', value: '6 content archetypes found', color: 'text-orange-500' },
  { icon: Lightbulb, label: 'Key Themes', value: 'Research excellence, career outcomes', color: 'text-amber-500' },
];

export default function WebCrawlShowcaseDemo() {
  const { ref, visible } = useInView(0.1);
  const [step, setStep] = useState(0);
  const shouldLoop = useShouldLoop();

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timers.push(setTimeout(() => setStep(1), 600));    // URL entered
      timers.push(setTimeout(() => setStep(2), 1800));   // Crawling animation
      timers.push(setTimeout(() => setStep(3), 4500));   // Pages discovered
      timers.push(setTimeout(() => setStep(4), 6500));   // Extraction results
      timers.push(setTimeout(() => setStep(5), 9000));   // DNA generated
      if (shouldLoop) timers.push(setTimeout(() => { setStep(0); run(); }, 12500));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [visible, shouldLoop]);

  return (
    <div ref={ref} className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <BrowserChrome title="CampusVoice — WebCrawl Intelligence">
        <div className="p-5 space-y-4">
          {/* URL input */}
          <div>
            <label className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block mb-1.5">Institution Website</label>
            <div className="flex gap-2">
              <div className={`flex-1 rounded-lg px-3 py-2 text-[11px] border transition-all duration-300 ${step >= 1 ? 'border-blue-400 text-foreground' : 'border-border/60 text-muted-foreground'}`} style={step >= 1 ? { background: 'hsl(200 100% 50% / 0.05)' } : {}}>
                {step >= 1 ? 'https://www.lakewoodstate.edu' : 'Enter your institution URL…'}
              </div>
              <button
                className={`flex items-center gap-1.5 text-[10px] font-semibold px-3 py-2 rounded-lg transition-all duration-300 ${step >= 1 ? 'text-white' : 'text-muted-foreground border border-border/60'}`}
                style={step >= 1 ? { background: 'hsl(200 100% 50%)' } : {}}
              >
                <Search className="w-3 h-3" /> Crawl
              </button>
            </div>
          </div>

          {/* Crawling progress */}
          {step >= 2 && step < 4 && (
            <div className="rounded-lg border border-border/60 p-3 space-y-2 transition-all duration-500" style={{ opacity: 1 }}>
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                <span className="text-[10px] font-semibold text-foreground">Crawling site…</span>
                <span className="text-[9px] text-muted-foreground ml-auto">{step >= 3 ? '47 pages found' : 'Discovering pages…'}</span>
              </div>
              {/* Page list */}
              <div className="space-y-1">
                {crawlPages.map((page, i) => {
                  const isVisible = step >= 3 || i < 3;
                  return (
                    <div
                      key={page.url}
                      className="flex items-center gap-2 text-[9px] transition-all duration-400"
                      style={{ transitionDelay: `${i * 100}ms`, opacity: isVisible ? 1 : 0 }}
                    >
                      {page.status === 'done' || step >= 3 ? (
                        <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                      ) : (
                        <Loader2 className="w-3 h-3 text-blue-400 animate-spin shrink-0" />
                      )}
                      <span className="text-muted-foreground font-mono">lakewoodstate.edu{page.url}</span>
                      <span className="ml-auto text-muted-foreground/60">{page.words} words</span>
                    </div>
                  );
                })}
              </div>
              {step >= 3 && (
                <div className="flex items-center gap-2 text-[9px] pt-1 border-t border-border/40">
                  <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />
                  <span className="text-muted-foreground">Extracting voice patterns from 12,400 words…</span>
                </div>
              )}
            </div>
          )}

          {/* Extraction results */}
          {step >= 4 && (
            <div className="rounded-lg border border-border/60 overflow-hidden transition-all duration-500" style={{ opacity: step >= 4 ? 1 : 0 }}>
              <div className="bg-muted/40 px-3 py-1.5 border-b border-border/40 flex items-center justify-between">
                <span className="text-[9px] font-bold text-foreground">Extraction Results</span>
                <span className="text-[8px] text-muted-foreground">47 pages · 12,400 words</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {extractionResults.map((result, i) => (
                  <div
                    key={result.label}
                    className="flex items-start gap-2 p-2 rounded-lg transition-all duration-400"
                    style={{
                      transitionDelay: `${i * 120}ms`,
                      opacity: step >= 4 ? 1 : 0,
                      transform: step >= 4 ? 'translateY(0)' : 'translateY(6px)',
                      background: 'hsl(200 100% 50% / 0.03)',
                    }}
                  >
                    <result.icon className={`w-3.5 h-3.5 ${result.color} shrink-0 mt-0.5`} />
                    <div>
                      <p className="text-[9px] font-semibold text-foreground">{result.label}</p>
                      <p className="text-[8px] text-muted-foreground leading-relaxed">{result.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DNA Generated */}
          {step >= 5 && (
            <div className="rounded-lg border-2 border-green-400/40 p-3 flex items-center gap-3 transition-all duration-500" style={{ background: 'hsl(142 76% 45% / 0.05)', opacity: step >= 5 ? 1 : 0 }}>
              <div className="p-2 rounded-lg bg-green-500/15">
                <Dna className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-foreground">Content DNA Generated Successfully</p>
                <p className="text-[8px] text-muted-foreground">Voice profile, terminology, and brand signals extracted from 47 pages</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          )}
        </div>
      </BrowserChrome>
    </div>
  );
}
