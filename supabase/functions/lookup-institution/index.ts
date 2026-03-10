import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();

    if (!domain || typeof domain !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Domain is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize domain
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "AI not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Looking up institution:", cleanDomain);

    // Scrape homepage and about page in parallel using Firecrawl branding + markdown
    const scrapeUrl = async (url: string, formats: string[] = ["markdown"]) => {
      try {
        const resp = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            formats,
            onlyMainContent: true,
            waitFor: 3000,
          }),
        });
        if (!resp.ok) {
          console.error(`Scrape failed for ${url}: ${resp.status}`);
          return null;
        }
        return await resp.json();
      } catch (e) {
        console.error(`Scrape error for ${url}:`, e);
        return null;
      }
    };

    const [homepageResult, aboutResult, brandingResult] = await Promise.all([
      scrapeUrl(`https://${cleanDomain}`, ["markdown"]),
      scrapeUrl(`https://${cleanDomain}/about`, ["markdown"]),
      scrapeUrl(`https://${cleanDomain}`, ["branding"]),
    ]);

    const homepageContent = homepageResult?.data?.markdown || homepageResult?.markdown || "";
    const aboutContent = aboutResult?.data?.markdown || aboutResult?.markdown || "";
    const branding = brandingResult?.data?.branding || brandingResult?.branding || null;
    const metadata = homepageResult?.data?.metadata || homepageResult?.metadata || {};

    // Build context for AI extraction
    const combinedContent = [
      homepageContent ? `=== HOMEPAGE ===\n${homepageContent.substring(0, 8000)}` : "",
      aboutContent ? `=== ABOUT PAGE ===\n${aboutContent.substring(0, 8000)}` : "",
      branding ? `=== BRANDING DATA ===\n${JSON.stringify(branding, null, 2)}` : "",
      metadata ? `=== METADATA ===\ntitle: ${metadata.title || ""}\ndescription: ${metadata.description || ""}\nog:image: ${metadata.ogImage || metadata["og:image"] || ""}` : "",
    ].filter(Boolean).join("\n\n");

    if (!combinedContent.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "Could not retrieve any content from this domain" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Lovable AI to extract structured institution data
    const extractionPrompt = `You are extracting institutional details from a university/college website.

Given the website content and branding data below, extract as many of the following fields as you can confidently identify. Return ONLY a JSON object with these fields (use null for unknown fields):

{
  "institutionName": "Full official name",
  "institutionAbbreviation": "Common abbreviation (e.g., OSU, UCLA)",
  "mascot": "Team mascot/nickname",
  "institutionType": "one of: doctoral-university, masters-university, baccalaureate-college, associates-college, special-focus (use Carnegie Classification: doctoral-university for R1/R2, masters-university for master's-granting, baccalaureate-college for bachelor's-focused/liberal arts, associates-college for community/technical/two-year, special-focus for professional/medical/law/art schools)",
  "primaryColor": "#hex color",
  "secondaryColor": "#hex color",
  "tertiaryColor": "#hex color or null",
  "slogans": ["taglines or mottos found on the site"],
  "presidentName": "Name of the president/chancellor",
  "presidentTitle": "Their exact title",
  "provostName": "Name of the provost",
  "provostTitle": "Their exact title",
  "logoUrl": "URL of the institution's logo if found",
  "portalName": "Student portal name if mentioned",
  "lmsName": "Learning management system if mentioned (Canvas, Blackboard, etc.)",
  "websiteUrl": "Main website URL"
}

IMPORTANT:
- For colors, prefer colors from the branding data if available. Convert to hex format.
- Only include fields you can confidently extract. Use null otherwise.
- For institutionType, infer from context (mentions of "community college", "university", etc.)

WEBSITE CONTENT:
${combinedContent}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You extract structured data from university websites. Return only valid JSON, no markdown fences." },
          { role: "user", content: extractionPrompt },
        ],
        max_tokens: 2048,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(
        JSON.stringify({ success: false, error: "AI extraction failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    let rawContent = aiData.choices?.[0]?.message?.content || "";
    
    // Strip markdown code fences if present
    rawContent = rawContent.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    let extracted: Record<string, any>;
    try {
      extracted = JSON.parse(rawContent);
    } catch {
      console.error("Failed to parse AI response:", rawContent.substring(0, 500));
      return new Response(
        JSON.stringify({ success: false, error: "Failed to parse extraction results" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the response mapping to InstitutionalConfig fields
    const result: Record<string, any> = {};
    const fieldCount = { total: 0 };

    const setIfPresent = (key: string, value: any) => {
      if (value !== null && value !== undefined && value !== "") {
        result[key] = value;
        fieldCount.total++;
      }
    };

    setIfPresent("institutionName", extracted.institutionName);
    setIfPresent("institutionAbbreviation", extracted.institutionAbbreviation);
    setIfPresent("mascot", extracted.mascot);
    setIfPresent("institutionType", extracted.institutionType);
    setIfPresent("primaryColor", extracted.primaryColor);
    setIfPresent("secondaryColor", extracted.secondaryColor);
    setIfPresent("tertiaryColor", extracted.tertiaryColor);
    setIfPresent("presidentName", extracted.presidentName);
    setIfPresent("presidentTitle", extracted.presidentTitle);
    setIfPresent("provostName", extracted.provostName);
    setIfPresent("provostTitle", extracted.provostTitle);
    setIfPresent("logoUrl", extracted.logoUrl);
    setIfPresent("portalName", extracted.portalName);
    setIfPresent("lmsName", extracted.lmsName);
    
    // Set email domain from the input
    result.emailDomain = `@${cleanDomain}`;
    fieldCount.total++;

    // Set website
    if (extracted.websiteUrl) {
      result.websiteLinks = [extracted.websiteUrl];
      fieldCount.total++;
    } else {
      result.websiteLinks = [`https://${cleanDomain}`];
      fieldCount.total++;
    }

    // Set slogans
    if (Array.isArray(extracted.slogans) && extracted.slogans.length > 0) {
      result.slogans = extracted.slogans.filter((s: any) => s && typeof s === "string");
      if (result.slogans.length > 0) fieldCount.total++;
    }

    console.log(`Extracted ${fieldCount.total} fields for ${cleanDomain}`);

    return new Response(
      JSON.stringify({ success: true, data: result, fieldsFound: fieldCount.total }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("lookup-institution error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
