
-- Expand tenant_type enum to support enterprise industry verticals
ALTER TYPE public.tenant_type ADD VALUE IF NOT EXISTS 'enterprise';
ALTER TYPE public.tenant_type ADD VALUE IF NOT EXISTS 'franchise';
ALTER TYPE public.tenant_type ADD VALUE IF NOT EXISTS 'nonprofit';
ALTER TYPE public.tenant_type ADD VALUE IF NOT EXISTS 'healthcare';
ALTER TYPE public.tenant_type ADD VALUE IF NOT EXISTS 'financial';

-- Add industry_vertical column to tenants for more granular classification
-- This allows "enterprise" tenant_type with vertical like "manufacturing", "tech", "retail"
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS industry_vertical text;

-- Add industry_config JSONB column to tenants for industry-specific vocabulary overrides
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS industry_config jsonb DEFAULT '{}'::jsonb;

-- Comment for documentation
COMMENT ON COLUMN public.tenants.industry_vertical IS 'Granular industry classification within the tenant_type (e.g., manufacturing, retail, tech for enterprise)';
COMMENT ON COLUMN public.tenants.industry_config IS 'Industry-specific vocabulary and configuration overrides for the platform UI and AI prompts';
