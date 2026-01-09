import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

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

    const systemPrompt = `You are an expert at extracting structured story data from unstructured text about people in higher education contexts.

Given a story or profile about a person (student, alumni, donor, faculty, staff, or community member), extract the following information:

1. **title**: A compelling title for the story (create one if not obvious)
2. **story_type**: One of: student, alumni, donor, faculty, staff, community
3. **narrative**: The main story content, cleaned up and formatted for readability
4. **pull_quote**: A memorable, impactful quote from the story (if available, otherwise create one from the most compelling part)
5. **subject_name**: The person's name
6. **subject_role**: Their role/position (e.g., "Class of 2024", "CEO of TechCorp", "Professor of Biology")
7. **themes**: Array of 2-5 relevant themes (e.g., first-generation, scholarship, research, career-success, community-service, leadership, innovation, mentorship)

Return ONLY valid JSON with these exact fields. Do not include any other text or explanation.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Parse this story:\n\n${text.substring(0, 8000)}` }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let parsed;
    try {
      // Try to extract JSON from the response (in case there's extra text)
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

    // Normalize story_type
    const validTypes = ['student', 'alumni', 'donor', 'faculty', 'staff', 'community'];
    if (!validTypes.includes(parsed.story_type)) {
      parsed.story_type = 'community';
    }

    // Ensure themes is an array
    if (!Array.isArray(parsed.themes)) {
      parsed.themes = [];
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
