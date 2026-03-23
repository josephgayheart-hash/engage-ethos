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

interface ProfileLike {
  id: string;
  parentProfileId?: string | null;
}

/**
 * Hook to persist and retrieve the last used institutional profile across tools.
 * When no stored preference exists, automatically defaults to the root (parent) profile.
 * This provides a consistent experience when users navigate between Content DNA,
 * Builder, Web Analyzer, and other tools.
 */
export function useLastUsedProfile(profiles?: ProfileLike[]) {
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
          setIsLoaded(true);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load last used profile:', e);
    }
    setIsLoaded(true);
  }, [workspaceId]);

  // Auto-default to root profile when no stored preference and profiles are available
  useEffect(() => {
    if (!isLoaded || lastUsedProfileId || !profiles?.length) return;

    // Find the root profile (no parent)
    const rootProfile = profiles.find(p => !p.parentProfileId);
    if (rootProfile) {
      setLastUsedProfileIdState(rootProfile.id);
    }
  }, [isLoaded, lastUsedProfileId, profiles]);

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
