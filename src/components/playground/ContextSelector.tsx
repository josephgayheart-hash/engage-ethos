import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useInstitutionalProfiles } from '@/hooks/useInstitutionalProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Dna, Sparkles } from 'lucide-react';

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

export function ContextSelector({
  selectedProfileId,
  selectedDNAId,
  onProfileChange,
  onDNAChange,
  disabled
}: ContextSelectorProps) {
  const { profiles, isLoading: profilesLoading } = useInstitutionalProfiles();
  const { tenant } = useAuth();
  const [dnaOptions, setDnaOptions] = useState<ContentDNAOption[]>([]);
  const [dnaLoading, setDnaLoading] = useState(false);

  // Fetch Content DNA options
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

        setDnaOptions(options);
      } catch (error) {
        console.error('Error fetching DNA options:', error);
      } finally {
        setDnaLoading(false);
      }
    };

    fetchDNAOptions();
  }, [tenant, profiles]);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);
  const hasActiveContext = selectedProfileId || selectedDNAId;

  return (
    <div className="space-y-3">
      {/* Prominent university/profile display when selected */}
      {hasActiveContext && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          {tenant?.logo_url ? (
            <img 
              src={tenant.logo_url} 
              alt={tenant.institution_name || 'Institution'} 
              className="h-10 w-auto max-w-[80px] object-contain"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground truncate">
                {selectedProfile?.name || tenant?.institution_name || 'Institution'}
              </span>
              {selectedDNAId && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  DNA Active
                </Badge>
              )}
            </div>
            {selectedProfile && selectedProfile.profileType && (
              <p className="text-xs text-muted-foreground">{selectedProfile.profileType}</p>
            )}
          </div>
        </div>
      )}

      {/* Selectors */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Profile Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <Select
            value={selectedProfileId || 'none'}
            onValueChange={(v) => onProfileChange(v === 'none' ? null : v)}
            disabled={disabled || profilesLoading}
          >
            <SelectTrigger className="w-[140px] sm:w-[180px] h-8 sm:h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Select profile..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No profile</SelectItem>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  <div className="flex items-center gap-2">
                    <span className="truncate">{profile.name}</span>
                    <Badge variant="outline" className="text-xs hidden sm:inline-flex">{profile.profileType}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* DNA Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Dna className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <Select
            value={selectedDNAId || 'none'}
            onValueChange={(v) => onDNAChange(v === 'none' ? null : v)}
            disabled={disabled || dnaLoading}
          >
            <SelectTrigger className="w-[140px] sm:w-[180px] h-8 sm:h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Select DNA..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No DNA</SelectItem>
              {dnaOptions.map((dna) => (
                <SelectItem key={dna.id} value={dna.id}>
                  <div className="flex items-center gap-2">
                    <span className="truncate">{dna.profile_name || 'Tenant DNA'}</span>
                    <Badge variant="secondary" className="text-xs hidden sm:inline-flex">{dna.sample_count}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
