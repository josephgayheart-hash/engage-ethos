-- Create sales_prospects table for Brand Radar feature
CREATE TABLE public.sales_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_name TEXT NOT NULL,
  url TEXT NOT NULL,
  source_article_url TEXT,
  source_article_title TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_title TEXT,
  notes TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'not_interested')),
  brand_launch_date TEXT,
  discovered_at TIMESTAMPTZ DEFAULT now(),
  created_by_user_id UUID,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sales_prospects ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage prospects
CREATE POLICY "Super admins can manage prospects"
ON public.sales_prospects
FOR ALL
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_sales_prospects_updated_at
BEFORE UPDATE ON public.sales_prospects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();