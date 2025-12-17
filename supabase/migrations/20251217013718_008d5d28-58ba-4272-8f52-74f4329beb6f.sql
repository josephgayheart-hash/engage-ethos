-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_status enum
CREATE TYPE public.user_status AS ENUM ('invited', 'pending', 'active', 'locked', 'disabled');

-- Create tenant_status enum
CREATE TYPE public.tenant_status AS ENUM ('active', 'inactive');

-- Create onboarding_status enum
CREATE TYPE public.onboarding_status AS ENUM ('submitted', 'approved', 'rejected');

-- Create tenants table
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name TEXT NOT NULL,
  status tenant_status NOT NULL DEFAULT 'active',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1F2A44',
  accent_color TEXT DEFAULT '#2C7A7B',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  status user_status NOT NULL DEFAULT 'pending',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  department TEXT,
  title TEXT,
  password_reset_required BOOLEAN NOT NULL DEFAULT true,
  last_password_reset_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create user_roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, tenant_id, role)
);

-- Create onboarding_requests table
CREATE TABLE public.onboarding_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  title TEXT,
  institution_name_input TEXT,
  request_status onboarding_status NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by_admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create invite_tokens table
CREATE TABLE public.invite_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_by_admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_log table
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create institutional_config table (tenant-scoped)
CREATE TABLE public.institutional_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_config ENABLE ROW LEVEL SECURITY;

-- Security definer function to get user's tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id LIMIT 1
$$;

-- Security definer function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Security definer function to check if user is active
CREATE OR REPLACE FUNCTION public.is_user_active(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND status = 'active'
  )
$$;

-- RLS Policies for tenants
CREATE POLICY "Users can view their own tenant"
ON public.tenants FOR SELECT
TO authenticated
USING (id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can update their own tenant"
ON public.tenants FOR UPDATE
TO authenticated
USING (id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their tenant"
ON public.profiles FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid() AND tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can insert profiles in their tenant"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update profiles in their tenant"
ON public.profiles FOR UPDATE
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view roles in their tenant"
ON public.user_roles FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can manage roles in their tenant"
ON public.user_roles FOR ALL
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- RLS Policies for onboarding_requests
CREATE POLICY "Anyone can submit onboarding request"
ON public.onboarding_requests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view requests for their tenant"
ON public.onboarding_requests FOR SELECT
TO authenticated
USING (
  (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'))
  OR (tenant_id IS NULL AND public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Admins can update requests for their tenant"
ON public.onboarding_requests FOR UPDATE
TO authenticated
USING (
  (tenant_id = public.get_user_tenant_id(auth.uid()) OR tenant_id IS NULL)
  AND public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for invite_tokens
CREATE POLICY "Admins can manage invite tokens in their tenant"
ON public.invite_tokens FOR ALL
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- RLS Policies for audit_log
CREATE POLICY "Users can view audit logs in their tenant"
ON public.audit_log FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "System can insert audit logs"
ON public.audit_log FOR INSERT
TO authenticated
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- RLS Policies for institutional_config
CREATE POLICY "Users can view config for their tenant"
ON public.institutional_config FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can manage config for their tenant"
ON public.institutional_config FOR ALL
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_tenant_id ON public.user_roles(tenant_id);
CREATE INDEX idx_onboarding_requests_tenant_id ON public.onboarding_requests(tenant_id);
CREATE INDEX idx_onboarding_requests_status ON public.onboarding_requests(request_status);
CREATE INDEX idx_invite_tokens_token ON public.invite_tokens(token);
CREATE INDEX idx_invite_tokens_email ON public.invite_tokens(email);
CREATE INDEX idx_audit_log_tenant_id ON public.audit_log(tenant_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_institutional_config_updated_at
  BEFORE UPDATE ON public.institutional_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();