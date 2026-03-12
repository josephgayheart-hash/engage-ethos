-- Update the version trigger to auto-generate change_summary
CREATE OR REPLACE FUNCTION public.create_content_dna_version()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  next_version INTEGER;
  summary_parts TEXT[] := '{}';
  v_summary TEXT;
BEGIN
  -- Only create version if voice_analysis actually changed
  IF OLD.voice_analysis IS DISTINCT FROM NEW.voice_analysis 
     OR OLD.brand_platform IS DISTINCT FROM NEW.brand_platform
     OR OLD.custom_instructions IS DISTINCT FROM NEW.custom_instructions THEN
    
    -- Build change summary
    IF OLD.voice_analysis IS DISTINCT FROM NEW.voice_analysis THEN
      summary_parts := array_append(summary_parts, 'Voice analysis updated');
    END IF;
    
    IF OLD.brand_platform IS DISTINCT FROM NEW.brand_platform THEN
      IF OLD.brand_platform IS NULL AND NEW.brand_platform IS NOT NULL THEN
        summary_parts := array_append(summary_parts, 'Brand platform added');
      ELSE
        summary_parts := array_append(summary_parts, 'Brand platform updated');
      END IF;
    END IF;
    
    IF OLD.custom_instructions IS DISTINCT FROM NEW.custom_instructions THEN
      IF OLD.custom_instructions IS NULL AND NEW.custom_instructions IS NOT NULL THEN
        summary_parts := array_append(summary_parts, 'Custom instructions added');
      ELSIF NEW.custom_instructions IS NULL THEN
        summary_parts := array_append(summary_parts, 'Custom instructions removed');
      ELSE
        summary_parts := array_append(summary_parts, 'Custom instructions updated');
      END IF;
    END IF;
    
    IF OLD.sample_count IS DISTINCT FROM NEW.sample_count THEN
      IF NEW.sample_count > OLD.sample_count THEN
        summary_parts := array_append(summary_parts, 'Samples added (' || OLD.sample_count || ' → ' || NEW.sample_count || ')');
      ELSE
        summary_parts := array_append(summary_parts, 'Samples changed (' || OLD.sample_count || ' → ' || NEW.sample_count || ')');
      END IF;
    END IF;
    
    v_summary := array_to_string(summary_parts, '; ');
    IF v_summary = '' THEN
      v_summary := 'Content DNA updated';
    END IF;
    
    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
    FROM public.content_dna_versions
    WHERE content_dna_id = NEW.id;
    
    -- Insert version snapshot
    INSERT INTO public.content_dna_versions (
      content_dna_id,
      tenant_id,
      profile_id,
      version_number,
      voice_analysis,
      brand_platform,
      custom_instructions,
      sample_count,
      created_by_user_id,
      change_summary
    ) VALUES (
      NEW.id,
      NEW.tenant_id,
      NEW.profile_id,
      next_version,
      NEW.voice_analysis,
      NEW.brand_platform,
      NEW.custom_instructions,
      NEW.sample_count,
      auth.uid(),
      v_summary
    );
  END IF;
  
  RETURN NEW;
END;
$function$;