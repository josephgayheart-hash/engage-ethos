-- Allow super admins to view all institutional profiles across all tenants
CREATE POLICY "Super admins can view all profiles"
ON public.institutional_profiles
FOR SELECT
USING (is_super_admin(auth.uid()));