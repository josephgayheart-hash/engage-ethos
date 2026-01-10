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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wand2 className="w-4 h-4 text-primary" />
              AI Brand Rewrite
            </CardTitle>
            <CardDescription className="text-xs">
              Transform content to align with your brand voice
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Processing State - Shows during rewrite */}
        {isRewriting && (
          <div className="p-4 rounded-lg border bg-primary/5 border-primary/20 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {phaseMessages[processingPhase]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {analysisResult.sections.length} sections to process
                </p>
              </div>
            </div>
            <Progress value={progress} className="h-1.5" />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Preparing</span>
              <span>Analyzing</span>
              <span>Rewriting</span>
              <span>Done</span>
            </div>
          </div>
        )}

        {/* Initial State - Before rewrite */}
        {!isRewriting && rewrittenSections.length === 0 && (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-sm font-medium mb-1">Ready to Rewrite</h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
              Transform your content to better align with your Content DNA and brand voice.
            </p>
            <Button
              onClick={handleRewriteAll}
              disabled={isRewriting}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Rewrite All Sections
            </Button>
          </div>
        )}

        {/* Results State - After rewrite */}
        {!isRewriting && rewrittenSections.length > 0 && (
          <>
            {/* Success header */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {rewrittenSections.length} sections rewritten
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleCopyAll}>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleRewriteAll}
                  disabled={isRewriting}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Regenerate
                </Button>
              </div>
            </div>

            {/* Rewritten sections list - no scroll constraint for full visibility */}
            <div className="space-y-3">
                {analysisResult.sections.map((section) => {
                  const rewritten = rewrittenSections.find(r => r.id === section.id);
                  const isLoading = selectedSectionId === section.id;
                  const isExpanded = expandedSections.has(section.id);

                  return (
                    <div 
                      key={section.id} 
                      className={cn(
                        "rounded-lg border transition-all",
                        rewritten ? "border-green-500/30 bg-green-500/5" : "border-muted bg-muted/30"
                      )}
                    >
                      {/* Section header */}
                      <div 
                        className="flex items-center justify-between p-3 cursor-pointer"
                        onClick={() => rewritten && toggleExpanded(section.id)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs font-medium truncate">{section.title}</span>
                          {rewritten && (
                            <Badge className="bg-green-500/20 text-green-700 text-[10px] px-1.5 py-0 h-4 shrink-0">
                              <Check className="w-2.5 h-2.5 mr-0.5" />
                              Done
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!rewritten && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRewriteSection(section.id);
                              }}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Rewrite
                                </>
                              )}
                            </Button>
                          )}
                          {rewritten && (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Expanded content */}
                      {rewritten && isExpanded && (
                        <div className="px-3 pb-3 space-y-3">
                          {/* Comparison view */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded border bg-red-500/5 border-red-500/20">
                              <div className="text-[10px] font-medium text-red-600 mb-1 flex items-center gap-1">
                                <X className="w-2.5 h-2.5" />
                                Original
                              </div>
                              <p className="text-[11px] text-muted-foreground line-clamp-4">
                                {section.content.slice(0, 300)}...
                              </p>
                            </div>
                            <div className="p-2 rounded border bg-green-500/5 border-green-500/20">
                              <div className="text-[10px] font-medium text-green-600 mb-1 flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5" />
                                  Improved
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(rewritten.rewritten, section.id);
                                  }}
                                >
                                  {copiedId === section.id ? (
                                    <Check className="w-2.5 h-2.5 text-green-600" />
                                  ) : (
                                    <Copy className="w-2.5 h-2.5" />
                                  )}
                                </Button>
                              </div>
                              <p className="text-[11px] line-clamp-4">
                                {rewritten.rewritten.slice(0, 300)}...
                              </p>
                            </div>
                          </div>

                          {/* Improvements made */}
                          {rewritten.improvements.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {rewritten.improvements.slice(0, 3).map((imp, i) => (
                                <Badge key={i} variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                                  {imp}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Full rewritten content */}
                          <div className="p-2 rounded border bg-background">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-medium text-muted-foreground">Full Brand-Aligned Version</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-5 text-[10px] px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(rewritten.rewritten, section.id);
                                }}
                              >
                                <Copy className="w-2.5 h-2.5 mr-1" />
                                Copy
                              </Button>
                            </div>
                            <p className="text-xs whitespace-pre-wrap text-foreground">
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
