
-- Allow super admins to update any tenant (for workspace impersonation)
CREATE POLICY "Super admins can update any tenant"
ON public.tenants
FOR UPDATE
TO authenticated
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

-- Allow super admins to delete any tenant
CREATE POLICY "Super admins can delete any tenant"
ON public.tenants
FOR DELETE
TO authenticated
USING (is_super_admin(auth.uid()));

-- Also allow super admins to upload/update/delete storage objects in institution-logos
-- (existing policies only check for 'admin' role, not super_admin)
CREATE POLICY "Super admins can upload institution logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'institution-logos' 
  AND is_super_admin(auth.uid())
);

CREATE POLICY "Super admins can update institution logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'institution-logos' 
  AND is_super_admin(auth.uid())
);

CREATE POLICY "Super admins can delete institution logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'institution-logos' 
  AND is_super_admin(auth.uid())
);
