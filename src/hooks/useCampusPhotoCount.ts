import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useCampusPhotoCount(profileId: string | null) {
  const { tenant } = useAuth();
  const [count, setCount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!tenant?.id) return;

    const fetchCount = async () => {
      let query = supabase
        .from('campus_photo_samples')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)
        .eq('is_active', true);

      if (profileId) {
        query = query.eq('profile_id', profileId);
      }

      const { count: photoCount } = await query;
      setCount(photoCount || 0);
      setIsLoaded(true);
    };

    fetchCount();
  }, [tenant?.id, profileId]);

  return { campusPhotoCount: count, isLoaded };
}
