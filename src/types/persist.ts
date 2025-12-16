export type OperationMode = 
  | 'evaluator' 
  | 'builder' 
  | 'mapper' 
  | 'customization';

export type AudienceType = 
  | 'prospective' 
  | 'first-year' 
  | 'continuing' 
  | 'at-risk' 
  | 'graduate';

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
  | 'registration';

export type Channel = 
  | 'email' 
  | 'sms' 
  | 'portal' 
  | 'landing-page'
  | 'social-media';

export type MessageDomain = 
  | 'academic'
  | 'financial'
  | 'wellbeing'
  | 'behavioral'
  | 'engagement'
  | 'seasonal'
  | 'athletics'
  | 'compliance'
  | 'scholastic';

export type PrimaryGoal = 
  | 'persist'
  | 'attend'
  | 'submit'
  | 'respond'
  | 'check-in';

export type TonePreference = 
  | 'supportive'
  | 'authoritative'
  | 'encouraging'
  | 'directive';

export type Rating = 'Strong' | 'Moderate' | 'Needs Attention';

export interface PillarEvaluation {
  pillar: string;
  pillarKey: 'authority' | 'susceptibility' | 'cognitive' | 'consensus' | 'ethics';
  rating: Rating;
  explanation: string;
  recommendation: string;
}

export interface MessageContext {
  audience: AudienceType;
  cohort?: CohortContext;
  moment: CommunicationMoment;
  channel: Channel;
  domain?: MessageDomain;
  goal?: PrimaryGoal;
  tone?: TonePreference;
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
  recommendations: {
    domain: MessageDomain;
    emphasis: 'high' | 'medium' | 'low';
    authorityBalance: string;
    risks: string[];
  }[];
  strategyNotes: string;
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

export interface MessageInput {
  content: string;
  context: MessageContext;
  mode: OperationMode;
  institutionalConfig?: InstitutionalConfig;
}
