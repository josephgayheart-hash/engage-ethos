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
  Radio, ArrowUpRight, ArrowDownRight, AlertTriangle, Chrome, LogOut,
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

function pctDelta(curr: number, prev: number) {
  if (!prev) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

function Sparkline({ values, color = "hsl(var(--primary))" }: { values: number[]; color?: string }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const w = 100, h = 32;
  const step = w / Math.max(values.length - 1, 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(2)},${(h - (v / max) * h).toFixed(2)}`).join(" ");
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <polygon points={area} fill={color} fillOpacity="0.12" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function HeroStat({
  label, value, delta, sparkValues, accent,
}: { label: string; value: string; delta?: number; sparkValues?: number[]; accent: string }) {
  const up = delta != null && delta >= 0;
  return (
    <div className="relative rounded-xl border bg-gradient-to-br from-card to-muted/40 p-4 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: accent }} />
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex items-end justify-between gap-2 mt-1">
        <div className="text-3xl font-bold font-serif tabular-nums leading-none">{value}</div>
        {delta != null && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${up ? "text-emerald-600" : "text-rose-600"}`}>
            {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {Math.abs(delta).toFixed(0)}%
          </div>
        )}
      </div>
      {sparkValues && sparkValues.length > 0 && (
        <div className="mt-2"><Sparkline values={sparkValues} color={accent} /></div>
      )}
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

function Heatmap({ data }: { data: { dow: number; hour: number; c: number }[] }) {
  const max = Math.max(...data.map((d) => d.c), 1);
  const grid: Record<string, number> = {};
  data.forEach((d) => { grid[`${d.dow}-${d.hour}`] = d.c; });
  // PostHog toDayOfWeek: 1=Mon..7=Sun
  const dows = [1, 2, 3, 4, 5, 6, 7];
  const dowLabels = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex gap-1 pl-6 mb-1">
          {Array.from({ length: 24 }).map((_, h) => (
            <div key={h} className="w-3.5 text-[8px] text-muted-foreground text-center tabular-nums">
              {h % 6 === 0 ? h : ""}
            </div>
          ))}
        </div>
        {dows.map((dow, i) => (
          <div key={dow} className="flex items-center gap-1">
            <div className="w-5 text-[10px] text-muted-foreground">{dowLabels[i]}</div>
            {Array.from({ length: 24 }).map((_, h) => {
              const v = grid[`${dow}-${h}`] || 0;
              const intensity = v ? 0.15 + (v / max) * 0.85 : 0;
              return (
                <div
                  key={h}
                  className="w-3.5 h-3.5 rounded-[2px]"
                  style={{ backgroundColor: v ? `hsl(82 85% 45% / ${intensity})` : "hsl(var(--muted))" }}
                  title={`${dowLabels[i]} ${h}:00 — ${v} pageviews`}
                />
              );
            })}
          </div>
        ))}
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
      toastError("Failed to load PostHog data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load("overview"); /* eslint-disable-next-line */ }, [days]);
  useEffect(() => {
    if (tab === "replays" && replays === null) load("replays");
    if (tab === "persons" && persons === null) load("persons");
    // Auto-refresh live every 30s on overview
    if (tab === "overview") {
      const t = setInterval(() => load("overview"), 30_000);
      return () => clearInterval(t);
    }
    // eslint-disable-next-line
  }, [tab]);

  const overview = useMemo(() => {
    if (!data) return null;
    return {
      live: Number(rowsFromQuery(data.live)[0]?.live || 0),
      today: rowsFromQuery(data.today)[0] || {},
      yesterday: rowsFromQuery(data.yesterday)[0] || {},
      totals: rowsFromQuery(data.totals)[0] || {},
      prevTotals: rowsFromQuery(data.prevTotals)[0] || {},
      daily: rowsFromQuery(data.daily),
      topPages: rowsFromQuery(data.topPages),
      sources: rowsFromQuery(data.sources),
      devices: rowsFromQuery(data.devices),
      countries: rowsFromQuery(data.countries),
      browsers: rowsFromQuery(data.browsers),
      topEvents: rowsFromQuery(data.topEvents),
      newVsReturning: rowsFromQuery(data.newVsReturning)[0] || {},
      hourly: rowsFromQuery(data.hourly).map((r) => ({ dow: Number(r.dow), hour: Number(r.hour), c: Number(r.c) })),
      exits: rowsFromQuery(data.exits),
      exceptions: rowsFromQuery(data.exceptions),
    };
  }, [data]);

  const phProjectUrl = projectId ? `${POSTHOG_BASE}/project/${projectId}` : POSTHOG_BASE;

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="pb-3 flex-row items-start justify-between space-y-0 gap-4 bg-gradient-to-r from-muted/30 to-transparent">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" /> Website Analytics
            {overview && overview.live > 0 && (
              <Badge variant="outline" className="text-[10px] gap-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-400">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                  <span className="relative rounded-full w-1.5 h-1.5 bg-emerald-500" />
                </span>
                {overview.live} live
              </Badge>
            )}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time traffic, conversions, and product engagement — pulled live from PostHog.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
              </div>
            ) : overview ? (
              <>
                {/* Hero pulse strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <HeroStat
                    label="Live Visitors"
                    value={String(overview.live)}
                    accent="hsl(142 71% 45%)"
                  />
                  <HeroStat
                    label="Pageviews Today"
                    value={fmt(Number(overview.today.pageviews || 0))}
                    delta={pctDelta(Number(overview.today.pageviews || 0), Number(overview.yesterday.pageviews || 0))}
                    accent="hsl(82 85% 45%)"
                  />
                  <HeroStat
                    label={`Visitors (${days}d)`}
                    value={fmt(Number(overview.totals.visitors || 0))}
                    delta={pctDelta(Number(overview.totals.visitors || 0), Number(overview.prevTotals.visitors || 0))}
                    sparkValues={overview.daily.map((d: any) => Number(d.visitors || 0))}
                    accent="hsl(270 70% 55%)"
                  />
                  <HeroStat
                    label={`Pageviews (${days}d)`}
                    value={fmt(Number(overview.totals.pageviews || 0))}
                    delta={pctDelta(Number(overview.totals.pageviews || 0), Number(overview.prevTotals.pageviews || 0))}
                    sparkValues={overview.daily.map((d: any) => Number(d.pageviews || 0))}
                    accent="hsl(200 100% 50%)"
                  />
                </div>

                {/* Secondary KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-lg border p-3">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Sessions</div>
                    <div className="text-xl font-semibold mt-1 tabular-nums">{fmt(Number(overview.totals.sessions || 0))}</div>
                  </div>
                  {(() => {
                    const n = Number(overview.newVsReturning.new_visitors || 0);
                    const r = Number(overview.newVsReturning.returning_visitors || 0);
                    const total = n + r;
                    const newPct = total ? (n / total) * 100 : 0;
                    return (
                      <div className="rounded-lg border p-3 col-span-2">
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">New vs Returning</div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden flex">
                            <div className="h-full bg-primary" style={{ width: `${newPct}%` }} />
                            <div className="h-full bg-purple-500/70" style={{ width: `${100 - newPct}%` }} />
                          </div>
                          <span className="text-xs tabular-nums whitespace-nowrap">{newPct.toFixed(0)}% new</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                          <span>{fmt(n)} new</span><span>{fmt(r)} returning</span>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="rounded-lg border p-3">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Errors ({days}d)</div>
                    <div className="text-xl font-semibold mt-1 tabular-nums">{fmt(overview.exceptions.reduce((a: number, e: any) => a + Number(e.c || 0), 0))}</div>
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
                    <p className="text-xs font-medium mb-2 flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Acquisition channels</p>
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

                {/* Heatmap */}
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium flex items-center gap-1.5"><Radio className="w-3.5 h-3.5" /> Traffic heatmap (last 14 days, by day × hour)</p>
                    <span className="text-[10px] text-muted-foreground">UTC</span>
                  </div>
                  {overview.hourly.length ? <Heatmap data={overview.hourly} /> : <p className="text-xs text-muted-foreground">No data yet.</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {/* Browsers */}
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-medium mb-2 flex items-center gap-1.5"><Chrome className="w-3.5 h-3.5" /> Browsers</p>
                    {(() => {
                      const max = Math.max(...overview.browsers.map((r: any) => Number(r.visitors) || 0), 1);
                      return overview.browsers.map((r: any, i: number) => (
                        <BarRow key={i} label={r.browser} value={Number(r.visitors) || 0} max={max} />
                      ));
                    })()}
                    {!overview.browsers.length && <p className="text-xs text-muted-foreground">No data yet.</p>}
                  </div>

                  {/* Top exit pages */}
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-medium mb-2 flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" /> Top exit pages</p>
                    {(() => {
                      const max = Math.max(...overview.exits.map((r: any) => Number(r.exits) || 0), 1);
                      return overview.exits.map((r: any, i: number) => (
                        <BarRow key={i} label={r.path} value={Number(r.exits) || 0} max={max} />
                      ));
                    })()}
                    {!overview.exits.length && <p className="text-xs text-muted-foreground">No data yet.</p>}
                  </div>
                </div>

                {/* Top events + Errors */}
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-medium mb-2 flex items-center gap-1.5"><MousePointerClick className="w-3.5 h-3.5" /> Top product events</p>
                    {(() => {
                      const max = Math.max(...overview.topEvents.map((r: any) => Number(r.c) || 0), 1);
                      return overview.topEvents.map((r: any, i: number) => (
                        <BarRow key={i} label={r.event} value={Number(r.c) || 0} max={max} />
                      ));
                    })()}
                    {!overview.topEvents.length && <p className="text-xs text-muted-foreground">No custom events yet.</p>}
                  </div>

                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-medium mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Front-end errors</p>
                    {(() => {
                      const max = Math.max(...overview.exceptions.map((r: any) => Number(r.c) || 0), 1);
                      return overview.exceptions.map((r: any, i: number) => (
                        <BarRow key={i} label={r.err} value={Number(r.c) || 0} max={max} />
                      ));
                    })()}
                    {!overview.exceptions.length && <p className="text-xs text-muted-foreground">No errors captured 🎉</p>}
                  </div>
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
