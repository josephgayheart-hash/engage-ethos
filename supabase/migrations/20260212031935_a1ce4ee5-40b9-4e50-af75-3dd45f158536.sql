
-- Create storage bucket for collection file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('collection-assets', 'collection-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to their tenant folder
CREATE POLICY "Users can upload collection assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'collection-assets'
  AND auth.uid() IS NOT NULL
);

-- Allow anyone to view collection assets (public bucket)
CREATE POLICY "Collection assets are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'collection-assets');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own collection assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'collection-assets'
  AND auth.uid() IS NOT NULL
);
