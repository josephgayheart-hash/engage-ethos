import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveWorkspaceId } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';

export interface DesignReference {
  id: string;
  tenant_id: string;
  profile_id: string | null;
  user_id: string;
  file_name: string;
  file_url: string;
  name: string;
  description: string | null;
  reference_type: string;
  tags: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const MAX_REFERENCES = 20;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function useDesignReferences({ profileId }: { profileId: string | null }) {
  const { tenant, user } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const [references, setReferences] = useState<DesignReference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetchReferences = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    try {
      let query = supabase
        .from('design_references' as any)
        .select('*')
        .eq('tenant_id', workspaceId)
        .order('sort_order', { ascending: true });

      if (profileId) {
        query = query.eq('profile_id', profileId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReferences((data || []) as unknown as DesignReference[]);
    } catch (err) {
      console.error('Failed to fetch design references:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, profileId]);

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  const uploadReference = useCallback(async (
    files: File[],
    name?: string,
    description?: string,
    referenceType: string = 'inspiration'
  ) => {
    if (!workspaceId || !user?.id) {
      toast.error('You must be logged in to upload.');
      return;
    }

    if (references.length + files.length > MAX_REFERENCES) {
      toast.error(`Maximum ${MAX_REFERENCES} design references allowed.`);
      return;
    }

    const invalidFiles = files.filter(f => !ACCEPTED_TYPES.includes(f.type) || f.size > MAX_FILE_SIZE);
    if (invalidFiles.length > 0) {
      toast.error('Only JPG, PNG, or WebP images under 5MB are accepted.');
      return;
    }

    setIsUploading(true);
    try {
      for (const file of files) {
        const ext = file.name.split('.').pop();
        const path = `${workspaceId}/${profileId || 'general'}/${crypto.randomUUID()}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from('design-references')
          .upload(path, file, { contentType: file.type });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('design-references')
          .getPublicUrl(path);

        const { error: insertError } = await supabase
          .from('design_references' as any)
          .insert({
            tenant_id: workspaceId,
            profile_id: profileId,
            user_id: user.id,
            file_name: file.name,
            file_url: urlData.publicUrl,
            name: name || file.name.replace(/\.[^/.]+$/, ''),
            description: description || null,
            reference_type: referenceType,
            sort_order: references.length,
          });
        if (insertError) throw insertError;
      }

      toast.success(`${files.length} design reference${files.length > 1 ? 's' : ''} uploaded`);
      await fetchReferences();
    } catch (err: any) {
      console.error('Upload failed:', err);
      toast.error(err?.message || 'Failed to upload design reference.');
    } finally {
      setIsUploading(false);
    }
  }, [workspaceId, user?.id, profileId, references.length, fetchReferences]);

  const deleteReference = useCallback(async (id: string) => {
    try {
      const ref = references.find(r => r.id === id);
      if (ref) {
        // Extract storage path from URL
        const urlParts = ref.file_url.split('/design-references/');
        if (urlParts[1]) {
          await supabase.storage.from('design-references').remove([urlParts[1]]);
        }
      }

      const { error } = await supabase
        .from('design_references' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;

      setReferences(prev => prev.filter(r => r.id !== id));
      toast.success('Design reference removed');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete design reference.');
    }
  }, [references]);

  return {
    references,
    isLoading,
    isUploading,
    uploadReference,
    deleteReference,
    refetch: fetchReferences,
    maxReferences: MAX_REFERENCES,
    acceptedTypes: ACCEPTED_TYPES,
  };
}
