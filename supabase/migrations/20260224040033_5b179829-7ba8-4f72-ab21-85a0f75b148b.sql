
-- Create crm_notes table
CREATE TABLE public.crm_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES public.sales_prospects(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL,
  note_text TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;

-- Super admins only
CREATE POLICY "Super admins can manage crm notes"
  ON public.crm_notes
  FOR ALL
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- Indexes
CREATE INDEX idx_crm_notes_prospect_id ON public.crm_notes(prospect_id);
CREATE INDEX idx_crm_notes_created_at ON public.crm_notes(created_at DESC);

-- Trigger: auto-create sales_prospect when a new profile is created
CREATE OR REPLACE FUNCTION public.auto_create_prospect_from_profile()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  tenant_name TEXT;
BEGIN
  -- Get the tenant/institution name
  SELECT institution_name INTO tenant_name
  FROM public.tenants
  WHERE id = NEW.tenant_id
  LIMIT 1;

  -- Only create if no prospect already exists with this email
  IF NEW.email IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.sales_prospects WHERE contact_email = NEW.email
  ) THEN
    INSERT INTO public.sales_prospects (
      university_name,
      contact_name,
      contact_email,
      contact_title,
      status,
      notes
    ) VALUES (
      COALESCE(tenant_name, 'Unknown'),
      COALESCE(NEW.first_name || ' ' || NEW.last_name, NEW.email),
      NEW.email,
      NEW.title,
      'contacted',
      'Auto-created from app signup on ' || to_char(now(), 'YYYY-MM-DD')
    );
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_auto_create_prospect_from_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_prospect_from_profile();
