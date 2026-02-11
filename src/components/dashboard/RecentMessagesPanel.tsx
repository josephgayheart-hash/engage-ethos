import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Mail,
  MessageSquare,
  FileText,
  ChevronRight,
  FolderOpen,
  Calendar,
  LayoutGrid,
  List,
} from "lucide-react";

interface RecentMessage {
  id: string;
  title: string;
  channel: string;
  mode: string | null;
  created_at: string;
  audience: string | null;
  content: string;
  institutional_profile_id: string | null;
}

const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  sms: MessageSquare,
};

export function RecentMessagesPanel() {
  const { user, tenant } = useAuth();
  const [messages, setMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [compact, setCompact] = useState(() => {
    try { return localStorage.getItem('campusvoice_recent_compact') === 'true'; } catch { return false; }
  });

  const toggleCompact = () => {
    const next = !compact;
    setCompact(next);
    try { localStorage.setItem('campusvoice_recent_compact', String(next)); } catch {}
  };

  useEffect(() => {
    if (!user?.id || !tenant?.id) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      const { data } = await supabase
        .from("personal_messages")
        .select("id, title, channel, mode, created_at, audience, content, institutional_profile_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setMessages((data as RecentMessage[]) || []);
      setLoading(false);
    };

    fetch();
  }, [user?.id, tenant?.id]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="w-5 h-5 text-primary" />
            Recent Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="w-5 h-5 text-primary" />
            Recent Messages
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCompact}
              className="text-xs text-muted-foreground hover:text-foreground gap-1 h-7"
            >
              {compact ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link to="/library">
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No messages yet. Start by building one.
          </p>
        ) : compact ? (
          /* Compact: single-line rows */
          <div className="space-y-0.5">
            {messages.map((msg) => {
              const ChannelIcon = channelIcons[msg.channel] || FileText;
              return (
                <Link key={msg.id} to={`/library/${msg.id}`} className="block">
                  <div className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-muted/50 transition-colors">
                    <ChannelIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate flex-1">{msg.title}</span>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {new Date(msg.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Detailed: richer rows with metadata */
          <div className="space-y-1.5">
            {messages.map((msg) => {
              const ChannelIcon = channelIcons[msg.channel] || FileText;
              return (
                <Link key={msg.id} to={`/library/${msg.id}`} className="block">
                  <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group">
                    <ChannelIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate block">{msg.title}</span>
                      {msg.audience && (
                        <span className="text-xs text-muted-foreground capitalize">{msg.audience}</span>
                      )}
                    </div>
                    {msg.mode && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {msg.mode}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(msg.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
