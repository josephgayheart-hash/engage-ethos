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

interface UseContentDNAVersionsOptions {
  contentDnaId?: string | null;
  profileId?: string | null;
}

export function useContentDNAVersions(options: UseContentDNAVersionsOptions = {}) {
  const { contentDnaId, profileId } = options;
  const { tenant } = useAuth();
  
  const [versions, setVersions] = useState<ContentDNAVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchVersions = useCallback(async () => {
    if (!tenant?.id) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('content_dna_versions')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('version_number', { ascending: false });
      
      if (contentDnaId) {
        // When we have the exact DNA id, filter by it (profileId is redundant)
        query = query.eq('content_dna_id', contentDnaId);
      } else if (profileId) {
        // Filter by profile when no specific DNA id
        query = query.eq('profile_id', profileId);
      }
      // When neither is provided, return all versions for the tenant

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching versions:', error);
        return;
      }

      setVersions((data || []) as ContentDNAVersion[]);
    } catch (error) {
      console.error('Error fetching versions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tenant?.id, contentDnaId, profileId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

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

      // Refresh versions after restore (new version will be created by trigger)
      await fetchVersions();
      return true;
    } catch (error) {
      console.error('Error restoring version:', error);
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, [fetchVersions]);

  const compareVersions = useCallback((v1: ContentDNAVersion, v2: ContentDNAVersion) => {
    const changes: string[] = [];
    
    // Compare voice analysis
    const v1Voice = JSON.stringify(v1.voice_analysis);
    const v2Voice = JSON.stringify(v2.voice_analysis);
    if (v1Voice !== v2Voice) {
      changes.push('Voice analysis updated');
    }
    
    // Compare brand platform
    const v1Brand = JSON.stringify(v1.brand_platform);
    const v2Brand = JSON.stringify(v2.brand_platform);
    if (v1Brand !== v2Brand) {
      changes.push('Brand platform updated');
    }
    
    // Compare custom instructions
    if (v1.custom_instructions !== v2.custom_instructions) {
      changes.push('Custom instructions updated');
    }
    
    // Compare sample count
    if (v1.sample_count !== v2.sample_count) {
      const diff = v2.sample_count - v1.sample_count;
      changes.push(`Sample count ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(diff)}`);
    }
    
    return changes;
  }, []);

  return {
    versions,
    isLoading,
    isRestoring,
    fetchVersions,
    restoreVersion,
    compareVersions,
  };
}
