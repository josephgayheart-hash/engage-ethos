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

const MAPPER_PROMPT = `Create a detailed week-by-week messaging strategy journey. Think like a campaign strategist planning touchpoints across the student lifecycle.

Structure your strategy into THREE PHASES:
1. SHORT-TERM (weeks 1-4): Initial engagement, relationship building, immediate needs
2. MID-TERM (weeks 5-8): Deepening connection, proactive support, behavioral reinforcement  
3. LONG-TERM (weeks 9+): Sustained engagement, milestone celebration, retention focus

For EACH touchpoint, specify:
- Week number and phase
- Communication channel (email, sms, portal, social-media, phone-call, direct-mail)
- Message domain (academic, financial, wellbeing, behavioral, engagement, compliance)
- Tone (supportive, authoritative, encouraging, directive, celebratory, urgent)
- Behavioral nudge: The psychological principle being applied (e.g., "loss aversion", "social proof", "commitment consistency")
- Goal (persist, attend, submit, respond, check-in, register, enroll)
- Sample subject line (for emails) or message preview
- Key message theme

Consider:
- Channel fatigue and variety
- Building from low-friction to higher-commitment asks
- Timing around academic calendar events
- Appropriate authority escalation
- Student autonomy and choice architecture

IMPORTANT: Respond ONLY with valid JSON matching this structure:
{
  "journey": {
    "overview": "2-3 sentence summary of the strategy approach",
    "totalWeeks": <number>,
    "phases": [
      {
        "phase": "short-term|mid-term|long-term",
        "name": "Phase display name",
        "weekRange": "Weeks X-Y",
        "focus": "Primary focus for this phase",
        "keyObjectives": ["objective 1", "objective 2"]
      }
    ],
    "touchpoints": [
      {
        "week": <number>,
        "phase": "short-term|mid-term|long-term",
        "title": "Touchpoint title",
        "description": "What this touchpoint accomplishes",
        "channel": "email|sms|portal|social-media|phone-call|direct-mail",
        "domain": "academic|financial|wellbeing|behavioral|engagement|compliance",
        "tone": "supportive|authoritative|encouraging|directive|celebratory|urgent",
        "behavioralNudge": "The psychological principle being applied",
        "goal": "persist|attend|submit|respond|check-in|register|enroll",
        "sampleSubject": "Subject line or message preview",
        "keyMessage": "Core message theme"
      }
    ],
    "risks": ["Risk 1 to monitor", "Risk 2"],
    "successMetrics": ["Metric 1 to track", "Metric 2"]
  }
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, mode, institutionalConfig, journeyWeeks, startDate, endDate } = await req.json();
    
    if (!context) {
      return new Response(
        JSON.stringify({ error: "Context is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const totalWeeks = journeyWeeks || 12;

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

    const channelsStr = context.channels?.length > 0 
      ? context.channels.join(', ') 
      : context.channel || 'Not specified';

    // Format dates for display if provided
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return null;
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    const daysUntilDeadline = context.dueDate ? Math.ceil((new Date(context.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

    const contextStr = `
CONTEXT:
- Department: ${context.department || 'Not specified'}
- Audience Type: ${context.audience}
- Cohort: ${context.cohort || 'Not specified'}
- Communication Moment: ${context.moment}
- Channels: ${channelsStr}
- Domain: ${context.domain || 'Not specified'}
- Primary Goal: ${context.goal || 'Not specified'}
- Tone Preference: ${context.tone || 'Not specified'}
${context.dueDate ? `
URGENCY & DEADLINE:
- Deadline Label: ${context.urgencyLabel || 'Deadline'}
- Due Date: ${formatDate(context.dueDate)}
- Days Until Deadline: ${daysUntilDeadline} days
- IMPORTANT: Incorporate countdown urgency language naturally. Reference the deadline explicitly.` : ''}
${startDate ? `
JOURNEY TIMELINE:
- Journey Start Date: ${formatDate(startDate)}
- Journey End Date: ${formatDate(endDate)}
- IMPORTANT: Consider timing relative to these dates when planning touchpoints.` : ''}

DEPARTMENT CONTEXT GUIDANCE:
${context.department === 'enrollment-management' || context.department === 'recruitment' ? 
  '- Focus on conversion-oriented messaging (inquiry → application → yield → enrollment)' : ''}
${context.department === 'student-success' ? 
  '- Focus on retention, persistence, and support-oriented messaging' : ''}
${context.department === 'advancement-alumni' ? 
  '- Focus on engagement, stewardship, and giving-oriented messaging' : ''}
${context.department === 'central-marketing' ? 
  '- Focus on brand-consistent, multi-channel campaign messaging' : ''}
${context.department === 'registrar' ? 
  '- Focus on compliance, deadlines, and procedural clarity' : ''}
${context.department === 'health-wellbeing' ? 
  '- Focus on supportive, non-judgmental, resource-oriented messaging' : ''}`;

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
        const channelsList = context.channels?.length > 0 
          ? context.channels.join(', ') 
          : 'email, sms, phone-call';
        userPrompt = `Please create a detailed ${totalWeeks}-week messaging strategy journey for this context:
${contextStr}
${institutionalStr}

Create a comprehensive journey with touchpoints distributed across short-term (weeks 1-4), mid-term (weeks 5-8), and long-term (weeks 9+) phases. Include 8-15 touchpoints depending on the journey length.

IMPORTANT: Only use these channels for touchpoints: ${channelsList}
Distribute touchpoints across the selected channels based on best practices for the audience and moment.

Provide the complete journey as JSON.`;
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
