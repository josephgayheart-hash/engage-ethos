-- Create content_dna_analysis table to store tenant voice analysis
CREATE TABLE public.content_dna_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  voice_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  custom_instructions TEXT,
  sample_count INTEGER NOT NULL DEFAULT 0,
  last_analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Enable RLS
ALTER TABLE public.content_dna_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their tenant DNA analysis"
ON public.content_dna_analysis
FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can manage their tenant DNA analysis"
ON public.content_dna_analysis
FOR ALL
USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admins can view all DNA analysis"
ON public.content_dna_analysis
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_content_dna_analysis_updated_at
BEFORE UPDATE ON public.content_dna_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add sample_type column to content_dna_samples if not exists
ALTER TABLE public.content_dna_samples 
ADD COLUMN IF NOT EXISTS sample_type TEXT DEFAULT 'other',
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS source_description TEXT;