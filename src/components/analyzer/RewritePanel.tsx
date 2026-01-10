import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Loader2, 
  Copy, 
  Check,
  ArrowRight,
  FileText,
  X,
  RefreshCw
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
}

interface RewrittenSection {
  id: string;
  original: string;
  rewritten: string;
  improvements: string[];
}

export function RewritePanel({ 
  content, 
  analysisResult, 
  voiceAnalysis, 
  brandPlatform,
  onClose 
}: RewritePanelProps) {
  const { toast } = useToast();
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenSections, setRewrittenSections] = useState<RewrittenSection[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const handleRewriteAll = async () => {
    setIsRewriting(true);
    setRewrittenSections([]);

    try {
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

      setRewrittenSections(data.rewrittenSections || []);
      
      toast({
        title: 'Content Rewritten',
        description: `Generated brand-aligned versions for ${data.rewrittenSections?.length || 0} sections.`,
      });
    } catch (error: any) {
      console.error('Rewrite error:', error);
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[hsl(270_70%_55%)]" />
              AI Brand Rewrite
            </CardTitle>
            <CardDescription>
              Transform content to align with your brand voice and guidelines
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rewrittenSections.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-[hsl(270_70%_55%)]" />
            <h3 className="font-medium mb-2">Ready to Rewrite</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Transform your content to better align with your Content DNA and brand platform.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleRewriteAll}
                disabled={isRewriting}
                className="bg-[hsl(270_70%_55%)] hover:bg-[hsl(270_70%_50%)]"
              >
                {isRewriting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Rewriting All Sections...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Rewrite All Sections
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Or rewrite individual sections below
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-green-600 border-green-500/30">
                {rewrittenSections.length} sections rewritten
              </Badge>
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
                  <RefreshCw className={cn("w-4 h-4 mr-2", isRewriting && "animate-spin")} />
                  Regenerate
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-4 pr-4">
                {analysisResult.sections.map((section) => {
                  const rewritten = rewrittenSections.find(r => r.id === section.id);
                  const isLoading = selectedSectionId === section.id;

                  return (
                    <Card key={section.id} className="border-muted">
                      <CardHeader className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {section.title}
                          </CardTitle>
                          {!rewritten && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRewriteSection(section.id)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Rewrite
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="py-3 px-4">
                        {rewritten ? (
                          <Tabs defaultValue="comparison" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-3">
                              <TabsTrigger value="comparison" className="text-xs">
                                Side by Side
                              </TabsTrigger>
                              <TabsTrigger value="improved" className="text-xs">
                                Improved Only
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="comparison" className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg border bg-red-500/5 border-red-500/20">
                                  <div className="text-xs font-medium text-red-600 mb-2">Original</div>
                                  <p className="text-xs text-muted-foreground line-clamp-4">
                                    {section.content.slice(0, 200)}...
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg border bg-green-500/5 border-green-500/20">
                                  <div className="text-xs font-medium text-green-600 mb-2 flex items-center justify-between">
                                    Improved
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2"
                                      onClick={() => handleCopy(rewritten.rewritten, section.id)}
                                    >
                                      {copiedId === section.id ? (
                                        <Check className="w-3 h-3" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </Button>
                                  </div>
                                  <p className="text-xs line-clamp-4">
                                    {rewritten.rewritten.slice(0, 200)}...
                                  </p>
                                </div>
                              </div>
                              {rewritten.improvements.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {rewritten.improvements.slice(0, 3).map((imp, i) => (
                                    <Badge key={i} variant="secondary" className="text-[10px]">
                                      {imp}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </TabsContent>
                            <TabsContent value="improved">
                              <div className="p-3 rounded-lg border bg-green-500/5 border-green-500/20">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-xs font-medium text-green-600">Brand-Aligned Version</div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2"
                                    onClick={() => handleCopy(rewritten.rewritten, section.id)}
                                  >
                                    {copiedId === section.id ? (
                                      <Check className="w-3 h-3" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </Button>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">
                                  {rewritten.rewritten}
                                </p>
                              </div>
                            </TabsContent>
                          </Tabs>
                        ) : (
                          <div className="p-3 rounded-lg border bg-muted/30">
                            <p className="text-xs text-muted-foreground line-clamp-3">
                              {section.content.slice(0, 150)}...
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}
