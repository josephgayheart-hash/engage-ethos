import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Users, Clock, Mail, Briefcase, Target, MessageSquare } from "lucide-react";
import type { 
  MessageContext, 
  AudienceType, 
  CohortContext,
  CommunicationMoment, 
  Channel,
  MessageDomain,
  PrimaryGoal,
  TonePreference,
  OperationMode
} from "@/types/persist";

interface ContextSelectorProps {
  context: MessageContext;
  onChange: (context: MessageContext) => void;
  mode?: OperationMode;
}

const audienceOptions: { value: AudienceType; label: string }[] = [
  { value: 'prospective', label: 'Prospective Student' },
  { value: 'first-year', label: 'First-Year Student' },
  { value: 'continuing', label: 'Continuing Student' },
  { value: 'at-risk', label: 'At-Risk Student' },
  { value: 'graduate', label: 'Graduate Student' },
];

const cohortOptions: { value: CohortContext; label: string }[] = [
  { value: 'none', label: 'No specific cohort' },
  { value: 'first-gen', label: 'First-Generation' },
  { value: 'probation', label: 'Academic Probation' },
  { value: 'online', label: 'Online Student' },
  { value: 'commuter', label: 'Commuter' },
  { value: 'residential', label: 'Residential' },
  { value: 'transfer', label: 'Transfer Student' },
  { value: 'international', label: 'International' },
  { value: 'veteran', label: 'Veteran' },
  { value: 'parent', label: 'Student Parent' },
  { value: 'working-adult', label: 'Working Adult' },
];

const momentOptions: { value: CommunicationMoment; label: string }[] = [
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'orientation', label: 'Orientation' },
  { value: 'registration', label: 'Registration' },
  { value: 'early-term', label: 'Early Term' },
  { value: 'midterm', label: 'Midterm' },
  { value: 'finals', label: 'Finals' },
  { value: 're-engagement', label: 'Re-engagement' },
  { value: 'seasonal', label: 'Seasonal' },
];

const channelOptions: { value: Channel; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS/Text' },
  { value: 'portal', label: 'Student Portal' },
  { value: 'landing-page', label: 'Landing Page' },
  { value: 'social-media', label: 'Social Media' },
];

const domainOptions: { value: MessageDomain; label: string }[] = [
  { value: 'academic', label: 'Academic' },
  { value: 'financial', label: 'Financial Aid' },
  { value: 'wellbeing', label: 'Health & Wellbeing' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'athletics', label: 'Athletics' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'scholastic', label: 'Scholastic' },
];

const goalOptions: { value: PrimaryGoal; label: string }[] = [
  { value: 'persist', label: 'Persist (retention)' },
  { value: 'attend', label: 'Attend (event/class)' },
  { value: 'submit', label: 'Submit (form/document)' },
  { value: 'respond', label: 'Respond (reply/contact)' },
  { value: 'check-in', label: 'Check-in (welfare)' },
];

const toneOptions: { value: TonePreference; label: string }[] = [
  { value: 'supportive', label: 'Supportive' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'encouraging', label: 'Encouraging' },
  { value: 'directive', label: 'Directive' },
];

export function ContextSelector({ context, onChange, mode = 'evaluator' }: ContextSelectorProps) {
  const showExtendedOptions = mode === 'builder' || mode === 'mapper';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="audience" className="flex items-center gap-2 text-sm font-medium">
            <Users className="w-4 h-4 text-pillar-authority" />
            Audience Type
          </Label>
          <Select
            value={context.audience}
            onValueChange={(value: AudienceType) =>
              onChange({ ...context, audience: value })
            }
          >
            <SelectTrigger id="audience" className="w-full bg-background">
              <SelectValue placeholder="Select audience" />
            </SelectTrigger>
            <SelectContent>
              {audienceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cohort" className="flex items-center gap-2 text-sm font-medium">
            <Briefcase className="w-4 h-4 text-pillar-susceptibility" />
            Cohort Context
          </Label>
          <Select
            value={context.cohort || 'none'}
            onValueChange={(value: CohortContext) =>
              onChange({ ...context, cohort: value === 'none' ? undefined : value })
            }
          >
            <SelectTrigger id="cohort" className="w-full bg-background">
              <SelectValue placeholder="Select cohort" />
            </SelectTrigger>
            <SelectContent>
              {cohortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="moment" className="flex items-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4 text-pillar-cognitive" />
            Communication Moment
          </Label>
          <Select
            value={context.moment}
            onValueChange={(value: CommunicationMoment) =>
              onChange({ ...context, moment: value })
            }
          >
            <SelectTrigger id="moment" className="w-full bg-background">
              <SelectValue placeholder="Select moment" />
            </SelectTrigger>
            <SelectContent>
              {momentOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="channel" className="flex items-center gap-2 text-sm font-medium">
            <Mail className="w-4 h-4 text-pillar-consensus" />
            Channel
          </Label>
          <Select
            value={context.channel}
            onValueChange={(value: Channel) =>
              onChange({ ...context, channel: value })
            }
          >
            <SelectTrigger id="channel" className="w-full bg-background">
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              {channelOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showExtendedOptions && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="domain" className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="w-4 h-4 text-secondary" />
              Message Domain
            </Label>
            <Select
              value={context.domain || ''}
              onValueChange={(value: MessageDomain) =>
                onChange({ ...context, domain: value })
              }
            >
              <SelectTrigger id="domain" className="w-full bg-background">
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                {domainOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal" className="flex items-center gap-2 text-sm font-medium">
              <Target className="w-4 h-4 text-pillar-ethics" />
              Primary Goal
            </Label>
            <Select
              value={context.goal || ''}
              onValueChange={(value: PrimaryGoal) =>
                onChange({ ...context, goal: value })
              }
            >
              <SelectTrigger id="goal" className="w-full bg-background">
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent>
                {goalOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone" className="text-sm font-medium">
              Tone Preference
            </Label>
            <Select
              value={context.tone || ''}
              onValueChange={(value: TonePreference) =>
                onChange({ ...context, tone: value })
              }
            >
              <SelectTrigger id="tone" className="w-full bg-background">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
