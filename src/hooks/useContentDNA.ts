import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ContentDNASample {
  id: string;
  tenant_id: string;
  user_id: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  content_text: string | null;
  sample_type: string;
  title: string | null;
  source_description: string | null;
  created_at: string;
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
  voice_analysis: VoiceAnalysis;
  custom_instructions: string | null;
  sample_count: number;
  last_analyzed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useContentDNA() {
  const { tenant, profile } = useAuth();
  const { toast } = useToast();
  const [samples, setSamples] = useState<ContentDNASample[]>([]);
  const [analysis, setAnalysis] = useState<ContentDNAAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSamples = useCallback(async () => {
    if (!tenant?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('content_dna_samples')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSamples((data || []) as ContentDNASample[]);
    } catch (error: any) {
      console.error('Error fetching samples:', error);
    }
  }, [tenant?.id]);

  const fetchAnalysis = useCallback(async () => {
    if (!tenant?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('content_dna_analysis')
        .select('*')
        .eq('tenant_id', tenant.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setAnalysis({
          ...data,
          voice_analysis: data.voice_analysis as unknown as VoiceAnalysis
        } as ContentDNAAnalysis);
      }
    } catch (error: any) {
      console.error('Error fetching analysis:', error);
    }
  }, [tenant?.id]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchSamples(), fetchAnalysis()]);
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchSamples, fetchAnalysis]);

  const addSample = async (
    content: string,
    fileName: string,
    options: {
      sampleType?: string;
      title?: string;
      sourceDescription?: string;
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
          content_text: content,
          file_name: fileName,
          file_type: options.fileType || 'text/plain',
          file_size: options.fileSize || content.length,
          sample_type: options.sampleType || 'other',
          title: options.title || null,
          source_description: options.sourceDescription || null,
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

      const voiceAnalysis: VoiceAnalysis = data;

      // Upsert the analysis
      const { data: upsertedData, error: upsertError } = await supabase
        .from('content_dna_analysis')
        .upsert({
          tenant_id: tenant.id,
          voice_analysis: voiceAnalysis as any,
          sample_count: sampleTexts.length,
          last_analyzed_at: new Date().toISOString(),
        }, {
          onConflict: 'tenant_id'
        })
        .select()
        .single();

      if (upsertError) throw upsertError;

      setAnalysis({
        ...upsertedData,
        voice_analysis: upsertedData.voice_analysis as unknown as VoiceAnalysis
      } as ContentDNAAnalysis);

      toast({
        title: 'Analysis Complete',
        description: `Analyzed ${sampleTexts.length} samples. Your Content DNA profile has been updated.`,
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
      const { data, error } = await supabase
        .from('content_dna_analysis')
        .upsert({
          tenant_id: tenant.id,
          custom_instructions: instructions,
          voice_analysis: analysis?.voice_analysis || {},
          sample_count: analysis?.sample_count || 0,
        }, {
          onConflict: 'tenant_id'
        })
        .select()
        .single();

      if (error) throw error;

      setAnalysis({
        ...data,
        voice_analysis: data.voice_analysis as unknown as VoiceAnalysis
      } as ContentDNAAnalysis);

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

  return {
    samples,
    analysis,
    isLoading,
    isAnalyzing,
    isSaving,
    addSample,
    deleteSample,
    analyzeVoice,
    updateCustomInstructions,
    refetch: async () => {
      await Promise.all([fetchSamples(), fetchAnalysis()]);
    }
  };
}
