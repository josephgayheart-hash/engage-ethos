-- Drop the old unique constraint on tenant_id only
ALTER TABLE public.content_dna_analysis DROP CONSTRAINT content_dna_analysis_tenant_id_key;

-- Add a proper unique constraint for tenant_id + profile_id combination
-- This allows one Content DNA analysis per profile, while supporting a tenant-level fallback (profile_id = null)
CREATE UNIQUE INDEX idx_content_dna_unique_tenant_profile 
ON public.content_dna_analysis(tenant_id, COALESCE(profile_id, '00000000-0000-0000-0000-000000000000'));