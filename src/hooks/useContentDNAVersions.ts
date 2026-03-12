import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveWorkspaceId } from '@/contexts/WorkspaceContext';
import type { Json } from '@/integrations/supabase/types';

export interface ContentDNAVersion {
  id: string;
  content_dna_id: string;
  tenant_id: string;
  profile_id: string | null;
  version_number: number;
  voice_analysis: Json;
  brand_platform: Json | null;
  custom_instructions: string | null;
  sample_count: number;
  change_summary: string | null;
  created_by_user_id: string | null;
  created_at: string;
}

export interface ContentDNAActivityEntry {
  id: string;
  tenant_id: string;
  profile_id: string | null;
  user_id: string;
  section: string;
  action: string;
  artifact_name: string | null;
  artifact_count: number | null;
  metadata: Json;
  created_at: string;
}

/** Unified timeline item combining versions + activities */
export interface TimelineEntry {
  type: 'version' | 'activity';
  id: string;
  created_at: string;
  version?: ContentDNAVersion;
  activity?: ContentDNAActivityEntry;
}

interface UseContentDNAVersionsOptions {
  contentDnaId?: string | null;
  profileId?: string | null;
}

export function useContentDNAVersions(options: UseContentDNAVersionsOptions = {}) {
  const { contentDnaId, profileId } = options;
  const workspaceId = useActiveWorkspaceId();
  
  const [versions, setVersions] = useState<ContentDNAVersion[]>([]);
  const [activities, setActivities] = useState<ContentDNAActivityEntry[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchData = useCallback(async () => {
    if (!workspaceId) return;
    
    setIsLoading(true);
    try {
      // Fetch versions
      let versionQuery = supabase
        .from('content_dna_versions')
        .select('*')
        .eq('tenant_id', workspaceId)
        .order('version_number', { ascending: false });
      
      if (contentDnaId) {
        versionQuery = versionQuery.eq('content_dna_id', contentDnaId);
      } else if (profileId) {
        versionQuery = versionQuery.eq('profile_id', profileId);
      }

      // Fetch activities
      let activityQuery = supabase
        .from('content_dna_activity')
        .select('*')
        .eq('tenant_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (profileId) {
        activityQuery = activityQuery.eq('profile_id', profileId);
      }

      const [versionsResult, activitiesResult] = await Promise.all([
        versionQuery,
        activityQuery,
      ]);

      const fetchedVersions = (versionsResult.data || []) as ContentDNAVersion[];
      const fetchedActivities = (activitiesResult.data || []) as ContentDNAActivityEntry[];

      setVersions(fetchedVersions);
      setActivities(fetchedActivities);

      // Build unified timeline
      const timelineItems: TimelineEntry[] = [
        ...fetchedVersions.map(v => ({
          type: 'version' as const,
          id: `v-${v.id}`,
          created_at: v.created_at,
          version: v,
        })),
        ...fetchedActivities.map(a => ({
          type: 'activity' as const,
          id: `a-${a.id}`,
          created_at: a.created_at,
          activity: a,
        })),
      ];

      timelineItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTimeline(timelineItems);
    } catch (error) {
      console.error('Error fetching version/activity data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, contentDnaId, profileId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const restoreVersion = useCallback(async (version: ContentDNAVersion) => {
    if (!version.content_dna_id) return false;
    
    setIsRestoring(true);
    try {
      const { error } = await supabase
        .from('content_dna_analysis')
        .update({
          voice_analysis: version.voice_analysis,
          brand_platform: version.brand_platform,
          custom_instructions: version.custom_instructions,
          sample_count: version.sample_count,
        })
        .eq('id', version.content_dna_id);

      if (error) {
        console.error('Error restoring version:', error);
        return false;
      }

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error restoring version:', error);
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, [fetchData]);

  const compareVersions = useCallback((v1: ContentDNAVersion, v2: ContentDNAVersion) => {
    const changes: string[] = [];
    if (JSON.stringify(v1.voice_analysis) !== JSON.stringify(v2.voice_analysis)) {
      changes.push('Voice analysis updated');
    }
    if (JSON.stringify(v1.brand_platform) !== JSON.stringify(v2.brand_platform)) {
      changes.push('Brand platform updated');
    }
    if (v1.custom_instructions !== v2.custom_instructions) {
      changes.push('Custom instructions updated');
    }
    if (v1.sample_count !== v2.sample_count) {
      const diff = v2.sample_count - v1.sample_count;
      changes.push(`Sample count ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(diff)}`);
    }
    return changes;
  }, []);

  return {
    versions,
    activities,
    timeline,
    isLoading,
    isRestoring,
    fetchVersions: fetchData,
    restoreVersion,
    compareVersions,
  };
}
