import { useState, useEffect, useRef } from 'react';
import { Image, Palette, Type, Wand2, Layers, Sparkles, CheckCircle2, MessageSquare, Send, Bot } from 'lucide-react';

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
   IMAGE STUDIO SHOWCASE
   ══════════════════════════════════════════════════════════════ */
export function ImageStudioShowcase() {
  const { ref, visible } = useInView(0.1);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timers.push(setTimeout(() => setStep(1), 1200));
      timers.push(setTimeout(() => setStep(2), 3000));
      timers.push(setTimeout(() => setStep(3), 5000));
      timers.push(setTimeout(() => { setStep(0); run(); }, 8000));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  const channels = ['Instagram Post', 'Email Header', 'LinkedIn', 'Billboard', 'Postcard'];

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
            Generate on-brand visuals for any format — social, print, digital, and web. Toggle between Photo and Graphic Design modes, then preview in realistic device mockups.
          </p>
          <div className="space-y-3">
            {[
              { icon: Wand2, text: 'AI-powered generation from your brand palette' },
              { icon: Layers, text: 'Photo mode, Graphic Design mode, or Blank Canvas' },
              { icon: Image, text: 'In-context mockups: phones, browsers, postcards' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                <f.icon className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(82 85% 45%)' }} />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <BrowserChrome title="CampusVoice — Image Studio">
          <div className="p-5">
            {/* Channel selector */}
            <div className="flex gap-2 mb-4 overflow-hidden">
              {channels.map((ch, i) => (
                <span
                  key={ch}
                  className={`text-[10px] font-medium px-2.5 py-1 rounded-full border whitespace-nowrap transition-all duration-300 ${
                    step >= 1 && i === 0
                      ? 'border-[hsl(82_85%_55%)] text-[hsl(82_85%_45%)]'
                      : 'border-border/60 text-muted-foreground'
                  }`}
                  style={step >= 1 && i === 0 ? { background: 'hsl(82 85% 55% / 0.1)' } : {}}
                >
                  {ch}
                </span>
              ))}
            </div>

            {/* Generation area */}
            <div className="rounded-xl border border-border/60 overflow-hidden" style={{ aspectRatio: '1/1', maxHeight: '280px' }}>
              {step < 2 ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3" style={{ background: 'hsl(222 47% 14% / 0.03)' }}>
                  {step >= 1 ? (
                    <>
                      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(82 85% 55%)', borderTopColor: 'transparent' }} />
                      <span className="text-xs text-muted-foreground">Generating visual…</span>
                    </>
                  ) : (
                    <>
                      <Image className="w-10 h-10 text-muted-foreground/30" />
                      <span className="text-xs text-muted-foreground/50">Select a channel to begin</span>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-full relative" style={{ background: 'linear-gradient(135deg, hsl(222 47% 16%), hsl(270 40% 20%), hsl(222 47% 14%))' }}>
                  {/* Simulated campus image with brand overlay shapes */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full blur-[40px]" style={{ background: 'hsl(82 85% 55% / 0.3)' }} />
                  </div>
                  <div className="absolute top-6 left-6 w-20 h-20 rounded-2xl" style={{ background: 'hsl(200 100% 50% / 0.2)', backdropFilter: 'blur(8px)' }} />
                  <div className="absolute bottom-6 right-6 w-16 h-24 rounded-xl" style={{ background: 'hsl(270 70% 60% / 0.25)', backdropFilter: 'blur(8px)' }} />
                  {/* Aspect ratio label */}
                  <div className="absolute top-3 right-3 text-[9px] font-medium px-2 py-0.5 rounded-full text-white/70" style={{ background: 'hsl(222 47% 14% / 0.6)' }}>
                    1:1 — 1080×1080
                  </div>
                  {step >= 3 && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: 'hsl(82 85% 55% / 0.2)', color: 'hsl(82 85% 55%)' }}>
                      <CheckCircle2 className="w-3 h-3" /> Ready for Brand Studio
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-[10px] font-semibold px-3 py-1 rounded-full" style={{ background: 'hsl(270 70% 60% / 0.15)', color: 'hsl(270 70% 55%)' }}>📷 Photo</span>
              <span className="text-[10px] font-semibold px-3 py-1 rounded-full border border-border/60 text-muted-foreground">🎨 Graphic Design</span>
              <span className="text-[10px] font-semibold px-3 py-1 rounded-full border border-border/60 text-muted-foreground">📐 Blank Canvas</span>
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
