import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building2, 
  Settings, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { useInstitutionalProfiles, type InstitutionalProfile } from "@/hooks/useInstitutionalProfiles";
import { useAuth } from "@/contexts/AuthContext";
import type { InstitutionalConfig } from "@/types/uplaybook";

interface InstitutionalProfileSelectorProps {
  selectedProfileId: string | null;
  onProfileChange: (profileId: string | null, config: InstitutionalConfig | null, profileName?: string) => void;
  compact?: boolean;
}

export function InstitutionalProfileSelector({ 
  selectedProfileId, 
  onProfileChange,
  compact = false 
}: InstitutionalProfileSelectorProps) {
  const { profiles, getProfile } = useInstitutionalProfiles();
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

  const getProfileSummary = (profile: InstitutionalProfile) => {
    const parts: string[] = [];
    if (profile.config.institutionName) parts.push(profile.config.institutionName);
    if (profile.config.mascot) parts.push(profile.config.mascot);
    return parts.length > 0 ? parts.join(' • ') : 'Custom configuration';
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  // Use tenant logo or profile-specific info
  const logoUrl = tenant?.logo_url;
  const institutionName = selectedProfile?.config?.institutionName || tenant?.institution_name;

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
          <Link to="/settings" className="flex items-center gap-1">
            <Settings className="w-3 h-3" />
            Create Profile
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${compact ? '' : 'p-4 rounded-lg border border-border bg-card'}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Building2 className="w-4 h-4 text-secondary" />
          Generate As
        </Label>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" asChild>
          <Link to="/settings" className="flex items-center gap-1">
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
          {profiles.map(profile => (
            <SelectItem key={profile.id} value={profile.id}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{profile.name}</span>
                {profile.config.institutionName && (
                  <span className="text-xs text-muted-foreground">
                    — {profile.config.institutionName}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
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
              <Sparkles className="w-3 h-3 text-secondary shrink-0" />
              <p className="text-sm font-medium text-foreground truncate">
                {selectedProfile.name}
              </p>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {institutionName || 'Custom configuration'}
              {selectedProfile.config.mascot && ` • ${selectedProfile.config.mascot}`}
            </p>
          </div>
          
          {selectedProfile.config.mascot && (
            <Badge variant="outline" className="text-xs h-5 shrink-0 hidden sm:flex">
              {selectedProfile.config.mascot}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
