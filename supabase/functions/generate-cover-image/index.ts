import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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
    const {
      messageId,
      draftId,
      title,
      audience,
      moment,
      channels,
      mode,
      tenantId,
      profileId,
      tableName,
    } = await req.json();

    const targetId = messageId || draftId;
    const table = tableName || (messageId ? "personal_messages" : "user_drafts");

    if (!targetId || !title) {
      return new Response(JSON.stringify({ error: "Missing targetId or title" }), {
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

    // Fetch institutional branding + Content DNA
    let brandContext = "";
    if (tenantId || profileId) {
      try {
        if (tenantId) {
          const { data: tenant } = await supabaseAdmin
            .from("tenants")
            .select("institution_name, primary_color, accent_color")
            .eq("id", tenantId)
            .single();
          if (tenant) {
            brandContext += `\nInstitution: ${tenant.institution_name}.`;
            if (tenant.primary_color) brandContext += ` Primary brand color: ${tenant.primary_color}.`;
            if (tenant.accent_color) brandContext += ` Accent color: ${tenant.accent_color}.`;
          }
        }

        const profileQuery = profileId
          ? supabaseAdmin.from("institutional_profiles").select("id, name, config").eq("id", profileId).single()
          : tenantId
          ? supabaseAdmin.from("institutional_profiles").select("id, name, config").eq("tenant_id", tenantId).eq("profile_type", "university").limit(1).single()
          : null;

        let resolvedProfileId = profileId;
        if (profileQuery) {
          const { data: profile } = await profileQuery;
          if (profile) {
            if (!resolvedProfileId) resolvedProfileId = profile.id;
            const cfg = profile.config as Record<string, any>;
            if (cfg.mascot) brandContext += ` Mascot: ${cfg.mascot}.`;
            if (cfg.slogans?.length) brandContext += ` Slogan: "${cfg.slogans[0]}".`;
            if (cfg.primaryColor) brandContext += ` Brand primary: ${cfg.primaryColor}.`;
            if (cfg.accentColor) brandContext += ` Brand accent: ${cfg.accentColor}.`;
          }
        }

        // Fetch Content DNA for voice/brand context
        const dnaQuery = resolvedProfileId
          ? supabaseAdmin.from("content_dna_analysis").select("voice_analysis, brand_platform").eq("profile_id", resolvedProfileId).order("updated_at", { ascending: false }).limit(1).single()
          : tenantId
          ? supabaseAdmin.from("content_dna_analysis").select("voice_analysis, brand_platform").eq("tenant_id", tenantId).order("updated_at", { ascending: false }).limit(1).single()
          : null;

        if (dnaQuery) {
          const { data: dna } = await dnaQuery;
          if (dna) {
            const voice = dna.voice_analysis as Record<string, any>;
            const brand = dna.brand_platform as Record<string, any>;
            if (voice?.tone_descriptors?.length) brandContext += ` Voice tone: ${voice.tone_descriptors.slice(0, 3).join(", ")}.`;
            if (voice?.personality_traits?.length) brandContext += ` Personality: ${voice.personality_traits.slice(0, 3).join(", ")}.`;
            if (brand?.promise) brandContext += ` Brand promise: "${brand.promise}".`;
            if (brand?.pillars?.length) {
              const pillarNames = brand.pillars.map((p: any) => p.name || p).slice(0, 4);
              brandContext += ` Brand pillars: ${pillarNames.join(", ")}.`;
            }
          }
        }
      } catch (e) {
        console.warn("Could not fetch branding data:", e);
      }
    }

    // Build contextual prompt
    const audienceCtx = audience ? ` for ${audience} students` : "";
    const momentCtx = moment ? ` during ${moment}` : "";
    const channelCtx = channels?.length ? ` across ${channels.join(", ")}` : "";
    const modeLabel = mode === "journey" ? "communication journey" : "message";

    const prompt = `Generate a clean, professional thumbnail image for a higher education ${modeLabel} titled "${title}"${audienceCtx}${momentCtx}${channelCtx}.${brandContext}

Requirements:
- The image must visually represent the SPECIFIC TOPIC of "${title}" with relevant campus imagery
- Use polished, editorial university photography style with warm natural lighting
- If brand colors are specified, subtly incorporate them into the color grading and environmental elements (NOT flat overlays)
- No text, no words, no letters, no logos, no watermarks
- Composition suitable for a 16:9 thumbnail card
- Should feel like a high-quality university marketing photo
- Candid, natural poses if people are present — no staged or artificial groupings`;

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
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

    const filePath = `covers/${targetId}.${imageFormat}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("collection-assets")
      .upload(filePath, binaryData, {
        contentType: `image/${imageFormat}`,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Failed to upload cover image" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from("collection-assets")
      .getPublicUrl(filePath);

    // Update the record with the cover image URL
    const { error: updateError } = await supabaseAdmin
      .from(table)
      .update({ cover_image_url: publicUrl.publicUrl } as any)
      .eq("id", targetId);

    if (updateError) {
      console.error("DB update error:", updateError);
    }

    return new Response(
      JSON.stringify({ coverImageUrl: publicUrl.publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-cover-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
