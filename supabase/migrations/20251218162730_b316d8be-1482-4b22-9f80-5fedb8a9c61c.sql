-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view profiles in their tenant or super admins can vie" ON public.profiles;

-- Create more restrictive SELECT policies
-- Users can only view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- Admins can view all profiles in their tenant
CREATE POLICY "Admins can view profiles in their tenant"
ON public.profiles
FOR SELECT
USING (
  (tenant_id = get_user_tenant_id(auth.uid())) 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
USING (is_super_admin(auth.uid()));