import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, Building2 } from 'lucide-react';
import { useInstitutionalProfiles } from '@/hooks/useInstitutionalProfiles';
import { useAuth } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VoiceProfileCardProps {
  selectedProfileId: string | null;
  onProfileChange: (profileId: string | null) => void;
  hasDNA: boolean;
}

export function VoiceProfileCard({ 
  selectedProfileId, 
  onProfileChange, 
  hasDNA 
}: VoiceProfileCardProps) {
  const { profiles, getProfile } = useInstitutionalProfiles();
  const { tenant } = useAuth();
  
  const selectedProfile = selectedProfileId ? getProfile(selectedProfileId) : null;
  const logoUrl = selectedProfile?.config?.logoUrl || tenant?.logo_url;
  const displayName = selectedProfile?.config?.unitName || selectedProfile?.name || tenant?.institution_name;

  const getInitials = (name: string) => {
    return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'UN';
  };

  const handleChange = (value: string) => {
    onProfileChange(value === 'none' ? null : value);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
      {/* Logo/Avatar - compact */}
      <Avatar className="h-8 w-8 shrink-0 border border-border">
        {logoUrl ? (
          <AvatarImage src={logoUrl} alt={displayName || 'Institution'} />
        ) : null}
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
          {displayName ? getInitials(displayName) : <Building2 className="w-3.5 h-3.5" />}
        </AvatarFallback>
      </Avatar>
      
      {/* Profile Selector - inline, single line */}
      <div className="flex-1 min-w-0">
        <Select value={selectedProfileId || 'none'} onValueChange={handleChange}>
          <SelectTrigger className="h-8 border-0 bg-transparent p-0 focus:ring-0 shadow-none text-sm font-medium truncate">
            <SelectValue placeholder="Select profile..." />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="none">
              <span className="text-muted-foreground">No profile (generic)</span>
            </SelectItem>
            {profiles.map(profile => (
              <SelectItem key={profile.id} value={profile.id}>
                <span className="truncate">{profile.config?.unitName || profile.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* DNA Status Badge */}
      {hasDNA && (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/15 text-xs shrink-0">
          <Sparkles className="w-3 h-3 mr-1" />
          DNA
        </Badge>
      )}
    </div>
  );
}
