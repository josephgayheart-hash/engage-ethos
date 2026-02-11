import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stage, rawText, contentDNASummary, recentDraftTitles, institutionalProfileName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!rawText || rawText.trim().length < 10) {
      return new Response(JSON.stringify({ error: "Please provide more text to work with." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── CLASSIFY STAGE ──────────────────────────────────────────────
    if (stage === "classify") {
      const systemPrompt = `You are a quick-classification assistant for CampusVoice, a higher-education communications platform. Given raw user notes, classify the intent in 1 second. Call the classify_intent tool with your result.`;

      const response = await fetch(GATEWAY_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: rawText },
          ],
          tools: [{
            type: "function",
            function: {
              name: "classify_intent",
              description: "Classify the user's raw notes into a campus communications intent.",
              parameters: {
                type: "object",
                properties: {
                  intent: {
                    type: "string",
                    enum: ["email_campaign", "sms_outreach", "journey_design", "content_review", "strategy_planning", "meeting_notes", "general_idea"],
                    description: "The detected communication intent"
                  },
                  hint_text: {
                    type: "string",
                    description: "A short, friendly one-line hint displayed to the user, e.g. 'Sounds like a yield campaign for admitted students'"
                  },
                  icon: {
                    type: "string",
                    enum: ["mail", "message-square", "map", "search", "lightbulb", "clipboard", "sparkles"],
                    description: "Icon name to display: mail for email, message-square for SMS, map for journeys, search for analysis, lightbulb for ideas, clipboard for notes, sparkles for general"
                  }
                },
                required: ["intent", "hint_text", "icon"],
                additionalProperties: false
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "classify_intent" } },
        }),
      });

      if (!response.ok) {
        const status = response.status;
        const errText = await response.text();
        console.error("Classify error:", status, errText);
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`AI gateway error: ${status}`);
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No tool call returned from classify stage");

      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ORGANIZE STAGE (streaming) ──────────────────────────────────
    if (stage === "organize") {
      let contextBlock = "";
      if (contentDNASummary) {
        contextBlock += `\n\n## Active Voice Profile\n${contentDNASummary}`;
      } else {
        contextBlock += `\n\n## Voice Profile Status\nNo Content DNA voice profile is currently active. The user should set up their Content DNA to get voice-aligned messaging.`;
      }
      if (recentDraftTitles?.length) {
        contextBlock += `\n\n## Recent Drafts in Progress\n${recentDraftTitles.map((t: string) => `• ${t}`).join("\n")}`;
      }

      let profileBlock = "";
      if (institutionalProfileName) {
        profileBlock = `\n\n## Active Institutional Profile\n${institutionalProfileName}`;
      } else {
        profileBlock = `\n\n## Institutional Profile Status\nNo institutional profile is currently configured. The user should set up their institutional profile for personalized, on-brand communications.`;
      }

      const systemPrompt = `You are an expert AI assistant for CampusVoice, a higher-education strategic communications platform. The user has dropped raw notes (meeting notes, ideas, rough thoughts) and you must organize them into actionable insights.
${contextBlock}
${profileBlock}

## Your Task

Respond in this EXACT order and format (the UI renders sections progressively):

**SUMMARY**
Write a single, warm sentence summarizing what the user seems to be working on. Start with "Sounds like..." or "It looks like..." to feel conversational.

**EXTRACTED FIELDS**
On separate lines, output these fields (skip any that aren't clear from the notes):
- Audience: [who the message targets]
- Goal: [the communication objective]
- Channel: [email, SMS, social, print, etc.]
- Timing: [any timing or deadline mentioned]
- Tone: [recommended tone based on context]

**RECOMMENDATIONS**
Provide 2-5 specific CampusVoice tool recommendations. For each, use this exact format:

### [Action Title]
[1-2 sentence description of what to do and why, grounding in research when possible]
**Tool:** [exactly one of: builder, evaluator, journey, copywriter, analyzer, content-dna, profiles]
**Why:** [1 sentence connecting to the user's specific notes]

IMPORTANT RULES for recommendations:
- If the user does NOT have an active Content DNA voice profile, ALWAYS include a recommendation to set one up using **Tool:** content-dna. Frame it as: "Your messaging will be stronger when grounded in your institution's authentic voice. Upload a few content samples to extract your DNA."
- If the user does NOT have an institutional profile configured, ALWAYS include a recommendation to configure one using **Tool:** profiles. Frame it as: "Setting up your institutional profile ensures every message reflects your school's identity, mascot, and preferred language."
- These setup recommendations should feel helpful and natural, not like error messages. Place them after the content-specific recommendations.

Be specific and reference the user's actual content. If you have their voice profile or drafts context, weave that in naturally (e.g., "Your warm, conversational voice would work well for SMS here" or "You have a draft from recently that could be extended into a journey").`;

      const response = await fetch(GATEWAY_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: rawText },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        const errText = await response.text();
        console.error("Organize error:", status, errText);
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`AI gateway error: ${status}`);
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid stage. Use "classify" or "organize".' }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("organize-scratchpad error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
