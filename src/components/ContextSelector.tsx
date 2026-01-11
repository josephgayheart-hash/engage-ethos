import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Users, Clock, Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
} from "@/types/campusvoice";

interface ContextSelectorProps {
  context: MessageContext;
  onChange: (context: MessageContext) => void;
  mode?: OperationMode;
}

// ============= AUDIENCE OPTIONS =============
const audienceOptions: { value: AudienceType; label: string }[] = [
  { value: 'general', label: 'General (All Audiences)' },
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

// ============= COHORT OPTIONS BY AUDIENCE =============
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

const alumniCohortOptions: { value: CohortContext; label: string }[] = [
  { value: 'none', label: 'No specific cohort' },
  { value: 'young-alumni', label: 'Young Alumni (0-10 years)' },
  { value: 'established-alumni', label: 'Established Alumni (10+ years)' },
  { value: 'lapsed-alumni', label: 'Lapsed/Disengaged Alumni' },
  { value: 'engaged-alumni', label: 'Highly Engaged Alumni' },
  { value: 'legacy-family', label: 'Legacy Family' },
];

const parentCohortOptions: { value: CohortContext; label: string }[] = [
  { value: 'none', label: 'No specific cohort' },
  { value: 'prospective-parent', label: 'Prospective Parent' },
  { value: 'current-parent', label: 'Current Parent' },
  { value: 'new-family', label: 'New Family (First-Year)' },
  { value: 'graduating-family', label: 'Graduating Family' },
];

const donorCohortOptions: { value: CohortContext; label: string }[] = [
  { value: 'none', label: 'No specific cohort' },
  { value: 'first-time-donor', label: 'First-Time Donor' },
  { value: 'recurring-donor', label: 'Recurring Donor' },
  { value: 'major-gift-prospect', label: 'Major Gift Prospect' },
  { value: 'lapsed-donor', label: 'Lapsed Donor' },
  { value: 'planned-giving', label: 'Planned Giving Prospect' },
];

const externalCohortOptions: { value: CohortContext; label: string }[] = [
  { value: 'none', label: 'No specific cohort' },
  { value: 'government-official', label: 'Government Official' },
  { value: 'business-leader', label: 'Business Leader' },
  { value: 'nonprofit-leader', label: 'Nonprofit Leader' },
  { value: 'peer-institution', label: 'Peer Institution Leader' },
];

// ============= MOMENT OPTIONS BY AUDIENCE =============
const studentMomentOptions: { value: CommunicationMoment; label: string }[] = [
  { value: 'brand-awareness', label: 'Brand Awareness' },
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
  { value: 'brand-awareness', label: 'Brand Awareness' },
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

const alumniMomentOptions: { value: CommunicationMoment; label: string }[] = [
  { value: 'brand-awareness', label: 'Brand Awareness' },
  { value: 'reunion-campaign', label: 'Reunion Campaign' },
  { value: 'homecoming', label: 'Homecoming' },
  { value: 'alumni-giving-day', label: 'Alumni Giving Day' },
  { value: 'career-networking', label: 'Career Networking Event' },
  { value: 'chapter-event', label: 'Chapter/Regional Event' },
  { value: 'alumni-recognition', label: 'Alumni Recognition' },
  { value: 'alumni-newsletter', label: 'Newsletter/Update' },
  { value: 'campus-event', label: 'Campus Event' },
];

const parentMomentOptions: { value: CommunicationMoment; label: string }[] = [
  { value: 'brand-awareness', label: 'Brand Awareness' },
  { value: 'family-orientation', label: 'Family Orientation' },
  { value: 'family-weekend', label: 'Family Weekend' },
  { value: 'parent-giving', label: 'Parent Giving Campaign' },
  { value: 'parent-newsletter', label: 'Parent Newsletter' },
  { value: 'tuition-notification', label: 'Tuition/Financial Notification' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'seasonal', label: 'Seasonal' },
];

const donorMomentOptions: { value: CommunicationMoment; label: string }[] = [
  { value: 'brand-awareness', label: 'Brand Awareness' },
  { value: 'annual-fund', label: 'Annual Fund Campaign' },
  { value: 'capital-campaign', label: 'Capital Campaign' },
  { value: 'giving-day', label: 'Giving Day' },
  { value: 'stewardship', label: 'Stewardship/Thank You' },
  { value: 'impact-report', label: 'Impact Report' },
  { value: 'planned-giving-outreach', label: 'Planned Giving Outreach' },
  { value: 'donor-recognition', label: 'Donor Recognition Event' },
  { value: 'campus-event', label: 'Campus Event' },
];

const policyMakerMomentOptions: { value: CommunicationMoment; label: string }[] = [
  { value: 'brand-awareness', label: 'Brand Awareness' },
  { value: 'advocacy-support', label: 'Support University Priorities' },
  { value: 'funding-advocacy', label: 'Advocate for Increased Funding' },
  { value: 'legislative-event', label: 'Attend Legislative Events' },
  { value: 'campus-event', label: 'Campus Visit/Event' },
  { value: 'recognition', label: 'Recognition/Appreciation' },
];

const communityPartnerMomentOptions: { value: CommunicationMoment; label: string }[] = [
  { value: 'brand-awareness', label: 'Brand Awareness' },
  { value: 'partnership-initiation', label: 'Initiate Partnership' },
  { value: 'partnership-sustain', label: 'Sustain Partnership' },
  { value: 'community-event', label: 'Participate in Events' },
  { value: 'success-story-share', label: 'Share Success Stories' },
  { value: 'campus-event', label: 'Campus Event' },
];

const higherEdLeaderMomentOptions: { value: CommunicationMoment; label: string }[] = [
  { value: 'brand-awareness', label: 'Brand Awareness' },
  { value: 'research-collaboration', label: 'Initiate Research Collaboration' },
  { value: 'programming-collaboration', label: 'Program Collaboration' },
  { value: 'best-practices-share', label: 'Share Best Practices at Conferences' },
  { value: 'peer-reputation', label: 'Increase Peer Reputation' },
  { value: 'campus-event', label: 'Campus Visit/Event' },
];

// ============= DOMAIN OPTIONS BY AUDIENCE CATEGORY =============
const studentDomainOptions: { value: MessageDomain; label: string }[] = [
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
];

const employeeDomainOptions: { value: MessageDomain; label: string }[] = [
  { value: 'hr-benefits', label: 'HR & Benefits' },
  { value: 'professional-growth', label: 'Professional Growth' },
  { value: 'workplace-culture', label: 'Workplace Culture' },
  { value: 'operations', label: 'Operations' },
  { value: 'safety-security', label: 'Safety & Security' },
  { value: 'compliance', label: 'Compliance' },
];

const externalDomainOptions: { value: MessageDomain; label: string }[] = [
  { value: 'giving', label: 'Giving/Fundraising' },
  { value: 'alumni-relations', label: 'Alumni Relations' },
  { value: 'stewardship', label: 'Stewardship' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'advocacy', label: 'Advocacy' },
  { value: 'partnership', label: 'Partnership' },
];

// ============= GOAL OPTIONS BY AUDIENCE CATEGORY =============
const studentGoalOptions: { value: PrimaryGoal; label: string }[] = [
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
  { value: 'register', label: 'Register (course/event)' },
];

const employeeGoalOptions: { value: PrimaryGoal; label: string }[] = [
  { value: 'enroll-benefits', label: 'Enroll in Benefits' },
  { value: 'complete-training', label: 'Complete Training' },
  { value: 'acknowledge', label: 'Acknowledge (policy/info)' },
  { value: 'participate', label: 'Participate (event/initiative)' },
  { value: 'review-update', label: 'Review & Update (info/profile)' },
  { value: 'attend', label: 'Attend (event/meeting)' },
  { value: 'respond', label: 'Respond (reply/contact)' },
];

const externalGoalOptions: { value: PrimaryGoal; label: string }[] = [
  { value: 'donate', label: 'Donate (make a gift)' },
  { value: 'renew-giving', label: 'Renew Giving' },
  { value: 'upgrade-giving', label: 'Upgrade Giving Level' },
  { value: 'engage', label: 'Engage (participate/connect)' },
  { value: 'attend-event', label: 'Attend Event' },
  { value: 'register-event', label: 'Register for Event' },
  { value: 'advocate', label: 'Advocate (support cause)' },
  { value: 'connect', label: 'Connect (network/mentor)' },
  { value: 'respond', label: 'Respond (reply/contact)' },
];

// ============= CHANNEL & DEPARTMENT & TONE OPTIONS =============
const channelOptions: { value: Channel; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS/Text' },
  { value: 'portal', label: 'Student Portal' },
  { value: 'landing-page', label: 'Landing Page' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'direct-mail', label: 'Direct Mail' },
  { value: 'phone-call', label: 'Phone Call' },
  { value: 'talking-points', label: 'Executive Talking Points' },
];

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

const toneOptions: { value: TonePreference; label: string }[] = [
  { value: 'supportive', label: 'Supportive' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'encouraging', label: 'Encouraging' },
  { value: 'directive', label: 'Directive' },
  { value: 'celebratory', label: 'Celebratory' },
  { value: 'urgent', label: 'Urgent' },
];

// ============= HELPER FUNCTIONS =============
// General cohort options for "General (All Audiences)"
const generalCohortOptions: { value: CohortContext; label: string }[] = [
  { value: 'none', label: 'No specific cohort' },
];

// General moment options for "General (All Audiences)"
const generalMomentOptions: { value: CommunicationMoment; label: string }[] = [
  { value: 'brand-awareness', label: 'Brand Awareness' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'campus-event', label: 'Campus Event' },
  { value: 'recognition', label: 'Recognition/Appreciation' },
];

function getAudienceCategory(audience?: AudienceType): 'general' | 'student' | 'employee' | 'alumni' | 'parent' | 'donor' | 'external' {
  if (!audience) return 'student';
  if (audience === 'general') return 'general';
  
  const studentAudiences: AudienceType[] = ['prospective', 'first-year', 'continuing', 'at-risk', 'graduate', 'online-learner'];
  const employeeAudiences: AudienceType[] = ['employee'];
  const alumniAudiences: AudienceType[] = ['alumni'];
  const parentAudiences: AudienceType[] = ['parents'];
  const donorAudiences: AudienceType[] = ['donors'];
  
  if (studentAudiences.includes(audience)) return 'student';
  if (employeeAudiences.includes(audience)) return 'employee';
  if (alumniAudiences.includes(audience)) return 'alumni';
  if (parentAudiences.includes(audience)) return 'parent';
  if (donorAudiences.includes(audience)) return 'donor';
  return 'external';
}

function getCohortOptions(audience?: AudienceType) {
  const category = getAudienceCategory(audience);
  switch (category) {
    case 'general': return generalCohortOptions;
    case 'employee': return employeeCohortOptions;
    case 'alumni': return alumniCohortOptions;
    case 'parent': return parentCohortOptions;
    case 'donor': return donorCohortOptions;
    case 'external': return externalCohortOptions;
    default: return studentCohortOptions;
  }
}

function getMomentOptions(audience?: AudienceType) {
  const category = getAudienceCategory(audience);
  switch (category) {
    case 'general': return generalMomentOptions;
    case 'employee': return employeeMomentOptions;
    case 'alumni': return alumniMomentOptions;
    case 'parent': return parentMomentOptions;
    case 'donor': return donorMomentOptions;
    case 'external':
      if (audience === 'policy-makers') return policyMakerMomentOptions;
      if (audience === 'community-partners') return communityPartnerMomentOptions;
      if (audience === 'higher-ed-leaders') return higherEdLeaderMomentOptions;
      return communityPartnerMomentOptions;
    default: return studentMomentOptions;
  }
}

function getDomainOptions(audience?: AudienceType) {
  const category = getAudienceCategory(audience);
  switch (category) {
    case 'employee': return employeeDomainOptions;
    case 'alumni':
    case 'parent':
    case 'donor':
    case 'external': return externalDomainOptions;
    default: return studentDomainOptions;
  }
}

function getGoalOptions(audience?: AudienceType) {
  const category = getAudienceCategory(audience);
  switch (category) {
    case 'employee': return employeeGoalOptions;
    case 'alumni':
    case 'parent':
    case 'donor':
    case 'external': return externalGoalOptions;
    default: return studentGoalOptions;
  }
}

// ============= MAIN COMPONENT =============
export function ContextSelector({ context, onChange, mode = 'evaluator' }: ContextSelectorProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  
  const showExtendedOptions = mode === 'builder' || mode === 'mapper';
  const hideChannel = mode === 'mapper' || mode === 'builder';
  
  // Get conditional options based on audience
  const cohortOptions = getCohortOptions(context.audience);
  const momentOptions = getMomentOptions(context.audience);
  const domainOptions = getDomainOptions(context.audience);
  const goalOptions = getGoalOptions(context.audience);

  return (
    <div className="space-y-4">
      {/* Essential Filters - Always Visible */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${hideChannel ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
        <div className="space-y-2">
          <Label htmlFor="audience" className="flex items-center gap-2 text-sm font-medium">
            <Users className="w-4 h-4 text-pillar-authority" />
            Audience Type
          </Label>
          <Select
            value={context.audience ?? ""}
            onValueChange={(value) =>
              onChange({ 
                ...context, 
                audience: value === "none" || value === "" ? undefined : value as AudienceType,
                // Reset cohort, moment, domain, goal when audience changes
                cohort: undefined,
                moment: undefined,
                moments: undefined,
                domain: undefined,
                goal: undefined,
                goals: undefined,
              })
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

      {/* Advanced Options - Collapsible (only in builder/mapper mode) */}
      {showExtendedOptions && (
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-primary/50"
            >
              {advancedOpen ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide Advanced Options
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show Advanced Options (Department, Domain, Goal, Tone)
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-border rounded-lg bg-muted/30">
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium">
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
                <Label htmlFor="domain" className="text-sm font-medium">
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
                <Label htmlFor="goal" className="text-sm font-medium">
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
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
