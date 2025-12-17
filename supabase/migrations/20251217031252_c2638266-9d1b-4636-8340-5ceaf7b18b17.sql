-- Create institutional profiles table for tenant-scoped profile storage
CREATE TABLE public.institutional_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.institutional_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view profiles in their tenant
CREATE POLICY "Users can view profiles in their tenant"
ON public.institutional_profiles
FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()));

-- Users can create profiles in their tenant
CREATE POLICY "Users can create profiles in their tenant"
ON public.institutional_profiles
FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

-- Users can update profiles in their tenant
CREATE POLICY "Users can update profiles in their tenant"
ON public.institutional_profiles
FOR UPDATE
USING (tenant_id = get_user_tenant_id(auth.uid()));

-- Users can delete profiles they created OR admins can delete any in their tenant
CREATE POLICY "Users can delete their own profiles or admins can delete any"
ON public.institutional_profiles
FOR DELETE
USING (
  tenant_id = get_user_tenant_id(auth.uid()) 
  AND (
    created_by_user_id = auth.uid() 
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_institutional_profiles_updated_at
BEFORE UPDATE ON public.institutional_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();