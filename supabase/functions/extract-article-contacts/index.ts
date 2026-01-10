import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractedContact {
  name: string;
  title: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface ExtractionResult {
  contacts: ExtractedContact[];
  brand_launch_date?: string;
  university_name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { markdown, title, url } = await req.json();

    if (!markdown && !title) {
      return new Response(
        JSON.stringify({ success: false, error: 'Article content or title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const content = markdown || title || '';
    const systemPrompt = `You are an expert at extracting contact information from university brand launch and rebrand announcement articles.

Your task is to analyze the article and extract:
1. Names and titles of key people mentioned (especially CMO, VP Marketing, Communications Director, President, Chancellor, or anyone quoted about the brand)
2. Any email addresses mentioned
3. Any phone numbers mentioned
4. The university/college name
5. The brand launch or announcement date if mentioned

Focus on finding decision-makers related to marketing, communications, and brand strategy.

Return your response as a JSON object with this structure:
{
  "contacts": [
    {
      "name": "Person's full name",
      "title": "Their job title",
      "email": "email@example.com (if found)",
      "phone": "phone number (if found)",
      "role": "Their role in the rebrand (e.g., 'quoted', 'led initiative', 'spokesperson')"
    }
  ],
  "brand_launch_date": "Date mentioned (e.g., 'January 2025', 'Fall 2024')",
  "university_name": "Full name of the university/college"
}

If no contacts are found, return an empty contacts array. Only include information you can clearly identify from the text.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Article URL: ${url || 'Unknown'}\n\nArticle Title: ${title || 'Unknown'}\n\nArticle Content:\n${content.substring(0, 15000)}` }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_contacts',
              description: 'Extract contact information from a university brand announcement article',
              parameters: {
                type: 'object',
                properties: {
                  contacts: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', description: 'Full name of the person' },
                        title: { type: 'string', description: 'Job title of the person' },
                        email: { type: 'string', description: 'Email address if found' },
                        phone: { type: 'string', description: 'Phone number if found' },
                        role: { type: 'string', description: 'Their role in the rebrand' }
                      },
                      required: ['name', 'title'],
                      additionalProperties: false
                    }
                  },
                  brand_launch_date: { type: 'string', description: 'Date of brand launch if mentioned' },
                  university_name: { type: 'string', description: 'Name of the university or college' }
                },
                required: ['contacts'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_contacts' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'AI extraction failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));

    // Extract the function call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'extract_contacts') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { contacts: [], brand_launch_date: null, university_name: null }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result: ExtractionResult = JSON.parse(toolCall.function.arguments);
    
    console.log('Extracted contacts:', result);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error extracting contacts:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
