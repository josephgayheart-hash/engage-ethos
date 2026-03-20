import { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Smartphone,
  Share2,
  Send,
  Sparkles,
  ArrowRight,
  BarChart3,
  Shield,
  Globe,
  Layers,
  CheckCircle2,
  Eye,
  Building2,
  Factory,
  Users,
  Target,
  Palette,
  Dna,
  Map,
  GitBranch,
} from 'lucide-react';

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

function useShouldLoop() {
  const [s, setS] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)');
    const u = () => setS(!mq.matches);
    u();
    mq.addEventListener('change', u);
    return () => mq.removeEventListener('change', u);
  }, []);
  return s;
}

/* ─── Browser Chrome ─── */
function BrowserChrome({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl shadow-2xl border border-primary-foreground/10 overflow-hidden bg-primary-foreground/[0.04]">
      <div className="px-5 py-3 flex items-center gap-3 bg-primary-foreground/[0.06]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/60" />
          <div className="w-3 h-3 rounded-full bg-amber-400/60" />
          <div className="w-3 h-3 rounded-full bg-green-400/60" />
        </div>
        <span className="text-primary-foreground/40 text-xs ml-2">{title}</span>
      </div>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SHOWCASE 1 — Brand Command Center (Dashboard)
   Reframes: Brand Audit / Adherence Dashboard for enterprise
   ══════════════════════════════════════════════════════════════ */
function BrandCommandShowcase() {
  const { ref, visible } = useInView(0.1);
  const [step, setStep] = useState(0);
  const shouldLoop = useShouldLoop();

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timers.push(setTimeout(() => setStep(1), 600));
      timers.push(setTimeout(() => setStep(2), 1800));
      timers.push(setTimeout(() => setStep(3), 3200));
      timers.push(setTimeout(() => setStep(4), 5000));
      if (shouldLoop) timers.push(setTimeout(() => { setStep(0); run(); }, 8000));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [visible, shouldLoop]);

  const regions = [
    { name: 'North America HQ', score: 97, messages: '2.4k', status: 'Excellent' },
    { name: 'EMEA Region', score: 84, messages: '1.8k', status: 'Good' },
    { name: 'APAC Region', score: 71, messages: '1.2k', status: 'Needs Review' },
    { name: 'LATAM Distributors', score: 58, messages: '890', status: 'At Risk' },
    { name: 'India Franchise Network', score: 43, messages: '650', status: 'Critical' },
  ];

  return (
    <div ref={ref} className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-4 bg-[hsl(var(--cyber-lime)_/_0.12)] text-[hsl(var(--cyber-lime))]">
            <Eye className="w-3.5 h-3.5" /> Brand Command Center
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold tracking-tight mb-4">
            See brand health<br />across every region.
          </h3>
          <p className="text-primary-foreground/60 leading-relaxed mb-6">
            One dashboard shows brand adherence scores for every region, franchise, and affiliate.
            Spot drift before it becomes a crisis — and drill down to the exact content causing issues.
          </p>
          <div className="space-y-3">
            {[
              { icon: Globe, text: 'Real-time scores across all regions and affiliates' },
              { icon: BarChart3, text: 'Trend analysis shows improving or declining markets' },
              { icon: Shield, text: 'Automated alerts when scores drop below threshold' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-primary-foreground/50">
                <f.icon className="w-4 h-4 flex-shrink-0 text-[hsl(var(--cyber-lime))]" />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <BrowserChrome title="Brand Governance — Regional Dashboard">
          <div className="p-4 space-y-3">
            {/* Overall score */}
            <div className={`flex items-center justify-between p-3 rounded-xl border border-primary-foreground/10 bg-primary-foreground/[0.03] transition-all duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
              <div>
                <p className="text-[9px] uppercase tracking-wider font-bold text-primary-foreground/40">Global Brand Score</p>
                <p className="text-2xl font-serif font-bold text-[hsl(var(--cyber-lime))]">74<span className="text-sm text-primary-foreground/40">/100</span></p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-primary-foreground/40">5 regions monitored</p>
                <p className="text-[9px] text-primary-foreground/40">6,940 assets scored</p>
              </div>
            </div>

            {/* Regional table */}
            <div className={`rounded-xl border border-primary-foreground/10 overflow-hidden transition-all duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
              <div className="px-3 py-2 border-b border-primary-foreground/10 bg-primary-foreground/[0.03] flex items-center justify-between">
                <span className="text-[9px] font-bold text-primary-foreground/50 uppercase tracking-wider">Region</span>
                <div className="flex gap-8">
                  <span className="text-[9px] font-bold text-primary-foreground/50 uppercase tracking-wider">Score</span>
                  <span className="text-[9px] font-bold text-primary-foreground/50 uppercase tracking-wider w-12 text-right">Status</span>
                </div>
              </div>
              {regions.map((r, i) => {
                const rowVisible = step >= 3 || (step >= 2 && i < 3);
                const scoreColor = r.score >= 80 ? 'hsl(var(--status-strong))' : r.score >= 60 ? 'hsl(var(--status-moderate))' : 'hsl(var(--status-attention))';
                return (
                  <div
                    key={r.name}
                    className="px-3 py-2 border-b border-primary-foreground/[0.05] flex items-center justify-between transition-all duration-400"
                    style={{ opacity: rowVisible ? 1 : 0, transitionDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: scoreColor }} />
                      <span className="text-[10px] font-medium text-primary-foreground/80">{r.name}</span>
                    </div>
                    <div className="flex items-center gap-8">
                      <span className="text-[10px] font-bold" style={{ color: scoreColor }}>{r.score}</span>
                      <span className="text-[8px] w-12 text-right px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${scoreColor}20`, color: scoreColor }}>
                        {r.status.split(' ').pop()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alert bar */}
            {step >= 4 && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-[hsl(var(--status-attention)_/_0.3)] bg-[hsl(var(--status-attention)_/_0.06)] transition-all duration-500">
                <Shield className="w-3.5 h-3.5 text-[hsl(var(--status-attention))]" />
                <span className="text-[9px] text-primary-foreground/60">
                  <span className="font-bold text-[hsl(var(--status-attention))]">Alert:</span> India Franchise Network dropped below 50 — 3 off-brand campaigns flagged for review
                </span>
              </div>
            )}
          </div>
        </BrowserChrome>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SHOWCASE 2 — Regional Content Generator
   Reframes: Message Builder for franchise/regional teams
   ══════════════════════════════════════════════════════════════ */
function RegionalBuilderShowcase() {
  const { ref, visible } = useInView(0.1);
  const [step, setStep] = useState(0);
  const shouldLoop = useShouldLoop();

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timers.push(setTimeout(() => setStep(1), 600));
      timers.push(setTimeout(() => setStep(2), 1800));
      timers.push(setTimeout(() => setStep(3), 3200));
      timers.push(setTimeout(() => setStep(4), 4800));
      timers.push(setTimeout(() => setStep(5), 6500));
      if (shouldLoop) timers.push(setTimeout(() => { setStep(0); run(); }, 9500));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [visible, shouldLoop]);

  const markets = ['Germany', 'Brazil', 'Japan', 'UK', 'Australia'];
  const channels = [
    { icon: Mail, label: 'Email' },
    { icon: Smartphone, label: 'SMS' },
    { icon: Share2, label: 'Social' },
    { icon: Send, label: 'Print' },
  ];

  return (
    <div ref={ref} className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <BrowserChrome title="Brand Governance — Regional Content Builder">
          <div className="p-4 space-y-3">
            {/* Step indicators */}
            <div className="flex items-center gap-2">
              {['Market', 'Channel', 'Generate', 'Review'].map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-500 ${
                      step > i + 1 ? 'bg-[hsl(var(--cyber-lime))] text-primary' : step === i + 1 ? 'bg-[hsl(var(--cyber-lime)_/_0.5)] text-primary' : 'text-primary-foreground/40 border border-primary-foreground/20'
                    }`}
                  >
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className={`text-[9px] font-medium ${step >= i + 1 ? 'text-primary-foreground/80' : 'text-primary-foreground/30'}`}>{s}</span>
                  {i < 3 && <div className="w-4 h-px bg-primary-foreground/10" />}
                </div>
              ))}
            </div>

            {/* Market selector */}
            <div>
              <p className="text-[9px] uppercase tracking-wider font-bold text-primary-foreground/40 mb-2">Target Market</p>
              <div className="flex flex-wrap gap-1.5">
                {markets.map((m, i) => (
                  <span
                    key={m}
                    className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all duration-300 ${
                      step >= 1 && i === 0
                        ? 'border-[hsl(var(--cyber-lime))] text-[hsl(var(--cyber-lime))] bg-[hsl(var(--cyber-lime)_/_0.1)]'
                        : 'border-primary-foreground/15 text-primary-foreground/40'
                    }`}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Channel selector */}
            <div>
              <p className="text-[9px] uppercase tracking-wider font-bold text-primary-foreground/40 mb-2">Channels</p>
              <div className="flex gap-2">
                {channels.map((ch, i) => (
                  <div
                    key={ch.label}
                    className={`flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 rounded-lg border transition-all duration-300 ${
                      step >= 2 && (i === 0 || i === 2)
                        ? 'border-[hsl(var(--cyber-lime))] text-[hsl(var(--cyber-lime))] bg-[hsl(var(--cyber-lime)_/_0.1)]'
                        : 'border-primary-foreground/15 text-primary-foreground/40'
                    }`}
                  >
                    <ch.icon className="w-3 h-3" />
                    {ch.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Brand guardrails */}
            {step >= 3 && (
              <div className="flex gap-2 transition-all duration-500">
                <div className="flex-1 rounded-lg border border-primary-foreground/10 px-3 py-2 bg-primary-foreground/[0.02]">
                  <p className="text-[9px] uppercase tracking-wider font-bold text-primary-foreground/40 mb-1">Brand DNA</p>
                  <p className="text-[10px] font-medium text-[hsl(var(--cyber-lime))]">Locked to HQ</p>
                </div>
                <div className="flex-1 rounded-lg border border-primary-foreground/10 px-3 py-2 bg-primary-foreground/[0.02]">
                  <p className="text-[9px] uppercase tracking-wider font-bold text-primary-foreground/40 mb-1">Language</p>
                  <p className="text-[10px] font-medium text-primary-foreground/80">German (DE)</p>
                </div>
              </div>
            )}

            {/* Generation / result */}
            {step >= 4 && (
              <div className="rounded-xl border border-primary-foreground/10 p-3 bg-primary-foreground/[0.02] transition-all duration-500">
                {step === 4 ? (
                  <div className="flex items-center justify-center gap-2 py-5">
                    <div className="w-5 h-5 rounded-full border-2 border-[hsl(var(--cyber-lime))] border-t-transparent animate-spin" />
                    <span className="text-xs text-primary-foreground/50">Generating with HQ Brand DNA…</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-primary-foreground/80">Email Draft — Germany</span>
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[hsl(var(--cyber-lime)_/_0.15)] text-[hsl(var(--cyber-lime))]">Brand Score: 94</span>
                    </div>
                    <p className="text-[10px] text-primary-foreground/50 leading-relaxed">
                      <span className="font-semibold text-primary-foreground/70">Betreff:</span> Präzisionsschutz für Höchstleistung — Jetzt bei Ihrem Partner
                    </p>
                    <p className="text-[10px] text-primary-foreground/50 leading-relaxed line-clamp-2">
                      Entdecken Sie unsere neueste Generation von Hochleistungs-Schmierstoffen. Entwickelt mit der gleichen Präzision, die unsere Marke seit Jahrzehnten auszeichnet…
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[9px] px-2 py-0.5 rounded-full border border-primary-foreground/10 text-primary-foreground/40">Social Draft</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full border border-[hsl(var(--cyber-purple)_/_0.3)] text-[hsl(var(--cyber-purple))]">Pending Approval</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </BrowserChrome>

        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-4 bg-[hsl(var(--cyber-purple)_/_0.12)] text-[hsl(var(--cyber-purple))]">
            <Factory className="w-3.5 h-3.5" /> Regional Content Builder
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold tracking-tight mb-4">
            Local teams create.<br />HQ brand stays intact.
          </h3>
          <p className="text-primary-foreground/60 leading-relaxed mb-6">
            Regional affiliates and dealers generate content in their market language — but every word
            is guided by your HQ Brand DNA. No more rogue campaigns or butchered taglines.
          </p>
          <div className="space-y-3">
            {[
              { icon: Users, text: 'Each region generates within locked brand guardrails' },
              { icon: Globe, text: 'AI maintains brand voice across any language' },
              { icon: CheckCircle2, text: 'Built-in approval routing to HQ before publish' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-primary-foreground/50">
                <f.icon className="w-4 h-4 flex-shrink-0 text-[hsl(var(--cyber-purple))]" />
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
   SHOWCASE 3 — Campaign Governance Flow
   Reframes: Journey Builder for franchise campaign rollouts
   ══════════════════════════════════════════════════════════════ */
function CampaignGovernanceShowcase() {
  const { ref, visible } = useInView(0.1);
  const [step, setStep] = useState(0);
  const shouldLoop = useShouldLoop();

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timers.push(setTimeout(() => setStep(1), 600));
      timers.push(setTimeout(() => setStep(2), 2000));
      timers.push(setTimeout(() => setStep(3), 3600));
      timers.push(setTimeout(() => setStep(4), 5200));
      if (shouldLoop) timers.push(setTimeout(() => { setStep(0); run(); }, 8200));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [visible, shouldLoop]);

  const campaignPhases = [
    { name: 'Phase 1 — Teaser', color: 'hsl(var(--cyber-blue))', weeks: 'Wk 1–2' },
    { name: 'Phase 2 — Launch', color: 'hsl(var(--cyber-lime))', weeks: 'Wk 3–4' },
    { name: 'Phase 3 — Sustain', color: 'hsl(var(--cyber-purple))', weeks: 'Wk 5–8' },
  ];

  const touchpoints = [
    { phase: 0, channel: 'Email', title: 'Teaser Announcement', region: 'All Regions' },
    { phase: 0, channel: 'Social', title: 'Countdown Post', region: 'NA + EMEA' },
    { phase: 1, channel: 'Email', title: 'Product Launch', region: 'All Regions' },
    { phase: 1, channel: 'SMS', title: 'Dealer Alert', region: 'Franchise Network' },
    { phase: 1, channel: 'Print', title: 'POS Display', region: 'Retail Partners' },
    { phase: 2, channel: 'Email', title: 'Case Study', region: 'All Regions' },
    { phase: 2, channel: 'Social', title: 'UGC Campaign', region: 'APAC + LATAM' },
    { phase: 2, channel: 'Email', title: 'Re-Engage', region: 'All Regions' },
  ];

  return (
    <div ref={ref} className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-4 bg-[hsl(var(--cyber-blue)_/_0.12)] text-[hsl(var(--cyber-blue))]">
            <Map className="w-3.5 h-3.5" /> Campaign Governance
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold tracking-tight mb-4">
            Roll out campaigns<br />across every market.
          </h3>
          <p className="text-primary-foreground/60 leading-relaxed mb-6">
            Design a campaign once at HQ, then distribute it across every region with localized
            content that stays on-brand. Track rollout progress and brand adherence in real time.
          </p>
          <div className="space-y-3">
            {[
              { icon: Layers, text: 'Multi-phase campaigns with regional targeting' },
              { icon: Target, text: 'Each touchpoint scored against brand standards' },
              { icon: Sparkles, text: 'AI generates localized variants from one campaign brief' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-primary-foreground/50">
                <f.icon className="w-4 h-4 flex-shrink-0 text-[hsl(var(--cyber-blue))]" />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <BrowserChrome title="Brand Governance — Campaign Rollout">
          <div className="p-4 space-y-3">
            {/* Campaign header */}
            <div className={`flex items-center justify-between transition-all duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
              <div>
                <p className="text-[10px] font-bold text-primary-foreground/80">Q3 Product Launch Campaign</p>
                <p className="text-[9px] text-primary-foreground/40">8 weeks · 5 regions · 3 phases</p>
              </div>
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[hsl(var(--cyber-lime)_/_0.15)] text-[hsl(var(--cyber-lime))]">
                Brand Score: 89
              </span>
            </div>

            {/* Phase headers */}
            {step >= 2 && (
              <div className="flex gap-2 transition-all duration-500">
                {campaignPhases.map((phase, i) => (
                  <div
                    key={phase.name}
                    className="flex-1 rounded-md px-2 py-1.5 text-center transition-all duration-500"
                    style={{
                      background: `${phase.color}15`,
                      borderLeft: `2px solid ${phase.color}`,
                      transitionDelay: `${i * 120}ms`,
                    }}
                  >
                    <p className="text-[8px] font-bold" style={{ color: phase.color }}>{phase.name}</p>
                    <p className="text-[7px] text-primary-foreground/40">{phase.weeks}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Touchpoint flow */}
            {step >= 3 && (
              <div className="rounded-xl border border-primary-foreground/10 overflow-hidden">
                <div className="px-3 py-1.5 border-b border-primary-foreground/[0.05] bg-primary-foreground/[0.03] flex items-center gap-2">
                  <GitBranch className="w-3 h-3 text-primary-foreground/40" />
                  <span className="text-[9px] font-bold text-primary-foreground/50">Touchpoint Flow</span>
                </div>
                <div className="px-3 py-2">
                  <div className="flex flex-wrap gap-x-1 gap-y-1.5 items-center">
                    {touchpoints.map((tp, i) => {
                      const nodeVisible = step >= 4 || i < 4;
                      const color = campaignPhases[tp.phase]?.color || 'hsl(var(--cyber-lime))';
                      return (
                        <div key={i} className="flex items-center gap-1">
                          <div
                            className="rounded-md border px-2 py-1 transition-all duration-400"
                            style={{
                              borderColor: `${color}40`,
                              background: `${color}08`,
                              opacity: nodeVisible ? 1 : 0,
                              transform: nodeVisible ? 'scale(1)' : 'scale(0.8)',
                              transitionDelay: `${i * 80}ms`,
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                              <span className="text-[7px] font-bold text-primary-foreground/50">{tp.channel}</span>
                            </div>
                            <p className="text-[7px] font-medium text-primary-foreground/70 whitespace-nowrap">{tp.title}</p>
                            <p className="text-[6px] text-primary-foreground/40">{tp.region}</p>
                          </div>
                          {i < touchpoints.length - 1 && (
                            <ArrowRight className="w-2 h-2 text-primary-foreground/20 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </BrowserChrome>
      </div>
    </div>
  );
}

/* ── Export main section ── */
export default function EnterpriseShowcases() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary-foreground mb-4">
            See It in Action
          </h2>
          <p className="text-primary-foreground/60 text-lg max-w-2xl mx-auto">
            The same powerful platform, reframed for enterprise brand governance.
          </p>
        </div>

        <div className="space-y-24">
          <BrandCommandShowcase />
          <RegionalBuilderShowcase />
          <CampaignGovernanceShowcase />
        </div>
      </div>
    </section>
  );
}
