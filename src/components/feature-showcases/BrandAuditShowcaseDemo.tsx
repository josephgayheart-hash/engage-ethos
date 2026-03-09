import { useState, useEffect, useRef } from 'react';
import {
  BarChart, Shield, AlertTriangle, CheckCircle2, TrendingUp,
  Globe, Mail, FileText, Eye,
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

const dimensions = [
  { label: 'Voice Consistency', score: 87, color: 'hsl(142 76% 45%)' },
  { label: 'Brand Platform', score: 72, color: 'hsl(200 100% 50%)' },
  { label: 'Terminology', score: 64, color: 'hsl(45 93% 47%)' },
  { label: 'Audience Fit', score: 91, color: 'hsl(270 70% 60%)' },
];

const touchpoints = [
  { icon: Globe, name: 'Homepage', score: 92, status: 'pass' },
  { icon: Globe, name: 'Admissions Page', score: 85, status: 'pass' },
  { icon: Mail, name: 'Welcome Email', score: 78, status: 'warn' },
  { icon: FileText, name: 'Viewbook', score: 61, status: 'fail' },
  { icon: Eye, name: 'Instagram Posts', score: 88, status: 'pass' },
  { icon: Mail, name: 'Financial Aid Email', score: 55, status: 'fail' },
];

export default function BrandAuditShowcaseDemo() {
  const { ref, visible } = useInView(0.1);
  const [step, setStep] = useState(0);
  const shouldLoop = useShouldLoop();

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timers.push(setTimeout(() => setStep(1), 600));    // Overall score appears
      timers.push(setTimeout(() => setStep(2), 2000));   // Dimensions animate in
      timers.push(setTimeout(() => setStep(3), 4000));   // Touchpoints list
      timers.push(setTimeout(() => setStep(4), 6500));   // Issues summary
      if (shouldLoop) timers.push(setTimeout(() => { setStep(0); run(); }, 10000));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [visible, shouldLoop]);

  return (
    <div ref={ref} className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <BrowserChrome title="CampusVoice — Brand Audit Dashboard">
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-sm text-foreground">Brand Consistency Report</span>
            </div>
            <Badge variant="outline" className="text-[9px] h-5">Lakewood State University</Badge>
          </div>

          {/* Overall Score */}
          <div className="flex items-center gap-6">
            <div className={`text-center transition-all duration-700 ${step >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-amber-400 bg-amber-50 mb-1">
                <span className="text-2xl font-bold text-amber-600">{step >= 1 ? '78' : '—'}</span>
              </div>
              <p className="text-[9px] text-muted-foreground">Overall Score</p>
              <p className="text-[8px] text-muted-foreground">142 touchpoints</p>
            </div>

            {/* Dimension bars */}
            <div className="flex-1 space-y-2.5">
              {dimensions.map((dim, i) => (
                <div key={dim.label} className="flex items-center gap-3 transition-all duration-500" style={{ transitionDelay: `${i * 150}ms`, opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? 'translateX(0)' : 'translateX(-12px)' }}>
                  <span className="text-[9px] text-muted-foreground w-28 shrink-0">{dim.label}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="h-2 rounded-full transition-all duration-1000" style={{ width: step >= 2 ? `${dim.score}%` : '0%', background: dim.color, transitionDelay: `${i * 150 + 300}ms` }} />
                  </div>
                  <span className="text-[9px] font-semibold text-foreground w-7 text-right">{step >= 2 ? dim.score : '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Touchpoint list */}
          {step >= 3 && (
            <div className="rounded-lg border border-border/60 overflow-hidden transition-all duration-500" style={{ opacity: step >= 3 ? 1 : 0 }}>
              <div className="bg-muted/40 px-3 py-1.5 flex items-center justify-between border-b border-border/40">
                <span className="text-[9px] font-bold text-foreground">Touchpoints</span>
                <span className="text-[8px] text-muted-foreground">Score</span>
              </div>
              <div className="divide-y divide-border/30">
                {touchpoints.map((tp, i) => {
                  const statusColor = tp.status === 'pass' ? 'text-green-500' : tp.status === 'warn' ? 'text-amber-500' : 'text-red-500';
                  const StatusIcon = tp.status === 'pass' ? CheckCircle2 : tp.status === 'warn' ? AlertTriangle : AlertTriangle;
                  return (
                    <div
                      key={tp.name}
                      className="px-3 py-1.5 flex items-center gap-2 transition-all duration-400"
                      style={{ transitionDelay: `${i * 80}ms`, opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? 'translateY(0)' : 'translateY(4px)' }}
                    >
                      <tp.icon className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-[10px] text-foreground flex-1">{tp.name}</span>
                      <StatusIcon className={`w-3 h-3 ${statusColor}`} />
                      <span className={`text-[9px] font-semibold ${statusColor}`}>{tp.score}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Issues summary */}
          {step >= 4 && (
            <div className="grid grid-cols-3 gap-3 transition-all duration-500" style={{ opacity: step >= 4 ? 1 : 0 }}>
              {[
                { count: 12, label: 'Critical Issues', color: 'text-red-500', bg: 'bg-red-500/10' },
                { count: 28, label: 'Warnings', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { count: 102, label: 'Passing', color: 'text-green-500', bg: 'bg-green-500/10' },
              ].map((item, i) => (
                <div key={item.label} className={`text-center p-3 rounded-lg ${item.bg} transition-all duration-400`} style={{ transitionDelay: `${i * 100}ms` }}>
                  <p className={`text-xl font-bold ${item.color}`}>{item.count}</p>
                  <p className="text-[9px] text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </BrowserChrome>
    </div>
  );
}
