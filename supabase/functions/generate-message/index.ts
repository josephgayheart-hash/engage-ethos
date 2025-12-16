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
    const { type, context, institutionalConfig, touchpoint, channels } = await req.json();
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

    if (type === "touchpoint") {
      // Generate message for a specific journey touchpoint
      const channel = touchpoint.channel || "email";
      const channelGuides: Record<string, string> = {
        email: "Full email with subject line. Professional but warm. 150-250 words. Include greeting, body, CTA, and signature placeholder.",
        sms: "Short SMS message. 160 characters max. Direct and actionable. Include link placeholder if needed.",
        "social-media": "Social media post. Engaging and shareable. 100-200 characters. Use emojis sparingly. Include hashtag suggestions.",
        portal: "Portal notification message. Clear and informative. 50-100 words. Action-oriented.",
        "landing-page": "Landing page copy. Compelling headline and body. 100-200 words. Clear value proposition and CTA.",
        "direct-mail": "Direct mail letter opening paragraph and key message. Formal tone. 100-150 words.",
        "phone-call": "Phone call script talking points. Bullet format. Include greeting, key message, and closing."
      };

      // Build institutional config string for prompts
      const instConfigStr = institutionalConfig ? `
INSTITUTIONAL VOICE & BRANDING:
${institutionalConfig.institutionName ? `- Institution: ${institutionalConfig.institutionName}` : ""}
${institutionalConfig.mascot ? `- Mascot: ${institutionalConfig.mascot}` : ""}
${institutionalConfig.slogans?.length ? `- Spirit phrases: ${institutionalConfig.slogans.join(", ")}` : ""}
${institutionalConfig.supportCenters?.length ? `- Support resources: ${institutionalConfig.supportCenters.join(", ")}` : ""}
${institutionalConfig.primaryCTAs?.length ? `- Use CTA style like: ${institutionalConfig.primaryCTAs[0]}` : ""}
${institutionalConfig.preferredPhrases?.length ? `- Preferred phrases: ${institutionalConfig.preferredPhrases.join(", ")}` : ""}
${institutionalConfig.wordsToAvoid?.length ? `- Words to AVOID: ${institutionalConfig.wordsToAvoid.join(", ")}` : ""}
${institutionalConfig.toneRules?.length ? `- Tone guidelines: ${institutionalConfig.toneRules.join(", ")}` : ""}
${institutionalConfig.signatureTemplates?.length ? `- Sign off with: ${institutionalConfig.signatureTemplates[0]}` : ""}` : "";

      // Handle multi-channel generation if channels array is provided
      if (channels && Array.isArray(channels) && channels.length > 0) {
        const channelPrompts = channels.map((ch: string) => `
Channel: ${ch.toUpperCase()}
Format: ${channelGuides[ch] || "Professional message appropriate for the channel."}
`).join("\n");

        userPrompt = `Generate messages for a strategy journey touchpoint across multiple channels.

TOUCHPOINT DETAILS:
- Week: ${touchpoint.week}
- Phase: ${touchpoint.phase}
- Title: ${touchpoint.title}
- Description: ${touchpoint.description}
- Behavioral Nudge: ${touchpoint.behavioralNudge || "None specified"}
- Goal: ${touchpoint.goal}
- Tone: ${touchpoint.tone}
- Domain: ${touchpoint.domain}
- Key Message: ${touchpoint.keyMessage || "Not specified"}
- Sample Subject: ${touchpoint.sampleSubject || "Not specified"}

${context ? `AUDIENCE CONTEXT:
- Audience Type: ${context.audience || "general student"}
- Communication Moment: ${context.moment || "general"}
${context.department ? `- Department: ${context.department}` : ""}
${context.cohort ? `- Cohort: ${context.cohort}` : ""}` : ""}
${instConfigStr}

GENERATE MESSAGES FOR THESE CHANNELS:
${channelPrompts}

${touchpoint.behavioralNudge ? `IMPORTANT: Apply the behavioral nudge "${touchpoint.behavioralNudge}" subtly in each message.` : ""}

Respond with valid JSON only:
{
  "messages": [
    { "channel": "email", "content": "Subject: ...\n\n..." },
    { "channel": "sms", "content": "..." }
  ]
}`;
      } else {
        // Single channel touchpoint message generation
        userPrompt = `Generate a message for a strategy journey touchpoint.

TOUCHPOINT DETAILS:
- Week: ${touchpoint.week}
- Phase: ${touchpoint.phase}
- Title: ${touchpoint.title}
- Description: ${touchpoint.description}
- Channel: ${channel}
- Goal: ${touchpoint.goal}
- Tone: ${touchpoint.tone}
- Domain: ${touchpoint.domain}
${touchpoint.behavioralNudge ? `- Behavioral Nudge to incorporate: ${touchpoint.behavioralNudge}` : ""}
${instConfigStr}

FORMAT REQUIREMENTS:
${channelGuides[channel] || "Professional message appropriate for the channel."}

Generate a complete, ready-to-use message that:
1. Matches the ${channel} channel format
2. Achieves the "${touchpoint.goal}" goal
3. Uses a ${touchpoint.tone} tone
4. Is relevant to ${touchpoint.domain}
${touchpoint.behavioralNudge ? `5. Subtly incorporates the behavioral nudge: "${touchpoint.behavioralNudge}"` : ""}
${institutionalConfig?.institutionName ? `6. Reflects the voice and branding of ${institutionalConfig.institutionName}` : ""}

Return ONLY the message content, no explanations or JSON formatting.`;
      }
    } else if (type === "template") {
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
      // Calculate days until deadline if provided
      const daysUntilDeadline = context?.dueDate 
        ? Math.ceil((new Date(context.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) 
        : null;
      
      userPrompt = `Generate a personalized student message based on the following context:

- Channel: ${context.channel}
- Audience: ${context.audience}
- Moment: ${context.moment}
${context.domain ? `- Domain: ${context.domain}` : ""}
${context.goal ? `- Goal: ${context.goal}` : ""}
${context.tone ? `- Tone: ${context.tone}` : ""}
${context.cohort ? `- Cohort: ${context.cohort}` : ""}
${context.dueDate ? `
URGENCY & DEADLINE:
- Deadline Label: ${context.urgencyLabel || "Deadline"}
- Due Date: ${context.dueDate}
- Days Until Deadline: ${daysUntilDeadline} days
- IMPORTANT: Incorporate countdown urgency language naturally. Reference the deadline explicitly.` : ""}

${institutionalConfig?.institutionName ? `Institution: ${institutionalConfig.institutionName}` : ""}
${institutionalConfig?.mascot ? `Mascot: ${institutionalConfig.mascot}` : ""}
${institutionalConfig?.supportCenters?.length ? `Support Centers: ${institutionalConfig.supportCenters.join(", ")}` : ""}
${institutionalConfig?.primaryCTAs?.length ? `Use CTA style like: ${institutionalConfig.primaryCTAs[0]}` : ""}
${institutionalConfig?.preferredPhrases?.length ? `Preferred phrases to use: ${institutionalConfig.preferredPhrases.join(", ")}` : ""}
${institutionalConfig?.wordsToAvoid?.length ? `Words/phrases to avoid: ${institutionalConfig.wordsToAvoid.join(", ")}` : ""}
${institutionalConfig?.toneRules?.length ? `Tone guidelines: ${institutionalConfig.toneRules.join(", ")}` : ""}
${institutionalConfig?.signatureTemplates?.length ? `Sign off with: ${institutionalConfig.signatureTemplates[0]}` : ""}

Generate a complete, ready-to-send message that:
1. Is appropriate for the ${context.channel} channel
2. Speaks directly to ${context.audience} students
3. Is relevant for the ${context.moment} timing
4. Has a clear purpose and call-to-action
${context.dueDate ? `5. Includes deadline urgency referencing "${context.urgencyLabel || "the deadline"}" on ${context.dueDate} (${daysUntilDeadline} days away)` : ""}

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
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error("No message generated");
    }

    console.log("Message generated successfully");

    // Parse JSON response for touchpoint type with channels array
    if (type === "touchpoint" && channels && Array.isArray(channels) && channels.length > 0) {
      let jsonContent = generatedContent;
      const jsonMatch = generatedContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
      
      try {
        const parsed = JSON.parse(jsonContent);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (parseError) {
        console.error("Failed to parse touchpoint response:", parseError);
        // Fallback: return raw content as single message
        return new Response(JSON.stringify({ 
          messages: [{ channel: channels[0], content: generatedContent }] 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ message: generatedContent }), {
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
