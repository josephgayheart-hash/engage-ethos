import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveWorkspaceId } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { logDNAActivity } from '@/hooks/useContentDNAActivity';
import { useIndustry } from '@/contexts/IndustryContext';

export interface Story {
  id: string;
  tenant_id: string;
  profile_id: string | null;
  title: string;
  story_type: string;
  narrative: string;
  pull_quote: string | null;
  subject_name: string | null;
  subject_role: string | null;
  subject_image_url: string | null;
  themes: string[];
  programs: string[];
  campaigns: string[];
  usage_contexts: string[];
  is_featured: boolean;
  is_approved: boolean;
  source_url: string | null;
  source_description: string | null;
  created_at: string;
  updated_at: string;
  created_by_user_id: string | null;
}

/** Story type is now a dynamic string determined by industry vocabulary */
export type StoryType = string;

export interface CreateStoryInput {
  title: string;
  story_type: StoryType;
  narrative: string;
  pull_quote?: string;
  subject_name?: string;
  subject_role?: string;
  themes?: string[];
  programs?: string[];
  campaigns?: string[];
  is_featured?: boolean;
  source_url?: string;
  source_description?: string;
}

export interface UpdateStoryInput extends Partial<CreateStoryInput> {
  is_approved?: boolean;
}

interface UseStoryBankOptions {
  profileId?: string | null;
}

export function useStoryBank(options: UseStoryBankOptions = {}) {
  const { profileId } = options;
  const { tenant, user } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const { toast } = useToast();
  const { labels, storyTypes } = useIndustry();
  
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchStories = useCallback(async () => {
    if (!workspaceId) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('story_bank')
        .select('*')
        .eq('tenant_id', workspaceId)
        .order('created_at', { ascending: false });
      
      if (profileId) {
        query = query.eq('profile_id', profileId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Type assertion since we know the structure matches
      setStories((data || []) as unknown as Story[]);
    } catch (error: any) {
      console.error('Error fetching stories:', error);
      toast({
        title: 'Error loading stories',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, profileId, toast]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const addStory = async (input: CreateStoryInput): Promise<Story | null> => {
    if (!workspaceId || !user?.id) return null;
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('story_bank')
        .insert({
          tenant_id: workspaceId,
          profile_id: profileId || null,
          created_by_user_id: user.id,
          title: input.title,
          story_type: input.story_type,
          narrative: input.narrative,
          pull_quote: input.pull_quote || null,
          subject_name: input.subject_name || null,
          subject_role: input.subject_role || null,
          themes: input.themes || [],
          programs: input.programs || [],
          campaigns: input.campaigns || [],
          is_featured: input.is_featured || false,
          source_url: input.source_url || null,
          source_description: input.source_description || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newStory = data as unknown as Story;
      setStories(prev => [newStory, ...prev]);
      
      logDNAActivity(workspaceId, user.id, {
        section: 'stories', action: 'added', profileId: profileId || null,
        artifactName: input.title, metadata: { story_type: input.story_type },
      });
      
      toast({
        title: 'Story added',
        description: `"${input.title}" has been added to your Story Bank.`,
      });
      
      return newStory;
    } catch (error: any) {
      console.error('Error adding story:', error);
      toast({
        title: 'Error adding story',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const updateStory = async (id: string, updates: UpdateStoryInput): Promise<boolean> => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('story_bank')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setStories(prev => prev.map(s => 
        s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
      ));
      
      if (workspaceId && user?.id) {
        const story = stories.find(s => s.id === id);
        logDNAActivity(workspaceId, user.id, {
          section: 'stories', action: 'updated', profileId: profileId || null,
          artifactName: story?.title || updates.title,
        });
      }
      
      toast({
        title: 'Story updated',
        description: 'Your changes have been saved.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating story:', error);
      toast({
        title: 'Error updating story',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteStory = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('story_bank')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      const deletedStory = stories.find(s => s.id === id);
      setStories(prev => prev.filter(s => s.id !== id));
      
      if (workspaceId && user?.id) {
        logDNAActivity(workspaceId, user.id, {
          section: 'stories', action: 'removed', profileId: profileId || null,
          artifactName: deletedStory?.title,
        });
      }
      
      toast({
        title: 'Story deleted',
        description: 'The story has been removed from your Story Bank.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting story:', error);
      toast({
        title: 'Error deleting story',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteAllStories = async (): Promise<boolean> => {
    if (!workspaceId) return false;
    
    try {
      let query = supabase
        .from('story_bank')
        .delete()
        .eq('tenant_id', workspaceId);
      
      if (profileId) {
        query = query.eq('profile_id', profileId);
      }
      
      const { error } = await query;
      
      if (error) throw error;
      
      setStories([]);
      
      toast({
        title: 'All stories deleted',
        description: 'Your Story Bank has been cleared.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting all stories:', error);
      toast({
        title: 'Error deleting stories',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const parseStoryFromText = async (text: string, sourceUrl?: string): Promise<CreateStoryInput | null> => {
    setIsParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-story', {
        body: { text, sourceUrl },
      });
      
      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data as CreateStoryInput;
    } catch (error: any) {
      console.error('Error parsing story:', error);
      toast({
        title: 'Error parsing story',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsParsing(false);
    }
  };

  const scrapeAndParseStory = async (url: string): Promise<CreateStoryInput | null> => {
    setIsParsing(true);
    try {
      // First, scrape the URL using firecrawl
      const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke('firecrawl-scrape', {
        body: { 
          url, 
          options: { 
            formats: ['markdown'],
            onlyMainContent: true 
          } 
        },
      });
      
      if (scrapeError) throw scrapeError;
      
      if (!scrapeData?.success) {
        throw new Error(scrapeData?.error || 'Failed to scrape URL');
      }
      
      const markdown = scrapeData.data?.markdown || scrapeData.markdown;
      if (!markdown) {
        throw new Error('No content found at this URL');
      }
      
      // Then parse the scraped content as a story
      const { data, error } = await supabase.functions.invoke('parse-story', {
        body: { 
          text: markdown, 
          sourceUrl: url,
          sourceTitle: scrapeData.data?.metadata?.title || scrapeData.metadata?.title
        },
      });
      
      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return {
        ...data,
        source_url: url,
        source_description: scrapeData.data?.metadata?.title || scrapeData.metadata?.title || 'Scraped from URL',
      } as CreateStoryInput;
    } catch (error: any) {
      console.error('Error scraping and parsing story:', error);
      toast({
        title: 'Error importing from URL',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsParsing(false);
    }
  };

  const toggleFeatured = async (id: string, featured: boolean): Promise<boolean> => {
    return updateStory(id, { is_featured: featured });
  };

  const getFeaturedStories = () => stories.filter(s => s.is_featured && s.is_approved);
  
  const getStoriesByType = (type: StoryType) => stories.filter(s => s.story_type === type);

  return {
    stories,
    isLoading,
    isParsing,
    isSaving,
    addStory,
    updateStory,
    deleteStory,
    deleteAllStories,
    parseStoryFromText,
    scrapeAndParseStory,
    toggleFeatured,
    getFeaturedStories,
    getStoriesByType,
    refetch: fetchStories,
  };
}
