import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Loader2, 
  Copy, 
  Check,
  FileText,
  X,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Wand2,
  ArrowRight
} from 'lucide-react';

interface AnalysisResult {
  overallScore: number;
  sections: {
    id: string;
    title: string;
    content: string;
    score: number;
    issues: { type: string; message: string; severity: 'error' | 'warning' | 'info'; quotedText?: string; recommendation?: string; dnaReference?: string }[];
    strengths: ({ type?: string; message: string; quotedText?: string; dnaReference?: string } | string)[];
  }[];
  summary: {
    totalIssues: number;
    totalStrengths: number;
    topIssues?: string[];
    topStrengths?: string[];
  };
}

interface RewritePanelProps {
  content: string;
  analysisResult: AnalysisResult;
  voiceAnalysis?: any;
  brandPlatform?: any;
  onClose: () => void;
  onRewriteStateChange?: (isRewriting: boolean) => void;
  autoStart?: boolean;
}

interface RewrittenSection {
  id: string;
  original: string;
  rewritten: string;
  improvements: string[];
}

type ProcessingPhase = 'idle' | 'preparing' | 'analyzing' | 'rewriting' | 'finalizing' | 'complete';

const phaseMessages: Record<ProcessingPhase, string> = {
  idle: 'Ready to rewrite',
  preparing: 'Preparing content sections...',
  analyzing: 'Analyzing brand voice requirements...',
  rewriting: 'Generating brand-aligned versions...',
  finalizing: 'Polishing final output...',
  complete: 'Rewrite complete!'
};

export function RewritePanel({ 
  content, 
  analysisResult, 
  voiceAnalysis, 
  brandPlatform,
  onClose,
  onRewriteStateChange,
  autoStart = true
}: RewritePanelProps) {
  const { toast } = useToast();
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenSections, setRewrittenSections] = useState<RewrittenSection[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [processingPhase, setProcessingPhase] = useState<ProcessingPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  // Notify parent of rewriting state changes
  useEffect(() => {
    onRewriteStateChange?.(isRewriting);
  }, [isRewriting, onRewriteStateChange]);

  // Auto-start rewrite when panel opens
  useEffect(() => {
    if (autoStart && !hasAutoStarted && rewrittenSections.length === 0 && !isRewriting) {
      setHasAutoStarted(true);
      // Small delay to let the panel render first
      setTimeout(() => {
        handleRewriteAll();
      }, 300);
    }
  }, [autoStart, hasAutoStarted, rewrittenSections.length, isRewriting]);

  // Animate progress during processing
  useEffect(() => {
    if (!isRewriting) {
      if (processingPhase === 'complete') {
        setProgress(100);
      }
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        // Progress based on phase
        const targetProgress = {
          preparing: 15,
          analyzing: 35,
          rewriting: 75,
          finalizing: 90,
          complete: 100
        }[processingPhase] || 0;
        
        if (prev < targetProgress) {
          return Math.min(prev + 2, targetProgress);
        }
        return prev;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRewriting, processingPhase]);

  const handleRewriteAll = async () => {
    setIsRewriting(true);
    setRewrittenSections([]);
    setProgress(0);
    setProcessingPhase('preparing');

    try {
      // Simulate phases for better UX
      await new Promise(r => setTimeout(r, 500));
      setProcessingPhase('analyzing');
      
      await new Promise(r => setTimeout(r, 500));
      setProcessingPhase('rewriting');

      const { data, error } = await supabase.functions.invoke('analyze-web-content', {
        body: {
          mode: 'rewrite',
          content,
          sections: analysisResult.sections,
          voiceAnalysis,
          brandPlatform,
        },
      });

      if (error) throw error;

      setProcessingPhase('finalizing');
      await new Promise(r => setTimeout(r, 300));

      setRewrittenSections(data.rewrittenSections || []);
      setProcessingPhase('complete');
      
      // Auto-expand first rewritten section
      if (data.rewrittenSections?.length > 0) {
        setExpandedSections(new Set([data.rewrittenSections[0].id]));
      }
      
      toast({
        title: 'Content Rewritten',
        description: `Generated brand-aligned versions for ${data.rewrittenSections?.length || 0} sections.`,
      });
    } catch (error: any) {
      console.error('Rewrite error:', error);
      setProcessingPhase('idle');
      toast({
        title: 'Rewrite Failed',
        description: error.message || 'Failed to rewrite content.',
        variant: 'destructive',
      });
    } finally {
      setIsRewriting(false);
    }
  };

  const handleRewriteSection = async (sectionId: string) => {
    const section = analysisResult.sections.find(s => s.id === sectionId);
    if (!section) return;

    setSelectedSectionId(sectionId);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-web-content', {
        body: {
          mode: 'rewrite-section',
          sectionContent: section.content,
          sectionTitle: section.title,
          issues: section.issues,
          voiceAnalysis,
          brandPlatform,
        },
      });

      if (error) throw error;

      setRewrittenSections(prev => {
        const existing = prev.find(r => r.id === sectionId);
        if (existing) {
          return prev.map(r => r.id === sectionId ? { ...data.rewrittenSection, id: sectionId } : r);
        }
        return [...prev, { ...data.rewrittenSection, id: sectionId }];
      });

      // Auto-expand the rewritten section
      setExpandedSections(prev => new Set([...prev, sectionId]));

      toast({
        title: 'Section Rewritten',
        description: 'Brand-aligned version generated.',
      });
    } catch (error: any) {
      toast({
        title: 'Rewrite Failed',
        description: error.message || 'Failed to rewrite section.',
        variant: 'destructive',
      });
    } finally {
      setSelectedSectionId(null);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: 'Copied',
      description: 'Content copied to clipboard.',
    });
  };

  const handleCopyAll = async () => {
    const allRewritten = rewrittenSections.map(s => s.rewritten).join('\n\n---\n\n');
    await navigator.clipboard.writeText(allRewritten);
    toast({
      title: 'Copied All',
      description: 'All rewritten content copied to clipboard.',
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Card className="border-[hsl(270_70%_55%)]/30 bg-gradient-to-br from-[hsl(270_70%_55%)]/5 to-transparent">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wand2 className="w-5 h-5 text-[hsl(270_70%_55%)]" />
              AI Brand Rewrite
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Transform content to align with your brand voice
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4 mr-1" />
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Processing State - Shows during rewrite */}
        {isRewriting && (
          <div className="p-5 rounded-xl border-2 bg-[hsl(270_70%_55%)]/5 border-[hsl(270_70%_55%)]/20 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[hsl(270_70%_55%)]/20 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[hsl(270_70%_55%)]" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-foreground">
                  {phaseMessages[processingPhase]}
                </p>
                <p className="text-sm text-muted-foreground">
                  Processing {analysisResult.sections.length} sections
                </p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>Preparing</span>
              <span>Analyzing</span>
              <span>Rewriting</span>
              <span>Complete</span>
            </div>
          </div>
        )}

        {/* Initial State - Before rewrite */}
        {!isRewriting && rewrittenSections.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[hsl(270_70%_55%)]/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-[hsl(270_70%_55%)]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ready to Rewrite</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              Transform your content to better align with your Content DNA and brand voice.
            </p>
            <Button
              onClick={handleRewriteAll}
              disabled={isRewriting}
              size="lg"
              className="bg-[hsl(270_70%_55%)] hover:bg-[hsl(270_70%_50%)]"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Rewrite All Sections
            </Button>
          </div>
        )}

        {/* Results State - After rewrite */}
        {!isRewriting && rewrittenSections.length > 0 && (
          <>
            {/* Success header */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-base font-semibold text-green-700">
                  {rewrittenSections.length} sections rewritten successfully
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyAll}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRewriteAll}
                  disabled={isRewriting}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </div>

            {/* Rewritten sections list */}
            <div className="space-y-4">
              {analysisResult.sections.map((section) => {
                const rewritten = rewrittenSections.find(r => r.id === section.id);
                const isLoading = selectedSectionId === section.id;
                const isExpanded = expandedSections.has(section.id);

                return (
                  <div 
                    key={section.id} 
                    className={cn(
                      "rounded-xl border-2 transition-all overflow-hidden",
                      rewritten ? "border-green-500/30 bg-white dark:bg-card" : "border-muted bg-muted/30"
                    )}
                  >
                    {/* Section header */}
                    <div 
                      className={cn(
                        "flex items-center justify-between p-4 cursor-pointer",
                        rewritten && "bg-green-500/5"
                      )}
                      onClick={() => rewritten && toggleExpanded(section.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                        <span className="text-base font-medium">{section.title}</span>
                        {rewritten && (
                          <Badge className="bg-green-500/20 text-green-700 text-xs px-2 py-0.5 shrink-0">
                            <Check className="w-3 h-3 mr-1" />
                            Done
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!rewritten && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRewriteSection(section.id);
                            }}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Rewrite
                              </>
                            )}
                          </Button>
                        )}
                        {rewritten && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expanded content */}
                    {rewritten && isExpanded && (
                      <div className="px-4 pb-5 space-y-4 border-t border-green-500/20">
                        {/* Side-by-side comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          {/* Original */}
                          <div className="p-4 rounded-lg border bg-red-50/50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20 overflow-hidden">
                            <div className="flex items-center gap-2 mb-3">
                              <X className="w-4 h-4 text-red-500" />
                              <span className="text-sm font-semibold text-red-600">Original</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed break-words overflow-wrap-anywhere">
                              {section.content.slice(0, 400)}{section.content.length > 400 ? "..." : ""}
                            </p>
                          </div>

                          {/* Improved */}
                          <div className="p-4 rounded-lg border bg-green-50/50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20 overflow-hidden">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-semibold text-green-600">Improved</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(rewritten.rewritten, section.id);
                                }}
                              >
                                {copiedId === section.id ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed break-words overflow-wrap-anywhere">
                              {rewritten.rewritten.slice(0, 400)}{rewritten.rewritten.length > 400 ? "..." : ""}
                            </p>
                          </div>
                        </div>

                        {/* Improvements made */}
                        {rewritten.improvements && rewritten.improvements.length > 0 && (
                          <div className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
                            <p className="text-sm font-semibold text-amber-700 dark:text-amber-500 mb-2">Changes Made:</p>
                            <ul className="space-y-1">
                              {rewritten.improvements.map((imp, i) => (
                                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                  <ArrowRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                  {imp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Full rewritten content */}
                        <div className="p-5 rounded-lg border-2 bg-white dark:bg-card border-green-500/30">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-foreground">Full Brand-Aligned Version</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(rewritten.rewritten, section.id);
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <p className="text-base leading-relaxed whitespace-pre-wrap text-foreground">
                            {rewritten.rewritten}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
