/**
 * Industry Vocabulary Registry
 * 
 * Central barrel export for all industry vocabulary configurations.
 * Import getVocabularyForTenant() to resolve the correct vocabulary
 * based on a tenant's type.
 */

import type { TenantType, IndustryVocabulary } from '@/types/industry';
import { higherEdVocabulary } from './higher-ed';
import { enterpriseVocabulary } from './enterprise';
import { franchiseVocabulary } from './franchise';
import { nonprofitVocabulary } from './nonprofit';
import { healthcareVocabulary } from './healthcare';
import { financialVocabulary } from './financial';

const vocabularyRegistry: Record<TenantType, IndustryVocabulary> = {
  university: higherEdVocabulary,
  agency: higherEdVocabulary, // Agency partners serve higher-ed clients by default
  enterprise: enterpriseVocabulary,
  franchise: franchiseVocabulary,
  nonprofit: nonprofitVocabulary,
  healthcare: healthcareVocabulary,
  financial: financialVocabulary,
};

/**
 * Resolves the correct industry vocabulary for a given tenant type.
 * Falls back to higher-ed vocabulary if type is unknown or null.
 */
export function getVocabularyForTenant(tenantType: TenantType | string | null | undefined): IndustryVocabulary {
  if (!tenantType) return higherEdVocabulary;
  return vocabularyRegistry[tenantType as TenantType] ?? higherEdVocabulary;
}

export {
  higherEdVocabulary,
  enterpriseVocabulary,
  franchiseVocabulary,
  nonprofitVocabulary,
  healthcareVocabulary,
  financialVocabulary,
  vocabularyRegistry,
};
