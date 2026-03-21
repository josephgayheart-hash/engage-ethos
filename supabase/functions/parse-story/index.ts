import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { resilientFetch, corsHeaders, handleGatewayErrorResponse } from "../_shared/resilience.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceUrl, sourceTitle, industryContext, contentStyle, storyTypes } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build industry-aware story type list
    const defaultTypes = ['student', 'alumni', 'donor', 'faculty', 'staff', 'community'];
    const validTypes: string[] = Array.isArray(storyTypes) && storyTypes.length > 0
      ? storyTypes.map((t: any) => typeof t === 'string' ? t : t.id).filter(Boolean)
      : defaultTypes;

    const industryLabel = industryContext || 'higher education';
    const styleLabel = contentStyle || 'institutional communications';

    const systemPrompt = `You are an expert at extracting structured story data from unstructured text in the context of ${industryLabel} ${styleLabel}.

Given a story or profile about a person, extract the following information:

1. **title**: A compelling title for the story (create one if not obvious)
2. **story_type**: One of: ${validTypes.join(', ')}
3. **narrative**: The main story content, cleaned up and formatted for readability
4. **pull_quote**: A memorable, impactful quote from the story (if available, otherwise create one from the most compelling part)
5. **subject_name**: The person's name
6. **subject_role**: Their role/position
7. **themes**: Array of 2-5 relevant themes (e.g., leadership, innovation, impact, growth, community, mentorship, transformation)

Return ONLY valid JSON with these exact fields. Do not include any other text or explanation.`;

    console.log('Parsing story, text length:', text.length, 'sourceUrl:', sourceUrl || 'none', 'industry:', industryLabel);

    const response = await resilientFetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Parse this story:\n\n${text.substring(0, 12000)}` }
          ],
        }),
      },
      { label: 'parse-story', maxRetries: 2 }
    );

    if (!response.ok) {
      return await handleGatewayErrorResponse(response, "parse-story");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in response, full response:', JSON.stringify(data));
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse story structure from AI response');
    }

    // Validate required fields
    if (!parsed.title || !parsed.story_type || !parsed.narrative) {
      throw new Error('Missing required fields in parsed story');
    }

    // Normalize story_type — fall back to last valid type if unrecognized
    if (!validTypes.includes(parsed.story_type)) {
      parsed.story_type = validTypes[validTypes.length - 1] || 'community';
    }

    // Ensure themes is an array
    if (!Array.isArray(parsed.themes)) {
      parsed.themes = [];
    }

    // Add source info if provided
    if (sourceUrl) {
      parsed.source_url = sourceUrl;
    }
    if (sourceTitle) {
      parsed.source_description = sourceTitle;
    }

    console.log('Successfully parsed story:', parsed.title);

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in parse-story function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
