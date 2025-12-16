import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, context, institutionalConfig } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = `You are PERSIST, an AI assistant specialized in creating effective, ethical student-facing communications for higher education institutions. 

Your messages should:
- Be evidence-based and grounded in persuasion research
- Respect student autonomy and avoid manipulative tactics
- Use appropriate authority cues without being authoritative
- Minimize cognitive load with clear, scannable content
- Include clear calls-to-action when appropriate

Formatting guidelines:
- Keep messages concise and scannable
- Use the student's preferred addressing style if provided
- Include relevant institutional names and resources when available`;

    let userPrompt = "";

    if (type === "template") {
      userPrompt = `Generate a professional message template for higher education student communication.

Context:
- Channel: ${context.channel || "email"}
- Target Audience: ${context.audience || "students"}
- Communication Moment: ${context.moment || "general"}
- Domain: ${context.domain || "academic support"}
- Goal: ${context.goal || "inform and engage"}
- Tone: ${context.tone || "supportive"}

${institutionalConfig?.institutionName ? `Institution: ${institutionalConfig.institutionName}` : ""}
${institutionalConfig?.mascot ? `Mascot: ${institutionalConfig.mascot}` : ""}
${institutionalConfig?.primaryCTAs?.length ? `Preferred CTAs: ${institutionalConfig.primaryCTAs.join(", ")}` : ""}
${institutionalConfig?.preferredPhrases?.length ? `Preferred phrases: ${institutionalConfig.preferredPhrases.join(", ")}` : ""}
${institutionalConfig?.wordsToAvoid?.length ? `Words to avoid: ${institutionalConfig.wordsToAvoid.join(", ")}` : ""}

Generate a complete message that:
1. Uses {{placeholder}} syntax for variables like {{student_name}}, {{deadline_date}}, {{advisor_name}}
2. Has a clear subject line (if email)
3. Opens with an engaging greeting
4. Provides clear value to the student
5. Includes a specific call-to-action
6. Closes professionally

Return ONLY the message content, no explanations.`;
    } else if (type === "builder") {
      userPrompt = `Generate a personalized student message based on the following context:

- Channel: ${context.channel}
- Audience: ${context.audience}
- Moment: ${context.moment}
${context.domain ? `- Domain: ${context.domain}` : ""}
${context.goal ? `- Goal: ${context.goal}` : ""}
${context.tone ? `- Tone: ${context.tone}` : ""}
${context.cohort ? `- Cohort: ${context.cohort}` : ""}

${institutionalConfig?.institutionName ? `Institution: ${institutionalConfig.institutionName}` : ""}
${institutionalConfig?.mascot ? `Mascot: ${institutionalConfig.mascot}` : ""}
${institutionalConfig?.supportCenters?.length ? `Support Centers: ${institutionalConfig.supportCenters.join(", ")}` : ""}
${institutionalConfig?.primaryCTAs?.length ? `Use CTA style like: ${institutionalConfig.primaryCTAs[0]}` : ""}

Generate a complete, ready-to-send message that:
1. Is appropriate for the ${context.channel} channel
2. Speaks directly to ${context.audience} students
3. Is relevant for the ${context.moment} timing
4. Has a clear purpose and call-to-action

Return ONLY the message content.`;
    }

    console.log("Generating message with type:", type);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
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
    const generatedMessage = data.choices?.[0]?.message?.content;

    if (!generatedMessage) {
      throw new Error("No message generated");
    }

    console.log("Message generated successfully");

    return new Response(JSON.stringify({ message: generatedMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating message:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate message";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
