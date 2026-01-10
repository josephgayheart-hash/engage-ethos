import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      mode, 
      content, 
      sections, 
      sectionContent, 
      sectionTitle, 
      issues, 
      sourceUrl, 
      voiceAnalysis, 
      brandPlatform, 
      profileConfig,
      facts,
      stories
    } = body;

    console.log('analyze-web-content called with mode:', mode || 'analyze');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Handle rewrite modes
    if (mode === 'rewrite') {
      return await handleRewriteAll(sections, voiceAnalysis, brandPlatform, facts, stories, LOVABLE_API_KEY);
    }

    if (mode === 'rewrite-section') {
      return await handleRewriteSection(sectionContent, sectionTitle, issues, voiceAnalysis, brandPlatform, facts, stories, LOVABLE_API_KEY);
    }

    // Default: analyze mode
    return await handleAnalyze(content, sourceUrl, voiceAnalysis, brandPlatform, profileConfig, facts, stories, LOVABLE_API_KEY);

  } catch (error: unknown) {
    console.error('Error in analyze-web-content:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function callLovableAI(messages: { role: string; content: string }[], apiKey: string) {
  const response = await fetch(LOVABLE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Lovable AI error:', response.status, errorData);
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (response.status === 402) {
      throw new Error('AI usage limit reached. Please add credits.');
    }
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No response from AI');
  }

  return content;
}

function extractJSON(text: string): any {
  // Try to extract JSON from the response (may be wrapped in markdown code blocks)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = jsonMatch ? jsonMatch[1].trim() : text.trim();
  return JSON.parse(jsonText);
}

// Format facts for AI context
function formatFactsContext(facts: any[]): string {
  if (!facts || facts.length === 0) return 'No institutional facts available.';
  
  const grouped = facts.reduce((acc: any, fact: any) => {
    const cat = fact.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(`${fact.label}: ${fact.value}${fact.context ? ` (${fact.context})` : ''}`);
    return acc;
  }, {});
  
  return Object.entries(grouped)
    .map(([category, items]) => `**${category.charAt(0).toUpperCase() + category.slice(1)}:**\n${(items as string[]).join('\n')}`)
    .join('\n\n');
}

// Format stories for AI context
function formatStoriesContext(stories: any[]): string {
  if (!stories || stories.length === 0) return 'No institutional stories available.';
  
  return stories.slice(0, 10).map((story: any) => {
    return `**${story.title}** (${story.story_type}):
${story.pull_quote ? `"${story.pull_quote}"` : ''}
Themes: ${story.themes?.join(', ') || 'None'}
Subject: ${story.subject_name || 'Anonymous'}${story.subject_role ? `, ${story.subject_role}` : ''}`;
  }).join('\n\n');
}

async function handleAnalyze(
  content: string, 
  sourceUrl: string | undefined,
  voiceAnalysis: any,
  brandPlatform: any,
  profileConfig: any,
  facts: any[] | undefined,
  stories: any[] | undefined,
  apiKey: string
) {
  // Truncate content for analysis
  const maxChars = 15000;
  const truncatedContent = content.length > maxChars 
    ? content.slice(0, maxChars) + '\n\n[Content truncated for analysis...]'
    : content;

  const factsContext = formatFactsContext(facts || []);
  const storiesContext = formatStoriesContext(stories || []);
  
  // Extract key voice elements
  const voiceElements = {
    primaryTone: voiceAnalysis?.overallTone || voiceAnalysis?.primaryTone || 'professional',
    secondaryTones: voiceAnalysis?.secondaryTones || [],
    keyPhrases: voiceAnalysis?.keyPhrases || voiceAnalysis?.phrases_to_use || [],
    avoidPhrases: voiceAnalysis?.phrasesToAvoid || voiceAnalysis?.phrases_to_avoid || [],
    vocabularyLevel: voiceAnalysis?.vocabularyLevel || 'accessible',
    characteristics: voiceAnalysis?.characteristics || []
  };

  // Extract brand platform elements
  const brandElements = {
    promise: brandPlatform?.brandPromise || '',
    pillars: brandPlatform?.pillars || [],
    position: brandPlatform?.positioningStatement || '',
    values: brandPlatform?.coreValues || []
  };

  // Extract institution name for critical red flag detection
  const institutionName = profileConfig?.institutionName || 
    profileConfig?.name || 
    brandPlatform?.institutionName || 
    '';
  
  const systemPrompt = `You are an expert brand content analyst for higher education institutions. You perform DEEP, SPECIFIC analysis of web content against institutional Content DNA.

## CRITICAL RED FLAG DETECTION - CHECK FIRST!
Before ANY other analysis, you MUST check for these DISQUALIFYING red flags:

### INSTITUTION NAME MISMATCH (CRITICAL - Score cap: 25 max)
The content is being evaluated for: "${institutionName}"

You MUST scan for ANY reference to different institutions:
- Different university names (e.g., if analyzing for "Ohio State", any mention of "Kentucky", "Michigan", "Penn State", etc.)
- Different college names within universities
- Competitor institution names, mottos, mascots, or athletics references
- Different location references that don't match the target institution

If the content mentions ANY institution name OTHER than "${institutionName}" (or variations thereof):
- This is a CRITICAL FAILURE
- Overall score MUST be capped at 25 maximum
- Add a critical issue: "INSTITUTION MISMATCH: Content references [found institution] but should represent [target institution]"
- Flag with severity: "error" and type: "Institution Mismatch"

### OTHER RED FLAGS (Score penalty: -20 points each)
- Competitor slogans or taglines
- Wrong mascot or team names
- Wrong city/state references
- Wrong institutional statistics (enrollment, rankings, founding date from another school)

Your analysis must be SPECIFIC and ACTIONABLE, not generic. You should:
1. Quote exact phrases from the content that are problematic or exemplary
2. Reference specific facts, stories, or voice elements when evaluating alignment
3. Provide concrete recommendations with examples of improved text

## VOICE ANALYSIS TO MATCH:
Primary Tone: ${voiceElements.primaryTone}
Secondary Tones: ${voiceElements.secondaryTones.join(', ') || 'None specified'}
Vocabulary Level: ${voiceElements.vocabularyLevel}
Key Characteristics: ${voiceElements.characteristics.join(', ') || 'None specified'}

Key Phrases TO USE:
${voiceElements.keyPhrases.slice(0, 15).map((p: string) => `• "${p}"`).join('\n') || '• None specified'}

Phrases TO AVOID:
${voiceElements.avoidPhrases.slice(0, 15).map((p: string) => `• "${p}"`).join('\n') || '• None specified'}

## BRAND PLATFORM:
Brand Promise: ${brandElements.promise || 'Not defined'}
Positioning: ${brandElements.position || 'Not defined'}
Core Values: ${brandElements.values.join(', ') || 'Not defined'}
Brand Pillars:
${brandElements.pillars.map((p: any) => `• ${p.name}: ${p.description || ''}`).join('\n') || '• None defined'}

## INSTITUTIONAL FACTS (for accuracy checking):
${factsContext}

## INSTITUTIONAL STORIES (for narrative alignment):
${storiesContext}

## INSTITUTIONAL CONTEXT:
Institution Name: ${institutionName}
${JSON.stringify(profileConfig || {}, null, 2)}

## ISSUE CATEGORIES (in priority order):
1. **Institution Mismatch** - CRITICAL: Content references a different university/college (automatic score cap at 25)
2. **Competitor Reference** - References to competing institutions, mascots, or slogans
3. **Voice Mismatch** - Tone doesn't match brand (cite the specific words/phrases)
4. **Off-Brand Language** - Uses phrases to avoid (quote them)
5. **Missing Brand Elements** - Could incorporate brand pillars, values, or key phrases
6. **Factual Opportunity** - Could include specific institutional facts
7. **Story Integration** - Could reference institutional stories/testimonials
8. **Generic Messaging** - Content is bland/unmemorable (suggest specific improvements)
9. **Consistency Issue** - Contradicts other brand messaging
10. **Audience Mismatch** - Wrong tone for target audience
11. **Clarity Issue** - Confusing or overly complex language
12. **CTA Weakness** - Call-to-action could be stronger/more brand-aligned

## STRENGTH CATEGORIES:
1. **Strong Voice Alignment** - Matches brand tone perfectly (cite examples)
2. **Effective Brand Language** - Uses key phrases well
3. **Fact Integration** - Incorporates institutional data effectively
4. **Story Connection** - References institutional narratives
5. **Compelling Value Prop** - Clear, differentiated messaging
6. **Audience Targeting** - Speaks directly to target audience
7. **Emotional Resonance** - Creates connection with reader`;

  const userPrompt = `FIRST: Scan this content for any institution names that don't match "${institutionName}". If found, this is a CRITICAL failure and score must be capped at 25.

Analyze this web content for brand alignment. Be SPECIFIC - quote exact phrases and reference exact DNA elements.

${sourceUrl ? `Source URL: ${sourceUrl}\n\n` : ''}CONTENT TO ANALYZE:
${truncatedContent}

Provide a detailed JSON response:
{
  "overallScore": <0-100, BUT cap at 25 if institution mismatch detected>,
  "institutionMismatchDetected": <true/false>,
  "wrongInstitutionFound": "<name of wrong institution if detected, or null>",
  "executiveSummary": "<2-3 sentence summary - MUST mention institution mismatch first if detected>",
  "dnaAlignment": {
    "voiceScore": <0-100>,
    "voiceFeedback": "<specific feedback on voice/tone alignment with quoted examples>",
    "factScore": <0-100>,
    "factFeedback": "<specific feedback on use of institutional facts>",
    "storyScore": <0-100>,
    "storyFeedback": "<specific feedback on narrative/story alignment>",
    "brandScore": <0-100>,
    "brandFeedback": "<specific feedback on brand platform alignment>"
  },
  "sections": [
    {
      "id": "<unique-id>",
      "title": "<section title or first few words>",
      "content": "<the section text>",
      "score": <0-100, cap at 25 if contains wrong institution>,
      "issues": [
        {
          "type": "<issue category from list above>",
          "severity": "error|warning|info",
          "message": "<specific issue with quoted text>",
          "quotedText": "<exact problematic phrase from content>",
          "recommendation": "<specific fix with example replacement text>",
          "dnaReference": "<which DNA element this relates to, e.g., 'Key phrase: Transform your future'>"
        }
      ],
      "strengths": [
        {
          "type": "<strength category from list above>",
          "message": "<specific strength with quoted text>",
          "quotedText": "<exact exemplary phrase from content>",
          "dnaReference": "<which DNA element this aligns with>"
        }
      ]
    }
  ],
  "summary": {
    "totalIssues": <number>,
    "totalStrengths": <number>,
    "criticalRedFlags": ["<INSTITUTION MISMATCH or other critical issues>"],
    "criticalIssues": ["<most important issues to fix first>"],
    "quickWins": ["<easy improvements that would boost score>"],
    "missingFacts": ["<specific institutional facts that could be added>"],
    "storyOpportunities": ["<ways to incorporate institutional stories>"]
  },
  "brandVoiceCheck": {
    "phrasesUsedCorrectly": ["<key phrases found in content>"],
    "phrasesAvoidedIncorrectly": ["<avoided phrases found in content>"],
    "missingKeyPhrases": ["<key phrases that should be added>"]
  }
}

REMEMBER: If you detect ANY institution name other than "${institutionName}", the overallScore MUST be 25 or lower, and institutionMismatchDetected MUST be true.

Return ONLY valid JSON. Be thorough and specific in your analysis.`;

  const responseText = await callLovableAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], apiKey);

  const analysis = extractJSON(responseText);
  console.log('Analysis complete, sections:', analysis.sections?.length, 'overall score:', analysis.overallScore);

  return new Response(
    JSON.stringify(analysis),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleRewriteAll(
  sections: any[],
  voiceAnalysis: any,
  brandPlatform: any,
  facts: any[] | undefined,
  stories: any[] | undefined,
  apiKey: string
) {
  const factsContext = formatFactsContext(facts || []);
  const storiesContext = formatStoriesContext(stories || []);

  const systemPrompt = `You are a brand content writer specializing in higher education communications.
Your task is to rewrite content to better align with the university's brand voice and guidelines.

VOICE ANALYSIS TO MATCH:
${JSON.stringify(voiceAnalysis || {}, null, 2)}

BRAND PLATFORM ELEMENTS:
${JSON.stringify(brandPlatform || {}, null, 2)}

INSTITUTIONAL FACTS TO INCORPORATE:
${factsContext}

INSTITUTIONAL STORIES TO REFERENCE:
${storiesContext}

GUIDELINES:
- Maintain the core message and meaning
- Apply the brand's tone and voice consistently
- Use key phrases and brand language where appropriate
- Incorporate relevant institutional facts when they strengthen the message
- Reference stories/testimonials when appropriate
- Make content more engaging and distinctive
- Keep the same approximate length
- Be specific about what you changed and why`;

  const sectionsToRewrite = sections.slice(0, 5);
  
  const userPrompt = `Rewrite these content sections to better align with the brand voice and incorporate DNA elements:

${sectionsToRewrite.map((s, i) => `Section ${i + 1} (${s.title}):
Issues: ${s.issues?.map((is: any) => is.message).join('; ') || 'None identified'}
Original content:
${s.content.slice(0, 800)}
`).join('\n---\n')}

Return a JSON response:
{
  "rewrittenSections": [
    {
      "id": "<section id>",
      "original": "<original content>",
      "rewritten": "<improved brand-aligned content>",
      "improvements": ["<specific change made and why>"],
      "factsAdded": ["<any facts incorporated>"],
      "phrasesUsed": ["<brand phrases incorporated>"],
      "scoreImprovement": "<estimated score improvement>"
    }
  ]
}

Return ONLY the JSON.`;

  const responseText = await callLovableAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], apiKey);

  const result = extractJSON(responseText);
  
  result.rewrittenSections = result.rewrittenSections?.map((r: any, i: number) => ({
    ...r,
    id: sectionsToRewrite[i]?.id || `section-${i}`
  })) || [];

  console.log('Rewrite complete, sections:', result.rewrittenSections?.length);

  return new Response(
    JSON.stringify(result),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleRewriteSection(
  sectionContent: string,
  sectionTitle: string,
  issues: any[],
  voiceAnalysis: any,
  brandPlatform: any,
  facts: any[] | undefined,
  stories: any[] | undefined,
  apiKey: string
) {
  const factsContext = formatFactsContext(facts || []);
  const storiesContext = formatStoriesContext(stories || []);

  const systemPrompt = `You are a brand content writer specializing in higher education communications.
Your task is to rewrite a single content section to better align with the university's brand voice.

VOICE ANALYSIS TO MATCH:
${JSON.stringify(voiceAnalysis || {}, null, 2)}

BRAND PLATFORM ELEMENTS:
${JSON.stringify(brandPlatform || {}, null, 2)}

INSTITUTIONAL FACTS AVAILABLE:
${factsContext}

INSTITUTIONAL STORIES AVAILABLE:
${storiesContext}

GUIDELINES:
- Fix all identified issues specifically
- Apply the brand's tone and voice
- Use key phrases and brand language where appropriate
- Incorporate relevant facts if they strengthen the message
- Make content more engaging and distinctive
- Keep the same approximate length`;

  const userPrompt = `Rewrite this section (${sectionTitle}) to align with the brand voice:

Issues to fix: 
${issues?.map((is: any) => `• ${is.type}: ${is.message}${is.recommendation ? ` → ${is.recommendation}` : ''}`).join('\n') || 'General brand alignment needed'}

Original content:
${sectionContent}

Return a JSON response:
{
  "rewrittenSection": {
    "original": "<original content>",
    "rewritten": "<improved brand-aligned content>",
    "improvements": ["<specific change made and why>"],
    "issuesFixed": ["<which issues were addressed>"],
    "factsAdded": ["<any facts incorporated>"],
    "phrasesUsed": ["<brand phrases incorporated>"]
  }
}

Return ONLY the JSON.`;

  const responseText = await callLovableAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], apiKey);

  const result = extractJSON(responseText);
  console.log('Section rewrite complete');

  return new Response(
    JSON.stringify(result),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
