import { useState, useEffect, useRef } from 'react';
import { Image, Palette, Type, Wand2, Layers, Sparkles, CheckCircle2, MessageSquare, Send, Bot, PenTool, Users, Mail, Smartphone, Share2, Target, Map, Clock, ArrowRight, GitBranch, BarChart3, Zap, Crown, Camera, Paintbrush, Dna, Building2, BookOpen, Loader2 } from 'lucide-react';
import showcaseCampusImage from '@/assets/showcase-campus-image.jpg';

/* ─── Intersection Observer hook ─── */
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

/* ─── Browser Chrome wrapper ─── */
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

/* ══════════════════════════════════════════════════════════════
   MESSAGE BUILDER SHOWCASE
   ══════════════════════════════════════════════════════════════ */
export function MessageBuilderShowcase() {
  const { ref, visible } = useInView(0.1);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timers.push(setTimeout(() => setStep(1), 800));
      timers.push(setTimeout(() => setStep(2), 2000));
      timers.push(setTimeout(() => setStep(3), 3500));
      timers.push(setTimeout(() => setStep(4), 5200));
      timers.push(setTimeout(() => setStep(5), 7000));
      timers.push(setTimeout(() => { setStep(0); run(); }, 10000));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  const audiences = ['Prospective Students', 'Admitted Students', 'Current Students', 'Alumni', 'Donors'];
  const channels = [
    { icon: Mail, label: 'Email' },
    { icon: Smartphone, label: 'SMS' },
    { icon: Share2, label: 'Social' },
    { icon: Send, label: 'Direct Mail' },
  ];

  return (
    <div ref={ref} className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-4" style={{ background: 'hsl(173 58% 39% / 0.15)', color: 'hsl(173 58% 39%)' }}>
            <PenTool className="w-3.5 h-3.5" /> Message Builder
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight mb-4">
            Audience first.<br />Brand always.
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Select your audience, pick channels, set the moment — and let AI generate on-brand messaging grounded in your Content DNA, brand pillars, and institutional facts.
          </p>
          <div className="space-y-3">
            {[
              { icon: Users, text: '12 audience segments with cohort-level targeting' },
              { icon: Target, text: 'Goal-driven: awareness, yield, engagement, retention' },
              { icon: Sparkles, text: 'AI generates multi-channel drafts in seconds' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                <f.icon className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(173 58% 39%)' }} />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <BrowserChrome title="CampusVoice — Message Builder">
          <div className="p-5 space-y-4">
            {/* Step indicators */}
            <div className="flex items-center gap-2">
              {['Audience', 'Channel', 'Context', 'Generate'].map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-500 ${
                      step > i + 1 ? 'text-white' : step === i + 1 ? 'text-white' : 'text-muted-foreground border border-border/60'
                    }`}
                    style={
                      step > i + 1
                        ? { background: 'hsl(173 58% 39%)' }
                        : step === i + 1
                        ? { background: 'hsl(173 58% 39% / 0.7)' }
                        : {}
                    }
                  >
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className={`text-[9px] font-medium ${step >= i + 1 ? 'text-foreground' : 'text-muted-foreground/50'}`}>{s}</span>
                  {i < 3 && <div className="w-4 h-px bg-border/40" />}
                </div>
              ))}
            </div>

            {/* Audience selector */}
            <div>
              <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-2">Audience</p>
              <div className="flex flex-wrap gap-1.5">
                {audiences.map((a, i) => (
                  <span
                    key={a}
                    className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all duration-300 ${
                      step >= 1 && i === 1
                        ? 'border-[hsl(173_58%_39%)] text-[hsl(173_58%_39%)]'
                        : 'border-border/60 text-muted-foreground'
                    }`}
                    style={step >= 1 && i === 1 ? { background: 'hsl(173 58% 39% / 0.1)' } : {}}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Channel selector */}
            <div>
              <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-2">Channels</p>
              <div className="flex gap-2">
                {channels.map((ch, i) => (
                  <div
                    key={ch.label}
                    className={`flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 rounded-lg border transition-all duration-300 ${
                      step >= 2 && (i === 0 || i === 1)
                        ? 'border-[hsl(173_58%_39%)] text-[hsl(173_58%_39%)]'
                        : 'border-border/60 text-muted-foreground'
                    }`}
                    style={step >= 2 && (i === 0 || i === 1) ? { background: 'hsl(173 58% 39% / 0.1)' } : {}}
                  >
                    <ch.icon className="w-3 h-3" />
                    {ch.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Context row */}
            {step >= 3 && (
              <div className="flex gap-3 transition-all duration-500" style={{ opacity: step >= 3 ? 1 : 0 }}>
                <div className="flex-1 rounded-lg border border-border/60 px-3 py-2">
                  <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Goal</p>
                  <p className="text-[10px] font-medium text-foreground">Yield — Convert admits</p>
                </div>
                <div className="flex-1 rounded-lg border border-border/60 px-3 py-2">
                  <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Moment</p>
                  <p className="text-[10px] font-medium text-foreground">Post-Admit Welcome</p>
                </div>
              </div>
            )}

            {/* Generation result */}
            {step >= 4 && (
              <div className="rounded-xl border border-border/60 p-3 transition-all duration-500" style={{ opacity: step >= 4 ? 1 : 0, background: 'hsl(173 58% 39% / 0.03)' }}>
                {step === 4 ? (
                  <div className="flex items-center justify-center gap-2 py-6">
                    <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(173 58% 39%)', borderTopColor: 'transparent' }} />
                    <span className="text-xs text-muted-foreground">Generating with Content DNA…</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-foreground">📧 Email Draft</span>
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'hsl(82 85% 55% / 0.15)', color: 'hsl(82 85% 45%)' }}>Brand Score: 91</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Subject:</span> Your Next Chapter Begins — Welcome to [University]
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                      Dear [First Name], We're thrilled you've chosen to join our community of scholars and changemakers. Your journey of discovery starts now…
                    </p>
                    <div className="flex gap-2 pt-1">
                      <span className="text-[9px] px-2 py-0.5 rounded-full border border-border/60 text-muted-foreground">📱 SMS Draft</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full border border-border/60 text-muted-foreground">+ 1 more</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </BrowserChrome>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   JOURNEY BUILDER SHOWCASE
   ══════════════════════════════════════════════════════════════ */
export function JourneyBuilderShowcase() {
  const { ref, visible } = useInView(0.1);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timers.push(setTimeout(() => setStep(1), 600));
      timers.push(setTimeout(() => setStep(2), 1800));
      timers.push(setTimeout(() => setStep(3), 3200));
      timers.push(setTimeout(() => setStep(4), 4800));
      timers.push(setTimeout(() => setStep(5), 6200));
      timers.push(setTimeout(() => setStep(6), 8000));
      timers.push(setTimeout(() => { setStep(0); run(); }, 11500));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  const audiences = ['Prospective', 'Admitted', 'First-Year', 'Alumni', 'Donors'];
  const channels = [
    { icon: Mail, label: 'Email', selected: true },
    { icon: Smartphone, label: 'SMS', selected: true },
    { icon: Share2, label: 'Social', selected: false },
    { icon: Send, label: 'Direct Mail', selected: true },
  ];

  // ReactFlow-style touchpoint nodes for the diagram
  const flowNodes = [
    { week: 1, channel: 'Email', title: 'Welcome & Intro', color: 'hsl(200 100% 50%)' },
    { week: 2, channel: 'SMS', title: 'Campus Visit Nudge', color: 'hsl(82 85% 55%)' },
    { week: 3, channel: 'Email', title: 'Program Deep-Dive', color: 'hsl(200 100% 50%)' },
    { week: 4, channel: 'Direct Mail', title: 'Viewbook + Letter', color: 'hsl(270 70% 60%)' },
    { week: 5, channel: 'Email', title: 'Financial Aid Guide', color: 'hsl(200 100% 50%)' },
    { week: 6, channel: 'SMS', title: 'Deadline Reminder', color: 'hsl(82 85% 55%)' },
    { week: 8, channel: 'Email', title: 'Student Story', color: 'hsl(200 100% 50%)' },
    { week: 10, channel: 'Email', title: 'Decision Day CTA', color: 'hsl(200 100% 50%)' },
    { week: 12, channel: 'SMS', title: 'Final Deposit Nudge', color: 'hsl(82 85% 55%)' },
  ];

  return (
    <div ref={ref} className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <BrowserChrome title="CampusVoice — Journey Builder">
          <div className="p-5 space-y-3">
            {/* Step 1-2: Filters row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Audience</p>
                <div className="flex flex-wrap gap-1">
                  {audiences.map((a, i) => (
                    <span
                      key={a}
                      className={`text-[9px] font-medium px-2 py-0.5 rounded-full border transition-all duration-400 ${
                        step >= 1 && i === 1
                          ? 'border-[hsl(45_93%_47%)] text-[hsl(45_93%_42%)]'
                          : 'border-border/50 text-muted-foreground/60'
                      }`}
                      style={step >= 1 && i === 1 ? { background: 'hsl(45 93% 47% / 0.1)' } : {}}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Moment</p>
                <div className={`text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-all duration-400 ${
                  step >= 1 ? 'border-[hsl(45_93%_47%)] text-[hsl(45_93%_42%)]' : 'border-border/50 text-muted-foreground/60'
                }`} style={step >= 1 ? { background: 'hsl(45 93% 47% / 0.08)' } : {}}>
                  {step >= 1 ? 'Post-Admit Yield' : 'Select moment…'}
                </div>
              </div>
            </div>

            {/* Step 2: Channels */}
            {step >= 2 && (
              <div className="transition-all duration-500" style={{ opacity: step >= 2 ? 1 : 0 }}>
                <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Channels</p>
                <div className="flex gap-1.5">
                  {channels.map((ch) => (
                    <div
                      key={ch.label}
                      className={`flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded-lg border transition-all ${
                        ch.selected
                          ? 'border-[hsl(45_93%_47%)] text-[hsl(45_93%_42%)]'
                          : 'border-border/40 text-muted-foreground/50'
                      }`}
                      style={ch.selected ? { background: 'hsl(45 93% 47% / 0.08)' } : {}}
                    >
                      <ch.icon className="w-2.5 h-2.5" />
                      {ch.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Cadence + Duration + Content DNA */}
            {step >= 3 && (
              <div className="flex gap-2 transition-all duration-500" style={{ opacity: step >= 3 ? 1 : 0 }}>
                <div className="flex-1 rounded-lg border border-border/50 px-2.5 py-1.5">
                  <p className="text-[8px] uppercase tracking-wider font-bold text-muted-foreground">Duration</p>
                  <p className="text-[10px] font-semibold text-foreground">12 weeks</p>
                </div>
                <div className="flex-1 rounded-lg border border-border/50 px-2.5 py-1.5">
                  <p className="text-[8px] uppercase tracking-wider font-bold text-muted-foreground">Cadence</p>
                  <p className="text-[10px] font-semibold text-foreground">2× / week</p>
                </div>
                <div className="flex-1 rounded-lg border px-2.5 py-1.5" style={{ borderColor: 'hsl(82 85% 55% / 0.4)', background: 'hsl(82 85% 55% / 0.05)' }}>
                  <p className="text-[8px] uppercase tracking-wider font-bold" style={{ color: 'hsl(82 85% 45%)' }}>Content DNA</p>
                  <p className="text-[10px] font-semibold" style={{ color: 'hsl(82 85% 40%)' }}>✓ Active</p>
                </div>
              </div>
            )}

            {/* Step 4: Generating overlay */}
            {step === 4 && (
              <div className="flex items-center justify-center gap-2 py-4 rounded-xl border border-border/50" style={{ background: 'hsl(45 93% 47% / 0.03)' }}>
                <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(45 93% 47%)', borderTopColor: 'transparent' }} />
                <span className="text-xs text-muted-foreground">Mapping journey with Brand DNA…</span>
              </div>
            )}

            {/* Step 5-6: ReactFlow-style diagram */}
            {step >= 5 && (
              <div className="rounded-xl border border-border/60 overflow-hidden transition-all duration-600" style={{ opacity: step >= 5 ? 1 : 0, background: 'hsl(222 47% 11% / 0.02)' }}>
                {/* Diagram toolbar */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40" style={{ background: 'hsl(222 47% 14% / 0.04)' }}>
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[9px] font-bold text-foreground">Flow Diagram</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: 'hsl(82 85% 55% / 0.15)', color: 'hsl(82 85% 45%)' }}>9 touchpoints</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: 'hsl(270 70% 60% / 0.15)', color: 'hsl(270 70% 55%)' }}>3 phases</span>
                  </div>
                </div>

                {/* Phase headers */}
                <div className="px-3 pt-2 pb-1 flex gap-2">
                  {[
                    { name: 'Phase 1 — Engage', color: 'hsl(200 100% 50%)', weeks: 'Wk 1–4' },
                    { name: 'Phase 2 — Deepen', color: 'hsl(270 70% 60%)', weeks: 'Wk 5–8' },
                    { name: 'Phase 3 — Convert', color: 'hsl(82 85% 55%)', weeks: 'Wk 9–12' },
                  ].map((phase, i) => (
                    <div
                      key={phase.name}
                      className="flex-1 rounded-md px-2 py-1 text-center transition-all duration-500"
                      style={{
                        background: `${phase.color}15`,
                        borderLeft: `2px solid ${phase.color}`,
                        opacity: step >= 5 ? 1 : 0,
                        transitionDelay: `${i * 120}ms`,
                      }}
                    >
                      <p className="text-[8px] font-bold" style={{ color: phase.color }}>{phase.name}</p>
                      <p className="text-[7px] text-muted-foreground">{phase.weeks}</p>
                    </div>
                  ))}
                </div>

                {/* Touchpoint flow nodes */}
                <div className="px-3 py-2 overflow-hidden">
                  <div className="flex flex-wrap gap-x-1 gap-y-1.5 items-center">
                    {flowNodes.map((node, i) => {
                      const nodeVisible = step >= 6 || (step >= 5 && i < 5);
                      return (
                        <div key={i} className="flex items-center gap-1">
                          <div
                            className="rounded-md border px-2 py-1 transition-all duration-400"
                            style={{
                              borderColor: `${node.color}50`,
                              background: `${node.color}08`,
                              opacity: nodeVisible ? 1 : 0,
                              transform: nodeVisible ? 'scale(1)' : 'scale(0.8)',
                              transitionDelay: `${i * 80}ms`,
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: node.color }} />
                              <span className="text-[7px] font-bold text-muted-foreground">W{node.week}</span>
                            </div>
                            <p className="text-[7px] font-medium text-foreground whitespace-nowrap">{node.title}</p>
                            <p className="text-[6px] text-muted-foreground">{node.channel}</p>
                          </div>
                          {i < flowNodes.length - 1 && (
                            <ArrowRight className="w-2 h-2 text-muted-foreground/30 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Brand DNA footer */}
                {step >= 6 && (
                  <div className="px-3 py-1.5 border-t border-border/30 flex items-center justify-between" style={{ background: 'hsl(82 85% 55% / 0.03)' }}>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" style={{ color: 'hsl(82 85% 45%)' }} />
                      <span className="text-[8px] text-muted-foreground">Generated from <span className="font-semibold" style={{ color: 'hsl(82 85% 40%)' }}>Content DNA</span></span>
                    </div>
                    <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'hsl(82 85% 55% / 0.15)', color: 'hsl(82 85% 45%)' }}>
                      Brand Score: 93
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </BrowserChrome>

        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-4" style={{ background: 'hsl(45 93% 47% / 0.15)', color: 'hsl(45 93% 42%)' }}>
            <Map className="w-3.5 h-3.5" /> Journey Builder
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight mb-4">
            Map the journey.<br />Own the timeline.
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Select your audience, moment, and channels — then watch AI generate a full multi-phase communication flow grounded in your Content DNA. Every touchpoint is on-brand, on-schedule, and exportable.
          </p>
          <div className="space-y-3">
            {[
              { icon: Map, text: 'Interactive ReactFlow diagram with phase headers & touchpoint nodes' },
              { icon: Sparkles, text: 'Every message generated from your Content DNA & brand pillars' },
              { icon: BarChart3, text: 'Cadence, escalation & duration controls for precise timing' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                <f.icon className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(45 93% 42%)' }} />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
/* ══════════════════════════════════════════════════════════════
   IMAGE STUDIO SHOWCASE
   ══════════════════════════════════════════════════════════════ */
export function ImageStudioShowcase() {
  const { ref, visible } = useInView(0.1);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timers.push(setTimeout(() => setStep(1), 800));   // Select style + engine
      timers.push(setTimeout(() => setStep(2), 2200));   // Select channel
      timers.push(setTimeout(() => setStep(3), 3600));   // Processing screen
      timers.push(setTimeout(() => setStep(4), 6200));   // Image reveals
      timers.push(setTimeout(() => setStep(5), 8500));   // Mockup + brand score
      timers.push(setTimeout(() => { setStep(0); run(); }, 12000));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  const styles = [
    { emoji: '📷', label: 'Photorealistic', active: true },
    { emoji: '🎨', label: 'Artistic', active: false },
    { emoji: '✏️', label: 'Illustrative', active: false },
    { emoji: '🖼️', label: 'Abstract', active: false },
  ];

  const channels = ['Instagram Post', 'Email Header', 'LinkedIn', 'Billboard', 'Postcard'];

  const processingSteps = [
    { icon: Building2, label: 'Loading institutional profile…', delay: 0 },
    { icon: Dna, label: 'Analyzing Content DNA…', delay: 400 },
    { icon: Palette, label: 'Applying brand colors & palette…', delay: 800 },
    { icon: BookOpen, label: 'Referencing fact book & stories…', delay: 1200 },
    { icon: Camera, label: 'Composing photorealistic scene…', delay: 1600 },
  ];

  return (
    <div ref={ref} className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-4" style={{ background: 'hsl(82 85% 55% / 0.15)', color: 'hsl(82 85% 45%)' }}>
            <Image className="w-3.5 h-3.5" /> Image Studio
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight mb-4">
            19 channels.<br />One studio.
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Generate on-brand visuals for any format — social, print, digital, and web. Choose from AI image styles, toggle between Fast and Premium engines, and watch your Content DNA shape every pixel.
          </p>
          <div className="space-y-3">
            {[
              { icon: Wand2, text: '4 AI styles: Photorealistic, Artistic, Illustrative, Abstract' },
              { icon: Zap, text: 'Fast engine for speed or Premium engine for maximum quality' },
              { icon: Dna, text: 'Every image grounded in your Content DNA & brand palette' },
              { icon: Layers, text: 'Photo mode, Graphic Design mode, or Blank Canvas' },
              { icon: Image, text: 'In-context mockups: phones, browsers, postcards & more' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                <f.icon className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(82 85% 45%)' }} />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <BrowserChrome title="CampusVoice — Image Studio">
          <div className="p-5 space-y-3">
            {/* Engine selector */}
            <div className="flex items-center gap-2">
              <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mr-1">Engine</p>
              <div
                className={`flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-all duration-300 ${
                  step >= 1 ? 'border-border/60 text-muted-foreground' : 'border-border/40 text-muted-foreground/50'
                }`}
              >
                <Zap className="w-3 h-3" />
                Fast
              </div>
              <div
                className={`flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-all duration-300 ${
                  step >= 1 ? 'border-[hsl(270_70%_60%)] text-[hsl(270_70%_55%)]' : 'border-border/40 text-muted-foreground/50'
                }`}
                style={step >= 1 ? { background: 'hsl(270 70% 60% / 0.1)' } : {}}
              >
                <Crown className="w-3 h-3" />
                Premium
              </div>
            </div>

            {/* Style selector */}
            <div>
              <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">AI Style</p>
              <div className="flex gap-1.5">
                {styles.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded-lg border transition-all duration-300 ${
                      step >= 1 && s.active
                        ? 'border-[hsl(82_85%_55%)] text-[hsl(82_85%_45%)]'
                        : 'border-border/40 text-muted-foreground/60'
                    }`}
                    style={step >= 1 && s.active ? { background: 'hsl(82 85% 55% / 0.1)' } : {}}
                  >
                    <span>{s.emoji}</span>
                    {s.label}
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
                      step >= 2 && i === 0
                        ? 'border-[hsl(82_85%_55%)] text-[hsl(82_85%_45%)]'
                        : 'border-border/50 text-muted-foreground/60'
                    }`}
                    style={step >= 2 && i === 0 ? { background: 'hsl(82 85% 55% / 0.1)' } : {}}
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>

            {/* Main visual area */}
            <div className="rounded-xl border border-border/60 overflow-hidden relative" style={{ aspectRatio: '1/1', maxHeight: '260px' }}>
              {/* State 0-1: Empty placeholder */}
              {step < 3 && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3" style={{ background: 'hsl(222 47% 14% / 0.03)' }}>
                  {step >= 2 ? (
                    <button
                      className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                      style={{ background: 'hsl(82 85% 55% / 0.15)', color: 'hsl(82 85% 45%)', border: '1px solid hsl(82 85% 55% / 0.3)' }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate with Content DNA
                    </button>
                  ) : (
                    <>
                      <Image className="w-10 h-10 text-muted-foreground/20" />
                      <span className="text-[10px] text-muted-foreground/40">Choose style & channel to begin</span>
                    </>
                  )}
                </div>
              )}

              {/* State 3: Processing screen */}
              {step === 3 && (
                <div className="w-full h-full flex flex-col items-center justify-center p-5" style={{ background: 'linear-gradient(135deg, hsl(222 47% 13%), hsl(222 47% 16%))' }}>
                  <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin mb-3" style={{ borderColor: 'hsl(82 85% 55%)', borderTopColor: 'transparent' }} />
                  <p className="text-[10px] font-semibold text-white/80 mb-3">Generating with Premium Engine…</p>
                  <div className="w-full max-w-[200px] space-y-1.5">
                    {processingSteps.map((ps, i) => {
                      const elapsed = 2600; // show all as progressing
                      const isActive = true;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2 transition-all duration-500"
                          style={{
                            opacity: 1,
                            transform: 'translateX(0)',
                            transitionDelay: `${ps.delay}ms`,
                          }}
                        >
                          {i < 4 ? (
                            <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: 'hsl(82 85% 55%)' }} />
                          ) : (
                            <Loader2 className="w-3 h-3 shrink-0 animate-spin" style={{ color: 'hsl(82 85% 55% / 0.6)' }} />
                          )}
                          <span className={`text-[8px] ${i < 4 ? 'text-white/60' : 'text-white/40'}`}>{ps.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Brand DNA readback */}
                  <div className="mt-3 flex gap-1.5 flex-wrap justify-center">
                    {['Tone: Warm', 'Formality: 7/10', 'Slogan: "Where leaders begin"'].map((tag, i) => (
                      <span key={i} className="text-[7px] px-1.5 py-0.5 rounded-full border" style={{ borderColor: 'hsl(270 70% 60% / 0.3)', color: 'hsl(270 70% 65%)', background: 'hsl(270 70% 60% / 0.08)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* State 4-5: Generated image */}
              {step >= 4 && (
                <div className="w-full h-full relative">
                  <img
                    src={showcaseCampusImage}
                    alt="AI-generated university campus"
                    className="w-full h-full object-cover transition-all duration-700"
                    style={{ opacity: step >= 4 ? 1 : 0 }}
                  />
                  {/* Aspect ratio label */}
                  <div className="absolute top-2 right-2 text-[8px] font-medium px-1.5 py-0.5 rounded-full text-white/80" style={{ background: 'hsl(222 47% 14% / 0.7)', backdropFilter: 'blur(4px)' }}>
                    1:1 — 1080×1080
                  </div>
                  {/* Style badge */}
                  <div className="absolute top-2 left-2 text-[8px] font-medium px-1.5 py-0.5 rounded-full text-white/80 flex items-center gap-1" style={{ background: 'hsl(222 47% 14% / 0.7)', backdropFilter: 'blur(4px)' }}>
                    📷 Photorealistic · Premium
                  </div>
                  {/* Brand score + ready badge */}
                  {step >= 5 && (
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded-full" style={{ background: 'hsl(82 85% 55% / 0.2)', color: 'hsl(82 85% 55%)', backdropFilter: 'blur(4px)' }}>
                        <CheckCircle2 className="w-3 h-3" /> Ready for Brand Studio
                      </div>
                      <div className="text-[9px] font-bold px-2 py-1 rounded-full" style={{ background: 'hsl(82 85% 55% / 0.2)', color: 'hsl(82 85% 55%)', backdropFilter: 'blur(4px)' }}>
                        Brand Score: 94
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mode toggle + In Context */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'hsl(270 70% 60% / 0.15)', color: 'hsl(270 70% 55%)' }}>📷 Photo</span>
                <span className="text-[9px] font-semibold px-2.5 py-1 rounded-full border border-border/50 text-muted-foreground">🎨 Graphic Design</span>
                <span className="text-[9px] font-semibold px-2.5 py-1 rounded-full border border-border/50 text-muted-foreground">📐 Blank Canvas</span>
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
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BRAND STUDIO SHOWCASE
   ══════════════════════════════════════════════════════════════ */
export function BrandStudioShowcase() {
  const { ref, visible } = useInView(0.1);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timers.push(setTimeout(() => setStep(1), 1000));
      timers.push(setTimeout(() => setStep(2), 2500));
      timers.push(setTimeout(() => setStep(3), 4500));
      timers.push(setTimeout(() => { setStep(0); run(); }, 7500));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  const logoVariants = ['Primary', 'Secondary', 'Athletic', 'Presidential'];

  return (
    <div ref={ref} className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <BrowserChrome title="CampusVoice — Brand Studio">
          <div className="p-5 flex gap-4">
            {/* Controls sidebar */}
            <div className="w-36 flex-shrink-0 space-y-3">
              <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Logo Variant</p>
              <div className="space-y-1.5">
                {logoVariants.map((v, i) => (
                  <div
                    key={v}
                    className={`text-[10px] font-medium px-2 py-1.5 rounded-lg border transition-all duration-300 cursor-default ${
                      step >= 1 && i === 0
                        ? 'border-[hsl(270_70%_60%)] text-[hsl(270_70%_55%)]'
                        : 'border-border/40 text-muted-foreground'
                    }`}
                    style={step >= 1 && i === 0 ? { background: 'hsl(270 70% 60% / 0.1)' } : {}}
                  >
                    {v}
                  </div>
                ))}
              </div>

              <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground pt-2">Overlay</p>
              <div className="grid grid-cols-3 gap-1">
                {['Plain', 'Gradient', 'Geo'].map((o, i) => (
                  <div
                    key={o}
                    className={`text-[9px] text-center py-1 rounded border transition-all ${
                      step >= 2 && i === 1 ? 'border-[hsl(200_100%_50%)] text-[hsl(200_100%_45%)]' : 'border-border/40 text-muted-foreground'
                    }`}
                    style={step >= 2 && i === 1 ? { background: 'hsl(200 100% 50% / 0.1)' } : {}}
                  >
                    {o}
                  </div>
                ))}
              </div>

              <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground pt-2">Brand Colors</p>
              <div className="flex gap-1.5">
                {['hsl(222 47% 14%)', 'hsl(45 93% 47%)', 'hsl(173 58% 39%)', 'hsl(0 0% 100%)'].map((c, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${step >= 2 ? 'border-border' : 'border-border/40'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>

              <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground pt-2">Font</p>
              <div className="text-[10px] text-muted-foreground border border-border/40 rounded px-2 py-1">
                Libre Baskerville
              </div>
            </div>

            {/* Canvas preview */}
            <div className="flex-1 rounded-xl border border-border/60 overflow-hidden relative" style={{ aspectRatio: '1/1', maxHeight: '300px', background: 'linear-gradient(135deg, hsl(222 47% 16%), hsl(270 40% 20%))' }}>
              {/* Abstract generated image bg */}
              <div className="absolute inset-0">
                <div className="absolute w-24 h-24 rounded-full blur-[30px]" style={{ background: 'hsl(82 85% 55% / 0.25)', top: '20%', right: '15%' }} />
                <div className="absolute w-20 h-20 rounded-full blur-[25px]" style={{ background: 'hsl(200 100% 50% / 0.2)', bottom: '25%', left: '10%' }} />
              </div>

              {/* Gradient overlay */}
              {step >= 2 && (
                <div className="absolute inset-0 transition-opacity duration-700" style={{ background: 'linear-gradient(to top, hsl(222 47% 14% / 0.8), transparent 60%)', opacity: step >= 2 ? 1 : 0 }} />
              )}

              {/* Logo placement */}
              {step >= 1 && (
                <div className="absolute bottom-12 right-4 transition-all duration-500" style={{ opacity: step >= 1 ? 1 : 0 }}>
                  <div className="w-14 h-14 rounded-xl border-2 border-dashed border-white/30 flex items-center justify-center">
                    <span className="text-[8px] text-white/50 font-bold">LOGO</span>
                  </div>
                </div>
              )}

              {/* Headline text */}
              {step >= 3 && (
                <div className="absolute bottom-4 left-4 right-20 transition-all duration-500">
                  <p className="text-white font-serif text-sm font-bold leading-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                    Your Future Starts Here
                  </p>
                  <div className="mt-1.5 text-[9px] font-medium px-2 py-0.5 rounded w-fit" style={{ background: 'hsl(82 85% 55%)', color: 'hsl(222 47% 14%)' }}>
                    Apply Now →
                  </div>
                </div>
              )}
            </div>
          </div>
        </BrowserChrome>

        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-4" style={{ background: 'hsl(270 70% 60% / 0.15)', color: 'hsl(270 70% 55%)' }}>
            <Palette className="w-3.5 h-3.5" /> Brand Studio
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight mb-4">
            Brand it.<br />Own it.
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Add your logo, headlines, CTA buttons, and overlays to any generated image. Choose from 24 overlay patterns, 12 fonts, and your institutional color palette — all synced automatically.
          </p>
          <div className="space-y-3">
            {[
              { icon: Palette, text: '4 logo variants: Primary, Secondary, Athletic, Presidential' },
              { icon: Type, text: 'Typography controls with rich text formatting' },
              { icon: Layers, text: '24 overlay patterns: gradients, geometric, patterns' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                <f.icon className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(270 70% 55%)' }} />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   AI COPYWRITER SHOWCASE
   ══════════════════════════════════════════════════════════════ */
export function AICopywriterShowcase() {
  const { ref, visible } = useInView(0.1);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timers.push(setTimeout(() => setStep(1), 800));
      timers.push(setTimeout(() => setStep(2), 2200));
      timers.push(setTimeout(() => setStep(3), 3800));
      timers.push(setTimeout(() => setStep(4), 5500));
      timers.push(setTimeout(() => { setStep(0); run(); }, 8500));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  return (
    <div ref={ref} className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-4" style={{ background: 'hsl(200 100% 50% / 0.15)', color: 'hsl(200 100% 45%)' }}>
            <MessageSquare className="w-3.5 h-3.5" /> AI Copywriter
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight mb-4">
            Chat with your<br />brand voice.
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            A conversational AI assistant that knows your Content DNA, brand pillars, and institutional voice. Ask it to draft, refine, or evaluate any message — it stays on-brand every time.
          </p>
          <div className="space-y-3">
            {[
              { icon: Bot, text: 'Grounded in your Content DNA and brand platform' },
              { icon: Sparkles, text: 'Draft emails, social posts, talking points instantly' },
              { icon: MessageSquare, text: 'Full conversation history with context persistence' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                <f.icon className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(200 100% 45%)' }} />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <BrowserChrome title="CampusVoice — AI Copywriter">
          <div className="p-5 flex flex-col" style={{ minHeight: '340px' }}>
            {/* Chat messages */}
            <div className="flex-1 space-y-4">
              {/* User message */}
              {step >= 1 && (
                <div className="flex justify-end transition-all duration-500" style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? 'translateY(0)' : 'translateY(8px)' }}>
                  <div className="rounded-2xl rounded-br-md px-4 py-2.5 max-w-[75%] text-xs text-white" style={{ background: 'hsl(222 47% 18%)' }}>
                    Write a welcome email for admitted students that highlights our research opportunities
                  </div>
                </div>
              )}

              {/* AI typing indicator */}
              {step === 2 && (
                <div className="flex items-start gap-2 transition-all duration-300">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'hsl(200 100% 50% / 0.15)' }}>
                    <Bot className="w-3.5 h-3.5" style={{ color: 'hsl(200 100% 45%)' }} />
                  </div>
                  <div className="flex gap-1 pt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {/* AI response */}
              {step >= 3 && (
                <div className="flex items-start gap-2 transition-all duration-500" style={{ opacity: step >= 3 ? 1 : 0 }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'hsl(200 100% 50% / 0.15)' }}>
                    <Bot className="w-3.5 h-3.5" style={{ color: 'hsl(200 100% 45%)' }} />
                  </div>
                  <div className="flex-1 text-xs text-foreground leading-relaxed">
                    <p className="font-semibold mb-1">Subject: Your Research Journey Starts Now</p>
                    <p className="text-muted-foreground mb-2">Dear [First Name],</p>
                    <p className="text-muted-foreground">Congratulations on your admission! As you begin this next chapter, we want you to know that <span className="text-foreground font-medium">undergraduate research isn't just an opportunity here — it's a tradition.</span> From day one, you'll have access to…</p>
                    {step >= 4 && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'hsl(82 85% 55% / 0.15)', color: 'hsl(82 85% 45%)' }}>
                          ✓ On-brand
                        </span>
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'hsl(270 70% 60% / 0.15)', color: 'hsl(270 70% 55%)' }}>
                          Brand Score: 94
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2" style={{ background: 'hsl(222 47% 14% / 0.03)' }}>
              <span className="flex-1 text-[11px] text-muted-foreground/50">Ask CampusVoice anything…</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'hsl(200 100% 50% / 0.15)' }}>
                <Send className="w-3.5 h-3.5" style={{ color: 'hsl(200 100% 45%)' }} />
              </div>
            </div>
          </div>
        </BrowserChrome>
      </div>
    </div>
  );
}
