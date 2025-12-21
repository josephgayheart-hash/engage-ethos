-- Create content_dna_versions table for version history
CREATE TABLE public.content_dna_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_dna_id UUID NOT NULL REFERENCES public.content_dna_analysis(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  profile_id UUID,
  version_number INTEGER NOT NULL DEFAULT 1,
  voice_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  brand_platform JSONB,
  custom_instructions TEXT,
  sample_count INTEGER NOT NULL DEFAULT 0,
  change_summary TEXT,
  created_by_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_dna_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view versions in their tenant"
ON public.content_dna_versions
FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can insert versions in their tenant"
ON public.content_dna_versions
FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admins can view all versions"
ON public.content_dna_versions
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Create index for faster lookups
CREATE INDEX idx_content_dna_versions_dna_id ON public.content_dna_versions(content_dna_id);
CREATE INDEX idx_content_dna_versions_tenant ON public.content_dna_versions(tenant_id);

-- Create function to auto-version on analysis update
CREATE OR REPLACE FUNCTION public.create_content_dna_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  -- Only create version if voice_analysis actually changed
  IF OLD.voice_analysis IS DISTINCT FROM NEW.voice_analysis 
     OR OLD.brand_platform IS DISTINCT FROM NEW.brand_platform
     OR OLD.custom_instructions IS DISTINCT FROM NEW.custom_instructions THEN
    
    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
    FROM public.content_dna_versions
    WHERE content_dna_id = NEW.id;
    
    -- Insert version snapshot
    INSERT INTO public.content_dna_versions (
      content_dna_id,
      tenant_id,
      profile_id,
      version_number,
      voice_analysis,
      brand_platform,
      custom_instructions,
      sample_count,
      created_by_user_id
    ) VALUES (
      NEW.id,
      NEW.tenant_id,
      NEW.profile_id,
      next_version,
      NEW.voice_analysis,
      NEW.brand_platform,
      NEW.custom_instructions,
      NEW.sample_count,
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-versioning
CREATE TRIGGER content_dna_version_trigger
AFTER UPDATE ON public.content_dna_analysis
FOR EACH ROW
EXECUTE FUNCTION public.create_content_dna_version();