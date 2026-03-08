-- Create integration_type enum
CREATE TYPE public.integration_type AS ENUM ('slate', 'sfmc');

-- Create tenant_integrations table
CREATE TABLE public.tenant_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  integration_type integration_type NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, integration_type)
);

-- Enable RLS
ALTER TABLE public.tenant_integrations ENABLE ROW LEVEL SECURITY;

-- RLS policies: admins can manage their tenant's integrations
CREATE POLICY "Admins can manage integrations in their tenant"
  ON public.tenant_integrations
  FOR ALL
  TO authenticated
  USING (
    tenant_id = get_user_tenant_id(auth.uid())
    AND has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    tenant_id = get_user_tenant_id(auth.uid())
    AND has_role(auth.uid(), 'admin'::app_role)
  );

-- Super admins can view all
CREATE POLICY "Super admins can view all integrations"
  ON public.tenant_integrations
  FOR SELECT
  TO authenticated
  USING (is_super_admin(auth.uid()));

-- Users can view their tenant's integrations (read-only)
CREATE POLICY "Users can view integrations in their tenant"
  ON public.tenant_integrations
  FOR SELECT
  TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()));

-- Add updated_at trigger
CREATE TRIGGER update_tenant_integrations_updated_at
  BEFORE UPDATE ON public.tenant_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();