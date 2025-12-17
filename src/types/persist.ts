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
  | 'advancement-alumni'
  | 'human-resources';

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
  | 'online-learner'
  | 'employee'
  | 'alumni'
  | 'parents'
  | 'donors';

export type CohortContext = 
  // Student cohorts
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
  // Employee cohorts
  | 'faculty'
  | 'staff'
  | 'adjunct'
  | 'administrator'
  | 'hourly'
  | 'new-hire'
  | 'supervisor'
  | 'remote-employee'
  | 'none';

export type CommunicationMoment = 
  // Student moments
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
  | 'giving-campaign'
  // Employee moments
  | 'open-enrollment'
  | 'performance-review'
  | 'professional-development'
  | 'onboarding'
  | 'policy-update'
  | 'campus-event'
  | 'wellness-initiative'
  | 'recognition'
  | 'budget-cycle'
  | 'strategic-planning';

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
  | 'recruitment'
  // Employee domains
  | 'hr-benefits'
  | 'professional-growth'
  | 'workplace-culture'
  | 'operations'
  | 'safety-security';

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
  | 'confirm'
  // Employee goals
  | 'enroll-benefits'
  | 'complete-training'
  | 'acknowledge'
  | 'participate'
  | 'review-update';

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
  // Additional context for refinement
  additionalContext?: string; // User-provided context, situation details, or refinement notes
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

export interface EmailDraft {
  subject: string;
  body: string;
}

export interface LandingPageDraft {
  headline: string;
  subheadline?: string;
  body: string;
  cta: string;
}

export interface CallScriptDraft {
  opening: string;
  purpose: string;
  talkingPoints: string[];
  objectionHandlers?: string[];
  closing: string;
  voicemail?: string;
}

export interface ChannelDrafts {
  email?: EmailDraft;
  sms?: string;
  'social-media'?: string;
  portal?: string;
  'landing-page'?: LandingPageDraft;
  'direct-mail'?: string;
  'phone-call'?: CallScriptDraft;
}

export interface BuilderResult {
  channelDrafts: ChannelDrafts;
  drafts: string[]; // Legacy fallback
  recommendedAuthority: string;
  recommendedSender: string;
  recommendedLength: string;
}

export interface MapperResult {
  journey: StrategyJourney;
}

export interface InstitutionalConfig {
  // Branding & Identity
  institutionName?: string;
  institutionAbbreviation?: string;
  mascot?: string;
  slogans?: string[];
  
  // Digital Platforms & Systems
  portalName?: string;           // e.g., "MyUniversity Portal"
  lmsName?: string;              // e.g., "Canvas", "Blackboard"
  emailDomain?: string;          // e.g., "@university.edu"
  advisingSystemName?: string;   // e.g., "Navigate", "Starfish"
  schedulingSystemName?: string; // e.g., "Calendly", "Bookings"
  degreeAuditSystem?: string;    // e.g., "DegreeWorks"
  financialAidPortal?: string;   // e.g., "Financial Aid Self-Service"
  registrationSystem?: string;   // e.g., "Student Registration Portal"
  
  // Locations & Facilities
  buildingNames?: string[];
  programNames?: string[];
  supportCenters?: string[];
  libraryName?: string;
  tutorCenter?: string;
  writingCenter?: string;
  mathCenter?: string;
  careerCenter?: string;
  counselingCenter?: string;
  healthCenter?: string;
  fitnessCenter?: string;
  diningHall?: string;
  
  // Campus Geography
  campusTerms?: string[];        // e.g., "quad", "commons", "student union"
  defaultMeetingLocation?: string;
  virtualMeetingPlatform?: string; // e.g., "Zoom", "Teams"
  
  // Offices & Departments
  registrarOffice?: string;
  financialAidOffice?: string;
  admissionsOffice?: string;
  bursarOffice?: string;
  itHelpDesk?: string;
  housingOffice?: string;
  studentAffairsOffice?: string;
  internationalOffice?: string;
  disabilityServices?: string;
  veteransServices?: string;
  
  // People & Roles
  leaderNames?: string[];
  advisorTitles?: string[];
  staffTitles?: string[];
  defaultAdvisorName?: string;   // Placeholder name for templates
  
  // Naming Conventions
  studentAddressing?: 'first-name' | 'full-name' | 'formal';
  staffAddressing?: 'first-name' | 'title-last' | 'full-title';
  pronounPreference?: 'they' | 'he-she' | 'avoid';
  studentIdTerm?: string;        // e.g., "Student ID", "University ID", "Banner ID"
  
  // Call to Actions
  primaryCTAs?: string[];
  secondaryCTAs?: string[];
  urgentCTAs?: string[];
  
  // Contact & Resources
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  advisingEmail?: string;
  generalHelpEmail?: string;
  emergencyPhone?: string;
  textAlertNumber?: string;
  websiteLinks?: string[];
  socialMediaHandles?: string[];
  appointmentLink?: string;      // Direct booking URL
  
  // Academic Terms
  academicTerms?: string[];
  gradingTerms?: string[];
  enrollmentTerms?: string[];
  currentTermName?: string;      // e.g., "Spring 2025"
  nextTermName?: string;         // e.g., "Fall 2025"
  
  // Time & Scheduling
  officeHoursFormat?: string;    // e.g., "Monday-Friday 8am-5pm"
  timeZone?: string;             // e.g., "Eastern Time"
  
  // Signature Blocks
  signatureTemplates?: string[];
  
  // Tone & Style
  toneRules?: string[];
  wordsToAvoid?: string[];
  preferredPhrases?: string[];
  
  // Deadlines & Dates (placeholders)
  importantDates?: { label: string; placeholder: string }[];
  
  // Brand Voice Samples & Analysis
  brandVoiceSamples?: string[];
  voiceAnalysis?: VoiceAnalysis;
}

export interface VoiceAnalysis {
  overallTone: string;
  keyCharacteristics: string[];
  vocabularyPatterns: string[];
  sentenceStyle: string;
  formalityLevel: string;
  emotionalTone: string;
  commonPhrases: string[];
  messagingTactics: string[];
  summary: string;
  analyzedAt: string;
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
