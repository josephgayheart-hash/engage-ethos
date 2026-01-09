import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { mode, content, sections, sectionContent, sectionTitle, issues, sourceUrl, voiceAnalysis, brandPlatform, profileConfig } = body;

    console.log('analyze-web-content called with mode:', mode || 'analyze');

    // Handle rewrite modes
    if (mode === 'rewrite') {
      return await handleRewriteAll(sections, voiceAnalysis, brandPlatform);
    }

    if (mode === 'rewrite-section') {
      return await handleRewriteSection(sectionContent, sectionTitle, issues, voiceAnalysis, brandPlatform);
    }

    // Default: analyze mode
    return await handleAnalyze(content, sourceUrl, voiceAnalysis, brandPlatform, profileConfig);

  } catch (error: unknown) {
    console.error('Error in analyze-web-content:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleAnalyze(
  content: string, 
  sourceUrl: string | undefined,
  voiceAnalysis: any,
  brandPlatform: any,
  profileConfig: any
) {
  // Truncate content for analysis
  const maxChars = 12000;
  const truncatedContent = content.length > maxChars 
    ? content.slice(0, maxChars) + '\n\n[Content truncated for analysis...]'
    : content;

  const systemPrompt = `You are a brand content analyst specializing in higher education communications.
You analyze web content against a university's Content DNA (voice analysis) and brand platform.

Your task:
1. Parse the content into logical sections (paragraphs, headings, or thematic blocks)
2. Score each section (0-100) based on brand alignment
3. Identify specific issues and strengths for each section

Voice Analysis to check against:
${JSON.stringify(voiceAnalysis || {}, null, 2)}

Brand Platform elements:
${JSON.stringify(brandPlatform || {}, null, 2)}

Institutional context:
${JSON.stringify(profileConfig || {}, null, 2)}

Issue types to look for:
- "Tone Mismatch" - Voice doesn't match the brand tone
- "Prohibited Language" - Uses words/phrases to avoid
- "Missing Brand Elements" - Could incorporate brand pillars or messaging
- "Jargon Overload" - Too technical or unclear
- "Passive Voice" - Could be more direct and engaging
- "Generic Messaging" - Not distinctive or memorable
- "Accessibility" - Complex sentences or unclear structure

Strength types to identify:
- Strong brand voice alignment
- Effective use of key phrases
- Clear and engaging tone
- Good storytelling elements
- Proper audience targeting`;

  const userPrompt = `Analyze this content for brand alignment:

${sourceUrl ? `Source URL: ${sourceUrl}\n\n` : ''}${truncatedContent}

Return a JSON response with this exact structure:
{
  "overallScore": <number 0-100>,
  "sections": [
    {
      "id": "<unique-id>",
      "title": "<section title or first few words>",
      "content": "<the section text>",
      "score": <number 0-100>,
      "issues": [
        {"type": "<issue type>", "message": "<specific issue description>", "severity": "error|warning|info"}
      ],
      "strengths": ["<strength description>"]
    }
  ],
  "summary": {
    "totalIssues": <number>,
    "totalStrengths": <number>,
    "topIssues": ["<most important issue descriptions>"],
    "topStrengths": ["<most notable strength descriptions>"]
  }
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const analysisText = data.choices[0]?.message?.content;

  if (!analysisText) {
    throw new Error('No response from AI');
  }

  const analysis = JSON.parse(analysisText);
  console.log('Analysis complete, sections:', analysis.sections?.length);

  return new Response(
    JSON.stringify(analysis),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleRewriteAll(
  sections: any[],
  voiceAnalysis: any,
  brandPlatform: any
) {
  const systemPrompt = `You are a brand content writer specializing in higher education communications.
Your task is to rewrite content to better align with the university's brand voice and guidelines.

Voice Analysis to match:
${JSON.stringify(voiceAnalysis || {}, null, 2)}

Brand Platform elements to incorporate:
${JSON.stringify(brandPlatform || {}, null, 2)}

Guidelines:
- Maintain the core message and meaning
- Apply the brand's tone and voice
- Use key phrases and brand language where appropriate
- Make content more engaging and distinctive
- Keep the same approximate length`;

  const sectionsToRewrite = sections.slice(0, 5); // Limit to 5 sections
  
  const userPrompt = `Rewrite these content sections to better align with the brand voice:

${sectionsToRewrite.map((s, i) => `Section ${i + 1} (${s.title}):
Issues: ${s.issues?.map((is: any) => is.message).join(', ') || 'None identified'}
Original content:
${s.content.slice(0, 500)}
`).join('\n---\n')}

Return a JSON response with this structure:
{
  "rewrittenSections": [
    {
      "id": "<section id from input>",
      "original": "<original content>",
      "rewritten": "<improved brand-aligned content>",
      "improvements": ["<what was improved>"]
    }
  ]
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const rewriteText = data.choices[0]?.message?.content;

  if (!rewriteText) {
    throw new Error('No response from AI');
  }

  const result = JSON.parse(rewriteText);
  
  // Map section IDs back
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
  brandPlatform: any
) {
  const systemPrompt = `You are a brand content writer specializing in higher education communications.
Your task is to rewrite a single content section to better align with the university's brand voice.

Voice Analysis to match:
${JSON.stringify(voiceAnalysis || {}, null, 2)}

Brand Platform elements to incorporate:
${JSON.stringify(brandPlatform || {}, null, 2)}

Guidelines:
- Fix the identified issues
- Apply the brand's tone and voice
- Use key phrases and brand language where appropriate
- Make content more engaging and distinctive
- Keep the same approximate length`;

  const userPrompt = `Rewrite this section (${sectionTitle}) to align with the brand voice:

Issues to fix: ${issues?.map((is: any) => is.message).join(', ') || 'General brand alignment needed'}

Original content:
${sectionContent}

Return a JSON response with this structure:
{
  "rewrittenSection": {
    "original": "<original content>",
    "rewritten": "<improved brand-aligned content>",
    "improvements": ["<what was improved>"]
  }
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const rewriteText = data.choices[0]?.message?.content;

  if (!rewriteText) {
    throw new Error('No response from AI');
  }

  const result = JSON.parse(rewriteText);
  console.log('Section rewrite complete');

  return new Response(
    JSON.stringify(result),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
