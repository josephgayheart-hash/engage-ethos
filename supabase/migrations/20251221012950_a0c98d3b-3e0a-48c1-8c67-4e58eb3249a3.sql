-- Create table to store DNA tuning adjustments
CREATE TABLE public.content_dna_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_dna_id UUID NOT NULL REFERENCES public.content_dna_analysis(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  profile_id UUID REFERENCES public.institutional_profiles(id),
  
  -- Dimension sliders (stored as JSONB for flexibility)
  dimensions JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Section feedback
  section_feedback JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Override rules (always/never/prefer)
  override_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by_user_id UUID
);

-- Enable RLS
ALTER TABLE public.content_dna_adjustments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view adjustments in their tenant"
  ON public.content_dna_adjustments
  FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can manage adjustments in their tenant"
  ON public.content_dna_adjustments
  FOR ALL
  USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admins can view all adjustments"
  ON public.content_dna_adjustments
  FOR SELECT
  USING (is_super_admin(auth.uid()));

-- Create index for faster lookups
CREATE INDEX idx_content_dna_adjustments_dna_id ON public.content_dna_adjustments(content_dna_id);
CREATE INDEX idx_content_dna_adjustments_tenant_id ON public.content_dna_adjustments(tenant_id);

-- Add trigger to update updated_at
CREATE TRIGGER update_content_dna_adjustments_updated_at
  BEFORE UPDATE ON public.content_dna_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();