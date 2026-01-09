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
    const { text, sourceDocument } = await req.json();

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

    const systemPrompt = `You are an expert at extracting structured statistical data from university fact books, fast facts documents, and institutional data reports.

Given text from a fact book or institutional data document, extract individual facts/statistics. For each fact, provide:

1. **category**: One of: enrollment, research, rankings, affordability, outcomes, diversity, athletics, history, facilities, financials, faculty, academics, other
2. **subcategory**: Optional more specific category
3. **label**: The statistic label (e.g., "Total Enrollment", "Average Class Size")
4. **value**: The value (keep numbers as strings, include commas/symbols as shown)
5. **context**: Optional additional context or qualifier
6. **year**: Optional year or academic year (e.g., "2024-25", "Fall 2024")
7. **display_format**: One of: number, currency, percentage, ranking, text
8. **is_highlight**: Boolean - true if this seems like a key institutional stat

IMPORTANT GUIDELINES:
- Extract as many distinct facts as possible
- Keep values exactly as shown (with commas, dollar signs, etc.)
- For rankings, use format like "#17" or "Top 20"
- For percentages, include the % symbol in the value
- For currency, include the $ symbol
- Group related stats under appropriate categories
- Mark truly impressive/notable stats as is_highlight: true

Return a JSON object with a single "facts" array containing all extracted facts. Do not include any other text.

Example output:
{
  "facts": [
    {
      "category": "enrollment",
      "label": "Total Enrollment",
      "value": "67,957",
      "year": "Fall 2024",
      "display_format": "number",
      "is_highlight": true
    },
    {
      "category": "rankings",
      "label": "Best Public University",
      "value": "#17",
      "context": "U.S. News & World Report",
      "year": "2025",
      "display_format": "ranking",
      "is_highlight": true
    }
  ]
}`;

    // Split text into chunks if too long (for very large documents)
    const maxChunkSize = 12000;
    const chunks = [];
    for (let i = 0; i < text.length; i += maxChunkSize) {
      chunks.push(text.substring(i, i + maxChunkSize));
    }

    const allFacts: any[] = [];

    // Process each chunk
    for (let i = 0; i < Math.min(chunks.length, 3); i++) {
      const chunk = chunks[i];
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-5-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { 
              role: 'user', 
              content: `Extract facts from this ${sourceDocument ? `(source: ${sourceDocument})` : ''} document:\n\n${chunk}` 
            }
          ],
          max_completion_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API error:', errorText);
        continue; // Skip this chunk but continue with others
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        console.error('No content in response for chunk', i);
        continue;
      }

      try {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.facts && Array.isArray(parsed.facts)) {
            allFacts.push(...parsed.facts);
          }
        }
      } catch (parseError) {
        console.error('Failed to parse AI response for chunk', i, ':', content.substring(0, 200));
      }
    }

    // Deduplicate facts by label
    const seenLabels = new Set();
    const uniqueFacts = allFacts.filter(fact => {
      const key = `${fact.label}-${fact.value}`.toLowerCase();
      if (seenLabels.has(key)) return false;
      seenLabels.add(key);
      return true;
    });

    // Validate and normalize each fact
    const validCategories = [
      'enrollment', 'research', 'rankings', 'affordability', 'outcomes', 
      'diversity', 'athletics', 'history', 'facilities', 'financials', 
      'faculty', 'academics', 'other'
    ];
    
    const validFormats = ['number', 'currency', 'percentage', 'ranking', 'text'];

    const normalizedFacts = uniqueFacts
      .filter(fact => fact.label && fact.value)
      .map(fact => ({
        category: validCategories.includes(fact.category) ? fact.category : 'other',
        subcategory: fact.subcategory || null,
        label: String(fact.label).trim(),
        value: String(fact.value).trim(),
        context: fact.context ? String(fact.context).trim() : null,
        year: fact.year ? String(fact.year).trim() : null,
        display_format: validFormats.includes(fact.display_format) ? fact.display_format : 'number',
        is_highlight: Boolean(fact.is_highlight),
      }));

    console.log(`Successfully extracted ${normalizedFacts.length} facts from document`);

    return new Response(
      JSON.stringify({ facts: normalizedFacts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in parse-fact-book function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage, facts: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
