import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyzerInput } from '@/components/analyzer/AnalyzerInput';
import { BrandScorePanel } from '@/components/analyzer/BrandScorePanel';
import { ContentSectionCard } from '@/components/analyzer/ContentSectionCard';
import { RewritePanel } from '@/components/analyzer/RewritePanel';
import { useContentDNA } from '@/hooks/useContentDNA';
import { useInstitutionalProfiles } from '@/hooks/useInstitutionalProfiles';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Loader2, 
  Sparkles, 
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AnalysisResult {
  overallScore: number;
  sections: {
    id: string;
    title: string;
    content: string;
    score: number;
    issues: { type: string; message: string; severity: 'error' | 'warning' | 'info' }[];
    strengths: string[];
  }[];
  summary: {
    totalIssues: number;
    totalStrengths: number;
    topIssues: string[];
    topStrengths: string[];
  };
}

export default function WebContentAnalyzerPage() {
  const { toast } = useToast();
  const { analysis: contentDNA, isLoading: dnaLoading } = useContentDNA();
  const { profiles } = useInstitutionalProfiles();
  const selectedProfile = profiles?.[0];
  
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [showRewrite, setShowRewrite] = useState(false);

  const handleAnalyze = async (inputContent: string, url?: string) => {
    if (!inputContent.trim()) {
      toast({
        title: 'No Content',
        description: 'Please enter or import content to analyze.',
        variant: 'destructive',
      });
      return;
    }

    if (!contentDNA?.voice_analysis) {
      toast({
        title: 'Content DNA Required',
        description: 'Please set up your Content DNA before analyzing content.',
        variant: 'destructive',
      });
      return;
    }

    setContent(inputContent);
    if (url) setSourceUrl(url);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setShowRewrite(false);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-web-content', {
        body: {
          content: inputContent,
          sourceUrl: url,
          voiceAnalysis: contentDNA.voice_analysis,
          brandPlatform: contentDNA.brand_platform,
          profileConfig: selectedProfile?.config,
        },
      });

      if (error) throw error;

      setAnalysisResult(data);
      
      if (data.sections?.length > 0) {
        setSelectedSectionId(data.sections[0].id);
      }

      toast({
        title: 'Analysis Complete',
        description: `Scored ${data.sections?.length || 0} sections against your Content DNA.`,
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze content.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRewrite = () => {
    setShowRewrite(true);
  };

  const selectedSection = analysisResult?.sections.find(s => s.id === selectedSectionId);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
                  <Search className="w-6 h-6 text-[hsl(200_100%_45%)]" />
                  Web Content Analyzer
                </h1>
                <p className="text-sm text-muted-foreground">
                  Analyze any web content against your Content DNA and brand guidelines
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {contentDNA?.last_analyzed_at && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Content DNA Active
                </Badge>
              )}
            </div>
          </div>

          {/* DNA Status Warning */}
          {!dnaLoading && !contentDNA?.voice_analysis && (
            <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Content DNA Not Configured</p>
                    <p className="text-sm text-muted-foreground">
                      Set up your Content DNA to enable brand adherence analysis.
                    </p>
                  </div>
                  <Link to="/content-dna">
                    <Button variant="outline" size="sm">
                      Configure DNA
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Input or Results */}
            <div className="lg:col-span-2 space-y-6">
              {!analysisResult ? (
                <AnalyzerInput 
                  onAnalyze={handleAnalyze} 
                  isAnalyzing={isAnalyzing}
                  disabled={!contentDNA?.voice_analysis}
                />
              ) : (
                <>
                  {/* Results Header */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Analysis Results
                          </CardTitle>
                          {sourceUrl && (
                            <CardDescription className="text-xs mt-1 truncate max-w-md">
                              Source: {sourceUrl}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAnalysisResult(null);
                              setContent('');
                              setSourceUrl('');
                              setShowRewrite(false);
                            }}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            New Analysis
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleRewrite}
                            disabled={showRewrite}
                            className="bg-[hsl(270_70%_55%)] hover:bg-[hsl(270_70%_50%)]"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Rewrite for Brand
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${
                            analysisResult.overallScore >= 80 ? 'text-green-500' :
                            analysisResult.overallScore >= 60 ? 'text-amber-500' :
                            'text-red-500'
                          }`}>
                            {analysisResult.overallScore}
                          </div>
                          <div className="text-xs text-muted-foreground">Overall Score</div>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span className="text-sm">
                              <span className="font-medium">{analysisResult.summary.totalIssues}</span> issues found
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-sm">
                              <span className="font-medium">{analysisResult.summary.totalStrengths}</span> strengths
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sections or Rewrite */}
                  {showRewrite ? (
                    <RewritePanel
                      content={content}
                      analysisResult={analysisResult}
                      voiceAnalysis={contentDNA?.voice_analysis}
                      brandPlatform={contentDNA?.brand_platform}
                      onClose={() => setShowRewrite(false)}
                    />
                  ) : (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Content Sections</CardTitle>
                        <CardDescription>
                          Click on a section to see detailed analysis
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {analysisResult.sections.map((section) => (
                          <ContentSectionCard
                            key={section.id}
                            section={section}
                            isSelected={section.id === selectedSectionId}
                            onClick={() => setSelectedSectionId(section.id)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>

            {/* Right Panel - Score Details */}
            <div className="space-y-6">
              {isAnalyzing ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="font-medium">Analyzing content...</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Checking against your Content DNA
                    </p>
                  </CardContent>
                </Card>
              ) : analysisResult && selectedSection ? (
                <BrandScorePanel
                  section={selectedSection}
                  voiceAnalysis={contentDNA?.voice_analysis}
                />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Search className="w-8 h-8 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      Enter content to analyze against your Content DNA
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
