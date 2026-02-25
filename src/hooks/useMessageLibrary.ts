import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useToolTracking } from '@/hooks/useToolTracking';
import type { SavedMessage, LibraryFilters, SortOption } from '@/types/library';

export function useMessageLibrary() {
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile, user } = useAuth();
  const { trackToolUse } = useToolTracking();

  // Load messages from database
  const loadMessages = useCallback(async () => {
    if (!user) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('personal_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch personal messages:', error);
        setIsLoading(false);
        return;
      }

      const mapped: SavedMessage[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        content: row.content,
        channel: row.channel as any,
        channels: (row as any).channels as any,
        channelDrafts: (row as any).channel_drafts as any,
        audience: row.audience as any,
        cohort: (row as any).cohort as any,
        domain: row.domain as any,
        moment: row.moment as any,
        goal: row.goal as any,
        tone: row.tone as any,
        senderRecommendation: row.sender_recommendation || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        versions: ((row as any).versions as any[]) || [{
          id: row.id,
          content: row.content,
          createdAt: row.created_at,
        }],
        notes: row.notes || undefined,
        approved: row.approved || false,
        mode: (row.mode as 'evaluated' | 'generated' | 'kit') || 'generated',
        institutionalProfileId: row.institutional_profile_id || undefined,
        source: ((row as any).source || (row.metadata as any)?.source || 'other') as any,
        tags: (row as any).tags || [],
        submittedToLibrary: (row as any).submitted_to_library || false,
        submittedAt: (row as any).submitted_at || undefined,
        createdByUserId: row.user_id,
        createdByName: (row as any).created_by_name || undefined,
        remixedFrom: (row as any).remixed_from as any,
        externalAssets: ((row as any).external_assets as any[]) || [],
        coverImageUrl: (row as any).cover_image_url || undefined,
      }));

      setMessages(mapped);
    } catch (err) {
      console.error('Error loading personal messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const addMessage = useCallback(async (message: Omit<SavedMessage, 'id' | 'createdAt' | 'updatedAt' | 'versions'>) => {
    if (!profile) return null;

    const createdByName = message.createdByName || `${profile.first_name} ${profile.last_name}`;
    const now = new Date().toISOString();
    const versions = [{
      id: crypto.randomUUID(),
      content: message.content,
      createdAt: now,
    }];

    const userId = user!.id;
    const { data, error } = await supabase
      .from('personal_messages')
      .insert({
        tenant_id: profile.tenant_id,
        user_id: userId,
        title: message.title,
        content: message.content,
        channel: message.channel || 'email',
        audience: message.audience || null,
        domain: message.domain || null,
        moment: message.moment || null,
        goal: message.goal || null,
        tone: message.tone || null,
        sender_recommendation: message.senderRecommendation || null,
        notes: message.notes || null,
        approved: message.approved || false,
        mode: message.mode || 'generated',
        institutional_profile_id: message.institutionalProfileId || null,
        metadata: { source: message.source || 'other' },
        source: message.source || 'other',
        versions: versions as any,
        tags: message.tags || [],
        created_by_name: createdByName,
        submitted_to_library: message.submittedToLibrary || false,
        submitted_at: message.submittedAt || null,
        remixed_from: message.remixedFrom ? (message.remixedFrom as any) : null,
        channels: message.channels || null,
        channel_drafts: message.channelDrafts ? (message.channelDrafts as any) : null,
        cohort: message.cohort ? (message.cohort as any) : null,
        cover_image_url: message.coverImageUrl || null,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Failed to add message:', error);
      toast.error(`Failed to save: ${error.message}`);
      return null;
    }

    trackToolUse('personal_library', 'save', {
      channel: message.channel,
      audience: message.audience,
      source: message.source,
    });

    // Optimistically add to local state instead of full refetch for speed
    if (data) {
      const newMessage: SavedMessage = {
        id: data.id,
        title: data.title,
        content: data.content,
        channel: data.channel as any,
        channels: (data as any).channels as any,
        channelDrafts: (data as any).channel_drafts as any,
        audience: data.audience as any,
        cohort: (data as any).cohort as any,
        domain: data.domain as any,
        moment: data.moment as any,
        goal: data.goal as any,
        tone: data.tone as any,
        senderRecommendation: data.sender_recommendation || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        versions: ((data as any).versions as any[]) || [],
        notes: data.notes || undefined,
        approved: data.approved || false,
        mode: (data.mode as any) || 'generated',
        institutionalProfileId: data.institutional_profile_id || undefined,
        source: ((data as any).source || 'other') as any,
        tags: (data as any).tags || [],
        submittedToLibrary: (data as any).submitted_to_library || false,
        submittedAt: (data as any).submitted_at || undefined,
        createdByUserId: data.user_id,
        createdByName: (data as any).created_by_name || undefined,
        remixedFrom: (data as any).remixed_from as any,
        externalAssets: ((data as any).external_assets as any[]) || [],
        coverImageUrl: (data as any).cover_image_url || undefined,
      };
      setMessages(prev => [newMessage, ...prev]);
    }

    return data;
  }, [profile, loadMessages, trackToolUse]);

  const updateMessage = useCallback(async (id: string, updates: Partial<SavedMessage>, addVersion = false) => {
    const updatePayload: Record<string, any> = {};

    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.content !== undefined) updatePayload.content = updates.content;
    if (updates.channel !== undefined) updatePayload.channel = updates.channel;
    if (updates.audience !== undefined) updatePayload.audience = updates.audience;
    if (updates.domain !== undefined) updatePayload.domain = updates.domain;
    if (updates.moment !== undefined) updatePayload.moment = updates.moment;
    if (updates.goal !== undefined) updatePayload.goal = updates.goal;
    if (updates.tone !== undefined) updatePayload.tone = updates.tone;
    if (updates.notes !== undefined) updatePayload.notes = updates.notes;
    if (updates.approved !== undefined) updatePayload.approved = updates.approved;
    if (updates.tags !== undefined) updatePayload.tags = updates.tags;
    if (updates.submittedToLibrary !== undefined) updatePayload.submitted_to_library = updates.submittedToLibrary;
    if (updates.submittedAt !== undefined) updatePayload.submitted_at = updates.submittedAt;

    // Handle version addition
    if (addVersion && updates.content) {
      const existing = messages.find(m => m.id === id);
      if (existing) {
        const newVersion = {
          id: crypto.randomUUID(),
          content: updates.content,
          createdAt: new Date().toISOString(),
          changeNotes: updates.notes,
        };
        updatePayload.versions = [newVersion, ...existing.versions] as any;
      }
    }

    const { error } = await supabase
      .from('personal_messages')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.error('Failed to update message:', error);
      return;
    }

    await loadMessages();
  }, [messages, loadMessages]);

  const deleteMessage = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('personal_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete message:', error);
      return;
    }

    trackToolUse('personal_library', 'delete');
    await loadMessages();
  }, [loadMessages, trackToolUse]);

  const duplicateMessage = useCallback(async (id: string) => {
    const original = messages.find(msg => msg.id === id);
    if (!original || !profile) return null;

    const result = await addMessage({
      ...original,
      title: `${original.title} (Copy)`,
      approved: false,
    });

    trackToolUse('personal_library', 'duplicate');
    return result;
  }, [messages, profile, addMessage, trackToolUse]);

  const filterMessages = useCallback((filters: LibraryFilters, sort: SortOption = 'newest'): SavedMessage[] => {
    let filtered = [...messages];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(msg =>
        msg.title.toLowerCase().includes(searchLower) ||
        msg.content.toLowerCase().includes(searchLower) ||
        (msg.tags && msg.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    if (filters.channel) {
      filtered = filtered.filter(msg => msg.channel === filters.channel);
    }

    if (filters.audience) {
      filtered = filtered.filter(msg => msg.audience === filters.audience);
    }

    if (filters.domain) {
      filtered = filtered.filter(msg => msg.domain === filters.domain);
    }

    if (filters.moment) {
      filtered = filtered.filter(msg => msg.moment === filters.moment);
    }

    if (filters.tag) {
      filtered = filtered.filter(msg => msg.tags && msg.tags.includes(filters.tag!));
    }

    switch (sort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }

    return filtered;
  }, [messages]);

  const getAllTags = useCallback((): string[] => {
    const tags = new Set<string>();
    messages.forEach(m => {
      if (m.tags) m.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [messages]);

  const exportMessage = useCallback((id: string) => {
    const message = messages.find(msg => msg.id === id);
    if (!message) return null;

    const textContent = `
${message.title}
${'='.repeat(message.title.length)}

MESSAGE CONTENT
---------------
${message.content}

METADATA
--------
Channel: ${message.channel}
Audience: ${message.audience}
${message.domain ? `Domain: ${message.domain}` : ''}
Moment: ${message.moment}
${message.goal ? `Goal: ${message.goal}` : ''}
${message.tone ? `Tone: ${message.tone}` : ''}
${message.senderRecommendation ? `Sender: ${message.senderRecommendation}` : ''}
Mode: ${message.mode}
Approved: ${message.approved ? 'Yes' : 'No'}
${message.tags && message.tags.length > 0 ? `Tags: ${message.tags.join(', ')}` : ''}

DATES
-----
Created: ${new Date(message.createdAt).toLocaleString()}
Updated: ${new Date(message.updatedAt).toLocaleString()}

${message.notes ? `NOTES\n-----\n${message.notes}\n` : ''}
${message.versions.length > 1 ? `VERSION HISTORY\n---------------\n${message.versions.map((v, i) => `Version ${message.versions.length - i}: ${new Date(v.createdAt).toLocaleString()}${v.changeNotes ? ` - ${v.changeNotes}` : ''}`).join('\n')}` : ''}
`.trim();

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${message.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    trackToolUse('personal_library', 'export', { channel: message.channel });
    return message;
  }, [messages, trackToolUse]);

  return {
    messages,
    isLoading,
    addMessage,
    updateMessage,
    deleteMessage,
    duplicateMessage,
    filterMessages,
    exportMessage,
    getAllTags,
    refreshMessages: loadMessages,
  };
}
