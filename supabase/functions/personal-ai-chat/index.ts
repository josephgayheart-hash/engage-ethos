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
            supabase.from("personal_ai_profile").select("system_prompt,memory_enabled,use_cases,about_me,response_prefs,voice_profile").eq("user_id", uid).maybeSingle(),
            supabase.from("personal_ai_facts").select("fact,category").eq("user_id", uid).order("created_at", { ascending: false }).limit(80),
          ]);
          const parts: string[] = [];
          if (prof?.system_prompt?.trim()) parts.push(`# About the user (always apply)\n${prof.system_prompt.trim()}`);
          if (prof?.about_me?.trim()) parts.push(`# About the user\n${prof.about_me.trim()}`);
          if (Array.isArray(prof?.use_cases) && prof.use_cases.length) {
            parts.push(`# Primary use cases\n${(prof.use_cases as string[]).map((u) => `- ${u}`).join("\n")}`);
          }
          if (prof?.response_prefs && typeof prof.response_prefs === "object") {
            const rp = prof.response_prefs as Record<string, unknown>;
            const lines: string[] = [];
            if (rp.length) lines.push(`- Length: ${rp.length}`);
            if (rp.format) lines.push(`- Format: ${rp.format}`);
            if (typeof rp.formality === "number") lines.push(`- Formality (1 casual → 10 formal): ${rp.formality}`);
            if (rp.banned_words) lines.push(`- Never use these words/phrases: ${rp.banned_words}`);
            if (rp.no_em_dash) lines.push(`- Do not use em dashes (—). Use commas, parens, or periods instead.`);
            if (rp.use_markdown === false) lines.push(`- Plain text only. Do not use markdown.`);
            if (lines.length) parts.push(`# Response preferences (apply to every reply)\n${lines.join("\n")}`);
          }
          if (prof?.voice_profile && typeof prof.voice_profile === "object") {
            const vp = prof.voice_profile as Record<string, unknown>;
            const vpLines: string[] = ["# The user's writing voice (mirror this when ghostwriting)"];
            if (vp.tone) vpLines.push(`Tone: ${vp.tone}`);
            if (vp.sentence_rhythm) vpLines.push(`Rhythm: ${vp.sentence_rhythm}`);
            if (Array.isArray(vp.vocabulary) && vp.vocabulary.length) vpLines.push(`Vocabulary: ${(vp.vocabulary as string[]).join(", ")}`);
            if (Array.isArray(vp.structural_habits) && vp.structural_habits.length) vpLines.push(`Structural habits:\n${(vp.structural_habits as string[]).map((s) => `- ${s}`).join("\n")}`);
            if (Array.isArray(vp.do) && vp.do.length) vpLines.push(`Do:\n${(vp.do as string[]).map((s) => `- ${s}`).join("\n")}`);
            if (Array.isArray(vp.dont) && vp.dont.length) vpLines.push(`Don't:\n${(vp.dont as string[]).map((s) => `- ${s}`).join("\n")}`);
            if (Array.isArray(vp.signature_examples) && vp.signature_examples.length) vpLines.push(`Signature phrases:\n${(vp.signature_examples as string[]).map((s) => `- "${s}"`).join("\n")}`);
            parts.push(vpLines.join("\n"));
          }
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

    // ---- Anthropic (Claude) path: call Anthropic directly and translate SSE to OpenAI-style ----
    const isAnthropic = typeof model === "string" && (model.startsWith("anthropic/") || model.startsWith("claude-"));
    if (isAnthropic) {
      const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
      if (!ANTHROPIC_API_KEY) {
        clearTimeout(timeoutId);
        return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const claudeModel = model.replace(/^anthropic\//, "");

      // Convert messages: pull system out, normalize images.
      const sys = finalSystem;
      const aMsgs = [
        ...history.slice(-30).map((m: any) => ({ role: m.role, content: m.content })),
        { role: "user", content: userContent },
      ].map((m: any) => {
        if (typeof m.content === "string") return { role: m.role, content: m.content };
        // multimodal: convert image_url -> image
        const parts = (m.content as any[]).map((p) => {
          if (p.type === "text") return { type: "text", text: p.text };
          if (p.type === "image_url") {
            const url = p.image_url?.url || "";
            const match = /^data:(.+?);base64,(.+)$/.exec(url);
            if (match) return { type: "image", source: { type: "base64", media_type: match[1], data: match[2] } };
            return { type: "image", source: { type: "url", url } };
          }
          return p;
        });
        return { role: m.role, content: parts };
      });

      const aResp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: claudeModel,
          max_tokens: 4096,
          system: sys,
          messages: aMsgs,
          stream: true,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!aResp.ok || !aResp.body) {
        const errText = await aResp.text();
        console.error("Anthropic error:", aResp.status, errText);
        const msg = aResp.status === 429 ? "Rate limit exceeded. Try again in a moment."
          : aResp.status === 401 ? "Anthropic API key is invalid."
          : aResp.status === 402 ? "Anthropic credits exhausted. Add a balance in console.anthropic.com."
          : `Anthropic error: ${aResp.status}`;
        return new Response(JSON.stringify({ error: msg }), {
          status: aResp.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Translate Anthropic SSE -> OpenAI-style SSE the frontend already parses.
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const id = `chatcmpl-${crypto.randomUUID()}`;
      const created = Math.floor(Date.now() / 1000);
      const stream = new ReadableStream({
        async start(controller2) {
          const reader = aResp.body!.getReader();
          let buf = "";
          const push = (delta: Record<string, unknown>) => {
            const obj = { id, object: "chat.completion.chunk", created, model: claudeModel, choices: [{ index: 0, delta, finish_reason: null }] };
            controller2.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
          };
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              buf += decoder.decode(value, { stream: true });
              const events = buf.split("\n\n");
              buf = events.pop() ?? "";
              for (const evt of events) {
                const dataLine = evt.split("\n").find((l) => l.startsWith("data:"));
                if (!dataLine) continue;
                const payload = dataLine.slice(5).trim();
                if (!payload || payload === "[DONE]") continue;
                try {
                  const json = JSON.parse(payload);
                  if (json.type === "content_block_delta" && json.delta?.type === "text_delta") {
                    push({ content: json.delta.text });
                  } else if (json.type === "message_stop") {
                    const finish = { id, object: "chat.completion.chunk", created, model: claudeModel, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] };
                    controller2.enqueue(encoder.encode(`data: ${JSON.stringify(finish)}\n\n`));
                  } else if (json.type === "error") {
                    push({ content: `\n\n[Anthropic error: ${json.error?.message || "unknown"}]` });
                  }
                } catch { /* ignore parse blips */ }
              }
            }
            controller2.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller2.close();
          } catch (e) {
            console.error("anthropic stream error:", e);
            controller2.error(e);
          }
        },
      });

      return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
    }

    // ---- Lovable AI Gateway path (Gemini / GPT) ----
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
