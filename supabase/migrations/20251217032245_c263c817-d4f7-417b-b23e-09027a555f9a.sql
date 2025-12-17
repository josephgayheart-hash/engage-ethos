-- Create PERSIST system tenant for super admins
INSERT INTO public.tenants (id, institution_name, status, primary_color, accent_color)
VALUES ('00000000-0000-0000-0000-000000000000', 'PERSIST System', 'active', '#1F2A44', '#2C7A7B')
ON CONFLICT (id) DO NOTHING;

-- Create is_super_admin helper function
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

-- Drop existing onboarding_requests policies
DROP POLICY IF EXISTS "Admins can view requests for their tenant" ON public.onboarding_requests;
DROP POLICY IF EXISTS "Admins can update requests for their tenant" ON public.onboarding_requests;

-- Create new policies: only super_admins can view/manage onboarding requests
CREATE POLICY "Super admins can view all onboarding requests"
ON public.onboarding_requests
FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update onboarding requests"
ON public.onboarding_requests
FOR UPDATE
USING (is_super_admin(auth.uid()));

-- Move Tyler Aleysian to PERSIST tenant (find by email)
UPDATE public.profiles 
SET tenant_id = '00000000-0000-0000-0000-000000000000'
WHERE email = 'tyler@persist.com';

-- Update Tyler's role to super_admin
UPDATE public.user_roles
SET role = 'super_admin', tenant_id = '00000000-0000-0000-0000-000000000000'
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'tyler@persist.com');