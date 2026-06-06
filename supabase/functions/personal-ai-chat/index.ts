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

    // ---- Personal memory + tenant brand injection ----
    let memoryBlock = "";
    let tenantBrand: { name?: string; logo_url?: string | null; primary_color?: string; accent_color?: string } | null = null;
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
          const [{ data: prof }, { data: facts }, { data: profileRow }] = await Promise.all([
            supabase.from("personal_ai_profile").select("system_prompt,memory_enabled,use_cases,about_me,response_prefs,voice_profile").eq("user_id", uid).maybeSingle(),
            supabase.from("personal_ai_facts").select("fact,category").eq("user_id", uid).order("created_at", { ascending: false }).limit(80),
            supabase.from("profiles").select("tenant_id").eq("id", uid).maybeSingle(),
          ]);
          if (profileRow?.tenant_id) {
            const { data: t } = await supabase
              .from("tenants")
              .select("institution_name,logo_url,primary_color,accent_color")
              .eq("id", profileRow.tenant_id)
              .maybeSingle();
            if (t) {
              tenantBrand = {
                name: t.institution_name,
                logo_url: t.logo_url,
                primary_color: t.primary_color,
                accent_color: t.accent_color,
              };
            }
          }
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
          if (tenantBrand) {
            parts.push(
              `# Workspace brand (use for every generated artifact)\n` +
              `- Organization: ${tenantBrand.name}\n` +
              `- Primary color (use as accent): ${tenantBrand.primary_color}\n` +
              `- Secondary color: ${tenantBrand.accent_color}\n` +
              (tenantBrand.logo_url ? `- Logo URL (place on every slide/cover): ${tenantBrand.logo_url}\n` : "") +
              `When you call generate_pptx, generate_pdf, generate_docx, or generate_html, you MUST pass theme.accent = "${tenantBrand.primary_color}", theme.secondary = "${tenantBrand.accent_color}"` +
              (tenantBrand.logo_url ? `, and theme.logo_url = "${tenantBrand.logo_url}"` : "") +
              `. Never produce an unbranded deliverable.`
            );
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
      const baseMsgs = [
        ...history.slice(-30).map((m: any) => ({ role: m.role, content: m.content })),
        { role: "user", content: userContent },
      ].map((m: any) => {
        if (typeof m.content === "string") return { role: m.role, content: m.content };
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

      // Tools available to Claude
      const tools = [
        {
          name: "generate_pptx",
          description:
            "Generate a downloadable PowerPoint (.pptx) presentation. Use when the user asks for slides, a deck, a presentation, or a pitch. Return a clear title and 5-15 well-structured slides. Each slide should have either bullets (3-6 short bullets) OR a body paragraph, not both.",
      // Convert messages: pull system out, normalize images. Trim to last 10 turns to ease token pressure.
      const sys = finalSystem;
      const baseMsgs = [
        ...history.slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
        { role: "user", content: userContent },
      ].map((m: any) => {
        if (typeof m.content === "string") return { role: m.role, content: m.content };
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

      // Tools available to Claude
      const tools = [
        {
          name: "generate_pptx",
          description:
            "Generate a downloadable, fully-branded PowerPoint deck. Use whenever the user asks for slides, a deck, a pitch, or a presentation. " +
            "Produce 8-15 slides. MIX LAYOUTS — never use the same layout twice in a row. " +
            "Always pass theme.accent (workspace primary color), theme.secondary, and theme.logo_url if the workspace brand was provided in the system prompt. " +
            "Each slide MUST pick a layout: 'title' (section divider), 'bullets' (3-5 short bullets), 'two_column' (left vs right), 'stat' (1-3 big numbers with labels), 'quote' (pull quote + attribution), or 'image' (hero image with caption). " +
            "For 'stat' slides, provide a `stats` array of {value, label, sublabel}. For 'two_column' provide `left` and `right` objects with optional heading + bullets. For 'image' provide image_url. For 'quote' provide quote + attribution.",
          input_schema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Deck title shown on the cover." },
              subtitle: { type: "string" },
              author: { type: "string" },
              theme: {
                type: "object",
                properties: {
                  accent: { type: "string", description: "Hex like #0E2A47. Use workspace primary color." },
                  secondary: { type: "string", description: "Hex secondary brand color." },
                  logo_url: { type: "string", description: "Workspace logo URL (placed on every slide)." },
                  fontHead: { type: "string" },
                  fontBody: { type: "string" },
                },
              },
              slides: {
                type: "array",
                description: "Content slides (cover added automatically). 8-15 slides, mixed layouts.",
                items: {
                  type: "object",
                  properties: {
                    layout: {
                      type: "string",
                      enum: ["title", "bullets", "two_column", "stat", "quote", "image"],
                      description: "Slide layout type. Vary across the deck.",
                    },
                    title: { type: "string" },
                    subtitle: { type: "string" },
                    bullets: { type: "array", items: { type: "string" }, description: "For 'bullets' layout: 3-5 short bullets." },
                    body: { type: "string" },
                    image_url: { type: "string", description: "For 'image' or 'two_column' layout." },
                    image_caption: { type: "string" },
                    stats: {
                      type: "array",
                      description: "For 'stat' layout: 1-3 big-number callouts.",
                      items: {
                        type: "object",
                        properties: {
                          value: { type: "string", description: "Big number, e.g. '87%' or '$1.2M'." },
                          label: { type: "string", description: "Short label under the number." },
                          sublabel: { type: "string", description: "Optional smaller detail line." },
                        },
                        required: ["value", "label"],
                      },
                    },
                    quote: { type: "string", description: "For 'quote' layout: the pull quote." },
                    attribution: { type: "string", description: "Who said the quote." },
                    left: {
                      type: "object",
                      description: "For 'two_column' layout: left column content.",
                      properties: {
                        heading: { type: "string" },
                        bullets: { type: "array", items: { type: "string" } },
                        body: { type: "string" },
                      },
                    },
                    right: {
                      type: "object",
                      description: "For 'two_column' layout: right column content.",
                      properties: {
                        heading: { type: "string" },
                        bullets: { type: "array", items: { type: "string" } },
                        body: { type: "string" },
                      },
                    },
                    notes: { type: "string", description: "Optional speaker notes." },
                  },
                  required: ["layout", "title"],
                },
              },
            },
            required: ["title", "slides"],
          },
        },
        {
          name: "generate_docx",
          description:
            "Generate a downloadable Microsoft Word (.docx) document. Use when the user asks for a doc, memo, brief, report, letter, essay, or written deliverable. Structure with headings, paragraphs, bullets, and numbered lists.",
          input_schema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Document title shown at the top." },
              subtitle: { type: "string" },
              author: { type: "string" },
              blocks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["heading1", "heading2", "heading3", "paragraph", "bullets", "numbered", "quote", "page_break"],
                    },
                    text: { type: "string" },
                    items: { type: "array", items: { type: "string" } },
                  },
                  required: ["type"],
                },
              },
            },
            required: ["title", "blocks"],
          },
        },

        {
          name: "generate_html",
          description:
            "Generate a downloadable, standalone HTML page (.html). Use for landing pages, microsites, email templates, interactive demos, or any web artifact. Include all CSS inline in <style> tags. If you pass a fragment instead of a full document, set full_page=true (default) to auto-wrap it in styled boilerplate.",
          input_schema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Page/file title." },
              html: { type: "string", description: "Full HTML document OR a body fragment." },
              full_page: { type: "boolean", description: "Wrap fragment in styled <!DOCTYPE html> shell. Default true." },
            },
            required: ["title", "html"],
          },
        },
        {
          name: "generate_svg",
          description:
            "Generate a downloadable SVG vector graphic (.svg). Use for logos, icons, diagrams, illustrations, infographics, charts. Output must be valid <svg>...</svg> markup with width/height or viewBox.",
          input_schema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Graphic title / filename base." },
              svg: { type: "string", description: "Full <svg>...</svg> markup." },
            },
            required: ["title", "svg"],
          },
        },
        {
          name: "generate_pdf",
          description:
            "Generate a downloadable PDF (.pdf) document. Use for reports, one-pagers, briefs, contracts, printable deliverables. Structure with headings, paragraphs, bullets, numbered lists, and quotes.",
          input_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              subtitle: { type: "string" },
              author: { type: "string" },
              blocks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["heading1", "heading2", "heading3", "paragraph", "bullets", "numbered", "quote", "page_break"] },
                    text: { type: "string" },
                    items: { type: "array", items: { type: "string" } },
                  },
                  required: ["type"],
                },
              },
            },
            required: ["title", "blocks"],
          },
        },
        {
          name: "generate_image",
          description:
            "Generate an AI image (.png) from a text prompt. Use for photos, illustrations, concept art, mockups, hero visuals. Be vivid and specific in the prompt.",
          input_schema: {
            type: "object",
            properties: {
              prompt: { type: "string", description: "Detailed visual description." },
              title: { type: "string", description: "Filename base." },
              size: { type: "string", enum: ["1024x1024", "1024x1536", "1536x1024"], description: "Default 1024x1024." },
            },
            required: ["prompt", "title"],
          },
        },
      ];

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const id = `chatcmpl-${crypto.randomUUID()}`;
      const created = Math.floor(Date.now() / 1000);
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
      const authForward = req.headers.get("Authorization") ?? "";

      const stream = new ReadableStream({
        async start(controller2) {
          const push = (delta: Record<string, unknown>) => {
            const obj = { id, object: "chat.completion.chunk", created, model: claudeModel, choices: [{ index: 0, delta, finish_reason: null }] };
            controller2.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
          };

          // Multi-turn loop: stream Claude; if it calls a tool, execute it, append tool_result, loop again.
          let convo: any[] = baseMsgs;
          const MAX_TURNS = 4;
          try {
            for (let turn = 0; turn < MAX_TURNS; turn++) {
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
                  messages: convo,
                  tools,
                  stream: true,
                }),
                signal: controller.signal,
              });
              if (!aResp.ok || !aResp.body) {
                const errText = await aResp.text();
                console.error("Anthropic error:", aResp.status, errText);
                push({ content: `\n\n[Anthropic error ${aResp.status}]` });
                break;
              }

              const reader = aResp.body.getReader();
              let buf = "";
              // Track per-block state for this streamed message
              const blocks: Record<number, any> = {};
              let stopReason: string | null = null;

              outer: while (true) {
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
                    if (json.type === "content_block_start") {
                      const idx = json.index;
                      const cb = json.content_block;
                      if (cb.type === "text") blocks[idx] = { type: "text", text: "" };
                      else if (cb.type === "tool_use") blocks[idx] = { type: "tool_use", id: cb.id, name: cb.name, input: "" };
                    } else if (json.type === "content_block_delta") {
                      const idx = json.index;
                      const d = json.delta;
                      const b = blocks[idx];
                      if (!b) continue;
                      if (d.type === "text_delta" && b.type === "text") {
                        b.text += d.text;
                        push({ content: d.text });
                      } else if (d.type === "input_json_delta" && b.type === "tool_use") {
                        b.input += d.partial_json || "";
                      }
                    } else if (json.type === "message_delta") {
                      if (json.delta?.stop_reason) stopReason = json.delta.stop_reason;
                    } else if (json.type === "message_stop") {
                      break outer;
                    } else if (json.type === "error") {
                      push({ content: `\n\n[Anthropic error: ${json.error?.message || "unknown"}]` });
                      break outer;
                    }
                  } catch { /* ignore parse blips */ }
                }
              }

              // Build assistant message from blocks
              const assistantContent: any[] = [];
              const toolCalls: { id: string; name: string; input: any }[] = [];
              for (const idx of Object.keys(blocks).map(Number).sort((a, b) => a - b)) {
                const b = blocks[idx];
                if (b.type === "text") {
                  if (b.text) assistantContent.push({ type: "text", text: b.text });
                } else if (b.type === "tool_use") {
                  let parsed: any = {};
                  try { parsed = b.input ? JSON.parse(b.input) : {}; } catch { parsed = {}; }
                  assistantContent.push({ type: "tool_use", id: b.id, name: b.name, input: parsed });
                  toolCalls.push({ id: b.id, name: b.name, input: parsed });
                }
              }

              if (stopReason !== "tool_use" || toolCalls.length === 0) {
                // Done
                break;
              }

              // Execute tools, build tool_result content
              push({ content: `\n\n_Building your file…_\n` });
              const toolResults: any[] = [];

              // Helper: build a download-forcing URL (adds Content-Disposition: attachment)
              // and emit a marker line the frontend uses to auto-open the preview tray.
              const withDownload = (url: string, filename: string) => {
                const sep = url.includes("?") ? "&" : "?";
                return `${url}${sep}download=${encodeURIComponent(filename)}`;
              };
              const emitArtifact = (_icon: string, filename: string, url: string, _blurb: string) => {
                const dl = withDownload(url, filename);
                // Emit ONLY the hidden marker. The chat UI renders these as a
                // clickable pill that opens the file in the preview tray —
                // no inline markdown download link.
                push({ content: `\n<!--artifact:${JSON.stringify({ filename, url, downloadUrl: dl })}-->\n` });
              };

              for (const call of toolCalls) {
                try {
                  if (call.name === "generate_pptx") {
                    const r = await fetch(`${SUPABASE_URL}/functions/v1/compass-generate-pptx`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Authorization: authForward },
                      body: JSON.stringify(call.input),
                    });
                    const json = await r.json();
                    if (!r.ok) throw new Error(json.error || `status ${r.status}`);
                    emitArtifact("📎", json.filename, json.url, `${json.slide_count} slides, link valid 7 days.`);
                    toolResults.push({
                      type: "tool_result",
                      tool_use_id: call.id,
                      content: `File generated successfully. Filename: ${json.filename}. Download URL already shown to the user.`,
                    });
                  } else if (call.name === "generate_docx") {
                    const r = await fetch(`${SUPABASE_URL}/functions/v1/compass-generate-docx`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Authorization: authForward },
                      body: JSON.stringify(call.input),
                    });
                    const json = await r.json();
                    if (!r.ok) throw new Error(json.error || `status ${r.status}`);
                    emitArtifact("📄", json.filename, json.url, `Word document, link valid 7 days.`);
                    toolResults.push({
                      type: "tool_result",
                      tool_use_id: call.id,
                      content: `File generated successfully. Filename: ${json.filename}. Download URL already shown to the user.`,
                    });
                  } else if (
                    call.name === "generate_html" ||
                    call.name === "generate_svg" ||
                    call.name === "generate_pdf" ||
                    call.name === "generate_image"
                  ) {
                    const endpoint = {
                      generate_html: "compass-generate-html",
                      generate_svg: "compass-generate-svg",
                      generate_pdf: "compass-generate-pdf",
                      generate_image: "compass-generate-image",
                    }[call.name]!;
                    const icon = {
                      generate_html: "🌐",
                      generate_svg: "🎨",
                      generate_pdf: "📕",
                      generate_image: "🖼️",
                    }[call.name]!;
                    const label = {
                      generate_html: "HTML page",
                      generate_svg: "SVG graphic",
                      generate_pdf: "PDF",
                      generate_image: "image",
                    }[call.name]!;
                    const r = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Authorization: authForward },
                      body: JSON.stringify(call.input),
                    });
                    const json = await r.json();
                    if (!r.ok) throw new Error(json.error || `status ${r.status}`);
                    emitArtifact(icon, json.filename, json.url, `${label}, link valid 7 days.`);
                    toolResults.push({
                      type: "tool_result",
                      tool_use_id: call.id,
                      content: `File generated successfully. Filename: ${json.filename}. Download URL already shown to the user.`,
                    });
                  } else {
                    toolResults.push({
                      type: "tool_result",
                      tool_use_id: call.id,
                      content: `Unknown tool: ${call.name}`,
                      is_error: true,
                    });
                  }
                } catch (e) {
                  console.error("tool exec error:", e);
                  push({ content: `\n\n[Tool error: ${e instanceof Error ? e.message : "failed"}]\n\n` });
                  toolResults.push({
                    type: "tool_result",
                    tool_use_id: call.id,
                    content: `Error: ${e instanceof Error ? e.message : "failed"}`,
                    is_error: true,
                  });
                }
              }

              convo = [
                ...convo,
                { role: "assistant", content: assistantContent },
                { role: "user", content: toolResults },
              ];
              // Loop continues — Claude will produce a wrap-up reply.
            }
            clearTimeout(timeoutId);
            const finish = { id, object: "chat.completion.chunk", created, model: claudeModel, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] };
            controller2.enqueue(encoder.encode(`data: ${JSON.stringify(finish)}\n\n`));
            controller2.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller2.close();
          } catch (e) {
            console.error("anthropic stream error:", e);
            try { controller2.error(e); } catch { /* noop */ }
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
