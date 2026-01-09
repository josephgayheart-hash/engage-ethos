-- Create story_bank table
CREATE TABLE public.story_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  profile_id UUID REFERENCES institutional_profiles(id),
  
  -- Story Content
  title TEXT NOT NULL,
  story_type TEXT NOT NULL, -- 'student', 'alumni', 'donor', 'faculty', 'staff', 'community'
  narrative TEXT NOT NULL,
  pull_quote TEXT,
  
  -- Subject Information
  subject_name TEXT,
  subject_role TEXT,
  subject_image_url TEXT,
  
  -- Categorization
  themes TEXT[] DEFAULT '{}',
  programs TEXT[] DEFAULT '{}',
  campaigns TEXT[] DEFAULT '{}',
  
  -- Usage Tracking
  usage_contexts TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  
  -- Metadata
  source_url TEXT,
  source_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by_user_id UUID
);

-- Create fact_book table
CREATE TABLE public.fact_book (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  profile_id UUID REFERENCES institutional_profiles(id),
  
  -- Fact Content
  category TEXT NOT NULL,
  subcategory TEXT,
  
  -- The Fact
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  context TEXT,
  year TEXT,
  
  -- Trend Data
  previous_value TEXT,
  change_direction TEXT,
  change_amount TEXT,
  
  -- Sourcing
  source_document TEXT,
  source_url TEXT,
  as_of_date DATE,
  
  -- Display
  display_format TEXT DEFAULT 'number',
  is_highlight BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by_user_id UUID
);

-- Enable RLS
ALTER TABLE public.story_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_book ENABLE ROW LEVEL SECURITY;

-- Story Bank RLS Policies
CREATE POLICY "Users can view stories in their tenant"
ON public.story_bank FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can create stories in their tenant"
ON public.story_bank FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can update stories in their tenant"
ON public.story_bank FOR UPDATE
USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete stories in their tenant"
ON public.story_bank FOR DELETE
USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admins can view all stories"
ON public.story_bank FOR SELECT
USING (is_super_admin(auth.uid()));

-- Fact Book RLS Policies
CREATE POLICY "Users can view facts in their tenant"
ON public.fact_book FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can create facts in their tenant"
ON public.fact_book FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can update facts in their tenant"
ON public.fact_book FOR UPDATE
USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete facts in their tenant"
ON public.fact_book FOR DELETE
USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admins can view all facts"
ON public.fact_book FOR SELECT
USING (is_super_admin(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_story_bank_tenant_profile ON public.story_bank(tenant_id, profile_id);
CREATE INDEX idx_story_bank_type ON public.story_bank(story_type);
CREATE INDEX idx_story_bank_featured ON public.story_bank(is_featured) WHERE is_featured = true;

CREATE INDEX idx_fact_book_tenant_profile ON public.fact_book(tenant_id, profile_id);
CREATE INDEX idx_fact_book_category ON public.fact_book(category);
CREATE INDEX idx_fact_book_highlight ON public.fact_book(is_highlight) WHERE is_highlight = true;

-- Update triggers
CREATE TRIGGER update_story_bank_updated_at
BEFORE UPDATE ON public.story_bank
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fact_book_updated_at
BEFORE UPDATE ON public.fact_book
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();