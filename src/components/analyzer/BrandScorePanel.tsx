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

interface ContentSection {
  id: string;
  title: string;
  content: string;
  score: number;
  issues: { type: string; message: string; severity: 'error' | 'warning' | 'info' }[];
  strengths: string[];
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
      <CardContent className="pt-5 space-y-4">
        {/* Section Title with Score */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">{section.title}</span>
          <div className={cn(
            "text-2xl font-bold",
            section.score >= 80 ? 'text-green-500' :
            section.score >= 60 ? 'text-amber-500' :
            'text-red-500'
          )}>
            {section.score}/100
          </div>
        </div>

        {/* Voice Match */}
        {voiceAnalysis && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="w-4 h-4 text-primary" />
              Voice Profile Match
            </div>
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
            <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1">
              {section.issues.map((issue, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-2 rounded-lg border text-sm",
                    getSeverityBg(issue.severity)
                  )}
                >
                  <div className="flex items-start gap-2">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs">{issue.type}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {issue.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
            <div className="max-h-[120px] overflow-y-auto space-y-2 pr-1">
              {section.strengths.map((strength, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg border bg-green-500/10 border-green-500/20 text-sm"
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-xs">{strength}</p>
                  </div>
                </div>
              ))}
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
