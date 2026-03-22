export type OperationMode = 
  | 'evaluator' 
  | 'builder' 
  | 'mapper' 
  | 'customization';

/** Department is now a dynamic string resolved from industry vocabulary */
export type Department = string;

export interface DepartmentInfo {
  id: Department;
  name: string;
  description: string;
  primaryTools: OperationMode[];
  typicalAudiences: AudienceType[];
  typicalMoments: CommunicationMoment[];
}

export type AudienceType = 
  | 'general'
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
  // Alumni cohorts
  | 'young-alumni'
  | 'established-alumni'
  | 'lapsed-alumni'
  | 'engaged-alumni'
  | 'legacy-family'
  // Parent cohorts
  | 'prospective-parent'
  | 'current-parent'
  | 'new-family'
  | 'graduating-family'
  // Donor cohorts
  | 'first-time-donor'
  | 'recurring-donor'
  | 'major-gift-prospect'
  | 'lapsed-donor'
  | 'planned-giving'
  // External audience cohorts
  | 'government-official'
  | 'business-leader'
  | 'nonprofit-leader'
  | 'peer-institution'
  | 'none';

export type CommunicationMoment = 
  // General moments (cross-audience)
  | 'brand-awareness'
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
  // Alumni moments
  | 'reunion-campaign'
  | 'homecoming'
  | 'alumni-giving-day'
  | 'career-networking'
  | 'chapter-event'
  | 'alumni-recognition'
  | 'alumni-newsletter'
  // Parent/Family moments
  | 'family-orientation'
  | 'family-weekend'
  | 'parent-giving'
  | 'parent-newsletter'
  | 'tuition-notification'
  // Donor moments
  | 'annual-fund'
  | 'capital-campaign'
  | 'giving-day'
  | 'stewardship'
  | 'impact-report'
  | 'planned-giving-outreach'
  | 'donor-recognition'
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
  | 'talking-points'
  | 'news-article'
  | 'case-for-care';

export type MessageDomain = 
  // Student domains
  | 'academic'
  | 'financial'
  | 'wellbeing'
  | 'behavioral'
  | 'engagement'
  | 'seasonal'
  | 'athletics'
  | 'compliance'
  | 'scholastic'
  | 'admissions'
  | 'recruitment'
  // Employee domains
  | 'hr-benefits'
  | 'professional-growth'
  | 'workplace-culture'
  | 'operations'
  | 'safety-security'
  // External/Advancement domains
  | 'giving'
  | 'alumni-relations'
  | 'stewardship'
  | 'advocacy'
  | 'partnership';

export type PrimaryGoal = 
  // Student goals
  | 'persist'
  | 'attend'
  | 'submit'
  | 'respond'
  | 'check-in'
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
  | 'review-update'
  // External/Advancement goals
  | 'donate'
  | 'engage'
  | 'attend-event'
  | 'register-event'
  | 'advocate'
  | 'connect'
  | 'renew-giving'
  | 'upgrade-giving';

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
  // Output language
  outputLanguage?: string; // e.g. 'en', 'es', 'fr', 'zh', 'ar' — defaults to English
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
  slug?: string;
  body: string;
  sections?: { heading: string; text: string }[];
  cta: string;
  ctaUrl?: string;
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
  context: string; // e.g., "Board of Trustees quarterly meeting", "Alumni donor reception"
  audience: string; // e.g., "Board members focused on enrollment and financial sustainability"
  openingHook?: string; // Compelling 2-3 sentence opening
  keyMessages: string[]; // Complete, quotable talking points (2-3 sentences each)
  supportingData?: string[]; // Specific stats, achievements, proof points
  anticipatedQuestions?: string[]; // Full questions audience might ask
  suggestedResponses?: string[]; // Brief, confident answers to anticipated questions
  transitionPhrases?: string[]; // Natural transitions between topics
  closingStatement?: string; // Powerful 2-3 sentence closing
}

export interface NewsArticleDraft {
  headline: string;
  subheadline?: string;
  leadParagraph: string;
  bodyParagraphs: string[];
  pullQuote?: {
    quote: string;
    attribution: string;
  };
  boilerplate?: string;
  mediaContact?: {
    name: string;
    title: string;
    email: string;
    phone?: string;
  };
  suggestedTags?: string[];
  relatedLinks?: string[];
}

// Enhanced Case for Support structure with magazine-style elements
export interface CaseForSupportStat {
  value: string;        // "90%", "$2B", "#1"
  label: string;        // "of students graduate on time"
  context?: string;     // Optional additional context
}

export interface CaseForSupportStory {
  headline?: string;           // "A Dream Realized"
  narrative: string;           // The story content (2-3 paragraphs)
  attribution?: string;        // "Maria Gonzalez, Class of 2024"
}

export interface CaseForSupportPullQuote {
  quote: string;
  attribution?: string;
}

export interface CaseForSupportLeaderMessage {
  leaderName: string;
  leaderTitle: string;
  message: string;               // The letter/message content
  signature?: string;            // Optional signature line
}

export interface CaseForSupportStrategicPillar {
  name: string;                  // e.g., "Preparing Change Makers"
  description: string;           // 2-3 sentences
  icon?: string;                 // Optional icon name hint
}

export interface CaseForSupportGivingOpportunity {
  category: string;              // "Investing in Students", "Investing in Faculty"
  opportunities: {
    name: string;
    amount: string;
    description: string;
  }[];
}

export interface CaseForCareDraft {
  documentTitle: string;
  campaignName?: string;
  campaignTagline?: string;           // "Dream Bold. Give Boldly."
  targetAmount?: string;
  
  // Dean's/Leader's Message (NEW - inspired by UC Davis)
  leaderMessage?: CaseForSupportLeaderMessage;
  
  // Story-driven opening (enhanced)
  openingNarrative?: string;          // Legacy support
  openingStory?: CaseForSupportStory; // New structured story
  
  problemStatement?: string;
  visionStatement?: string;
  missionConnection?: string;
  
  // Strategic Pillars (NEW - like "Preparing change makers", "Advancing health solutions", "Fostering communities")
  strategicPillars?: CaseForSupportStrategicPillar[];
  
  keyPrograms?: {
    name: string;
    description: string;
    impact: string;
  }[];
  
  // Impact statistics - supports both legacy string[] and new structured format
  impactStatistics?: (string | CaseForSupportStat)[];
  
  // Pull quotes for visual emphasis
  pullQuotes?: CaseForSupportPullQuote[];
  
  testimonials?: {
    quote: string;
    attribution: string;
    role?: string;
  }[];
  
  // Structured giving opportunities table (NEW - like UC Davis investment table)
  givingOpportunities?: CaseForSupportGivingOpportunity[];
  
  givingLevels?: {
    amount: string;
    impact: string;
  }[];
  
  callToAction?: string;
  closingStatement?: string;
  contactInfo?: {
    name: string;
    title: string;
    email: string;
    phone?: string;
  };
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
  'news-article'?: NewsArticleDraft;
  'case-for-care'?: CaseForCareDraft;
}

// Brand Adherence Scoring
export interface BrandElementScore {
  element: string;
  elementType: 'promise' | 'pillar' | 'proofPoint' | 'commitment' | 'pathway';
  incorporated: boolean;
  strength: 'strong' | 'moderate' | 'weak' | 'absent';
  evidence?: string; // Quote or reference from the generated content
}

export interface BrandAdherenceResult {
  overallScore: number; // 0-100
  overallRating: 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement';
  elementScores: BrandElementScore[];
  summary: string;
  suggestions?: string[];
}

export interface BuilderResult {
  channelDrafts: ChannelDrafts;
  drafts: string[]; // Legacy fallback
  recommendedAuthority: string;
  recommendedSender: string;
  recommendedLength: string;
  brandAdherence?: BrandAdherenceResult; // Brand adherence scoring
}

export interface MapperResult {
  journey: StrategyJourney;
}

export type ProfileType = 'university' | 'college' | 'division' | 'unit' | 'department' | 'headquarters' | 'region' | 'location';

/** Institution type is now a dynamic string resolved from industry vocabulary classificationOptions */
export type InstitutionType = string;

export interface InstitutionalConfig {
  // Institution Classification
  institutionType?: InstitutionType;
  // Visual Branding — Logo Variants
  logoUrl?: string;              // Primary logo
  logoUrlSecondary?: string;     // Secondary logo (e.g. horizontal/stacked variant)
  logoUrlAthletic?: string;      // Athletic mark
  logoUrlPresidential?: string;  // Presidential mark / seal
  // Legacy aliases (kept for backward compat)
  logoUrlAlt?: string;           // @deprecated — use logoUrlSecondary
  logoUrlIcon?: string;          // @deprecated — use logoUrlAthletic
  // Brand Colors
  primaryColor?: string;         // Primary brand color (hex)
  secondaryColor?: string;       // Secondary brand color (hex)
  tertiaryColor?: string;        // Tertiary brand color (hex)
  tertiaryColorNA?: boolean;     // true when institution has no tertiary color
  accentColor?: string;          // Accent color (hex) - legacy, use secondaryColor
  
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
  
  // Development/Advancement Leadership
  supportGoal?: string;            // Campaign support goal (e.g., "$50 million")
  supportGoalDescription?: string; // Brief description of what the goal supports
  developmentDirectorName?: string;
  developmentDirectorTitle?: string;
  developmentDirectorEmail?: string;
  developmentDirectorPhone?: string;
  seniorDevelopmentOfficerName?: string;
  seniorDevelopmentOfficerTitle?: string;
  seniorDevelopmentOfficerEmail?: string;
  majorGiftsOfficerName?: string;
  majorGiftsOfficerTitle?: string;
  majorGiftsOfficerEmail?: string;
  annualGivingManagerName?: string;
  annualGivingManagerTitle?: string;
  annualGivingManagerEmail?: string;
  
  // Additional Key Contacts for Case for Support
  presidentName?: string;
  presidentTitle?: string;
  provostName?: string;
  provostTitle?: string;
  cfoName?: string;
  cfoTitle?: string;
  alumniRelationsDirectorName?: string;
  alumniRelationsDirectorTitle?: string;
  alumniRelationsDirectorEmail?: string;
  
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
  
  // Brand Platform (extracted from Content DNA)
  brandPlatform?: BrandPlatform;
  // Brand layer selection for generation
  brandSelection?: BrandLayerSelection;
  // Legacy: selected pillars only (deprecated, use brandSelection)
  selectedPillars?: string[];

  // Enterprise Profile Fields
  enterpriseRegion?: string;       // e.g., "North America", "EMEA", "APAC"
  enterpriseMarket?: string;       // e.g., "Southeast US", "DACH"
  primaryLanguage?: string;        // ISO language code e.g., "en", "es", "fr"
  secondaryLanguages?: string[];   // Additional supported languages
  enterpriseLevel?: 'headquarters' | 'region' | 'division' | 'location';
  locationCode?: string;           // Internal identifier e.g., "NA-SE-001"
  timezone?: string;               // e.g., "America/New_York"
  country?: string;                // e.g., "United States"
  stateProvince?: string;          // e.g., "Georgia"
  city?: string;                   // e.g., "Atlanta"
}

// Brand layer selection for message generation
export interface BrandLayerSelection {
  pillars: string[];
  proofPoints: string[];
  commitments: string[];
  pathways: string[];
  includePromise: boolean;
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

// Brand Platform types - extracted from Content DNA analysis
export interface BrandPillar {
  name: string;
  description: string;
  keywords: string[];
}

export interface BrandPathway {
  name: string;
  description: string;
}

export interface BrandPlatform {
  brandPromise: string;
  brandPillars: BrandPillar[];
  brandPathways: BrandPathway[];
  proofPoints: string[];
  commitments: string[];
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
