import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UsageEvent {
  id: string;
  userName: string;
  action: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export function useLibraryUsageTracking() {
  const { profile } = useAuth();

  const trackUsage = useCallback(async (opts: {
    templateId?: string;
    messageId?: string;
    action: 'view' | 'copy' | 'remix' | 'export' | 'pull';
    metadata?: Record<string, any>;
  }) => {
    if (!profile) return;

    const { error } = await supabase
      .from('library_usage_events')
      .insert({
        tenant_id: profile.tenant_id,
        user_id: profile.id,
        template_id: opts.templateId || null,
        message_id: opts.messageId || null,
        action: opts.action,
        metadata: opts.metadata || {},
        user_name: `${profile.first_name} ${profile.last_name}`,
      } as any);

    if (error) {
      console.error('Failed to track usage:', error);
    }
  }, [profile]);

  const getTemplateUsage = useCallback(async (templateId: string): Promise<UsageEvent[]> => {
    const { data, error } = await supabase
      .from('library_usage_events')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to fetch usage:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      userName: (row as any).user_name || 'Unknown',
      action: row.action,
      createdAt: row.created_at,
      metadata: row.metadata as any,
    }));
  }, []);

  const getMessageUsage = useCallback(async (messageId: string): Promise<UsageEvent[]> => {
    const { data, error } = await supabase
      .from('library_usage_events')
      .select('*')
      .eq('message_id', messageId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to fetch usage:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      userName: (row as any).user_name || 'Unknown',
      action: row.action,
      createdAt: row.created_at,
      metadata: row.metadata as any,
    }));
  }, []);

  const getUsageCount = useCallback(async (opts: { templateId?: string; messageId?: string }): Promise<number> => {
    let query = supabase
      .from('library_usage_events')
      .select('id', { count: 'exact', head: true });

    if (opts.templateId) query = query.eq('template_id', opts.templateId);
    if (opts.messageId) query = query.eq('message_id', opts.messageId);

    const { count, error } = await query;
    if (error) return 0;
    return count || 0;
  }, []);

  return {
    trackUsage,
    getTemplateUsage,
    getMessageUsage,
    getUsageCount,
  };
}
