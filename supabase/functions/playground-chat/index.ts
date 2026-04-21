import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/resilience.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { institutionalConfig, contentDNA, profileConfig, model, industryContext: reqIndustryContext, contentStyle: reqContentStyle, systemPrompt: reqSystemPrompt } = body;
    
    // Support both formats: { message, history } (playground) and { messages } (standalone tools)
    let message: string;
    let history: Array<{ role: string; content: string }>;
    if (body.messages && Array.isArray(body.messages)) {
      // Standalone tool format: messages array
      history = body.messages.slice(0, -1);
      message = body.messages[body.messages.length - 1]?.content || '';
    } else {
      message = body.message || '';
      history = body.history || [];
    }
    
    const industryContext = reqIndustryContext || 'higher education';
    const contentStyle = reqContentStyle || 'institutional communications';
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Playground chat request received (streaming)");
    console.log("Has institutional config:", !!institutionalConfig);
    console.log("Has content DNA:", !!contentDNA);
    console.log("Has profile config:", !!profileConfig);

    // Build the voice/style context from Content DNA
    let voiceContext = "";
    let voiceInstructions = "";
    if (contentDNA?.voiceAnalysis) {
      const va = contentDNA.voiceAnalysis;
      voiceContext = `
## 🧬 YOUR ACTIVE CONTENT DNA - USE THIS VOICE
You MUST write and advise using this institutional voice profile. This represents how the institution actually communicates:

${va.summary ? `**Voice Summary:** ${va.summary}` : ""}
${va.toneAttributes?.length ? `**Tone Characteristics:** ${va.toneAttributes.join(", ")}` : ""}
${va.sentenceStyle ? `**Writing Style:** ${va.sentenceStyle}` : ""}
${va.vocabularyLevel ? `**Vocabulary Level:** ${va.vocabularyLevel}` : ""}
${va.persuasionApproach ? `**Persuasion Style:** ${va.persuasionApproach}` : ""}
${va.emotionalRegister ? `**Emotional Register:** ${va.emotionalRegister}` : ""}
${va.keyPatterns?.length ? `**Patterns You Should Use:**
${va.keyPatterns.map((p: string) => `• ${p}`).join("\n")}` : ""}
${va.recommendedApproaches?.length ? `**Approaches That Work Well:**
${va.recommendedApproaches.map((a: string) => `• ${a}`).join("\n")}` : ""}
${va.avoidPatterns?.length ? `**⚠️ Patterns to AVOID:**
${va.avoidPatterns.map((a: string) => `• ${a}`).join("\n")}` : ""}
`;
      voiceInstructions = `
IMPORTANT: When creating ANY content, you MUST match the Content DNA voice profile. Reference specific voice elements (tone, vocabulary level, persuasion approach) in your explanations.`;
    }

    // Add custom instructions from Content DNA
    let customInstructions = "";
    if (contentDNA?.customInstructions) {
      customInstructions = `
## 📝 Custom Voice Instructions
The following are specific instructions that override general guidelines:
${contentDNA.customInstructions}
`;
    }

    // Build profile-specific context
    let profileContext = "";
    let profileInstructions = "";
    if (profileConfig) {
      const profileName = profileConfig.institutionName || "the institution";
      profileContext = `
## 🏛️ ACTIVE PROFILE: ${profileName.toUpperCase()}
You are assisting with communications for **${profileName}**. Always tailor your responses to this specific context.

${profileConfig.profileType ? `**Profile Type:** ${profileConfig.profileType}` : ""}
${profileConfig.mascot ? `**Mascot/Symbol:** ${profileConfig.mascot} (incorporate this when appropriate for school spirit)` : ""}
${profileConfig.preferredPhrases?.length ? `**Preferred Phrases (USE THESE):**
${profileConfig.preferredPhrases.map((p: string) => `• "${p}"`).join("\n")}` : ""}
${profileConfig.wordsToAvoid?.length ? `**⚠️ Words/Phrases to AVOID:**
${profileConfig.wordsToAvoid.map((w: string) => `• "${w}"`).join("\n")}` : ""}
${profileConfig.defaultTone ? `**Expected Tone:** ${profileConfig.defaultTone}` : ""}
${profileConfig.signatureElements?.length ? `**Signature Elements:**
${profileConfig.signatureElements.map((e: string) => `• ${e}`).join("\n")}` : ""}
`;
      profileInstructions = `
IMPORTANT: All content must be specifically for ${profileName}. Reference the profile's preferred phrases and avoid restricted words. If they have a mascot, consider incorporating it for spirit-related communications.`;
    }

    // Fallback to legacy institutionalConfig if no profileConfig
    let legacyContext = "";
    if (!profileConfig && institutionalConfig) {
      legacyContext = `
## Institutional Context
${institutionalConfig.institutionName ? `**Institution:** ${institutionalConfig.institutionName}` : ""}
${institutionalConfig.mascot ? `**Mascot:** ${institutionalConfig.mascot}` : ""}
${institutionalConfig.preferredPhrases?.length ? `**Preferred phrases:** ${institutionalConfig.preferredPhrases.join(", ")}` : ""}
${institutionalConfig.wordsToAvoid?.length ? `**Words to avoid:** ${institutionalConfig.wordsToAvoid.join(", ")}` : ""}
`;
    }

    // Build context summary for the AI to reference
    const contextSummary = [];
    if (profileConfig?.institutionName) contextSummary.push(`Profile: ${profileConfig.institutionName}`);
    if (contentDNA?.voiceAnalysis) contextSummary.push("Content DNA: Active");
    const contextLine = contextSummary.length > 0 
      ? `\n\n**Your current context:** ${contextSummary.join(" | ")}`
      : "";

    const systemPrompt = reqSystemPrompt || `You are an AI Copywriter — a writing and planning companion for marketers and content creators. You help them expand drafts, refine voice, brainstorm angles, and plan content based on their Content DNA and brand profile.
${profileContext}
${voiceContext}
${customInstructions}
${legacyContext}

## Your Role
You are a thinking partner for writers — not a research advisor. Help users:
- **Expand and refine** drafts (rewrite, lengthen, tighten, restructure)
- **Brainstorm** angles, headlines, hooks, and themes
- **Plan** content calendars, campaigns, and series
- **Adapt** voice and tone across channels and audiences
- **Critique** their writing constructively against their established voice

## How to Respond
${voiceInstructions}
${profileInstructions}

- When Content DNA is active, write and edit in that voice — don't lecture about frameworks
- Be a collaborator: ask brief clarifying questions when the request is ambiguous
- Default to *doing the work* (drafting, rewriting, suggesting concrete options) over explaining theory
- Keep responses focused and practical — avoid academic citations, persuasion theory, or social-proof lectures unless the user explicitly asks
- When critiquing, give specific line edits, not generic principles${contextLine}`;

    // Build conversation history
    const conversationMessages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-20), // Keep last 20 messages for context
      { role: "user", content: message }
    ];

    // Determine if this is a standalone tool call (non-streaming) vs playground (streaming)
    const isStandaloneCall = !!body.messages;

    // Determine which model to use
    const validModels = [
      'google/gemini-2.5-flash',
      'google/gemini-2.5-flash-lite', 
      'google/gemini-2.5-pro',
      'openai/gpt-5-mini'
    ];
    const selectedModel = validModels.includes(model) ? model : 'google/gemini-2.5-flash';
    console.log("Using model:", selectedModel, "streaming:", !isStandaloneCall);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: conversationMessages,
        stream: !isStandaloneCall,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    if (isStandaloneCall) {
      // Non-streaming: return JSON { reply }
      const result = await response.json();
      const reply = result.choices?.[0]?.message?.content || '';
      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response back to client");
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in playground chat:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process chat";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
