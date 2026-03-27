import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface EmailRecord {
  id: string;
  nudge_type: string;
  email_type: string | null;
  subject: string | null;
  sent_at: string;
  status: string | null;
  delivery_status: string | null;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ComponentType<{ className?: string }> }> = {
  sent: { label: "Sent", variant: "default", icon: CheckCircle },
  delivered: { label: "Delivered", variant: "default", icon: CheckCircle },
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  failed: { label: "Failed", variant: "destructive", icon: AlertCircle },
};

export function EmailHistoryPanel() {
  const { user } = useAuth();
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const load = async () => {
      const { data } = await supabase
        .from("email_nudges")
        .select("id, nudge_type, email_type, subject, sent_at, status, delivery_status")
        .eq("user_id", user.id)
        .order("sent_at", { ascending: false })
        .limit(10);

      setEmails((data as EmailRecord[]) || []);
      setLoading(false);
    };

    load();
  }, [user?.id]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="w-5 h-5 text-primary" />
            Email History
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

  if (emails.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="w-5 h-5 text-primary" />
          Email History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {emails.map((email) => {
            const effectiveStatus = email.delivery_status || email.status || "sent";
            const config = statusConfig[effectiveStatus] || statusConfig.sent;
            const StatusIcon = config.icon;

            return (
              <div
                key={email.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <StatusIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm truncate block">
                    {email.subject || email.nudge_type.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {email.email_type?.replace(/_/g, " ") || email.nudge_type.replace(/_/g, " ")}
                  </span>
                </div>
                <Badge variant={config.variant} className="text-[10px] shrink-0">
                  {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(email.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
