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
    const { type, context, institutionalConfig, touchpoint, channels, startDate, endDate, contentDNA } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build Content DNA prompt section if provided
    let contentDNAPrompt = "";
    if (contentDNA?.voiceAnalysis) {
      const va = contentDNA.voiceAnalysis;
      const bp = contentDNA.brandPlatform;
      const profileIdentifier = contentDNA.sourceProfileName || contentDNA.sourceProfileId || "selected profile";
      contentDNAPrompt = `
CONTENT DNA - INSTITUTIONAL VOICE PROFILE FOR: ${profileIdentifier}
CRITICAL: This voice profile is SPECIFIC to this institution/profile. Do NOT mix in characteristics from any other institution.

Overall Tone: ${va.overallTone || "Not specified"}
Formality Level: ${va.formalityLevel || "Not specified"}
Emotional Tone: ${va.emotionalTone || "Not specified"}
Sentence Style: ${va.sentenceStyle || "Not specified"}

Key Characteristics: ${va.keyCharacteristics?.join(", ") || "None specified"}
Vocabulary Patterns: ${va.vocabularyPatterns?.join(", ") || "None specified"}
Common Phrases to Use: ${va.commonPhrases?.join(", ") || "None specified"}
Messaging Tactics: ${va.messagingTactics?.join(", ") || "None specified"}

${va.summary ? `Voice Summary: ${va.summary}` : ""}
${bp ? `
BRAND PLATFORM:
${bp.brandPromise ? `Brand Promise: ${bp.brandPromise}` : ""}
${bp.brandPillars?.length ? `
Brand Pillars (incorporate these themes naturally):
${bp.brandPillars.map((p: any) => `- ${p.name}: ${p.description}${p.keywords?.length ? ` (Keywords: ${p.keywords.join(", ")})` : ""}`).join("\n")}` : ""}
${bp.proofPoints?.length ? `
Proof Points (use as evidence when relevant):
${bp.proofPoints.map((p: string) => `- ${p}`).join("\n")}` : ""}
${bp.commitments?.length ? `
Commitments (reinforce these promises):
${bp.commitments.map((c: string) => `- ${c}`).join("\n")}` : ""}
${bp.brandPathways?.length ? `
Brand Pathways (transformation narratives):
${bp.brandPathways.map((p: any) => `- ${p.name}: ${p.description}`).join("\n")}` : ""}
` : ""}
${contentDNA.customInstructions ? `
CUSTOM BRAND GUIDELINES:
${contentDNA.customInstructions}` : ""}

IMPORTANT: Apply ONLY this Content DNA profile. Do not borrow language, phrases, mascots, slogans, or voice characteristics from any other institution. If you are unsure about a specific term, use generic alternatives rather than inventing institution-specific content.
`;
    }

    let systemPrompt = `You are UPlaybook, an AI assistant specialized in creating effective, ethical communications for higher education institutions - both student-facing and employee-facing.

Your messages should:
- Be evidence-based and grounded in persuasion research
- Respect recipient autonomy and avoid manipulative tactics
- Use appropriate authority cues without being authoritative
- Minimize cognitive load with clear, scannable content
- Include clear calls-to-action when appropriate
${contentDNAPrompt}
FOR STUDENT COMMUNICATIONS:
- Focus on academic success, engagement, and persistence
- Reference student-relevant resources (advising, tutoring, financial aid)
- Use encouraging, supportive tones appropriate to the student lifecycle

FOR EMPLOYEE COMMUNICATIONS:
- Focus on professional development, benefits, workplace engagement
- Reference HR systems, benefits portals, professional growth opportunities
- Use professional tones appropriate to workplace communication
- For open enrollment: emphasize deadlines, plan options, and action steps
- For professional development: highlight growth opportunities and institutional support
- For policy updates: be clear, direct, and compliance-focused
- For recognition: be warm, specific, and celebratory

Formatting guidelines:
- Keep messages concise and scannable
- Use the recipient's preferred addressing style if provided
- Include relevant institutional names and resources when available`;

    let userPrompt = "";

    // Format dates for display
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return null;
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    // Calculate days until end date (deadline)
    const daysUntilDeadline = endDate 
      ? Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) 
      : null;

    // Build timeline context string
    const timelineStr = (startDate || endDate) ? `
JOURNEY TIMELINE & DEADLINE:
${startDate ? `- Journey Start: ${formatDate(startDate)}` : ""}
${endDate ? `- Target Due Date: ${formatDate(endDate)}` : ""}
${daysUntilDeadline ? `- Days Until Deadline: ${daysUntilDeadline} days remaining` : ""}
- IMPORTANT: Incorporate deadline awareness and countdown urgency naturally in the message. Reference the target date explicitly when appropriate.` : "";

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
        "phone-call": "Phone call script talking points. Bullet format. Include greeting, key message, and closing.",
        "digital-ad-search": `Google/Bing Search Ad. Return JSON object with exact fields: { "headlines": ["Headline 1 (max 30 chars)", "Headline 2 (max 30 chars)", "Headline 3 (max 30 chars)"], "descriptions": ["Description 1 (max 90 chars)", "Description 2 (max 90 chars)"], "displayUrl": "university.edu/path" }`,
        "digital-ad-social": `Meta/LinkedIn Social Ad. Return JSON object with exact fields: { "primaryText": "Main ad copy (125 chars ideal)", "headline": "Bold headline (40 chars max)", "description": "Link description (optional)", "ctaButton": "Learn More", "platform": "meta" }`,
        "talking-points": `Executive Talking Points for a president, dean, or executive. Return JSON object with exact fields: { "context": "Meeting/speech context", "audience": "Target audience", "openingHook": "Attention-grabbing opening statement", "keyMessages": ["Message 1", "Message 2", "Message 3", "Message 4", "Message 5"], "supportingData": ["Stat or fact 1", "Stat or fact 2", "Stat or fact 3"], "anticipatedQuestions": ["Q1", "Q2", "Q3"], "transitionPhrases": ["Transition 1", "Transition 2"], "closingStatement": "Strong closing call to action" }. Base content on brand pillars, institutional promise, pathways, foundation, and proof points.`
      };

      // Build comprehensive institutional config string for prompts
      const instConfigStr = institutionalConfig ? `
INSTITUTIONAL VOICE & BRANDING:
${institutionalConfig.institutionName ? `- Institution: ${institutionalConfig.institutionName}${institutionalConfig.institutionAbbreviation ? ` (${institutionalConfig.institutionAbbreviation})` : ''}` : ""}
${institutionalConfig.mascot ? `- Mascot: ${institutionalConfig.mascot}` : ""}
${institutionalConfig.slogans?.length ? `- Spirit phrases: ${institutionalConfig.slogans.join(", ")}` : ""}

DIGITAL PLATFORMS (use these exact names):
${institutionalConfig.portalName ? `- Student Portal: ${institutionalConfig.portalName}` : ""}
${institutionalConfig.lmsName ? `- LMS/Course System: ${institutionalConfig.lmsName}` : ""}
${institutionalConfig.advisingSystemName ? `- Advising System: ${institutionalConfig.advisingSystemName}` : ""}
${institutionalConfig.schedulingSystemName ? `- Scheduling: ${institutionalConfig.schedulingSystemName}` : ""}
${institutionalConfig.degreeAuditSystem ? `- Degree Audit: ${institutionalConfig.degreeAuditSystem}` : ""}
${institutionalConfig.financialAidPortal ? `- Financial Aid Portal: ${institutionalConfig.financialAidPortal}` : ""}
${institutionalConfig.registrationSystem ? `- Registration: ${institutionalConfig.registrationSystem}` : ""}
${institutionalConfig.virtualMeetingPlatform ? `- Virtual Meetings: ${institutionalConfig.virtualMeetingPlatform}` : ""}

CAMPUS LOCATIONS & OFFICES:
${institutionalConfig.supportCenters?.length ? `- Support Resources: ${institutionalConfig.supportCenters.join(", ")}` : ""}
${institutionalConfig.libraryName ? `- Library: ${institutionalConfig.libraryName}` : ""}
${institutionalConfig.tutorCenter ? `- Tutoring: ${institutionalConfig.tutorCenter}` : ""}
${institutionalConfig.writingCenter ? `- Writing Help: ${institutionalConfig.writingCenter}` : ""}
${institutionalConfig.mathCenter ? `- Math Help: ${institutionalConfig.mathCenter}` : ""}
${institutionalConfig.careerCenter ? `- Career Services: ${institutionalConfig.careerCenter}` : ""}
${institutionalConfig.counselingCenter ? `- Counseling: ${institutionalConfig.counselingCenter}` : ""}
${institutionalConfig.healthCenter ? `- Health Services: ${institutionalConfig.healthCenter}` : ""}
${institutionalConfig.registrarOffice ? `- Registrar: ${institutionalConfig.registrarOffice}` : ""}
${institutionalConfig.financialAidOffice ? `- Financial Aid Office: ${institutionalConfig.financialAidOffice}` : ""}
${institutionalConfig.itHelpDesk ? `- IT Support: ${institutionalConfig.itHelpDesk}` : ""}
${institutionalConfig.defaultMeetingLocation ? `- Default Meeting Location: ${institutionalConfig.defaultMeetingLocation}` : ""}

CONTACT INFORMATION:
${institutionalConfig.primaryContactEmail ? `- Email: ${institutionalConfig.primaryContactEmail}` : ""}
${institutionalConfig.primaryContactPhone ? `- Phone: ${institutionalConfig.primaryContactPhone}` : ""}
${institutionalConfig.advisingEmail ? `- Advising Email: ${institutionalConfig.advisingEmail}` : ""}
${institutionalConfig.appointmentLink ? `- Booking Link: ${institutionalConfig.appointmentLink}` : ""}
${institutionalConfig.officeHoursFormat ? `- Office Hours: ${institutionalConfig.officeHoursFormat}` : ""}

TERMINOLOGY:
${institutionalConfig.studentIdTerm ? `- Student ID called: ${institutionalConfig.studentIdTerm}` : ""}
${institutionalConfig.currentTermName ? `- Current term: ${institutionalConfig.currentTermName}` : ""}
${institutionalConfig.nextTermName ? `- Next term: ${institutionalConfig.nextTermName}` : ""}

MESSAGING STYLE:
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
${timelineStr}

GENERATE MESSAGES FOR THESE CHANNELS:
${channelPrompts}

${touchpoint.behavioralNudge ? `IMPORTANT: Apply the behavioral nudge "${touchpoint.behavioralNudge}" subtly in each message.` : ""}
${endDate ? `IMPORTANT: Reference the target deadline (${formatDate(endDate)}) naturally in messages where urgency is appropriate.` : ""}

Respond with valid JSON only:
{
  "messages": [
    { "channel": "email", "content": "Subject: ...\n\n..." },
    { "channel": "sms", "content": "..." },
    { "channel": "digital-ad-search", "content": { "headlines": ["...", "...", "..."], "descriptions": ["...", "..."], "displayUrl": "..." } },
    { "channel": "digital-ad-social", "content": { "primaryText": "...", "headline": "...", "description": "...", "ctaButton": "Learn More", "platform": "meta" } },
    { "channel": "talking-points", "content": { "context": "...", "audience": "...", "openingHook": "...", "keyMessages": ["...", "...", "..."], "supportingData": ["...", "..."], "anticipatedQuestions": ["...", "..."], "transitionPhrases": ["...", "..."], "closingStatement": "..." } }
  ]
}

IMPORTANT for digital-ad-search: content MUST be a JSON object with "headlines" (array of 3 strings), "descriptions" (array of 2 strings), and "displayUrl" (string).
IMPORTANT for digital-ad-social: content MUST be a JSON object with "primaryText", "headline", "description", "ctaButton", and "platform" fields.
IMPORTANT for talking-points: content MUST be a JSON object with "context", "audience", "openingHook", "keyMessages" (array of 5+ key talking points), "supportingData" (array of relevant stats/facts), "anticipatedQuestions" (array of likely questions), "transitionPhrases" (array), and "closingStatement". Base the content on institutional brand pillars, promise, pathways, foundation, and proof points.`;
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
${timelineStr}

FORMAT REQUIREMENTS:
${channelGuides[channel] || "Professional message appropriate for the channel."}

Generate a complete, ready-to-use message that:
1. Matches the ${channel} channel format
2. Achieves the "${touchpoint.goal}" goal
3. Uses a ${touchpoint.tone} tone
4. Is relevant to ${touchpoint.domain}
${touchpoint.behavioralNudge ? `5. Subtly incorporates the behavioral nudge: "${touchpoint.behavioralNudge}"` : ""}
${institutionalConfig?.institutionName ? `6. Reflects the voice and branding of ${institutionalConfig.institutionName}` : ""}
${endDate ? `7. References the target deadline (${formatDate(endDate)}, ${daysUntilDeadline} days away) naturally when appropriate` : ""}

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
${context.additionalContext ? `
ADDITIONAL CONTEXT & REFINEMENT NOTES:
${context.additionalContext}
- IMPORTANT: Use the above context to tailor the message specifically to this situation. Incorporate relevant details naturally.` : ""}

INSTITUTIONAL CONFIG:
${institutionalConfig?.institutionName ? `Institution: ${institutionalConfig.institutionName}${institutionalConfig.institutionAbbreviation ? ` (${institutionalConfig.institutionAbbreviation})` : ''}` : ""}
${institutionalConfig?.mascot ? `Mascot: ${institutionalConfig.mascot}` : ""}
${institutionalConfig?.portalName ? `Student Portal: ${institutionalConfig.portalName}` : ""}
${institutionalConfig?.lmsName ? `LMS: ${institutionalConfig.lmsName}` : ""}
${institutionalConfig?.advisingSystemName ? `Advising System: ${institutionalConfig.advisingSystemName}` : ""}
${institutionalConfig?.supportCenters?.length ? `Support Centers: ${institutionalConfig.supportCenters.join(", ")}` : ""}
${institutionalConfig?.primaryCTAs?.length ? `Use CTA style like: ${institutionalConfig.primaryCTAs[0]}` : ""}
${institutionalConfig?.preferredPhrases?.length ? `Preferred phrases to use: ${institutionalConfig.preferredPhrases.join(", ")}` : ""}
${institutionalConfig?.wordsToAvoid?.length ? `Words/phrases to avoid: ${institutionalConfig.wordsToAvoid.join(", ")}` : ""}
${institutionalConfig?.toneRules?.length ? `Tone guidelines: ${institutionalConfig.toneRules.join(", ")}` : ""}
${institutionalConfig?.signatureTemplates?.length ? `Sign off with: ${institutionalConfig.signatureTemplates[0]}` : ""}
${institutionalConfig?.appointmentLink ? `Appointment link: ${institutionalConfig.appointmentLink}` : ""}
${institutionalConfig?.currentTermName ? `Current term: ${institutionalConfig.currentTermName}` : ""}

Generate a complete, ready-to-send message that:
1. Is appropriate for the ${context.channel} channel
2. Speaks directly to ${context.audience} students
3. Is relevant for the ${context.moment} timing
4. Has a clear purpose and call-to-action
${context.dueDate ? `5. Includes deadline urgency referencing "${context.urgencyLabel || "the deadline"}" on ${context.dueDate} (${daysUntilDeadline} days away)` : ""}
${context.additionalContext ? `6. Incorporates the specific situation details provided in the additional context` : ""}

Return ONLY the message content.`;
    } else if (type === "call-script") {
      // Generate call script for phone outreach
      const daysUntil = context?.dueDate 
        ? Math.ceil((new Date(context.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) 
        : null;

      // Build comprehensive institutional config for call scripts
      const instConfigStr = institutionalConfig ? `
INSTITUTIONAL VOICE:
${institutionalConfig.institutionName ? `- Institution: ${institutionalConfig.institutionName}${institutionalConfig.institutionAbbreviation ? ` (${institutionalConfig.institutionAbbreviation})` : ''}` : ""}
${institutionalConfig.mascot ? `- Mascot: ${institutionalConfig.mascot}` : ""}
${institutionalConfig.supportCenters?.length ? `- Support resources to mention: ${institutionalConfig.supportCenters.join(", ")}` : ""}
${institutionalConfig.preferredPhrases?.length ? `- Preferred phrases: ${institutionalConfig.preferredPhrases.join(", ")}` : ""}
${institutionalConfig.wordsToAvoid?.length ? `- Words to AVOID: ${institutionalConfig.wordsToAvoid.join(", ")}` : ""}

SYSTEMS TO REFERENCE:
${institutionalConfig.portalName ? `- Student Portal: ${institutionalConfig.portalName}` : ""}
${institutionalConfig.advisingSystemName ? `- Advising System: ${institutionalConfig.advisingSystemName}` : ""}
${institutionalConfig.schedulingSystemName ? `- Scheduling: ${institutionalConfig.schedulingSystemName}` : ""}

KEY CONTACTS:
${institutionalConfig.primaryContactPhone ? `- Main Phone: ${institutionalConfig.primaryContactPhone}` : ""}
${institutionalConfig.advisingEmail ? `- Advising Email: ${institutionalConfig.advisingEmail}` : ""}
${institutionalConfig.appointmentLink ? `- Booking Link: ${institutionalConfig.appointmentLink}` : ""}
${institutionalConfig.officeHoursFormat ? `- Office Hours: ${institutionalConfig.officeHoursFormat}` : ""}` : "";

      userPrompt = `Generate a comprehensive phone call script template for student outreach. This script will be copied into a CRM or marketing system, so use "[Student]" as a placeholder for student names.

CALL CONTEXT:
- Student Type: ${context.audience}
- Call Purpose: ${context.moment}
- Topic/Domain: ${context.domain}
- Primary Goal: ${context.goal}
- Tone: ${context.tone}
- Caller Role: ${context.callerRole || "Academic Advisor"}
${context.specificContext ? `- Specific Situation: ${context.specificContext}` : ""}
${context.dueDate ? `
DEADLINE INFO:
- Deadline: ${context.urgencyLabel || "Deadline"}: ${context.dueDate}
- Days remaining: ${daysUntil} days` : ""}
${instConfigStr}

IMPORTANT: Use "[Student]" as the placeholder for the student's name throughout the script. Do NOT use specific names or [Student Name] - always use [Student].

Generate a structured call script with these sections. Return valid JSON only:

{
  "opening": "The opening greeting and introduction using [Student] as placeholder (2-3 sentences)",
  "purposeStatement": "Clear statement of why you're calling (1-2 sentences)",
  "keyTalkingPoints": [
    "First key point to cover",
    "Second key point to cover",
    "Third key point to cover"
  ],
  "objectionHandlers": [
    {
      "objection": "Common student pushback or concern",
      "response": "Empathetic and helpful response"
    },
    {
      "objection": "Another common objection",
      "response": "Response that addresses the concern"
    }
  ],
  "closingOptions": [
    {
      "scenario": "Student agrees to action",
      "script": "Positive closing with next steps"
    },
    {
      "scenario": "Student needs time to think",
      "script": "Supportive closing with follow-up plan"
    },
    {
      "scenario": "Student declines",
      "script": "Graceful closing that leaves door open"
    }
  ],
  "voicemailScript": "Complete voicemail message using [Student] placeholder if student doesn't answer (30 seconds max)",
  "followUpNotes": "Recommended follow-up actions after the call"
}`;
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
        return new Response(JSON.stringify({ 
          messages: [{ channel: channels[0], content: generatedContent }] 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Parse JSON response for call-script type
    if (type === "call-script") {
      let jsonContent = generatedContent;
      const jsonMatch = generatedContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
      
      try {
        const parsed = JSON.parse(jsonContent);
        return new Response(JSON.stringify({ script: parsed }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (parseError) {
        console.error("Failed to parse call-script response:", parseError);
        return new Response(JSON.stringify({ error: "Failed to parse call script" }), {
          status: 500,
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
