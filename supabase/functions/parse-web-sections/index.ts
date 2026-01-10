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

const SYSTEM_PROMPT = `You are an expert content analyzer for web pages. Your task is to analyze markdown content and identify ALL distinct logical sections.

CRITICAL REQUIREMENTS:
1. You MUST identify EVERY distinct section on the page - do not skip or merge sections
2. You MUST return a valid JSON array - no markdown, no explanation, ONLY the JSON
3. Each section should be self-contained with its actual content preserved

For each section, provide:
- type: One of: ${SECTION_TYPES.join(', ')}
- title: A clear, descriptive title for the section
- content: The FULL actual text content of that section (do not summarize)
- isRecommended: true for valuable content (hero, about, mission, programs), false for navigation/footer/contact

Expected output format (ONLY output this JSON, nothing else):
[
  {"type": "hero", "title": "Welcome Section", "content": "Full text here...", "isRecommended": true},
  {"type": "about", "title": "About Us", "content": "Full text here...", "isRecommended": true}
]

Guidelines:
- Break content into 3-15 sections based on semantic meaning
- Look for visual separators, headings, and topic changes to identify section boundaries
- Navigation menus, footers, and contact forms should be separate sections marked isRecommended: false
- Program descriptions, testimonials, and value propositions should each be their own section
- Include ALL content - do not skip any sections`;

// Helper function to extract JSON from various formats
function extractJSON(content: string): any[] | null {
  // Try direct parse first
  try {
    const parsed = JSON.parse(content.trim());
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // Try extracting from markdown code blocks
  const codeBlockPatterns = [
    /```json\s*([\s\S]*?)```/i,
    /```\s*([\s\S]*?)```/,
    /\[\s*\{[\s\S]*\}\s*\]/,
  ];

  for (const pattern of codeBlockPatterns) {
    const match = content.match(pattern);
    if (match) {
      try {
        const jsonStr = match[1] ? match[1].trim() : match[0].trim();
        // Clean control characters
        const cleaned = jsonStr.replace(/[\x00-\x1F\x7F]/g, ' ');
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
  }

  // Try to find JSON array pattern anywhere in the content
  const arrayMatch = content.match(/\[\s*\{[\s\S]*?\}\s*(?:,\s*\{[\s\S]*?\}\s*)*\]/);
  if (arrayMatch) {
    try {
      const cleaned = arrayMatch[0].replace(/[\x00-\x1F\x7F]/g, ' ');
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  return null;
}

// Helper to split markdown into sections based on headings
function fallbackSectionParse(markdown: string): any[] {
  const sections: any[] = [];
  
  // Split by headings (# ## ###)
  const headingPattern = /^(#{1,3})\s+(.+)$/gm;
  const headings: { level: number; title: string; index: number }[] = [];
  let match;
  
  while ((match = headingPattern.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      title: match[2].trim(),
      index: match.index
    });
  }

  if (headings.length === 0) {
    // No headings found, return as single section
    return [{
      type: 'general',
      title: 'Page Content',
      content: markdown.trim(),
      isRecommended: true
    }];
  }

  // Extract content between headings
  for (let i = 0; i < headings.length; i++) {
    const start = headings[i].index;
    const end = i < headings.length - 1 ? headings[i + 1].index : markdown.length;
    const content = markdown.slice(start, end).trim();
    
    // Determine section type based on title
    const title = headings[i].title.toLowerCase();
    let type = 'general';
    let isRecommended = true;
    
    if (title.includes('nav') || title.includes('menu')) {
      type = 'navigation';
      isRecommended = false;
    } else if (title.includes('footer') || title.includes('copyright')) {
      type = 'footer';
      isRecommended = false;
    } else if (title.includes('contact') || title.includes('reach')) {
      type = 'contact';
      isRecommended = false;
    } else if (title.includes('about') || title.includes('who we are')) {
      type = 'about';
    } else if (title.includes('mission') || title.includes('vision')) {
      type = 'mission';
    } else if (title.includes('program') || title.includes('degree') || title.includes('major')) {
      type = 'program-description';
    } else if (title.includes('testimon') || title.includes('student') || title.includes('alumni')) {
      type = 'testimonial';
    } else if (title.includes('stat') || title.includes('number') || title.includes('fact')) {
      type = 'statistics';
    } else if (title.includes('welcome') || title.includes('hero') || i === 0) {
      type = 'hero';
    }
    
    sections.push({
      type,
      title: headings[i].title,
      content,
      isRecommended
    });
  }

  return sections;
}

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

    // Truncate very long content but keep more for better parsing
    const maxLength = 25000;
    const truncatedMarkdown = markdown.length > maxLength 
      ? markdown.slice(0, maxLength) + '\n\n[Content truncated...]'
      : markdown;

    const contentLength = truncatedMarkdown.length;
    console.log(`Processing content: ${contentLength} characters from ${url || 'unknown URL'}`);

    const userPrompt = `Analyze this web page and extract ALL distinct sections. Return ONLY a JSON array, no other text.

Source URL: ${url || 'Unknown'}

Content to analyze:
${truncatedMarkdown}

Remember: Output ONLY the JSON array, no markdown formatting, no explanation.`;

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
        max_tokens: 8000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      
      // Use fallback parsing if AI fails
      console.log('Using fallback markdown parsing...');
      const fallbackSections = fallbackSectionParse(truncatedMarkdown);
      const validatedSections = fallbackSections.map((section: any, index: number) => ({
        id: `section-${index}`,
        type: SECTION_TYPES.includes(section.type) ? section.type : 'general',
        title: section.title || `Section ${index + 1}`,
        content: section.content || '',
        wordCount: (section.content || '').split(/\s+/).filter(Boolean).length,
        isRecommended: section.isRecommended !== false
      }));
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          sections: validatedSections,
          totalSections: validatedSections.length,
          recommendedCount: validatedSections.filter((s: any) => s.isRecommended).length,
          parseMethod: 'fallback'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    console.log('AI response received, parsing sections...');
    console.log('Response length:', content.length);

    // Try to extract JSON using multiple methods
    let sections = extractJSON(content);

    if (!sections || sections.length === 0) {
      console.warn('JSON extraction failed, using fallback parsing');
      sections = fallbackSectionParse(truncatedMarkdown);
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

    // Filter out empty sections
    const nonEmptySections = validatedSections.filter((s: any) => s.content.trim().length > 0);

    console.log(`Parsed ${nonEmptySections.length} non-empty sections`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sections: nonEmptySections,
        totalSections: nonEmptySections.length,
        recommendedCount: nonEmptySections.filter((s: any) => s.isRecommended).length,
        parseMethod: 'ai'
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