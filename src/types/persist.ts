export type AudienceType = 
  | 'prospective' 
  | 'first-year' 
  | 'continuing' 
  | 'at-risk' 
  | 'graduate';

export type CommunicationMoment = 
  | 'recruitment' 
  | 'early-term' 
  | 'mid-term-warning' 
  | 'support' 
  | 're-engagement';

export type Channel = 
  | 'email' 
  | 'sms' 
  | 'portal' 
  | 'landing-page';

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
  moment: CommunicationMoment;
  channel: Channel;
}

export interface EvaluationResult {
  pillars: PillarEvaluation[];
  refinedMessage: string;
  reducedLoadMessage: string;
  changeExplanation: string;
}

export interface MessageInput {
  content: string;
  context: MessageContext;
}
