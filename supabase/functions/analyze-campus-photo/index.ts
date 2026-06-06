import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { requireAuth } from "../_shared/requireAuth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }


  const __auth = await requireAuth(req, corsHeaders);
  if ('error' in __auth) return __auth.error;

  try {
    const { photoIds } = await req.json();

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'photoIds array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch photo records
    const { data: photos, error: fetchError } = await supabase
      .from('campus_photo_samples')
      .select('id, file_url, photo_category, description')
      .in('id', photoIds);

    if (fetchError) throw fetchError;
    if (!photos || photos.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No photos found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: Record<string, any> = {};

    for (const photo of photos) {
      try {
        console.log(`Analyzing photo ${photo.id}: ${photo.file_url}`);

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
                    text: `Analyze this campus photograph for an image generation reference library. Return a JSON object with these fields:

{
  "photo_category": "architecture" | "campus-life" | "landscape" | "athletics" | "traditions" | "aerial",
  "scene_type": "outdoor" | "indoor" | "aerial" | "detail",
  "primary_subjects": ["list of main subjects/elements"],
  "architectural_style": "description of architecture if visible",
  "lighting": "natural/artificial, time of day, quality",
  "mood": "1-2 word mood descriptor",
  "dominant_colors": ["top 3-4 hex colors"],
  "season": "spring" | "summer" | "fall" | "winter" | "unknown",
  "people_present": true | false,
  "landscape_features": ["trees", "paths", "water", etc.],
  "best_for": ["list of 2-3 image generation use cases this photo would help with, e.g. 'campus beauty shots', 'student life scenes', 'building exteriors'"],
  "quality_score": 1-5,
  "quality_notes": "brief note on photo quality and usefulness for reference"
}

Pick the single best photo_category based on what you see. Return ONLY the JSON, no extra text.`
                  },
                  {
                    type: 'image_url',
                    image_url: { url: photo.file_url }
                  }
                ]
              }
            ],
            max_tokens: 1000,
          }),
        });

        if (!response.ok) {
          console.error(`Vision API error for ${photo.id}:`, await response.text());
          results[photo.id] = { error: 'Analysis failed' };
          continue;
        }

        const result = await response.json();
        let content = result.choices?.[0]?.message?.content?.trim() || '';
        
        // Strip markdown code fences if present
        content = content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

        try {
          const analysis = JSON.parse(content);

          // Save to DB (including AI-determined category)
          const updatePayload: Record<string, any> = {
            ai_analysis: analysis,
            ai_analyzed_at: new Date().toISOString(),
          };
          if (analysis.photo_category) {
            updatePayload.photo_category = analysis.photo_category;
          }

          const { error: updateError } = await supabase
            .from('campus_photo_samples')
            .update(updatePayload)
            .eq('id', photo.id);

          if (updateError) {
            console.error(`DB update error for ${photo.id}:`, updateError);
          }

          results[photo.id] = { success: true, analysis };
        } catch (parseErr) {
          console.error(`JSON parse error for ${photo.id}:`, content);
          results[photo.id] = { error: 'Invalid analysis response' };
        }
      } catch (photoErr) {
        console.error(`Error analyzing photo ${photo.id}:`, photoErr);
        results[photo.id] = { error: 'Analysis failed' };
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
