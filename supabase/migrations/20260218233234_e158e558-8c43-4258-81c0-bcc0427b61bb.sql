
-- Add AI vision analysis columns to campus_photo_samples
ALTER TABLE public.campus_photo_samples
  ADD COLUMN IF NOT EXISTS ai_analysis jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_analyzed_at timestamp with time zone DEFAULT NULL;

COMMENT ON COLUMN public.campus_photo_samples.ai_analysis IS 'AI vision-extracted metadata: detected elements, colors, mood, architectural features, etc.';
COMMENT ON COLUMN public.campus_photo_samples.ai_analyzed_at IS 'When the AI analysis was performed';
