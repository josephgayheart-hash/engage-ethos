-- Allow super admins to view all profiles across all tenants
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.profiles;

CREATE POLICY "Users can view profiles in their tenant or super admins can view all"
ON public.profiles
FOR SELECT
USING (
  tenant_id = get_user_tenant_id(auth.uid()) 
  OR is_super_admin(auth.uid())
);

-- Allow super admins to view all tenants
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;

CREATE POLICY "Users can view their own tenant or super admins can view all"
ON public.tenants
FOR SELECT
USING (
  id = get_user_tenant_id(auth.uid())
  OR is_super_admin(auth.uid())
);

-- Allow super admins to view all user roles
DROP POLICY IF EXISTS "Users can view roles in their tenant" ON public.user_roles;

CREATE POLICY "Users can view roles in their tenant or super admins can view all"
ON public.user_roles
FOR SELECT
USING (
  tenant_id = get_user_tenant_id(auth.uid())
  OR is_super_admin(auth.uid())
);