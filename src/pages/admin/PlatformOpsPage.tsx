import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { EXCLUDED_USER_IDS } from "@/lib/analyticsExclusions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WaveBackground } from "@/components/WaveBackground";
import { PostHogAnalyticsPanel } from "@/components/platform/PostHogAnalyticsPanel";
import {
  Activity, Users, Building2, TrendingUp, RefreshCw, AlertTriangle,
  Mail, Shield, FileSignature, Database, Inbox, MessageSquare, ExternalLink, Server, Sparkles,
} from "lucide-react";

type Counts = { total: number; recent: number };

const DAYS = 30;
const EXCLUDED = `(${EXCLUDED_USER_IDS.join(",")})`;

function usePlatformMetrics() {
  return useQuery({
    queryKey: ["platform-ops-metrics"],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const since30 = subDays(new Date(), 30).toISOString();
      const since7 = subDays(new Date(), 7).toISOString();
      const since1 = subDays(new Date(), 1).toISOString();

      const [
        tenantsCount, tenantsList,
        profilesCount, profilesRecent, profilesActive7, profilesActive30,
        eventsRecent, eventsTotal24h,
        onboardingPending, betaNew,
        recentLogins, securityEvents24h,
      ] = await Promise.all([
        supabase.from("tenants").select("id", { count: "exact", head: true }),
        supabase.from("tenants").select("id, institution_name, tenant_type, created_at").order("created_at", { ascending: false }).limit(500),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id, first_name, last_name, email, created_at, tenant_id")
          .gte("created_at", since30).order("created_at", { ascending: false }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("last_login_at", since7),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("last_login_at", since30),
        supabase.from("tool_usage_events")
          .select("id, tool_name, action, created_at, tenant_id, user_id")
          .gte("created_at", since30)
          .neq("tool_name", "page_view")
          .not("user_id", "in", EXCLUDED)
          .order("created_at", { ascending: false })
          .limit(5000),
        supabase.from("tool_usage_events").select("id", { count: "exact", head: true })
          .gte("created_at", since1).neq("tool_name", "page_view")
          .not("user_id", "in", EXCLUDED),
        supabase.from("onboarding_requests").select("id, first_name, last_name, email, institution_name_input, submitted_at, request_type", { count: "exact" })
          .eq("request_status", "submitted").order("submitted_at", { ascending: false }).limit(5),
        supabase.from("beta_feedback").select("id, feature_area, rating, feedback_text, created_at, status", { count: "exact" })
          .eq("status", "new").order("created_at", { ascending: false }).limit(5),
        supabase.from("profiles").select("id, first_name, last_name, email, last_login_at, tenant_id")
          .not("last_login_at", "is", null)
          .order("last_login_at", { ascending: false }).limit(10),
        supabase.from("security_events").select("id", { count: "exact", head: true })
          .gte("created_at", since1).in("severity", ["warn", "error", "critical"]),
      ]);

      return {
        tenants: { total: tenantsCount.count ?? 0, list: tenantsList.data ?? [] },
        users: {
          total: profilesCount.count ?? 0,
          new30d: profilesRecent.data ?? [],
          active7: profilesActive7.count ?? 0,
          active30: profilesActive30.count ?? 0,
        },
        events: { recent: eventsRecent.data ?? [], last24h: eventsTotal24h.count ?? 0 },
        onboardingPending: { rows: onboardingPending.data ?? [], count: onboardingPending.count ?? 0 },
        betaNew: { rows: betaNew.data ?? [], count: betaNew.count ?? 0 },
        recentLogins: recentLogins.data ?? [],
        securityCount24h: securityEvents24h.count ?? 0,
      };
    },
  });
}

function StatCard({
  icon: Icon, label, value, sublabel, accent = "primary",
}: { icon: any; label: string; value: string | number; sublabel?: string; accent?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold font-serif mt-1">{value}</p>
          {sublabel && <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>}
        </div>
        <div className={`p-2 rounded-md bg-${accent}/10`}>
          <Icon className={`w-4 h-4 text-${accent}`} />
        </div>
      </div>
    </Card>
  );
}

function buildDailySeries(events: { created_at: string; user_id: string }[]) {
  const days: { date: string; runs: number; users: Set<string> }[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = startOfDay(subDays(new Date(), i));
    days.push({ date: format(d, "MMM d"), runs: 0, users: new Set<string>() });
  }
  const today = startOfDay(new Date()).getTime();
  events.forEach((e) => {
    const t = startOfDay(new Date(e.created_at)).getTime();
    const idx = DAYS - 1 - Math.floor((today - t) / 86400000);
    if (idx >= 0 && idx < DAYS) {
      days[idx].runs += 1;
      days[idx].users.add(e.user_id);
    }
  });
  return days.map((d) => ({ date: d.date, runs: d.runs, dau: d.users.size }));
}

function buildSignupSeries(profiles: { created_at: string }[]) {
  const days: { date: string; signups: number }[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = startOfDay(subDays(new Date(), i));
    days.push({ date: format(d, "MMM d"), signups: 0 });
  }
  const today = startOfDay(new Date()).getTime();
  profiles.forEach((p) => {
    const t = startOfDay(new Date(p.created_at)).getTime();
    const idx = DAYS - 1 - Math.floor((today - t) / 86400000);
    if (idx >= 0 && idx < DAYS) days[idx].signups += 1;
  });
  return days;
}

function buildTopTools(events: { tool_name: string }[]) {
  const counts = new Map<string, number>();
  events.forEach((e) => counts.set(e.tool_name, (counts.get(e.tool_name) ?? 0) + 1));
  return Array.from(counts.entries())
    .map(([tool, runs]) => ({ tool: tool.replace(/_/g, " "), runs }))
    .sort((a, b) => b.runs - a.runs).slice(0, 10);
}

function buildTenantActivity(
  events: { tenant_id: string; user_id: string; created_at: string }[],
  tenants: { id: string; institution_name: string; tenant_type: string }[],
) {
  const map = new Map<string, { runs: number; users: Set<string>; last: string }>();
  events.forEach((e) => {
    const cur = map.get(e.tenant_id) ?? { runs: 0, users: new Set<string>(), last: e.created_at };
    cur.runs += 1;
    cur.users.add(e.user_id);
    if (new Date(e.created_at) > new Date(cur.last)) cur.last = e.created_at;
    map.set(e.tenant_id, cur);
  });
  return tenants
    .map((t) => {
      const m = map.get(t.id);
      return {
        id: t.id,
        name: t.institution_name || "—",
        type: t.tenant_type,
        runs: m?.runs ?? 0,
        users: m?.users.size ?? 0,
        last: m?.last ?? null,
      };
    })
    .sort((a, b) => b.runs - a.runs).slice(0, 15);
}

const QUICK_LINKS = [
  { label: "Users", icon: Users, href: "/admin/users" },
  { label: "Onboarding Requests", icon: Inbox, href: "/admin/onboarding" },
  { label: "Beta Feedback", icon: MessageSquare, href: "/feedback" },
  { label: "Security Events", icon: Shield, href: "/admin/security-events" },
  { label: "NDA Links", icon: FileSignature, href: "/admin/nda-links" },
  { label: "QA Diagnostics", icon: Server, href: "/admin/qa" },
  { label: "AI Tech", icon: Database, href: "/admin/ai-technology" },
  { label: "Personal AI", icon: Sparkles, href: "/admin/personal-ai" },
  { label: "Admin Console", icon: Activity, href: "/admin/console" },
];

export default function PlatformOpsPage() {
  const { isSuperAdmin } = useAuth();
  const { data, isLoading, refetch, isFetching } = usePlatformMetrics();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => { document.title = "Platform Ops — CampusVoice"; }, []);

  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;

  const dailySeries = useMemo(() => data ? buildDailySeries(data.events.recent) : [], [data]);
  const signupSeries = useMemo(() => data ? buildSignupSeries(data.users.new30d) : [], [data]);
  const topTools = useMemo(() => data ? buildTopTools(data.events.recent) : [], [data]);
  const tenantActivity = useMemo(
    () => data ? buildTenantActivity(data.events.recent, data.tenants.list) : [],
    [data],
  );
  const tenantNameMap = useMemo(() => {
    const m = new Map<string, string>();
    data?.tenants.list.forEach(t => m.set(t.id, t.institution_name));
    return m;
  }, [data]);

  const activeTenants7d = useMemo(() => {
    if (!data) return 0;
    const since = Date.now() - 7 * 86400000;
    const set = new Set<string>();
    data.events.recent.forEach((e) => {
      if (new Date(e.created_at).getTime() >= since) set.add(e.tenant_id);
    });
    return set.size;
  }, [data]);

  const handleRefresh = () => { refetch(); setLastRefresh(new Date()); };

  return (
    <div className="bg-background min-h-screen">
      <WaveBackground />
      <main className="container mx-auto px-4 py-6 relative z-10 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] bg-[hsl(270_70%_55%_/_0.1)] text-[hsl(270_70%_55%)] border-[hsl(270_70%_55%_/_0.3)]">
                <Shield className="w-3 h-3 mr-1" /> Super Admin
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {window.location.hostname.includes("lovable.app") ? "Preview" : "Live"}
              </Badge>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold">Platform Operations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Health, usage, and growth signals across all CampusVoice tenants.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              Updated {format(lastRefresh, "h:mm a")}
            </span>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching} className="gap-2">
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Executive website analytics — top of dashboard */}
        <PostHogAnalyticsPanel />

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {isLoading ? (
            Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-20" />)
          ) : data && (
            <>
              <StatCard icon={Building2} label="Tenants" value={data.tenants.total} sublabel={`${activeTenants7d} active 7d`} />
              <StatCard icon={Users} label="Users" value={data.users.total} sublabel={`${data.users.active7} active 7d`} />
              <StatCard icon={TrendingUp} label="Active 30d" value={data.users.active30} sublabel="logged in" />
              <StatCard icon={Activity} label="Tool Runs 24h" value={data.events.last24h} sublabel="excl. internal" />
              <StatCard icon={Inbox} label="New Signups 7d" value={data.users.new30d.filter(u => Date.now() - new Date(u.created_at).getTime() < 7*86400000).length} sublabel="last 7 days" />
              <StatCard icon={Mail} label="Pending Access" value={data.onboardingPending.count} sublabel="onboarding requests" accent="accent" />
              <StatCard icon={AlertTriangle} label="Security Events 24h" value={data.securityCount24h} sublabel="warn / error" />
            </>
          )}
        </div>

        {/* Usage Analytics */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Platform Usage — last 30 days
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64" /> : (
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Tool runs & DAU</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={dailySeries}>
                      <defs>
                        <linearGradient id="runsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(82 85% 45%)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="hsl(82 85% 45%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(270 70% 55%)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="hsl(270 70% 55%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.floor(DAYS/6)} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 12, background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                      <Area type="monotone" dataKey="runs" stroke="hsl(82 85% 45%)" fill="url(#runsGrad)" name="Tool runs" />
                      <Area type="monotone" dataKey="dau" stroke="hsl(270 70% 55%)" fill="url(#dauGrad)" name="DAU" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">New user signups</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={signupSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.floor(DAYS/6)} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 12, background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                      <Bar dataKey="signups" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top tools + Tenant activity */}
        <div className="grid lg:grid-cols-5 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Tools (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-64" /> : topTools.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tool runs yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(220, topTools.length * 28)}>
                  <BarChart data={topTools} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="tool" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip contentStyle={{ fontSize: 12, background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="runs" fill="hsl(200 100% 50%)" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="pb-2 flex-row justify-between items-center">
              <CardTitle className="text-base">Tenant Activity (30d)</CardTitle>
              <Badge variant="outline" className="text-[10px]">{tenantActivity.length} of {data?.tenants.total ?? 0}</Badge>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-64" /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[11px] uppercase text-muted-foreground border-b">
                        <th className="text-left py-2 font-medium">Tenant</th>
                        <th className="text-left py-2 font-medium">Type</th>
                        <th className="text-right py-2 font-medium">Users</th>
                        <th className="text-right py-2 font-medium">Runs</th>
                        <th className="text-right py-2 font-medium">Last Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantActivity.map((t) => (
                        <tr key={t.id} className="border-b last:border-b-0 hover:bg-muted/30">
                          <td className="py-2 truncate max-w-[200px]">
                            <Link to={`/admin/institutions/${t.id}`} className="hover:text-primary">{t.name}</Link>
                          </td>
                          <td className="py-2"><Badge variant="outline" className="text-[10px]">{t.type}</Badge></td>
                          <td className="py-2 text-right">{t.users}</td>
                          <td className="py-2 text-right font-medium">{t.runs}</td>
                          <td className="py-2 text-right text-xs text-muted-foreground">
                            {t.last ? format(new Date(t.last), "MMM d, h:mma") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Access requests + Beta feedback + Recent logins */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2 flex-row justify-between items-center">
              <CardTitle className="text-base flex items-center gap-2"><Inbox className="w-4 h-4" /> Pending Access</CardTitle>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs"><Link to="/admin/onboarding">All <ExternalLink className="w-3 h-3 ml-1" /></Link></Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? <Skeleton className="h-32" /> : data?.onboardingPending.rows.length === 0 ? (
                <p className="text-xs text-muted-foreground">No pending requests.</p>
              ) : data?.onboardingPending.rows.map((r) => (
                <div key={r.id} className="text-sm border-b last:border-0 pb-2 last:pb-0">
                  <p className="font-medium truncate">{r.first_name} {r.last_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.institution_name_input || r.email}</p>
                  <p className="text-[10px] text-muted-foreground">{format(new Date(r.submitted_at), "MMM d, h:mma")} · {r.request_type}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex-row justify-between items-center">
              <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="w-4 h-4" /> New Beta Feedback</CardTitle>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs"><Link to="/admin/feedback">All <ExternalLink className="w-3 h-3 ml-1" /></Link></Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? <Skeleton className="h-32" /> : data?.betaNew.rows.length === 0 ? (
                <p className="text-xs text-muted-foreground">No new feedback.</p>
              ) : data?.betaNew.rows.map((r) => (
                <div key={r.id} className="text-sm border-b last:border-0 pb-2 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-xs truncate">{r.feature_area}</p>
                    {r.rating && <Badge variant="outline" className="text-[10px]">{r.rating}/5</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{r.feedback_text}</p>
                  <p className="text-[10px] text-muted-foreground">{format(new Date(r.created_at), "MMM d, h:mma")}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> Recent Logins</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {isLoading ? <Skeleton className="h-32" /> : data?.recentLogins.map((u) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-xs truncate">{u.first_name} {u.last_name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{tenantNameMap.get(u.tenant_id) || u.email}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                    {u.last_login_at ? format(new Date(u.last_login_at), "MMM d, h:mma") : "—"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>


        {/* Quick Links */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Admin Tools</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {QUICK_LINKS.map((l) => (
                <Button key={l.href} variant="outline" size="sm" asChild className="justify-start h-9">
                  <Link to={l.href}><l.icon className="w-3.5 h-3.5 mr-2" />{l.label}</Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
