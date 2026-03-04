import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { BrandPlatform, BrandPillar, BrandPathway } from '@/types/campusvoice';

export interface ContentDNASample {
  id: string;
  tenant_id: string;
  user_id: string;
  profile_id: string | null;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  content_text: string | null;
  sample_type: string;
  title: string | null;
  source_description: string | null;
  source_url: string | null;
  created_at: string;
  // Semantic extraction fields
  semantic_summary: string | null;
  key_themes: string[] | null;
  extraction_status: string | null;
  extracted_at: string | null;
}

export interface VoiceAnalysis {
  overallTone: string;
  keyCharacteristics: string[];
  vocabularyPatterns: string[];
  sentenceStyle: string;
  formalityLevel: string;
  emotionalTone: string;
  commonPhrases: string[];
  messagingTactics: string[];
  summary: string;
  analyzedAt?: string;
}

export interface ContentDNAAnalysis {
  id: string;
  tenant_id: string;
  profile_id: string | null;
  voice_analysis: VoiceAnalysis;
  brand_platform: BrandPlatform | null;
  custom_instructions: string | null;
  sample_count: number;
  last_analyzed_at: string | null;
  created_at: string;
  updated_at: string;
}

// DNA Adjustment types
export interface VoiceDimension {
  id: string;
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  description: string;
}

export interface SectionFeedback {
  id: string;
  section: string;
  feedback: string;
  timestamp: string;
}

export interface OverrideRule {
  id: string;
  type: 'always' | 'never' | 'prefer';
  rule: string;
}

export interface DNAAdjustments {
  dimensions: VoiceDimension[];
  sectionFeedback: SectionFeedback[];
  overrideRules: OverrideRule[];
}

export interface ContentDNAAdjustmentsRecord {
  id: string;
  content_dna_id: string;
  tenant_id: string;
  profile_id: string | null;
  dimensions: VoiceDimension[];
  section_feedback: SectionFeedback[];
  override_rules: OverrideRule[];
  created_at: string;
  updated_at: string;
  updated_by_user_id: string | null;
}

// Re-export brand platform types
export type { BrandPlatform, BrandPillar, BrandPathway };

interface UseContentDNAOptions {
  profileId?: string | null;
}

export function useContentDNA(options: UseContentDNAOptions = {}) {
  const { profileId } = options;
  const { tenant, profile } = useAuth();
  const { toast } = useToast();
  const [samples, setSamples] = useState<ContentDNASample[]>([]);
  const [analysis, setAnalysis] = useState<ContentDNAAnalysis | null>(null);
  const [adjustments, setAdjustments] = useState<ContentDNAAdjustmentsRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSavingAdjustments, setIsSavingAdjustments] = useState(false);

  const fetchSamples = useCallback(async () => {
    if (!tenant?.id) return;
    
    try {
      let query = supabase
        .from('content_dna_samples')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      // If a profileId is specified, filter by it
      if (profileId) {
        query = query.eq('profile_id', profileId);
      } else {
        // If no profileId, get samples without a profile (legacy/fallback)
        query = query.is('profile_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSamples((data || []) as ContentDNASample[]);
    } catch (error: any) {
      console.error('Error fetching samples:', error);
    }
  }, [tenant?.id, profileId]);

  const fetchAnalysis = useCallback(async () => {
    if (!tenant?.id) return;
    
    try {
      let query = supabase
        .from('content_dna_analysis')
        .select('*')
        .eq('tenant_id', tenant.id);

      // If a profileId is specified, filter by it
      if (profileId) {
        query = query.eq('profile_id', profileId);
      } else {
        // If no profileId, get analysis without a profile (legacy/fallback)
        query = query.is('profile_id', null);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      
      if (data) {
        setAnalysis({
          ...data,
          voice_analysis: data.voice_analysis as unknown as VoiceAnalysis,
          brand_platform: data.brand_platform as unknown as BrandPlatform | null,
        } as ContentDNAAnalysis);
      } else {
        setAnalysis(null);
      }
    } catch (error: any) {
      console.error('Error fetching analysis:', error);
    }
  }, [tenant?.id, profileId]);

  const fetchAdjustments = useCallback(async () => {
    if (!tenant?.id || !analysis?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('content_dna_adjustments')
        .select('*')
        .eq('content_dna_id', analysis.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setAdjustments({
          ...data,
          dimensions: (data.dimensions as unknown as VoiceDimension[]) || [],
          section_feedback: (data.section_feedback as unknown as SectionFeedback[]) || [],
          override_rules: (data.override_rules as unknown as OverrideRule[]) || [],
        } as ContentDNAAdjustmentsRecord);
      } else {
        setAdjustments(null);
      }
    } catch (error: any) {
      console.error('Error fetching adjustments:', error);
    }
  }, [tenant?.id, analysis?.id]);

  useEffect(() => {
    if (!tenant?.id) {
      // Keep isLoading true until tenant is available
      return;
    }
    
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchSamples(), fetchAnalysis()]);
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchSamples, fetchAnalysis, tenant?.id]);

  // Fetch adjustments when analysis is loaded
  useEffect(() => {
    if (analysis?.id) {
      fetchAdjustments();
    }
  }, [analysis?.id, fetchAdjustments]);

  const addSample = async (
    content: string,
    fileName: string,
    options: {
      sampleType?: string;
      title?: string;
      sourceDescription?: string;
      sourceUrl?: string;
      fileType?: string;
      fileSize?: number;
    } = {}
  ) => {
    if (!tenant?.id || !profile?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add samples',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('content_dna_samples')
        .insert({
          tenant_id: tenant.id,
          user_id: profile.id,
          profile_id: profileId || null,
          content_text: content,
          file_name: fileName,
          file_type: options.fileType || 'text/plain',
          file_size: options.fileSize || content.length,
          sample_type: options.sampleType || 'other',
          title: options.title || null,
          source_description: options.sourceDescription || null,
          source_url: options.sourceUrl || null,
        })
        .select()
        .single();

      if (error) throw error;

      setSamples(prev => [data as ContentDNASample, ...prev]);
      toast({
        title: 'Sample Added',
        description: 'Content sample has been saved.',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add sample',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteSample = async (sampleId: string) => {
    try {
      const { error } = await supabase
        .from('content_dna_samples')
        .delete()
        .eq('id', sampleId);

      if (error) throw error;

      setSamples(prev => prev.filter(s => s.id !== sampleId));
      toast({
        title: 'Sample Deleted',
        description: 'Content sample has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete sample',
        variant: 'destructive',
      });
    }
  };

  const analyzeVoice = async () => {
    if (!tenant?.id || samples.length === 0) {
      toast({
        title: 'Cannot Analyze',
        description: 'Add at least one content sample to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const sampleTexts = samples
        .filter(s => s.content_text)
        .map(s => s.content_text as string);

      if (sampleTexts.length === 0) {
        toast({
          title: 'No Content',
          description: 'Samples must have text content to analyze.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('analyze-voice', {
        body: { samples: sampleTexts }
      });

      if (error) throw error;

      // Handle new response format with both voiceAnalysis and brandPlatform
      const voiceAnalysis: VoiceAnalysis = data.voiceAnalysis || data;
      const brandPlatform: BrandPlatform | null = data.brandPlatform || null;

      // Build the upsert data
      const upsertData: any = {
        tenant_id: tenant.id,
        profile_id: profileId || null,
        voice_analysis: voiceAnalysis as any,
        brand_platform: brandPlatform as any,
        sample_count: sampleTexts.length,
        last_analyzed_at: new Date().toISOString(),
      };

      // Check if an analysis already exists for this profile
      let existingAnalysis = analysis;
      
      if (existingAnalysis) {
        // Update existing
        const { data: updatedData, error: updateError } = await supabase
          .from('content_dna_analysis')
          .update({
            voice_analysis: voiceAnalysis as any,
            brand_platform: brandPlatform as any,
            sample_count: sampleTexts.length,
            last_analyzed_at: new Date().toISOString(),
          })
          .eq('id', existingAnalysis.id)
          .select()
          .single();

        if (updateError) throw updateError;

        setAnalysis({
          ...updatedData,
          voice_analysis: updatedData.voice_analysis as unknown as VoiceAnalysis,
          brand_platform: updatedData.brand_platform as unknown as BrandPlatform | null,
        } as ContentDNAAnalysis);
      } else {
        // Insert new
        const { data: insertedData, error: insertError } = await supabase
          .from('content_dna_analysis')
          .insert(upsertData)
          .select()
          .single();

        if (insertError) throw insertError;

        setAnalysis({
          ...insertedData,
          voice_analysis: insertedData.voice_analysis as unknown as VoiceAnalysis,
          brand_platform: insertedData.brand_platform as unknown as BrandPlatform | null,
        } as ContentDNAAnalysis);
      }

      const brandPlatformMsg = brandPlatform?.brandPillars?.length 
        ? ` Extracted ${brandPlatform.brandPillars.length} brand pillars.`
        : '';

      toast({
        title: 'Analysis Complete',
        description: `Analyzed ${sampleTexts.length} samples. Your Content DNA profile has been updated.${brandPlatformMsg}`,
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze content samples',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateCustomInstructions = async (instructions: string) => {
    if (!tenant?.id) return;

    setIsSaving(true);
    try {
      if (analysis) {
        // Update existing
        const { data, error } = await supabase
          .from('content_dna_analysis')
          .update({
            custom_instructions: instructions,
          })
          .eq('id', analysis.id)
          .select()
          .single();

        if (error) throw error;

        setAnalysis({
          ...data,
          voice_analysis: data.voice_analysis as unknown as VoiceAnalysis,
          brand_platform: data.brand_platform as unknown as BrandPlatform | null,
        } as ContentDNAAnalysis);
      } else {
        // Create new analysis with just custom instructions
        const { data, error } = await supabase
          .from('content_dna_analysis')
          .insert({
            tenant_id: tenant.id,
            profile_id: profileId || null,
            custom_instructions: instructions,
            voice_analysis: {},
            sample_count: 0,
          })
          .select()
          .single();

        if (error) throw error;

        setAnalysis({
          ...data,
          voice_analysis: data.voice_analysis as unknown as VoiceAnalysis,
          brand_platform: data.brand_platform as unknown as BrandPlatform | null,
        } as ContentDNAAnalysis);
      }

      toast({
        title: 'Instructions Saved',
        description: 'Your custom brand guidelines have been updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save instructions',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateBrandPlatform = async (brandPlatform: BrandPlatform) => {
    if (!tenant?.id || !analysis) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('content_dna_analysis')
        .update({
          brand_platform: brandPlatform as any,
        })
        .eq('id', analysis.id)
        .select()
        .single();

      if (error) throw error;

      setAnalysis({
        ...data,
        voice_analysis: data.voice_analysis as unknown as VoiceAnalysis,
        brand_platform: data.brand_platform as unknown as BrandPlatform | null,
      } as ContentDNAAnalysis);

      toast({
        title: 'Brand Platform Saved',
        description: 'Your brand platform has been updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save brand platform',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetContentDNA = async () => {
    if (!analysis?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('content_dna_analysis')
        .delete()
        .eq('id', analysis.id);

      if (error) throw error;

      setAnalysis(null);
      toast({
        title: 'Content DNA Reset',
        description: 'Your Content DNA has been cleared. Upload new samples to start fresh.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset Content DNA',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Extract semantic summaries from samples
  const extractSemantics = async (sampleIds?: string[]) => {
    const idsToExtract = sampleIds || samples
      .filter(s => s.extraction_status !== 'completed' && s.content_text)
      .map(s => s.id);

    if (idsToExtract.length === 0) {
      toast({
        title: 'No Samples to Process',
        description: 'All samples already have semantic extraction completed.',
      });
      return;
    }

    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-semantics', {
        body: { batchIds: idsToExtract }
      });

      if (error) throw error;

      await fetchSamples(); // Refresh to get updated extraction status

      const { summary } = data;
      toast({
        title: 'Extraction Complete',
        description: `Processed ${summary.succeeded} of ${summary.total} samples.${summary.failed > 0 ? ` ${summary.failed} failed.` : ''}`,
      });
    } catch (error: any) {
      console.error('Extraction error:', error);
      toast({
        title: 'Extraction Failed',
        description: error.message || 'Failed to extract semantics from samples',
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Search samples by semantic content
  const searchSamples = async (query: string, themes?: string[], limit: number = 10) => {
    if (!tenant?.id) return [];

    try {
      const { data, error } = await supabase.rpc('search_content_samples', {
        p_tenant_id: tenant.id,
        p_profile_id: profileId || null,
        p_search_query: query || null,
        p_themes: themes || null,
        p_limit: limit,
      });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Search error:', error);
      return [];
    }
  };

  // Save DNA adjustments (sliders, feedback, rules)
  const saveAdjustments = async (newAdjustments: DNAAdjustments) => {
    if (!tenant?.id || !analysis?.id || !profile?.id) {
      toast({
        title: 'Error',
        description: 'You must have an analyzed Content DNA to save adjustments',
        variant: 'destructive',
      });
      return null;
    }

    setIsSavingAdjustments(true);
    try {
      const adjustmentData = {
        content_dna_id: analysis.id,
        tenant_id: tenant.id,
        profile_id: profileId || null,
        dimensions: newAdjustments.dimensions as unknown as any,
        section_feedback: newAdjustments.sectionFeedback as unknown as any,
        override_rules: newAdjustments.overrideRules as unknown as any,
        updated_by_user_id: profile.id,
      };

      if (adjustments?.id) {
        // Update existing
        const { data, error } = await supabase
          .from('content_dna_adjustments')
          .update(adjustmentData)
          .eq('id', adjustments.id)
          .select()
          .single();

        if (error) throw error;

        setAdjustments({
          ...data,
          dimensions: (data.dimensions as unknown as VoiceDimension[]) || [],
          section_feedback: (data.section_feedback as unknown as SectionFeedback[]) || [],
          override_rules: (data.override_rules as unknown as OverrideRule[]) || [],
        } as ContentDNAAdjustmentsRecord);
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('content_dna_adjustments')
          .insert(adjustmentData)
          .select()
          .single();

        if (error) throw error;

        setAdjustments({
          ...data,
          dimensions: (data.dimensions as unknown as VoiceDimension[]) || [],
          section_feedback: (data.section_feedback as unknown as SectionFeedback[]) || [],
          override_rules: (data.override_rules as unknown as OverrideRule[]) || [],
        } as ContentDNAAdjustmentsRecord);
      }

      toast({
        title: 'Adjustments Saved',
        description: 'Your DNA tuning adjustments have been saved and will be applied to future message generation.',
      });
      return adjustments;
    } catch (error: any) {
      console.error('Error saving adjustments:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save adjustments',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSavingAdjustments(false);
    }
  };

  // Get extraction stats
  const extractionStats = {
    total: samples.length,
    completed: samples.filter(s => s.extraction_status === 'completed').length,
    pending: samples.filter(s => s.extraction_status === 'pending' || !s.extraction_status).length,
    failed: samples.filter(s => s.extraction_status === 'failed').length,
  };

  // Update sample metadata
  const updateSample = async (sampleId: string, updates: {
    title?: string;
    sample_type?: string;
    source_description?: string;
  }) => {
    if (!tenant?.id) return;

    try {
      const { error } = await supabase
        .from('content_dna_samples')
        .update(updates)
        .eq('id', sampleId)
        .eq('tenant_id', tenant.id);

      if (error) throw error;

      // Update local state
      setSamples(prev => prev.map(s => 
        s.id === sampleId ? { ...s, ...updates } : s
      ));

      toast({
        title: 'Sample Updated',
        description: 'The sample metadata has been updated.',
      });
    } catch (error: any) {
      console.error('Error updating sample:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update sample',
        variant: 'destructive',
      });
    }
  };

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchSamples(), fetchAnalysis()]);
    setIsLoading(false);
  }, [fetchSamples, fetchAnalysis]);

  return {
    samples,
    analysis,
    adjustments,
    isLoading,
    isAnalyzing,
    isSaving,
    isExtracting,
    isSavingAdjustments,
    extractionStats,
    addSample,
    deleteSample,
    updateSample,
    analyzeVoice,
    updateCustomInstructions,
    updateBrandPlatform,
    resetContentDNA,
    extractSemantics,
    searchSamples,
    saveAdjustments,
    refetch,
  };
}
