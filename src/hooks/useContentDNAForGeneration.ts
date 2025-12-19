import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  customInstructions: string | null;
}

interface UseContentDNAForGenerationOptions {
  profileId?: string | null;
}

/**
 * Hook to fetch Content DNA for message generation.
 * This is a lightweight hook used by message generation components
 * to automatically apply the tenant's Content DNA profile.
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
    
    try {
      let query = supabase
        .from('content_dna_analysis')
        .select('voice_analysis, custom_instructions')
        .eq('tenant_id', tenant.id);

      // If a profileId is specified, look for that specific profile's DNA
      if (profileId) {
        query = query.eq('profile_id', profileId);
      } else {
        // Otherwise, try to get tenant-level (profile_id = null) DNA as fallback
        query = query.is('profile_id', null);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Error fetching Content DNA:', error);
        setContentDNA(null);
      } else if (data) {
        setContentDNA({
          voiceAnalysis: data.voice_analysis as ContentDNAForGeneration['voiceAnalysis'],
          customInstructions: data.custom_instructions,
        });
      } else {
        // If no profile-specific DNA found and we searched with a profileId,
        // try falling back to tenant-level DNA
        if (profileId) {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('content_dna_analysis')
            .select('voice_analysis, custom_instructions')
            .eq('tenant_id', tenant.id)
            .is('profile_id', null)
            .maybeSingle();
          
          if (!fallbackError && fallbackData) {
            setContentDNA({
              voiceAnalysis: fallbackData.voice_analysis as ContentDNAForGeneration['voiceAnalysis'],
              customInstructions: fallbackData.custom_instructions,
            });
            return;
          }
        }
        setContentDNA(null);
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
