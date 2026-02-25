ALTER TABLE public.crm_opportunities
  ADD COLUMN IF NOT EXISTS price_per_seat numeric DEFAULT NULL;