import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContentDNAForGeneration } from '@/hooks/useContentDNAForGeneration';
import { useInstitutionalProfiles } from '@/hooks/useInstitutionalProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Dna, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown,
  ChevronUp,
  Sparkles,
  Building2,
  Settings,
  FileText,
  Quote,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentDNAIndicatorProps {
  /**
   * Whether Content DNA is enabled for this generation
   */
  enabled: boolean;
  /**
   * Callback when user toggles Content DNA on/off
   */
  onToggle: (enabled: boolean) => void;
  /**
   * The currently selected institutional profile ID (optional)
   * Used to fetch profile-specific Content DNA
   */
  selectedProfileId?: string | null;
  /**
   * The currently selected institutional profile name (optional)
   */
  selectedProfileName?: string;
  /**
   * Compact mode shows just the badge, not the expanded details
   */
  compact?: boolean;
  /**
   * Additional class names
   */
  className?: string;
}

/**
 * ContentDNAIndicator - Visual indicator showing Content DNA status
 * 
 * Shows users whether their Content DNA profile is being applied to message generation,
 * with a toggle to enable/disable and details about what's being used.
 */
export function ContentDNAIndicator({
  enabled,
  onToggle,
  selectedProfileId,
  selectedProfileName,
  compact = false,
  className,
}: ContentDNAIndicatorProps) {
  const { contentDNA, isLoading } = useContentDNAForGeneration({ profileId: selectedProfileId });
  const { getProfileHierarchy } = useInstitutionalProfiles();
  const { tenant, isAdmin } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasContentDNA = Boolean(contentDNA?.voiceAnalysis);
  const hasCustomInstructions = Boolean(contentDNA?.customInstructions);
  const voiceAnalysis = contentDNA?.voiceAnalysis;
  
  // Build profile hierarchy path
  const profileHierarchy = selectedProfileId ? getProfileHierarchy(selectedProfileId) : null;
  const hierarchyPath = profileHierarchy?.path || selectedProfileName || tenant?.institution_name;
  
  // Determine if DNA is inherited from a parent profile
  const isInherited = contentDNA?.sourceProfileId && contentDNA?.sourceProfileId !== selectedProfileId;
  const sourceDisplayName = isInherited
    ? (contentDNA?.sourceProfileName || "Parent profile")
    : (selectedProfileName || tenant?.institution_name);
  
  // Build DNA source hierarchy if inherited
  const dnaSourceHierarchy = isInherited && contentDNA?.sourceProfileId 
    ? getProfileHierarchy(contentDNA.sourceProfileId) 
    : null;

  // If no Content DNA exists at all, show setup prompt
  if (!isLoading && !hasContentDNA) {
    return (
      <div className={cn(
        "rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3",
        className
      )}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100">
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-800">
              Content DNA Not Configured
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Upload content samples to capture your institution's voice and style.
            </p>
            {isAdmin && (
              <Link to="/content-dna">
                <Button variant="outline" size="sm" className="mt-2 h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100">
                  <Settings className="w-3 h-3 mr-1" />
                  Set Up Content DNA
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Compact mode - just show a badge
  if (compact) {
    // Show hierarchy in compact view if available
    const compactLabel = enabled && hasContentDNA
      ? (hierarchyPath || "DNA Active")
      : "DNA Off";

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={enabled && hasContentDNA ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all",
              enabled && hasContentDNA 
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0" 
                : "text-muted-foreground",
              className
            )}
            onClick={() => hasContentDNA && onToggle(!enabled)}
          >
            <Dna className="w-3 h-3 mr-1" />
            {compactLabel}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            {hierarchyPath && (
              <p className="text-xs font-medium">{hierarchyPath}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {enabled && hasContentDNA 
                ? isInherited
                  ? `DNA inherited from: ${dnaSourceHierarchy?.path || sourceDisplayName}`
                  : "Content DNA is being applied to match your brand voice."
                : "Click to enable Content DNA for on-brand messaging."
              }
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Full indicator with details
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className={cn(
        "rounded-lg border transition-all",
        enabled && hasContentDNA 
          ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50" 
          : "border-border bg-muted/30",
        className
      )}>
        {/* Header Row */}
        <div className="p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "p-2 rounded-lg shrink-0",
              enabled && hasContentDNA 
                ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white" 
                : "bg-muted text-muted-foreground"
            )}>
              <Dna className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  Content DNA
                </span>
                {enabled && hasContentDNA && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {enabled && hasContentDNA 
                  ? isInherited
                    ? `Using ${sourceDisplayName} DNA`
                    : (selectedProfileName
                        ? `${selectedProfileName} brand voice applied`
                        : tenant?.institution_name
                          ? `${tenant.institution_name} brand voice applied`
                          : "Your brand voice is being applied")
                  : "Toggle to use your brand voice"
                }
              </p>
              {enabled && hasContentDNA && isInherited && (
                <p className="text-[10px] text-amber-600 truncate">
                  Inherited from parent profile
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Switch
              checked={enabled && hasContentDNA}
              onCheckedChange={onToggle}
              disabled={!hasContentDNA}
              className={cn(
                enabled && hasContentDNA && "data-[state=checked]:bg-emerald-500"
              )}
            />
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        {/* Expanded Details */}
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0 space-y-3">
            <div className="h-px bg-border" />
            
            {/* Profile Hierarchy Display */}
            {profileHierarchy && profileHierarchy.profiles.length > 0 && (
              <div className="flex items-start gap-2 text-xs">
                <Building2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground">Profile Hierarchy</span>
                  <div className="flex items-center flex-wrap gap-1 mt-0.5">
                    {profileHierarchy.profiles.map((profile, idx) => (
                      <span key={profile.id} className="flex items-center">
                        <span className="font-medium text-foreground">{profile.name}</span>
                        {idx < profileHierarchy.profiles.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-muted-foreground mx-0.5" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* DNA Source Info - show if inherited */}
            {isInherited && dnaSourceHierarchy && (
              <div className="flex items-start gap-2 text-xs">
                <Dna className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-amber-600">DNA Inherited From</span>
                  <div className="flex items-center flex-wrap gap-1 mt-0.5">
                    {dnaSourceHierarchy.profiles.map((profile, idx) => (
                      <span key={profile.id} className="flex items-center">
                        <span className="font-medium text-foreground">{profile.name}</span>
                        {idx < dnaSourceHierarchy.profiles.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-muted-foreground mx-0.5" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Voice Analysis Summary */}
            {enabled && hasContentDNA && voiceAnalysis && (
              <div className="space-y-2">
                {voiceAnalysis.overallTone && (
                  <div className="flex items-start gap-2 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-muted-foreground">Voice Tone</span>
                      <p className="text-foreground line-clamp-2">{voiceAnalysis.overallTone}</p>
                    </div>
                  </div>
                )}
                
                {voiceAnalysis.keyCharacteristics && voiceAnalysis.keyCharacteristics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {voiceAnalysis.keyCharacteristics.slice(0, 4).map((char, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 bg-white/50">
                        {typeof char === 'string' ? char.split('.')[0].substring(0, 30) : ''}
                        {typeof char === 'string' && char.length > 30 ? '…' : ''}
                      </Badge>
                    ))}
                  </div>
                )}

                {hasCustomInstructions && (
                  <div className="flex items-start gap-2 text-xs">
                    <Quote className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-muted-foreground">Custom Instructions</span>
                      <p className="text-foreground line-clamp-2">{contentDNA?.customInstructions}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Link */}
            {isAdmin && (
              <Link to="/content-dna" className="block">
                <Button variant="ghost" size="sm" className="w-full h-7 text-xs text-muted-foreground hover:text-foreground">
                  <Settings className="w-3 h-3 mr-1" />
                  Manage Content DNA
                </Button>
              </Link>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

/**
 * Inline affirmation badge - shows when Content DNA is actively being used
 * Use this inside generated content areas to confirm brand voice is applied
 */
export function ContentDNAActiveBadge({ 
  className,
  institutionName,
  profileId,
}: { 
  className?: string;
  institutionName?: string;
  profileId?: string | null;
}) {
  const { contentDNA } = useContentDNAForGeneration({ profileId });
  const { tenant } = useAuth();
  
  if (!contentDNA?.voiceAnalysis) return null;

  const displayName = institutionName || tenant?.institution_name;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline"
          className={cn(
            "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700 text-[10px] gap-1",
            className
          )}
        >
          <Dna className="w-2.5 h-2.5" />
          <span>
            {displayName ? `${displayName} Voice` : "Brand Voice Applied"}
          </span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs">
          {displayName 
            ? `This content was generated using ${displayName}'s Content DNA profile to match your brand voice and style.`
            : "This content was generated using your institution's Content DNA profile to match your brand voice and style."
          }
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
