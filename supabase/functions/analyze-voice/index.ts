import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ANALYSIS_PROMPT = `You are a brand voice analyst for higher education communications. Analyze the provided sample communications to extract the institution's unique voice, tone, and messaging patterns.

Examine the samples for:
1. Overall tone (warm, formal, casual, authoritative, etc.)
2. Key characteristics of the writing style
3. Vocabulary patterns (academic vs casual, specific terminology used)
4. Sentence style (short/punchy, long/flowing, question-heavy, etc.)
5. Formality level (highly formal, conversational, somewhere between)
6. Emotional tone (encouraging, urgent, supportive, celebratory, etc.)
7. Common phrases or expressions that recur
8. Messaging tactics used (appeals to authority, social proof, urgency, personalization, etc.)

Provide a comprehensive summary of the brand voice that can be used to generate new messages matching this style.

IMPORTANT: Respond ONLY with valid JSON:
{
  "overallTone": "Description of the overall tone",
  "keyCharacteristics": ["characteristic 1", "characteristic 2", "characteristic 3"],
  "vocabularyPatterns": ["pattern 1", "pattern 2", "pattern 3"],
  "sentenceStyle": "Description of sentence structure and style",
  "formalityLevel": "Description of formality level",
  "emotionalTone": "Description of emotional undertone",
  "commonPhrases": ["phrase 1", "phrase 2", "phrase 3"],
  "messagingTactics": ["tactic 1", "tactic 2", "tactic 3"],
  "summary": "2-3 paragraph summary of the brand voice that can guide future message generation"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { samples } = await req.json();
    
    if (!samples || !Array.isArray(samples) || samples.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one sample communication is required" }),
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

    const samplesText = samples.map((sample: string, index: number) => 
      `--- SAMPLE ${index + 1} ---\n${sample}\n`
    ).join('\n');

    const userPrompt = `Please analyze the following sample communications to extract the brand voice and messaging patterns:

${samplesText}

Analyze these samples and extract the voice profile as JSON.`;

    console.log(`Analyzing ${samples.length} voice samples...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: ANALYSIS_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI processing failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "Invalid AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI response received, parsing JSON...");

    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    try {
      const result = JSON.parse(jsonContent);
      result.analyzedAt = new Date().toISOString();
      console.log("Voice analysis completed successfully");
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Raw content:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis results" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in analyze-voice function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
