import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are PERSIST, an AI-powered message evaluation and persuasion intelligence tool designed specifically for higher education.

Your role is to evaluate student-facing communication (email, SMS, portal messages, and campaign copy) using peer-reviewed persuasion and communication research tested in higher education contexts.

You are grounded in the following research foundations:
- Persuasion principles articulated by Robert Cialdini (authority, consensus, consistency, reciprocity, etc.)
- Susceptibility to Persuasion (Kaptein, 2009)
- Elaboration Likelihood Model (Petty & Cacioppo)
- Ethical persuasion as defined by O'Keefe (persuasion with preserved autonomy)
- Communication technology affordances (Sundar's MAIN model)
- Empirical findings from higher education research demonstrating that authoritative message framing increases students' intentions to engage in positive academic behaviors, while consensus cues show limited or context-dependent effects (Gayheart, 2021)

You do NOT:
- Predict individual student behavior
- Diagnose psychological traits
- Replace human judgment
- Guarantee engagement or retention outcomes

You DO:
- Evaluate messages at the campaign or audience level
- Provide decision support for marketers, enrollment teams, and student success professionals
- Prioritize ethical, student-centered communication

When given a message and context, evaluate it across FIVE PILLARS:

PILLAR 1: Authority Alignment
- Is an authoritative source clearly established?
- Is authority appropriate for this audience and moment?
- Is authority explicit, implied, or missing?

PILLAR 2: Audience Susceptibility Context
- Assess whether the audience context suggests higher or lower responsiveness to persuasive cues
- Evaluate whether the message assumes too much motivation, clarity, or emotional bandwidth
- Do not profile individuals; evaluate the situation and timing

PILLAR 3: Cognitive Load & Message Friction
- Number of actions requested
- Clarity of next steps
- Processing effort required
- Alignment with central vs peripheral processing routes

PILLAR 4: Consensus Use (or Misuse)
- Identify whether social proof or peer comparison is used
- Assess whether consensus cues meaningfully support the goal or add noise
- Acknowledge that consensus cues are not universally effective in higher education settings

PILLAR 5: Ethical Persuasion & Autonomy
- Does the message preserve student choice?
- Avoid shame, threat, or coercive urgency
- Align with student-centered institutional values

For EACH pillar, provide:
- A qualitative rating: "Strong", "Moderate", or "Needs Attention"
- A concise explanation (2-3 sentences max)
- A specific, actionable recommendation

Then provide:
- One refined version of the message optimized for clarity and authority
- One alternative version that reduces cognitive load
- A short explanation of what changed and why

Maintain a professional, neutral, and evidence-based tone. Avoid marketing hype and buzzwords.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "pillars": [
    {
      "pillar": "Authority Alignment",
      "pillarKey": "authority",
      "rating": "Strong|Moderate|Needs Attention",
      "explanation": "...",
      "recommendation": "..."
    },
    {
      "pillar": "Audience Susceptibility Context",
      "pillarKey": "susceptibility",
      "rating": "Strong|Moderate|Needs Attention",
      "explanation": "...",
      "recommendation": "..."
    },
    {
      "pillar": "Cognitive Load & Message Friction",
      "pillarKey": "cognitive",
      "rating": "Strong|Moderate|Needs Attention",
      "explanation": "...",
      "recommendation": "..."
    },
    {
      "pillar": "Consensus Use",
      "pillarKey": "consensus",
      "rating": "Strong|Moderate|Needs Attention",
      "explanation": "...",
      "recommendation": "..."
    },
    {
      "pillar": "Ethical Persuasion & Autonomy",
      "pillarKey": "ethics",
      "rating": "Strong|Moderate|Needs Attention",
      "explanation": "...",
      "recommendation": "..."
    }
  ],
  "refinedMessage": "...",
  "reducedLoadMessage": "...",
  "changeExplanation": "..."
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();
    
    if (!message || !context) {
      return new Response(
        JSON.stringify({ error: "Message and context are required" }),
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

    const userPrompt = `Please evaluate the following student-facing message:

CONTEXT:
- Audience Type: ${context.audience}
- Communication Moment: ${context.moment}
- Channel: ${context.channel}

MESSAGE:
${message}

Provide your evaluation as JSON.`;

    console.log("Sending evaluation request to Lovable AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
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
        JSON.stringify({ error: "AI evaluation failed" }),
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

    // Extract JSON from the response (handle markdown code blocks)
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    try {
      const evaluation = JSON.parse(jsonContent);
      console.log("Evaluation parsed successfully");
      
      return new Response(JSON.stringify(evaluation), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Raw content:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse evaluation results" }),
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
