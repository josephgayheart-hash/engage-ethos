-- Add semantic extraction fields to content_dna_samples
ALTER TABLE public.content_dna_samples 
ADD COLUMN IF NOT EXISTS semantic_summary TEXT,
ADD COLUMN IF NOT EXISTS key_themes TEXT[],
ADD COLUMN IF NOT EXISTS extraction_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS extracted_at TIMESTAMP WITH TIME ZONE;

-- Create index for full-text search on semantic summaries
CREATE INDEX IF NOT EXISTS idx_content_dna_samples_semantic_search 
ON public.content_dna_samples 
USING gin(to_tsvector('english', COALESCE(semantic_summary, '') || ' ' || COALESCE(content_text, '')));

-- Create index on key_themes for array search
CREATE INDEX IF NOT EXISTS idx_content_dna_samples_themes 
ON public.content_dna_samples 
USING gin(key_themes);

-- Create function for semantic search across samples
CREATE OR REPLACE FUNCTION public.search_content_samples(
  p_tenant_id UUID,
  p_profile_id UUID DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_themes TEXT[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content_text TEXT,
  semantic_summary TEXT,
  key_themes TEXT[],
  sample_type TEXT,
  relevance_score REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.title,
    s.content_text,
    s.semantic_summary,
    s.key_themes,
    s.sample_type,
    CASE 
      WHEN p_search_query IS NOT NULL AND p_search_query != '' THEN
        ts_rank(
          to_tsvector('english', COALESCE(s.semantic_summary, '') || ' ' || COALESCE(s.content_text, '')),
          plainto_tsquery('english', p_search_query)
        )
      ELSE 1.0
    END::REAL AS relevance_score
  FROM public.content_dna_samples s
  WHERE s.tenant_id = p_tenant_id
    AND (p_profile_id IS NULL OR s.profile_id = p_profile_id OR (p_profile_id IS NULL AND s.profile_id IS NULL))
    AND s.extraction_status = 'completed'
    AND (
      p_search_query IS NULL 
      OR p_search_query = '' 
      OR to_tsvector('english', COALESCE(s.semantic_summary, '') || ' ' || COALESCE(s.content_text, '')) 
         @@ plainto_tsquery('english', p_search_query)
    )
    AND (
      p_themes IS NULL 
      OR p_themes = '{}' 
      OR s.key_themes && p_themes
    )
  ORDER BY relevance_score DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.search_content_samples TO authenticated;