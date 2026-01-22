import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  CartesianGrid
} from 'recharts';
import { Activity, Users, Building2 } from 'lucide-react';
import { DailyUsageStats } from '@/hooks/useAdminAnalytics';

interface UsageTrendChartProps {
  data: DailyUsageStats[];
  isLoading?: boolean;
  compact?: boolean;
}

export function UsageTrendChart({ data, isLoading, compact }: UsageTrendChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Usage Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format date for display
  const formattedData = data.map(d => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  // Calculate summary stats
  const totalEvents = data.reduce((sum, d) => sum + d.total_events, 0);
  const avgDailyEvents = data.length > 0 ? Math.round(totalEvents / data.length) : 0;
  const peakDay = data.reduce((max, d) => d.total_events > max.total_events ? d : max, data[0] || { date: '', total_events: 0 });

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity (30 days)
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedData}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="total_events" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorEvents)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{totalEvents} total events</span>
            <span>{avgDailyEvents}/day avg</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Platform Activity
            </CardTitle>
            <CardDescription>Last 30 days of usage</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {totalEvents.toLocaleString()} total events
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {avgDailyEvents}/day avg
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="colorEventsLarge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Area 
                type="monotone" 
                dataKey="total_events" 
                name="Events"
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorEventsLarge)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="unique_users" 
                name="Unique Users"
                stroke="#22c55e" 
                fillOpacity={1} 
                fill="url(#colorUsers)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Unique Users</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
