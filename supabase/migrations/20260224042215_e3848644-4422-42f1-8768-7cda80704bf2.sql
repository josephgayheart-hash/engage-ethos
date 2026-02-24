
-- Create opportunities table for pipeline tracking
CREATE TABLE public.crm_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID REFERENCES public.sales_prospects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'discovery',
  amount NUMERIC(12,2),
  close_date DATE,
  notes TEXT,
  created_by_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;

-- Super admins can manage opportunities
CREATE POLICY "Super admins can manage opportunities"
  ON public.crm_opportunities
  FOR ALL
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));
