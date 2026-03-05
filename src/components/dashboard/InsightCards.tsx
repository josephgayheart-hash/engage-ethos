import { Link } from 'react-router-dom';
import { UserDashboardContext } from '@/hooks/useUserDashboardContext';

interface InsightCardsProps {
  context: UserDashboardContext;
}

export function InsightCards({ context }: InsightCardsProps) {
  const { setupProgress, personalStats, institutionalStats } = context;

  // Brand DNA completion
  const dnaPercent = institutionalStats?.dnaCompleteness ?? (setupProgress.hasDNA ? 80 : setupProgress.hasProfile ? 25 : 0);

  // Institution profile completion
  const profileSteps = [setupProgress.hasProfile, setupProgress.hasInstitution, setupProgress.hasDNA, setupProgress.hasCampusPhotos];
  const profilePercent = setupProgress.completionPercent;

  // Content activity last 7 days (use available stats as proxy)
  const draftsCount = personalStats.draftsInProgress;
  const publishedCount = personalStats.messagesCreated;
  const maxBar = Math.max(draftsCount, publishedCount, 1);

  // Audience segments (mock distribution from available data)
  const audiences = [
    { label: 'Prospective', value: 40 },
    { label: 'Current', value: 30 },
    { label: 'Alumni', value: 18 },
    { label: 'Faculty', value: 12 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
      {/* Card 1: Brand DNA */}
      <Link to="/content-dna" className="group">
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 transition-all group-hover:border-primary/30 group-hover:shadow-sm h-full">
          <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Brand DNA</p>
          <div className="flex items-center gap-2.5">
            <DonutChart percent={dnaPercent} size={40} />
            <div className="min-w-0">
              <p className="text-base font-bold text-foreground leading-tight">{dnaPercent}%</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Content guidance</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Card 2: Institution Profile */}
      <Link to="/university-settings" className="group">
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 transition-all group-hover:border-primary/30 group-hover:shadow-sm h-full">
          <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Institution Profile</p>
          <div className="flex items-center gap-2.5">
            <DonutChart percent={profilePercent} size={40} color="hsl(var(--accent))" />
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
          <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Content Activity</p>
          <div className="flex items-center gap-2.5">
            <MiniBarChart
              bars={[
                { value: draftsCount, max: maxBar },
                { value: publishedCount, max: maxBar },
              ]}
              size={40}
            />
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-foreground leading-tight">{draftsCount + publishedCount}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">Weekly activity</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Card 4: Audience Coverage */}
      <Link to="/strategy" className="group">
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 transition-all group-hover:border-primary/30 group-hover:shadow-sm h-full">
          <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Audience Coverage</p>
          <div className="space-y-1">
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

/* ── Mini SVG Charts ── */

function DonutChart({ percent, size = 40, color }: { percent: number; size?: number; color?: string }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
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
        stroke={color || 'hsl(var(--primary))'}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
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
