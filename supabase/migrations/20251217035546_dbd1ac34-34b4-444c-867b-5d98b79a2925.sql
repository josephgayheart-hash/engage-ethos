-- Create storage bucket for institution logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('institution-logos', 'institution-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload logos (admins only via RLS on tenants table)
CREATE POLICY "Anyone can view institution logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'institution-logos');

CREATE POLICY "Admins can upload institution logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'institution-logos' 
  AND auth.uid() IS NOT NULL 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update institution logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'institution-logos' 
  AND auth.uid() IS NOT NULL 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete institution logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'institution-logos' 
  AND auth.uid() IS NOT NULL 
  AND has_role(auth.uid(), 'admin'::app_role)
);