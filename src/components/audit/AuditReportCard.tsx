import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Building2, 
  Monitor, 
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditStats {
  total: number;
  analyzed: number;
  pending: number;
  remediated: number;
  avgBrandScore: number;
  avgVoiceScore: number;
  byType: {
    physical: number;
    digital: number;
    human: number;
  };
}

interface AuditReportCardProps {
  stats: AuditStats;
  className?: string;
}

const typeIcons = {
  physical: Building2,
  digital: Monitor,
  human: Users,
};

export function AuditReportCard({ stats, className }: AuditReportCardProps) {
  const completionRate = stats.total > 0 
    ? Math.round((stats.analyzed / stats.total) * 100) 
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Moderate';
    return 'Needs Attention';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-950/20';
    if (score >= 60) return 'bg-amber-50 dark:bg-amber-950/20';
    return 'bg-red-50 dark:bg-red-950/20';
  };

  if (stats.total === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-1">No Touchpoints Yet</h3>
          <p className="text-sm text-muted-foreground">
            Add touchpoints from the inventory to start your brand consistency audit.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="icon-container icon-container-md bg-primary/10">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Audit Summary</CardTitle>
            <CardDescription>
              {stats.analyzed} of {stats.total} touchpoints analyzed
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Completion Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Audit Progress</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              {stats.analyzed} analyzed
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              {stats.pending} pending
            </div>
            {stats.remediated > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-blue-600" />
                {stats.remediated} remediated
              </div>
            )}
          </div>
        </div>

        {/* Score Summary */}
        {stats.analyzed > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className={cn("p-3 rounded-lg", getScoreBg(stats.avgBrandScore))}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">Avg Brand Score</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-bold", getScoreColor(stats.avgBrandScore))}>
                  {stats.avgBrandScore}%
                </span>
                <Badge 
                  variant="outline" 
                  className={cn("text-[10px]", getScoreColor(stats.avgBrandScore))}
                >
                  {getScoreLabel(stats.avgBrandScore)}
                </Badge>
              </div>
            </div>
            <div className={cn("p-3 rounded-lg", getScoreBg(stats.avgVoiceScore))}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">Avg Voice Score</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-bold", getScoreColor(stats.avgVoiceScore))}>
                  {stats.avgVoiceScore}%
                </span>
                <Badge 
                  variant="outline" 
                  className={cn("text-[10px]", getScoreColor(stats.avgVoiceScore))}
                >
                  {getScoreLabel(stats.avgVoiceScore)}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Type Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Touchpoints by Type</h4>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(stats.byType) as Array<keyof typeof stats.byType>).map(type => {
              const Icon = typeIcons[type];
              const count = stats.byType[type];

              return (
                <div 
                  key={type}
                  className="flex flex-col items-center p-3 rounded-lg bg-muted/50"
                >
                  <Icon className="w-5 h-5 text-muted-foreground mb-1" />
                  <span className="text-lg font-bold">{count}</span>
                  <span className="text-[10px] text-muted-foreground capitalize">{type}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Notice */}
        {stats.pending > 0 && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {stats.pending} touchpoints need analysis
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Add content samples and run analysis to complete your audit.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
