import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  XCircle,
  Sparkles,
  Target
} from 'lucide-react';

interface IssueDetail {
  type: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  quotedText?: string;
  recommendation?: string;
  dnaReference?: string;
}

interface StrengthDetail {
  type?: string;
  message: string;
  quotedText?: string;
  dnaReference?: string;
}

interface ContentSection {
  id: string;
  title: string;
  content: string;
  score: number;
  issues: (IssueDetail | { type: string; message: string; severity: 'error' | 'warning' | 'info' })[];
  strengths: (StrengthDetail | string)[];
}

interface VoiceAnalysis {
  primaryTone?: string;
  secondaryTones?: string[];
  vocabularyLevel?: string;
  sentenceStructure?: string;
  keyPhrases?: string[];
  avoidPhrases?: string[];
}

interface BrandScorePanelProps {
  section: ContentSection;
  voiceAnalysis?: VoiceAnalysis | any;
}

export function BrandScorePanel({ section, voiceAnalysis }: BrandScorePanelProps) {
  const getSeverityIcon = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityBg = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <Card>
      <CardContent className="pt-5 space-y-5">
        {/* Panel Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-2xl font-semibold leading-none tracking-tight">
              Voice Profile Match
            </h3>
          </div>

          <div className="text-right">
            <div
              className={cn(
                "text-3xl font-bold",
                section.score >= 80
                  ? "text-green-500"
                  : section.score >= 60
                    ? "text-amber-500"
                    : "text-red-500",
              )}
            >
              {section.score}/100
            </div>
            <div className="text-xs text-muted-foreground">Section Score</div>
          </div>
        </div>

        {/* Matched tones */}
        {voiceAnalysis && (
          <div className="flex flex-wrap gap-1">
            {voiceAnalysis.primaryTone && (
              <Badge variant="secondary" className="text-xs">
                {voiceAnalysis.primaryTone}
              </Badge>
            )}
            {voiceAnalysis.secondaryTones?.slice(0, 2).map((tone: string, i: number) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tone}
              </Badge>
            ))}
          </div>
        )}

        <Separator />

        {/* Issues */}
        {section.issues.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Issues Found ({section.issues.length})
            </div>
            <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1">
              {section.issues.map((issue, i) => {
                const issueDetail = issue as IssueDetail;
                return (
                  <div
                    key={i}
                    className={cn(
                      "p-2.5 rounded-lg border text-sm",
                      getSeverityBg(issue.severity)
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-medium text-xs">{issue.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {issue.message}
                        </p>
                        {issueDetail.quotedText && (
                          <p className="text-xs italic bg-background/50 p-1.5 rounded border-l-2 border-current">
                            "{issueDetail.quotedText}"
                          </p>
                        )}
                        {issueDetail.recommendation && (
                          <div className="text-xs mt-1 p-1.5 bg-primary/5 rounded">
                            <span className="font-medium text-primary">Fix: </span>
                            {issueDetail.recommendation}
                          </div>
                        )}
                        {issueDetail.dnaReference && (
                          <p className="text-[10px] text-muted-foreground">
                            DNA: {issueDetail.dnaReference}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Strengths */}
        {section.strengths.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Strengths ({section.strengths.length})
            </div>
            <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1">
              {section.strengths.map((strength, i) => {
                const isString = typeof strength === 'string';
                const strengthDetail = isString ? { message: strength } : strength as StrengthDetail;
                return (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg border bg-green-500/10 border-green-500/20 text-sm"
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0 space-y-1">
                        {strengthDetail.type && (
                          <p className="font-medium text-xs text-green-600">{strengthDetail.type}</p>
                        )}
                        <p className="text-xs">{strengthDetail.message}</p>
                        {strengthDetail.quotedText && (
                          <p className="text-xs italic bg-background/50 p-1.5 rounded border-l-2 border-green-500">
                            "{strengthDetail.quotedText}"
                          </p>
                        )}
                        {strengthDetail.dnaReference && (
                          <p className="text-[10px] text-muted-foreground">
                            DNA: {strengthDetail.dnaReference}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {section.issues.length === 0 && section.strengths.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">This section aligns well with your brand voice!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
