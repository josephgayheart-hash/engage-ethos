import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const POSTHOG_HOST = "https://us.posthog.com";
const PROJECT_ID = Deno.env.get("POSTHOG_PROJECT_ID")!;
const PERSONAL_KEY = Deno.env.get("POSTHOG_PERSONAL_API_KEY")!;

async function ph(path: string, init: RequestInit = {}) {
  const res = await fetch(`${POSTHOG_HOST}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${PERSONAL_KEY}`,
      "Content-Type": "application/json",
    },
  });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`PostHog ${res.status}: ${typeof json === 'string' ? json : JSON.stringify(json).slice(0, 500)}`);
  return json;
}

async function hogql(query: string) {
  return ph(`/api/projects/${PROJECT_ID}/query/`, {
    method: "POST",
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims } = await supabase.auth.getClaims(token);
    if (!claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { data: isAdmin } = await supabase.rpc("is_super_admin", { _user_id: claims.claims.sub });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { section = "overview", days = 7 } = await req.json().catch(() => ({}));
    const d = Math.max(1, Math.min(90, Number(days) || 7));
    const since = `now() - interval ${d} day`;
    const prevSince = `now() - interval ${d * 2} day`;

    let payload: any = {};

    if (section === "overview") {
      const [
        live, today, yesterday, totals, prevTotals, daily,
        topPages, sources, devices, countries, browsers, topEvents,
        newVsReturning, hourly, exits, exceptions,
      ] = await Promise.all([
        // Live (last 5 min)
        hogql(`SELECT count(DISTINCT person_id) AS live FROM events WHERE event = '$pageview' AND timestamp > now() - interval 5 minute`),
        // Today
        hogql(`SELECT count() AS pageviews, count(DISTINCT person_id) AS visitors FROM events WHERE event = '$pageview' AND timestamp >= toStartOfDay(now())`),
        // Yesterday (same hour)
        hogql(`SELECT count() AS pageviews, count(DISTINCT person_id) AS visitors FROM events WHERE event = '$pageview' AND timestamp >= toStartOfDay(now() - interval 1 day) AND timestamp < toStartOfDay(now() - interval 1 day) + (now() - toStartOfDay(now()))`),
        // Range totals
        hogql(`SELECT count() AS pageviews, count(DISTINCT person_id) AS visitors, count(DISTINCT properties.$session_id) AS sessions FROM events WHERE event = '$pageview' AND timestamp > ${since}`),
        // Previous-period totals (for delta)
        hogql(`SELECT count() AS pageviews, count(DISTINCT person_id) AS visitors, count(DISTINCT properties.$session_id) AS sessions FROM events WHERE event = '$pageview' AND timestamp > ${prevSince} AND timestamp <= ${since}`),
        // Daily series
        hogql(`SELECT toDate(timestamp) AS day, count() AS pageviews, count(DISTINCT person_id) AS visitors FROM events WHERE event = '$pageview' AND timestamp > ${since} GROUP BY day ORDER BY day`),
        // Top pages
        hogql(`SELECT properties.$pathname AS path, count() AS views, count(DISTINCT person_id) AS visitors FROM events WHERE event = '$pageview' AND timestamp > ${since} GROUP BY path ORDER BY views DESC LIMIT 12`),
        // Acquisition sources
        hogql(`SELECT coalesce(nullIf(properties.$referring_domain, ''), 'direct') AS source, count() AS visits FROM events WHERE event = '$pageview' AND timestamp > ${since} GROUP BY source ORDER BY visits DESC LIMIT 10`),
        // Devices
        hogql(`SELECT coalesce(properties.$device_type, 'unknown') AS device, count(DISTINCT person_id) AS visitors FROM events WHERE event = '$pageview' AND timestamp > ${since} GROUP BY device ORDER BY visitors DESC`),
        // Countries
        hogql(`SELECT coalesce(properties.$geoip_country_name, 'Unknown') AS country, count(DISTINCT person_id) AS visitors FROM events WHERE event = '$pageview' AND timestamp > ${since} GROUP BY country ORDER BY visitors DESC LIMIT 10`),
        // Browsers
        hogql(`SELECT coalesce(properties.$browser, 'unknown') AS browser, count(DISTINCT person_id) AS visitors FROM events WHERE event = '$pageview' AND timestamp > ${since} GROUP BY browser ORDER BY visitors DESC LIMIT 8`),
        // Top custom events
        hogql(`SELECT event, count() AS c FROM events WHERE timestamp > ${since} AND event NOT LIKE '$%' GROUP BY event ORDER BY c DESC LIMIT 12`),
        // New vs Returning (based on first-seen vs current visit)
        hogql(`
          SELECT
            sumIf(1, person.created_at > ${since}) AS new_visitors,
            sumIf(1, person.created_at <= ${since}) AS returning_visitors
          FROM (
            SELECT DISTINCT person_id, person.created_at
            FROM events
            WHERE event = '$pageview' AND timestamp > ${since}
          )
        `),
        // Hourly heatmap (day-of-week × hour)
        hogql(`SELECT toDayOfWeek(timestamp) AS dow, toHour(timestamp) AS hour, count() AS c FROM events WHERE event = '$pageview' AND timestamp > now() - interval 14 day GROUP BY dow, hour ORDER BY dow, hour`),
        // Top exit pages (last pageview per session)
        hogql(`
          SELECT path, count() AS exits FROM (
            SELECT properties.$session_id AS sid, argMax(properties.$pathname, timestamp) AS path
            FROM events WHERE event = '$pageview' AND timestamp > ${since} AND properties.$session_id IS NOT NULL
            GROUP BY sid
          ) GROUP BY path ORDER BY exits DESC LIMIT 8
        `),
        // Exceptions (errors)
        hogql(`SELECT coalesce(properties.$exception_type, properties.$exception_message, 'unknown') AS err, count() AS c FROM events WHERE event = '$exception' AND timestamp > ${since} GROUP BY err ORDER BY c DESC LIMIT 8`),
      ]);

      payload = {
        live, today, yesterday, totals, prevTotals, daily,
        topPages, sources, devices, countries, browsers, topEvents,
        newVsReturning, hourly, exits, exceptions,
      };
    } else if (section === "replays") {
      const list = await ph(`/api/projects/${PROJECT_ID}/session_recordings/?limit=25`);
      payload = { recordings: list.results || [] };
    } else if (section === "persons") {
      const list = await ph(`/api/projects/${PROJECT_ID}/persons/?limit=25`);
      payload = { persons: list.results || [] };
    } else {
      return new Response(JSON.stringify({ error: "Unknown section" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, projectId: PROJECT_ID, section, days: d, ...payload }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
