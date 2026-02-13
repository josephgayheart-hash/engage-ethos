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
      ? `Brand colors: ${brandColors.join(", ")}.`
      : "";

    // Map pattern IDs to human-readable descriptions so the AI understands them
    const patternDescriptions: Record<string, string> = {
      "none": "geometric",
      "solid": "solid color wash",
      "gradient-vertical": "vertical gradient",
      "gradient-horizontal": "horizontal gradient",
      "gradient-diagonal": "diagonal gradient",
      "gradient-radial": "radial/circular gradient",
      "gradient-split": "split-tone gradient",
      "slice-diagonal": "diagonal slice/block of solid color",
      "corner-triangle": "triangle shape in the corner",
      "chevron": "chevron/V-shaped band",
      "band-horizontal": "horizontal color band/stripe",
      "frame": "rectangular frame/border",
      "checker-corners": "checkered blocks in the corners of the image",
      "quarter-blocks": "quarter-block color sections",
      "half-sweep": "half-sweep diagonal color block",
      "spotlight": "spotlight/vignette circle",
      "stripes": "diagonal repeating stripes",
      "dots": "repeating dot/polka-dot pattern",
      "crosshatch": "crosshatch/grid lines",
      "wave": "wavy curved bands",
      "diamond-grid": "diamond/rhombus grid pattern",
      "halftone": "halftone dot gradient pattern",
    };
    const patternName = overlayPattern || "geometric";
    const patternHumanName = patternDescriptions[patternName] || patternName;

    const prompt = `You are a photo compositor. This image has a visible overlay pattern on top of a photo. The pattern is: ${patternHumanName}.

YOUR ONLY JOB: Erase the pattern from the ENTIRE subject — not just their face, but their FULL BODY from head to toe, including arms, hands, legs, clothing, hair, and any object they are holding or directly interacting with (laptop, book, phone, instrument, backpack, etc.). The complete silhouette of the person AND their immediate objects must be pattern-free.

Think of it like Photoshop layers:
- Layer 1 (back): Original photo background
- Layer 2 (middle): The ${patternHumanName} overlay (keep it EXACTLY as it appears — do not redraw, warp, or modify)
- Layer 3 (front): The FULL subject cleanly cut out — entire body + held objects, no pattern on any part of them

CRITICAL:
- Erase the pattern from the subject's ENTIRE body outline, not just the face/head area.
- Include anything the subject is holding, sitting on, or leaning against as part of the foreground cutout.
- Keep clean, precise edges around the FULL silhouette.
- Do NOT change, redraw, or reinterpret the pattern. It stays identical to the input.
- Do NOT change the background photo.
- The pattern MUST remain fully intact and extend to ALL edges and corners of the image (top-left, top-right, bottom-left, bottom-right). Do NOT crop, trim, fade, or cut off the pattern at the edges. The pattern should fill the entire image area exactly as in the original, only removed where the subject is.
${colorDesc}

Output one high-quality image.`;

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
