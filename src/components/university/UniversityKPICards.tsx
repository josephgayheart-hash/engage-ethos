import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Activity, 
  Dna,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Route
} from 'lucide-react';
import type { AdminAnalyticsData, TenantHealthScore } from '@/hooks/useAdminAnalytics';

interface UniversityKPICardsProps {
  analytics: AdminAnalyticsData | null;
  tenantHealth?: TenantHealthScore;
  isLoading?: boolean;
}

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subValue?: string;
  progress?: number;
  status?: 'success' | 'warning' | 'error';
}

function KPICard({ icon, label, value, subValue, progress, status }: KPICardProps) {
  const statusColors = {
    success: 'border-green-200 bg-green-50/50',
    warning: 'border-amber-200 bg-amber-50/50',
    error: 'border-red-200 bg-red-50/50',
  };

  return (
    <Card className={status ? statusColors[status] : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-2 rounded-lg ${
              status === 'success' ? 'bg-green-100' :
              status === 'warning' ? 'bg-amber-100' :
              status === 'error' ? 'bg-red-100' :
              'bg-primary/10'
            }`}>
              {icon}
            </div>
            <div className="flex-1">
              <p className="font-bold text-2xl">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
              {subValue && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{subValue}</p>
              )}
              {progress !== undefined && (
                <Progress value={progress} className="h-1.5 mt-2" />
              )}
            </div>
          </div>
          {status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
          {status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
        </div>
      </CardContent>
    </Card>
  );
}

export function UniversityKPICards({ analytics, tenantHealth, isLoading }: UniversityKPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-muted rounded w-16" />
                <div className="h-4 bg-muted rounded w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalUsers = tenantHealth?.total_users || 0;
  const activeUsers = tenantHealth?.active_users_30d || 0;
  const adoptionRate = tenantHealth?.user_adoption_rate || 0;
  const dnaCompleteness = tenantHealth?.dna_completeness || 0;
  const healthScore = tenantHealth?.health_score || 0;
  const messagesGenerated = tenantHealth?.messages_generated || 0;
  const journeysCreated = tenantHealth?.journeys_created || 0;

  // Determine statuses
  const adoptionStatus: 'success' | 'warning' | 'error' = 
    adoptionRate >= 70 ? 'success' : adoptionRate >= 40 ? 'warning' : 'error';
  const dnaStatus: 'success' | 'warning' | 'error' = 
    dnaCompleteness >= 70 ? 'success' : dnaCompleteness >= 30 ? 'warning' : 'error';
  const healthStatus: 'success' | 'warning' | 'error' = 
    healthScore >= 70 ? 'success' : healthScore >= 40 ? 'warning' : 'error';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <KPICard
        icon={<TrendingUp className="w-4 h-4 text-primary" />}
        label="Health Score"
        value={`${Math.round(healthScore)}%`}
        subValue="Overall institution health"
        progress={healthScore}
        status={healthStatus}
      />
      <KPICard
        icon={<Users className="w-4 h-4 text-blue-600" />}
        label="Total Users"
        value={totalUsers}
        subValue={`${activeUsers} active (30d)`}
      />
      <KPICard
        icon={<Activity className="w-4 h-4 text-green-600" />}
        label="User Adoption"
        value={`${adoptionRate}%`}
        subValue="Active vs total users"
        progress={adoptionRate}
        status={adoptionStatus}
      />
      <KPICard
        icon={<Dna className="w-4 h-4 text-orange-600" />}
        label="DNA Completeness"
        value={`${dnaCompleteness}%`}
        subValue="Voice profile setup"
        progress={dnaCompleteness}
        status={dnaStatus}
      />
      <KPICard
        icon={<MessageSquare className="w-4 h-4 text-purple-600" />}
        label="Messages"
        value={messagesGenerated}
        subValue="Generated content"
      />
      <KPICard
        icon={<Route className="w-4 h-4 text-indigo-600" />}
        label="Journeys"
        value={journeysCreated}
        subValue="Communication flows"
      />
    </div>
  );
}
