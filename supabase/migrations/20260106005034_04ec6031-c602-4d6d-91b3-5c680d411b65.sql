-- Add source_url field to content_dna_samples for tracking web-crawled content
ALTER TABLE public.content_dna_samples 
ADD COLUMN IF NOT EXISTS source_url TEXT;