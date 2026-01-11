import { useState, useEffect } from 'react';
import type { InstitutionalConfig } from '@/types/campusvoice';

const STORAGE_KEY = 'campusvoice_institutional_config';

const defaultConfig: InstitutionalConfig = {
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
};

export function useInstitutionalConfig() {
  const [config, setConfig] = useState<InstitutionalConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultConfig;
    } catch {
      return defaultConfig;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const updateConfig = (newConfig: InstitutionalConfig) => {
    setConfig(newConfig);
  };

  const hasConfig = Object.values(config).some(v => 
    (Array.isArray(v) && v.length > 0) || (typeof v === 'string' && v.length > 0)
  );

  return { config, updateConfig, hasConfig };
}
