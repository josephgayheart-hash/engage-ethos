import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Users, Clock, Mail, Briefcase, Target, MessageSquare, Building2 } from "lucide-react";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import type { 
  MessageContext, 
  AudienceType, 
  CohortContext,
  CommunicationMoment, 
  Channel,
  MessageDomain,
  PrimaryGoal,
  TonePreference,
  OperationMode,
  Department
} from "@/types/uplaybook";

interface ContextSelectorProps {
  context: MessageContext;
  onChange: (context: MessageContext) => void;
  mode?: OperationMode;
}

const departmentOptions: { value: Department; label: string }[] = [
  { value: 'central-marketing', label: 'Central Marketing' },
  { value: 'executive-comms', label: 'Executive Communications' },
  { value: 'enrollment-management', label: 'Enrollment Management' },
  { value: 'registrar', label: 'Registrar' },
  { value: 'college-communications', label: 'College Communications' },
  { value: 'student-success', label: 'Student Success' },
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'health-wellbeing', label: 'Health & Well-being' },
  { value: 'advancement-alumni', label: 'Advancement & Alumni' },
  { value: 'human-resources', label: 'Human Resources (HR)' },
];

const audienceOptions: { value: AudienceType; label: string }[] = [
  { value: 'prospective', label: 'Prospective Student' },
  { value: 'first-year', label: 'First-Year Student' },
  { value: 'continuing', label: 'Continuing Student' },
  { value: 'at-risk', label: 'At-Risk Student' },
  { value: 'graduate', label: 'Graduate Student' },
  { value: 'online-learner', label: 'Online Learner' },
  { value: 'employee', label: 'University Employee' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'parents', label: 'Parents/Family' },
  { value: 'donors', label: 'Donors' },
  { value: 'policy-makers', label: 'Policy Makers' },
  { value: 'community-partners', label: 'Community Partners' },
  { value: 'higher-ed-leaders', label: 'Higher Education Leaders' },
];

const studentCohortOptions: { value: CohortContext; label: string }[] = [
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
  { value: 'pre-college', label: 'Pre-College Program' },
];

const employeeCohortOptions: { value: CohortContext; label: string }[] = [
  { value: 'none', label: 'No specific cohort' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'staff', label: 'Staff' },
  { value: 'adjunct', label: 'Adjunct Faculty' },
  { value: 'administrator', label: 'Administrator' },
  { value: 'hourly', label: 'Hourly Employee' },
  { value: 'new-hire', label: 'New Hire' },
  { value: 'supervisor', label: 'Supervisor/Manager' },
  { value: 'remote-employee', label: 'Remote Employee' },
];

const studentMomentOptions: { value: CommunicationMoment; label: string }[] = [
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'yield', label: 'Yield Campaign' },
  { value: 'summer-melt', label: 'Summer Melt Prevention' },
  { value: 'orientation', label: 'Orientation' },
  { value: 'registration', label: 'Registration' },
  { value: 'early-term', label: 'Early Term' },
  { value: 'midterm', label: 'Midterm' },
  { value: 'finals', label: 'Finals' },
  { value: 're-engagement', label: 'Re-engagement' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'giving-campaign', label: 'Giving Campaign' },
  { value: 'seasonal', label: 'Seasonal' },
];

const employeeMomentOptions: { value: CommunicationMoment; label: string }[] = [
  { value: 'open-enrollment', label: 'Benefits Open Enrollment' },
  { value: 'performance-review', label: 'Performance Review Cycle' },
  { value: 'professional-development', label: 'Professional Development' },
  { value: 'onboarding', label: 'Employee Onboarding' },
  { value: 'policy-update', label: 'Policy Update' },
  { value: 'campus-event', label: 'Campus Event' },
  { value: 'wellness-initiative', label: 'Wellness Initiative' },
  { value: 'recognition', label: 'Recognition/Appreciation' },
  { value: 'budget-cycle', label: 'Budget Cycle' },
  { value: 'strategic-planning', label: 'Strategic Planning' },
  { value: 'seasonal', label: 'Seasonal' },
];

const policyMakerMomentOptions: { value: CommunicationMoment; label: string }[] = [
  { value: 'advocacy-support', label: 'Support University Priorities' },
  { value: 'funding-advocacy', label: 'Advocate for Increased Funding' },
  { value: 'legislative-event', label: 'Attend Legislative Events' },
  { value: 'campus-event', label: 'Campus Visit/Event' },
  { value: 'recognition', label: 'Recognition/Appreciation' },
];

const communityPartnerMomentOptions: { value: CommunicationMoment; label: string }[] = [
  { value: 'partnership-initiation', label: 'Initiate Partnership' },
  { value: 'partnership-sustain', label: 'Sustain Partnership' },
  { value: 'community-event', label: 'Participate in Events' },
  { value: 'success-story-share', label: 'Share Success Stories' },
  { value: 'campus-event', label: 'Campus Engagement' },
];

const higherEdLeaderMomentOptions: { value: CommunicationMoment; label: string }[] = [
  { value: 'research-collaboration', label: 'Initiate Research Collaboration' },
  { value: 'programming-collaboration', label: 'Program Collaboration' },
  { value: 'best-practices-share', label: 'Share Best Practices at Conferences' },
  { value: 'peer-reputation', label: 'Increase Peer Reputation' },
  { value: 'campus-event', label: 'Campus Visit/Event' },
];

const channelOptions: { value: Channel; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS/Text' },
  { value: 'portal', label: 'Student Portal' },
  { value: 'landing-page', label: 'Landing Page' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'direct-mail', label: 'Direct Mail' },
  { value: 'phone-call', label: 'Phone Call' },
];

const domainOptions: { value: MessageDomain; label: string }[] = [
  { value: 'admissions', label: 'Admissions' },
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'academic', label: 'Academic' },
  { value: 'financial', label: 'Financial Aid' },
  { value: 'wellbeing', label: 'Health & Wellbeing' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'athletics', label: 'Athletics' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'scholastic', label: 'Scholastic' },
  { value: 'giving', label: 'Giving/Fundraising' },
  { value: 'alumni-relations', label: 'Alumni Relations' },
  // Employee domains
  { value: 'hr-benefits', label: 'HR & Benefits' },
  { value: 'professional-growth', label: 'Professional Growth' },
  { value: 'workplace-culture', label: 'Workplace Culture' },
  { value: 'operations', label: 'Operations' },
  { value: 'safety-security', label: 'Safety & Security' },
];

const goalOptions: { value: PrimaryGoal; label: string }[] = [
  { value: 'inquiry', label: 'Inquiry (lead generation)' },
  { value: 'apply', label: 'Apply (application push)' },
  { value: 'yield', label: 'Yield (deposit/commit)' },
  { value: 'confirm', label: 'Confirm (enrollment confirmation)' },
  { value: 'enroll', label: 'Enroll (registration)' },
  { value: 'persist', label: 'Persist (retention)' },
  { value: 'attend', label: 'Attend (event/class)' },
  { value: 'submit', label: 'Submit (form/document)' },
  { value: 'respond', label: 'Respond (reply/contact)' },
  { value: 'check-in', label: 'Check-in (welfare)' },
  { value: 'donate', label: 'Donate (giving)' },
  { value: 'register', label: 'Register (course/event)' },
  // Employee goals
  { value: 'enroll-benefits', label: 'Enroll in Benefits' },
  { value: 'complete-training', label: 'Complete Training' },
  { value: 'acknowledge', label: 'Acknowledge (policy/info)' },
  { value: 'participate', label: 'Participate (event/initiative)' },
  { value: 'review-update', label: 'Review & Update (info/profile)' },
];

const toneOptions: { value: TonePreference; label: string }[] = [
  { value: 'supportive', label: 'Supportive' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'encouraging', label: 'Encouraging' },
  { value: 'directive', label: 'Directive' },
  { value: 'celebratory', label: 'Celebratory' },
  { value: 'urgent', label: 'Urgent' },
];

export function ContextSelector({ context, onChange, mode = 'evaluator' }: ContextSelectorProps) {
  const showExtendedOptions = mode === 'builder' || mode === 'mapper';
  const hideChannel = mode === 'mapper' || mode === 'builder'; // Builder/Strategy pages have their own multi-channel selection
  
  // Dynamic options based on audience type
  const isEmployee = context.audience === 'employee';
  const isPolicyMaker = context.audience === 'policy-makers';
  const isCommunityPartner = context.audience === 'community-partners';
  const isHigherEdLeader = context.audience === 'higher-ed-leaders';
  
  const cohortOptions = isEmployee ? employeeCohortOptions : studentCohortOptions;
  
  // Select the appropriate moment options based on audience
  let momentOptions = studentMomentOptions;
  if (isEmployee) {
    momentOptions = employeeMomentOptions;
  } else if (isPolicyMaker) {
    momentOptions = policyMakerMomentOptions;
  } else if (isCommunityPartner) {
    momentOptions = communityPartnerMomentOptions;
  } else if (isHigherEdLeader) {
    momentOptions = higherEdLeaderMomentOptions;
  }

  return (
    <div className="space-y-4">
      <div className={`grid grid-cols-1 md:grid-cols-2 ${hideChannel ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
        <div className="space-y-2">
          <Label htmlFor="audience" className="flex items-center gap-2 text-sm font-medium">
            <Users className="w-4 h-4 text-pillar-authority" />
            Audience Type
          </Label>
          <Select
            value={context.audience ?? ""}
            onValueChange={(value) =>
              onChange({ ...context, audience: value === "none" || value === "" ? undefined : value as AudienceType })
            }
          >
            <SelectTrigger id="audience" className="w-full bg-background">
              <SelectValue placeholder="Select audience..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— None —</SelectItem>
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
          <MultiSelectDropdown
            options={momentOptions}
            value={context.moments || (context.moment ? [context.moment] : [])}
            onChange={(values) =>
              onChange({ 
                ...context, 
                moments: values.length > 0 ? values as CommunicationMoment[] : undefined,
                moment: values.length > 0 ? values[0] as CommunicationMoment : undefined
              })
            }
            placeholder="Select moments..."
          />
        </div>

        {!hideChannel && (
          <div className="space-y-2">
            <Label htmlFor="channel" className="flex items-center gap-2 text-sm font-medium">
              <Mail className="w-4 h-4 text-pillar-consensus" />
              Channel
            </Label>
            <Select
              value={context.channel ?? ""}
              onValueChange={(value) =>
                onChange({ ...context, channel: value === "none" || value === "" ? undefined : value as Channel })
              }
            >
              <SelectTrigger id="channel" className="w-full bg-background">
                <SelectValue placeholder="Select channel..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {channelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {showExtendedOptions && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-border">
          <div className="space-y-2">
            <Label htmlFor="department" className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="w-4 h-4 text-primary" />
              Department
            </Label>
            <Select
              value={context.department ?? ""}
              onValueChange={(value) =>
                onChange({ ...context, department: value === "none" || value === "" ? undefined : value as Department })
              }
            >
              <SelectTrigger id="department" className="w-full bg-background">
                <SelectValue placeholder="Select department..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {departmentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain" className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="w-4 h-4 text-secondary" />
              Message Domain
            </Label>
            <Select
              value={context.domain ?? ""}
              onValueChange={(value) =>
                onChange({ ...context, domain: value === "none" || value === "" ? undefined : value as MessageDomain })
              }
            >
              <SelectTrigger id="domain" className="w-full bg-background">
                <SelectValue placeholder="Select domain..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
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
            <MultiSelectDropdown
              options={goalOptions}
              value={context.goals || (context.goal ? [context.goal] : [])}
              onChange={(values) =>
                onChange({ 
                  ...context, 
                  goals: values.length > 0 ? values as PrimaryGoal[] : undefined,
                  goal: values.length > 0 ? values[0] as PrimaryGoal : undefined
                })
              }
              placeholder="Select goals..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone" className="text-sm font-medium">
              Tone Preference
            </Label>
            <Select
              value={context.tone ?? ""}
              onValueChange={(value) =>
                onChange({ ...context, tone: value === "none" || value === "" ? undefined : value as TonePreference })
              }
            >
              <SelectTrigger id="tone" className="w-full bg-background">
                <SelectValue placeholder="Select tone..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
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
