
CREATE TABLE public.social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  profile_id UUID REFERENCES public.institutional_profiles(id),
  platform TEXT[] NOT NULL DEFAULT '{}',
  caption TEXT,
  cta_text TEXT,
  cta_url TEXT,
  image_url TEXT,
  brand_overlay_data JSONB,
  scheduled_at TIMESTAMPTZ,
  cadence TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  publish_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own tenant's posts
CREATE POLICY "Users can view social posts in their tenant"
  ON public.social_posts FOR SELECT TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can create social posts in their tenant"
  ON public.social_posts FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Users can update their own social posts"
  ON public.social_posts FOR UPDATE TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Users can delete their own social posts"
  ON public.social_posts FOR DELETE TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()) AND user_id = auth.uid());

-- Admins can manage all posts in their tenant
CREATE POLICY "Admins can update social posts in their tenant"
  ON public.social_posts FOR UPDATE TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete social posts in their tenant"
  ON public.social_posts FOR DELETE TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

-- Super admins full access
CREATE POLICY "Super admins can select social posts"
  ON public.social_posts FOR SELECT TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert social posts"
  ON public.social_posts FOR INSERT TO authenticated
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update social posts"
  ON public.social_posts FOR UPDATE TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete social posts"
  ON public.social_posts FOR DELETE TO authenticated
  USING (is_super_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
