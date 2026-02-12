import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToolTracking } from '@/hooks/useToolTracking';
import type { SharedTemplate, LibraryFilters, LibraryEntryStatus } from '@/types/library';

export function useSharedLibrary() {
  const [templates, setTemplates] = useState<SharedTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile, user } = useAuth();
  const { trackToolUse } = useToolTracking();

  // Load templates from database
  const loadTemplates = useCallback(async () => {
    if (!user) {
      setTemplates([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shared_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch shared templates:', error);
        setIsLoading(false);
        return;
      }

      const mapped: SharedTemplate[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        intentStatement: row.intent_statement || '',
        useCases: (row.use_cases as any) || { whenToUse: [], whenNotToUse: [] },
        content: row.content,
        placeholders: (row.placeholders as any[]) || [],
        requiredFields: (row.required_fields as any) || { audience: [], moment: [], channel: [] },
        variants: (row.variants as any[]) || [],
        ethicalGuardrails: row.ethical_guardrails || [],
        owner: row.owner || '',
        maintainer: row.maintainer || '',
        collegeName: (row as any).college_name || undefined,
        departmentName: (row as any).department_name || undefined,
        status: row.status as LibraryEntryStatus,
        version: row.version || '1.0',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        approvalNotes: row.approval_notes || undefined,
        changeHistory: ((row as any).change_history as any[]) || [],
        playbook: row.playbook || undefined,
        institutionalProfileId: (row as any).institutional_profile_id || undefined,
        source: ((row as any).source as any) || undefined,
        tags: (row as any).tags || [],
        createdByUserId: row.created_by_user_id || undefined,
        createdByName: (row as any).created_by_name || undefined,
      }));

      setTemplates(mapped);
    } catch (err) {
      console.error('Error loading shared templates:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const filterTemplates = useCallback((filters: LibraryFilters): SharedTemplate[] => {
    let filtered = [...templates];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchLower) ||
        t.intentStatement.toLowerCase().includes(searchLower) ||
        t.content.toLowerCase().includes(searchLower) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.playbook) {
      filtered = filtered.filter(t => t.playbook === filters.playbook);
    }

    if (filters.channel) {
      filtered = filtered.filter(t => t.requiredFields.channel.includes(filters.channel!));
    }

    if (filters.audience) {
      filtered = filtered.filter(t => t.requiredFields.audience.includes(filters.audience!));
    }

    if (filters.tag) {
      filtered = filtered.filter(t => t.tags && t.tags.includes(filters.tag!));
    }

    return filtered;
  }, [templates]);

  const getPlaybooks = useCallback((): string[] => {
    const playbooks = new Set<string>();
    templates.forEach(t => {
      if (t.playbook) playbooks.add(t.playbook);
    });
    return Array.from(playbooks);
  }, [templates]);

  const getAllTags = useCallback((): string[] => {
    const tags = new Set<string>();
    templates.forEach(t => {
      if (t.tags) t.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [templates]);

  const getTemplateById = useCallback((id: string): SharedTemplate | undefined => {
    return templates.find(t => t.id === id);
  }, [templates]);

  const updateTemplateStatus = useCallback(async (id: string, status: LibraryEntryStatus, notes?: string) => {
    const { error } = await supabase
      .from('shared_templates')
      .update({
        status,
        approval_notes: notes || null,
      })
      .eq('id', id);

    if (error) {
      console.error('Failed to update template status:', error);
      return;
    }

    // Refresh from DB
    await loadTemplates();
  }, [loadTemplates]);

  const addTemplate = useCallback(async (template: Omit<SharedTemplate, 'id' | 'createdAt' | 'updatedAt' | 'changeHistory'>) => {
    if (!profile) return null;

    const createdByName = `${profile.first_name} ${profile.last_name}`;

    const { data, error } = await supabase
      .from('shared_templates')
      .insert({
        tenant_id: profile.tenant_id,
        title: template.title,
        intent_statement: template.intentStatement,
        content: template.content,
        use_cases: template.useCases as any,
        placeholders: template.placeholders as any,
        required_fields: template.requiredFields as any,
        variants: template.variants as any,
        ethical_guardrails: template.ethicalGuardrails,
        owner: template.owner,
        maintainer: template.maintainer,
        status: template.status,
        version: template.version || '1.0',
        playbook: template.playbook || null,
        created_by_user_id: profile.id,
        created_by_name: createdByName,
        source: template.source || null,
        institutional_profile_id: template.institutionalProfileId || null,
        tags: template.tags || [],
        college_name: template.collegeName || null,
        department_name: template.departmentName || null,
        change_history: [],
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Failed to add template:', error);
      return null;
    }

    trackToolUse('university_library', 'submit', { status: template.status });
    await loadTemplates();
    return data;
  }, [profile, loadTemplates, trackToolUse]);

  const deleteTemplate = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('shared_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete template:', error);
      return;
    }

    trackToolUse('university_library', 'delete');
    await loadTemplates();
  }, [loadTemplates, trackToolUse]);

  return {
    templates,
    isLoading,
    filterTemplates,
    getPlaybooks,
    getAllTags,
    getTemplateById,
    updateTemplateStatus,
    addTemplate,
    deleteTemplate,
    refreshTemplates: loadTemplates,
  };
}
