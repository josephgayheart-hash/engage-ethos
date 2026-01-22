import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  AlertCircle,
  Info,
  Dna,
  Users,
  Clock,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { TenantHealthScore } from '@/hooks/useAdminAnalytics';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface AlertsInsightsCardProps {
  atRiskTenants: TenantHealthScore[];
  noDNATenants: TenantHealthScore[];
  inactiveUsers: number;
  totalUsers: number;
  isLoading?: boolean;
}

interface AlertItemProps {
  icon: React.ReactNode;
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

function AlertItem({ icon, severity, title, description, action }: AlertItemProps) {
  const bgColors = {
    error: 'bg-red-50 border-red-200',
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const iconColors = {
    error: 'bg-red-100',
    warning: 'bg-amber-100',
    info: 'bg-blue-100'
  };

  return (
    <div className={`p-3 rounded-lg border ${bgColors[severity]}`}>
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-lg ${iconColors[severity]}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        {action && (
          <Button variant="ghost" size="sm" asChild className="flex-shrink-0">
            <Link to={action.href}>
              {action.label}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export function AlertsInsightsCard({ 
  atRiskTenants, 
  noDNATenants, 
  inactiveUsers,
  totalUsers,
  isLoading 
}: AlertsInsightsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Alerts & Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const alerts: AlertItemProps[] = [];

  // At-risk tenants (high priority)
  if (atRiskTenants.length > 0) {
    const tenantNames = atRiskTenants.slice(0, 3).map(t => t.institution_name).join(', ');
    const moreCount = atRiskTenants.length > 3 ? ` +${atRiskTenants.length - 3} more` : '';
    alerts.push({
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      severity: 'warning',
      title: `${atRiskTenants.length} institution${atRiskTenants.length > 1 ? 's' : ''} at risk`,
      description: `${tenantNames}${moreCount}. Consider outreach to re-engage.`,
      action: {
        label: 'View',
        href: '/admin/panel?tab=institutions'
      }
    });
  }

  // No DNA tenants
  if (noDNATenants.length > 0) {
    const tenantNames = noDNATenants.slice(0, 3).map(t => t.institution_name).join(', ');
    const moreCount = noDNATenants.length > 3 ? ` +${noDNATenants.length - 3} more` : '';
    alerts.push({
      icon: <Dna className="w-4 h-4 text-orange-600" />,
      severity: 'warning',
      title: `${noDNATenants.length} institution${noDNATenants.length > 1 ? 's' : ''} without DNA`,
      description: `${tenantNames}${moreCount}. They haven't configured Content DNA yet.`,
      action: {
        label: 'Send reminder',
        href: '/admin/panel?tab=emails'
      }
    });
  }

  // Inactive users
  const inactivePercentage = totalUsers > 0 ? Math.round((inactiveUsers / totalUsers) * 100) : 0;
  if (inactivePercentage > 30) {
    alerts.push({
      icon: <Users className="w-4 h-4 text-red-600" />,
      severity: inactivePercentage > 50 ? 'error' : 'warning',
      title: `${inactivePercentage}% of users inactive (30d+)`,
      description: `${inactiveUsers} of ${totalUsers} users haven't logged in recently.`,
      action: {
        label: 'Re-engage',
        href: '/admin/panel?tab=emails'
      }
    });
  }

  // All good!
  if (alerts.length === 0) {
    alerts.push({
      icon: <Info className="w-4 h-4 text-green-600" />,
      severity: 'info',
      title: 'Platform health is good',
      description: 'No critical issues detected. All institutions are active and configured.'
    });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Alerts & Insights
            </CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </div>
          {alerts.length > 0 && alerts[0].severity !== 'info' && (
            <Badge variant="destructive" className="text-xs">
              {alerts.length} alert{alerts.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <AlertItem key={index} {...alert} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
