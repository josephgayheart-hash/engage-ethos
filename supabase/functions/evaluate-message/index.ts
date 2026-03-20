import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, getClientIP, rateLimitExceededResponse, logSecurityEvent } from "../_shared/rateLimit.ts";
import { resilientFetch, corsHeaders, handleGatewayErrorResponse } from "../_shared/resilience.ts";

const buildSystemPrompt = (industryContext = 'higher education', contentStyle = 'institutional communications') => `You are CampusVoice.AI, an AI-powered strategic messaging intelligence platform designed specifically for ${industryContext}.

Your purpose is to help higher education administrators, marketers, enrollment leaders, and student success professionals DESIGN, EVALUATE, and PLAN student-facing communication that supports persistence, retention, and engagement.

You are grounded in peer-reviewed communication and persuasion research tested in higher education contexts, including:
- Persuasion principles (Cialdini), with particular emphasis on authority
- Susceptibility to persuasion (Kaptein)
- Elaboration Likelihood Model (Petty & Cacioppo)
- Ethical persuasion and autonomy (O'Keefe)
- Communication technology affordances (Sundar's MAIN model)
- Empirical findings demonstrating that authoritative message framing increases students' intentions to engage in positive academic behaviors, while consensus cues show limited or context-dependent effects in higher education
- Online learner research (Moore's Transactional Distance Theory, Community of Inquiry framework, Tinto's persistence model adapted for online contexts)

ONLINE LEARNER CONSIDERATIONS:
When the audience includes online learners, apply these research-backed principles:
- Reduce transactional distance through personalized, warm, instructor-present messaging
- Emphasize community and belonging cues to counter isolation (Community of Inquiry - social presence)
- Provide clear, structured guidance given asynchronous context and self-regulation demands
- Acknowledge time/life constraints common to adult online learners (work, family, geographic distance)
- Prioritize flexible deadlines messaging and self-paced encouragement where appropriate
- Use technology-mediated immediacy behaviors (prompt responses, accessible tone, availability cues)
- Address technical support and resource accessibility proactively
- Leverage asynchronous channel strengths (email, portal) while maintaining connection

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

const BUILDER_PROMPT = `When building messages from scratch, generate CHANNEL-SPECIFIC content for each requested channel.

Based on the provided context:
- Recommend an appropriate authority level
- Recommend sender role
- Generate content tailored to EACH selected channel

CHANNEL-SPECIFIC REQUIREMENTS:
- EMAIL: Include subject line and full body with proper greeting, content, CTA, and signature placeholder
- SMS: Keep under 160 characters when possible, direct and actionable, no subject line needed
- SOCIAL MEDIA: Platform-appropriate tone, engaging, may include hashtag suggestions, under 280 characters
- PORTAL: Dashboard-style notification, clear and scannable, action-oriented
- LANDING PAGE: Write conversion-optimized landing page content following best practices. Include: a concise, benefit-driven H1 headline (under 10 words), a supporting H2 subheadline that expands the value proposition, a suggested URL slug (lowercase, hyphenated, 2-4 words), short-form body copy (2-3 punchy paragraphs, scannable, benefit-focused), optional content sections with clear H2 headings and brief text, and a strong single CTA with action-oriented button text (e.g. "Apply Now", "Get Started", "Request Info"). Keep all copy concise—every word must earn its place.
- DIRECT MAIL: Formal letter format with salutation, body paragraphs, and closing
- PHONE CALL: Include opening statement, purpose statement, 3-5 talking points, objection handlers, closing options, and voicemail script
- DIGITAL-AD-SEARCH: Google/Bing search ad with 3 headlines (max 30 chars each) and 2 descriptions (max 90 chars each)
- DIGITAL-AD-SOCIAL: Meta/LinkedIn ad with primary text, headline, description, and CTA button
- NEWS-ARTICLE: University news article with headline, subheadline, lead paragraph, body paragraphs, pull quote, boilerplate, and media contact. Write in inverted pyramid style with journalistic objectivity.
- TALKING-POINTS: Executive talking points for senior leaders with opening hook, 5 key messages (2-3 sentences each), supporting data, anticipated Q&A with responses, and closing statement
- CASE-FOR-CARE: Advancement Case for Support document for fundraising. Create a VIBRANT, magazine-style document with: document title, campaign name, campaign tagline, target amount, opening story (with headline, narrative, and attribution), problem statement, vision statement, mission connection, key programs (3-5), impact statistics (5+ as objects with value and label for BIG visual display, e.g. {"value": "94%", "label": "graduation rate"}), pull quotes (2-3 memorable quotes for visual emphasis), testimonials, giving levels, call to action, closing statement, and contact info.

IMPORTANT: Respond ONLY with valid JSON:
{
  "channelDrafts": {
    "email": { "subject": "Subject line here", "body": "Full email body..." },
    "sms": "Short SMS message here",
    "social-media": "Social media post content here",
    "portal": "Portal notification content here",
    "landing-page": { "headline": "Short benefit-driven H1", "subheadline": "Supporting H2 value proposition", "slug": "url-friendly-slug", "body": "Concise benefit-focused copy", "sections": [{"heading": "Section H2 Heading", "text": "Brief section content"}], "cta": "Action-Oriented CTA", "ctaUrl": "#apply" },
    "direct-mail": "Full letter content here",
    "phone-call": { 
      "opening": "Hello, this is (your name) from (your institution)...",
      "purpose": "I'm calling today to...",
      "talkingPoints": ["Point 1", "Point 2", "Point 3"],
      "objectionHandlers": ["If busy: ...", "If not interested: ..."],
      "closing": "Thank you for your time...",
      "voicemail": "Hi, this is (your name) from (your institution)..."
    },
    "digital-ad-search": {
      "headlines": ["Headline 1 (max 30 chars)", "Headline 2", "Headline 3"],
      "descriptions": ["Description 1 (max 90 chars)", "Description 2"],
      "displayUrl": "university.edu/path"
    },
    "digital-ad-social": {
      "primaryText": "Main ad copy (125 chars ideal)",
      "headline": "Bold headline (40 chars max)",
      "description": "Link description",
      "ctaButton": "Learn More"
    },
    "news-article": {
      "headline": "Compelling headline (8-12 words)",
      "subheadline": "Supporting context (15-20 words)",
      "leadParagraph": "Who, what, when, where, why in 2-3 sentences",
      "bodyParagraphs": ["Paragraph 2", "Paragraph 3", "Paragraph 4", "Paragraph 5"],
      "pullQuote": { "quote": "Direct quote", "attribution": "Name, Title" },
      "boilerplate": "Institutional boilerplate",
      "mediaContact": { "name": "...", "title": "...", "email": "...", "phone": "..." },
      "suggestedTags": ["Tag 1", "Tag 2"],
      "relatedLinks": ["Link 1", "Link 2"]
    },
    "talking-points": {
      "context": "Specific meeting/speech context",
      "audience": "Target audience with their priorities",
      "openingHook": "A compelling 2-3 sentence opening that grabs attention",
      "keyMessages": [
        "First key message - complete, quotable (2-3 sentences)",
        "Second key message - tied to institutional pillars",
        "Third key message - addresses audience concerns",
        "Fourth key message - forward-looking vision",
        "Fifth key message - call to partnership"
      ],
      "supportingData": [
        "Specific statistic or achievement",
        "Proof point or evidence",
        "Comparative data or benchmark"
      ],
      "anticipatedQuestions": ["Question 1", "Question 2", "Question 3"],
      "suggestedResponses": ["Response to Q1", "Response to Q2", "Response to Q3"],
      "transitionPhrases": ["Transition phrase 1", "Transition phrase 2"],
      "closingStatement": "Powerful 2-3 sentence closing"
    },
    "case-for-care": {
      "documentTitle": "Transforming Tomorrow: A Case for Support",
      "campaignName": "Campaign for Excellence",
      "campaignTagline": "Dream Bold. Give Boldly.",
      "targetAmount": "$50 million",
      "leaderMessage": {
        "leaderName": "Dr. Jane Smith",
        "leaderTitle": "Dean / President / Chancellor",
        "message": "A personal, compelling 2-3 paragraph letter from leadership that establishes vision, gratitude, and invitation to partner...",
        "signature": "Jane Smith, Ph.D."
      },
      "openingStory": {
        "headline": "A Dream Realized",
        "narrative": "When Maria first walked through our doors, she carried not just textbooks but the weight of generations of hope...\n\nHer journey from first-generation student to Rhodes Scholar embodies everything we stand for...",
        "attribution": "Maria Gonzalez, Class of 2024"
      },
      "strategicPillars": [
        { "name": "Preparing Change Makers", "description": "Developing leaders who will transform their communities and fields..." },
        { "name": "Advancing Innovation", "description": "Pioneering research and solutions that address society's greatest challenges..." },
        { "name": "Fostering Healthy Communities", "description": "Partnering with communities to improve well-being and create lasting impact..." }
      ],
      "problemStatement": "The challenge facing today's students...",
      "visionStatement": "A bold vision for transformation...",
      "missionConnection": "Rooted in our founding mission...",
      "keyPrograms": [
        { "name": "Program 1", "description": "...", "impact": "..." }
      ],
      "impactStatistics": [
        { "value": "94%", "label": "graduation rate" },
        { "value": "#1", "label": "for upward mobility" },
        { "value": "$2B", "label": "economic impact annually" },
        { "value": "15K+", "label": "students supported" },
        { "value": "200+", "label": "community partnerships" }
      ],
      "pullQuotes": [
        { "quote": "Education is the most powerful tool we can use to change the world.", "attribution": "Chancellor Johnson" },
        { "quote": "This university changed my life and my family's future forever.", "attribution": "James Chen, First-Gen Graduate" }
      ],
      "testimonials": [
        { "quote": "...", "attribution": "Name, Title", "role": "Donor" }
      ],
      "givingOpportunities": [
        {
          "category": "Investing in Students",
          "opportunities": [
            { "name": "Named Endowed Scholarship", "amount": "$50,000", "description": "Provides permanent support for future leaders" },
            { "name": "Annual Scholarship", "amount": "$5,000", "description": "Opens doors to an exceptional education" }
          ]
        },
        {
          "category": "Investing in Faculty",
          "opportunities": [
            { "name": "Endowed Professorship", "amount": "$1.5 million", "description": "Attracts world-class scholars" },
            { "name": "Research Fund", "amount": "$250,000", "description": "Supports critical investigation" }
          ]
        },
        {
          "category": "Investing in Innovation",
          "opportunities": [
            { "name": "Dean's Innovation Fund", "amount": "$25,000", "description": "Enables nimble response to opportunities" },
            { "name": "Named Space", "amount": "$10,000+", "description": "Creates lasting legacy in our facilities" }
          ]
        }
      ],
      "givingLevels": [
        { "amount": "$1,000", "impact": "Provides emergency funds" },
        { "amount": "$25,000", "impact": "Names a scholarship" },
        { "amount": "$100,000", "impact": "Creates an endowment" }
      ],
      "callToAction": "Join us in transforming lives. Your gift today...",
      "closingStatement": "Together, we can ensure every student has the opportunity to succeed.",
      "contactInfo": { "name": "...", "title": "...", "email": "...", "phone": "..." }
    }
  },
  "recommendedAuthority": "...",
  "recommendedSender": "...",
  "recommendedLength": "varies by channel"
}

Only include channels that were requested in the context. Do not include channels that were not selected.`;

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

function downsampleTouchpoints<T>(items: T[], targetCount: number): T[] {
  if (!Array.isArray(items)) return [];
  if (targetCount <= 0) return [];
  if (items.length <= targetCount) return items;
  if (targetCount === 1) return [items[0]];

  const lastIndex = items.length - 1;
  const selected: T[] = [];

  // Evenly sample across the full list while preserving order (includes first + last).
  for (let i = 0; i < targetCount; i++) {
    const idx = Math.round((i * lastIndex) / (targetCount - 1));
    selected.push(items[idx]);
  }

  return selected;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: 60 requests per minute per IP
    const clientIP = getClientIP(req);
    const rateLimit = await checkRateLimit(clientIP, "evaluate-message", { maxRequests: 60, windowSeconds: 60 });
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit);
    }
    const { message, context, mode, institutionalConfig, journeyWeeks, startDate, endDate, model: requestedModel } = await req.json();
    
    // Validate and select model
    const ALLOWED_MODELS = [
      'google/gemini-2.5-flash', 'google/gemini-2.5-flash-lite', 'google/gemini-2.5-pro',
      'google/gemini-3-flash-preview', 'google/gemini-3.1-pro-preview',
      'openai/gpt-5', 'openai/gpt-5-mini', 'openai/gpt-5-nano', 'openai/gpt-5.2'
    ];
    const selectedModel = requestedModel && ALLOWED_MODELS.includes(requestedModel) ? requestedModel : 'google/gemini-3-flash-preview';
    
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
${context.additionalContext ? `
ADDITIONAL CONTEXT & REFINEMENT NOTES:
${context.additionalContext}
- IMPORTANT: Use the above context to tailor the message specifically to this situation. Incorporate relevant details naturally.` : ''}

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

INSTITUTIONAL CUSTOMIZATION FOR: ${institutionalConfig.institutionName || 'Selected Profile'}
===================================================================================
CRITICAL GUARDRAIL: Use ONLY the information provided below. Do NOT borrow mascots, slogans, system names, or any identifying information from ANY other institution. If a value is "Not specified", use a generic alternative - do NOT substitute information from other universities.

IDENTITY:
- Institution Name: ${institutionalConfig.institutionName || 'Not specified'}
- Unit / Profile Name: ${institutionalConfig.unitName || 'Not specified'}
- Unit Type: ${institutionalConfig.unitType || 'Not specified'}
- Abbreviation: ${institutionalConfig.institutionAbbreviation || 'Not specified'}
- Mascot: ${institutionalConfig.mascot || 'Not specified'}
- Slogans: ${institutionalConfig.slogans?.join(', ') || 'Not specified'}

UNIT NAMING RULES (CRITICAL):
- If a Unit / Profile Name is specified, you MUST use it throughout the content (especially for CASE-FOR-CARE).
- Prefer formats like "${institutionalConfig.unitName || 'the unit'} at ${institutionalConfig.institutionName || 'the university'}" rather than generic "the university".
- NEVER invent a different unit name.

DIGITAL SYSTEMS (use these exact names):
- Student Portal: ${institutionalConfig.portalName || 'student portal'}
- LMS: ${institutionalConfig.lmsName || 'learning management system'}
- Email Domain: ${institutionalConfig.emailDomain || 'Not specified'}
- Advising System: ${institutionalConfig.advisingSystemName || 'advising system'}
- Scheduling System: ${institutionalConfig.schedulingSystemName || 'scheduling system'}
- Degree Audit: ${institutionalConfig.degreeAuditSystem || 'degree audit'}
- Financial Aid Portal: ${institutionalConfig.financialAidPortal || 'financial aid portal'}
- Registration System: ${institutionalConfig.registrationSystem || 'registration system'}
- Virtual Meeting Platform: ${institutionalConfig.virtualMeetingPlatform || 'virtual meeting platform'}

CAMPUS LOCATIONS:
- Building Names: ${institutionalConfig.buildingNames?.join(', ') || 'Not specified'}
- Program Names: ${institutionalConfig.programNames?.join(', ') || 'Not specified'}
- Support Centers: ${institutionalConfig.supportCenters?.join(', ') || 'Not specified'}
- Library: ${institutionalConfig.libraryName || 'library'}
- Tutoring Center: ${institutionalConfig.tutorCenter || 'tutoring center'}
- Writing Center: ${institutionalConfig.writingCenter || 'writing center'}
- Math Center: ${institutionalConfig.mathCenter || 'math center'}
- Career Center: ${institutionalConfig.careerCenter || 'career center'}
- Counseling Center: ${institutionalConfig.counselingCenter || 'counseling center'}
- Health Center: ${institutionalConfig.healthCenter || 'health center'}
- Fitness Center: ${institutionalConfig.fitnessCenter || 'fitness center'}
- Dining Hall: ${institutionalConfig.diningHall || 'dining hall'}
- Campus Terms: ${institutionalConfig.campusTerms?.join(', ') || 'Not specified'}
- Default Meeting Location: ${institutionalConfig.defaultMeetingLocation || 'Not specified'}

ADMINISTRATIVE OFFICES:
- Registrar: ${institutionalConfig.registrarOffice || 'Registrar\'s Office'}
- Financial Aid: ${institutionalConfig.financialAidOffice || 'Financial Aid Office'}
- Admissions: ${institutionalConfig.admissionsOffice || 'Admissions Office'}
- Bursar: ${institutionalConfig.bursarOffice || 'Bursar\'s Office'}
- IT Help Desk: ${institutionalConfig.itHelpDesk || 'IT Help Desk'}
- Housing: ${institutionalConfig.housingOffice || 'Housing Office'}
- Student Affairs: ${institutionalConfig.studentAffairsOffice || 'Student Affairs'}
- International: ${institutionalConfig.internationalOffice || 'International Office'}
- Disability Services: ${institutionalConfig.disabilityServices || 'Disability Services'}
- Veterans Services: ${institutionalConfig.veteransServices || 'Veterans Services'}

PEOPLE & TITLES:
- Leader Names: ${institutionalConfig.leaderNames?.join(', ') || 'Not specified'}
- Advisor Titles: ${institutionalConfig.advisorTitles?.join(', ') || 'advisor'}
- Staff Titles: ${institutionalConfig.staffTitles?.join(', ') || 'Not specified'}
- Default Advisor Name: ${institutionalConfig.defaultAdvisorName || 'your advisor'}
- Student ID Term: ${institutionalConfig.studentIdTerm || 'student ID'}

CONTACT INFORMATION:
- Primary Email: ${institutionalConfig.primaryContactEmail || 'Not specified'}
- Primary Phone: ${institutionalConfig.primaryContactPhone || 'Not specified'}
- Advising Email: ${institutionalConfig.advisingEmail || 'Not specified'}
- General Help Email: ${institutionalConfig.generalHelpEmail || 'Not specified'}
- Emergency Phone: ${institutionalConfig.emergencyPhone || 'Not specified'}
- Text Alert Number: ${institutionalConfig.textAlertNumber || 'Not specified'}
- Website Links: ${institutionalConfig.websiteLinks?.join(', ') || 'Not specified'}
- Social Media: ${institutionalConfig.socialMediaHandles?.join(', ') || 'Not specified'}
- Appointment Link: ${institutionalConfig.appointmentLink || 'Not specified'}

ACADEMIC TERMS:
- Academic Terms: ${institutionalConfig.academicTerms?.join(', ') || 'Not specified'}
- Grading Terms: ${institutionalConfig.gradingTerms?.join(', ') || 'Not specified'}
- Enrollment Terms: ${institutionalConfig.enrollmentTerms?.join(', ') || 'Not specified'}
- Current Term: ${institutionalConfig.currentTermName || 'current term'}
- Next Term: ${institutionalConfig.nextTermName || 'next term'}
- Office Hours Format: ${institutionalConfig.officeHoursFormat || 'Not specified'}
- Time Zone: ${institutionalConfig.timeZone || 'Not specified'}

CALLS TO ACTION (use these exact CTAs when appropriate):
- Primary CTAs: ${institutionalConfig.primaryCTAs?.join(', ') || 'Not specified'}
- Secondary CTAs: ${institutionalConfig.secondaryCTAs?.join(', ') || 'Not specified'}
- Urgent CTAs: ${institutionalConfig.urgentCTAs?.join(', ') || 'Not specified'}

STYLE & VOICE:
- Signature Templates: ${institutionalConfig.signatureTemplates?.join(' | ') || 'Not specified'}
- Tone Rules: ${institutionalConfig.toneRules?.join(', ') || 'Not specified'}
- Words to Avoid: ${institutionalConfig.wordsToAvoid?.join(', ') || 'Not specified'}
- Preferred Phrases: ${institutionalConfig.preferredPhrases?.join(', ') || 'Not specified'}
- Important Dates: ${institutionalConfig.importantDates?.join(', ') || 'Not specified'}
${institutionalConfig.voiceAnalysis ? `
BRAND VOICE PROFILE (CRITICAL - Match this voice in all generated content):
The following voice profile was extracted from THIS SPECIFIC institution's actual communications. You MUST match this voice and ONLY this voice:

- Overall Tone: ${institutionalConfig.voiceAnalysis.overallTone || 'Not specified'}
- Formality Level: ${institutionalConfig.voiceAnalysis.formalityLevel || 'Not specified'}
- Emotional Tone: ${institutionalConfig.voiceAnalysis.emotionalTone || 'Not specified'}
- Sentence Style: ${institutionalConfig.voiceAnalysis.sentenceStyle || 'Not specified'}
- Key Characteristics: ${institutionalConfig.voiceAnalysis.keyCharacteristics?.join(', ') || 'Not specified'}
- Vocabulary Patterns: ${institutionalConfig.voiceAnalysis.vocabularyPatterns?.join(', ') || 'Not specified'}
- Common Phrases to Use: ${institutionalConfig.voiceAnalysis.commonPhrases?.join('; ') || 'Not specified'}
- Messaging Tactics to Apply: ${institutionalConfig.voiceAnalysis.messagingTactics?.join('; ') || 'Not specified'}

Voice Summary: ${institutionalConfig.voiceAnalysis.summary || 'Not specified'}

IMPORTANT: Emulate ONLY this voice profile. Do NOT borrow language, phrases, or characteristics from other institutions in your training data.
` : ''}
${institutionalConfig.dnaAdjustments ? `
DNA TUNING ADJUSTMENTS (Apply these modifications to the base voice):
These adjustments fine-tune the voice without changing the core DNA. Apply them when generating content:

${institutionalConfig.dnaAdjustments.dimensions?.filter((d: { value: number }) => d.value !== 50).length > 0 ? `
VOICE DIMENSION ADJUSTMENTS:
${institutionalConfig.dnaAdjustments.dimensions
  .filter((d: { value: number }) => d.value !== 50)
  .map((d: { label: string; leftLabel: string; rightLabel: string; value: number }) => {
    const direction = d.value < 50 ? d.leftLabel : d.rightLabel;
    const intensity = Math.abs(d.value - 50) > 30 ? 'strongly' : 'slightly';
    return `- ${d.label}: Adjust ${intensity} toward "${direction}"`;
  }).join('\n')}
` : ''}
${institutionalConfig.dnaAdjustments.sectionFeedback?.length > 0 ? `
SECTION-SPECIFIC FEEDBACK (Apply these corrections):
${institutionalConfig.dnaAdjustments.sectionFeedback.map((f: { section: string; feedback: string }) => `- ${f.section}: ${f.feedback}`).join('\n')}
` : ''}
${institutionalConfig.dnaAdjustments.overrideRules?.length > 0 ? `
OVERRIDE RULES (These take priority):
${institutionalConfig.dnaAdjustments.overrideRules.map((r: { type: string; rule: string }) => `- ${r.type.toUpperCase()}: ${r.rule}`).join('\n')}
` : ''}
` : ''}
${institutionalConfig.brandPlatform ? `
BRAND PLATFORM (Use these elements to guide messaging):
- Brand Promise: ${institutionalConfig.brandPlatform.brandPromise || 'Not specified'}
- Brand Pillars: ${institutionalConfig.brandPlatform.brandPillars?.map((p: { name: string; description: string }) => `${p.name}: ${p.description}`).join('; ') || 'Not specified'}
- Proof Points: ${institutionalConfig.brandPlatform.proofPoints?.join('; ') || 'Not specified'}
- Commitments: ${institutionalConfig.brandPlatform.commitments?.join('; ') || 'Not specified'}
- Brand Pathways: ${institutionalConfig.brandPlatform.brandPathways?.map((p: { name: string; description: string }) => `${p.name}: ${p.description}`).join('; ') || 'Not specified'}
${institutionalConfig.brandSelection ? `
=== SELECTED BRAND ELEMENTS TO EMPHASIZE (CRITICAL - prioritize these in the messaging) ===
${institutionalConfig.brandSelection.includePromise && institutionalConfig.brandPlatform.brandPromise ? `
BRAND PROMISE (MUST incorporate):
"${institutionalConfig.brandPlatform.brandPromise}"
` : ''}
${institutionalConfig.brandSelection.pillars?.length > 0 ? `
SELECTED BRAND PILLARS (${institutionalConfig.brandSelection.pillars.length} selected - emphasize these themes):
${institutionalConfig.brandSelection.pillars.map((pillarName: string) => {
  const pillar = institutionalConfig.brandPlatform?.brandPillars?.find((p: { name: string }) => p.name === pillarName);
  return pillar ? `• ${pillar.name}: ${pillar.description}${pillar.keywords?.length ? ` [Keywords: ${pillar.keywords.join(', ')}]` : ''}` : `• ${pillarName}`;
}).join('\n')}
` : ''}
${institutionalConfig.brandSelection.proofPoints?.length > 0 ? `
SELECTED PROOF POINTS (${institutionalConfig.brandSelection.proofPoints.length} selected - use as evidence):
${institutionalConfig.brandSelection.proofPoints.map((point: string) => `• ${point}`).join('\n')}
` : ''}
${institutionalConfig.brandSelection.commitments?.length > 0 ? `
SELECTED COMMITMENTS (${institutionalConfig.brandSelection.commitments.length} selected - reinforce these promises):
${institutionalConfig.brandSelection.commitments.map((commitment: string) => `• ${commitment}`).join('\n')}
` : ''}
${institutionalConfig.brandSelection.pathways?.length > 0 ? `
SELECTED BRAND PATHWAYS (${institutionalConfig.brandSelection.pathways.length} selected - weave in transformation narratives):
${institutionalConfig.brandSelection.pathways.map((pathwayName: string) => {
  const pathway = institutionalConfig.brandPlatform?.brandPathways?.find((p: { name: string }) => p.name === pathwayName);
  return pathway ? `• ${pathway.name}: ${pathway.description}` : `• ${pathwayName}`;
}).join('\n')}
` : ''}
IMPORTANT: The user has specifically selected these brand elements. The generated content MUST strongly reflect these themes, proof points, and commitments.
` : ''}
${institutionalConfig.selectedPillars && institutionalConfig.selectedPillars.length > 0 && !institutionalConfig.brandSelection ? `
SELECTED BRAND PILLARS TO EMPHASIZE (CRITICAL - prioritize these in the messaging):
${institutionalConfig.selectedPillars.map((pillarName: string) => {
  const pillar = institutionalConfig.brandPlatform?.brandPillars?.find((p: { name: string }) => p.name === pillarName);
  return pillar ? `- ${pillar.name}: ${pillar.description}` : `- ${pillarName}`;
}).join('\n')}

IMPORTANT: The user has specifically selected these pillars to emphasize. Make sure the generated content strongly reflects these themes.
` : ''}` : ''}
CRITICAL GUARDRAILS:
1. Use the EXACT institution name, system names, and terminology provided above
2. Do NOT use placeholder text of any kind (especially anything in square brackets like "[University Name]", "[Institution]", "[Portal Name]", etc.)
3. Do NOT substitute information from other universities (e.g., do not use "Wildcats" if the mascot above is "Buckeyes")
4. If a value is "Not specified", use a generic term (e.g., "our institution") rather than borrowing from another institution
5. Double-check that all mascots, slogans, and spirit phrases match ONLY what is listed above
${institutionalConfig.stories?.length > 0 || institutionalConfig.facts?.length > 0 ? `

=== STORIES & FACTS TO INCORPORATE ===
These are REAL, verified stories and data points from the institution. Weave them naturally into the generated content.

${institutionalConfig.stories?.length > 0 ? `AVAILABLE STORIES (${institutionalConfig.stories.length} selected):
Use these authentic narratives to humanize the message. Include quotes, subject names, and story elements where appropriate.

${institutionalConfig.stories.map((s: any, i: number) => `
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
` : ""}
${institutionalConfig.facts?.length > 0 ? `AVAILABLE FACTS & STATISTICS (${institutionalConfig.facts.length} selected):
Use these verified data points to add credibility and specificity. Display as bold statistics where visually impactful.

${institutionalConfig.facts.map((f: any) => `
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
` : ""}
CRITICAL: These stories and facts are SPECIFICALLY SELECTED by the user. Incorporate them prominently and authentically in the generated content.
` : ""}` : '';

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
        
        // Use estimated touchpoints from cadence selector as an ESTIMATE (AI can vary slightly)
        const estimatedTouchpoints = context.estimatedTouchpoints || Math.max(8, Math.min(20, Math.round(totalWeeks * 1.2)));
        const touchpointTolerance = 0.15; // +/- 15%
        const minTouchpoints = Math.max(1, Math.round(estimatedTouchpoints * (1 - touchpointTolerance)));
        const maxTouchpoints = Math.max(minTouchpoints, Math.round(estimatedTouchpoints * (1 + touchpointTolerance)));
        
        // Cadence and escalation pattern info
        const cadenceInfo = context.cadence ? `
CADENCE SETTINGS (ESTIMATE):
- Target Frequency: ${context.cadence} (${context.cadence === 'daily' ? '~7 per week' : context.cadence === 'every-other-day' ? '~3-4 per week' : context.cadence === '2-3x-week' ? '~2-3 per week' : context.cadence === 'weekly' ? '1 per week' : '~0.5 per week'})
- Escalation Pattern: ${context.escalation || 'none'} ${context.escalation === 'gradual-increase' ? '(start slow, build up)' : context.escalation === 'gradual-decrease' ? '(start strong, taper off)' : context.escalation === 'peak-middle' ? '(build to peak, then taper)' : context.escalation === 'bookend' ? '(heavy start & end)' : '(consistent throughout)'}
- Estimated Touchpoint Count: ~${estimatedTouchpoints} (typical range ${minTouchpoints}-${maxTouchpoints})
IMPORTANT: Generate ${minTouchpoints}-${maxTouchpoints} touchpoints total. Do NOT exceed ${maxTouchpoints}. If you have more ideas, consolidate into fewer touchpoints.` : '';
        
        userPrompt = `Please create a detailed ${totalWeeks}-week messaging strategy journey for this context:
${contextStr}
${cadenceInfo}
${institutionalStr}

Create a comprehensive journey with touchpoints distributed across short-term (weeks 1-${Math.min(4, Math.floor(totalWeeks * 0.3))}), mid-term (weeks ${Math.min(5, Math.floor(totalWeeks * 0.3) + 1)}-${Math.min(8, Math.floor(totalWeeks * 0.65))}), and long-term (weeks ${Math.min(9, Math.floor(totalWeeks * 0.65) + 1)}+) phases.

CRITICAL: Generate ${minTouchpoints}-${maxTouchpoints} touchpoints total (this is an estimate derived from the user's cadence/intensity). Do NOT exceed ${maxTouchpoints}. Distribute them according to the escalation pattern specified.

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
            { role: "system", content: SYSTEM_PROMPT + "\n\n" + modePrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      },
      { label: "evaluate-message", maxRetries: 2, timeoutMs: 90_000 }
    );

    if (!response.ok) {
      return await handleGatewayErrorResponse(response, "evaluate-message");
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

    const extractJson = (raw: string) => {
      let cleaned = raw.trim();
      // Strip markdown code fences if present
      const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
      if (fenceMatch) {
        cleaned = fenceMatch[1].trim();
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*\n/, '').replace(/\n\s*```\s*$/, '').trim();
      }
      // Try to find the outermost JSON object if there's leading/trailing text
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
      }
      // Fix common JSON issues: trailing commas before closing braces/brackets
      cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
      return cleaned;
    };

    let jsonContent = extractJson(content);

    try {
      const result = JSON.parse(jsonContent);

      // Normalize channelDrafts keys - AI sometimes returns variant key names
      if (result.channelDrafts && typeof result.channelDrafts === 'object') {
        const keyMappings: Record<string, string> = {
          'caseForCare': 'case-for-care',
          'case_for_care': 'case-for-care',
          'caseForSupport': 'case-for-care',
          'case-for-support': 'case-for-care',
          'case_for_support': 'case-for-care',
          'talkingPoints': 'talking-points',
          'talking_points': 'talking-points',
          'landingPage': 'landing-page',
          'landing_page': 'landing-page',
          'phoneCall': 'phone-call',
          'phone_call': 'phone-call',
          'directMail': 'direct-mail',
          'direct_mail': 'direct-mail',
          'socialMedia': 'social-media',
          'social_media': 'social-media',
          'newsArticle': 'news-article',
          'news_article': 'news-article',
          'digitalAdSearch': 'digital-ad-search',
          'digital_ad_search': 'digital-ad-search',
          'digitalAdSocial': 'digital-ad-social',
          'digital_ad_social': 'digital-ad-social',
        };
        
        for (const [wrongKey, correctKey] of Object.entries(keyMappings)) {
          if (wrongKey in result.channelDrafts && !(correctKey in result.channelDrafts)) {
            console.log(`Normalizing channelDrafts key: ${wrongKey} -> ${correctKey}`);
            result.channelDrafts[correctKey] = result.channelDrafts[wrongKey];
            delete result.channelDrafts[wrongKey];
          }
        }
      }

      // Post-process mapper output so cadence "estimatedTouchpoints" stays within a reasonable range.
      if (
        mode === 'mapper' &&
        typeof context?.estimatedTouchpoints === 'number' &&
        result?.journey?.touchpoints &&
        Array.isArray(result.journey.touchpoints)
      ) {
        const estimated = context.estimatedTouchpoints;
        const tolerance = 0.15;
        const min = Math.max(1, Math.round(estimated * (1 - tolerance)));
        const max = Math.max(min, Math.round(estimated * (1 + tolerance)));

        const generatedCount = result.journey.touchpoints.length;
        console.log(`Mapper touchpoints generated: ${generatedCount}. Estimate ~${estimated} (range ${min}-${max}).`);

        if (generatedCount > max) {
          console.log(`Downsampling touchpoints from ${generatedCount} to ${max} to match estimate range.`);
          result.journey.touchpoints = downsampleTouchpoints(result.journey.touchpoints, max);
        }
      }

      // Brand Adherence Scoring for builder mode
      if (mode === 'builder' && institutionalConfig?.brandSelection && institutionalConfig?.brandPlatform) {
        const bs = institutionalConfig.brandSelection;
        const bp = institutionalConfig.brandPlatform;
        
        // Collect selected brand elements to evaluate
        const selectedElements: { element: string; elementType: string }[] = [];
        
        if (bs.includePromise && bp.brandPromise) {
          selectedElements.push({ element: bp.brandPromise, elementType: 'promise' });
        }
        if (bs.pillars?.length > 0) {
          bs.pillars.forEach((name: string) => {
            const pillar = bp.brandPillars?.find((p: any) => p.name === name);
            if (pillar) {
              selectedElements.push({ element: `${pillar.name}: ${pillar.description}`, elementType: 'pillar' });
            }
          });
        }
        if (bs.proofPoints?.length > 0) {
          bs.proofPoints.forEach((point: string) => {
            selectedElements.push({ element: point, elementType: 'proofPoint' });
          });
        }
        if (bs.commitments?.length > 0) {
          bs.commitments.forEach((commitment: string) => {
            selectedElements.push({ element: commitment, elementType: 'commitment' });
          });
        }
        if (bs.pathways?.length > 0) {
          bs.pathways.forEach((name: string) => {
            const pathway = bp.brandPathways?.find((p: any) => p.name === name);
            if (pathway) {
              selectedElements.push({ element: `${pathway.name}: ${pathway.description}`, elementType: 'pathway' });
            }
          });
        }

        if (selectedElements.length > 0) {
          console.log(`Evaluating brand adherence for ${selectedElements.length} elements...`);
          
          // Serialize generated content for analysis
          const generatedContentSummary = Object.entries(result.channelDrafts || {})
            .map(([channel, content]) => {
              if (typeof content === 'string') return `[${channel.toUpperCase()}]: ${content}`;
              if (content && typeof content === 'object') {
                return `[${channel.toUpperCase()}]: ${JSON.stringify(content)}`;
              }
              return '';
            })
            .filter(Boolean)
            .join('\n\n');

          const brandAdherencePrompt = `Analyze the following generated content for brand adherence.

GENERATED CONTENT:
${generatedContentSummary}

SELECTED BRAND ELEMENTS TO EVALUATE:
${selectedElements.map((e, i) => `${i + 1}. [${e.elementType.toUpperCase()}] ${e.element}`).join('\n')}

For each brand element, determine:
1. Was it incorporated into the content? (true/false)
2. How strongly? (strong = explicit/prominent, moderate = implied/referenced, weak = barely present, absent = not found)
3. Provide a brief quote or reference from the content as evidence (if incorporated)

Then provide an overall brand adherence score (0-100) and summary.

IMPORTANT: Respond ONLY with valid JSON:
{
  "overallScore": <number 0-100>,
  "overallRating": "Excellent|Good|Fair|Needs Improvement",
  "elementScores": [
    {
      "element": "Element text",
      "elementType": "promise|pillar|proofPoint|commitment|pathway",
      "incorporated": true|false,
      "strength": "strong|moderate|weak|absent",
      "evidence": "Quote from content if applicable"
    }
  ],
  "summary": "2-3 sentence summary of brand adherence",
  "suggestions": ["Suggestion for improvement 1", "Suggestion 2"]
}

Scoring guide:
- 90-100: Excellent - All selected elements strongly incorporated
- 70-89: Good - Most elements incorporated, some moderately
- 50-69: Fair - Some elements incorporated, several missing or weak
- 0-49: Needs Improvement - Many elements missing or not reflected`;

          try {
            const brandResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: selectedModel,
                messages: [
                  { role: "system", content: "You are a brand adherence analyst for higher education communications. Evaluate how well generated content reflects the selected brand elements." },
                  { role: "user", content: brandAdherencePrompt },
                ],
              }),
            });

            if (brandResponse.ok) {
              const brandData = await brandResponse.json();
              const brandContent = brandData.choices?.[0]?.message?.content;
              
              if (brandContent) {
                let brandJsonContent = brandContent;
                const brandJsonMatch = brandContent.match(/```(?:json)?\s*([\s\S]*?)```/);
                if (brandJsonMatch) {
                  brandJsonContent = brandJsonMatch[1].trim();
                }
                
                try {
                  const brandAdherence = JSON.parse(brandJsonContent);
                  result.brandAdherence = brandAdherence;
                  console.log(`Brand adherence score: ${brandAdherence.overallScore}%`);
                } catch (brandParseError) {
                  console.error("Failed to parse brand adherence response:", brandParseError);
                }
              }
            } else {
              console.error("Brand adherence API call failed:", brandResponse.status);
            }
          } catch (brandError) {
            console.error("Error during brand adherence evaluation:", brandError);
          }
        }
      }

      console.log("Result parsed successfully");

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON (attempt 1):", parseError);
      console.error("Raw content (first 500 chars):", content?.substring(0, 500));
      
      // Retry once with a fresh request
      console.log("Retrying AI request after parse failure...");
      try {
        const retryResponse = await resilientFetch(
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
                { role: "system", content: SYSTEM_PROMPT + "\n\n" + modePrompt },
                { role: "user", content: userPrompt + "\n\nCRITICAL: You MUST respond with ONLY valid JSON. No markdown, no commentary, no explanation. Just the JSON object." },
              ],
            }),
          },
          { label: "evaluate-message-retry", maxRetries: 1 }
        );

        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          const retryContent = retryData.choices?.[0]?.message?.content;
          if (retryContent) {
            const retryJsonContent = extractJson(retryContent);
            const retryResult = JSON.parse(retryJsonContent);
            console.log("Retry parse succeeded");
            return new Response(JSON.stringify(retryResult), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      } catch (retryError) {
        console.error("Retry also failed:", retryError);
      }

      return new Response(
        JSON.stringify({ error: "Failed to parse results. Please try again." }),
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
