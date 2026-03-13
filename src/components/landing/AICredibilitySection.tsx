import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, BarChart3, Cpu } from 'lucide-react';

const pillars = [
  {
    icon: Cpu,
    title: 'Multi-Model Orchestration',
    description: '8 specialized AI models selected per task — text generation, image creation, content analysis, voice extraction.',
    accent: 'hsl(82 85% 55%)',
  },
  {
    icon: Sparkles,
    title: 'Content DNA Engine',
    description: "Your brand voice isn't a prompt. It's a living profile built from your actual content, continuously refined.",
    accent: 'hsl(270 70% 60%)',
  },
  {
    icon: BarChart3,
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
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white mb-4 tracking-tight">
            Not just AI. <span className="italic text-[hsl(82_85%_60%)]">Your</span> AI.
          </h2>
          <p className="text-white/40 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Powered by{' '}
            <span className="text-white/70 font-medium">Google Gemini</span>
            {' '}&{' '}
            <span className="text-white/70 font-medium">OpenAI</span>
            {' '}— multiple models orchestrated for the right task, every time.
          </p>
        </div>

        {/* Three pillars */}
        <div className="grid sm:grid-cols-3 gap-5 mb-14">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 hover:border-white/20 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${p.accent}20` }}
              >
                <p.icon className="w-5 h-5" style={{ color: p.accent }} />
              </div>
              <h3 className="text-white font-semibold text-sm mb-2">{p.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>

        {/* Stat strip */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {stats.map((s, i) => (
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
