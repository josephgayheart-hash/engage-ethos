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

    // Fetch institutional branding
    let brandContext = "";
    try {
      if (tenantId) {
        const { data: tenant } = await supabaseAdmin
          .from("tenants")
          .select("institution_name, primary_color, accent_color, logo_url")
          .eq("id", tenantId)
          .single();

        if (tenant) {
          brandContext += `Institution: ${tenant.institution_name}.`;
          if (tenant.primary_color) brandContext += ` Primary brand color: ${tenant.primary_color}.`;
          if (tenant.accent_color) brandContext += ` Accent brand color: ${tenant.accent_color}.`;
        }
      }

      const profileQuery = profileId
        ? supabaseAdmin.from("institutional_profiles").select("name, config").eq("id", profileId).single()
        : tenantId
        ? supabaseAdmin.from("institutional_profiles").select("name, config").eq("tenant_id", tenantId).eq("profile_type", "university").limit(1).single()
        : null;

      if (profileQuery) {
        const { data: profile } = await profileQuery;
        if (profile?.config) {
          const cfg = profile.config as Record<string, any>;
          if (cfg.mascot) brandContext += ` Mascot: ${cfg.mascot}.`;
          if (cfg.slogans?.length) brandContext += ` Slogan: "${cfg.slogans[0]}".`;
          if (cfg.institutionName) brandContext += ` Full name: ${cfg.institutionName}.`;
          if (cfg.primaryColor) brandContext += ` Profile primary: ${cfg.primaryColor}.`;
          if (cfg.accentColor) brandContext += ` Profile accent: ${cfg.accentColor}.`;
        }
      }
    } catch (e) {
      console.warn("Could not fetch branding:", e);
    }

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

Requirements:
- This is a ${spec.description}
- The imagery must directly relate to the content topic — show real-world scenes that match (students, campus, events, academics, etc.)
- Naturally reflect the diversity of a modern college campus — include people of different races, ethnicities, genders, ages, and abilities in a way that feels authentic and organic, not staged or tokenizing
- Subtly incorporate the institution's brand colors into the scene through color grading, lighting, clothing, or environmental elements
- Use a polished, editorial photography style
- Aspect ratio: ${spec.aspect}
- No text, no words, no letters, no logos, no watermarks
- Professional quality suitable for institutional marketing
- Feel warm, authentic, and aspirational — like a top university marketing campaign
- Match the tone and energy of the communication moment${toneContext ? ` — the visual should feel ${tone}` : ''}
- Imagery should resonate with the target audience${audienceContext ? ` (${audience})` : ''} and reflect their experience`;

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
