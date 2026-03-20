import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  Mail, 
  Clock, 
  Dna,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  BarChart3
} from "lucide-react";
import { useIndustry } from "@/contexts/IndustryContext";

interface SelectionSummaryProps {
  selectedProfileName?: string;
  audience?: string;
  cohort?: string;
  moment?: string;
  channels: string[];
  useContentDNA?: boolean;
  journeyWeeks?: number;
  storyCount?: number;
  factCount?: number;
  className?: string;
}

const channelLabels: Record<string, string> = {
  'email': 'Email',
  'sms': 'SMS',
  'social-media': 'Social',
  'portal': 'Portal',
  'landing-page': 'Landing Page',
  'direct-mail': 'Direct Mail',
  'phone-call': 'Phone',
  'digital-ad-search': 'Search Ads',
  'digital-ad-social': 'Social Ads',
  'talking-points': 'Talking Points',
  'case-for-care': 'Case for Support',
};

/**
 * SelectionSummary - Shows a compact summary of user selections before generating.
 * Uses industry vocabulary for audience/moment labels.
 */
export function SelectionSummary({
  selectedProfileName,
  audience,
  cohort,
  moment,
  channels,
  useContentDNA,
  journeyWeeks,
  storyCount = 0,
  factCount = 0,
  className = '',
}: SelectionSummaryProps) {
  const { audiences, moments } = useIndustry();

  const hasProfile = !!selectedProfileName;
  const hasAudience = !!audience;
  const hasChannels = channels.length > 0;
  const hasMoment = !!moment;
  const hasStoriesOrFacts = storyCount > 0 || factCount > 0;
  
  const isReady = hasProfile && hasAudience && hasChannels;

  // Dynamic label lookup from industry vocabulary
  const audienceLabel = audience ? (audiences.find(a => a.id === audience)?.label || audience) : '';
  const momentLabel = moment ? (moments.find(m => m.id === moment)?.label || moment) : '';

  return (
    <div className={`p-4 rounded-xl border bg-muted/30 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        {isReady ? (
          <CheckCircle2 className="w-4 h-4 text-accent" />
        ) : (
          <AlertCircle className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="text-sm font-medium text-foreground">
          {isReady ? 'Ready to generate' : 'Complete selections to generate'}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Profile */}
        {hasProfile ? (
          <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary border-primary/20">
            <Building2 className="w-3 h-3" />
            {selectedProfileName}
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1.5 text-muted-foreground border-dashed">
            <Building2 className="w-3 h-3" />
            Select profile
          </Badge>
        )}

        {/* Audience */}
        {hasAudience ? (
          <Badge variant="secondary" className="gap-1.5 bg-accent/10 text-accent border-accent/20">
            <Users className="w-3 h-3" />
            {audienceLabel}
            {cohort && cohort !== 'none' && ` (${cohort})`}
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1.5 text-muted-foreground border-dashed">
            <Users className="w-3 h-3" />
            Select audience
          </Badge>
        )}

        {/* Moment */}
        {hasMoment && (
          <Badge variant="secondary" className="gap-1.5 bg-secondary/10 text-secondary-foreground border-secondary/20">
            <Clock className="w-3 h-3" />
            {momentLabel}
          </Badge>
        )}

        {/* Channels */}
        {hasChannels ? (
          <Badge variant="secondary" className="gap-1.5 bg-muted text-foreground">
            <Mail className="w-3 h-3" />
            {channels.length === 1 
              ? channelLabels[channels[0]] || channels[0]
              : `${channels.length} channels`
            }
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1.5 text-muted-foreground border-dashed">
            <Mail className="w-3 h-3" />
            Select channels
          </Badge>
        )}

        {/* Journey Duration (Strategy only) */}
        {journeyWeeks !== undefined && (
          <Badge variant="secondary" className="gap-1.5 bg-muted text-foreground">
            <Clock className="w-3 h-3" />
            {journeyWeeks} weeks
          </Badge>
        )}

        {/* Content DNA */}
        {useContentDNA && (
          <Badge variant="secondary" className="gap-1.5 bg-accent/10 text-accent border-accent/20">
            <Dna className="w-3 h-3" />
            Content DNA
          </Badge>
        )}

        {/* Stories & Facts */}
        {hasStoriesOrFacts && (
          <Badge variant="secondary" className="gap-1.5 bg-secondary/50 text-secondary-foreground">
            {storyCount > 0 && (
              <>
                <BookOpen className="w-3 h-3" />
                {storyCount}
              </>
            )}
            {storyCount > 0 && factCount > 0 && <span className="mx-0.5">+</span>}
            {factCount > 0 && (
              <>
                <BarChart3 className="w-3 h-3" />
                {factCount}
              </>
            )}
          </Badge>
        )}
      </div>
    </div>
  );
}
