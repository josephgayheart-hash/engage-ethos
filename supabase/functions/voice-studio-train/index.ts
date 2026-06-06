import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const uid = userData?.user?.id;
    if (!uid) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { samples } = await req.json();
    if (!Array.isArray(samples) || samples.length === 0) {
      return new Response(JSON.stringify({ error: "samples required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const samplesBlock = samples
      .map((s: string, i: number) => `--- Sample ${i + 1} ---\n${String(s).slice(0, 8000)}`)
      .join("\n\n");

    const systemPrompt = `You are a writing-voice analyst. The user has shared real samples of their writing. Extract a concise, useful voice profile that another AI can apply when ghostwriting in this person's voice.

Return ONLY a JSON object with this exact shape, no commentary:
{
  "tone": "string — 1–2 sentence overall tone description",
  "sentence_rhythm": "string — average length, variation, cadence patterns",
  "vocabulary": ["array of 5–10 distinctive words/phrases they use"],
  "structural_habits": ["array of 3–6 structural patterns (openings, transitions, closings)"],
  "do": ["array of 4–8 specific do rules"],
  "dont": ["array of 4–8 specific don't rules — words/patterns to avoid"],
  "signature_examples": ["array of 2–4 short verbatim phrases from the samples that capture their voice"]
}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: samplesBlock },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("AI gateway error:", resp.status, errText);
      return new Response(JSON.stringify({ error: `AI error ${resp.status}` }), {
        status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let voiceProfile: unknown;
    try {
      voiceProfile = JSON.parse(raw);
    } catch {
      voiceProfile = { tone: "Could not parse profile", raw };
    }

    await supabase
      .from("personal_ai_profile")
      .upsert({ user_id: uid, voice_profile: voiceProfile }, { onConflict: "user_id" });

    return new Response(JSON.stringify({ ok: true, voice_profile: voiceProfile }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("voice-studio-train error:", err);
    const msg = err instanceof Error ? err.message : "train failed";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
