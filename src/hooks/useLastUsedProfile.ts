import { useState, useEffect, useCallback } from 'react';
import { useActiveWorkspaceId } from '@/contexts/WorkspaceContext';

const STORAGE_KEY = 'campusvoice_last_used_profile';

// Migrate old key if present
const OLD_STORAGE_KEY = 'uplaybook_last_used_profile';
if (typeof window !== 'undefined') {
  const oldValue = localStorage.getItem(OLD_STORAGE_KEY);
  if (oldValue && !localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, oldValue);
    localStorage.removeItem(OLD_STORAGE_KEY);
  }
}

interface LastUsedProfileData {
  tenantId: string;
  profileId: string;
  timestamp: number;
}

/**
 * Hook to persist and retrieve the last used institutional profile across tools.
 * This provides a consistent experience when users navigate between Content DNA,
 * Builder, Web Analyzer, and other tools.
 */
export function useLastUsedProfile() {
  const workspaceId = useActiveWorkspaceId();
  const [lastUsedProfileId, setLastUsedProfileIdState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (!workspaceId) {
      setIsLoaded(true);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: LastUsedProfileData = JSON.parse(stored);
        // Only use if it's for the same workspace
        if (data.tenantId === workspaceId) {
          setLastUsedProfileIdState(data.profileId);
        }
      }
    } catch (e) {
      console.error('Failed to load last used profile:', e);
    }
    setIsLoaded(true);
  }, [workspaceId]);

  // Save to localStorage
  const setLastUsedProfileId = useCallback((profileId: string | null) => {
    if (!workspaceId) return;

    setLastUsedProfileIdState(profileId);

    if (profileId) {
      try {
        const data: LastUsedProfileData = {
          tenantId: workspaceId,
          profileId,
          timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Failed to save last used profile:', e);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [workspaceId]);

  return {
    lastUsedProfileId,
    setLastUsedProfileId,
    isLoaded,
  };
}
