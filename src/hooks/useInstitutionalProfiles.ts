import { useState, useEffect, useCallback } from 'react';
import type { InstitutionalConfig } from '@/types/persist';

export interface InstitutionalProfile {
  id: string;
  name: string;
  config: InstitutionalConfig;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'persist_institutional_profiles';

const createEmptyConfig = (): InstitutionalConfig => ({
  buildingNames: [],
  programNames: [],
  supportCenters: [],
  mascot: '',
  slogans: [],
  leaderNames: [],
  advisorTitles: [],
  staffTitles: [],
  toneRules: [],
  wordsToAvoid: [],
  preferredPhrases: [],
  primaryCTAs: [],
  secondaryCTAs: [],
  urgentCTAs: [],
  signatureTemplates: [],
  importantDates: [],
  academicTerms: [],
  gradingTerms: [],
  enrollmentTerms: [],
  websiteLinks: [],
  socialMediaHandles: [],
});

export function useInstitutionalProfiles() {
  const [profiles, setProfiles] = useState<InstitutionalProfile[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  }, [profiles]);

  const createProfile = useCallback((name: string, config?: InstitutionalConfig): InstitutionalProfile => {
    const newProfile: InstitutionalProfile = {
      id: crypto.randomUUID(),
      name,
      config: config || createEmptyConfig(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProfiles(prev => [...prev, newProfile]);
    return newProfile;
  }, []);

  const updateProfile = useCallback((id: string, updates: Partial<Pick<InstitutionalProfile, 'name' | 'config'>>) => {
    setProfiles(prev => prev.map(p => 
      p.id === id 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ));
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
  }, []);

  const duplicateProfile = useCallback((id: string, newName: string): InstitutionalProfile | null => {
    const original = profiles.find(p => p.id === id);
    if (!original) return null;
    
    const newProfile: InstitutionalProfile = {
      id: crypto.randomUUID(),
      name: newName,
      config: { ...original.config },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProfiles(prev => [...prev, newProfile]);
    return newProfile;
  }, [profiles]);

  const getProfile = useCallback((id: string): InstitutionalProfile | undefined => {
    return profiles.find(p => p.id === id);
  }, [profiles]);

  return {
    profiles,
    createProfile,
    updateProfile,
    deleteProfile,
    duplicateProfile,
    getProfile,
    hasProfiles: profiles.length > 0,
  };
}
