import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkedInResult {
  linkedin_url: string;
  title: string;
  description?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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

    // Simple, direct search query — just name + title + institution on LinkedIn
    const parts = [`site:linkedin.com/in`, name];
    if (title) parts.push(title);
    if (institution) parts.push(institution);
    const searchQuery = parts.join(' ');
    
    console.log('LinkedIn search query:', searchQuery);

    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 8,
        lang: 'en',
        country: 'us',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl search error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || 'LinkedIn search failed' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Search results count:', data.data?.length || 0);

    // Filter to only LinkedIn profile URLs and return all matches
    const results: LinkedInResult[] = (data.data || [])
      .filter((r: any) => (r.url || '').includes('linkedin.com/in/'))
      .map((r: any) => ({
        linkedin_url: r.url,
        title: r.title || '',
        description: r.description || '',
      }));

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
