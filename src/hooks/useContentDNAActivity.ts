import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveWorkspaceId } from '@/contexts/WorkspaceContext';

export type DNASection = 
  | 'samples' 
  | 'analysis' 
  | 'stories' 
  | 'facts' 
  | 'photos' 
  | 'design_refs' 
  | 'web_crawl' 
  | 'tuning' 
  | 'custom_instructions';

export type DNAAction = 
  | 'added' 
  | 'removed' 
  | 'updated' 
  | 'analyzed' 
  | 'imported' 
  | 'scraped'
  | 'bulk_added'
  | 'bulk_removed'
  | 'restored';

export interface LogActivityParams {
  section: DNASection;
  action: DNAAction;
  profileId?: string | null;
  artifactName?: string;
  artifactCount?: number;
  metadata?: Record<string, unknown>;
}

export function useContentDNAActivity() {
  const { user } = useAuth();
  const workspaceId = useActiveWorkspaceId();

  const logActivity = useCallback(async (params: LogActivityParams) => {
    if (!workspaceId || !user?.id) return;

    try {
      await supabase.from('content_dna_activity').insert([{
        tenant_id: workspaceId,
        profile_id: params.profileId || null,
        user_id: user.id,
        section: params.section,
        action: params.action,
        artifact_name: params.artifactName || null,
        artifact_count: params.artifactCount || null,
        metadata: params.metadata || {},
      }]);
    } catch (err) {
      // Activity logging is non-critical — don't block the user
      console.error('Failed to log DNA activity:', err);
    }
  }, [workspaceId, user?.id]);

  return { logActivity };
}

/**
 * Standalone helper for logging activity outside of React components.
 * Requires explicit workspaceId and userId.
 */
export async function logDNAActivity(
  workspaceId: string,
  userId: string,
  params: Omit<LogActivityParams, 'profileId'> & { profileId?: string | null }
) {
  try {
    await supabase.from('content_dna_activity').insert({
      tenant_id: workspaceId,
      profile_id: params.profileId || null,
      user_id: userId,
      section: params.section,
      action: params.action,
      artifact_name: params.artifactName || null,
      artifact_count: params.artifactCount || null,
      metadata: params.metadata || {},
    });
  } catch (err) {
    console.error('Failed to log DNA activity:', err);
  }
}
