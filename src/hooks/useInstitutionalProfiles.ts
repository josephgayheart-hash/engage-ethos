import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { InstitutionalConfig } from '@/types/uplaybook';
import type { Json } from '@/integrations/supabase/types';

export interface InstitutionalProfile {
  id: string;
  name: string;
  config: InstitutionalConfig;
  createdAt: string;
  updatedAt: string;
  createdByUserId?: string;
}

const createEmptyConfig = (): InstitutionalConfig => ({
  // Visual Branding
  logoUrl: '',
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
  const [profiles, setProfiles] = useState<InstitutionalProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profiles from database
  const fetchProfiles = useCallback(async () => {
    if (!user || !tenant?.id) {
      setProfiles([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('institutional_profiles')
        .select('*')
        .eq('tenant_id', tenant.id)
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
        }))
      );
    } catch (error) {
      console.error('Error fetching institutional profiles:', error);
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, tenant?.id]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const createProfile = useCallback(async (name: string, config?: InstitutionalConfig): Promise<InstitutionalProfile | null> => {
    if (!user || !tenant?.id) return null;

    try {
      const { data, error } = await supabase
        .from('institutional_profiles')
        .insert([{
          tenant_id: tenant.id,
          created_by_user_id: user.id,
          name,
          config: JSON.parse(JSON.stringify(config || createEmptyConfig())) as Json,
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
      };

      setProfiles(prev => [newProfile, ...prev]);
      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  }, [user, tenant?.id]);

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

  const duplicateProfile = useCallback(async (id: string, newName: string): Promise<InstitutionalProfile | null> => {
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

  return {
    profiles,
    isLoading,
    createProfile,
    updateProfile,
    deleteProfile,
    duplicateProfile,
    getProfile,
    hasProfiles: profiles.length > 0,
    refreshProfiles: fetchProfiles,
  };
}
