import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SECTION_TYPES = [
  'hero',
  'about',
  'mission',
  'value-proposition',
  'statistics',
  'testimonial',
  'feature-list',
  'program-description',
  'call-to-action',
  'contact',
  'navigation',
  'footer',
  'general'
] as const;

const SYSTEM_PROMPT = `You are an expert content analyzer. Given markdown content from a web page, you must identify and extract distinct logical sections.

For each section, provide:
1. A section type from: ${SECTION_TYPES.join(', ')}
2. A title summarizing the section
3. The actual content text
4. Whether this section is typically useful for brand voice analysis (skip navigation, footers, contact info)

Return your response as a valid JSON array with this structure:
[
  {
    "type": "hero",
    "title": "Main Hero Section",
    "content": "The actual text content...",
    "isRecommended": true
  }
]

Guidelines:
- Break content into logical sections based on semantic meaning
- Each section should be self-contained and meaningful
- Keep content intact - don't summarize or modify
- Mark navigation, footers, and contact sections as isRecommended: false
- Mark hero, about, mission, value-proposition, and testimonial as isRecommended: true
- Aim for 3-10 sections depending on content length
- If content is very short, return fewer sections`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { markdown, url } = await req.json();

    if (!markdown || typeof markdown !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Markdown content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Truncate very long content
    const maxLength = 15000;
    const truncatedMarkdown = markdown.length > maxLength 
      ? markdown.slice(0, maxLength) + '\n\n[Content truncated...]'
      : markdown;

    const userPrompt = `Analyze this web page content and extract distinct sections:\n\n---\nSource URL: ${url || 'Unknown'}\n---\n\n${truncatedMarkdown}`;

    console.log('Calling Lovable AI for section parsing...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    console.log('AI response received, parsing sections...');

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    // Clean up control characters
    jsonStr = jsonStr.replace(/[\x00-\x1F\x7F]/g, ' ');

    let sections;
    try {
      sections = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback: return whole content as single section
      sections = [{
        type: 'general',
        title: 'Page Content',
        content: truncatedMarkdown,
        isRecommended: true
      }];
    }

    // Validate and normalize sections
    const validatedSections = sections.map((section: any, index: number) => ({
      id: `section-${index}`,
      type: SECTION_TYPES.includes(section.type) ? section.type : 'general',
      title: section.title || `Section ${index + 1}`,
      content: section.content || '',
      wordCount: (section.content || '').split(/\s+/).filter(Boolean).length,
      isRecommended: section.isRecommended !== false
    }));

    console.log(`Parsed ${validatedSections.length} sections`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sections: validatedSections,
        totalSections: validatedSections.length,
        recommendedCount: validatedSections.filter((s: any) => s.isRecommended).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in parse-web-sections:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
