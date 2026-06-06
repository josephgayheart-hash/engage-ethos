import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuth } from "../_shared/requireAuth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkedInResult {
  linkedin_url: string;
  title: string;
  description?: string;
}

async function searchFirecrawl(apiKey: string, query: string): Promise<any[]> {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 5,
        lang: 'en',
        country: 'us',
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Firecrawl error for query:', query, data);
      return [];
    }
    return data.data || [];
  } catch (e) {
    console.error('Fetch error for query:', query, e);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }


  const __auth = await requireAuth(req, corsHeaders);
  if ('error' in __auth) return __auth.error;

  try {
    const { name, title, institution } = await req.json();

    if (!name) {
      return new Response(
        JSON.stringify({ success: false, error: 'Name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build multiple search queries for better coverage
    const queries: string[] = [];

    // Query 1: Name + LinkedIn (most broad, most likely to find)
    queries.push(`${name} LinkedIn`);

    // Query 2: Name + title + LinkedIn
    if (title) {
      queries.push(`${name} ${title} LinkedIn`);
    }

    // Query 3: Name + institution + LinkedIn
    if (institution) {
      queries.push(`${name} ${institution} LinkedIn`);
    }

    console.log('LinkedIn search queries:', queries);

    // Run searches in parallel
    const allSearchResults = await Promise.all(
      queries.map(q => searchFirecrawl(FIRECRAWL_API_KEY, q))
    );

    // Merge and deduplicate results by URL
    const seen = new Set<string>();
    const results: LinkedInResult[] = [];

    for (const searchResults of allSearchResults) {
      for (const r of searchResults) {
        const url = r.url || '';
        if (!url.includes('linkedin.com/in/')) continue;
        // Normalize URL for dedup
        const normalized = url.split('?')[0].replace(/\/$/, '').toLowerCase();
        if (seen.has(normalized)) continue;
        seen.add(normalized);
        results.push({
          linkedin_url: url,
          title: r.title || '',
          description: r.description || '',
        });
      }
    }

    console.log('LinkedIn profiles found:', results.length);

    return new Response(
      JSON.stringify({ success: true, data: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error finding LinkedIn profile:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
