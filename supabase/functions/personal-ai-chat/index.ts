import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/resilience.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      message,
      history = [],
      model = "google/gemini-2.5-pro",
      systemPrompt = "You are a helpful assistant.",
      images = [],
      files = [],
      searchContext = "",
    } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // ---- Personal memory injection (profile + learned facts) ----
    let memoryBlock = "";
    try {
      const authHeader = req.headers.get("Authorization") ?? "";
      if (authHeader) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        const token = authHeader.replace("Bearer ", "");
        const { data: userData } = await supabase.auth.getUser(token);
        const uid = userData?.user?.id;
        if (uid) {
          const [{ data: prof }, { data: facts }] = await Promise.all([
            supabase.from("personal_ai_profile").select("system_prompt,memory_enabled").eq("user_id", uid).maybeSingle(),
            supabase.from("personal_ai_facts").select("fact,category").eq("user_id", uid).order("created_at", { ascending: false }).limit(80),
          ]);
          const parts: string[] = [];
          if (prof?.system_prompt?.trim()) parts.push(`# About the user (always apply)\n${prof.system_prompt.trim()}`);
          if (prof?.memory_enabled !== false && facts && facts.length) {
            const grouped: Record<string, string[]> = {};
            for (const f of facts as any[]) {
              const k = f.category || "general";
              (grouped[k] ||= []).push(`- ${f.fact}`);
            }
            const block = Object.entries(grouped).map(([k, v]) => `**${k}**\n${v.join("\n")}`).join("\n\n");
            parts.push(`# Things you remember about the user (learned across past chats)\n${block}\n\nUse these silently to personalize answers. Do not list them back unless asked.`);
          }
          if (parts.length) memoryBlock = parts.join("\n\n---\n\n");
        }
      }
    } catch (e) {
      console.warn("memory injection failed:", e);
    }

    const finalSystem = memoryBlock ? `${systemPrompt}\n\n---\n\n${memoryBlock}` : systemPrompt;

    let userContent: any;
    let textBody = String(message || "");
    if (files.length) {
      const blocks = files.map((f: any) =>
        `--- Attached file: ${f.name} ---\n${(f.text || "").slice(0, 200000)}\n--- end file ---`
      ).join("\n\n");
      textBody = `${blocks}\n\n${textBody}`;
    }
    if (searchContext) {
      textBody = `Web search results (use these as grounding, cite sources by title):\n${searchContext}\n\n---\nUser question: ${textBody}`;
    }

    if (images.length) {
      userContent = [
        { type: "text", text: textBody || "Describe / analyze the attached image(s)." },
        ...images.map((img: any) => ({ type: "image_url", image_url: { url: img.dataUrl } })),
      ];
    } else {
      userContent = textBody;
    }

    const messages = [
      { role: "system", content: finalSystem },
      ...history.slice(-30).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: userContent },
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120_000);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages, stream: true }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("AI gateway error:", resp.status, errText);
      const status = resp.status;
      const msg = status === 429
        ? "Rate limit exceeded. Try again in a moment."
        : status === 402
        ? "AI credits exhausted."
        : `AI gateway error: ${status}`;
      return new Response(JSON.stringify({ error: msg }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(resp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (err) {
    console.error("personal-ai-chat error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Chat failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
