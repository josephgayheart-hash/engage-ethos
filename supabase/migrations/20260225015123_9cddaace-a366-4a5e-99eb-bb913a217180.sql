
ALTER TABLE public.crm_opportunities
  ADD COLUMN IF NOT EXISTS subscription_type text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS contract_term_months integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS seat_count integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS arr numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS renewal_date date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS product_tier text DEFAULT NULL;
