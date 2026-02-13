
-- Storage bucket for custom overlay patterns
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-overlays', 'brand-overlays', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload overlays
CREATE POLICY "Users can upload overlays for their tenant"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'brand-overlays' AND auth.role() = 'authenticated');

-- Public read for overlays
CREATE POLICY "Overlays are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-overlays');

-- Allow users to delete their own overlays
CREATE POLICY "Users can delete their own overlays"
ON storage.objects FOR DELETE
USING (bucket_id = 'brand-overlays' AND auth.role() = 'authenticated');

-- Table for custom overlay metadata
CREATE TABLE public.custom_overlay_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  profile_id UUID REFERENCES public.institutional_profiles(id) ON DELETE SET NULL,
  uploaded_by_user_id UUID NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'self_service', -- 'self_service' or 'concierge'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_overlay_patterns ENABLE ROW LEVEL SECURITY;

-- Users can view overlays in their tenant
CREATE POLICY "Users can view overlays in their tenant"
ON public.custom_overlay_patterns FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()));

-- Super admins can view all
CREATE POLICY "Super admins can view all overlays"
ON public.custom_overlay_patterns FOR SELECT
USING (is_super_admin(auth.uid()));

-- Users can create overlays in their tenant
CREATE POLICY "Users can create overlays in their tenant"
ON public.custom_overlay_patterns FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

-- Admins can update overlays in their tenant
CREATE POLICY "Admins can update overlays in their tenant"
ON public.custom_overlay_patterns FOR UPDATE
USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete overlays in their tenant
CREATE POLICY "Admins can delete overlays in their tenant"
ON public.custom_overlay_patterns FOR DELETE
USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_custom_overlay_patterns_updated_at
BEFORE UPDATE ON public.custom_overlay_patterns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
