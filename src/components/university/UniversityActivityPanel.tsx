import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Activity, 
  TrendingUp,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import type { AdminAnalyticsData } from '@/hooks/useAdminAnalytics';

interface UniversityActivityPanelProps {
  analytics: AdminAnalyticsData | null;
  isLoading?: boolean;
  expanded?: boolean;
}

export function UniversityActivityPanel({ 
  analytics, 
  isLoading,
  expanded 
}: UniversityActivityPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-40" />
            <div className="h-[300px] bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const dailyUsage = analytics?.dailyUsage || [];
  const toolUsage = analytics?.toolUsage || [];

  // Format data for charts
  const chartData = dailyUsage.map(day => ({
    date: format(new Date(day.date), 'MMM d'),
    events: day.total_events,
    users: day.unique_users
  }));

  // Group tool usage by tool name
  const toolGroups = toolUsage.reduce((acc, item) => {
    if (!acc[item.tool_name]) {
      acc[item.tool_name] = 0;
    }
    acc[item.tool_name] += item.count;
    return acc;
  }, {} as Record<string, number>);

  const toolChartData = Object.entries(toolGroups)
    .map(([name, count]) => ({ name: formatToolName(name), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  function formatToolName(name: string): string {
    const labels: Record<string, string> = {
      'page_view': 'Page Views',
      'message_builder': 'Message Builder',
      'journey_designer': 'Journey Designer',
      'evaluate': 'Evaluator',
      'library': 'Library',
      'playground': 'AI Playground',
      'calendar': 'Calendar',
      'web_analyzer': 'Web Analyzer'
    };
    return labels[name] || name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  return (
    <div className={`grid ${expanded ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-6`}>
      {/* Activity Trend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Activity Trend (30 Days)
          </CardTitle>
          <CardDescription>
            Daily platform usage and active users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={expanded ? 400 : 250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="events" 
                  name="Events"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  name="Active Users"
                  stroke="hsl(142, 76%, 36%)" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No activity data yet</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tool Usage Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Tool Usage Breakdown
          </CardTitle>
          <CardDescription>
            Most used platform features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {toolChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={expanded ? 400 : 250}>
              <BarChart data={toolChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  name="Usage Count"
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Activity className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No usage data yet</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
