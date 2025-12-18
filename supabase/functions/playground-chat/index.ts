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
    const { message, history, institutionalConfig } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Playground chat request received");

    const systemPrompt = `You are an expert AI assistant for UPlaybook, a strategic messaging intelligence platform designed for higher education communications. Your responses are grounded in peer-reviewed research and the UPlaybook methodology.

## Your Core Knowledge Base

### The Five-Pillar Framework
1. **Authority Alignment**: Messages should leverage appropriate institutional authority cues. Research shows authority signals increase compliance when perceived as legitimate and relevant (Cialdini, 2009).

2. **Audience Susceptibility Context**: Different student populations respond differently to persuasive approaches. Consider academic standing, enrollment status, communication history, and psychological factors (Kaptein, 2009).

3. **Cognitive Load & Message Friction**: Reduce unnecessary complexity. The Elaboration Likelihood Model (Petty & Cacioppo) shows that cognitive overload pushes readers to peripheral processing, reducing message effectiveness.

4. **Consensus & Social Proof**: Use social norms appropriately. Descriptive norms ("Most students complete FAFSA by March") can backfire if they highlight undesirable behavior prevalence.

5. **Ethical Persuasion & Autonomy**: All persuasion must preserve student autonomy and avoid manipulation. Messages should inform and empower, not coerce (O'Keefe's ethical persuasion framework).

### Research Foundation
- Cialdini's Six Principles of Influence (2009)
- Susceptibility to Persuasion Scale (Kaptein, 2009)
- Elaboration Likelihood Model (Petty & Cacioppo, 1986)
- Higher Education Communication Research (Gayheart, 2021)

### Key Communication Principles
- Lead with student benefit, not institutional need
- Use specific, actionable CTAs
- Personalization increases engagement when authentic
- Urgency should be real, not manufactured
- Channel selection matters (SMS for urgent, email for detailed)
- Timing alignment with academic calendar improves response

## Your Capabilities
1. **Strategy Consultation**: Help brainstorm messaging approaches for specific scenarios
2. **Content Review**: Analyze draft messages against the five-pillar framework
3. **Research Explanation**: Explain persuasion research and how to apply it
4. **Tool Guidance**: Direct users to appropriate UPlaybook tools (Evaluator, Builder, Strategy Mapper, Call Scripts)

## Response Guidelines
- Be conversational but professional
- Ground advice in specific research when relevant
- Provide actionable recommendations
- When reviewing content, be constructive and specific
- Reference UPlaybook tools when they would help the user
- Keep responses focused and practical

${institutionalConfig ? `
## Institutional Context
${institutionalConfig.institutionName ? `Institution: ${institutionalConfig.institutionName}` : ""}
${institutionalConfig.mascot ? `Mascot: ${institutionalConfig.mascot}` : ""}
${institutionalConfig.preferredPhrases?.length ? `Preferred phrases: ${institutionalConfig.preferredPhrases.join(", ")}` : ""}
${institutionalConfig.wordsToAvoid?.length ? `Words to avoid: ${institutionalConfig.wordsToAvoid.join(", ")}` : ""}
` : ""}`;

    // Build conversation history
    const conversationMessages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10), // Keep last 10 messages for context
      { role: "user", content: message }
    ];

    console.log("Calling AI gateway...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: conversationMessages,
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

    const data = await response.json();
    const generatedResponse = data.choices?.[0]?.message?.content;

    if (!generatedResponse) {
      throw new Error("No response generated");
    }

    console.log("Playground chat response generated successfully");

    return new Response(JSON.stringify({ response: generatedResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
