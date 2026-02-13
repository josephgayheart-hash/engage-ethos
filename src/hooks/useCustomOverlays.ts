import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CustomOverlay {
  id: string;
  name: string;
  fileUrl: string;
  fileName: string;
  fileType: string | null;
  isActive: boolean;
  sortOrder: number;
  source: 'self_service' | 'concierge';
  profileId: string | null;
  createdAt: string;
}

const SELF_SERVICE_LIMIT = 5;

export function useCustomOverlays(profileId?: string | null) {
  const { user, tenant } = useAuth();
  const [overlays, setOverlays] = useState<CustomOverlay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetchOverlays = useCallback(async () => {
    if (!tenant?.id) {
      setOverlays([]);
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('custom_overlay_patterns')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (profileId) {
        query = query.or(`profile_id.eq.${profileId},profile_id.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;

      setOverlays(
        (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          fileUrl: row.file_url,
          fileName: row.file_name,
          fileType: row.file_type,
          isActive: row.is_active,
          sortOrder: row.sort_order,
          source: row.source,
          profileId: row.profile_id,
          createdAt: row.created_at,
        }))
      );
    } catch (err) {
      console.error('Error fetching custom overlays:', err);
      setOverlays([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenant?.id, profileId]);

  useEffect(() => {
    fetchOverlays();
  }, [fetchOverlays]);

  const selfServiceCount = overlays.filter(o => o.source === 'self_service').length;
  const canUploadMore = selfServiceCount < SELF_SERVICE_LIMIT;

  const uploadOverlay = useCallback(async (
    file: File,
    name: string,
    targetProfileId?: string | null
  ): Promise<CustomOverlay | null> => {
    if (!user || !tenant?.id) return null;
    if (!canUploadMore) return null;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      const fileName = `${tenant.id}/overlay-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('brand-overlays')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('brand-overlays')
        .getPublicUrl(fileName);

      const { data, error } = await supabase
        .from('custom_overlay_patterns')
        .insert([{
          tenant_id: tenant.id,
          profile_id: targetProfileId || null,
          uploaded_by_user_id: user.id,
          name,
          file_url: publicUrl,
          file_name: file.name,
          file_type: file.type || null,
          source: 'self_service',
        }])
        .select()
        .single();

      if (error) throw error;

      const newOverlay: CustomOverlay = {
        id: data.id,
        name: data.name,
        fileUrl: data.file_url,
        fileName: data.file_name,
        fileType: data.file_type,
        isActive: data.is_active,
        sortOrder: data.sort_order,
        source: data.source as 'self_service' | 'concierge',
        profileId: data.profile_id,
        createdAt: data.created_at,
      };

      setOverlays(prev => [...prev, newOverlay]);
      return newOverlay;
    } catch (err) {
      console.error('Error uploading custom overlay:', err);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [user, tenant?.id, canUploadMore]);

  const deleteOverlay = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_overlay_patterns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setOverlays(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      console.error('Error deleting custom overlay:', err);
    }
  }, []);

  return {
    overlays,
    isLoading,
    isUploading,
    canUploadMore,
    selfServiceCount,
    selfServiceLimit: SELF_SERVICE_LIMIT,
    uploadOverlay,
    deleteOverlay,
    refreshOverlays: fetchOverlays,
  };
}
