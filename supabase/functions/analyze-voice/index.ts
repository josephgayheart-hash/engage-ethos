import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, getClientIP, rateLimitExceededResponse, logSecurityEvent } from "../_shared/rateLimit.ts";
import { resilientFetch, corsHeaders, handleGatewayErrorResponse } from "../_shared/resilience.ts";

const ANALYSIS_PROMPT = `You are a Content DNA analyst for higher education communications. Analyze the provided sample communications to extract the institution's unique Content DNA—voice, tone, messaging patterns, AND brand platform elements.

Examine the samples for:

## VOICE & TONE ANALYSIS:
1. Overall tone (warm, formal, casual, authoritative, etc.)
2. Key characteristics of the writing style
3. Vocabulary patterns (academic vs casual, specific terminology used)
4. Sentence style (short/punchy, long/flowing, question-heavy, etc.)
5. Formality level (highly formal, conversational, somewhere between)
6. Emotional tone (encouraging, urgent, supportive, celebratory, etc.)
7. Common phrases or expressions that recur
8. Messaging tactics used (appeals to authority, social proof, urgency, personalization, etc.)

## BRAND PLATFORM EXTRACTION:
Carefully analyze the samples to extract these brand elements:

1. **Brand Promise** - The core value proposition or transformation the institution offers to students/stakeholders. Look for recurring themes about what the institution delivers or enables.

2. **Brand Pillars** (3-5 maximum) - The key themes, values, or differentiators that recur across communications. Each pillar should have:
   - A clear name (e.g., "Innovation", "Student Success", "Community", "Research Excellence")
   - A brief description of what it means for the institution
   - Keywords/phrases associated with this pillar

3. **Brand Pathways** - Conceptual journeys or transformation narratives. These describe how someone evolves through their relationship with the institution (e.g., "From curious explorer to confident leader").

4. **Proof Points** - Specific achievements, statistics, rankings, or evidence used to back up claims. Extract concrete numbers and facts.

5. **Commitments** - Explicit promises or commitments the institution makes to its stakeholders. Look for "We commit to...", "Our promise is...", "We guarantee..." type statements.

IMPORTANT: Respond ONLY with valid JSON:
{
  "voiceAnalysis": {
    "overallTone": "Description of the overall tone",
    "keyCharacteristics": ["characteristic 1", "characteristic 2", "characteristic 3"],
    "vocabularyPatterns": ["pattern 1", "pattern 2", "pattern 3"],
    "sentenceStyle": "Description of sentence structure and style",
    "formalityLevel": "Description of formality level",
    "emotionalTone": "Description of emotional undertone",
    "commonPhrases": ["phrase 1", "phrase 2", "phrase 3"],
    "messagingTactics": ["tactic 1", "tactic 2", "tactic 3"],
    "summary": "2-3 paragraph summary of the Content DNA that can guide future message generation"
  },
  "brandPlatform": {
    "brandPromise": "Single sentence capturing the core promise/value proposition",
    "brandPillars": [
      {
        "name": "Pillar Name",
        "description": "Brief description of what this pillar means",
        "keywords": ["keyword1", "keyword2", "keyword3"]
      }
    ],
    "brandPathways": [
      {
        "name": "Pathway Name",
        "description": "The transformation narrative this pathway represents"
      }
    ],
    "proofPoints": ["Specific stat or achievement 1", "Specific stat or achievement 2"],
    "commitments": ["Commitment statement 1", "Commitment statement 2"]
  }
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: 30 requests per minute per IP
    const clientIP = getClientIP(req);
    const rateLimit = await checkRateLimit(clientIP, "analyze-voice", { maxRequests: 30, windowSeconds: 60 });
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit);
    }
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

    const userPrompt = `Please analyze the following sample communications to extract the Content DNA (voice analysis AND brand platform elements):

${samplesText}

Analyze these samples and extract both the voice profile and brand platform as JSON.`;

    console.log(`Analyzing ${samples.length} Content DNA samples for voice AND brand platform...`);

    const response = await resilientFetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
          max_tokens: 4096,
          response_format: { type: "json_object" },
        }),
      },
      { label: "analyze-voice", maxRetries: 2 }
    );

    if (!response.ok) {
      return await handleGatewayErrorResponse(response, "analyze-voice");
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

    // Clean the content - strip markdown code blocks if present
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }
    
    // Remove control characters that can break JSON parsing (except valid whitespace)
    jsonContent = jsonContent.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    try {
      const result = JSON.parse(jsonContent);
      
      // Handle both new format (nested) and legacy format (flat)
      const finalResult: any = {
        analyzedAt: new Date().toISOString(),
      };

      // If the response has the new nested structure
      if (result.voiceAnalysis) {
        finalResult.voiceAnalysis = result.voiceAnalysis;
        finalResult.brandPlatform = result.brandPlatform || null;
      } else {
        // Legacy flat format - treat entire response as voice analysis
        finalResult.voiceAnalysis = {
          overallTone: result.overallTone,
          keyCharacteristics: result.keyCharacteristics,
          vocabularyPatterns: result.vocabularyPatterns,
          sentenceStyle: result.sentenceStyle,
          formalityLevel: result.formalityLevel,
          emotionalTone: result.emotionalTone,
          commonPhrases: result.commonPhrases,
          messagingTactics: result.messagingTactics,
          summary: result.summary,
        };
        finalResult.brandPlatform = null;
      }

      console.log("Content DNA analysis completed successfully with brand platform:", !!finalResult.brandPlatform);
      
      return new Response(JSON.stringify(finalResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Raw content:", content);
      console.error("Cleaned content:", jsonContent.substring(0, 500));
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
