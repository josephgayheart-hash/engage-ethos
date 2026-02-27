
-- Design references table for storing graphic design inspiration images
CREATE TABLE public.design_references (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  profile_id UUID REFERENCES public.institutional_profiles(id),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  reference_type TEXT NOT NULL DEFAULT 'inspiration',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.design_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view design references in their tenant"
  ON public.design_references FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can create design references in their tenant"
  ON public.design_references FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Users can delete their own design references"
  ON public.design_references FOR DELETE
  USING (user_id = auth.uid() AND tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can delete any design references in their tenant"
  ON public.design_references FOR DELETE
  USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admins can view all design references"
  ON public.design_references FOR SELECT
  USING (is_super_admin(auth.uid()));

-- Storage bucket for design reference images
INSERT INTO storage.buckets (id, name, public) VALUES ('design-references', 'design-references', true);

-- Storage policies
CREATE POLICY "Users can upload design references"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'design-references');

CREATE POLICY "Anyone can view design references"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'design-references');

CREATE POLICY "Users can delete their own design references"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'design-references');
