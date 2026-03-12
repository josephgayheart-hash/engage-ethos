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
    const { prompts, institutionName, primaryColor, accentColor, campusPhotoUrls } = await req.json();

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return new Response(JSON.stringify({ error: "Missing prompts array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const colorContext = primaryColor || accentColor
      ? `Use a color palette inspired by these brand colors: ${[primaryColor, accentColor].filter(Boolean).join(", ")}. `
      : "";

    const institutionContext = institutionName
      ? `This is for ${institutionName}. `
      : "";

    const hasCampusPhotos = Array.isArray(campusPhotoUrls) && campusPhotoUrls.length > 0;

    // Generate all images in parallel
    const imagePromises = prompts.map(async (promptText: string, index: number) => {
      try {
        // If we have a campus photo for this slot, use it as a reference for AI enhancement
        const campusPhotoUrl = hasCampusPhotos ? campusPhotoUrls[index % campusPhotoUrls.length] : null;

        const baseInstruction = `Create a professional, editorial-quality photograph for a university advancement Case for Support document. ${institutionContext}${colorContext}Style: warm, aspirational, university viewbook quality. CRITICAL RULES: NO text, NO logos, NO watermarks, NO overlays, NO university names or letters on clothing/banners/buildings. Keep clothing plain. The image should be clean, elegant, and could belong to any university. Use shallow depth-of-field and close/medium framing to keep the scene generic and universally appealing. Subject: ${promptText}`;

        let messageContent: any;

        if (campusPhotoUrl) {
          // Use the campus photo as a style/scene reference for AI enhancement
          messageContent = [
            {
              type: "text",
              text: `Using this campus photograph as a visual reference for style, lighting, and mood, create an enhanced editorial version suitable for a Case for Support document. Match the warmth, color palette, and atmosphere of the reference photo. ${baseInstruction}`,
            },
            {
              type: "image_url",
              image_url: { url: campusPhotoUrl },
            },
          ];
        } else {
          messageContent = baseInstruction;
        }

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.1-flash-image-preview",
            messages: [
              {
                role: "user",
                content: messageContent,
              },
            ],
            modalities: ["image", "text"],
          }),
        });

        if (!response.ok) {
          console.error(`Image generation failed (HTTP ${response.status})`);
          return null;
        }

        const data = await response.json();
        const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        return imageUrl || null;
      } catch (e) {
        console.error("Image generation error:", e);
        return null;
      }
    });

    const images = await Promise.all(imagePromises);

    return new Response(JSON.stringify({ images }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-pdf-images error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
