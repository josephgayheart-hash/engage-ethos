import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveWorkspaceId } from '@/contexts/WorkspaceContext';
import { toastError, toastSuccess } from '@/lib/errors';
import { logDNAActivity } from '@/hooks/useContentDNAActivity';

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

export type FactCategory = string;

/** Higher-ed default categories */
export const HIGHER_ED_FACT_CATEGORIES: { value: string; label: string; icon: string }[] = [
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

/** Enterprise categories */
export const ENTERPRISE_FACT_CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: 'revenue', label: 'Revenue', icon: 'DollarSign' },
  { value: 'customers', label: 'Customers', icon: 'Users' },
  { value: 'market-share', label: 'Market Share', icon: 'TrendingUp' },
  { value: 'employees', label: 'Employees', icon: 'Building2' },
  { value: 'products', label: 'Products', icon: 'Award' },
  { value: 'innovation', label: 'Innovation', icon: 'FlaskConical' },
  { value: 'sustainability', label: 'Sustainability', icon: 'Heart' },
  { value: 'history', label: 'History', icon: 'Clock' },
  { value: 'locations', label: 'Locations', icon: 'Building2' },
  { value: 'financials', label: 'Financials', icon: 'Wallet' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal' },
];

/** Nonprofit categories */
export const NONPROFIT_FACT_CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: 'impact', label: 'Impact', icon: 'TrendingUp' },
  { value: 'beneficiaries', label: 'Beneficiaries', icon: 'Users' },
  { value: 'fundraising', label: 'Fundraising', icon: 'DollarSign' },
  { value: 'volunteers', label: 'Volunteers', icon: 'Heart' },
  { value: 'programs', label: 'Programs', icon: 'BookOpen' },
  { value: 'partnerships', label: 'Partnerships', icon: 'Building2' },
  { value: 'history', label: 'History', icon: 'Clock' },
  { value: 'financials', label: 'Financials', icon: 'Wallet' },
  { value: 'recognition', label: 'Recognition', icon: 'Award' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal' },
];

/** Healthcare categories */
export const HEALTHCARE_FACT_CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: 'patients', label: 'Patients Served', icon: 'Users' },
  { value: 'outcomes', label: 'Clinical Outcomes', icon: 'TrendingUp' },
  { value: 'specialties', label: 'Specialties', icon: 'Award' },
  { value: 'providers', label: 'Providers', icon: 'GraduationCap' },
  { value: 'facilities', label: 'Facilities', icon: 'Building2' },
  { value: 'research', label: 'Research', icon: 'FlaskConical' },
  { value: 'accreditation', label: 'Accreditation', icon: 'Trophy' },
  { value: 'history', label: 'History', icon: 'Clock' },
  { value: 'financials', label: 'Financials', icon: 'Wallet' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal' },
];

/** Financial categories */
export const FINANCIAL_FACT_CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: 'aum', label: 'Assets Under Management', icon: 'DollarSign' },
  { value: 'clients', label: 'Clients', icon: 'Users' },
  { value: 'performance', label: 'Performance', icon: 'TrendingUp' },
  { value: 'advisors', label: 'Advisors', icon: 'GraduationCap' },
  { value: 'products', label: 'Products & Services', icon: 'Award' },
  { value: 'locations', label: 'Locations', icon: 'Building2' },
  { value: 'compliance', label: 'Compliance', icon: 'Trophy' },
  { value: 'history', label: 'History', icon: 'Clock' },
  { value: 'financials', label: 'Financials', icon: 'Wallet' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal' },
];

/** Franchise categories */
export const FRANCHISE_FACT_CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: 'locations', label: 'Locations', icon: 'Building2' },
  { value: 'revenue', label: 'Revenue', icon: 'DollarSign' },
  { value: 'customers', label: 'Customers', icon: 'Users' },
  { value: 'franchisees', label: 'Franchisees', icon: 'Award' },
  { value: 'growth', label: 'Growth', icon: 'TrendingUp' },
  { value: 'satisfaction', label: 'Satisfaction', icon: 'Heart' },
  { value: 'menu-products', label: 'Menu / Products', icon: 'BookOpen' },
  { value: 'history', label: 'History', icon: 'Clock' },
  { value: 'financials', label: 'Financials', icon: 'Wallet' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal' },
];

import type { TenantType } from '@/types/industry';

const CATEGORY_REGISTRY: Record<string, { value: string; label: string; icon: string }[]> = {
  university: HIGHER_ED_FACT_CATEGORIES,
  agency: HIGHER_ED_FACT_CATEGORIES,
  enterprise: ENTERPRISE_FACT_CATEGORIES,
  franchise: FRANCHISE_FACT_CATEGORIES,
  nonprofit: NONPROFIT_FACT_CATEGORIES,
  healthcare: HEALTHCARE_FACT_CATEGORIES,
  financial: FINANCIAL_FACT_CATEGORIES,
};

/** Get fact categories for a tenant type. Falls back to higher-ed. */
export function getFactCategoriesForTenant(tenantType?: TenantType | string | null): { value: string; label: string; icon: string }[] {
  if (!tenantType) return HIGHER_ED_FACT_CATEGORIES;
  return CATEGORY_REGISTRY[tenantType] ?? HIGHER_ED_FACT_CATEGORIES;
}

/** @deprecated Use getFactCategoriesForTenant() instead */
export const FACT_CATEGORIES = HIGHER_ED_FACT_CATEGORIES;
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
      
      logDNAActivity(workspaceId, user.id, {
        section: 'facts', action: 'added', profileId: profileId || null,
        artifactName: input.label, metadata: { category: input.category },
      });
      
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
      
      logDNAActivity(workspaceId, user.id, {
        section: 'facts', action: 'imported', profileId: profileId || null,
        artifactCount: newFacts.length,
      });
      
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
      
      const deletedFact = facts.find(f => f.id === id);
      setFacts(prev => prev.filter(f => f.id !== id));
      
      if (workspaceId && user?.id) {
        logDNAActivity(workspaceId, user.id, {
          section: 'facts', action: 'removed', profileId: profileId || null,
          artifactName: deletedFact?.label,
        });
      }
      
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
