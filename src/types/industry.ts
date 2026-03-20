/**
 * Industry Vocabulary System
 * 
 * This module defines the industry-agnostic abstraction layer that allows
 * the platform to adapt its terminology, filters, and AI prompts based
 * on the tenant's industry type.
 */

// ─── Tenant Industry Types ──────────────────────────────────────────

export type TenantType = 
  | 'university'
  | 'agency'
  | 'enterprise'
  | 'franchise'
  | 'nonprofit'
  | 'healthcare'
  | 'financial';

export type IndustryVertical =
  // Enterprise verticals
  | 'manufacturing'
  | 'technology'
  | 'retail'
  | 'cpg'
  | 'automotive'
  | 'energy'
  // Franchise verticals
  | 'food-service'
  | 'hospitality'
  | 'fitness'
  | 'home-services'
  | 'automotive-dealer'
  // Nonprofit verticals
  | 'advocacy'
  | 'humanitarian'
  | 'environmental'
  | 'education-nonprofit'
  | 'faith-based'
  // Healthcare verticals
  | 'hospital-system'
  | 'insurance'
  | 'pharma'
  | 'dental'
  | 'behavioral-health'
  // Financial verticals
  | 'banking'
  | 'wealth-management'
  | 'insurance-financial'
  | 'credit-union'
  | string; // Allow custom verticals

// ─── Audience Definitions ───────────────────────────────────────────

export interface IndustryAudience {
  id: string;                  // machine key, e.g. 'prospect'
  label: string;               // display label, e.g. 'Prospective Student' or 'Sales Lead'
  description: string;         // tooltip/help text
  icon?: string;               // lucide icon name
}

export interface IndustryCohort {
  id: string;
  label: string;
  audienceIds: string[];       // which audiences this cohort applies to
}

export interface IndustryMoment {
  id: string;
  label: string;
  description: string;
  audienceIds?: string[];      // if scoped to specific audiences
  category?: string;           // grouping label for the UI
}

export interface IndustryDomain {
  id: string;
  label: string;
  description: string;
}

export interface IndustryGoal {
  id: string;
  label: string;
  description: string;
}

export interface IndustryDepartment {
  id: string;
  label: string;
  description: string;
}

export interface IndustryStoryType {
  id: string;
  label: string;
  icon?: string;               // lucide icon name
}

// ─── Label Overrides ────────────────────────────────────────────────

/**
 * Maps generic platform terms to industry-specific labels.
 * Components read from this to display contextual terminology.
 */
export interface IndustryLabels {
  // Organization terminology
  organization: string;         // "University" | "Company" | "Organization"
  organizationShort: string;    // "Univ." | "Co." | "Org."
  organizationPlural: string;   // "Universities" | "Companies" | "Organizations"
  organizationSettings: string; // "University Settings" | "Organization Settings"
  organizationAdmin: string;    // "University Admin" | "Organization Admin"
  organizationUser: string;     // "University User" | "Team Member"
  
  // People terminology
  primaryAudience: string;      // "Students" | "Customers" | "Members" | "Patients"
  primaryAudienceSingular: string; // "Student" | "Customer" | "Member"
  supporter: string;            // "Donor" | "Investor" | "Sponsor"
  alumnus: string;              // "Alumnus" | "Former Customer" | "Past Member"
  alumniPlural: string;         // "Alumni" | "Former Customers" | "Past Members"
  staff: string;                // "Faculty & Staff" | "Employees" | "Team"
  leader: string;               // "President" | "CEO" | "Executive Director"
  leaderTitle: string;          // "President" | "CEO" | "Executive Director"
  
  // Structural terminology
  subUnit: string;              // "College/School" | "Division" | "Chapter" | "Region"
  subUnitPlural: string;        // "Colleges & Schools" | "Divisions" | "Chapters"
  location: string;             // "Campus" | "Office" | "Branch" | "Facility"
  locationPlural: string;       // "Campuses" | "Offices" | "Branches"
  
  // Process terminology
  enrollment: string;           // "Enrollment" | "Onboarding" | "Sign-Up"
  graduation: string;           // "Graduation" | "Completion" | "Certification"
  term: string;                 // "Semester" | "Quarter" | "Fiscal Period"
  
  // Content & brand
  photography: string;          // "Campus Photography" | "Brand Photography"
  storyBank: string;            // "Story Bank" | "Success Stories"
  factBook: string;             // "Fact Book" | "Key Metrics"
  
  // AI prompt context
  industryContext: string;      // "higher education" | "enterprise franchise" | "nonprofit"
  contentStyle: string;         // "institutional communications" | "brand marketing" | "donor relations"
}

// ─── Full Industry Vocabulary Config ────────────────────────────────

export interface IndustryVocabulary {
  tenantType: TenantType;
  vertical?: IndustryVertical;
  labels: IndustryLabels;
  audiences: IndustryAudience[];
  cohorts: IndustryCohort[];
  moments: IndustryMoment[];
  domains: IndustryDomain[];
  goals: IndustryGoal[];
  departments: IndustryDepartment[];
  storyTypes: IndustryStoryType[];
  
  // Config field relevance — which InstitutionalConfig fields are relevant
  relevantConfigFields: string[];
  
  // Institution classification options for this industry
  classificationOptions: { value: string; label: string; description: string }[];
}

// ─── Helper type for components ─────────────────────────────────────

export function isHigherEd(tenantType: TenantType | null | undefined): boolean {
  return !tenantType || tenantType === 'university';
}

export function isAgency(tenantType: TenantType | null | undefined): boolean {
  return tenantType === 'agency';
}

export function isEnterprise(tenantType: TenantType | null | undefined): boolean {
  return tenantType === 'enterprise' || tenantType === 'franchise' || tenantType === 'financial';
}

export function isNonprofit(tenantType: TenantType | null | undefined): boolean {
  return tenantType === 'nonprofit';
}

export function isHealthcare(tenantType: TenantType | null | undefined): boolean {
  return tenantType === 'healthcare';
}
