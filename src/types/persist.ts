export type OperationMode = 
  | 'evaluator' 
  | 'builder' 
  | 'mapper' 
  | 'customization';

export type Department = 
  | 'central-marketing'
  | 'executive-comms'
  | 'enrollment-management'
  | 'registrar'
  | 'college-communications'
  | 'student-success'
  | 'recruitment'
  | 'health-wellbeing'
  | 'advancement-alumni';

export interface DepartmentInfo {
  id: Department;
  name: string;
  description: string;
  primaryTools: OperationMode[];
  typicalAudiences: AudienceType[];
  typicalMoments: CommunicationMoment[];
}

export type AudienceType = 
  | 'prospective' 
  | 'first-year' 
  | 'continuing' 
  | 'at-risk' 
  | 'graduate'
  | 'alumni'
  | 'parents'
  | 'donors';

export type CohortContext = 
  | 'first-gen'
  | 'probation'
  | 'online'
  | 'commuter'
  | 'residential'
  | 'transfer'
  | 'international'
  | 'veteran'
  | 'parent'
  | 'working-adult'
  | 'none';

export type CommunicationMoment = 
  | 'early-term' 
  | 'midterm' 
  | 'finals'
  | 're-engagement'
  | 'seasonal'
  | 'recruitment'
  | 'orientation'
  | 'registration'
  | 'yield'
  | 'summer-melt'
  | 'graduation'
  | 'giving-campaign';

export type Channel = 
  | 'email' 
  | 'sms' 
  | 'portal' 
  | 'landing-page'
  | 'social-media'
  | 'direct-mail'
  | 'phone-call';

export type MessageDomain = 
  | 'academic'
  | 'financial'
  | 'wellbeing'
  | 'behavioral'
  | 'engagement'
  | 'seasonal'
  | 'athletics'
  | 'compliance'
  | 'scholastic'
  | 'giving'
  | 'alumni-relations'
  | 'admissions'
  | 'recruitment';

export type PrimaryGoal = 
  | 'persist'
  | 'attend'
  | 'submit'
  | 'respond'
  | 'check-in'
  | 'donate'
  | 'register'
  | 'enroll'
  | 'inquiry'
  | 'apply'
  | 'yield'
  | 'confirm';

export type TonePreference = 
  | 'supportive'
  | 'authoritative'
  | 'encouraging'
  | 'directive'
  | 'celebratory'
  | 'urgent';

export type Rating = 'Strong' | 'Moderate' | 'Needs Attention';

export interface PillarEvaluation {
  pillar: string;
  pillarKey: 'authority' | 'susceptibility' | 'cognitive' | 'consensus' | 'ethics';
  rating: Rating;
  explanation: string;
  recommendation: string;
}

export interface MessageContext {
  audience?: AudienceType;
  cohort?: CohortContext;
  moment?: CommunicationMoment;
  channel?: Channel;
  channels?: Channel[]; // For multi-channel selection (strategy page)
  domain?: MessageDomain;
  goal?: PrimaryGoal;
  tone?: TonePreference;
  department?: Department;
  // Urgency & Timing
  dueDate?: string; // ISO date string for countdown/deadline
  startDate?: string; // ISO date string for journey start
  urgencyLabel?: string; // Custom label like "Registration Deadline" or "Application Due"
}

// Strategy Journey Types
export type StrategyPhase = 'short-term' | 'mid-term' | 'long-term';

export interface JourneyTouchpoint {
  week: number;
  phase: StrategyPhase;
  title: string;
  description: string;
  channel: Channel;
  domain: MessageDomain;
  tone: TonePreference;
  behavioralNudge: string;
  goal: PrimaryGoal;
  sampleSubject?: string;
  keyMessage?: string;
}

export interface StrategyJourney {
  overview: string;
  totalWeeks: number;
  phases: {
    phase: StrategyPhase;
    name: string;
    weekRange: string;
    focus: string;
    keyObjectives: string[];
  }[];
  touchpoints: JourneyTouchpoint[];
  risks: string[];
  successMetrics: string[];
}

export interface EvaluationResult {
  pillars: PillarEvaluation[];
  refinedMessage: string;
  reducedLoadMessage: string;
  changeExplanation: string;
}

export interface BuilderResult {
  drafts: string[];
  recommendedAuthority: string;
  recommendedSender: string;
  recommendedLength: string;
  evaluation: EvaluationResult;
}

export interface MapperResult {
  journey: StrategyJourney;
}

export interface InstitutionalConfig {
  // Branding & Identity
  institutionName?: string;
  mascot?: string;
  slogans?: string[];
  
  // Locations & Facilities
  buildingNames?: string[];
  programNames?: string[];
  supportCenters?: string[];
  
  // People & Roles
  leaderNames?: string[];
  advisorTitles?: string[];
  staffTitles?: string[];
  
  // Naming Conventions
  studentAddressing?: 'first-name' | 'full-name' | 'formal';
  staffAddressing?: 'first-name' | 'title-last' | 'full-title';
  pronounPreference?: 'they' | 'he-she' | 'avoid';
  
  // Call to Actions
  primaryCTAs?: string[];
  secondaryCTAs?: string[];
  urgentCTAs?: string[];
  
  // Contact & Resources
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  websiteLinks?: string[];
  socialMediaHandles?: string[];
  
  // Academic Terms
  academicTerms?: string[];
  gradingTerms?: string[];
  enrollmentTerms?: string[];
  
  // Signature Blocks
  signatureTemplates?: string[];
  
  // Tone & Style
  toneRules?: string[];
  wordsToAvoid?: string[];
  preferredPhrases?: string[];
  
  // Deadlines & Dates (placeholders)
  importantDates?: { label: string; placeholder: string }[];
}

export interface UserProfile {
  department: Department;
  onboardingComplete: boolean;
}

export interface MessageInput {
  content: string;
  context: MessageContext;
  mode: OperationMode;
  institutionalConfig?: InstitutionalConfig;
}
