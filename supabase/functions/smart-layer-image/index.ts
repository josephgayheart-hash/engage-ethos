import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageDataUrl, overlayPattern, overlayColor, overlayOpacity, brandColors, institutionName } = await req.json();

    if (!imageDataUrl) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const colorDesc = brandColors?.length
      ? `The brand colors are: ${brandColors.join(", ")}.`
      : "";

    // Build a concise, specific pattern description
    const patternName = overlayPattern || "none";
    const patternDesc = patternName === "none"
      ? "a subtle branded geometric pattern"
      : `the "${patternName}" pattern style (color: ${overlayColor || "brand color"}, opacity: ${overlayOpacity ?? 0.5})`;

    const prompt = `Edit this branded image to create a depth-layered composite effect.

TASK: The image already has a pattern overlay applied flat on top. Keep that EXACT pattern — same style, same straight lines, same angles, same colors, same spacing. Do NOT redraw, warp, wave, or distort the pattern in any way. Simply mask/erase the pattern where it overlaps the main subject so the subject appears IN FRONT of the pattern, creating a depth/parallax effect.

RULES:
- PRESERVE the existing pattern exactly as-is — do not regenerate, redraw, or stylize it. Keep every line straight, every angle sharp, every spacing identical.
- ONLY remove/mask the pattern pixels that overlap the main subject's silhouette.
- The subject must appear crisp, sharp, and fully unobstructed in the foreground.
- The background with the pattern remains untouched behind the subject.
- Do NOT add any new pattern elements, effects, or distortions.
- Professional quality suitable for ${institutionName || "university"} marketing.
${colorDesc}

Output a single high-quality image.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: imageDataUrl },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      return new Response(JSON.stringify({ error: "No image was generated. Try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ imageUrl: generatedImageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("smart-layer-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
