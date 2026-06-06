import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/resilience.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { title = "graphic", svg = "" } = await req.json();
    if (!svg || typeof svg !== "string" || !/<svg[\s>]/i.test(svg)) {
      return new Response(JSON.stringify({ error: "Valid SVG markup is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const uid = userData?.user?.id ?? "anon";

    const finalSvg = svg.trim().startsWith("<?xml") ? svg : `<?xml version="1.0" encoding="UTF-8"?>\n${svg}`;
    const safeName = (title || "graphic").replace(/[^a-z0-9-_]+/gi, "-").slice(0, 60);
    const filename = `${safeName || "graphic"}.svg`;
    const path = `${uid}/${Date.now()}-${filename}`;

    const { error: upErr } = await supabase.storage.from("compass-artifacts")
      .upload(path, new Blob([finalSvg], { type: "image/svg+xml" }), {
        contentType: "image/svg+xml", upsert: false,
      });
    if (upErr) throw upErr;

    const { data: signed, error: signErr } = await supabase.storage
      .from("compass-artifacts").createSignedUrl(path, 60 * 60 * 24 * 7);
    if (signErr) throw signErr;

    return new Response(JSON.stringify({ url: signed.signedUrl, filename, path }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-svg error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
