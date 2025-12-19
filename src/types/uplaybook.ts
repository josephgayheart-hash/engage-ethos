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
  | 'donors'
  | 'policy-makers'
  | 'community-partners'
  | 'higher-ed-leaders';

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
  | 'pre-college'
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
  | 'strategic-planning'
  // Policy Maker moments
  | 'advocacy-support'
  | 'funding-advocacy'
  | 'legislative-event'
  // Community Partner moments
  | 'partnership-initiation'
  | 'partnership-sustain'
  | 'community-event'
  | 'success-story-share'
  // Higher Ed Leader moments
  | 'research-collaboration'
  | 'programming-collaboration'
  | 'best-practices-share'
  | 'peer-reputation';

export type Channel = 
  | 'email' 
  | 'sms' 
  | 'portal' 
  | 'landing-page'
  | 'social-media'
  | 'direct-mail'
  | 'phone-call'
  | 'digital-ad-search'
  | 'digital-ad-social'
  | 'talking-points';

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
  moments?: CommunicationMoment[]; // For multi-select moments
  channel?: Channel;
  channels?: Channel[]; // For multi-channel selection (strategy page)
  domain?: MessageDomain;
  goal?: PrimaryGoal;
  goals?: PrimaryGoal[]; // For multi-select goals
  tone?: TonePreference;
  department?: Department;
  // Urgency & Timing
  dueDate?: string; // ISO date string for countdown/deadline
  startDate?: string; // ISO date string for journey start
  urgencyLabel?: string; // Custom label like "Registration Deadline" or "Application Due"
  // Cadence & Escalation (for journey designer)
  cadence?: 'daily' | 'every-other-day' | '2-3x-week' | 'weekly' | 'biweekly';
  escalation?: 'none' | 'gradual-increase' | 'gradual-decrease' | 'peak-middle' | 'bookend';
  estimatedTouchpoints?: number;
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

export interface SearchAdDraft {
  headlines: string[]; // Up to 3 headlines (30 chars each)
  descriptions: string[]; // Up to 2 descriptions (90 chars each)
  displayUrl?: string;
  finalUrl?: string;
}

export interface SocialAdDraft {
  primaryText: string; // Main ad copy
  headline: string; // Bold headline
  description?: string; // Link description
  ctaButton: string; // CTA button text
  platform: 'meta' | 'linkedin' | 'other';
}

export interface TalkingPointsDraft {
  context: string; // e.g., "Individual meeting with donor", "Board presentation", "Commencement speech"
  audience: string; // e.g., "Alumni donors", "Board of trustees", "Graduating class"
  keyMessages: string[]; // Main talking points
  supportingData?: string[]; // Stats, facts, or evidence to support points
  anticipatedQuestions?: string[]; // Q&A preparation
  transitionPhrases?: string[]; // Phrases to move between topics
  openingHook?: string; // Attention-grabbing opener
  closingStatement?: string; // Strong conclusion or call to action
}

export interface ChannelDrafts {
  email?: EmailDraft;
  sms?: string;
  'social-media'?: string;
  portal?: string;
  'landing-page'?: LandingPageDraft;
  'direct-mail'?: string;
  'phone-call'?: CallScriptDraft;
  'digital-ad-search'?: SearchAdDraft;
  'digital-ad-social'?: SocialAdDraft;
  'talking-points'?: TalkingPointsDraft;
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

export type ProfileType = 'university' | 'college' | 'division' | 'unit' | 'department';

export interface InstitutionalConfig {
  // Visual Branding
  logoUrl?: string;              // Profile-specific logo
  primaryColor?: string;         // Primary brand color (hex)
  accentColor?: string;          // Accent/secondary color (hex)
  
  // Unit/College/Division-Specific Leadership (conditional fields)
  unitType?: ProfileType;        // Type of organizational unit
  deanName?: string;             // For colleges
  deanTitle?: string;            // e.g., "Dean of Engineering"
  deanEmail?: string;
  associateDeans?: string[];     // List of associate deans
  directorName?: string;         // For units/centers
  directorTitle?: string;
  directorEmail?: string;
  vicePresidentName?: string;    // For divisions
  vicePresidentTitle?: string;
  vicePresidentEmail?: string;
  departmentChairName?: string;  // For departments
  departmentChairTitle?: string;
  departmentChairEmail?: string;
  executiveAssistantName?: string;
  executiveAssistantEmail?: string;
  
  // Unit-Specific Branding (can override parent)
  unitName?: string;             // e.g., "College of Engineering"
  unitAbbreviation?: string;     // e.g., "CoE"
  unitSlogan?: string;
  unitWebsite?: string;
  unitMainPhone?: string;
  unitMainEmail?: string;
  unitLocation?: string;         // Building/room
  unitSocialMedia?: string[];
  
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
