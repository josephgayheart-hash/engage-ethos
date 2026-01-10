import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkedInResult {
  linkedin_url: string | null;
  confidence: 'high' | 'medium' | 'low';
  profile_title?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, title, institution } = await req.json();

    if (!name || !institution) {
      return new Response(
        JSON.stringify({ success: false, error: 'Name and institution are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured. Please connect Firecrawl in Settings.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build search query for LinkedIn - use flexible matching
    // Extract key title words instead of using full title (which often fails)
    const extractKeyTitleWords = (fullTitle: string): string[] => {
      const keyRoles = ['president', 'vp', 'director', 'chief', 'dean', 'provost', 'chancellor', 'cmo', 'cco', 'marketing', 'communications', 'enrollment', 'admissions'];
      const words = fullTitle.toLowerCase().split(/\s+/);
      return words.filter(w => keyRoles.some(role => w.includes(role))).slice(0, 2);
    };
    
    // Simplify institution name - remove common suffixes
    const simplifyInstitution = (inst: string): string => {
      return inst
        .replace(/\s*\(.*?\)\s*/g, '') // Remove parentheticals like (WGU)
        .replace(/university of /i, '')
        .replace(/ university$/i, '')
        .replace(/ college$/i, '')
        .trim();
    };
    
    const institutionSimple = simplifyInstitution(institution);
    const titleKeywords = title ? extractKeyTitleWords(title) : [];
    
    // Build query: site filter + name (required) + institution + optional title keywords
    // Don't use quotes around everything - more flexible matching
    let searchQuery = `site:linkedin.com/in ${name} ${institutionSimple}`;
    if (titleKeywords.length > 0) {
      searchQuery += ` ${titleKeywords.join(' ')}`;
    }
    console.log('LinkedIn search query:', searchQuery);

    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 5,
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

    console.log('Search results:', data);

    // Find the best LinkedIn profile match
    const results = data.data || [];
    let bestMatch: LinkedInResult = { linkedin_url: null, confidence: 'low' };

    for (const result of results) {
      const url = result.url || '';
      const resultTitle = result.title || '';
      
      // Only consider LinkedIn profile URLs
      if (!url.includes('linkedin.com/in/')) continue;

      // Calculate confidence based on name and title match
      const nameLower = name.toLowerCase();
      const titleLower = (resultTitle || '').toLowerCase();
      const urlLower = url.toLowerCase();

      // Check if name appears in the result
      const nameParts: string[] = nameLower.split(' ');
      const nameInTitle = nameParts.some((part: string) => titleLower.includes(part));
      const nameInUrl = nameParts.some((part: string) => urlLower.includes(part.replace(/[^a-z]/g, '')));

      // Check if institution appears
      const institutionLower = institution.toLowerCase();
      const institutionWords: string[] = institutionLower.split(' ').filter((w: string) => w.length > 3);
      const institutionInTitle = institutionWords.some((word: string) => titleLower.includes(word));

      if (nameInTitle && institutionInTitle) {
        bestMatch = { 
          linkedin_url: url, 
          confidence: 'high',
          profile_title: resultTitle 
        };
        break;
      } else if ((nameInTitle || nameInUrl) && institutionInTitle) {
        bestMatch = { 
          linkedin_url: url, 
          confidence: 'medium',
          profile_title: resultTitle 
        };
      } else if (nameInTitle || nameInUrl) {
        if (bestMatch.confidence === 'low') {
          bestMatch = { 
            linkedin_url: url, 
            confidence: 'low',
            profile_title: resultTitle 
          };
        }
      }
    }

    console.log('Best LinkedIn match:', bestMatch);

    return new Response(
      JSON.stringify({ success: true, data: bestMatch }),
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
