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
  ChevronDown
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

  // Fetch all Content DNA options — scope to selected profile's tenant when available
  useEffect(() => {
    const fetchDNAOptions = async () => {
      if (!tenant && profiles.length === 0) return;
      setDnaLoading(true);
      try {
        // Build query — if a profile is selected, scope to that profile's tenant
        // This ensures cross-tenant super-admin workflows see the correct DNA
        let query = supabase
          .from('content_dna_analysis')
          .select('id, profile_id, sample_count, voice_analysis, tenant_id');

        if (selectedProfileId) {
          // Find the selected profile to get its tenant_id
          const selectedProfile = profiles.find(p => p.id === selectedProfileId);
          if (selectedProfile) {
            // Query by profile_id directly — RLS will handle access
            query = query.eq('profile_id', selectedProfileId);
          }
        } else {
          // No profile selected — fall back to user's tenant
          const tenantId = typeof tenant === 'string' ? tenant : tenant?.id;
          if (tenantId) {
            query = query.eq('tenant_id', tenantId);
          }
        }

        const { data, error } = await query;
        if (error) throw error;
        const options: ContentDNAOption[] = (data || []).map(d => {
          const profile = profiles.find(p => p.id === d.profile_id);
          const hasAnalysis = d.voice_analysis && Object.keys(d.voice_analysis).length > 0;
          return {
            id: d.id, profile_id: d.profile_id, profile_name: profile?.name || null,
            sample_count: d.sample_count, has_analysis: hasAnalysis
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
  }, [tenant, profiles, selectedProfileId]);

  const filteredDnaOptions = useMemo(() => {
    if (!selectedProfileId) return allDnaOptions;
    return allDnaOptions.filter(dna => dna.profile_id === selectedProfileId || dna.profile_id === null);
  }, [allDnaOptions, selectedProfileId]);

  // When profile changes, auto-select matching DNA or clear mismatched DNA
  useEffect(() => {
    if (!selectedProfileId) return;
    
    // If current DNA doesn't belong to this profile, clear it
    if (selectedDNAId) {
      const currentDna = allDnaOptions.find(d => d.id === selectedDNAId);
      if (currentDna && currentDna.profile_id !== null && currentDna.profile_id !== selectedProfileId) {
        // Auto-select the profile's DNA if available
        const profileDna = allDnaOptions.find(d => d.profile_id === selectedProfileId);
        onDNAChange(profileDna?.id || null);
        return;
      }
    }
    
    // No DNA selected yet — auto-select if this profile has DNA
    if (!selectedDNAId) {
      const profileDna = allDnaOptions.find(d => d.profile_id === selectedProfileId);
      if (profileDna) {
        onDNAChange(profileDna.id);
      }
    }
  }, [selectedProfileId, selectedDNAId, allDnaOptions, onDNAChange]);

  const selectedProfile = selectedProfileId ? getProfile(selectedProfileId) : null;
  const selectedDna = selectedDNAId ? allDnaOptions.find(d => d.id === selectedDNAId) : null;

  const logoUrl = selectedProfile?.config?.logoUrl || tenant?.logo_url;

  const rootProfiles = getRootProfiles();

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
              <Badge variant="outline" className="text-[10px] h-4 px-1">{profile.profileType}</Badge>
            )}
          </div>
        </SelectItem>
        {children.map(child => renderProfileItem(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Profile pill */}
      <Select
        value={selectedProfileId || 'none'}
        onValueChange={(v) => onProfileChange(v === 'none' ? null : v)}
        disabled={disabled || profilesLoading}
      >
        <SelectTrigger className="h-8 w-auto min-w-0 max-w-[240px] text-xs border-border/50 rounded-lg gap-1.5 bg-background hover:bg-muted/50 transition-colors">
          {selectedProfile ? (
            <div className="flex items-center gap-1.5 truncate">
              {logoUrl ? (
                <Avatar className="h-4 w-4">
                  <AvatarImage src={logoUrl} />
                  <AvatarFallback className="text-[8px] bg-primary/10">{selectedProfile.name[0]}</AvatarFallback>
                </Avatar>
              ) : (
                <span className="text-muted-foreground">{PROFILE_TYPE_ICONS[selectedProfile.profileType]}</span>
              )}
              <span className="truncate font-medium">{selectedProfile.config.unitName || selectedProfile.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="w-3.5 h-3.5" />
              <span>Profile</span>
            </div>
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">No profile</span>
          </SelectItem>
          {rootProfiles.length > 0 && (
            <SelectGroup>
              <SelectLabel className="text-xs">Profiles</SelectLabel>
              {rootProfiles.map(profile => renderProfileItem(profile))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>

      {/* DNA pill */}
      <Select
        value={selectedDNAId || 'none'}
        onValueChange={(v) => onDNAChange(v === 'none' ? null : v)}
        disabled={disabled || dnaLoading || filteredDnaOptions.length === 0}
      >
        <SelectTrigger className="h-8 w-auto min-w-0 max-w-[200px] text-xs border-border/50 rounded-lg gap-1.5 bg-background hover:bg-muted/50 transition-colors">
          {selectedDna ? (
            <div className="flex items-center gap-1.5 text-primary truncate">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span className="truncate font-medium">DNA Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Dna className="w-3.5 h-3.5" />
              <span>{filteredDnaOptions.length === 0 ? "No DNA" : "DNA"}</span>
            </div>
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">No DNA</span>
          </SelectItem>
          {filteredDnaOptions.length > 0 && (
            <SelectGroup>
              <SelectLabel className="text-xs">Content DNA</SelectLabel>
              {filteredDnaOptions.map((dna) => (
                <SelectItem key={dna.id} value={dna.id}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="truncate">{dna.profile_name || 'Tenant DNA'}</span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 ml-auto">
                      {dna.sample_count}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
