import { Badge } from '@/components/ui/badge';
import { Brain, BarChart3 } from 'lucide-react';
import openaiLogo from '@/assets/openai-logo.svg';
import geminiLogo from '@/assets/gemini-logo.svg';

const pillars = [
  {
    icon: null,
    title: 'Multi-Model Orchestration',
    description: '8 specialized AI models selected per task — text generation, image creation, content analysis, voice extraction.',
    accent: 'hsl(82 85% 55%)',
  },
  {
    icon: null,
    title: 'Content DNA Engine',
    description: "Your brand voice isn't a prompt. It's a living profile built from your actual content, continuously refined.",
    accent: 'hsl(270 70% 60%)',
  },
  {
    icon: null,
    title: 'Evaluation Loop',
    description: 'Every output is scored against your brand platform before you see it. Not vibes — metrics.',
    accent: 'hsl(200 100% 50%)',
  },
];

const stats = [
  { value: '8', label: 'AI Models' },
  { value: '35+', label: 'Cloud Functions' },
  { value: 'Real-time', label: 'Brand Scoring' },
];

export default function AICredibilitySection() {
  return (
    <section
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, hsl(222 47% 14%) 0%, hsl(222 40% 20%) 50%, hsl(222 47% 14%) 100%)' }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute w-64 h-64 rounded-full blur-[100px] opacity-20" style={{ background: 'hsl(82 85% 55%)', top: '10%', right: '15%' }} />
      <div className="absolute w-48 h-48 rounded-full blur-[80px] opacity-15" style={{ background: 'hsl(270 70% 60%)', bottom: '15%', left: '10%' }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-white/10 text-white/70 border-white/20 backdrop-blur-sm">
            <Brain className="w-3 h-3 mr-1.5" />
            The AI Under the Hood
          </Badge>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white mb-5 tracking-tight">
            Not just AI. <span className="italic text-[hsl(82_85%_60%)]">Your</span> AI.
          </h2>

          {/* Provider logos + text */}
          <div className="flex items-center justify-center gap-6 mb-3">
            <div className="flex items-center gap-2.5">
              <img src={geminiLogo} alt="Google Gemini" className="w-6 h-6" />
              <span className="text-white/70 font-medium text-sm sm:text-base">Google Gemini</span>
            </div>
            <span className="text-white/20 text-lg">×</span>
            <div className="flex items-center gap-2.5">
              <img src={openaiLogo} alt="OpenAI" className="w-5 h-5 brightness-0 invert opacity-70" />
              <span className="text-white/70 font-medium text-sm sm:text-base">OpenAI</span>
            </div>
          </div>

          <p className="text-white/40 max-w-lg mx-auto text-sm leading-relaxed">
            Multiple models orchestrated for the right task, every time.
          </p>
        </div>

        {/* Three pillars */}
        <div className="grid sm:grid-cols-3 gap-5 mb-14">
          {pillars.map((p, i) => {
            const icons = [
              <svg key="cpu" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={p.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/></svg>,
              <svg key="dna" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={p.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="M17 6l-2.5-2.5"/><path d="M14 8l-1-1"/><path d="M7 18l2.5 2.5"/><path d="M3.5 14.5l.5.5"/><path d="M20 9l.5.5"/><path d="M6.5 12.5l1 1"/><path d="M16.5 10.5l1 1"/><path d="M10 16l1.5 1.5"/></svg>,
              <BarChart3 key="chart" className="w-5 h-5" style={{ color: p.accent }} />,
            ];
            return (
              <div
                key={p.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 hover:border-white/20 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${p.accent}20` }}
                >
                  {icons[i]}
                </div>
                <h3 className="text-white font-semibold text-sm mb-2">{p.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{p.description}</p>
              </div>
            );
          })}
        </div>

        {/* Stat strip */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03]"
            >
              <span className="text-white font-bold text-sm">{s.value}</span>
              <span className="text-white/40 text-xs">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
