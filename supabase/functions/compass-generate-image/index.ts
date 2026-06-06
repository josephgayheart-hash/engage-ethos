import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/resilience.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const {
      prompt = "",
      title = "image",
      size = "1024x1024",
      model = "openai/gpt-image-2",
    } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const isGemini = model.startsWith("google/");
    const body: Record<string, unknown> = isGemini
      ? { model, messages: [{ role: "user", content: prompt }], modalities: ["image", "text"] }
      : { model, prompt, size, quality: "low", n: 1 };

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("gateway image error:", resp.status, t);
      return new Response(JSON.stringify({ error: `Image gateway error ${resp.status}: ${t.slice(0, 300)}` }), {
        status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const json = await resp.json();
    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image returned");

    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const uid = userData?.user?.id ?? "anon";

    const safeName = (title || "image").replace(/[^a-z0-9-_]+/gi, "-").slice(0, 60);
    const filename = `${safeName || "image"}.png`;
    const path = `${uid}/${Date.now()}-${filename}`;

    const { error: upErr } = await supabase.storage.from("compass-artifacts")
      .upload(path, new Blob([bin], { type: "image/png" }), {
        contentType: "image/png", upsert: false,
      });
    if (upErr) throw upErr;

    const { data: signed, error: signErr } = await supabase.storage
      .from("compass-artifacts").createSignedUrl(path, 60 * 60 * 24 * 7);
    if (signErr) throw signErr;

    return new Response(JSON.stringify({ url: signed.signedUrl, filename, path }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
