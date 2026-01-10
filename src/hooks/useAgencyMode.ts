import { useAuth } from "@/contexts/AuthContext";

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
  tenantType: 'university' | 'agency' | null;
  labels: AgencyLabels;
}

export function useAgencyMode(): AgencyModeResult {
  const { tenant } = useAuth();
  
  // tenant_type is now in the DB types
  const tenantType = tenant?.tenant_type as 'university' | 'agency' | null;
  const isAgency = tenantType === 'agency';
  const isUniversity = tenantType === 'university' || !tenantType;

  const labels: AgencyLabels = isAgency
    ? {
        // Navigation & Header
        profile: 'Client',
        profiles: 'Clients',
        addProfile: 'Add Client',
        settings: 'Clients',
        settingsPath: '/agency/clients',
        library: 'Templates',
        selectProfile: 'Select Client',
        noProfiles: 'No clients configured yet',
        profileType: 'client',
        dashboard: 'Client Hub',
        dashboardPath: '/agency/dashboard',
        
        // Settings Page
        settingsPageTitle: 'Client Management',
        settingsPageDescription: 'Manage your client universities and their accounts',
        createProfileButton: 'Add University Client',
        profileTerm: 'University Account',
        subUnitTerm: 'Sub-account',
        manageProfilesLabel: 'Manage Client Accounts',
        
        // Wizard
        wizardTitle: 'Add University Client',
        wizardDescription: 'Set up a new university client account with their brand identity',
        identityStepTitle: 'Client Identity',
        identityStepDescription: 'Enter the university client\'s basic information',
        institutionNameLabel: 'University Name',
        institutionNamePlaceholder: 'Enter client university name',
        institutionNameHelper: 'The official name of the university you\'re adding as a client',
        logoLabel: 'Client Logo',
        logoHelper: 'Upload the university\'s official logo',
        
        // Sub-unit wizard
        subUnitWizardTitle: 'Add Sub-account',
        subUnitWizardDescription: 'Create a sub-account within this university client',
        
        // Profile selector
        selectorLabel: 'Select Client',
        selectorPlaceholder: 'Choose a client university',
        selectorEmptyState: 'No client accounts configured. Add a client to get started.',
        
        // Account type
        accountType: 'Agency Partner',
        accountTypeLabel: 'Partner Account',
      }
    : {
        // Navigation & Header
        profile: 'Profile',
        profiles: 'Profiles',
        addProfile: 'Create Profile',
        settings: 'University Settings',
        settingsPath: '/university-settings',
        library: 'Library',
        selectProfile: 'Generate As',
        noProfiles: 'No profiles configured yet',
        profileType: 'institutional',
        dashboard: 'Dashboard',
        dashboardPath: '/',
        
        // Settings Page
        settingsPageTitle: 'University Settings',
        settingsPageDescription: 'Manage your institution\'s profiles and sub-units',
        createProfileButton: 'Create Profile',
        profileTerm: 'Profile',
        subUnitTerm: 'Sub-unit',
        manageProfilesLabel: 'Manage Profiles',
        
        // Wizard
        wizardTitle: 'Create Institutional Profile',
        wizardDescription: 'Set up a new institutional profile for your organization',
        identityStepTitle: 'Institution Identity',
        identityStepDescription: 'Enter your institution\'s basic information',
        institutionNameLabel: 'Institution Name',
        institutionNamePlaceholder: 'Enter institution name',
        institutionNameHelper: 'The official name of your institution',
        logoLabel: 'Institution Logo',
        logoHelper: 'Upload your institution\'s official logo',
        
        // Sub-unit wizard
        subUnitWizardTitle: 'Create Sub-unit',
        subUnitWizardDescription: 'Create a sub-unit within this profile',
        
        // Profile selector
        selectorLabel: 'Generate As',
        selectorPlaceholder: 'Select a profile',
        selectorEmptyState: 'No institutional profiles configured. Create one in University Settings.',
        
        // Account type
        accountType: 'University',
        accountTypeLabel: 'Institution Account',
      };

  return {
    isAgency,
    isUniversity,
    tenantType,
    labels,
  };
}
