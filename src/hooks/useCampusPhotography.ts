import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveWorkspaceId } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';
import { logDNAActivity } from '@/hooks/useContentDNAActivity';

export interface PhotoAIAnalysis {
  scene_type?: string;
  primary_subjects?: string[];
  architectural_style?: string;
  lighting?: string;
  mood?: string;
  dominant_colors?: string[];
  season?: string;
  people_present?: boolean;
  landscape_features?: string[];
  best_for?: string[];
  quality_score?: number;
  quality_notes?: string;
}

export interface CampusPhoto {
  id: string;
  tenant_id: string;
  profile_id: string | null;
  user_id: string;
  file_name: string;
  file_url: string;
  photo_category: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  ai_analysis: PhotoAIAnalysis | null;
  ai_analyzed_at: string | null;
}

const PHOTO_CATEGORIES = [
  { value: 'architecture', label: 'Architecture' },
  { value: 'campus-life', label: 'Campus Life' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'athletics', label: 'Athletics' },
  { value: 'traditions', label: 'Traditions' },
  { value: 'aerial', label: 'Aerial' },
] as const;

const MAX_PHOTOS = 20;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function useCampusPhotography({ profileId }: { profileId: string | null }) {
  const { tenant, user } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const [photos, setPhotos] = useState<CampusPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchPhotos = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    try {
      let query = supabase
        .from('campus_photo_samples' as any)
        .select('*')
        .eq('tenant_id', workspaceId)
        .order('created_at', { ascending: false });

      if (profileId) {
        query = query.eq('profile_id', profileId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPhotos((data || []) as unknown as CampusPhoto[]);
    } catch (e) {
      console.error('Error fetching campus photos:', e);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, profileId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const uploadPhotos = async (files: File[], category: string, description?: string) => {
    if (!workspaceId || !user?.id) {
      toast.error('You must be logged in to upload photos.');
      return [];
    }

    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_PHOTOS} photos per profile. Remove some before uploading more.`);
      return [];
    }

    const filesToUpload = files.slice(0, remaining);
    if (filesToUpload.length < files.length) {
      toast.warning(`Only uploading ${filesToUpload.length} of ${files.length} files (limit: ${MAX_PHOTOS}).`);
    }

    // Validate all files
    for (const file of filesToUpload) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Only JPG, PNG, and WEBP images are accepted.`);
        return [];
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: File too large. Maximum size is 5MB.`);
        return [];
      }
    }

    setIsUploading(true);
    const uploaded: CampusPhoto[] = [];

    try {
      for (const file of filesToUpload) {
        const ext = file.name.split('.').pop() || 'jpg';
        const filePath = `${workspaceId}/${profileId || 'default'}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('campus-photography')
          .upload(filePath, file, { contentType: file.type, upsert: false });

        if (uploadError) {
          console.error(`Upload error for ${file.name}:`, uploadError);
          continue;
        }

        const { data: publicUrl } = supabase.storage
          .from('campus-photography')
          .getPublicUrl(filePath);

        const { data, error: insertError } = await supabase
          .from('campus_photo_samples' as any)
          .insert({
            tenant_id: workspaceId,
            profile_id: profileId,
            user_id: user.id,
            file_name: file.name,
            file_url: publicUrl.publicUrl,
            photo_category: category,
            description: description || null,
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Insert error for ${file.name}:`, insertError);
          continue;
        }

        uploaded.push(data as unknown as CampusPhoto);
      }

      if (uploaded.length > 0) {
        setPhotos(prev => [...uploaded, ...prev]);
        toast.success(`${uploaded.length} photo${uploaded.length > 1 ? 's' : ''} uploaded successfully.`);

        logDNAActivity(workspaceId, user.id, {
          section: 'photos', action: 'added', profileId,
          artifactCount: uploaded.length,
          artifactName: uploaded.map(p => p.file_name).join(', '),
        });

        // Auto-analyze the new photos
        analyzePhotos(uploaded.map(p => p.id));
      }

      return uploaded;
    } catch (e: any) {
      console.error('Upload error:', e);
      toast.error(e.message || 'Failed to upload photos.');
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  // Legacy single upload
  const uploadPhoto = async (file: File, category: string, description?: string) => {
    const results = await uploadPhotos([file], category, description);
    return results[0] || null;
  };

  const analyzePhotos = async (photoIds: string[]) => {
    if (photoIds.length === 0) return;
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-campus-photo', {
        body: { photoIds },
      });

      if (error) throw error;

      const results = data?.results || {};
      
      // Update local state with analysis results (including AI-assigned category)
      setPhotos(prev => prev.map(p => {
        const result = results[p.id];
        if (result?.success) {
          return {
            ...p,
            ai_analysis: result.analysis,
            ai_analyzed_at: new Date().toISOString(),
            photo_category: result.analysis.photo_category || p.photo_category,
          };
        }
        return p;
      }));

      const successCount = Object.values(results).filter((r: any) => r.success).length;
      if (successCount > 0) {
        toast.success(`AI analyzed ${successCount} photo${successCount > 1 ? 's' : ''}.`);
      }
    } catch (e: any) {
      console.error('Analysis error:', e);
      // Don't show error toast - analysis is background enhancement
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    try {
      const photo = photos.find(p => p.id === photoId);
      if (!photo) return;

      const urlParts = photo.file_url.split('/campus-photography/');
      if (urlParts[1]) {
        await supabase.storage.from('campus-photography').remove([urlParts[1]]);
      }

      const { error } = await supabase
        .from('campus_photo_samples' as any)
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      setPhotos(prev => prev.filter(p => p.id !== photoId));
      toast.success('Photo removed.');
    } catch (e: any) {
      console.error('Delete error:', e);
      toast.error('Failed to delete photo.');
    }
  };

  const toggleActive = async (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    try {
      const { error } = await supabase
        .from('campus_photo_samples' as any)
        .update({ is_active: !photo.is_active })
        .eq('id', photoId);

      if (error) throw error;

      setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, is_active: !p.is_active } : p));
    } catch (e: any) {
      console.error('Toggle error:', e);
      toast.error('Failed to update photo.');
    }
  };

  return {
    photos,
    isLoading,
    isUploading,
    isAnalyzing,
    uploadPhoto,
    uploadPhotos,
    deletePhoto,
    toggleActive,
    analyzePhotos,
    refetch: fetchPhotos,
    maxPhotos: MAX_PHOTOS,
    acceptedTypes: ACCEPTED_TYPES,
    maxFileSize: MAX_FILE_SIZE,
    categories: PHOTO_CATEGORIES,
  };
}
