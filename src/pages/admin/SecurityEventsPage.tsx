import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Home,
  Shield,
  AlertTriangle,
  AlertCircle,
  Info,
  RefreshCcw,
  Search,
  Clock,
  Filter,
  Activity
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface SecurityEvent {
  id: string;
  event_type: string;
  identifier: string | null;
  endpoint: string | null;
  severity: string;
  metadata: unknown;
  created_at: string;
}

export default function SecurityEventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      if (eventTypeFilter !== 'all') {
        query = query.eq('event_type', eventTypeFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setEvents(data || []);
    } catch (error: unknown) {
      console.error('Error fetching security events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load security events',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [severityFilter, eventTypeFilter]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'error':
      case 'critical':
        return <Badge variant="destructive">{severity}</Badge>;
      case 'warn':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">{severity}</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getEventTypeBadge = (eventType: string) => {
    const colors: Record<string, string> = {
      'rate_limit_exceeded': 'bg-red-100 text-red-800 border-red-300',
      'suspicious_activity': 'bg-orange-100 text-orange-800 border-orange-300',
      'auth_failure': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'access_denied': 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return (
      <Badge className={colors[eventType] || 'bg-gray-100 text-gray-800 border-gray-300'}>
        {eventType.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const filteredEvents = events.filter(event => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      event.event_type.toLowerCase().includes(searchLower) ||
      event.identifier?.toLowerCase().includes(searchLower) ||
      event.endpoint?.toLowerCase().includes(searchLower)
    );
  });

  const uniqueEventTypes = [...new Set(events.map(e => e.event_type))];

  const stats = {
    total: events.length,
    critical: events.filter(e => e.severity === 'critical' || e.severity === 'error').length,
    warnings: events.filter(e => e.severity === 'warn').length,
    last24h: events.filter(e => {
      const eventDate = new Date(e.created_at);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return eventDate > dayAgo;
    }).length,
  };

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]">
      {/* Header */}
      <div className="border-b border-[hsl(220,13%,88%)] bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-[hsl(220,14%,46%)] mb-2">
            <Link to="/dashboard" className="hover:text-[hsl(222,47%,11%)]">
              <Home className="w-4 h-4" />
            </Link>
            <span>/</span>
            <Link to="/admin/console" className="hover:text-[hsl(222,47%,11%)]">Admin</Link>
            <span>/</span>
            <span className="text-[hsl(222,47%,11%)]">Security Events</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-[hsl(222,47%,11%)]">Security Events</h1>
              <p className="text-[hsl(220,14%,46%)]">Monitor rate limits, suspicious activity, and security incidents</p>
            </div>
            <Badge className="bg-[hsl(222,47%,14%)]">
              <Shield className="w-3 h-3 mr-1" />
              Super Admin
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Activity className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical/Error</p>
                  <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-destructive/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.warnings}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last 24 Hours</p>
                  <p className="text-2xl font-bold">{stats.last24h}</p>
                </div>
                <Clock className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Filters</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchEvents}
                disabled={isLoading}
              >
                <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by event type, identifier, or endpoint..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Event Types</SelectItem>
                  {uniqueEventTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Events
            </CardTitle>
            <CardDescription>
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCcw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No security events found</p>
                <p className="text-sm text-muted-foreground/70">Events will appear here when they occur</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getSeverityIcon(event.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {getEventTypeBadge(event.event_type)}
                          {getSeverityBadge(event.severity)}
                        </div>
                        <div className="text-sm space-y-1">
                          {event.identifier && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">Identifier:</span>{' '}
                              <code className="text-xs bg-muted px-1 py-0.5 rounded">{event.identifier}</code>
                            </p>
                          )}
                          {event.endpoint && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">Endpoint:</span>{' '}
                              <code className="text-xs bg-muted px-1 py-0.5 rounded">{event.endpoint}</code>
                            </p>
                          )}
                          {event.metadata && typeof event.metadata === 'object' && Object.keys(event.metadata as Record<string, unknown>).length > 0 && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                                View metadata
                              </summary>
                              <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                                {JSON.stringify(event.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {format(new Date(event.created_at), 'MMM d, HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
