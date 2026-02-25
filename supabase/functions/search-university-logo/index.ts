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
    const { university_name } = await req.json();
    if (!university_name || typeof university_name !== "string") {
      return new Response(
        JSON.stringify({ error: "university_name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Firecrawl connector not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const query = `${university_name.trim()} official logo`;
    console.log("Searching for logo:", query);

    // First try: scrape the university homepage for branding
    let logoUrl: string | null = null;

    // Try firecrawl search to find the university website
    const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `${university_name.trim()} official website`,
        limit: 3,
      }),
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      const results = searchData?.data || [];

      // Find the most likely official university URL
      let targetUrl = "";
      for (const r of results) {
        if (r.url && r.url.includes(".edu")) {
          targetUrl = r.url;
          break;
        }
      }
      if (!targetUrl && results.length > 0) {
        targetUrl = results[0].url;
      }

      if (targetUrl) {
        // Extract the base domain
        try {
          const u = new URL(targetUrl);
          const baseUrl = `${u.protocol}//${u.hostname}`;
          console.log("Scraping branding from:", baseUrl);

          const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: baseUrl,
              formats: ["branding"],
            }),
          });

          if (scrapeResponse.ok) {
            const scrapeData = await scrapeResponse.json();
            const branding = scrapeData?.data?.branding || scrapeData?.branding;
            if (branding) {
              logoUrl =
                branding.logo ||
                branding.images?.logo ||
                branding.images?.favicon ||
                null;
            }
          } else {
            console.error("Scrape failed:", scrapeResponse.status);
          }
        } catch (e) {
          console.error("URL parsing error:", e);
        }
      }
    }

    // Fallback: try Google's favicon service or Clearbit
    if (!logoUrl) {
      // Try to derive domain from university name
      const cleanName = university_name.trim().toLowerCase().replace(/\s+/g, "");
      // Use Clearbit's logo API as fallback (free, no key needed)
      logoUrl = `https://logo.clearbit.com/${cleanName}.edu`;
    }

    console.log("Logo result:", logoUrl);

    return new Response(
      JSON.stringify({ success: true, logo_url: logoUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("search-university-logo error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
