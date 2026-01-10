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
    <div className="flex items-center gap-2 py-2">
      {/* Label */}
      <span className="text-xs text-muted-foreground shrink-0">Voice Profile:</span>
      
      {/* Logo/Avatar - compact */}
      <Avatar className="h-5 w-5 shrink-0 border border-border">
        {logoUrl ? (
          <AvatarImage src={logoUrl} alt={displayName || 'Institution'} />
        ) : null}
        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
          {displayName ? getInitials(displayName) : <Building2 className="w-3 h-3" />}
        </AvatarFallback>
      </Avatar>
      
      {/* Profile Selector - inline, single line */}
      <div className="flex-1 min-w-0">
        <Select value={selectedProfileId || 'none'} onValueChange={handleChange}>
          <SelectTrigger className="h-6 border-0 bg-transparent p-0 focus:ring-0 shadow-none text-xs font-medium truncate w-auto gap-1">
            <SelectValue placeholder="Select profile..." />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="none">
              <span className="text-muted-foreground text-xs">No profile (generic)</span>
            </SelectItem>
            {profiles.map(profile => (
              <SelectItem key={profile.id} value={profile.id}>
                <span className="truncate text-xs">{profile.config?.unitName || profile.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* DNA Status Badge */}
      {hasDNA && (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/15 text-[10px] px-1.5 py-0 h-4 shrink-0">
          <Sparkles className="w-2.5 h-2.5 mr-0.5" />
          DNA
        </Badge>
      )}
    </div>
  );
}
