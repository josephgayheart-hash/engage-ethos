-- Allow super admins to insert institutional profiles for any tenant
CREATE POLICY "Super admins can create profiles for any tenant"
ON public.institutional_profiles
FOR INSERT
TO authenticated
WITH CHECK (is_super_admin(auth.uid()));

-- Allow super admins to update profiles for any tenant
CREATE POLICY "Super admins can update profiles for any tenant"
ON public.institutional_profiles
FOR UPDATE
TO authenticated
USING (is_super_admin(auth.uid()));