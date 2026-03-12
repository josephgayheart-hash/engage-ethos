
-- Activity log for all Content DNA section changes
CREATE TABLE public.content_dna_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.institutional_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  section TEXT NOT NULL, -- 'samples', 'analysis', 'stories', 'facts', 'photos', 'design_refs', 'web_crawl', 'tuning', 'custom_instructions'
  action TEXT NOT NULL, -- 'added', 'removed', 'updated', 'analyzed', 'imported', 'scraped'
  artifact_name TEXT, -- e.g. story title, fact label, file name
  artifact_count INTEGER, -- for bulk ops like "imported 12 facts"
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_content_dna_activity_tenant_profile ON public.content_dna_activity(tenant_id, profile_id, created_at DESC);

-- RLS
ALTER TABLE public.content_dna_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity in their tenant"
  ON public.content_dna_activity FOR SELECT
  TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can insert activity in their tenant"
  ON public.content_dna_activity FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Super admins can view all activity"
  ON public.content_dna_activity FOR SELECT
  TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert activity"
  ON public.content_dna_activity FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin(auth.uid()));
