import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building2, 
  Settings, 
  ChevronRight,
  Sparkles,
  GraduationCap,
  Layers,
  Building,
  Briefcase
} from "lucide-react";
import { Link } from "react-router-dom";
import { useInstitutionalProfiles, type InstitutionalProfile, type ProfileType } from "@/hooks/useInstitutionalProfiles";
import { useAuth } from "@/contexts/AuthContext";
import type { InstitutionalConfig } from "@/types/uplaybook";

interface InstitutionalProfileSelectorProps {
  selectedProfileId: string | null;
  onProfileChange: (profileId: string | null, config: InstitutionalConfig | null, profileName?: string) => void;
  compact?: boolean;
}

const PROFILE_TYPE_ICONS: Record<ProfileType, React.ReactNode> = {
  university: <Building2 className="w-3.5 h-3.5" />,
  college: <GraduationCap className="w-3.5 h-3.5" />,
  division: <Layers className="w-3.5 h-3.5" />,
  unit: <Building className="w-3.5 h-3.5" />,
  department: <Briefcase className="w-3.5 h-3.5" />,
};

export function InstitutionalProfileSelector({ 
  selectedProfileId, 
  onProfileChange,
  compact = false 
}: InstitutionalProfileSelectorProps) {
  const { profiles, getProfile, getRootProfiles, getChildProfiles } = useInstitutionalProfiles();
  const { tenant } = useAuth();
  
  const handleChange = (value: string) => {
    if (value === 'none') {
      onProfileChange(null, null, undefined);
    } else {
      const profile = getProfile(value);
      onProfileChange(value, profile?.config || null, profile?.name);
    }
  };

  const selectedProfile = selectedProfileId ? getProfile(selectedProfileId) : null;

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  // Use tenant logo or profile-specific info
  const logoUrl = selectedProfile?.config?.logoUrl || tenant?.logo_url;
  const institutionName = selectedProfile?.config?.institutionName || selectedProfile?.config?.unitName || tenant?.institution_name;

  // Organize profiles hierarchically
  const rootProfiles = getRootProfiles();

  if (profiles.length === 0) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg border border-dashed border-border bg-muted/30 ${compact ? 'p-2' : ''}`}>
        <Building2 className="w-4 h-4 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            No institutional profiles configured
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/university-settings" className="flex items-center gap-1">
            <Settings className="w-3 h-3" />
            Create Profile
          </Link>
        </Button>
      </div>
    );
  }

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

  return (
    <div className={`space-y-2 ${compact ? '' : 'p-4 rounded-lg border border-border bg-card'}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Building2 className="w-4 h-4 text-secondary" />
          Generate As
        </Label>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" asChild>
          <Link to="/university-settings" className="flex items-center gap-1">
            Manage
            <ChevronRight className="w-3 h-3" />
          </Link>
        </Button>
      </div>
      
      <Select value={selectedProfileId || 'none'} onValueChange={handleChange}>
        <SelectTrigger className={`${compact ? 'h-9' : ''} ${selectedProfile ? 'border-secondary/50 bg-secondary/5' : ''}`}>
          <SelectValue placeholder="Select institutional profile..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">No profile (generic)</span>
          </SelectItem>
          {rootProfiles.map(profile => renderProfileItem(profile))}
        </SelectContent>
      </Select>

      {selectedProfile && !compact && (
        <div className="flex items-center gap-3 mt-3 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
          {/* Institution Logo/Avatar */}
          <Avatar className="h-10 w-10 border-2 border-secondary/30">
            {logoUrl ? (
              <AvatarImage src={logoUrl} alt={institutionName || 'Institution'} />
            ) : null}
            <AvatarFallback className="bg-secondary/20 text-secondary font-semibold text-sm">
              {institutionName ? getInitials(institutionName) : <Building2 className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{PROFILE_TYPE_ICONS[selectedProfile.profileType]}</span>
              <p className="text-sm font-medium text-foreground truncate">
                {selectedProfile.config.unitName || selectedProfile.name}
              </p>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {selectedProfile.profileType !== 'university' 
                ? `${selectedProfile.profileType.charAt(0).toUpperCase() + selectedProfile.profileType.slice(1)} • ${selectedProfile.config.institutionName || ''}`
                : selectedProfile.config.institutionName || 'Custom configuration'}
              {selectedProfile.config.mascot && ` • ${selectedProfile.config.mascot}`}
            </p>
          </div>
          
          {selectedProfile.config.mascot && selectedProfile.profileType === 'university' && (
            <Badge variant="outline" className="text-xs h-5 shrink-0 hidden sm:flex">
              {selectedProfile.config.mascot}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
