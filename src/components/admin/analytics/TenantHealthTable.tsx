import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Dna, 
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { TenantHealthScore } from '@/hooks/useAdminAnalytics';

interface TenantHealthTableProps {
  data: TenantHealthScore[];
  isLoading?: boolean;
  showAll?: boolean;
  maxItems?: number;
}

function getHealthBadge(score: number) {
  if (score >= 75) {
    return <Badge className="bg-green-100 text-green-700 text-[10px]">Healthy</Badge>;
  } else if (score >= 50) {
    return <Badge className="bg-amber-100 text-amber-700 text-[10px]">Fair</Badge>;
  } else if (score >= 25) {
    return <Badge className="bg-orange-100 text-orange-700 text-[10px]">Needs Attention</Badge>;
  } else {
    return <Badge className="bg-red-100 text-red-700 text-[10px]">At Risk</Badge>;
  }
}

function getDaysAgoText(days: number | null): string {
  if (days === null) return 'Never';
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function TenantHealthTable({ data, isLoading, showAll, maxItems = 10 }: TenantHealthTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Institution Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by health score (lowest first for attention)
  const sortedData = [...data].sort((a, b) => a.health_score - b.health_score);
  const displayData = showAll ? sortedData : sortedData.slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Institution Health
            </CardTitle>
            <CardDescription>
              {data.filter(t => t.is_at_risk).length} of {data.length} need attention
            </CardDescription>
          </div>
          {!showAll && data.length > maxItems && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/panel?tab=institutions">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className={showAll ? "h-[600px]" : "h-[400px]"}>
          <div className="space-y-2">
            {displayData.map((tenant) => (
              <div 
                key={tenant.tenant_id}
                className={`p-3 rounded-lg border transition-colors hover:bg-muted/30 ${
                  tenant.is_at_risk ? 'border-amber-200 bg-amber-50/30' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${
                      tenant.tenant_type === 'agency' ? 'bg-purple-100' : 'bg-primary/10'
                    }`}>
                      {tenant.tenant_type === 'agency' 
                        ? <Briefcase className="w-4 h-4 text-purple-600" />
                        : <Building2 className="w-4 h-4 text-primary" />
                      }
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{tenant.institution_name}</p>
                        {tenant.is_at_risk && (
                          <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {tenant.active_users_30d}/{tenant.total_users} active
                        </span>
                        <span className="flex items-center gap-1">
                          <Dna className="w-3 h-3" />
                          {tenant.dna_samples} samples
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getDaysAgoText(tenant.days_since_activity)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getHealthBadge(tenant.health_score)}
                    <div className="text-right">
                      <p className="text-lg font-bold">{tenant.health_score}</p>
                      <p className="text-[10px] text-muted-foreground">score</p>
                    </div>
                  </div>
                </div>
                
                {/* Health breakdown */}
                <div className="mt-3 grid grid-cols-4 gap-2">
                  <div className="text-center p-2 rounded bg-muted/50">
                    <p className="text-xs font-medium">{tenant.user_adoption_rate}%</p>
                    <p className="text-[9px] text-muted-foreground">User Adoption</p>
                  </div>
                  <div className="text-center p-2 rounded bg-muted/50">
                    <p className="text-xs font-medium">{tenant.dna_completeness}%</p>
                    <p className="text-[9px] text-muted-foreground">DNA Setup</p>
                  </div>
                  <div className="text-center p-2 rounded bg-muted/50">
                    <p className="text-xs font-medium">{tenant.messages_generated}</p>
                    <p className="text-[9px] text-muted-foreground">Messages</p>
                  </div>
                  <div className="text-center p-2 rounded bg-muted/50">
                    <p className="text-xs font-medium">{tenant.library_items}</p>
                    <p className="text-[9px] text-muted-foreground">Library</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
