import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, Target, Zap } from 'lucide-react';
import { useUserDashboardContext } from '@/hooks/useUserDashboardContext';

export function ImpactMetricsCard() {
  const { personalStats, isLoading } = useUserDashboardContext();

  const estimatedHoursSaved = Math.round(
    (personalStats.messagesCreated * 0.5) + 
    (personalStats.journeysDesigned * 1.5) + 
    (personalStats.evaluationsRun * 0.25)
  );

  const metrics = [
    {
      icon: Zap,
      value: personalStats.messagesCreated,
      label: 'Messages Created',
      color: 'hsl(82 85% 55%)',
    },
    {
      icon: Clock,
      value: `${estimatedHoursSaved}h`,
      label: 'Est. Time Saved',
      color: 'hsl(270 70% 60%)',
    },
    {
      icon: TrendingUp,
      value: personalStats.buildsCount,
      label: 'Builds Generated',
      color: 'hsl(200 100% 50%)',
    },
    {
      icon: Target,
      value: personalStats.evaluationsRun,
      label: 'Evaluations Run',
      color: 'hsl(340 75% 55%)',
    },
  ];

  if (isLoading) return null;

  // Don't show if user has no activity
  const totalActivity = personalStats.messagesCreated + personalStats.buildsCount + personalStats.evaluationsRun;
  if (totalActivity === 0) return null;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[hsl(82_85%_55%)]" />
          Your Impact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="text-center">
              <div className="flex items-center justify-center mb-1">
                <m.icon className="w-3.5 h-3.5 mr-1.5 opacity-70" style={{ color: m.color }} />
                <span className="text-lg font-bold text-foreground">{m.value}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
        {personalStats.topTool && (
          <p className="text-[11px] text-muted-foreground text-center mt-3 pt-3 border-t border-border/50">
            Most-used tool: <span className="font-medium text-foreground">{personalStats.topTool}</span>
            {personalStats.daysActive > 0 && (
              <> · Active {personalStats.daysActive} days (last 90d)</>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
