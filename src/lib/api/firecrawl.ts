import { supabase } from '@/integrations/supabase/client';

type FirecrawlResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
};

type ScrapeOptions = {
  formats?: ('markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot')[];
  onlyMainContent?: boolean;
  waitFor?: number;
};

type MapOptions = {
  search?: string;
  limit?: number;
  includeSubdomains?: boolean;
};

type SearchOptions = {
  limit?: number;
  tbs?: string; // Time filter: 'qdr:d' (day), 'qdr:w' (week), 'qdr:m' (month), 'qdr:y' (year)
  lang?: string;
  country?: string;
};

export interface ScrapeResult {
  markdown?: string;
  html?: string;
  screenshot?: string; // Base64 encoded screenshot
  metadata?: {
    title?: string;
    description?: string;
    language?: string;
    sourceURL?: string;
    statusCode?: number;
  };
}

export interface MapResult {
  links: string[];
}

export interface SearchResult {
  url: string;
  title: string;
  description?: string;
  markdown?: string;
  publishedDate?: string;
  metadata?: {
    title?: string;
    description?: string;
    publishedDate?: string;
    sourceURL?: string;
  };
}

export const firecrawlApi = {
  // Search the web
  async search(query: string, options?: SearchOptions): Promise<FirecrawlResponse<SearchResult[]>> {
    const { data, error } = await supabase.functions.invoke('firecrawl-search', {
      body: { query, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { 
      success: data?.success !== false, 
      data: data?.data || [],
      error: data?.error 
    };
  },

  // Scrape a single URL
  async scrape(url: string, options?: ScrapeOptions): Promise<FirecrawlResponse<ScrapeResult>> {
    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    
    // Handle Firecrawl v1 response format (data nested in data)
    const scrapeData = data?.data || data;
    return { 
      success: data?.success !== false, 
      data: scrapeData,
      error: data?.error 
    };
  },

  // Map a website to discover all URLs (fast sitemap)
  async map(url: string, options?: MapOptions): Promise<FirecrawlResponse<MapResult>> {
    const { data, error } = await supabase.functions.invoke('firecrawl-map', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { 
      success: data?.success !== false, 
      data: { links: data?.links || [] },
      error: data?.error 
    };
  },
};
