import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extracting text from image using vision AI...');

    // Use Lovable AI with vision to extract text from the image
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please extract and transcribe ALL text content from this image. This appears to be a screenshot or document image. 

Instructions:
- Extract every piece of text you can see, preserving the structure as much as possible
- Include headers, body text, signatures, dates, etc.
- If there are multiple sections, separate them with line breaks
- If the image contains no readable text, respond with exactly: "NO_TEXT_FOUND"
- Do not add any commentary or explanation - just output the extracted text

Extracted text:`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType || 'image/png'};base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vision API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to process image', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    const extractedText = result.choices?.[0]?.message?.content?.trim() || '';

    console.log('Text extraction complete, length:', extractedText.length);

    if (extractedText === 'NO_TEXT_FOUND' || extractedText.length < 10) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          text: '',
          message: 'No readable text found in this image. Please ensure the screenshot contains visible text, or paste the content directly.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        text: extractedText,
        message: 'Text extracted from screenshot successfully.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error extracting text from image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
