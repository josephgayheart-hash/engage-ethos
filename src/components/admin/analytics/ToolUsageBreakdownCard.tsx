import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToolUsageBreakdown } from '@/hooks/useAdminAnalytics';

interface ToolUsageBreakdownCardProps {
  data: ToolUsageBreakdown[];
  isLoading?: boolean;
}

// Friendly names for tools/actions
const toolLabels: Record<string, string> = {
  'page_view': 'Page View',
  'build': 'Message Builder',
  'evaluate': 'Evaluator',
  'mapper': 'Journey Designer',
  'strategy': 'Strategy',
  'personal_library': 'Personal Library',
  'university_library': 'University Library',
  'content_dna': 'Content DNA',
  'web-analyzer': 'Web Analyzer',
  'brand-audit': 'Brand Audit'
};

const actionLabels: Record<string, string> = {
  'dashboard': 'Dashboard',
  'landing': 'Landing Page',
  'admin_panel': 'Admin Panel',
  'message_builder': 'Message Builder',
  'login': 'Login',
  'university-settings': 'University Settings',
  'content_dna': 'Content DNA',
  'settings': 'Settings',
  'personal_library': 'Personal Library',
  'admin_users': 'User Management',
  'admin_content-dna': 'DNA Management',
  'admin_onboarding': 'Onboarding Requests',
  'journey_mapper': 'Journey Designer',
  'use': 'Use Tool',
  'save': 'Save',
  'submit': 'Submit'
};

export function ToolUsageBreakdownCard({ data, isLoading }: ToolUsageBreakdownCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tool Usage Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse h-8 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group and aggregate by tool
  const totalUsage = data.reduce((sum, d) => sum + d.count, 0);

  // Get top entries, excluding generic page views
  const topUsage = data
    .filter(d => !(d.tool_name === 'page_view' && d.action === 'landing'))
    .slice(0, 15);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Activity Breakdown</CardTitle>
        <CardDescription>Most common actions (last 90 days)</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-1.5">
            {topUsage.map((item, index) => {
              const percentage = Math.round((item.count / totalUsage) * 100);
              const toolLabel = toolLabels[item.tool_name] || item.tool_name;
              const actionLabel = actionLabels[item.action] || item.action.replace(/_/g, ' ');
              
              return (
                <div 
                  key={`${item.tool_name}-${item.action}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-xs text-muted-foreground w-5 text-right">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {item.tool_name === 'page_view' ? actionLabel : toolLabel}
                      </span>
                      {item.tool_name !== 'page_view' && (
                        <Badge variant="outline" className="text-[10px]">
                          {actionLabel}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-10 text-right">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
