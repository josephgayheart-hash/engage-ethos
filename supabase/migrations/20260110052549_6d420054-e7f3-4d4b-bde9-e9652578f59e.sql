-- Create enum for tenant types
CREATE TYPE public.tenant_type AS ENUM ('university', 'agency');

-- Add tenant_type column with default for existing tenants
ALTER TABLE public.tenants 
ADD COLUMN tenant_type public.tenant_type NOT NULL DEFAULT 'university';

-- Add agency-specific fields to tenants
ALTER TABLE public.tenants
ADD COLUMN client_limit INTEGER DEFAULT NULL,
ADD COLUMN agency_website TEXT DEFAULT NULL,
ADD COLUMN agency_contact_email TEXT DEFAULT NULL;

-- Add request_type to onboarding_requests for distinguishing university vs agency applications
ALTER TABLE public.onboarding_requests
ADD COLUMN request_type TEXT NOT NULL DEFAULT 'university' 
  CHECK (request_type IN ('university', 'agency'));

-- Add agency-specific fields to onboarding_requests
ALTER TABLE public.onboarding_requests
ADD COLUMN agency_name TEXT DEFAULT NULL,
ADD COLUMN agency_website TEXT DEFAULT NULL,
ADD COLUMN estimated_client_count INTEGER DEFAULT NULL;

-- Add client_status to institutional_profiles for agency client management
ALTER TABLE public.institutional_profiles
ADD COLUMN client_status TEXT DEFAULT 'active' 
  CHECK (client_status IN ('active', 'paused', 'archived'));

-- Add institutional_profile_id to user_drafts for per-client draft tagging
ALTER TABLE public.user_drafts
ADD COLUMN institutional_profile_id UUID REFERENCES public.institutional_profiles(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_tenants_tenant_type ON public.tenants(tenant_type);
CREATE INDEX idx_onboarding_requests_request_type ON public.onboarding_requests(request_type);
CREATE INDEX idx_institutional_profiles_client_status ON public.institutional_profiles(client_status);
CREATE INDEX idx_user_drafts_profile_id ON public.user_drafts(institutional_profile_id);