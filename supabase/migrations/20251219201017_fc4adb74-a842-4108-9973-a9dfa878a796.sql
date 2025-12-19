-- Add brand_platform JSONB column to store extracted brand elements
ALTER TABLE public.content_dna_analysis 
ADD COLUMN IF NOT EXISTS brand_platform JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.content_dna_analysis.brand_platform IS 'Stores extracted brand elements: brandPromise, brandPillars, brandPathways, proofPoints, commitments';