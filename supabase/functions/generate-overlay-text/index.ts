import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { resilientFetch, corsHeaders, handleGatewayErrorResponse } from "../_shared/resilience.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, channel, audience, tone, institutionName, goal, sceneDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    if (type === "headline") {
      systemPrompt = `You are a higher education marketing copywriter. Generate a short, compelling headline (3-8 words) for a branded image. The headline should be punchy, memorable, and appropriate for the channel and audience. Return ONLY the headline text, no quotes, no explanation.`;
    } else if (type === "cta") {
      systemPrompt = `You are a higher education marketing copywriter. Generate a short call-to-action text (2-6 words) for the bottom bar of a branded image. It should be action-oriented and compelling. Return ONLY the CTA text, no quotes, no explanation.`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = [
      sceneDescription ? `Scene: ${sceneDescription}` : null,
      institutionName ? `Institution: ${institutionName}` : null,
      channel ? `Channel: ${channel}` : null,
      audience ? `Audience: ${audience}` : null,
      tone ? `Tone: ${tone}` : null,
      goal ? `Goal: ${goal}` : null,
    ].filter(Boolean).join("\n");

    const response = await resilientFetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt || "Generate a compelling headline for a university marketing image." },
          ],
        }),
      },
      { label: "generate-overlay-text", maxRetries: 2 }
    );

    if (!response.ok) {
      return await handleGatewayErrorResponse(response, "generate-overlay-text");
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-overlay-text error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
