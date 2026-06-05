import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/resilience.ts";

// Streaming image generation for Personal AI Workbench.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, size = "1024x1024", model = "openai/gpt-image-2" } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isGemini = model.startsWith("google/");
    const body: Record<string, unknown> = isGemini
      ? {
          model,
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
          stream: true,
        }
      : {
          model,
          prompt,
          quality: "low",
          size,
          n: 1,
          stream: true,
          partial_images: 1,
        };

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok || !resp.body) {
      const errText = await resp.text();
      console.error("Image gen error:", resp.status, errText);
      return new Response(
        JSON.stringify({ error: errText || `Image gen failed: ${resp.status}` }),
        { status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(resp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (err) {
    console.error("personal-ai-image error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Image gen failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
