import { useAuth } from "@/contexts/AuthContext";

interface AgencyLabels {
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
}

interface AgencyModeResult {
  isAgency: boolean;
  isUniversity: boolean;
  tenantType: 'university' | 'agency' | null;
  labels: AgencyLabels;
}

export function useAgencyMode(): AgencyModeResult {
  const { tenant } = useAuth();
  
  // Type assertion since tenant_type is new and may not be in types yet
  const tenantType = (tenant as any)?.tenant_type as 'university' | 'agency' | null;
  const isAgency = tenantType === 'agency';
  const isUniversity = tenantType === 'university' || !tenantType;

  const labels: AgencyLabels = isAgency
    ? {
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
      }
    : {
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
      };

  return {
    isAgency,
    isUniversity,
    tenantType,
    labels,
  };
}
