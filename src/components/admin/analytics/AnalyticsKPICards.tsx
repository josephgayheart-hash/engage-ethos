import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Activity, 
  Building2, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Dna,
  MessageSquare
} from 'lucide-react';
import { AdminAnalyticsData } from '@/hooks/useAdminAnalytics';

interface AnalyticsKPICardsProps {
  data: AdminAnalyticsData;
  isLoading?: boolean;
  compact?: boolean;
}

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  alert?: boolean;
  compact?: boolean;
}

function KPICard({ icon, label, value, subValue, trend, trendValue, alert, compact }: KPICardProps) {
  return (
    <Card className={alert ? 'border-amber-200 bg-amber-50/50' : ''}>
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${alert ? 'bg-amber-100' : 'bg-primary/10'}`}>
              {icon}
            </div>
            <div>
              <p className={`font-bold ${compact ? 'text-xl' : 'text-2xl'}`}>{value}</p>
              <p className={`text-muted-foreground ${compact ? 'text-[10px]' : 'text-xs'}`}>{label}</p>
              {subValue && (
                <p className="text-[10px] text-muted-foreground">{subValue}</p>
              )}
            </div>
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-xs ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
          {alert && (
            <Badge variant="outline" className="text-amber-700 border-amber-300 text-[10px]">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Needs attention
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsKPICards({ data, isLoading, compact }: AnalyticsKPICardsProps) {
  if (isLoading) {
    return (
      <div className={`grid ${compact ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'} gap-3`}>
        {Array.from({ length: compact ? 4 : 6 }).map((_, i) => (
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

  // Calculate engagement rate
  const engagementRate = data.totalUsers > 0 
    ? Math.round((data.activeUsers7d / data.totalUsers) * 100) 
    : 0;

  // Calculate average health
  const avgHealth = data.tenantHealth.length > 0
    ? Math.round(data.tenantHealth.reduce((sum, t) => sum + t.health_score, 0) / data.tenantHealth.length)
    : 0;

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          icon={<Users className="w-4 h-4 text-primary" />}
          label="Active Users (7d)"
          value={data.activeUsers7d}
          subValue={`of ${data.totalUsers} total`}
          compact
        />
        <KPICard
          icon={<Building2 className="w-4 h-4 text-blue-600" />}
          label="Active Institutions"
          value={data.activeTenants30d}
          subValue={`of ${data.totalTenants}`}
          compact
        />
        <KPICard
          icon={<Activity className="w-4 h-4 text-green-600" />}
          label="Engagement Rate"
          value={`${engagementRate}%`}
          compact
        />
        <KPICard
          icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
          label="At-Risk Tenants"
          value={data.atRiskTenants.length}
          alert={data.atRiskTenants.length > 0}
          compact
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <KPICard
        icon={<Users className="w-4 h-4 text-primary" />}
        label="Total Users"
        value={data.totalUsers}
        subValue={`${data.activeUsers30d} active (30d)`}
      />
      <KPICard
        icon={<Activity className="w-4 h-4 text-green-600" />}
        label="Active Users (7d)"
        value={data.activeUsers7d}
        subValue={`${engagementRate}% engagement`}
      />
      <KPICard
        icon={<Building2 className="w-4 h-4 text-blue-600" />}
        label="Institutions"
        value={data.totalTenants}
        subValue={`${data.activeTenants30d} active (30d)`}
      />
      <KPICard
        icon={<TrendingUp className="w-4 h-4 text-indigo-600" />}
        label="Avg Health Score"
        value={`${avgHealth}%`}
        subValue="across all tenants"
      />
      <KPICard
        icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
        label="At-Risk Tenants"
        value={data.atRiskTenants.length}
        subValue="inactive 30+ days"
        alert={data.atRiskTenants.length > 0}
      />
      <KPICard
        icon={<Dna className="w-4 h-4 text-orange-600" />}
        label="No DNA Setup"
        value={data.noDNATenants.length}
        subValue="tenants need config"
        alert={data.noDNATenants.length > 0}
      />
    </div>
  );
}
