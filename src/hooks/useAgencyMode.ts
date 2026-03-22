import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useIndustry } from "@/contexts/IndustryContext";

interface AgencyLabels {
  // Navigation & Header
  profile: string;
  profiles: string;
  addProfile: string;
  settings: string;
  settingsPath: string;
  library: string;
  selectProfile: string;
  noProfiles: string;
  profileType: string;
  dashboard: string;
  dashboardPath: string;
  
  // Settings Page
  settingsPageTitle: string;
  settingsPageDescription: string;
  createProfileButton: string;
  profileTerm: string;
  subUnitTerm: string;
  manageProfilesLabel: string;
  
  // Wizard
  wizardTitle: string;
  wizardDescription: string;
  identityStepTitle: string;
  identityStepDescription: string;
  institutionNameLabel: string;
  institutionNamePlaceholder: string;
  institutionNameHelper: string;
  logoLabel: string;
  logoHelper: string;
  
  // Sub-unit wizard
  subUnitWizardTitle: string;
  subUnitWizardDescription: string;
  
  // Profile selector
  selectorLabel: string;
  selectorPlaceholder: string;
  selectorEmptyState: string;
  
  // Account type
  accountType: string;
  accountTypeLabel: string;
}

interface AgencyModeResult {
  isAgency: boolean;
  isUniversity: boolean;
  tenantType: string | null;
  labels: AgencyLabels;
}

export function useAgencyMode(): AgencyModeResult {
  const { tenant } = useAuth();
  const { activeWorkspace, canSwitch } = useWorkspace();
  const { labels: industryLabels, isHigherEd } = useIndustry();
  
  // Use active workspace when super admin is switching workspaces
  const effectiveTenant = canSwitch && activeWorkspace ? activeWorkspace : tenant;
  
  const tenantType = (effectiveTenant as any)?.tenant_type as string | null;
  const isAgency = tenantType === 'agency';
  const isUniversity = tenantType === 'university' || !tenantType;

  const labels: AgencyLabels = isAgency
    ? {
        // Navigation & Header
        profile: 'Partner Institution',
        profiles: 'Partner Institutions',
        addProfile: 'Add Partner Institution',
        settings: 'Partner Institutions',
        settingsPath: '/agency/clients',
        library: 'Templates',
        selectProfile: 'Select Institution',
        noProfiles: 'No partner institutions configured yet',
        profileType: 'partner',
        dashboard: 'Partner Hub',
        dashboardPath: '/agency/dashboard',
        
        // Settings Page
        settingsPageTitle: 'Partner Institutions',
        settingsPageDescription: 'Manage the institutions you serve and their brand configurations',
        createProfileButton: 'Add Partner Institution',
        profileTerm: 'Institution Profile',
        subUnitTerm: 'Sub-unit',
        manageProfilesLabel: 'Manage Partner Institutions',
        
        // Wizard
        wizardTitle: 'Add Partner Institution',
        wizardDescription: 'Set up a new partner institution with their brand identity',
        identityStepTitle: 'Institution Identity',
        identityStepDescription: 'Enter the institution\'s basic information',
        institutionNameLabel: 'Institution Name',
        institutionNamePlaceholder: 'Enter institution name',
        institutionNameHelper: 'The official name of the institution you\'re partnering with',
        logoLabel: 'Institution Logo',
        logoHelper: 'Upload the institution\'s official logo',
        
        // Sub-unit wizard
        subUnitWizardTitle: 'Add Sub-unit',
        subUnitWizardDescription: 'Create a sub-unit within this partner institution',
        
        // Profile selector
        selectorLabel: 'Select Institution',
        selectorPlaceholder: 'Choose a partner institution',
        selectorEmptyState: 'No partner institutions configured. Add one to get started.',
        
        // Account type
        accountType: 'Agency Partner',
        accountTypeLabel: 'Agency Partner Account',
      }
    : {
        // Navigation & Header
        profile: 'Profile',
        profiles: 'Profiles',
        addProfile: 'Create Profile',
        settings: industryLabels.organizationSettings,
        settingsPath: '/university-settings',
        library: 'Library',
        selectProfile: 'Generate As',
        noProfiles: 'No profiles configured yet',
        profileType: 'institutional',
        dashboard: 'Dashboard',
        dashboardPath: '/',
        
        // Settings Page
        settingsPageTitle: industryLabels.organizationSettings,
        settingsPageDescription: `Manage your ${industryLabels.organization.toLowerCase()}'s profiles and sub-units`,
        createProfileButton: 'Create Profile',
        profileTerm: 'Profile',
        subUnitTerm: isHigherEd ? 'Sub-unit' : industryLabels.subUnit,
        manageProfilesLabel: 'Manage Profiles',
        
        // Wizard
        wizardTitle: `Create ${industryLabels.organization} Profile`,
        wizardDescription: `Set up a new ${industryLabels.organization.toLowerCase()} profile for your organization`,
        identityStepTitle: `${industryLabels.organization} Identity`,
        identityStepDescription: `Enter your ${industryLabels.organization.toLowerCase()}'s basic information`,
        institutionNameLabel: `${industryLabels.organization} Name`,
        institutionNamePlaceholder: `Enter ${industryLabels.organization.toLowerCase()} name`,
        institutionNameHelper: `The official name of your ${industryLabels.organization.toLowerCase()}`,
        logoLabel: `${industryLabels.organization} Logo`,
        logoHelper: `Upload your ${industryLabels.organization.toLowerCase()}'s official logo`,
        
        // Sub-unit wizard
        subUnitWizardTitle: isHigherEd ? 'Create Sub-unit' : `Add ${industryLabels.subUnit}`,
        subUnitWizardDescription: isHigherEd ? 'Create a sub-unit within this profile' : `Create a ${industryLabels.subUnit.toLowerCase()} within this profile`,
        
        // Profile selector
        selectorLabel: 'Generate As',
        selectorPlaceholder: 'Select a profile',
        selectorEmptyState: `No profiles configured. Create one in ${industryLabels.organizationSettings}.`,
        
        // Account type
        accountType: industryLabels.organization,
        accountTypeLabel: `${industryLabels.organization} Account`,
      };

  return {
    isAgency,
    isUniversity,
    tenantType,
    labels,
  };
}
