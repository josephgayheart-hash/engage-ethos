import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInstitutionalProfiles } from '@/hooks/useInstitutionalProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Dna, RefreshCw } from 'lucide-react';

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
  const selectedDNA = dnaOptions.find(d => d.id === selectedDNAId);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Profile Selector */}
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-muted-foreground" />
        <Select
          value={selectedProfileId || 'none'}
          onValueChange={(v) => onProfileChange(v === 'none' ? null : v)}
          disabled={disabled || profilesLoading}
        >
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue placeholder="Select profile..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No profile selected</SelectItem>
            {profiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                <div className="flex items-center gap-2">
                  <span>{profile.name}</span>
                  <Badge variant="outline" className="text-xs">{profile.profileType}</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* DNA Selector */}
      <div className="flex items-center gap-2">
        <Dna className="w-4 h-4 text-muted-foreground" />
        <Select
          value={selectedDNAId || 'none'}
          onValueChange={(v) => onDNAChange(v === 'none' ? null : v)}
          disabled={disabled || dnaLoading}
        >
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue placeholder="Select Content DNA..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Content DNA</SelectItem>
            {dnaOptions.map((dna) => (
              <SelectItem key={dna.id} value={dna.id}>
                <div className="flex items-center gap-2">
                  <span>{dna.profile_name || 'Tenant-level DNA'}</span>
                  <Badge variant="secondary" className="text-xs">{dna.sample_count} samples</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status badges */}
      {(selectedProfile || selectedDNA) && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {selectedProfile && (
            <Badge variant="secondary" className="text-xs">
              {selectedProfile.name}
            </Badge>
          )}
          {selectedDNA && (
            <Badge variant="outline" className="text-xs">
              DNA Active
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
