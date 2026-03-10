import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveWorkspaceId } from '@/contexts/WorkspaceContext';
import type { InstitutionalConfig } from '@/types/campusvoice';
import type { Json } from '@/integrations/supabase/types';

export type ProfileType = 'university' | 'college' | 'division' | 'unit' | 'department';

export interface InstitutionalProfile {
  id: string;
  name: string;
  config: InstitutionalConfig;
  createdAt: string;
  updatedAt: string;
  createdByUserId?: string;
  parentProfileId?: string | null;
  profileType: ProfileType;
}

const createEmptyConfig = (): InstitutionalConfig => ({
  // Visual Branding
  logoUrl: '',
  logoUrlSecondary: '',
  logoUrlAthletic: '',
  logoUrlPresidential: '',
  primaryColor: '#1F2A44',
  accentColor: '#2C7A7B',
  
  // Identity
  institutionName: '',
  institutionAbbreviation: '',
  mascot: '',
  slogans: [],
  
  // Systems
  portalName: '',
  lmsName: '',
  emailDomain: '',
  advisingSystemName: '',
  schedulingSystemName: '',
  degreeAuditSystem: '',
  financialAidPortal: '',
  registrationSystem: '',
  virtualMeetingPlatform: '',
  
  // Locations
  buildingNames: [],
  programNames: [],
  supportCenters: [],
  libraryName: '',
  tutorCenter: '',
  writingCenter: '',
  mathCenter: '',
  careerCenter: '',
  counselingCenter: '',
  healthCenter: '',
  fitnessCenter: '',
  diningHall: '',
  campusTerms: [],
  defaultMeetingLocation: '',
  
  // Offices
  registrarOffice: '',
  financialAidOffice: '',
  admissionsOffice: '',
  bursarOffice: '',
  itHelpDesk: '',
  housingOffice: '',
  studentAffairsOffice: '',
  internationalOffice: '',
  disabilityServices: '',
  veteransServices: '',
  
  // People
  leaderNames: [],
  advisorTitles: [],
  staffTitles: [],
  defaultAdvisorName: '',
  studentIdTerm: '',
  
  // Contact
  primaryContactEmail: '',
  primaryContactPhone: '',
  advisingEmail: '',
  generalHelpEmail: '',
  emergencyPhone: '',
  textAlertNumber: '',
  websiteLinks: [],
  socialMediaHandles: [],
  appointmentLink: '',
  
  // Terms
  academicTerms: [],
  gradingTerms: [],
  enrollmentTerms: [],
  currentTermName: '',
  nextTermName: '',
  officeHoursFormat: '',
  timeZone: '',
  
  // CTAs
  primaryCTAs: [],
  secondaryCTAs: [],
  urgentCTAs: [],
  
  // Style
  signatureTemplates: [],
  toneRules: [],
  wordsToAvoid: [],
  preferredPhrases: [],
  importantDates: [],
});

export function useInstitutionalProfiles() {
  const { user, tenant } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const [profiles, setProfiles] = useState<InstitutionalProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use workspace id (super admin switched) or fall back to tenant id
  const effectiveTenantId = workspaceId || tenant?.id;

  // Fetch profiles from database
  const fetchProfiles = useCallback(async () => {
    if (!user || !effectiveTenantId) {
      setProfiles([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('institutional_profiles')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setProfiles(
        (data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          config: p.config as InstitutionalConfig,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          createdByUserId: p.created_by_user_id,
          parentProfileId: p.parent_profile_id,
          profileType: (p.profile_type || 'university') as ProfileType,
        }))
      );
    } catch (error) {
      console.error('Error fetching institutional profiles:', error);
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, effectiveTenantId]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const createProfile = useCallback(async (
    name: string, 
    config?: InstitutionalConfig,
    parentProfileId?: string | null,
    profileType: ProfileType = 'university'
  ): Promise<InstitutionalProfile | null> => {
    if (!user || !effectiveTenantId) return null;

    try {
      const { data, error } = await supabase
        .from('institutional_profiles')
        .insert([{
          tenant_id: effectiveTenantId,
          created_by_user_id: user.id,
          name,
          config: JSON.parse(JSON.stringify(config || createEmptyConfig())) as Json,
          parent_profile_id: parentProfileId || null,
          profile_type: profileType,
        }])
        .select()
        .single();

      if (error) throw error;

      const newProfile: InstitutionalProfile = {
        id: data.id,
        name: data.name,
        config: data.config as InstitutionalConfig,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdByUserId: data.created_by_user_id,
        parentProfileId: data.parent_profile_id,
        profileType: (data.profile_type || 'university') as ProfileType,
      };

      setProfiles(prev => [newProfile, ...prev]);
      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  }, [user, tenant?.id]);

  // Get children of a profile
  const getChildProfiles = useCallback((parentId: string): InstitutionalProfile[] => {
    return profiles.filter(p => p.parentProfileId === parentId);
  }, [profiles]);

  // Get parent of a profile
  const getParentProfile = useCallback((profileId: string): InstitutionalProfile | undefined => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile?.parentProfileId) return undefined;
    return profiles.find(p => p.id === profile.parentProfileId);
  }, [profiles]);

  // Get root (university) profiles only
  const getRootProfiles = useCallback((): InstitutionalProfile[] => {
    return profiles.filter(p => !p.parentProfileId);
  }, [profiles]);

  const updateProfile = useCallback(async (id: string, updates: Partial<Pick<InstitutionalProfile, 'name' | 'config'>>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.config !== undefined) updateData.config = JSON.parse(JSON.stringify(updates.config));

      const { error } = await supabase
        .from('institutional_profiles')
        .update(updateData as any)
        .eq('id', id);

      if (error) throw error;

      setProfiles(prev => prev.map(p =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      ));
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, []);

  const deleteProfile = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('institutional_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProfiles(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  }, []);

  const duplicateProfile = useCallback(async (
    id: string, 
    newName: string,
    asSubUnit?: { parentProfileId: string; profileType: ProfileType }
  ): Promise<InstitutionalProfile | null> => {
    const original = profiles.find(p => p.id === id);
    if (!original || !user || !tenant?.id) return null;

    try {
      const { data, error } = await supabase
        .from('institutional_profiles')
        .insert([{
          tenant_id: tenant.id,
          created_by_user_id: user.id,
          name: newName,
          config: JSON.parse(JSON.stringify(original.config)) as Json,
          parent_profile_id: asSubUnit?.parentProfileId || original.parentProfileId || null,
          profile_type: asSubUnit?.profileType || original.profileType,
        }])
        .select()
        .single();

      if (error) throw error;

      const newProfile: InstitutionalProfile = {
        id: data.id,
        name: data.name,
        config: data.config as InstitutionalConfig,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdByUserId: data.created_by_user_id,
        parentProfileId: data.parent_profile_id,
        profileType: (data.profile_type || 'university') as ProfileType,
      };

      setProfiles(prev => [newProfile, ...prev]);
      return newProfile;
    } catch (error) {
      console.error('Error duplicating profile:', error);
      return null;
    }
  }, [profiles, user, tenant?.id]);

  const getProfile = useCallback((id: string): InstitutionalProfile | undefined => {
    return profiles.find(p => p.id === id);
  }, [profiles]);

  // Build the full hierarchy path for a profile (e.g., "Ohio State > College of Arts and Sciences")
  const getProfileHierarchy = useCallback((profileId: string): { path: string; profiles: InstitutionalProfile[] } => {
    const hierarchy: InstitutionalProfile[] = [];
    let currentId: string | null | undefined = profileId;
    
    while (currentId) {
      const profile = profiles.find(p => p.id === currentId);
      if (profile) {
        hierarchy.unshift(profile); // Add to beginning to build top-down path
        currentId = profile.parentProfileId;
      } else {
        break;
      }
    }
    
    return {
      path: hierarchy.map(p => p.name).join(' > '),
      profiles: hierarchy,
    };
  }, [profiles]);

  return {
    profiles,
    isLoading,
    createProfile,
    updateProfile,
    deleteProfile,
    duplicateProfile,
    getProfile,
    getChildProfiles,
    getParentProfile,
    getRootProfiles,
    getProfileHierarchy,
    hasProfiles: profiles.length > 0,
    refreshProfiles: fetchProfiles,
  };
}
