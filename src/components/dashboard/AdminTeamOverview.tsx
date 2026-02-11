import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserDashboardContext } from "@/hooks/useUserDashboardContext";
import { Users, ChevronDown, ChevronUp, ArrowRight, Activity, Sparkles, UserCheck } from "lucide-react";

interface TeamUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  last_login_at: string | null;
  status: string;
}

export function AdminTeamOverview() {
  const { isAdmin, isSuperAdmin, tenant } = useAuth();
  const { institutionalStats } = useUserDashboardContext();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const shouldRender = isAdmin && !isSuperAdmin && !!tenant?.id;

  useEffect(() => {
    if (!shouldRender || !open || users.length > 0 || !tenant?.id) return;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, last_login_at, status")
        .eq("tenant_id", tenant.id)
        .order("last_login_at", { ascending: false, nullsFirst: false })
        .limit(5);

      setUsers((data as TeamUser[]) || []);
      setLoadingUsers(false);
    };

    fetchUsers();
  }, [shouldRender, open, tenant?.id, users.length]);

  if (!shouldRender) return null;

  const stats = institutionalStats;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-primary" />
                Team Overview
              </CardTitle>
              <div className="flex items-center gap-2">
                {stats && (
                  <Badge variant="outline" className="text-xs">
                    {stats.activeUsers} active / {stats.totalUsers} total
                  </Badge>
                )}
                {open ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {stats && (
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xl font-bold font-serif">{stats.totalUsers}</p>
                  <p className="text-[10px] text-muted-foreground">Total Users</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Activity className="w-4 h-4 mx-auto mb-1 text-accent" />
                  <p className="text-xl font-bold font-serif">{stats.activeUsers}</p>
                  <p className="text-[10px] text-muted-foreground">Active (30d)</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <UserCheck className="w-4 h-4 mx-auto mb-1 text-secondary" />
                  <p className="text-xl font-bold font-serif">{stats.adoptionRate}%</p>
                  <p className="text-[10px] text-muted-foreground">Adoption</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Sparkles className="w-4 h-4 mx-auto mb-1 text-[hsl(270_70%_55%)]" />
                  <p className="text-xl font-bold font-serif">{stats.dnaCompleteness}%</p>
                  <p className="text-[10px] text-muted-foreground">DNA Complete</p>
                </div>
              </div>
            )}

            {loadingUsers ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">Recent Users</p>
                {users.map((u) => {
                  const isRecent = u.last_login_at && 
                    Date.now() - new Date(u.last_login_at).getTime() < 7 * 24 * 60 * 60 * 1000;
                  return (
                    <div key={u.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                          {u.first_name[0]}{u.last_name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{u.first_name} {u.last_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${
                          isRecent
                            ? "bg-[hsl(82_85%_45%_/_0.1)] text-[hsl(82_70%_35%)] border-[hsl(82_85%_45%_/_0.3)]"
                            : ""
                        }`}
                      >
                        {isRecent ? "Active" : u.last_login_at
                          ? new Date(u.last_login_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "Never"
                        }
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : null}

            <Button variant="outline" size="sm" asChild className="w-full">
              <Link to="/institution-dashboard">
                View Full Dashboard <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
