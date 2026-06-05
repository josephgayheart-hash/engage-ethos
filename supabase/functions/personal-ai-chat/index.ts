import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/resilience.ts";

// Streaming chat for Personal AI Workbench. Supports vision (image_url parts),
// optional pre-fetched web search context, and the full Lovable AI model list.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      message,
      history = [],
      model = "google/gemini-2.5-pro",
      systemPrompt = "You are a helpful assistant.",
      images = [], // [{ name, dataUrl }]
      files = [],  // [{ name, text }]
      searchContext = "", // pre-fetched web search snippets
    } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build user content. If images attached, use vision content blocks.
    let userContent: any;
    let textBody = String(message || "");
    if (files.length) {
      const blocks = files.map((f: any) =>
        `--- Attached file: ${f.name} ---\n${(f.text || "").slice(0, 60000)}\n--- end file ---`
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
      { role: "system", content: systemPrompt },
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
