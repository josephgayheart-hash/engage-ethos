-- Create table to track tool usage events per user/tenant
CREATE TABLE public.tool_usage_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  tool_name TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'use',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_tool_usage_tenant_id ON public.tool_usage_events(tenant_id);
CREATE INDEX idx_tool_usage_created_at ON public.tool_usage_events(created_at DESC);
CREATE INDEX idx_tool_usage_tool_name ON public.tool_usage_events(tool_name);

-- Enable RLS
ALTER TABLE public.tool_usage_events ENABLE ROW LEVEL SECURITY;

-- Policies: Users can insert their own events, super admins can see all
CREATE POLICY "Users can insert their own tool usage"
ON public.tool_usage_events
FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can view own tenant usage or super admins can view all"
ON public.tool_usage_events
FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_super_admin(auth.uid()));

-- Create table to store Content DNA samples (files uploaded for voice analysis)
CREATE TABLE public.content_dna_samples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  profile_id UUID REFERENCES public.institutional_profiles(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  content_text TEXT,
  source_type TEXT DEFAULT 'upload', -- 'upload' or 'paste'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_dna_tenant_id ON public.content_dna_samples(tenant_id);
CREATE INDEX idx_content_dna_created_at ON public.content_dna_samples(created_at DESC);

ALTER TABLE public.content_dna_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their tenant content DNA samples"
ON public.content_dna_samples
FOR ALL
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Super admins can view all content DNA samples"
ON public.content_dna_samples
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Create table to store BYOC uploads
CREATE TABLE public.byoc_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  content_text TEXT,
  tags TEXT[] DEFAULT '{}',
  evaluation_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_byoc_tenant_id ON public.byoc_uploads(tenant_id);
CREATE INDEX idx_byoc_created_at ON public.byoc_uploads(created_at DESC);

ALTER TABLE public.byoc_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their tenant BYOC uploads"
ON public.byoc_uploads
FOR ALL
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Super admins can view all BYOC uploads"
ON public.byoc_uploads
FOR SELECT
USING (is_super_admin(auth.uid()));