import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/resilience.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { title = "document", html = "", full_page = true } = await req.json();
    if (!html || typeof html !== "string") {
      return new Response(JSON.stringify({ error: "html is required" }), {
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

    const isFull = /<!DOCTYPE|<html[\s>]/i.test(html);
    const finalHtml = (full_page && !isFull)
      ? `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:880px;margin:2rem auto;padding:0 1.25rem;line-height:1.6;color:#111}h1,h2,h3{line-height:1.25}img{max-width:100%;height:auto}pre{background:#f5f5f7;padding:1rem;border-radius:8px;overflow:auto}code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}a{color:#2563eb}</style></head><body>${html}</body></html>`
      : html;

    const safeName = (title || "document").replace(/[^a-z0-9-_]+/gi, "-").slice(0, 60);
    const filename = `${safeName || "page"}.html`;
    const path = `${uid}/${Date.now()}-${filename}`;

    const { error: upErr } = await supabase.storage.from("compass-artifacts")
      .upload(path, new Blob([finalHtml], { type: "text/html" }), {
        contentType: "text/html", upsert: false,
      });
    if (upErr) throw upErr;

    const { data: signed, error: signErr } = await supabase.storage
      .from("compass-artifacts").createSignedUrl(path, 60 * 60 * 24 * 7);
    if (signErr) throw signErr;

    return new Response(JSON.stringify({ url: signed.signedUrl, filename, path }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-html error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
