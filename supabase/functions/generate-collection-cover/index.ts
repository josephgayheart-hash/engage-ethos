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
    const { collectionId, collectionName, collectionType, description, tenantId, profileId } = await req.json();

    if (!collectionId || !collectionName) {
      return new Response(JSON.stringify({ error: "Missing collectionId or collectionName" }), {
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

    // ── Parallel DB fetch: tenant, profile, and DNA all at once ──
    let brandContext = "";

    const tenantPromise = tenantId
      ? supabaseAdmin.from("tenants").select("institution_name, primary_color, accent_color, logo_url").eq("id", tenantId).single()
      : Promise.resolve({ data: null });

    const profilePromise = profileId
      ? supabaseAdmin.from("institutional_profiles").select("name, config").eq("id", profileId).single()
      : tenantId
      ? supabaseAdmin.from("institutional_profiles").select("name, config").eq("tenant_id", tenantId).eq("profile_type", "university").limit(1).single()
      : Promise.resolve({ data: null });

    const dnaPromise = profileId
      ? supabaseAdmin.from("content_dna_analysis").select("voice_analysis, brand_platform").eq("profile_id", profileId).order("updated_at", { ascending: false }).limit(1).single()
      : tenantId
      ? supabaseAdmin.from("content_dna_analysis").select("voice_analysis, brand_platform").eq("tenant_id", tenantId).order("updated_at", { ascending: false }).limit(1).single()
      : Promise.resolve({ data: null });

    const [tenantResult, profileResult, dnaResult] = await Promise.all([
      Promise.resolve(tenantPromise).catch(e => { console.warn("Tenant fetch failed:", e); return { data: null }; }),
      Promise.resolve(profilePromise).catch(e => { console.warn("Profile fetch failed:", e); return { data: null }; }),
      Promise.resolve(dnaPromise).catch(e => { console.warn("DNA fetch failed:", e); return { data: null }; }),
    ]);

    // Process tenant
    const tenant = tenantResult.data;
    if (tenant) {
      brandContext += `\nInstitution: ${tenant.institution_name}.`;
      if (tenant.primary_color) brandContext += ` Primary brand color: ${tenant.primary_color}.`;
      if (tenant.accent_color) brandContext += ` Accent color: ${tenant.accent_color}.`;
    }

    // Process profile
    const profile = profileResult.data;
    if (profile) {
      const cfg = profile.config as Record<string, any>;
      if (cfg.mascot) brandContext += ` Mascot: ${cfg.mascot}.`;
      if (cfg.slogans?.length) brandContext += ` Slogan: "${cfg.slogans[0]}".`;
      if (cfg.primaryColor) brandContext += ` Brand primary: ${cfg.primaryColor}.`;
      if (cfg.accentColor) brandContext += ` Brand accent: ${cfg.accentColor}.`;
      if (cfg.secondaryColor) brandContext += ` Brand secondary: ${cfg.secondaryColor}.`;
      if (cfg.tertiaryColor) brandContext += ` Brand tertiary: ${cfg.tertiaryColor}.`;
    }

    // Process DNA
    const dna = dnaResult.data;
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

    // Generate the image
    const typeContext = collectionType || "campaign";
    const descContext = description ? ` The collection is about: ${description}.` : "";
    const prompt = `Generate a clean, professional cover image for a higher education communications collection titled "${collectionName}" (type: ${typeContext}).${descContext}${brandContext}

Requirements:
- The image must visually represent the SPECIFIC TOPIC of "${collectionName}" — show relevant imagery
- Use a polished, editorial photography style with warm natural lighting
- If brand colors are specified, subtly incorporate them into the scene's color grading (NOT as flat colored overlays)
- No text, no words, no letters, no watermarks
- Composition suitable for a 16:9 thumbnail card
- Should feel like a high-quality university marketing photo`;

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

    // Extract base64 data and upload to storage
    const base64Match = imageDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return new Response(JSON.stringify({ error: "Invalid image data format" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageFormat = base64Match[1];
    const base64Data = base64Match[2];
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const filePath = `${collectionId}/cover.${imageFormat}`;
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

    // Update the collection with the cover image URL
    const { error: updateError } = await supabaseAdmin
      .from("library_collections")
      .update({ cover_image_url: publicUrl.publicUrl })
      .eq("id", collectionId);

    if (updateError) {
      console.error("DB update error:", updateError);
    }

    return new Response(
      JSON.stringify({ coverImageUrl: publicUrl.publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-collection-cover error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
