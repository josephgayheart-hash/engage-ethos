import { Link } from 'react-router-dom';
import { Dna, Building2, BarChart3, Users } from 'lucide-react';
import { UserDashboardContext } from '@/hooks/useUserDashboardContext';
import { useAuth } from '@/contexts/AuthContext';

interface InsightCardsProps {
  context: UserDashboardContext;
}

export function InsightCards({ context }: InsightCardsProps) {
  const { setupProgress, personalStats, institutionalStats } = context;
  const { tenant } = useAuth();

  // Brand DNA completion
  const dnaPercent = institutionalStats?.dnaCompleteness ?? (setupProgress.hasDNA ? 80 : setupProgress.hasProfile ? 25 : 0);

  // Institution profile completion
  const profilePercent = setupProgress.completionPercent;

  // Content activity
  const draftsCount = personalStats.draftsInProgress;
  const publishedCount = personalStats.messagesCreated;
  const maxBar = Math.max(draftsCount, publishedCount, 1);

  // Audience segments
  const audiences = [
    { label: 'Prospective', value: 40 },
    { label: 'Current', value: 30 },
    { label: 'Alumni', value: 18 },
    { label: 'Faculty', value: 12 },
  ];

  const logoUrl = tenant?.logo_url;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
      {/* Card 1: Brand DNA */}
      <Link to="/content-dna" className="group">
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 transition-all group-hover:border-primary/30 group-hover:shadow-sm h-full">
          <PillTitle icon={Dna} label="Brand DNA" color="primary" />
          <div className="flex items-center gap-2.5 mt-1.5">
            <DonutChart percent={dnaPercent} size={40}>
              <Dna className="w-3.5 h-3.5 text-primary" />
            </DonutChart>
            <div className="min-w-0">
              <p className="text-base font-bold text-foreground leading-tight">{dnaPercent}%</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Content guidance</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Card 2: Institution Profile */}
      <Link to="/organization-settings" className="group">
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 transition-all group-hover:border-primary/30 group-hover:shadow-sm h-full">
          <PillTitle icon={Building2} label="Institution Profile" color="accent" />
          <div className="flex items-center gap-2.5 mt-1.5">
            <DonutChart percent={profilePercent} size={40} chartColor="hsl(var(--accent))">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Institution logo"
                  className="w-5 h-5 object-contain rounded-sm"
                />
              ) : (
                <Building2 className="w-3.5 h-3.5 text-accent" />
              )}
            </DonutChart>
            <div className="min-w-0">
              <p className="text-base font-bold text-foreground leading-tight">{profilePercent}%</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Setup progress</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Card 3: Content Activity */}
      <Link to="/library" className="group">
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 transition-all group-hover:border-primary/30 group-hover:shadow-sm h-full">
          <PillTitle icon={BarChart3} label="Content Activity" color="cognitive" />
          <div className="flex items-center gap-2.5 mt-1.5">
            <MiniBarChart
              bars={[
                { value: draftsCount, max: maxBar },
                { value: publishedCount, max: maxBar },
              ]}
              size={40}
            />
            <div className="min-w-0">
              <span className="text-base font-bold text-foreground leading-tight">{draftsCount + publishedCount}</span>
              <p className="text-[10px] text-muted-foreground leading-tight">Weekly activity</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Card 4: Audience Coverage */}
      <Link to="/strategy" className="group">
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 transition-all group-hover:border-primary/30 group-hover:shadow-sm h-full">
          <PillTitle icon={Users} label="Audience Coverage" color="consensus" />
          <div className="space-y-1 mt-1.5">
            {audiences.map((a) => (
              <div key={a.label} className="flex items-center gap-1.5">
                <span className="text-[9px] text-muted-foreground w-[52px] truncate">{a.label}</span>
                <div className="flex-1 h-[5px] bg-secondary/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/70 rounded-full transition-all"
                    style={{ width: `${a.value}%` }}
                  />
                </div>
                <span className="text-[9px] font-medium text-muted-foreground w-[22px] text-right">{a.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ── Pill Title ── */

const pillColors = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  accent: 'bg-accent/10 text-accent border-accent/20',
  cognitive: 'bg-pillar-cognitive/10 text-pillar-cognitive border-pillar-cognitive/20',
  consensus: 'bg-pillar-consensus/10 text-pillar-consensus border-pillar-consensus/20',
};

function PillTitle({ icon: Icon, label, color }: { icon: React.ComponentType<{ className?: string }>; label: string; color: keyof typeof pillColors }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${pillColors[color]}`}>
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

/* ── Mini SVG Charts ── */

function DonutChart({ percent, size = 40, chartColor, children }: { percent: number; size?: number; chartColor?: string; children?: React.ReactNode }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={chartColor || 'hsl(var(--primary))'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

function MiniBarChart({ bars, size = 40 }: { bars: { value: number; max: number }[]; size?: number }) {
  const barWidth = 10;
  const gap = 6;
  const totalWidth = bars.length * barWidth + (bars.length - 1) * gap;
  const offsetX = (size - totalWidth) / 2;
  const maxHeight = size - 4;
  const colors = ['hsl(var(--primary))', 'hsl(var(--accent))'];

  return (
    <svg width={size} height={size} className="shrink-0">
      {bars.map((bar, i) => {
        const barHeight = bar.max > 0 ? Math.max(4, (bar.value / bar.max) * maxHeight) : 4;
        return (
          <rect
            key={i}
            x={offsetX + i * (barWidth + gap)}
            y={size - barHeight - 2}
            width={barWidth}
            height={barHeight}
            rx={2}
            fill={colors[i % colors.length]}
            className="transition-all duration-500"
          />
        );
      })}
    </svg>
  );
}
