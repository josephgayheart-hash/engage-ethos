
-- Create campus_photo_samples table
CREATE TABLE public.campus_photo_samples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  profile_id UUID REFERENCES public.institutional_profiles(id),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  photo_category TEXT NOT NULL DEFAULT 'campus-life',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campus_photo_samples ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view campus photos in their tenant"
ON public.campus_photo_samples FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Super admins can view all campus photos"
ON public.campus_photo_samples FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users can upload campus photos in their tenant"
ON public.campus_photo_samples FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Users can delete their own campus photos"
ON public.campus_photo_samples FOR DELETE
USING (user_id = auth.uid() AND tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can delete any campus photos in their tenant"
ON public.campus_photo_samples FOR DELETE
USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own campus photos"
ON public.campus_photo_samples FOR UPDATE
USING (user_id = auth.uid() AND tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can update any campus photos in their tenant"
ON public.campus_photo_samples FOR UPDATE
USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('campus-photography', 'campus-photography', true);

-- Storage policies
CREATE POLICY "Campus photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'campus-photography');

CREATE POLICY "Authenticated users can upload campus photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'campus-photography' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own campus photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'campus-photography' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own campus photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'campus-photography' AND auth.role() = 'authenticated');
