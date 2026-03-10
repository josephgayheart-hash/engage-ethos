
-- Advancement campaigns table for giving day planner
CREATE TABLE public.advancement_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.institutional_profiles(id) ON DELETE SET NULL,
  created_by_user_id UUID NOT NULL,
  name TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'giving-day',
  giving_day_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  goal_amount TEXT,
  target_segments JSONB DEFAULT '[]'::jsonb,
  touchpoints JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advancement_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view campaigns in their tenant"
ON public.advancement_campaigns FOR SELECT TO authenticated
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can create campaigns in their tenant"
ON public.advancement_campaigns FOR INSERT TO authenticated
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()) AND created_by_user_id = auth.uid());

CREATE POLICY "Users can update campaigns in their tenant"
ON public.advancement_campaigns FOR UPDATE TO authenticated
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can delete campaigns in their tenant"
ON public.advancement_campaigns FOR DELETE TO authenticated
USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

-- Super admin bypass
CREATE POLICY "Super admins can select campaigns"
ON public.advancement_campaigns FOR SELECT TO authenticated
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert campaigns"
ON public.advancement_campaigns FOR INSERT TO authenticated
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update campaigns"
ON public.advancement_campaigns FOR UPDATE TO authenticated
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete campaigns"
ON public.advancement_campaigns FOR DELETE TO authenticated
USING (is_super_admin(auth.uid()));

-- Updated at trigger
CREATE TRIGGER update_advancement_campaigns_updated_at
  BEFORE UPDATE ON public.advancement_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
