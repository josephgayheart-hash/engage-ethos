import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Channel-specific image specs
const channelSpecs: Record<string, { aspect: string; style: string; description: string }> = {
  "social-media": {
    aspect: "1:1",
    style: "social media post graphic",
    description: "Square social media post image (Instagram, Facebook, LinkedIn)"
  },
  "digital-ad-social": {
    aspect: "1:1",
    style: "paid social media advertisement visual",
    description: "Social ad creative (Meta, LinkedIn) — eye-catching, conversion-focused"
  },
  "email": {
    aspect: "16:9",
    style: "email header banner",
    description: "Wide email hero banner — clean, branded, professional"
  },
  "landing-page": {
    aspect: "16:9",
    style: "landing page hero image",
    description: "Full-width hero image for a landing page — immersive, aspirational"
  },
  "direct-mail": {
    aspect: "4:3",
    style: "direct mail piece image",
    description: "Print-quality image for a direct mail piece"
  },
  "news-article": {
    aspect: "16:9",
    style: "news article featured image",
    description: "Editorial-style featured image for a news/press article"
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channel, contentSummary, audience, tenantId, profileId, messageId, goal, tone, moment, cohort, domain } = await req.json();

    if (!channel || !contentSummary) {
      return new Response(JSON.stringify({ error: "Missing channel or contentSummary" }), {
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch institutional branding — build strict color palette
    // Filter out app default colors that leak into profile configs
    const APP_DEFAULT_COLORS = ["#1f2a44", "#2c7a7b"];
    const addColor = (colors: string[], c: string) => {
      const normalized = c.trim().toLowerCase();
      if (c && !APP_DEFAULT_COLORS.includes(normalized) && !colors.some(x => x.toLowerCase() === normalized)) {
        colors.push(c.trim().toUpperCase());
      }
    };

    let brandContext = "";
    const brandColors: string[] = [];
    try {
      if (tenantId) {
        const { data: tenant } = await supabaseAdmin
          .from("tenants")
          .select("institution_name, primary_color, accent_color, logo_url")
          .eq("id", tenantId)
          .single();

        if (tenant) {
          brandContext += `Institution: ${tenant.institution_name}.`;
          if (tenant.primary_color) addColor(brandColors, tenant.primary_color);
          if (tenant.accent_color) addColor(brandColors, tenant.accent_color);
        }
      }

      // Fetch both the selected profile AND the master university profile for full color palette
      const queries: Promise<any>[] = [];
      if (profileId) {
        queries.push(supabaseAdmin.from("institutional_profiles").select("name, config, parent_profile_id, profile_type").eq("id", profileId).single());
      }
      if (tenantId) {
        queries.push(supabaseAdmin.from("institutional_profiles").select("name, config, parent_profile_id, profile_type").eq("tenant_id", tenantId).eq("profile_type", "university").limit(1).single());
      }

      const results = await Promise.all(queries);
      for (const { data: profile } of results) {
        if (profile?.config) {
          const cfg = profile.config as Record<string, any>;
          if (cfg.mascot && !brandContext.includes("Mascot")) brandContext += ` Mascot: ${cfg.mascot}.`;
          if (cfg.slogans?.length && !brandContext.includes("Slogan")) brandContext += ` Slogan: "${cfg.slogans[0]}".`;
          if (cfg.institutionName && !brandContext.includes("Full name")) brandContext += ` Full name: ${cfg.institutionName}.`;
          if (cfg.primaryColor) addColor(brandColors, cfg.primaryColor);
          if (cfg.secondaryColor) addColor(brandColors, cfg.secondaryColor);
          if (cfg.accentColor) addColor(brandColors, cfg.accentColor);
          if (cfg.tertiaryColor) addColor(brandColors, cfg.tertiaryColor);
        }
      }
    } catch (e) {
      console.warn("Could not fetch branding:", e);
    }

    console.log("Resolved brand color palette:", brandColors);

    const colorPaletteInstruction = brandColors.length > 0
      ? `STRICT COLOR PALETTE — you MUST use ONLY these exact hex colors for ALL branded visual elements. The institution's official colors are: ${brandColors.join(", ")}. 
Rules:
- Clothing (t-shirts, hoodies, jerseys, scarves, hats): MUST be one of these exact hex colors
- Campus banners, flags, pennants, signage: MUST use these exact hex colors
- Architectural accents, awnings, umbrellas: MUST use these exact hex colors
- Do NOT use maroon, burgundy, crimson, navy, teal, or ANY other color unless it exactly matches one of the hex values above
- Do NOT approximate or substitute similar-looking colors — use the exact hex values provided
- White and neutral grays are acceptable for non-branded elements like buildings, sidewalks, sky`
      : "Use neutral, warm tones appropriate for higher education marketing.";

    const spec = channelSpecs[channel] || channelSpecs["social-media"];
    const audienceContext = audience ? `Target audience: ${audience}.` : "";
    const goalContext = goal ? `Communication goal: ${goal}.` : "";
    const toneContext = tone ? `Desired tone: ${tone}.` : "";
    const momentContext = moment ? `Communication moment: ${moment}.` : "";
    const cohortContext = cohort && cohort !== 'none' ? `Student cohort: ${cohort}.` : "";
    const domainContext = domain ? `Content domain: ${domain}.` : "";

    const prompt = `Generate a professional ${spec.style} for a higher education institution.

Context: ${contentSummary}
${audienceContext}
${goalContext}
${toneContext}
${momentContext}
${cohortContext}
${domainContext}
${brandContext}

${colorPaletteInstruction}

Photography direction — follow the style of real university marketing photography (think viewbooks, campaign hero shots, alumni magazines):
- Capture candid, in-the-moment scenes: a student laughing mid-conversation on a quad, a professor gesturing at a whiteboard with 2-3 engaged students, a lone student studying under a tree, a small group collaborating around a laptop in a modern library
- NEVER show people standing in a line, holding hands, linking arms, or posing symmetrically — these look artificial
- NEVER generate twins, duplicates, or people who look identical — every person should be visually distinct
- Vary body language, posture, and gaze direction — people should look naturally occupied, not aware of the camera
- Show authentic campus environments: brick pathways, green lawns, modern labs, lecture halls, coffee shops, residence halls, athletic facilities
- Use natural light — golden hour warmth, dappled shade under trees, soft overcast — avoid flat studio lighting
- Include environmental storytelling: backpacks, laptops, coffee cups, notebooks, lab equipment, sports gear
- People should be diverse in a way that feels organic to a real campus — different backgrounds, ages, body types, clothing styles — without appearing curated or posed as a diversity photo
- Brand colors MUST appear on clothing items (t-shirts, hoodies, scarves), campus banners, pennants, or architectural details — use ONLY the exact hex values from the palette above, never approximate or invent new colors
- Composition: use shallow depth of field, leading lines, rule of thirds — the hallmarks of editorial campus photography
- Aspect ratio: ${spec.aspect}
- No text, no words, no letters, no logos, no watermarks
- Professional quality: sharp focus on subject, creamy bokeh backgrounds, rich color depth
- Feel warm, authentic, and aspirational — like a spread in a top university's viewbook
- Match the tone and energy of the communication moment${toneContext ? ` — the visual should feel ${tone}` : ''}
- Imagery should resonate with the target audience${audienceContext ? ` (${audience})` : ''} and reflect their lived experience on campus`;

    console.log("Generating channel image for:", channel, "content:", contentSummary.substring(0, 100));

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI image generation failed:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Failed to generate image" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const imageDataUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageDataUrl) {
      console.error("No image in AI response");
      return new Response(JSON.stringify({ error: "No image generated" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract base64 and upload to storage
    const base64Match = imageDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return new Response(JSON.stringify({ error: "Invalid image data format" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageFormat = base64Match[1];
    const base64Data = base64Match[2];
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Store in collection-assets bucket under channel-images/
    const fileId = messageId || crypto.randomUUID();
    const filePath = `channel-images/${fileId}/${channel}.${imageFormat}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("collection-assets")
      .upload(filePath, binaryData, {
        contentType: `image/${imageFormat}`,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Failed to upload image" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from("collection-assets")
      .getPublicUrl(filePath);

    console.log("Channel image generated successfully:", publicUrl.publicUrl);

    return new Response(
      JSON.stringify({ imageUrl: publicUrl.publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-channel-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
