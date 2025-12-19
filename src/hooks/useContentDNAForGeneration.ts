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

/**
 * Hook to fetch Content DNA for message generation.
 * This is a lightweight hook used by message generation components
 * to automatically apply the tenant's Content DNA profile.
 */
export function useContentDNAForGeneration() {
  const { tenant } = useAuth();
  const [contentDNA, setContentDNA] = useState<ContentDNAForGeneration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContentDNA = useCallback(async () => {
    if (!tenant?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('content_dna_analysis')
        .select('voice_analysis, custom_instructions')
        .eq('tenant_id', tenant.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching Content DNA:', error);
        setContentDNA(null);
      } else if (data) {
        setContentDNA({
          voiceAnalysis: data.voice_analysis as ContentDNAForGeneration['voiceAnalysis'],
          customInstructions: data.custom_instructions,
        });
      } else {
        setContentDNA(null);
      }
    } catch (error) {
      console.error('Error fetching Content DNA:', error);
      setContentDNA(null);
    } finally {
      setIsLoading(false);
    }
  }, [tenant?.id]);

  useEffect(() => {
    fetchContentDNA();
  }, [fetchContentDNA]);

  return {
    contentDNA,
    isLoading,
    refetch: fetchContentDNA,
  };
}
