
-- Add files jsonb column to crm_opportunities
ALTER TABLE public.crm_opportunities 
ADD COLUMN IF NOT EXISTS files jsonb DEFAULT '[]'::jsonb;

-- Create storage bucket for opportunity files
INSERT INTO storage.buckets (id, name, public)
VALUES ('crm-opportunity-files', 'crm-opportunity-files', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: Super admins can manage files in this bucket
CREATE POLICY "Super admins can upload opportunity files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'crm-opportunity-files' AND is_super_admin(auth.uid())
);

CREATE POLICY "Super admins can delete opportunity files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'crm-opportunity-files' AND is_super_admin(auth.uid())
);

CREATE POLICY "Anyone can view opportunity files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'crm-opportunity-files'
);
