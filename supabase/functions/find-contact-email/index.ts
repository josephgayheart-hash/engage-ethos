import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuth } from "../_shared/requireAuth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface EmailResult {
  email: string;
  source: string;
  confidence: string;
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

function extractEmails(text: string): string[] {
  if (!text) return [];
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex) || [];
  // Filter out common false positives
  return matches.filter(e => 
    !e.includes('example.com') && 
    !e.includes('sentry') &&
    !e.includes('webpack') &&
    !e.endsWith('.png') &&
    !e.endsWith('.jpg') &&
    e.length < 60
  );
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

    // Build search queries to find email addresses
    const queries: string[] = [];
    queries.push(`${name} email`);
    if (institution) {
      queries.push(`${name} ${institution} email`);
      queries.push(`${name} ${institution} contact`);
    }
    if (title) {
      queries.push(`${name} ${title} email contact`);
    }

    console.log('Email search queries:', queries);

    const allSearchResults = await Promise.all(
      queries.map(q => searchFirecrawl(FIRECRAWL_API_KEY, q))
    );

    // Extract emails from all results
    const seen = new Set<string>();
    const results: EmailResult[] = [];

    for (const searchResults of allSearchResults) {
      for (const r of searchResults) {
        const text = `${r.title || ''} ${r.description || ''} ${r.markdown || ''}`;
        const emails = extractEmails(text);
        for (const email of emails) {
          const lower = email.toLowerCase();
          if (seen.has(lower)) continue;
          seen.add(lower);
          
          // Determine confidence based on context
          const nameFirst = name.split(' ')[0]?.toLowerCase() || '';
          const nameLast = name.split(' ').slice(-1)[0]?.toLowerCase() || '';
          const emailLower = lower;
          const hasNameMatch = emailLower.includes(nameFirst) || emailLower.includes(nameLast);
          const hasInstitutionDomain = institution && emailLower.includes(institution.toLowerCase().split(' ')[0]);
          
          let confidence = 'low';
          if (hasNameMatch && hasInstitutionDomain) confidence = 'high';
          else if (hasNameMatch || hasInstitutionDomain) confidence = 'medium';

          results.push({
            email: lower,
            source: r.url || r.title || 'Web search',
            confidence,
          });
        }
      }
    }

    // Sort by confidence
    const order = { high: 0, medium: 1, low: 2 };
    results.sort((a, b) => (order[a.confidence as keyof typeof order] || 2) - (order[b.confidence as keyof typeof order] || 2));

    console.log('Emails found:', results.length);

    return new Response(
      JSON.stringify({ success: true, data: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error finding email:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
