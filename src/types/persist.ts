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
  | 'landing-page';

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
  buildingNames?: string[];
  programNames?: string[];
  mascot?: string;
  slogans?: string[];
  leaderNames?: string[];
  toneRules?: string[];
  wordsToAvoid?: string[];
}

export interface MessageInput {
  content: string;
  context: MessageContext;
  mode: OperationMode;
  institutionalConfig?: InstitutionalConfig;
}
