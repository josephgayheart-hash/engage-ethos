import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { resilientFetch, corsHeaders, handleGatewayErrorResponse } from "../_shared/resilience.ts";

interface OutreachRequest {
  contact_name: string;
  contact_title: string;
  university_name: string;
  brand_launch_date?: string;
  source_article_title?: string;
  message_type: 'linkedin_dm' | 'email' | 'cold_email';
}

interface OutreachResult {
  subject?: string;
  body: string;
  call_to_action: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      contact_name, 
      contact_title, 
      university_name, 
      brand_launch_date,
      source_article_title,
      message_type 
    }: OutreachRequest = await req.json();

    if (!contact_name || !university_name || !message_type) {
      return new Response(
        JSON.stringify({ success: false, error: 'Contact name, university name, and message type are required' }),
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

    const isLinkedIn = message_type === 'linkedin_dm';
    const firstName = contact_name.split(' ')[0];

    const systemPrompt = `You are a representative of CampusVoice.ai, writing personalized outreach messages to higher education marketing leaders.

About CampusVoice.ai:
- AI-powered brand voice platform specifically for higher education
- Helps institutions maintain brand consistency across all communications
- Especially valuable after a rebrand when teams need to adopt new brand voice
- Features: AI message generation with brand DNA, voice evaluation, style guide enforcement
- Used by universities to ensure every email, social post, and web page reflects the brand

Your writing style:
- Conversational and genuine, not salesy
- Demonstrate knowledge of their specific situation (their rebrand, role)
- Focus on the challenge of brand adoption across large organizations
- Keep it brief and respectful of their time
- One clear call to action

${isLinkedIn ? 
  'LinkedIn DM Guidelines:\n- Very brief (under 100 words)\n- No subject line needed\n- Casual but professional\n- Quick hook referencing their rebrand' 
  : 
  'Email Guidelines:\n- Subject line that references their rebrand\n- 150-200 words max\n- Professional but warm\n- Clear value proposition for post-rebrand challenges'
}`;

    const userPrompt = `Write a ${isLinkedIn ? 'LinkedIn connection message' : 'cold outreach email'} to:

Contact: ${contact_name}
Title: ${contact_title || 'Marketing Leader'}
University: ${university_name}
${brand_launch_date ? `Brand Launch Date: ${brand_launch_date}` : ''}
${source_article_title ? `I found them via: "${source_article_title}"` : ''}

The message should congratulate them on their rebrand and offer to show how CampusVoice.ai helps teams adopt and maintain brand voice consistency.`;

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
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_outreach',
              description: 'Generate a personalized outreach message',
              parameters: {
                type: 'object',
                properties: {
                  subject: { 
                    type: 'string', 
                    description: 'Email subject line (omit for LinkedIn DM)' 
                  },
                  body: { 
                    type: 'string', 
                    description: 'The main message body' 
                  },
                  call_to_action: { 
                    type: 'string', 
                    description: 'The specific ask or next step' 
                  }
                },
                required: ['body', 'call_to_action'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_outreach' } }
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
        JSON.stringify({ success: false, error: 'AI generation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'generate_outreach') {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate message' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result: OutreachResult = JSON.parse(toolCall.function.arguments);
    
    console.log('Generated outreach:', result);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating outreach:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
