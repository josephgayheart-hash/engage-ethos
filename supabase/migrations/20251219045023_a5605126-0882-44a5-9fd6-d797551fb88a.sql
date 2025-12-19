-- Add profile_id column to content_dna_analysis to tie Content DNA to specific institutional profiles
ALTER TABLE public.content_dna_analysis 
ADD COLUMN profile_id uuid REFERENCES public.institutional_profiles(id) ON DELETE CASCADE;

-- Create an index for faster lookups by profile
CREATE INDEX idx_content_dna_analysis_profile_id ON public.content_dna_analysis(profile_id);

-- Drop the existing unique constraint on tenant_id (it's enforced via the one-to-one relationship)
-- Since the original constraint was implicit via the foreign key being one-to-one, 
-- we need to allow multiple rows per tenant (one per profile)

-- Create a new unique constraint for tenant_id + profile_id combination
-- This allows one Content DNA analysis per profile, while still supporting a tenant-level fallback (profile_id = null)
CREATE UNIQUE INDEX idx_content_dna_analysis_tenant_profile ON public.content_dna_analysis(tenant_id, COALESCE(profile_id, '00000000-0000-0000-0000-000000000000'));

-- Update RLS policies to account for profile-based access
-- Users can view Content DNA for profiles in their tenant
DROP POLICY IF EXISTS "Users can view their tenant DNA analysis" ON public.content_dna_analysis;
CREATE POLICY "Users can view their tenant DNA analysis"
ON public.content_dna_analysis
FOR SELECT
TO authenticated
USING (tenant_id = get_user_tenant_id(auth.uid()));

-- Admins can manage Content DNA for their tenant's profiles
DROP POLICY IF EXISTS "Admins can manage their tenant DNA analysis" ON public.content_dna_analysis;
CREATE POLICY "Admins can manage their tenant DNA analysis"
ON public.content_dna_analysis
FOR ALL
TO authenticated
USING (
  tenant_id = get_user_tenant_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  tenant_id = get_user_tenant_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin'::app_role)
);