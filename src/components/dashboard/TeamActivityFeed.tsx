import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, MessageSquare, FileCheck, Image, PenTool } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveWorkspaceId } from '@/contexts/WorkspaceContext';
import { formatDistanceToNow } from 'date-fns';

interface ActivityEvent {
  id: string;
  tool_name: string;
  action: string;
  created_at: string;
  user_name?: string;
}

const TOOL_ICONS: Record<string, typeof Activity> = {
  message_builder: MessageSquare,
  evaluate: PenTool,
  image_generator: Image,
  brand_studio: Image,
};

const ACTION_LABELS: Record<string, string> = {
  generate: 'generated a message',
  evaluate: 'evaluated content',
  save: 'saved to library',
  export: 'exported content',
  approve: 'approved a template',
};

export function TeamActivityFeed() {
  const { isAdmin } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId || !isAdmin) {
      setIsLoading(false);
      return;
    }

    const fetchActivity = async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data } = await supabase
        .from('tool_usage_events')
        .select('id, tool_name, action, created_at, user_id')
        .eq('tenant_id', workspaceId)
        .neq('tool_name', 'page_view')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(8);

      if (data && data.length > 0) {
        // Fetch user names
        const userIds = [...new Set(data.map(e => e.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);

        const nameMap = new Map(
          profiles?.map(p => [p.id, `${p.first_name} ${p.last_name?.[0] || ''}.`]) || []
        );

        setEvents(data.map(e => ({
          ...e,
          user_name: nameMap.get(e.user_id) || 'A team member',
        })));
      }
      setIsLoading(false);
    };

    fetchActivity();
  }, [workspaceId, isAdmin]);

  if (!isAdmin || isLoading || events.length === 0) return null;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-[hsl(200_100%_50%)]" />
          Team Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.slice(0, 6).map((event) => {
            const Icon = TOOL_ICONS[event.tool_name] || Activity;
            const actionLabel = ACTION_LABELS[event.action] || `used ${event.tool_name?.replace(/_/g, ' ')}`;
            return (
              <div key={event.id} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 p-1 rounded bg-muted">
                  <Icon className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate">
                    <span className="font-medium">{event.user_name}</span>{' '}
                    <span className="text-muted-foreground">{actionLabel}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
