import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Activity, ExternalLink, RefreshCw, Globe, Video, Users, BarChart3,
  Eye, MousePointerClick, Smartphone, MapPin, TrendingUp, Play,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toastError } from "@/lib/errors";

const POSTHOG_BASE = "https://us.posthog.com";

type Row = Record<string, any>;
type QueryResult = { results?: any[][]; columns?: string[] };

function rowsFromQuery(q: QueryResult | undefined): Row[] {
  if (!q?.results || !q?.columns) return [];
  return q.results.map((r) => Object.fromEntries(q.columns!.map((c, i) => [c, r[i]])));
}

function fmt(n: number) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n);
}

function fmtDuration(s: number) {
  if (!s && s !== 0) return "—";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function timeAgo(iso: string) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function Sparkline({ values }: { values: number[] }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const w = 100, h = 28;
  const step = w / Math.max(values.length - 1, 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(2)},${(h - (v / max) * h).toFixed(2)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-7" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
    </svg>
  );
}

function Stat({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="text-2xl font-semibold mt-1 tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function BarRow({ label, value, max, href }: { label: string; value: number; max: number; href?: string }) {
  const pct = max ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs py-1">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          {href ? (
            <a href={href} target="_blank" rel="noreferrer" className="truncate hover:underline">{label || "—"}</a>
          ) : (
            <span className="truncate">{label || "—"}</span>
          )}
          <span className="tabular-nums text-muted-foreground">{fmt(value)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary/70" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

export function PostHogAnalyticsPanel() {
  const [tab, setTab] = useState("overview");
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [replays, setReplays] = useState<any[] | null>(null);
  const [persons, setPersons] = useState<any[] | null>(null);
  const [projectId, setProjectId] = useState<string>("");

  const load = async (section: string) => {
    setLoading(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("posthog-query", {
        body: { section, days },
      });
      if (error) throw error;
      if ((res as any)?.error) throw new Error((res as any).error);
      setProjectId((res as any).projectId || "");
      if (section === "overview") setData(res);
      if (section === "replays") setReplays((res as any).recordings || []);
      if (section === "persons") setPersons((res as any).persons || []);
    } catch (e: any) {
      toastError(e, "Failed to load PostHog data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load("overview"); /* eslint-disable-next-line */ }, [days]);
  useEffect(() => {
    if (tab === "replays" && replays === null) load("replays");
    if (tab === "persons" && persons === null) load("persons");
    // eslint-disable-next-line
  }, [tab]);

  const overview = useMemo(() => {
    if (!data) return null;
    const totals = rowsFromQuery(data.totals)[0] || {};
    const daily = rowsFromQuery(data.daily);
    const topPages = rowsFromQuery(data.topPages);
    const sources = rowsFromQuery(data.sources);
    const devices = rowsFromQuery(data.devices);
    const countries = rowsFromQuery(data.countries);
    const topEvents = rowsFromQuery(data.topEvents);
    return { totals, daily, topPages, sources, devices, countries, topEvents };
  }, [data]);

  const phProjectUrl = projectId ? `${POSTHOG_BASE}/project/${projectId}` : POSTHOG_BASE;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3 flex-row items-start justify-between space-y-0 gap-4">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" /> PostHog Analytics
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Native website analytics & session replays — pulled live from PostHog.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24h</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8" onClick={() => load(tab)} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="sm" className="h-8" asChild>
            <a href={phProjectUrl} target="_blank" rel="noreferrer">
              PostHog <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-9">
            <TabsTrigger value="overview" className="text-xs gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Overview</TabsTrigger>
            <TabsTrigger value="replays" className="text-xs gap-1.5"><Video className="w-3.5 h-3.5" /> Session Replays</TabsTrigger>
            <TabsTrigger value="persons" className="text-xs gap-1.5"><Users className="w-3.5 h-3.5" /> Persons</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            {loading && !overview ? (
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : overview ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Stat icon={Eye} label="Pageviews" value={fmt(Number(overview.totals.pageviews || 0))} sub={`Last ${days} day${days > 1 ? "s" : ""}`} />
                  <Stat icon={Users} label="Unique visitors" value={fmt(Number(overview.totals.visitors || 0))} />
                  <Stat icon={TrendingUp} label="Sessions" value={fmt(Number(overview.totals.sessions || 0))} />
                </div>

                {/* Trend */}
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Daily trend</p>
                    <span className="text-[11px] text-muted-foreground">pageviews</span>
                  </div>
                  <Sparkline values={overview.daily.map((d: any) => Number(d.pageviews || 0))} />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>{overview.daily[0]?.day || ""}</span>
                    <span>{overview.daily[overview.daily.length - 1]?.day || ""}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {/* Top pages */}
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-medium mb-2 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Top pages</p>
                    {(() => {
                      const max = Math.max(...overview.topPages.map((r: any) => Number(r.views) || 0), 1);
                      return overview.topPages.slice(0, 10).map((r: any, i: number) => (
                        <BarRow key={i} label={r.path} value={Number(r.views) || 0} max={max} />
                      ));
                    })()}
                    {!overview.topPages.length && <p className="text-xs text-muted-foreground">No data yet.</p>}
                  </div>

                  {/* Sources */}
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-medium mb-2 flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Top sources</p>
                    {(() => {
                      const max = Math.max(...overview.sources.map((r: any) => Number(r.visits) || 0), 1);
                      return overview.sources.map((r: any, i: number) => (
                        <BarRow key={i} label={r.source} value={Number(r.visits) || 0} max={max} />
                      ));
                    })()}
                    {!overview.sources.length && <p className="text-xs text-muted-foreground">No data yet.</p>}
                  </div>

                  {/* Devices */}
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-medium mb-2 flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> Devices</p>
                    {(() => {
                      const max = Math.max(...overview.devices.map((r: any) => Number(r.visitors) || 0), 1);
                      return overview.devices.map((r: any, i: number) => (
                        <BarRow key={i} label={r.device} value={Number(r.visitors) || 0} max={max} />
                      ));
                    })()}
                    {!overview.devices.length && <p className="text-xs text-muted-foreground">No data yet.</p>}
                  </div>

                  {/* Countries */}
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-medium mb-2 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Countries</p>
                    {(() => {
                      const max = Math.max(...overview.countries.map((r: any) => Number(r.visitors) || 0), 1);
                      return overview.countries.map((r: any, i: number) => (
                        <BarRow key={i} label={r.country} value={Number(r.visitors) || 0} max={max} />
                      ));
                    })()}
                    {!overview.countries.length && <p className="text-xs text-muted-foreground">No data yet.</p>}
                  </div>
                </div>

                {/* Top events */}
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-medium mb-2 flex items-center gap-1.5"><MousePointerClick className="w-3.5 h-3.5" /> Top custom events</p>
                  {(() => {
                    const max = Math.max(...overview.topEvents.map((r: any) => Number(r.c) || 0), 1);
                    return overview.topEvents.map((r: any, i: number) => (
                      <BarRow key={i} label={r.event} value={Number(r.c) || 0} max={max} />
                    ));
                  })()}
                  {!overview.topEvents.length && <p className="text-xs text-muted-foreground">No custom events yet.</p>}
                </div>
              </>
            ) : null}
          </TabsContent>

          {/* REPLAYS */}
          <TabsContent value="replays" className="mt-4">
            {loading && !replays ? (
              <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : (
              <div className="rounded-lg border divide-y">
                {(replays || []).map((r) => {
                  const url = `${phProjectUrl}/replay/${r.id}`;
                  const name = r.person?.name || r.person?.properties?.email || r.person?.distinct_ids?.[0] || "Anonymous";
                  return (
                    <div key={r.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-xs">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{name}</div>
                        <div className="text-muted-foreground truncate">
                          {timeAgo(r.start_time)} · {fmtDuration(r.recording_duration)} · {r.click_count ?? 0} clicks · {r.keypress_count ?? 0} keys
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {r.console_error_count ? <Badge variant="destructive" className="h-5">{r.console_error_count} err</Badge> : null}
                        <Button size="sm" variant="outline" className="h-7" asChild>
                          <a href={url} target="_blank" rel="noreferrer"><Play className="w-3 h-3 mr-1" /> Watch</a>
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {replays && !replays.length && (
                  <div className="p-6 text-center text-xs text-muted-foreground">No recordings yet. Replays will appear within a few minutes after sessions complete.</div>
                )}
              </div>
            )}
          </TabsContent>

          {/* PERSONS */}
          <TabsContent value="persons" className="mt-4">
            {loading && !persons ? (
              <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : (
              <div className="rounded-lg border divide-y">
                {(persons || []).map((p) => {
                  const name = p.name || p.properties?.email || p.distinct_ids?.[0] || "Anonymous";
                  const url = `${phProjectUrl}/person/${encodeURIComponent(p.distinct_ids?.[0] || "")}`;
                  return (
                    <div key={p.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-xs">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{name}</div>
                        <div className="text-muted-foreground truncate">
                          {p.properties?.email || p.distinct_ids?.[0]} · seen {timeAgo(p.created_at)}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="h-7" asChild>
                        <a href={url} target="_blank" rel="noreferrer">Open <ExternalLink className="w-3 h-3 ml-1" /></a>
                      </Button>
                    </div>
                  );
                })}
                {persons && !persons.length && (
                  <div className="p-6 text-center text-xs text-muted-foreground">No persons yet.</div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
