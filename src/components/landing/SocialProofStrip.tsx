import { Cpu, Layers, Shield, Sparkles } from 'lucide-react';

const stats = [
  { icon: Cpu, value: '8', label: 'AI Models Orchestrated' },
  { icon: Layers, value: '35+', label: 'Cloud Functions' },
  { icon: Shield, value: '100%', label: 'Brand-Scored Output' },
  { icon: Sparkles, value: '10+', label: 'Content Tools' },
];

export function SocialProofStrip() {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 border-y border-border bg-[hsl(51_22%_93%)]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 font-medium">
          What powers the platform
        </h2>
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8" aria-label="Platform capabilities">
          {stats.map((stat, i) => {
            const colors = [
              'hsl(216 100% 50%)',
              'hsl(60 4% 30%)',
              'hsl(216 100% 50%)',
              'hsl(216 100% 50%)',
            ];
            return (
              <li key={stat.label} className="text-center group list-none">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="w-4 h-4 mr-2 opacity-80" style={{ color: colors[i] }} />
                  <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
                </div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}