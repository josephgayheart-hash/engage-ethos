import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Validates that a URL actually returns a valid image (not a 404 page or broken redirect).
 * Returns the URL if valid, null otherwise.
 */
async function validateImageUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    // Must be an actual image, not an HTML error page
    if (contentType.startsWith("image/")) return url;
    return null;
  } catch {
    return null;
  }
}

/**
 * Extract the primary .edu (or main institutional) domain from Firecrawl search results.
 * We look specifically for .edu domains and prefer the root/homepage URL.
 */
function extractOfficialDomain(results: any[]): string | null {
  // Priority 1: .edu root domain
  for (const r of results) {
    if (!r.url) continue;
    try {
      const u = new URL(r.url);
      if (u.hostname.endsWith(".edu")) {
        return u.hostname;
      }
    } catch { /* skip */ }
  }
  // Priority 2: any .edu in any result URL
  for (const r of results) {
    if (!r.url) continue;
    try {
      const u = new URL(r.url);
      // Check for .edu anywhere in hostname (e.g. sub.university.edu)
      if (u.hostname.includes(".edu")) {
        // Extract the root .edu domain
        const parts = u.hostname.split(".");
        const eduIdx = parts.findIndex((p: string) => p === "edu");
        if (eduIdx >= 1) {
          return parts.slice(eduIdx - 1).join(".");
        }
        return u.hostname;
      }
    } catch { /* skip */ }
  }
  return null;
}

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

    const name = university_name.trim();
    console.log(`[logo-search] Starting logo search for: "${name}"`);

    // ─── Step 1: Find the official .edu domain via Firecrawl search ───────
    let officialDomain: string | null = null;

    const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `"${name}" site:.edu`,
        limit: 5,
      }),
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      const results = searchData?.data || [];
      console.log(`[logo-search] Firecrawl returned ${results.length} results`);
      officialDomain = extractOfficialDomain(results);
    } else {
      console.error(`[logo-search] Firecrawl search failed: ${searchResponse.status}`);
    }

    // If first search didn't find .edu, try a more direct query
    if (!officialDomain) {
      console.log("[logo-search] No .edu domain found, trying broader search...");
      const fallbackSearch = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `${name} university official website .edu homepage`,
          limit: 5,
        }),
      });
      if (fallbackSearch.ok) {
        const data2 = await fallbackSearch.json();
        officialDomain = extractOfficialDomain(data2?.data || []);
      }
    }

    if (!officialDomain) {
      console.log("[logo-search] Could not determine official domain");
      return new Response(
        JSON.stringify({ success: false, logo_url: null, reason: "Could not find official .edu domain" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[logo-search] Official domain identified: ${officialDomain}`);

    // ─── Step 2: Try multiple reliable logo sources in order ──────────────
    // These are deterministic, domain-based lookups — not random web scraping.

    const candidates: string[] = [
      // 1. Clearbit Logo API — very reliable for known domains, returns actual logos
      `https://logo.clearbit.com/${officialDomain}`,
      // 2. Google's high-quality favicon service (returns largest available icon)
      `https://www.google.com/s2/favicons?domain=${officialDomain}&sz=128`,
      // 3. DuckDuckGo icon service
      `https://icons.duckduckgo.com/ip3/${officialDomain}.ico`,
    ];

    let validatedLogo: string | null = null;

    for (const candidate of candidates) {
      console.log(`[logo-search] Validating candidate: ${candidate}`);
      const result = await validateImageUrl(candidate);
      if (result) {
        validatedLogo = result;
        console.log(`[logo-search] ✓ Valid logo found: ${result}`);
        break;
      }
      console.log(`[logo-search] ✗ Invalid or missing`);
    }

    // ─── Step 3: If deterministic lookups failed, try Firecrawl branding scrape ─
    if (!validatedLogo) {
      console.log("[logo-search] Deterministic lookups failed, trying branding scrape...");
      try {
        const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: `https://${officialDomain}`,
            formats: ["branding"],
          }),
        });

        if (scrapeResponse.ok) {
          const scrapeData = await scrapeResponse.json();
          const branding = scrapeData?.data?.branding || scrapeData?.branding;
          const brandingLogo = branding?.logo || branding?.images?.logo;
          if (brandingLogo) {
            const validated = await validateImageUrl(brandingLogo);
            if (validated) {
              validatedLogo = validated;
              console.log(`[logo-search] ✓ Branding logo validated: ${validated}`);
            }
          }
        }
      } catch (e) {
        console.error("[logo-search] Branding scrape error:", e);
      }
    }

    if (!validatedLogo) {
      console.log("[logo-search] No valid logo found after all attempts");
      return new Response(
        JSON.stringify({ success: false, logo_url: null, domain: officialDomain, reason: "No valid logo image found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[logo-search] Final logo for "${name}": ${validatedLogo}`);

    return new Response(
      JSON.stringify({ success: true, logo_url: validatedLogo, domain: officialDomain }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[logo-search] Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
