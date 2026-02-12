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

    // Fetch institutional branding data
    let brandContext = "";
    if (tenantId || profileId) {
      try {
        // Get tenant branding
        if (tenantId) {
          const { data: tenant } = await supabaseAdmin
            .from("tenants")
            .select("institution_name, primary_color, accent_color, logo_url")
            .eq("id", tenantId)
            .single();

          if (tenant) {
            brandContext += `\nInstitution: ${tenant.institution_name}.`;
            if (tenant.primary_color) brandContext += ` Primary brand color: ${tenant.primary_color}.`;
            if (tenant.accent_color) brandContext += ` Accent color: ${tenant.accent_color}.`;
          }
        }

        // Get profile config for mascot, slogans, etc.
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
            if (cfg.primaryColor) brandContext += ` Brand primary: ${cfg.primaryColor}.`;
            if (cfg.accentColor) brandContext += ` Brand accent: ${cfg.accentColor}.`;
          }
        }
      } catch (e) {
        console.warn("Could not fetch branding data:", e);
      }
    }

    // Generate the image
    const typeContext = collectionType || "campaign";
    const descContext = description ? ` The collection is about: ${description}.` : "";
    const prompt = `Generate a clean, professional cover image for a higher education communications collection titled "${collectionName}" (type: ${typeContext}).${descContext}${brandContext}

Requirements:
- The image must visually represent the SPECIFIC TOPIC of "${collectionName}" — show relevant imagery (e.g. for "Student Retention" show students on campus, mentoring, academic support; for "Fall Enrollment" show campus in autumn, welcome events, etc.)
- Use a polished, editorial photography style with warm natural lighting
- If brand colors are specified, subtly incorporate them into the scene's color grading, lighting, or environmental elements (NOT as flat colored overlays)
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
