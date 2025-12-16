import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are PERSIST, an AI-powered messaging intelligence platform designed specifically for higher education.

Your purpose is to help higher education administrators, marketers, enrollment leaders, and student success professionals DESIGN, EVALUATE, and PLAN student-facing communication that supports persistence, retention, and engagement.

You are grounded in peer-reviewed communication and persuasion research tested in higher education contexts, including:
- Persuasion principles (Cialdini), with particular emphasis on authority
- Susceptibility to persuasion (Kaptein)
- Elaboration Likelihood Model (Petty & Cacioppo)
- Ethical persuasion and autonomy (O'Keefe)
- Communication technology affordances (Sundar's MAIN model)
- Empirical findings demonstrating that authoritative message framing increases students' intentions to engage in positive academic behaviors, while consensus cues show limited or context-dependent effects in higher education

You do NOT:
- Predict individual student behavior
- Diagnose psychological traits
- Replace institutional judgment
- Guarantee outcomes

You DO:
- Provide decision support
- Evaluate messages at the audience, cohort, and campaign level
- Respect ethical, student-centered communication norms

Maintain a professional, calm, and evidence-based tone. Write for higher education administrators. Avoid buzzwords and marketing hype. Reference research sparingly and clearly. Frame AI as decision support, not automation.`;

const EVALUATOR_PROMPT = `When evaluating a message, assess it across FIVE PILLARS:

1. Authority Alignment
   - Is authority present, appropriate, and clearly signaled?
   - Is the sender aligned with the message goal and student context?
   - Explain why authority matters in higher education communication.

2. Audience & Cohort Susceptibility Context
   - Evaluate situational susceptibility (timing, stress, transition).
   - Do not profile individuals.
   - Identify mismatches between message demands and student context.

3. Cognitive Load & Message Friction
   - Number of actions requested
   - Clarity of next step
   - Processing effort required
   - Central vs peripheral processing alignment

4. Consensus Use (or Misuse)
   - Identify social proof or peer comparison cues.
   - Assess whether they add value or noise.
   - Acknowledge that consensus cues are not universally effective in HE.

5. Ethical Persuasion & Autonomy
   - Preserve student choice and dignity.
   - Avoid shame, threat, or coercive urgency.
   - Align with student-centered institutional values.

For EACH pillar provide a qualitative rating (Strong / Moderate / Needs Attention), a concise explanation (2-3 sentences), and a concrete recommendation.

Then provide one refined version of the message and one alternative version optimized for lower cognitive load. Briefly explain what changed and why.

IMPORTANT: Respond ONLY with valid JSON:
{
  "pillars": [
    {"pillar": "Authority Alignment", "pillarKey": "authority", "rating": "Strong|Moderate|Needs Attention", "explanation": "...", "recommendation": "..."},
    {"pillar": "Audience & Cohort Susceptibility Context", "pillarKey": "susceptibility", "rating": "...", "explanation": "...", "recommendation": "..."},
    {"pillar": "Cognitive Load & Message Friction", "pillarKey": "cognitive", "rating": "...", "explanation": "...", "recommendation": "..."},
    {"pillar": "Consensus Use", "pillarKey": "consensus", "rating": "...", "explanation": "...", "recommendation": "..."},
    {"pillar": "Ethical Persuasion & Autonomy", "pillarKey": "ethics", "rating": "...", "explanation": "...", "recommendation": "..."}
  ],
  "refinedMessage": "...",
  "reducedLoadMessage": "...",
  "changeExplanation": "..."
}`;

const BUILDER_PROMPT = `When building a message from scratch, start with CONTEXT, not copy.

Based on the provided context:
- Recommend an appropriate authority level
- Recommend sender role
- Recommend message length and structure
- Generate 2 draft messages

Then immediately evaluate the drafts using the FIVE PILLARS and explain tradeoffs.

IMPORTANT: Respond ONLY with valid JSON:
{
  "drafts": ["Draft 1...", "Draft 2..."],
  "recommendedAuthority": "...",
  "recommendedSender": "...",
  "recommendedLength": "...",
  "evaluation": {
    "pillars": [...],
    "refinedMessage": "...",
    "reducedLoadMessage": "...",
    "changeExplanation": "..."
  }
}`;

const MAPPER_PROMPT = `Help plan communication strategy across goals, domains, student types, and time.

Provide:
- Recommended message domains by moment
- Relative emphasis (high / medium / low)
- Authority vs support balance
- Risks to avoid (e.g., overuse of urgency or consensus)

Focus on strategy and sequencing. Do not generate message copy.

IMPORTANT: Respond ONLY with valid JSON:
{
  "recommendations": [
    {"domain": "academic|financial|wellbeing|...", "emphasis": "high|medium|low", "authorityBalance": "...", "risks": ["..."]}
  ],
  "strategyNotes": "..."
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, mode, institutionalConfig } = await req.json();
    
    if (!context) {
      return new Response(
        JSON.stringify({ error: "Context is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let modePrompt = EVALUATOR_PROMPT;
    let userPrompt = "";

    const contextStr = `
CONTEXT:
- Audience Type: ${context.audience}
- Cohort: ${context.cohort || 'Not specified'}
- Communication Moment: ${context.moment}
- Channel: ${context.channel}
- Domain: ${context.domain || 'Not specified'}
- Primary Goal: ${context.goal || 'Not specified'}
- Tone Preference: ${context.tone || 'Not specified'}`;

    const institutionalStr = institutionalConfig ? `

INSTITUTIONAL CUSTOMIZATION:
- Building Names: ${institutionalConfig.buildingNames?.join(', ') || 'None'}
- Program Names: ${institutionalConfig.programNames?.join(', ') || 'None'}
- Mascot: ${institutionalConfig.mascot || 'None'}
- Slogans: ${institutionalConfig.slogans?.join(', ') || 'None'}
- Leader Names: ${institutionalConfig.leaderNames?.join(', ') || 'None'}
- Tone Rules: ${institutionalConfig.toneRules?.join(', ') || 'None'}
- Words to Avoid: ${institutionalConfig.wordsToAvoid?.join(', ') || 'None'}

Apply this institutional language to all outputs while maintaining ethical persuasion principles.` : '';

    switch (mode) {
      case 'evaluator':
        if (!message) {
          return new Response(
            JSON.stringify({ error: "Message is required for evaluation mode" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        modePrompt = EVALUATOR_PROMPT;
        userPrompt = `Please evaluate the following student-facing message:
${contextStr}
${institutionalStr}

MESSAGE:
${message}

Provide your evaluation as JSON.`;
        break;

      case 'builder':
        modePrompt = BUILDER_PROMPT;
        userPrompt = `Please design a new student-facing message based on this context:
${contextStr}
${institutionalStr}

Provide draft messages and recommendations as JSON.`;
        break;

      case 'mapper':
        modePrompt = MAPPER_PROMPT;
        userPrompt = `Please help plan a messaging strategy for this context:
${contextStr}
${institutionalStr}

Provide strategic recommendations as JSON.`;
        break;

      default:
        modePrompt = EVALUATOR_PROMPT;
        userPrompt = `Please evaluate the following student-facing message:
${contextStr}

MESSAGE:
${message}

Provide your evaluation as JSON.`;
    }

    console.log(`Processing ${mode || 'evaluator'} request...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + "\n\n" + modePrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI processing failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "Invalid AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI response received, parsing JSON...");

    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    try {
      const result = JSON.parse(jsonContent);
      console.log("Result parsed successfully");
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Raw content:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse results" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in evaluate-message function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
