import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const [photos, setPhotos] = useState<CampusPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetchPhotos = useCallback(async () => {
    if (!tenant?.id) return;
    setIsLoading(true);
    try {
      let query = supabase
        .from('campus_photo_samples' as any)
        .select('*')
        .eq('tenant_id', tenant.id)
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
  }, [tenant?.id, profileId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const uploadPhoto = async (file: File, category: string, description?: string) => {
    if (!tenant?.id || !user?.id) {
      toast.error('You must be logged in to upload photos.');
      return null;
    }

    if (photos.length >= MAX_PHOTOS) {
      toast.error(`Maximum ${MAX_PHOTOS} photos per profile. Remove some before uploading more.`);
      return null;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, and WEBP images are accepted.');
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 5MB.');
      return null;
    }

    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `${tenant.id}/${profileId || 'default'}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('campus-photography')
        .upload(filePath, file, { contentType: file.type, upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from('campus-photography')
        .getPublicUrl(filePath);

      const { data, error: insertError } = await supabase
        .from('campus_photo_samples' as any)
        .insert({
          tenant_id: tenant.id,
          profile_id: profileId,
          user_id: user.id,
          file_name: file.name,
          file_url: publicUrl.publicUrl,
          photo_category: category,
          description: description || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newPhoto = data as unknown as CampusPhoto;
      setPhotos(prev => [newPhoto, ...prev]);
      toast.success('Photo uploaded successfully.');
      return newPhoto;
    } catch (e: any) {
      console.error('Upload error:', e);
      toast.error(e.message || 'Failed to upload photo.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    try {
      const photo = photos.find(p => p.id === photoId);
      if (!photo) return;

      // Delete from storage
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
    uploadPhoto,
    deletePhoto,
    toggleActive,
    refetch: fetchPhotos,
    maxPhotos: MAX_PHOTOS,
    acceptedTypes: ACCEPTED_TYPES,
    maxFileSize: MAX_FILE_SIZE,
    categories: PHOTO_CATEGORIES,
  };
}
