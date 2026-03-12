import { MessageSquare, Users, GraduationCap, Sparkles } from 'lucide-react';

const stats = [
  { icon: MessageSquare, value: '2,400+', label: 'Messages Generated' },
  { icon: GraduationCap, value: '12', label: 'Institutions Onboarded' },
  { icon: Users, value: '85+', label: 'Active Users' },
  { icon: Sparkles, value: '94%', label: 'Avg Brand Score' },
];

export function SocialProofStrip() {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ background: 'hsl(222 47% 11%)' }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-center text-xs uppercase tracking-[0.2em] text-white/30 mb-8 font-medium">
          Trusted by forward-thinking institutions
        </h2>
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8" aria-label="Platform impact metrics">
          {stats.map((stat, i) => {
            const colors = [
              'hsl(82 85% 55%)',
              'hsl(270 70% 60%)',
              'hsl(200 100% 50%)',
              'hsl(82 85% 55%)',
            ];
            return (
              <li key={stat.label} className="text-center group list-none">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="w-4 h-4 mr-2 opacity-60" style={{ color: colors[i] }} />
                  <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                </div>
                <p className="text-xs text-white/40">{stat.label}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
