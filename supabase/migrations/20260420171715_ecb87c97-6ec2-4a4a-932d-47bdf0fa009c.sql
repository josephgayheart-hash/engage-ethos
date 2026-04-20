-- 1) Make design-references bucket private
UPDATE storage.buckets SET public = false WHERE id = 'design-references';

-- 2) Drop existing permissive INSERT policies that don't enforce tenant scoping
DROP POLICY IF EXISTS "Authenticated can upload design references" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload brand overlays" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload collection assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload campus photos" ON storage.objects;

-- Helper: a user's tenant id (already in public schema as get_user_tenant_id)

-- 3) Re-create INSERT policies with tenant-prefix enforcement
-- Path convention enforced: first folder segment must equal the user's tenant_id

CREATE POLICY "Tenant members can upload design references"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'design-references'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = public.get_user_tenant_id(auth.uid())::text
);

CREATE POLICY "Tenant members can upload brand overlays"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'brand-overlays'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = public.get_user_tenant_id(auth.uid())::text
);

CREATE POLICY "Tenant members can upload logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = public.get_user_tenant_id(auth.uid())::text
);

CREATE POLICY "Tenant members can upload collection assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'collection-assets'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = public.get_user_tenant_id(auth.uid())::text
);

CREATE POLICY "Tenant members can upload brand assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'brand-assets'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = public.get_user_tenant_id(auth.uid())::text
);

CREATE POLICY "Tenant members can upload campus photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'campus-photography'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = public.get_user_tenant_id(auth.uid())::text
);

-- 4) For the now-private design-references bucket, allow tenant members to SELECT
-- Replace the older "by-name" anonymous select policy
DROP POLICY IF EXISTS "Design references accessible by name" ON storage.objects;

CREATE POLICY "Tenant members can read design references"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'design-references'
  AND (storage.foldername(name))[1] = public.get_user_tenant_id(auth.uid())::text
);

-- Super admins retain full access
CREATE POLICY "Super admins can read design references"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'design-references'
  AND public.is_super_admin(auth.uid())
);