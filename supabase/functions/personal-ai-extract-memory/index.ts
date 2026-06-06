import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/resilience.ts";

// Extracts durable, personal facts from a recent user+assistant exchange and
// upserts them into personal_ai_facts. Designed to be called fire-and-forget
// after each assistant turn.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { userMessage = "", assistantMessage = "", threadId } = await req.json();
    if (!userMessage.trim()) return new Response(JSON.stringify({ ok: true, skipped: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return new Response(JSON.stringify({ error: "unauth" }), { status: 401, headers: corsHeaders });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const uid = userData?.user?.id;
    if (!uid) return new Response(JSON.stringify({ error: "unauth" }), { status: 401, headers: corsHeaders });

    // Skip if user has memory disabled
    const { data: prof } = await supabase.from("personal_ai_profile").select("memory_enabled").eq("user_id", uid).maybeSingle();
    if (prof && prof.memory_enabled === false) return new Response(JSON.stringify({ ok: true, disabled: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Existing facts to avoid duplicates
    const { data: existing } = await supabase.from("personal_ai_facts").select("fact").eq("user_id", uid).order("created_at", { ascending: false }).limit(100);
    const existingList = (existing ?? []).map((r: any) => r.fact).join("\n- ");

    const sys = `Extract DURABLE personal facts about the USER from the conversation turn below. Only save things that are:
- Stable preferences, biographical/work facts, ongoing projects, people in their life, tools they use, recurring constraints.
NEVER save: one-off requests, transient task details, the assistant's answers, generic info, anything the user didn't actually state about themselves.
Return JSON {"facts":[{"fact":"short third-person statement","category":"identity|work|preferences|projects|people|tools|other"}]}
Return {"facts":[]} if nothing qualifies.
Do NOT repeat any of these existing facts (paraphrases count as duplicates):
- ${existingList || "(none)"}`;

    const user = `USER said:\n${userMessage.slice(0, 4000)}\n\nASSISTANT replied:\n${assistantMessage.slice(0, 2000)}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: sys }, { role: "user", content: user }],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("extract failed:", resp.status, t);
      return new Response(JSON.stringify({ error: "extract failed" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const json = await resp.json();
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }
    const facts: { fact: string; category?: string }[] = Array.isArray(parsed.facts) ? parsed.facts : [];

    const rows = facts
      .filter(f => f && typeof f.fact === "string" && f.fact.trim().length > 3 && f.fact.length < 300)
      .slice(0, 6)
      .map(f => ({
        user_id: uid,
        fact: f.fact.trim(),
        category: (f.category || "other").toString().slice(0, 32),
        source_thread_id: threadId ?? null,
      }));

    if (rows.length) {
      await supabase.from("personal_ai_facts").insert(rows);
    }
    return new Response(JSON.stringify({ ok: true, saved: rows.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("personal-ai-extract-memory error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "extract failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
