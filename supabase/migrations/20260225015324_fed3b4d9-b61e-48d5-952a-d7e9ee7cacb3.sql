
ALTER TABLE public.crm_opportunities
  ADD COLUMN IF NOT EXISTS contact_roles jsonb DEFAULT '{}'::jsonb;
