import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { resilientFetch, corsHeaders, handleGatewayErrorResponse } from "../_shared/resilience.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "Please provide text to parse" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
            {
              role: "system",
              content: `You are a contact information parser. Extract structured contact data from raw text such as email signatures, directory listings, or pasted blocks. Return ONLY the extracted fields — do not make up or guess values. If a field is not present, omit it.`,
            },
            {
              role: "user",
              content: `Parse the following text and extract contact information:\n\n${text.trim()}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_contact",
                description: "Extract structured contact fields from text",
                parameters: {
                  type: "object",
                  properties: {
                    contact_name: { type: "string", description: "Full name of the person" },
                    contact_title: { type: "string", description: "Job title or role" },
                    contact_email: { type: "string", description: "Email address" },
                    contact_phone: { type: "string", description: "Phone number" },
                    university_name: { type: "string", description: "Organization, company, or university name" },
                    linkedin_url: { type: "string", description: "LinkedIn profile URL" },
                    url: { type: "string", description: "Website URL" },
                    notes: { type: "string", description: "Any remaining information that doesn't fit other fields" },
                  },
                  required: [],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "extract_contact" } },
        }),
      },
      { label: "parse-contact-text", maxRetries: 2 }
    );

    if (!response.ok) {
      return await handleGatewayErrorResponse(response, "parse-contact-text");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No structured response from AI");
    }

    let parsed: Record<string, string>;
    try {
      const raw = toolCall.function.arguments;
      const cleaned = typeof raw === "string" ? raw.replace(/```json\s*/g, "").replace(/```/g, "").trim() : raw;
      parsed = typeof cleaned === "string" ? JSON.parse(cleaned) : cleaned;
    } catch {
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-contact-text error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
