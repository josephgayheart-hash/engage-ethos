import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXTRACTION_PROMPT = `You are a content analyst specializing in higher education communications. Analyze the provided content sample and extract semantic information for retrieval purposes.

Extract the following:

1. **Semantic Summary** (2-3 sentences): A concise summary capturing the main message, purpose, and key points of the content. Focus on what makes this content distinctive and searchable.

2. **Key Themes** (3-8 themes): Single words or short phrases representing the core topics, values, and concepts in the content. These should be useful for categorization and search matching.

Examples of themes: "student success", "innovation", "community", "diversity", "research excellence", "career readiness", "affordability", "campus life", "alumni engagement", "academic rigor"

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "semanticSummary": "Your 2-3 sentence summary here...",
  "keyThemes": ["theme1", "theme2", "theme3"]
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sampleId, contentText, batchIds } = await req.json();
    
    // Validate input - either single sample or batch
    if (!sampleId && !batchIds) {
      return new Response(
        JSON.stringify({ error: "Either sampleId or batchIds is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client for database updates
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle batch processing
    const idsToProcess = batchIds || [sampleId];
    const results: Array<{ id: string; success: boolean; error?: string }> = [];

    for (const id of idsToProcess) {
      try {
        // Fetch sample content if not provided
        let content = contentText;
        if (!content) {
          const { data: sample, error: fetchError } = await supabase
            .from("content_dna_samples")
            .select("content_text")
            .eq("id", id)
            .single();

          if (fetchError || !sample?.content_text) {
            console.error(`Failed to fetch sample ${id}:`, fetchError);
            results.push({ id, success: false, error: "Sample not found" });
            continue;
          }
          content = sample.content_text;
        }

        // Truncate content if too long (keep first 8000 chars for context window)
        const truncatedContent = content.length > 8000 
          ? content.substring(0, 8000) + "...[truncated]"
          : content;

        console.log(`Extracting semantics for sample ${id} (${truncatedContent.length} chars)...`);

        // Call Lovable AI for extraction
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: EXTRACTION_PROMPT },
              { role: "user", content: `Analyze this content sample and extract semantic information:\n\n${truncatedContent}` },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`AI gateway error for ${id}:`, response.status, errorText);
          
          if (response.status === 429) {
            results.push({ id, success: false, error: "Rate limit exceeded" });
            continue;
          }
          if (response.status === 402) {
            results.push({ id, success: false, error: "AI credits exhausted" });
            continue;
          }
          
          results.push({ id, success: false, error: "AI processing failed" });
          continue;
        }

        const data = await response.json();
        const aiContent = data.choices?.[0]?.message?.content;

        if (!aiContent) {
          console.error(`No content in AI response for ${id}`);
          results.push({ id, success: false, error: "Empty AI response" });
          continue;
        }

        // Parse JSON response
        let jsonContent = aiContent;
        const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1].trim();
        }
        jsonContent = jsonContent.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

        const extracted = JSON.parse(jsonContent);

        // Update the sample with extracted semantics
        const { error: updateError } = await supabase
          .from("content_dna_samples")
          .update({
            semantic_summary: extracted.semanticSummary,
            key_themes: extracted.keyThemes || [],
            extraction_status: "completed",
            extracted_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (updateError) {
          console.error(`Failed to update sample ${id}:`, updateError);
          results.push({ id, success: false, error: "Database update failed" });
          continue;
        }

        console.log(`Successfully extracted semantics for sample ${id}`);
        results.push({ id, success: true });

      } catch (sampleError) {
        console.error(`Error processing sample ${id}:`, sampleError);
        
        // Mark as failed in database
        await supabase
          .from("content_dna_samples")
          .update({ extraction_status: "failed" })
          .eq("id", id);
          
        results.push({ 
          id, 
          success: false, 
          error: sampleError instanceof Error ? sampleError.message : "Unknown error" 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Extraction complete: ${successCount} succeeded, ${failCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: failCount === 0,
        results,
        summary: {
          total: results.length,
          succeeded: successCount,
          failed: failCount,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in extract-semantics function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
