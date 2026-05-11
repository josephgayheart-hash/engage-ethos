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
  if (!res.ok) throw new Error(`PostHog ${res.status}: ${typeof json === 'string' ? json : JSON.stringify(json)}`);
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
    // Auth: require super admin
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

    let payload: any = {};

    if (section === "overview") {
      const [totals, daily, topPages, sources, devices, countries, topEvents] = await Promise.all([
        hogql(`SELECT count() AS pageviews, count(DISTINCT person_id) AS visitors, count(DISTINCT properties.$session_id) AS sessions FROM events WHERE event = '$pageview' AND timestamp > ${since}`),
        hogql(`SELECT toDate(timestamp) AS day, count() AS pageviews, count(DISTINCT person_id) AS visitors FROM events WHERE event = '$pageview' AND timestamp > ${since} GROUP BY day ORDER BY day`),
        hogql(`SELECT properties.$pathname AS path, count() AS views, count(DISTINCT person_id) AS visitors FROM events WHERE event = '$pageview' AND timestamp > ${since} GROUP BY path ORDER BY views DESC LIMIT 15`),
        hogql(`SELECT coalesce(nullIf(properties.$referring_domain, ''), 'direct') AS source, count() AS visits FROM events WHERE event = '$pageview' AND timestamp > ${since} GROUP BY source ORDER BY visits DESC LIMIT 10`),
        hogql(`SELECT coalesce(properties.$device_type, 'unknown') AS device, count(DISTINCT person_id) AS visitors FROM events WHERE event = '$pageview' AND timestamp > ${since} GROUP BY device ORDER BY visitors DESC`),
        hogql(`SELECT coalesce(properties.$geoip_country_name, 'Unknown') AS country, count(DISTINCT person_id) AS visitors FROM events WHERE event = '$pageview' AND timestamp > ${since} GROUP BY country ORDER BY visitors DESC LIMIT 10`),
        hogql(`SELECT event, count() AS c FROM events WHERE timestamp > ${since} AND event NOT LIKE '$%' GROUP BY event ORDER BY c DESC LIMIT 15`),
      ]);
      payload = { totals, daily, topPages, sources, devices, countries, topEvents };
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
