import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export type DraftType = 'message' | 'journey' | 'analysis' | 'image';

export interface UserDraft {
  id: string;
  user_id: string;
  tenant_id: string;
  draft_type: DraftType;
  title: string | null;
  draft_data: Json;
  created_at: string;
  updated_at: string;
  cover_image_url?: string | null;
}

export function useUserDrafts(draftType?: DraftType) {
  const { user, profile } = useAuth();
  const tenantId = profile?.tenant_id;
  const [drafts, setDrafts] = useState<UserDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDraft, setCurrentDraft] = useState<UserDraft | null>(null);

  // Fetch drafts
  const fetchDrafts = useCallback(async () => {
    if (!user || !tenantId) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('user_drafts')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (draftType) {
        query = query.eq('draft_type', draftType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDrafts((data as unknown as UserDraft[]) || []);
    } catch (error) {
      console.error('Error fetching drafts:', error);
    } finally {
      setLoading(false);
    }
  }, [user, tenantId, draftType]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // Save or update draft
  // silent: if true, don't refetch drafts list (for background auto-save)
  const saveDraft = useCallback(async (
    type: DraftType,
    data: Record<string, unknown>,
    title?: string,
    existingDraftId?: string,
    silent?: boolean
  ): Promise<UserDraft | null> => {
    if (!user || !tenantId) return null;

    try {
      if (existingDraftId) {
        // Update existing draft
        const { data: updated, error } = await supabase
          .from('user_drafts')
          .update({
            draft_data: data as unknown as Json,
            title: title || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingDraftId)
          .select()
          .single();

        if (error) throw error;
        
        const draft = updated as unknown as UserDraft;
        setCurrentDraft(draft);
        // Only refetch if not silent (background auto-save skips this)
        if (!silent) {
          await fetchDrafts();
        }
        return draft;
      } else {
        // Create new draft
        const { data: created, error } = await supabase
          .from('user_drafts')
          .insert({
            user_id: user.id,
            tenant_id: tenantId,
            draft_type: type,
            draft_data: data as unknown as Json,
            title: title || null
          })
          .select()
          .single();

        if (error) throw error;
        
        const draft = created as unknown as UserDraft;
        setCurrentDraft(draft);
        // Only refetch if not silent
        if (!silent) {
          await fetchDrafts();
        }

        // Fire-and-forget: generate cover image for new drafts
        if (draft.id && title) {
          const contextData = data?.context as Record<string, unknown> | undefined;
          supabase.functions.invoke('generate-cover-image', {
            body: {
              draftId: draft.id,
              title: title,
              audience: contextData?.audience,
              moment: contextData?.moment,
              channels: data?.selectedChannels,
              mode: type === 'journey' ? 'journey' : 'builder',
              tenantId: tenantId,
              profileId: data?.selectedProfileId,
            },
          }).then(() => {
            if (!silent) fetchDrafts();
          }).catch(err => console.warn('Draft cover image generation failed:', err));
        }

        return draft;
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      // Only show error toast if not silent
      if (!silent) {
        toast.error('Failed to save draft');
      }
      return null;
    }
  }, [user, tenantId, fetchDrafts]);

  // Delete draft
  const deleteDraft = useCallback(async (draftId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_drafts')
        .delete()
        .eq('id', draftId);

      if (error) throw error;

      if (currentDraft?.id === draftId) {
        setCurrentDraft(null);
      }
      
      await fetchDrafts();
      toast.success('Draft discarded');
      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft');
      return false;
    }
  }, [currentDraft, fetchDrafts]);

  // Load a specific draft by ID
  const loadDraft = useCallback((draftId: string): UserDraft | null => {
    const draft = drafts.find(d => d.id === draftId);
    if (draft) {
      setCurrentDraft(draft);
      return draft;
    }
    return null;
  }, [drafts]);

  // Fetch and load a draft by ID (async - fetches from DB if not in local state)
  const loadDraftById = useCallback(async (draftId: string): Promise<UserDraft | null> => {
    // First check local state
    const localDraft = drafts.find(d => d.id === draftId);
    if (localDraft) {
      setCurrentDraft(localDraft);
      return localDraft;
    }

    // If not found locally, fetch from database
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_drafts')
        .select('*')
        .eq('id', draftId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      const draft = data as unknown as UserDraft;
      setCurrentDraft(draft);
      return draft;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  }, [drafts, user]);

  // Clear current draft (after saving to library)
  const clearCurrentDraft = useCallback(async () => {
    if (currentDraft) {
      await deleteDraft(currentDraft.id);
    }
    setCurrentDraft(null);
  }, [currentDraft, deleteDraft]);

  // Check if there are unsaved drafts
  const hasUnsavedDrafts = drafts.length > 0;

  // Get most recent draft for a type
  const getMostRecentDraft = useCallback((type: DraftType): UserDraft | null => {
    return drafts.find(d => d.draft_type === type) || null;
  }, [drafts]);

  return {
    drafts,
    loading,
    currentDraft,
    setCurrentDraft,
    saveDraft,
    deleteDraft,
    loadDraft,
    loadDraftById,
    clearCurrentDraft,
    hasUnsavedDrafts,
    getMostRecentDraft,
    refetch: fetchDrafts
  };
}
