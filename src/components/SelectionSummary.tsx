import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  Mail, 
  Clock, 
  Dna,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface SelectionSummaryProps {
  selectedProfileName?: string;
  audience?: string;
  cohort?: string;
  moment?: string;
  channels: string[];
  useContentDNA?: boolean;
  journeyWeeks?: number;
  className?: string;
}

const audienceLabels: Record<string, string> = {
  'prospective': 'Prospective Student',
  'first-year': 'First-Year Student',
  'continuing': 'Continuing Student',
  'at-risk': 'At-Risk Student',
  'graduate': 'Graduate Student',
  'online-learner': 'Online Learner',
  'alumni': 'Alumni',
  'parents': 'Parents/Family',
  'donors': 'Donors',
  'policy-makers': 'Policy Makers',
  'community-partners': 'Community Partners',
  'higher-ed-leaders': 'Higher Education Leaders',
};

const momentLabels: Record<string, string> = {
  'pre-enrollment': 'Pre-Enrollment',
  'orientation': 'Orientation',
  'early-term': 'Early Term',
  'mid-term': 'Mid-Term',
  'late-term': 'Late Term',
  'end-of-term': 'End of Term',
  'between-terms': 'Between Terms',
  'graduation': 'Graduation',
  'post-graduation': 'Post-Graduation',
};

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
};

/**
 * SelectionSummary - Shows a compact summary of user selections before generating
 */
export function SelectionSummary({
  selectedProfileName,
  audience,
  cohort,
  moment,
  channels,
  useContentDNA,
  journeyWeeks,
  className = '',
}: SelectionSummaryProps) {
  const hasProfile = !!selectedProfileName;
  const hasAudience = !!audience;
  const hasChannels = channels.length > 0;
  const hasMoment = !!moment;
  
  const isReady = hasProfile && hasAudience && hasChannels;

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
            {audienceLabels[audience] || audience}
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
            {momentLabels[moment] || moment}
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
      </div>
    </div>
  );
}
