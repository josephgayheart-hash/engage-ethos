import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Users, Clock, Mail } from "lucide-react";
import type { AudienceType, CommunicationMoment, Channel, MessageContext } from "@/types/persist";

interface ContextSelectorProps {
  context: MessageContext;
  onChange: (context: MessageContext) => void;
}

const audienceOptions: { value: AudienceType; label: string }[] = [
  { value: 'prospective', label: 'Prospective Students' },
  { value: 'first-year', label: 'First-Year Students' },
  { value: 'continuing', label: 'Continuing Students' },
  { value: 'at-risk', label: 'At-Risk Students' },
  { value: 'graduate', label: 'Graduate Students' },
];

const momentOptions: { value: CommunicationMoment; label: string }[] = [
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'early-term', label: 'Early Term' },
  { value: 'mid-term-warning', label: 'Mid-Term Warning' },
  { value: 'support', label: 'Support Outreach' },
  { value: 're-engagement', label: 'Re-engagement' },
];

const channelOptions: { value: Channel; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'portal', label: 'Portal Message' },
  { value: 'landing-page', label: 'Landing Page' },
];

export function ContextSelector({ context, onChange }: ContextSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Users className="w-4 h-4 text-pillar-authority" />
          Audience Type
        </Label>
        <Select
          value={context.audience}
          onValueChange={(value: AudienceType) => 
            onChange({ ...context, audience: value })
          }
        >
          <SelectTrigger className="w-full bg-background">
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
        <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Clock className="w-4 h-4 text-pillar-cognitive" />
          Communication Moment
        </Label>
        <Select
          value={context.moment}
          onValueChange={(value: CommunicationMoment) => 
            onChange({ ...context, moment: value })
          }
        >
          <SelectTrigger className="w-full bg-background">
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
        <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Mail className="w-4 h-4 text-pillar-consensus" />
          Channel
        </Label>
        <Select
          value={context.channel}
          onValueChange={(value: Channel) => 
            onChange({ ...context, channel: value })
          }
        >
          <SelectTrigger className="w-full bg-background">
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
  );
}
