import { useState, useMemo } from 'react';
import { format, startOfMonth, subDays, subMonths, subYears, isWithinInterval, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  CartesianGrid,
} from 'recharts';
import { Activity, CalendarIcon } from 'lucide-react';
import { DailyUsageStats } from '@/hooks/useAdminAnalytics';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface UsageTrendChartProps {
  data: DailyUsageStats[];
  isLoading?: boolean;
  compact?: boolean;
}

type PresetKey = '7d' | '30d' | '90d' | '6m' | '1y' | 'custom';
type Granularity = 'day' | 'month';

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: '6m', label: '6M' },
  { key: '1y', label: '1Y' },
];

function getPresetRange(preset: PresetKey): { from: Date; to: Date } {
  const to = new Date();
  switch (preset) {
    case '7d': return { from: subDays(to, 6), to };
    case '30d': return { from: subDays(to, 29), to };
    case '90d': return { from: subDays(to, 89), to };
    case '6m': return { from: subMonths(to, 6), to };
    case '1y': return { from: subYears(to, 1), to };
    default: return { from: subDays(to, 29), to };
  }
}

export function UsageTrendChart({ data, isLoading, compact }: UsageTrendChartProps) {
  const [preset, setPreset] = useState<PresetKey>('30d');
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const activeRange = useMemo(() => {
    if (preset === 'custom' && customRange?.from && customRange?.to) {
      return { from: customRange.from, to: customRange.to };
    }
    return getPresetRange(preset === 'custom' ? '30d' : preset);
  }, [preset, customRange]);

  // Filter & aggregate data based on range + granularity
  const chartData = useMemo(() => {
    const filtered = data.filter(d => {
      try {
        const dt = parseISO(d.date);
        return isWithinInterval(dt, { start: activeRange.from, end: activeRange.to });
      } catch {
        return false;
      }
    });

    if (granularity === 'month') {
      const monthMap = new Map<string, { date: string; total_events: number; unique_users: number; unique_tenants: number }>();
      filtered.forEach(d => {
        const monthKey = format(startOfMonth(parseISO(d.date)), 'yyyy-MM-dd');
        const existing = monthMap.get(monthKey) || { date: monthKey, total_events: 0, unique_users: 0, unique_tenants: 0 };
        existing.total_events += d.total_events;
        existing.unique_users = Math.max(existing.unique_users, d.unique_users);
        existing.unique_tenants = Math.max(existing.unique_tenants, d.unique_tenants);
        monthMap.set(monthKey, existing);
      });
      return Array.from(monthMap.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(d => ({ ...d, displayDate: format(parseISO(d.date), 'MMM yyyy') }));
    }

    return filtered.map(d => ({
      ...d,
      displayDate: format(parseISO(d.date), 'MMM d'),
    }));
  }, [data, activeRange, granularity]);

  const totalEvents = chartData.reduce((sum, d) => sum + d.total_events, 0);
  const avgEvents = chartData.length > 0 ? Math.round(totalEvents / chartData.length) : 0;
  const avgLabel = granularity === 'month' ? '/mo avg' : '/day avg';

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

  if (compact) {
    const last30 = data.slice(-30).map(d => ({
      ...d,
      displayDate: format(parseISO(d.date), 'MMM d'),
    }));
    const compactTotal = last30.reduce((s, d) => s + d.total_events, 0);
    const compactAvg = last30.length > 0 ? Math.round(compactTotal / last30.length) : 0;
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
              <AreaChart data={last30}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="total_events" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorEvents)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{compactTotal} total events</span>
            <span>{compactAvg}/day avg</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rangeLabel = preset === 'custom' && customRange?.from && customRange?.to
    ? `${format(customRange.from, 'MMM d, yyyy')} – ${format(customRange.to, 'MMM d, yyyy')}`
    : `${format(activeRange.from, 'MMM d, yyyy')} – ${format(activeRange.to, 'MMM d, yyyy')}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Platform Activity
            </CardTitle>
            <CardDescription>{rangeLabel}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {totalEvents.toLocaleString()} total events
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {avgEvents}{avgLabel}
            </Badge>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <ToggleGroup
            type="single"
            value={preset}
            onValueChange={(v) => v && setPreset(v as PresetKey)}
            size="sm"
            className="bg-muted/40 rounded-md p-0.5"
          >
            {PRESETS.map(p => (
              <ToggleGroupItem
                key={p.key}
                value={p.key}
                className="h-7 px-2.5 text-xs text-muted-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
              >
                {p.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={preset === 'custom' ? 'default' : 'outline'}
                size="sm"
                className={cn('h-8 gap-1.5 text-xs', preset === 'custom' && 'shadow-sm')}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                {preset === 'custom' && customRange?.from
                  ? `${format(customRange.from, 'MMM d')}${customRange.to ? ` – ${format(customRange.to, 'MMM d')}` : ''}`
                  : 'Custom'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={customRange}
                onSelect={(range) => {
                  setCustomRange(range);
                  if (range?.from && range?.to) {
                    setPreset('custom');
                    setPopoverOpen(false);
                  }
                }}
                numberOfMonths={2}
                disabled={(date) => date > new Date() || date < subYears(new Date(), 1)}
                initialFocus
                className={cn('p-3 pointer-events-auto')}
              />
            </PopoverContent>
          </Popover>

          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">Group by:</span>
            <ToggleGroup
              type="single"
              value={granularity}
              onValueChange={(v) => v && setGranularity(v as Granularity)}
              size="sm"
              className="bg-muted/40 rounded-md p-0.5"
            >
              <ToggleGroupItem value="day" className="h-7 px-2.5 text-xs data-[state=on]:bg-background data-[state=on]:shadow-sm">Day</ToggleGroupItem>
              <ToggleGroupItem value="month" className="h-7 px-2.5 text-xs data-[state=on]:bg-background data-[state=on]:shadow-sm">Month</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              No activity in selected range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEventsLarge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="displayDate" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="total_events" name="Events" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorEventsLarge)" strokeWidth={2} />
                <Area type="monotone" dataKey="unique_users" name="Unique Users" stroke="#22c55e" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
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
