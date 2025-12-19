import { useEffect, useState, useMemo } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInstitutionalProfiles, type InstitutionalProfile, type ProfileType } from '@/hooks/useInstitutionalProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  Dna, 
  Sparkles,
  GraduationCap,
  Layers,
  Building,
  Briefcase,
  ChevronRight
} from 'lucide-react';

interface ContentDNAOption {
  id: string;
  profile_id: string | null;
  profile_name: string | null;
  sample_count: number;
  has_analysis: boolean;
}

interface ContextSelectorProps {
  selectedProfileId: string | null;
  selectedDNAId: string | null;
  onProfileChange: (profileId: string | null) => void;
  onDNAChange: (dnaId: string | null) => void;
  disabled?: boolean;
}

const PROFILE_TYPE_ICONS: Record<ProfileType, React.ReactNode> = {
  university: <Building2 className="w-3.5 h-3.5" />,
  college: <GraduationCap className="w-3.5 h-3.5" />,
  division: <Layers className="w-3.5 h-3.5" />,
  unit: <Building className="w-3.5 h-3.5" />,
  department: <Briefcase className="w-3.5 h-3.5" />,
};

export function ContextSelector({
  selectedProfileId,
  selectedDNAId,
  onProfileChange,
  onDNAChange,
  disabled
}: ContextSelectorProps) {
  const { profiles, isLoading: profilesLoading, getProfile, getRootProfiles, getChildProfiles } = useInstitutionalProfiles();
  const { tenant } = useAuth();
  const [allDnaOptions, setAllDnaOptions] = useState<ContentDNAOption[]>([]);
  const [dnaLoading, setDnaLoading] = useState(false);

  // Fetch all Content DNA options
  useEffect(() => {
    const fetchDNAOptions = async () => {
      if (!tenant) return;
      
      const tenantId = typeof tenant === 'string' ? tenant : tenant.id;
      
      setDnaLoading(true);
      try {
        const { data, error } = await supabase
          .from('content_dna_analysis')
          .select(`
            id,
            profile_id,
            sample_count,
            voice_analysis
          `)
          .eq('tenant_id', tenantId);

        if (error) throw error;

        const options: ContentDNAOption[] = (data || []).map(d => {
          const profile = profiles.find(p => p.id === d.profile_id);
          const hasAnalysis = d.voice_analysis && Object.keys(d.voice_analysis).length > 0;
          return {
            id: d.id,
            profile_id: d.profile_id,
            profile_name: profile?.name || null,
            sample_count: d.sample_count,
            has_analysis: hasAnalysis
          };
        }).filter(o => o.has_analysis);

        setAllDnaOptions(options);
      } catch (error) {
        console.error('Error fetching DNA options:', error);
      } finally {
        setDnaLoading(false);
      }
    };

    fetchDNAOptions();
  }, [tenant, profiles]);

  // Filter DNA options based on selected profile
  const filteredDnaOptions = useMemo(() => {
    if (!selectedProfileId) {
      // If no profile selected, show all DNA options
      return allDnaOptions;
    }
    // Filter to only DNAs that match the selected profile OR have no profile (tenant-level)
    return allDnaOptions.filter(dna => 
      dna.profile_id === selectedProfileId || dna.profile_id === null
    );
  }, [allDnaOptions, selectedProfileId]);

  // Reset DNA selection when profile changes if the current DNA doesn't belong to new profile
  useEffect(() => {
    if (selectedDNAId && selectedProfileId) {
      const currentDna = allDnaOptions.find(d => d.id === selectedDNAId);
      if (currentDna && currentDna.profile_id !== null && currentDna.profile_id !== selectedProfileId) {
        // DNA doesn't match the new profile, reset it
        onDNAChange(null);
      }
    }
  }, [selectedProfileId, selectedDNAId, allDnaOptions, onDNAChange]);

  const selectedProfile = selectedProfileId ? getProfile(selectedProfileId) : null;
  const selectedDna = selectedDNAId ? allDnaOptions.find(d => d.id === selectedDNAId) : null;

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const logoUrl = selectedProfile?.config?.logoUrl || tenant?.logo_url;
  const institutionName = selectedProfile?.config?.institutionName || selectedProfile?.config?.unitName || tenant?.institution_name;

  const rootProfiles = getRootProfiles();

  // Render profile item with proper hierarchy indentation
  const renderProfileItem = (profile: InstitutionalProfile, depth: number = 0) => {
    const children = getChildProfiles(profile.id);
    const displayName = profile.config.unitName || profile.name;
    const typeIcon = PROFILE_TYPE_ICONS[profile.profileType];
    
    return (
      <div key={profile.id}>
        <SelectItem value={profile.id}>
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 12}px` }}>
            <span className="text-muted-foreground">{typeIcon}</span>
            <span className="font-medium">{displayName}</span>
            {profile.profileType !== 'university' && (
              <Badge variant="outline" className="text-[10px] h-4 px-1">
                {profile.profileType}
              </Badge>
            )}
          </div>
        </SelectItem>
        {children.map(child => renderProfileItem(child, depth + 1))}
      </div>
    );
  };

  const handleProfileChange = (value: string) => {
    onProfileChange(value === 'none' ? null : value);
  };

  const handleDnaChange = (value: string) => {
    onDNAChange(value === 'none' ? null : value);
  };

  return (
    <div className="space-y-3">
      {/* Selected Context Card */}
      {(selectedProfile || selectedDna) && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          {logoUrl ? (
            <Avatar className="h-10 w-10 border-2 border-primary/30">
              <AvatarImage src={logoUrl} alt={institutionName || 'Institution'} />
              <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">
                {institutionName ? getInitials(institutionName) : <Building2 className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {selectedProfile && (
                <>
                  <span className="text-muted-foreground">{PROFILE_TYPE_ICONS[selectedProfile.profileType]}</span>
                  <span className="font-semibold text-foreground truncate">
                    {selectedProfile.config.unitName || selectedProfile.name}
                  </span>
                </>
              )}
              {!selectedProfile && institutionName && (
                <span className="font-semibold text-foreground truncate">{institutionName}</span>
              )}
              {selectedDna && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  DNA Active
                </Badge>
              )}
            </div>
            {selectedProfile && selectedProfile.profileType !== 'university' && (
              <p className="text-xs text-muted-foreground truncate">
                {selectedProfile.profileType.charAt(0).toUpperCase() + selectedProfile.profileType.slice(1)}
                {selectedProfile.config.institutionName && ` • ${selectedProfile.config.institutionName}`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Nested Selectors */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Profile Selector */}
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
            <Building2 className="w-3.5 h-3.5" />
            Profile
          </Label>
          <Select
            value={selectedProfileId || 'none'}
            onValueChange={handleProfileChange}
            disabled={disabled || profilesLoading}
          >
            <SelectTrigger className={`h-9 text-sm ${selectedProfile ? 'border-primary/30 bg-primary/5' : ''}`}>
              <SelectValue placeholder="Select profile..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="text-muted-foreground">No profile</span>
              </SelectItem>
              {rootProfiles.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-xs">Institutional Profiles</SelectLabel>
                  {rootProfiles.map(profile => renderProfileItem(profile))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Arrow indicator */}
        <div className="hidden sm:flex items-end pb-2">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* DNA Selector - conditional on profile */}
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
            <Dna className="w-3.5 h-3.5" />
            Content DNA
            {selectedProfileId && filteredDnaOptions.length === 0 && (
              <span className="text-[10px] text-amber-500">(none available)</span>
            )}
          </Label>
          <Select
            value={selectedDNAId || 'none'}
            onValueChange={handleDnaChange}
            disabled={disabled || dnaLoading || filteredDnaOptions.length === 0}
          >
            <SelectTrigger className={`h-9 text-sm ${selectedDna ? 'border-primary/30 bg-primary/5' : ''}`}>
              <SelectValue placeholder={filteredDnaOptions.length === 0 ? "No DNA available" : "Select DNA..."} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="text-muted-foreground">No DNA</span>
              </SelectItem>
              {filteredDnaOptions.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-xs">
                    {selectedProfileId ? 'Available DNA' : 'All Content DNA'}
                  </SelectLabel>
                  {filteredDnaOptions.map((dna) => (
                    <SelectItem key={dna.id} value={dna.id}>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span className="truncate">{dna.profile_name || 'Tenant DNA'}</span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1 ml-auto">
                          {dna.sample_count} samples
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
