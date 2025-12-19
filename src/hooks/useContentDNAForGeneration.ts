import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { BrandPlatform } from '@/types/uplaybook';

export interface ContentDNAForGeneration {
  voiceAnalysis: {
    overallTone?: string;
    keyCharacteristics?: string[];
    vocabularyPatterns?: string[];
    sentenceStyle?: string;
    formalityLevel?: string;
    emotionalTone?: string;
    commonPhrases?: string[];
    messagingTactics?: string[];
    summary?: string;
  } | null;
  brandPlatform: BrandPlatform | null;
  customInstructions: string | null;
  sourceProfileId?: string | null;
  sourceProfileName?: string | null;
}

interface UseContentDNAForGenerationOptions {
  profileId?: string | null;
}

/**
 * Hook to fetch Content DNA for message generation.
 * This is a lightweight hook used by message generation components
 * to automatically apply the tenant's Content DNA profile.
 * 
 * Fallback hierarchy:
 * 1. Selected profile's DNA
 * 2. Parent profile's DNA (if selected profile is a sub-unit)
 * 3. Tenant-level DNA (profile_id = null)
 * 
 * @param options.profileId - Optional profile ID to fetch profile-specific Content DNA.
 *                            If not provided, will attempt to find tenant-level DNA.
 */
export function useContentDNAForGeneration(options: UseContentDNAForGenerationOptions = {}) {
  const { profileId } = options;
  const { tenant } = useAuth();
  const [contentDNA, setContentDNA] = useState<ContentDNAForGeneration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContentDNA = useCallback(async () => {
    if (!tenant?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // If a profileId is specified, look for that specific profile's DNA
      if (profileId) {
        // First, try to get the selected profile's DNA
        const { data, error } = await supabase
          .from('content_dna_analysis')
          .select('voice_analysis, brand_platform, custom_instructions')
          .eq('tenant_id', tenant.id)
          .eq('profile_id', profileId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching Content DNA:', error);
          setContentDNA(null);
          return;
        }
        
        if (data) {
          setContentDNA({
            voiceAnalysis: data.voice_analysis as ContentDNAForGeneration['voiceAnalysis'],
            brandPlatform: data.brand_platform as unknown as BrandPlatform | null,
            customInstructions: data.custom_instructions,
            sourceProfileId: profileId,
          });
          return;
        }

        // No DNA for this profile - check if it has a parent profile
        const { data: profileData } = await supabase
          .from('institutional_profiles')
          .select('parent_profile_id, name')
          .eq('id', profileId)
          .single();

        if (profileData?.parent_profile_id) {
          // Try to get parent profile's DNA
          const { data: parentDNA } = await supabase
            .from('content_dna_analysis')
            .select('voice_analysis, brand_platform, custom_instructions')
            .eq('tenant_id', tenant.id)
            .eq('profile_id', profileData.parent_profile_id)
            .maybeSingle();

          if (parentDNA) {
            // Get parent profile name for display
            const { data: parentProfile } = await supabase
              .from('institutional_profiles')
              .select('name')
              .eq('id', profileData.parent_profile_id)
              .single();

            setContentDNA({
              voiceAnalysis: parentDNA.voice_analysis as ContentDNAForGeneration['voiceAnalysis'],
              brandPlatform: parentDNA.brand_platform as unknown as BrandPlatform | null,
              customInstructions: parentDNA.custom_instructions,
              sourceProfileId: profileData.parent_profile_id,
              sourceProfileName: parentProfile?.name || null,
            });
            return;
          }
        }

        // If no DNA exists for this profile (or its parent), do NOT fall back to tenant-level.
        // This prevents one institution's DNA from "bleeding" into another when multiple universities exist in one tenant.
        setContentDNA(null);
      } else {
        // No profile selected - get tenant-level DNA
        const { data, error } = await supabase
          .from('content_dna_analysis')
          .select('voice_analysis, brand_platform, custom_instructions')
          .eq('tenant_id', tenant.id)
          .is('profile_id', null)
          .maybeSingle();

        if (error) {
          console.error('Error fetching Content DNA:', error);
          setContentDNA(null);
        } else if (data) {
          setContentDNA({
            voiceAnalysis: data.voice_analysis as ContentDNAForGeneration['voiceAnalysis'],
            brandPlatform: data.brand_platform as unknown as BrandPlatform | null,
            customInstructions: data.custom_instructions,
            sourceProfileId: null,
          });
        } else {
          setContentDNA(null);
        }
      }
    } catch (error) {
      console.error('Error fetching Content DNA:', error);
      setContentDNA(null);
    } finally {
      setIsLoading(false);
    }
  }, [tenant?.id, profileId]);

  useEffect(() => {
    fetchContentDNA();
  }, [fetchContentDNA]);

  return {
    contentDNA,
    isLoading,
    refetch: fetchContentDNA,
  };
}
