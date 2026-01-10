import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { 
  Dna,
  Mic2,
  BarChart3,
  BookOpen,
  Target,
  ChevronDown,
  ChevronRight,
  Quote,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';

interface DNAAlignment {
  voiceScore: number;
  voiceFeedback: string;
  factScore: number;
  factFeedback: string;
  storyScore: number;
  storyFeedback: string;
  brandScore: number;
  brandFeedback: string;
}

interface BrandVoiceCheck {
  phrasesUsedCorrectly?: string[];
  phrasesAvoidedIncorrectly?: string[];
  missingKeyPhrases?: string[];
}

interface Summary {
  criticalIssues?: string[];
  quickWins?: string[];
  missingFacts?: string[];
  storyOpportunities?: string[];
}

interface DNAAlignmentPanelProps {
  dnaAlignment?: DNAAlignment;
  brandVoiceCheck?: BrandVoiceCheck;
  summary?: Summary;
  executiveSummary?: string;
}

export function DNAAlignmentPanel({ 
  dnaAlignment, 
  brandVoiceCheck,
  summary,
  executiveSummary 
}: DNAAlignmentPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['voice']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (!dnaAlignment) {
    return null;
  }

  const alignmentItems = [
    { 
      key: 'voice', 
      label: 'Voice & Tone', 
      icon: Mic2, 
      score: dnaAlignment.voiceScore, 
      feedback: dnaAlignment.voiceFeedback,
      color: 'text-purple-500'
    },
    { 
      key: 'brand', 
      label: 'Brand Platform', 
      icon: Target, 
      score: dnaAlignment.brandScore, 
      feedback: dnaAlignment.brandFeedback,
      color: 'text-blue-500'
    },
    { 
      key: 'facts', 
      label: 'Fact Integration', 
      icon: BarChart3, 
      score: dnaAlignment.factScore, 
      feedback: dnaAlignment.factFeedback,
      color: 'text-orange-500'
    },
    { 
      key: 'stories', 
      label: 'Story Alignment', 
      icon: BookOpen, 
      score: dnaAlignment.storyScore, 
      feedback: dnaAlignment.storyFeedback,
      color: 'text-pink-500'
    },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Dna className="w-5 h-5 text-primary" />
          Content DNA Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Executive Summary */}
        {executiveSummary && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-foreground leading-relaxed">{executiveSummary}</p>
          </div>
        )}

        {/* DNA Alignment Scores */}
        <div className="space-y-2">
          {alignmentItems.map(item => {
            const Icon = item.icon;
            const isExpanded = expandedSections.has(item.key);

            return (
              <Collapsible 
                key={item.key} 
                open={isExpanded}
                onOpenChange={() => toggleSection(item.key)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Icon className={cn("w-4 h-4", item.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className={cn("text-sm font-bold", getScoreColor(item.score))}>
                          {item.score}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all", getProgressColor(item.score))}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-7 mt-1 p-2 text-xs text-muted-foreground bg-muted/30 rounded-lg">
                    {item.feedback}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        <Separator />

        {/* Brand Voice Check */}
        {brandVoiceCheck && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Quote className="w-4 h-4 text-primary" />
              Brand Language Check
            </h4>

            {/* Phrases used correctly */}
            {brandVoiceCheck.phrasesUsedCorrectly && brandVoiceCheck.phrasesUsedCorrectly.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Key phrases found
                </p>
                <div className="flex flex-wrap gap-1">
                  {brandVoiceCheck.phrasesUsedCorrectly.slice(0, 5).map((phrase, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] bg-green-500/10 border-green-500/30 text-green-600">
                      "{phrase}"
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Phrases to avoid that were found */}
            {brandVoiceCheck.phrasesAvoidedIncorrectly && brandVoiceCheck.phrasesAvoidedIncorrectly.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  Avoided phrases found
                </p>
                <div className="flex flex-wrap gap-1">
                  {brandVoiceCheck.phrasesAvoidedIncorrectly.slice(0, 5).map((phrase, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] bg-red-500/10 border-red-500/30 text-red-600">
                      "{phrase}"
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing key phrases */}
            {brandVoiceCheck.missingKeyPhrases && brandVoiceCheck.missingKeyPhrases.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-amber-500" />
                  Consider adding
                </p>
                <div className="flex flex-wrap gap-1">
                  {brandVoiceCheck.missingKeyPhrases.slice(0, 5).map((phrase, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-600">
                      "{phrase}"
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Wins & Opportunities */}
        {summary && (summary.quickWins?.length || summary.missingFacts?.length || summary.storyOpportunities?.length) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Opportunities
              </h4>
              
              <ScrollArea className="max-h-[150px]">
                <div className="space-y-2 pr-2">
                  {summary.quickWins?.slice(0, 3).map((win, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-green-500/5 border border-green-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                      <p className="text-xs">{win}</p>
                    </div>
                  ))}
                  {summary.missingFacts?.slice(0, 2).map((fact, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-orange-500/5 border border-orange-500/20">
                      <BarChart3 className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                      <p className="text-xs">{fact}</p>
                    </div>
                  ))}
                  {summary.storyOpportunities?.slice(0, 2).map((story, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-pink-500/5 border border-pink-500/20">
                      <BookOpen className="w-3.5 h-3.5 text-pink-500 mt-0.5 shrink-0" />
                      <p className="text-xs">{story}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
