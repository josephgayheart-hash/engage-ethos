import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, getClientIP, rateLimitExceededResponse, logSecurityEvent } from "../_shared/rateLimit.ts";
import { resilientFetch, corsHeaders, handleGatewayErrorResponse } from "../_shared/resilience.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: 60 requests per minute per IP
    const clientIP = getClientIP(req);
    const rateLimit = await checkRateLimit(clientIP, "generate-message", { maxRequests: 60, windowSeconds: 60 });
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit);
    }
    const { type, context, institutionalConfig, touchpoint, channels, startDate, endDate, contentDNA, model: requestedModel } = await req.json();
    
    // Validate and select model
    const ALLOWED_MODELS = [
      'google/gemini-2.5-flash', 'google/gemini-2.5-flash-lite', 'google/gemini-2.5-pro',
      'google/gemini-3-flash-preview', 'google/gemini-3.1-pro-preview',
      'openai/gpt-5', 'openai/gpt-5-mini', 'openai/gpt-5-nano', 'openai/gpt-5.2'
    ];
    const selectedModel = requestedModel && ALLOWED_MODELS.includes(requestedModel) ? requestedModel : 'google/gemini-3-flash-preview';
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build Content DNA prompt section if provided
    let contentDNAPrompt = "";
    if (contentDNA?.voiceAnalysis) {
      const va = contentDNA.voiceAnalysis;
      const bp = contentDNA.brandPlatform;
      const bs = contentDNA.brandSelection; // Brand layer selection
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
Brand Pillars:
${bp.brandPillars.map((p: any) => `- ${p.name}: ${p.description}${p.keywords?.length ? ` (Keywords: ${p.keywords.join(", ")})` : ""}`).join("\n")}` : ""}
${bp.proofPoints?.length ? `
Proof Points:
${bp.proofPoints.map((p: string) => `- ${p}`).join("\n")}` : ""}
${bp.commitments?.length ? `
Commitments:
${bp.commitments.map((c: string) => `- ${c}`).join("\n")}` : ""}
${bp.brandPathways?.length ? `
Brand Pathways:
${bp.brandPathways.map((p: any) => `- ${p.name}: ${p.description}`).join("\n")}` : ""}
${bs ? `
=== SELECTED BRAND ELEMENTS TO EMPHASIZE (CRITICAL) ===
${bs.includePromise && bp.brandPromise ? `
BRAND PROMISE (MUST incorporate):
"${bp.brandPromise}"
` : ""}
${bs.pillars?.length > 0 ? `
SELECTED BRAND PILLARS (${bs.pillars.length} selected):
${bs.pillars.map((pillarName: string) => {
  const pillar = bp.brandPillars?.find((p: any) => p.name === pillarName);
  return pillar ? `• ${pillar.name}: ${pillar.description}${pillar.keywords?.length ? ` [Keywords: ${pillar.keywords.join(", ")}]` : ""}` : `• ${pillarName}`;
}).join("\n")}
` : ""}
${bs.proofPoints?.length > 0 ? `
SELECTED PROOF POINTS (${bs.proofPoints.length} selected):
${bs.proofPoints.map((point: string) => `• ${point}`).join("\n")}
` : ""}
${bs.commitments?.length > 0 ? `
SELECTED COMMITMENTS (${bs.commitments.length} selected):
${bs.commitments.map((commitment: string) => `• ${commitment}`).join("\n")}
` : ""}
${bs.pathways?.length > 0 ? `
SELECTED BRAND PATHWAYS (${bs.pathways.length} selected):
${bs.pathways.map((pathwayName: string) => {
  const pathway = bp.brandPathways?.find((p: any) => p.name === pathwayName);
  return pathway ? `• ${pathway.name}: ${pathway.description}` : `• ${pathwayName}`;
}).join("\n")}
` : ""}
IMPORTANT: The user has specifically selected these brand elements. The generated content MUST strongly reflect these themes.
` : ""}
` : ""}
${contentDNA.customInstructions ? `
CUSTOM BRAND GUIDELINES:
${contentDNA.customInstructions}` : ""}

IMPORTANT: Apply ONLY this Content DNA profile. Do not borrow language, phrases, mascots, slogans, or voice characteristics from any other institution. If you are unsure about a specific term, use generic alternatives rather than inventing institution-specific content.
`;
    }

    // Build Stories & Facts prompt section if provided
    let storiesFactsPrompt = "";
    if (contentDNA?.stories?.length > 0 || contentDNA?.facts?.length > 0) {
      storiesFactsPrompt = `
=== STORIES & FACTS TO INCORPORATE ===
These are REAL, verified stories and data points from the institution. Weave them naturally into the generated content.

`;
      if (contentDNA.stories?.length > 0) {
        storiesFactsPrompt += `AVAILABLE STORIES (${contentDNA.stories.length} selected):
Use these authentic narratives to humanize the message. Include quotes, subject names, and story elements where appropriate.

${contentDNA.stories.map((s: any, i: number) => `
STORY ${i + 1}: "${s.title}" (${s.story_type || s.storyType})
${s.subject_name || s.subjectName ? `- Subject: ${s.subject_name || s.subjectName}${s.subject_role || s.subjectRole ? `, ${s.subject_role || s.subjectRole}` : ""}` : ""}
${s.pull_quote || s.pullQuote ? `- Pull Quote: "${s.pull_quote || s.pullQuote}"` : ""}
- Narrative: ${(s.narrative || "").substring(0, 600)}${s.narrative?.length > 600 ? "..." : ""}
${s.themes?.length ? `- Themes: ${s.themes.join(", ")}` : ""}
`).join("\n")}

STORY USAGE GUIDELINES BY CHANNEL:
- Email: Use pull quotes in body, mention student names in personalized sections
- Landing Page: Feature story prominently in hero or testimonial sections
- Case for Support: Lead with story, use throughout for emotional connection
- Social Media: Short quote snippet with attribution
- SMS: Brief reference to real student success
- News Article: Include subject quotes and background narrative
- Talking Points: Reference specific student examples for authenticity
- Direct Mail: Open with compelling story excerpt

`;
      }

      if (contentDNA.facts?.length > 0) {
        storiesFactsPrompt += `AVAILABLE FACTS & STATISTICS (${contentDNA.facts.length} selected):
Use these verified data points to add credibility and specificity. Display as bold statistics where visually impactful.

${contentDNA.facts.map((f: any) => `
• ${f.label}: ${f.value}${f.context ? ` (${f.context})` : ""}${f.year ? ` [${f.year}]` : ""}
  Category: ${f.category}${f.subcategory ? ` > ${f.subcategory}` : ""}
`).join("")}

FACT USAGE GUIDELINES BY CHANNEL:
- Email: Lead with compelling stat in subject line or opening hook
- Landing Page: Display as large, visual statistics in dedicated section
- Case for Support: Use for impact statistics section, giving levels, outcomes
- Social Media: Single compelling stat as hook
- SMS: One key number that drives action
- News Article: Lead paragraph statistics, supporting data throughout
- Talking Points: Supporting data points for key messages
- Digital Ads: Headline statistics that grab attention
- Direct Mail: Open with impact stat, reinforce in body

`;
      }

      storiesFactsPrompt += `CRITICAL: These stories and facts are SPECIFICALLY SELECTED by the user. Incorporate them prominently and authentically in the generated content.
`;
    }

    let systemPrompt = `You are CampusVoice.AI, an AI assistant specialized in creating effective, ethical communications for higher education institutions - both student-facing and employee-facing.

Your messages should:
- Be evidence-based and grounded in persuasion research
- Respect recipient autonomy and avoid manipulative tactics
- Use appropriate authority cues without being authoritative
- Minimize cognitive load with clear, scannable content
- Include clear calls-to-action when appropriate
${contentDNAPrompt}
${storiesFactsPrompt}
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
- Include relevant institutional names and resources when available

CRITICAL - NO PLACEHOLDERS RULE:
NEVER use placeholder text like "[University Name]", "[Institution]", "[Your Name]", "[Date]", or any text in square brackets.
Always use the ACTUAL institution name, leader names, and specific details provided in the context.
If specific information is not provided, use realistic generic alternatives (e.g., "our institution", "the Dean", "this semester").
This applies to ALL generated content - emails, documents, talking points, cases for support, etc.`;

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
        "landing-page": "Conversion-optimized landing page. Return JSON: { \"headline\": \"Benefit-driven H1 (under 10 words)\", \"subheadline\": \"Supporting H2 value proposition\", \"slug\": \"url-slug\", \"body\": \"2-3 punchy paragraphs, scannable, benefit-focused\", \"sections\": [{\"heading\": \"H2 Heading\", \"text\": \"Brief content\"}], \"cta\": \"Action verb CTA\", \"ctaUrl\": \"#action\" }. Keep all copy concise and short-form. Every word must earn its place.",
        "direct-mail": "Direct mail letter opening paragraph and key message. Formal tone. 100-150 words.",
        "phone-call": "Phone call script talking points. Bullet format. Include greeting, key message, and closing.",
        "digital-ad-search": `Google/Bing Search Ad. Return JSON object with exact fields: { "headlines": ["Headline 1 (max 30 chars)", "Headline 2 (max 30 chars)", "Headline 3 (max 30 chars)"], "descriptions": ["Description 1 (max 90 chars)", "Description 2 (max 90 chars)"], "displayUrl": "university.edu/path" }`,
        "digital-ad-social": `Meta/LinkedIn Social Ad. Return JSON object with exact fields: { "primaryText": "Main ad copy (125 chars ideal)", "headline": "Bold headline (40 chars max)", "description": "Link description (optional)", "ctaButton": "Learn More", "platform": "meta" }`,
        "news-article": `University News Article for .edu news/media sites. Return JSON object with exact fields:
{
  "headline": "Compelling headline that grabs attention (8-12 words, active voice)",
  "subheadline": "Supporting subheadline that adds context (15-20 words)",
  "leadParagraph": "The lede - answers who, what, when, where, why in 2-3 compelling sentences. Front-load the most newsworthy information.",
  "bodyParagraphs": [
    "Second paragraph - expand on the key details with quotes from relevant stakeholders",
    "Third paragraph - provide context, background, or supporting data",
    "Fourth paragraph - include additional perspectives or implications",
    "Fifth paragraph - future outlook or call to action"
  ],
  "pullQuote": {
    "quote": "A compelling direct quote from a key figure",
    "attribution": "Name, Title"
  },
  "boilerplate": "Standard institutional boilerplate about the university (2-3 sentences)",
  "mediaContact": {
    "name": "Media contact name",
    "title": "Title",
    "email": "email@university.edu",
    "phone": "(xxx) xxx-xxxx"
  },
  "suggestedTags": ["Tag 1", "Tag 2", "Tag 3"],
  "relatedLinks": ["Link description 1", "Link description 2"]
}

STYLE GUIDE FOR UNIVERSITY NEWS:
- Write in inverted pyramid style (most important info first)
- Use active voice and strong verbs
- Include at least one direct quote from a university official or stakeholder
- Maintain journalistic objectivity while highlighting institutional achievements
- Reference specific programs, initiatives, or data points
- Keep paragraphs short (2-3 sentences max for web readability)
- Include context that connects to broader institutional mission or community impact`,
        "talking-points": `Executive Talking Points for a president, dean, provost, or senior leader. MUST return valid JSON with these fields:
{
  "context": "Specific meeting/speech context (e.g., 'Board of Trustees quarterly meeting', 'Alumni donor reception')",
  "audience": "Target audience with their priorities (e.g., 'Board members focused on enrollment and financial sustainability')",
  "openingHook": "A compelling 2-3 sentence opening that grabs attention and sets the tone. Use a powerful statistic, story, or bold statement grounded in the institution's brand promise.",
  "keyMessages": [
    "First key message - a complete, quotable talking point (2-3 sentences each)",
    "Second key message - directly tied to institutional pillars or proof points",
    "Third key message - addresses audience concerns or priorities",
    "Fourth key message - forward-looking vision or commitment",
    "Fifth key message - call to partnership or support"
  ],
  "supportingData": [
    "Specific statistic or achievement (e.g., '94% first-year retention rate, up 3% from last year')",
    "Proof point or evidence (e.g., '$2.3M in new scholarship funding')",
    "Comparative data or benchmark (e.g., 'Top 10 in regional rankings for student outcomes')"
  ],
  "anticipatedQuestions": [
    "Question 1: Full question an audience member might ask",
    "Question 2: Another likely question",
    "Question 3: A challenging question to prepare for"
  ],
  "suggestedResponses": [
    "Response to Q1: Brief, confident answer with supporting evidence",
    "Response to Q2: Brief, confident answer",
    "Response to Q3: Brief, confident answer that acknowledges complexity"
  ],
  "transitionPhrases": [
    "A natural transition phrase (e.g., 'This brings me to an exciting development...')",
    "Another transition (e.g., 'What makes this possible is...')"
  ],
  "closingStatement": "A powerful 2-3 sentence closing that reinforces the brand promise, inspires action, and leaves a memorable impression."
}

CRITICAL: Each field must contain SUBSTANTIAL, SPECIFIC content. Key messages should be complete talking points (2-3 sentences each), not fragments. Ground all content in the institutional brand platform, pillars, proof points, and pathways. Make this immediately usable by an executive.`,
        "case-for-care": `Advancement Case for Support document for fundraising and philanthropy. Create a VIBRANT, magazine-style document. Return JSON object with exact fields:
{
  "documentTitle": "Transforming Tomorrow: A Case for Support",
  "campaignName": "The Campaign for Excellence",
  "campaignTagline": "Dream Bold. Give Boldly.",
  "targetAmount": "$50 million",
  "openingStory": {
    "headline": "A Dream Realized",
    "narrative": "2-3 paragraphs telling a compelling human story. Begin with a specific person whose life has been transformed. Make it personal, emotional, and urgent. Use vivid details and sensory language.",
    "attribution": "Name of the person in the story, Class Year or Role"
  },
  "problemStatement": "The challenge or need being addressed - why now, why this matters",
  "visionStatement": "Bold vision for what's possible with philanthropic support",
  "missionConnection": "How this campaign connects to the institutional mission and values",
  "keyPrograms": [
    { "name": "Program Name", "description": "What the program does", "impact": "Specific measurable impact" },
    { "name": "Program 2", "description": "...", "impact": "..." },
    { "name": "Program 3", "description": "...", "impact": "..." }
  ],
  "impactStatistics": [
    { "value": "94%", "label": "graduation rate", "context": "up 5% from 2020" },
    { "value": "#1", "label": "for upward mobility in the region" },
    { "value": "$2.3B", "label": "economic impact annually" },
    { "value": "15,000+", "label": "students supported each year" },
    { "value": "200+", "label": "community partnerships" }
  ],
  "pullQuotes": [
    { "quote": "Education is the most powerful tool we can use to change the world.", "attribution": "Chancellor Name" },
    { "quote": "This place changed my life and my family's future forever.", "attribution": "Graduate Name, Class Year" }
  ],
  "testimonials": [
    { "quote": "A compelling donor or student testimonial", "attribution": "Name, Title", "role": "Donor" },
    { "quote": "Another powerful quote", "attribution": "Name, Title", "role": "Student" }
  ],
  "givingLevels": [
    { "amount": "$1,000", "impact": "Provides emergency funds for one student" },
    { "amount": "$5,000", "impact": "Funds a summer research opportunity" },
    { "amount": "$25,000", "impact": "Establishes a named scholarship" },
    { "amount": "$100,000", "impact": "Creates an endowed fund for ongoing support" }
  ],
  "callToAction": "Join us in transforming lives. Your gift today will...",
  "closingStatement": "Together, we can ensure that every student has the opportunity to succeed. Your partnership makes the difference.",
  "contactInfo": {
    "name": "Development Officer Name",
    "title": "Director of Development",
    "email": "giving@university.edu",
    "phone": "(xxx) xxx-xxxx"
  }
}

STYLE GUIDE FOR CASE FOR SUPPORT:
- Lead with emotion through compelling storytelling - make readers FEEL the impact
- Position the donor as the hero who makes transformation possible
- Use LARGE, visual statistics (format as objects with value + label for display)
- Include 2-3 powerful pull quotes for visual emphasis
- Use clear, simple language (avoid jargon and academic speak)
- Include specific, tangible impact statements
- Make giving levels relatable ("provides X for Y students")
- Connect to institutional mission and brand pillars
- End with a bold, inspiring call to partnership
- Write with passion and authenticity throughout
- Think of this as a magazine spread, not a boring report

CRITICAL - INSTITUTION NAME RULE:
You MUST use the actual institution name provided in the INSTITUTIONAL VOICE & BRANDING section.
NEVER use placeholder text like "[University Name]", "[Institution]", "[College Name]", or any bracketed placeholders.
If the institution name is "Ohio State College of Arts and Sciences", use that exact name throughout.
If no institution name is provided, use a generic but real-sounding alternative like "our institution" or "our college".
THIS IS MANDATORY - every document title, campaign name, and reference must use the real institution name.`
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
    { "channel": "talking-points", "content": { "context": "Specific meeting context", "audience": "Target audience with priorities", "openingHook": "Compelling 2-3 sentence opening", "keyMessages": ["Full talking point 1 (2-3 sentences)", "Full talking point 2", "Full talking point 3", "Full talking point 4", "Full talking point 5"], "supportingData": ["Specific stat 1", "Specific stat 2", "Specific stat 3"], "anticipatedQuestions": ["Full question 1", "Full question 2", "Full question 3"], "suggestedResponses": ["Answer to Q1", "Answer to Q2", "Answer to Q3"], "transitionPhrases": ["Transition phrase 1", "Transition phrase 2"], "closingStatement": "Powerful 2-3 sentence closing" } }
  ]
}

IMPORTANT for digital-ad-search: content MUST be a JSON object with "headlines" (array of 3 strings), "descriptions" (array of 2 strings), and "displayUrl" (string).
IMPORTANT for digital-ad-social: content MUST be a JSON object with "primaryText", "headline", "description", "ctaButton", and "platform" fields.
IMPORTANT for talking-points: content MUST be a JSON object with ALL these fields: "context", "audience", "openingHook" (2-3 compelling sentences), "keyMessages" (array of 5 COMPLETE talking points, each 2-3 sentences), "supportingData" (array of 3 SPECIFIC stats/facts), "anticipatedQuestions" (array of 3 FULL questions), "suggestedResponses" (array of 3 brief answers), "transitionPhrases" (array of 2), and "closingStatement" (2-3 powerful sentences). Each talking point in keyMessages MUST be substantial and quotable. Ground content in brand pillars, promise, proof points, and pathways.`;
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

    const response = await resilientFetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      },
      { label: "generate-message", maxRetries: 2, timeoutMs: 90_000 }
    );

    if (!response.ok) {
      return await handleGatewayErrorResponse(response, "generate-message");
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
