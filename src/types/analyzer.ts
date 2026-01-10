// Types for Web Content Analyzer

export interface DNAAlignment {
  voiceScore: number;
  voiceFeedback: string;
  factScore: number;
  factFeedback: string;
  storyScore: number;
  storyFeedback: string;
  brandScore: number;
  brandFeedback: string;
}

export interface BrandVoiceCheck {
  phrasesUsedCorrectly?: string[];
  phrasesAvoidedIncorrectly?: string[];
  missingKeyPhrases?: string[];
}

export interface AnalysisSection {
  id: string;
  title: string;
  content: string;
  score: number;
  issues: AnalysisIssue[];
  strengths: AnalysisStrength[] | string[];
}

export interface AnalysisIssue {
  id?: string;
  type: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  quotedText?: string;
  recommendation?: string;
  dnaReference?: string;
}

export interface AnalysisStrength {
  type?: string;
  message: string;
  quotedText?: string;
  dnaReference?: string;
}

export interface AnalysisSummary {
  totalIssues: number;
  totalStrengths: number;
  topIssues?: string[];
  topStrengths?: string[];
  criticalIssues?: string[];
  quickWins?: string[];
  missingFacts?: string[];
  storyOpportunities?: string[];
}

export interface AnalysisResult {
  overallScore: number;
  executiveSummary?: string;
  dnaAlignment?: DNAAlignment;
  brandVoiceCheck?: BrandVoiceCheck;
  sections: AnalysisSection[];
  summary: AnalysisSummary;
}

// Remediation tracking for issues
export interface IssueRemediation {
  issueId: string;
  sectionId: string;
  resolved: boolean;
  resolvedAt?: string;
  notes?: string;
}

// Saved analysis draft data structure
export interface SavedAnalysisData {
  sourceUrl?: string;
  sourceContent: string;
  analysisResult: AnalysisResult;
  screenshot?: string;
  profileId?: string;
  profileName?: string;
  analyzedAt: string;
  
  // Remediation tracking
  remediation: {
    totalIssues: number;
    resolvedIssues: IssueRemediation[];
    generalNotes?: string;
    lastReanalyzedAt?: string;
    previousScores?: number[]; // Track score history over time
  };
}

// For library saving
export interface SavedAnalysisMetadata {
  sourceUrl?: string;
  overallScore: number;
  totalIssues: number;
  resolvedIssues: number;
  analyzedAt: string;
  profileName?: string;
}
