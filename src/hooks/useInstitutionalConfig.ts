import { useState, useEffect } from 'react';
import type { InstitutionalConfig } from '@/types/persist';

const STORAGE_KEY = 'persist_institutional_config';

const defaultConfig: InstitutionalConfig = {
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
