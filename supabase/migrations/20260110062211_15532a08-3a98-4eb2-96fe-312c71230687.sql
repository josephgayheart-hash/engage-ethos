-- Create a helper function to check if user is agency admin
CREATE OR REPLACE FUNCTION public.is_agency_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'agency_admin'
  )
$$;

-- Create a helper function to check if user is agency user (either agency_admin or agency_user role in an agency tenant)
CREATE OR REPLACE FUNCTION public.is_agency_member(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON ur.user_id = p.id
    JOIN public.tenants t ON p.tenant_id = t.id
    WHERE ur.user_id = _user_id 
    AND (ur.role = 'agency_admin' OR ur.role = 'agency_user')
    AND t.tenant_type = 'agency'
  )
$$;