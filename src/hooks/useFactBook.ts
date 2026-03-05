import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveWorkspaceId } from '@/contexts/WorkspaceContext';
import { toastError, toastSuccess } from '@/lib/errors';

export interface Fact {
  id: string;
  tenant_id: string;
  profile_id: string | null;
  category: string;
  subcategory: string | null;
  label: string;
  value: string;
  context: string | null;
  year: string | null;
  previous_value: string | null;
  change_direction: 'up' | 'down' | 'stable' | null;
  change_amount: string | null;
  source_document: string | null;
  source_url: string | null;
  as_of_date: string | null;
  display_format: 'number' | 'currency' | 'percentage' | 'ranking' | 'text';
  is_highlight: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by_user_id: string | null;
}

export type FactCategory = 
  | 'enrollment'
  | 'research'
  | 'rankings'
  | 'affordability'
  | 'outcomes'
  | 'diversity'
  | 'athletics'
  | 'history'
  | 'facilities'
  | 'financials'
  | 'faculty'
  | 'academics'
  | 'other';

export const FACT_CATEGORIES: { value: FactCategory; label: string; icon: string }[] = [
  { value: 'enrollment', label: 'Enrollment', icon: 'Users' },
  { value: 'research', label: 'Research', icon: 'FlaskConical' },
  { value: 'rankings', label: 'Rankings', icon: 'Award' },
  { value: 'affordability', label: 'Affordability', icon: 'DollarSign' },
  { value: 'outcomes', label: 'Outcomes', icon: 'TrendingUp' },
  { value: 'diversity', label: 'Diversity', icon: 'Heart' },
  { value: 'athletics', label: 'Athletics', icon: 'Trophy' },
  { value: 'history', label: 'History', icon: 'Clock' },
  { value: 'facilities', label: 'Facilities', icon: 'Building2' },
  { value: 'financials', label: 'Financials', icon: 'Wallet' },
  { value: 'faculty', label: 'Faculty', icon: 'GraduationCap' },
  { value: 'academics', label: 'Academics', icon: 'BookOpen' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal' },
];

export interface CreateFactInput {
  category: string;
  subcategory?: string;
  label: string;
  value: string;
  context?: string;
  year?: string;
  previous_value?: string;
  change_direction?: 'up' | 'down' | 'stable';
  change_amount?: string;
  source_document?: string;
  source_url?: string;
  as_of_date?: string;
  display_format?: Fact['display_format'];
  is_highlight?: boolean;
  sort_order?: number;
}

export interface UpdateFactInput extends Partial<CreateFactInput> {}

interface UseFactBookOptions {
  profileId?: string | null;
}

export function useFactBook(options: UseFactBookOptions = {}) {
  const { profileId } = options;
  const { tenant, user } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const [facts, setFacts] = useState<Fact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchFacts = useCallback(async () => {
    if (!workspaceId) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('fact_book')
        .select('*')
        .eq('tenant_id', workspaceId)
        .order('category')
        .order('sort_order')
        .order('created_at', { ascending: false });
      
      if (profileId) {
        query = query.eq('profile_id', profileId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setFacts((data || []) as unknown as Fact[]);
    } catch (error) {
      toastError('Error loading facts', error);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, profileId]);

  useEffect(() => {
    fetchFacts();
  }, [fetchFacts]);

  const addFact = async (input: CreateFactInput): Promise<Fact | null> => {
    if (!workspaceId || !user?.id) return null;
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('fact_book')
        .insert({
          tenant_id: workspaceId,
          profile_id: profileId || null,
          created_by_user_id: user.id,
          category: input.category,
          subcategory: input.subcategory || null,
          label: input.label,
          value: input.value,
          context: input.context || null,
          year: input.year || null,
          previous_value: input.previous_value || null,
          change_direction: input.change_direction || null,
          change_amount: input.change_amount || null,
          source_document: input.source_document || null,
          source_url: input.source_url || null,
          as_of_date: input.as_of_date || null,
          display_format: input.display_format || 'number',
          is_highlight: input.is_highlight || false,
          sort_order: input.sort_order || 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newFact = data as unknown as Fact;
      setFacts(prev => [newFact, ...prev]);
      
      toastSuccess('Fact added', `"${input.label}" has been added to your Fact Book.`);
      
      return newFact;
    } catch (error) {
      toastError('Error adding fact', error);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const addFactsBulk = async (inputs: CreateFactInput[]): Promise<number> => {
    if (!workspaceId || !user?.id) return 0;
    
    setIsSaving(true);
    try {
      const factsToInsert = inputs.map(input => ({
        tenant_id: workspaceId,
        profile_id: profileId || null,
        created_by_user_id: user.id,
        category: input.category,
        subcategory: input.subcategory || null,
        label: input.label,
        value: input.value,
        context: input.context || null,
        year: input.year || null,
        previous_value: input.previous_value || null,
        change_direction: input.change_direction || null,
        change_amount: input.change_amount || null,
        source_document: input.source_document || null,
        source_url: input.source_url || null,
        as_of_date: input.as_of_date || null,
        display_format: input.display_format || 'number',
        is_highlight: input.is_highlight || false,
        sort_order: input.sort_order || 0,
      }));
      
      const { data, error } = await supabase
        .from('fact_book')
        .insert(factsToInsert)
        .select();
      
      if (error) throw error;
      
      const newFacts = (data || []) as unknown as Fact[];
      setFacts(prev => [...newFacts, ...prev]);
      
      toastSuccess('Facts imported', `${newFacts.length} facts have been added to your Fact Book.`);
      
      return newFacts.length;
    } catch (error) {
      toastError('Error importing facts', error);
      return 0;
    } finally {
      setIsSaving(false);
    }
  };

  const updateFact = async (id: string, updates: UpdateFactInput): Promise<boolean> => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('fact_book')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setFacts(prev => prev.map(f => 
        f.id === id ? { ...f, ...updates, updated_at: new Date().toISOString() } : f
      ));
      
      toastSuccess('Fact updated', 'Your changes have been saved.');
      
      return true;
    } catch (error) {
      toastError('Error updating fact', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteFact = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('fact_book')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setFacts(prev => prev.filter(f => f.id !== id));
      
      toastSuccess('Fact deleted', 'The fact has been removed from your Fact Book.');
      
      return true;
    } catch (error) {
      toastError('Error deleting fact', error);
      return false;
    }
  };

  const deleteAllFacts = async (): Promise<boolean> => {
    if (!workspaceId) return false;
    
    try {
      let query = supabase
        .from('fact_book')
        .delete()
        .eq('tenant_id', workspaceId);
      
      if (profileId) {
        query = query.eq('profile_id', profileId);
      }
      
      const { error } = await query;
      
      if (error) throw error;
      
      setFacts([]);
      
      toastSuccess('All facts deleted', 'Your Fact Book has been cleared.');
      
      return true;
    } catch (error) {
      toastError('Error deleting facts', error);
      return false;
    }
  };

  const parseFactBookFromText = async (text: string, sourceDocument?: string): Promise<CreateFactInput[]> => {
    setIsParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-fact-book', {
        body: { text, sourceDocument },
      });
      
      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.facts || [];
    } catch (error) {
      toastError('Error parsing fact book', error);
      return [];
    } finally {
      setIsParsing(false);
    }
  };

  const toggleHighlight = async (id: string, highlight: boolean): Promise<boolean> => {
    return updateFact(id, { is_highlight: highlight });
  };

  const getHighlightedFacts = () => facts.filter(f => f.is_highlight);
  
  const getFactsByCategory = (category: string) => facts.filter(f => f.category === category);
  
  const getCategories = () => {
    const categories = [...new Set(facts.map(f => f.category))];
    return categories.sort();
  };

  return {
    facts,
    isLoading,
    isParsing,
    isSaving,
    addFact,
    addFactsBulk,
    updateFact,
    deleteFact,
    deleteAllFacts,
    parseFactBookFromText,
    toggleHighlight,
    getHighlightedFacts,
    getFactsByCategory,
    getCategories,
    refetch: fetchFacts,
  };
}
