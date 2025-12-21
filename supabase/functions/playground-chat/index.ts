import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history, institutionalConfig, contentDNA, profileConfig } = await req.json();
    
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

    const systemPrompt = `You are an expert AI messaging assistant for CampusVoice.AI, a strategic communications platform for higher education. You help create, review, and strategize student communications grounded in peer-reviewed behavioral science research.
${profileContext}
${voiceContext}
${customInstructions}
${legacyContext}

## Your Research Foundation

### The Five-Pillar Framework (Reference these in your advice)
1. **Authority Alignment** - Leverage appropriate institutional authority cues. Authority signals increase compliance when perceived as legitimate (Cialdini, 2009).

2. **Audience Susceptibility** - Different students respond to different persuasive approaches based on academic standing, enrollment status, and psychological factors (Kaptein, 2009).

3. **Cognitive Load** - Reduce complexity. The Elaboration Likelihood Model shows cognitive overload reduces message effectiveness (Petty & Cacioppo, 1986).

4. **Social Proof** - Use norms carefully. Descriptive norms can backfire if they highlight undesirable behavior prevalence.

5. **Ethical Persuasion** - Preserve student autonomy. Inform and empower, never coerce (O'Keefe).

### Key Principles
- Lead with student benefit, not institutional need
- Use specific, actionable CTAs
- Authentic personalization increases engagement
- Urgency should be real, not manufactured
- Channel matters: SMS for urgent, email for detailed
- Align timing with the academic calendar

## Your Capabilities
1. **Create Messages** - Draft complete messages in the institutional voice
2. **Review Content** - Analyze against the five-pillar framework and voice guidelines
3. **Strategy Consulting** - Help plan messaging approaches for specific scenarios
4. **Research Guidance** - Explain persuasion research and application
5. **Tool Direction** - Guide users to CampusVoice.AI tools (Evaluator, Builder, Strategy Mapper)

## Response Guidelines
${voiceInstructions}
${profileInstructions}

- **Always acknowledge your context** - When you have a profile or DNA active, reference it naturally (e.g., "Based on ${profileConfig?.institutionName || "your institution"}'s voice profile...")
- Be conversational yet professional
- Ground advice in specific research
- Provide actionable, specific recommendations
- When drafting content, write ENTIRELY in the established voice
- When reviewing content, compare against the voice profile and suggest specific improvements
- Keep responses focused and practical${contextLine}`;

    // Build conversation history
    const conversationMessages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-20), // Keep last 20 messages for context
      { role: "user", content: message }
    ];

    console.log("Calling AI gateway with streaming...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: conversationMessages,
        stream: true,
      }),
    });

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

    console.log("Streaming response back to client");

    // Return the stream directly
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
