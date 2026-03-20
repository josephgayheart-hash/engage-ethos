import { createContext, useContext, useMemo, ReactNode } from 'react';
import type { IndustryVocabulary, IndustryLabels, IndustryAudience, IndustryMoment, IndustryDomain, IndustryGoal, IndustryCohort, IndustryDepartment, IndustryStoryType } from '@/types/industry';
import { getVocabularyForTenant } from '@/config/industry-vocabularies';
import { useAuth } from '@/contexts/AuthContext';

interface IndustryContextValue {
  /** The full resolved vocabulary for the current tenant */
  vocabulary: IndustryVocabulary;
  /** Shortcut to vocabulary.labels */
  labels: IndustryLabels;
  /** Industry-aware audience list */
  audiences: IndustryAudience[];
  /** Industry-aware cohort list */
  cohorts: IndustryCohort[];
  /** Industry-aware moment list */
  moments: IndustryMoment[];
  /** Industry-aware domain list */
  domains: IndustryDomain[];
  /** Industry-aware goal list */
  goals: IndustryGoal[];
  /** Industry-aware department list */
  departments: IndustryDepartment[];
  /** Industry-aware story types */
  storyTypes: IndustryStoryType[];
  /** Get filtered cohorts for a given audience */
  getCohortsForAudience: (audienceId: string) => IndustryCohort[];
  /** Get filtered moments for a given audience (if scoped) */
  getMomentsForAudience: (audienceId: string) => IndustryMoment[];
  /** Resolve a label, with optional override from tenant's industry_config */
  label: (key: keyof IndustryLabels) => string;
  /** Whether this is a higher-ed workspace */
  isHigherEd: boolean;
  /** Whether this is an enterprise/franchise/financial workspace */
  isEnterprise: boolean;
}

const IndustryContext = createContext<IndustryContextValue | null>(null);

interface IndustryProviderProps {
  children: ReactNode;
  /** Optional override for testing/preview — if not provided, reads from AuthContext tenant */
  tenantType?: string | null;
  /** Optional override from tenant's industry_config JSON */
  industryConfigOverrides?: Record<string, unknown>;
}

export function IndustryProvider({ children, tenantType: tenantTypeOverride, industryConfigOverrides }: IndustryProviderProps) {
  const { tenant } = useAuth();
  
  const effectiveTenantType = tenantTypeOverride ?? tenant?.tenant_type ?? null;

  const value = useMemo<IndustryContextValue>(() => {
    const vocabulary = getVocabularyForTenant(effectiveTenantType);
    
    // Merge any label overrides from the tenant's industry_config
    const overrideLabels = (industryConfigOverrides as any)?.labelOverrides as Partial<IndustryLabels> | undefined;
    const labels: IndustryLabels = overrideLabels
      ? { ...vocabulary.labels, ...overrideLabels }
      : vocabulary.labels;

    const getCohortsForAudience = (audienceId: string) =>
      vocabulary.cohorts.filter(
        c => c.audienceIds.length === 0 || c.audienceIds.includes(audienceId)
      );

    const getMomentsForAudience = (audienceId: string) =>
      vocabulary.moments.filter(
        m => !m.audienceIds || m.audienceIds.length === 0 || m.audienceIds.includes(audienceId)
      );

    const label = (key: keyof IndustryLabels) => labels[key];

    const isHigherEd = !effectiveTenantType || effectiveTenantType === 'university' || effectiveTenantType === 'agency';
    const isEnterprise = effectiveTenantType === 'enterprise' || effectiveTenantType === 'franchise' || effectiveTenantType === 'financial';

    return {
      vocabulary,
      labels,
      audiences: vocabulary.audiences,
      cohorts: vocabulary.cohorts,
      moments: vocabulary.moments,
      domains: vocabulary.domains,
      goals: vocabulary.goals,
      departments: vocabulary.departments,
      storyTypes: vocabulary.storyTypes,
      getCohortsForAudience,
      getMomentsForAudience,
      label,
      isHigherEd,
      isEnterprise,
    };
  }, [effectiveTenantType, industryConfigOverrides]);

  return (
    <IndustryContext.Provider value={value}>
      {children}
    </IndustryContext.Provider>
  );
}

/**
 * Access the industry vocabulary context.
 * Must be used within an IndustryProvider.
 * 
 * @example
 * const { labels, audiences, moments } = useIndustry();
 * // labels.organization → "University" or "Company"
 * // audiences → industry-specific audience list for dropdowns
 */
export function useIndustry(): IndustryContextValue {
  const ctx = useContext(IndustryContext);
  if (!ctx) {
    throw new Error('useIndustry must be used within an IndustryProvider');
  }
  return ctx;
}
