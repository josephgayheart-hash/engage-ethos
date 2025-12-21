-- Seed initial versions for existing content_dna_analysis records that don't have versions yet
INSERT INTO public.content_dna_versions (
  content_dna_id,
  tenant_id,
  profile_id,
  version_number,
  voice_analysis,
  brand_platform,
  custom_instructions,
  sample_count,
  change_summary
)
SELECT 
  cda.id,
  cda.tenant_id,
  cda.profile_id,
  1,
  cda.voice_analysis,
  cda.brand_platform,
  cda.custom_instructions,
  cda.sample_count,
  'Initial version (migrated from existing data)'
FROM public.content_dna_analysis cda
WHERE NOT EXISTS (
  SELECT 1 FROM public.content_dna_versions cdv 
  WHERE cdv.content_dna_id = cda.id
);