import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnalyzerInput } from '@/components/analyzer/AnalyzerInput';
import { BrandScorePanel } from '@/components/analyzer/BrandScorePanel';
import { ContentSectionCard } from '@/components/analyzer/ContentSectionCard';
import { RewritePanel } from '@/components/analyzer/RewritePanel';
import { DNAAlignmentPanel } from '@/components/analyzer/DNAAlignmentPanel';
import { ScreenshotPreview } from '@/components/analyzer/ScreenshotPreview';
import { VoiceProfileCard } from '@/components/analyzer/VoiceProfileCard';
import { IssuesSummaryCard } from '@/components/analyzer/IssuesSummaryCard';
import { AnalysisActionsCard } from '@/components/analyzer/AnalysisActionsCard';
import { useContentDNA } from '@/hooks/useContentDNA';
import { useInstitutionalProfiles } from '@/hooks/useInstitutionalProfiles';
import { useFactBook } from '@/hooks/useFactBook';
import { useStoryBank } from '@/hooks/useStoryBank';
import { supabase } from '@/integrations/supabase/client';
import { firecrawlApi } from '@/lib/api/firecrawl';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Loader2, 
  Sparkles, 
  ArrowLeft,
  AlertTriangle,
  FileText,
  Dna,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

interface AnalysisResult {
  overallScore: number;
  executiveSummary?: string;
  dnaAlignment?: DNAAlignment;
  brandVoiceCheck?: BrandVoiceCheck;
  sections: {
    id: string;
    title: string;
    content: string;
    score: number;
    issues: { type: string; message: string; severity: 'error' | 'warning' | 'info'; quotedText?: string; recommendation?: string; dnaReference?: string }[];
    strengths: { type?: string; message: string; quotedText?: string; dnaReference?: string }[] | string[];
  }[];
  summary: {
    totalIssues: number;
    totalStrengths: number;
    topIssues?: string[];
    topStrengths?: string[];
    criticalIssues?: string[];
    quickWins?: string[];
    missingFacts?: string[];
    storyOpportunities?: string[];
  };
}

export default function WebContentAnalyzerPage() {
  const { toast } = useToast();
  const { profiles } = useInstitutionalProfiles();
  
  // Profile selection state
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  // Use Content DNA for the selected profile
  const { analysis: contentDNA, isLoading: dnaLoading } = useContentDNA({ profileId: selectedProfileId });
  const { facts } = useFactBook({ profileId: selectedProfileId });
  const { stories } = useStoryBank({ profileId: selectedProfileId });
  const selectedProfile = profiles?.find(p => p.id === selectedProfileId) || profiles?.[0];
  
  // Set initial profile when profiles load
  useEffect(() => {
    if (profiles?.length && !selectedProfileId) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles, selectedProfileId]);
  
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [showRewrite, setShowRewrite] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(true);

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
    setScreenshot(null);

    try {
      // Fetch screenshot in parallel if URL provided
      if (url) {
        setScreenshotLoading(true);
        firecrawlApi.scrape(url, { formats: ['screenshot'] })
          .then(res => {
            console.log('Screenshot response:', res);
            // Handle nested data structure from Firecrawl API
            const screenshotData = res.data?.screenshot;
            if (res.success && screenshotData) {
              // Ensure proper data URL format
              const imageData = screenshotData.startsWith('data:') 
                ? screenshotData 
                : `data:image/png;base64,${screenshotData}`;
              setScreenshot(imageData);
            }
          })
          .catch(err => console.log('Screenshot capture skipped:', err))
          .finally(() => setScreenshotLoading(false));
      }

      const { data, error } = await supabase.functions.invoke('analyze-web-content', {
        body: {
          content: inputContent,
          sourceUrl: url,
          voiceAnalysis: contentDNA.voice_analysis,
          brandPlatform: contentDNA.brand_platform,
          profileConfig: selectedProfile?.config,
          facts: facts?.slice(0, 20),
          stories: stories?.slice(0, 10),
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

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setContent('');
    setSourceUrl('');
    setShowRewrite(false);
    setScreenshot(null);
  };

  const handleRewrite = () => {
    setShowRewrite(true);
  };

  const selectedSection = analysisResult?.sections.find(s => s.id === selectedSectionId);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[hsl(200_100%_45%)] to-[hsl(220_90%_50%)] text-white">
                <Search className="w-6 h-6" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground">
                Web Content Analyzer
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Check how well your web content aligns with your brand voice. Import a URL, 
              and we'll score it against your Content DNA—then help you rewrite any sections that need improvement.
            </p>
          </div>

          {/* How It Works - Horizontal, Closeable */}
          {showHowItWorks && !analysisResult && (
            <Card className="mb-6 border-dashed border-primary/30 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground">How It Works</span>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center gap-8">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">1</div>
                      <div>
                        <p className="text-sm font-medium">Import Content</p>
                        <p className="text-xs text-muted-foreground">Fetch from URL</p>
                      </div>
                    </div>
                    <div className="h-px w-8 bg-border" />
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">2</div>
                      <div>
                        <p className="text-sm font-medium">AI Analysis</p>
                        <p className="text-xs text-muted-foreground">Score vs Content DNA</p>
                      </div>
                    </div>
                    <div className="h-px w-8 bg-border" />
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">3</div>
                      <div>
                        <p className="text-sm font-medium">Improve</p>
                        <p className="text-xs text-muted-foreground">AI Rewrite for brand</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 shrink-0"
                    onClick={() => setShowHowItWorks(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Section Selector (always visible) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Section Selector */}
              <AnalyzerInput 
                onAnalyze={handleAnalyze} 
                isAnalyzing={isAnalyzing}
                disabled={!contentDNA?.voice_analysis}
              />

              {/* Analysis Results */}
              {analysisResult && (
                <div className="space-y-6">
                  {/* Results Header with Score */}
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
                        <div className="text-center">
                          <div className={`text-4xl font-bold ${
                            analysisResult.overallScore >= 80 ? 'text-green-500' :
                            analysisResult.overallScore >= 60 ? 'text-amber-500' :
                            'text-red-500'
                          }`}>
                            {analysisResult.overallScore}
                          </div>
                          <div className="text-xs text-muted-foreground">Overall Score</div>
                        </div>
                      </div>
                    </CardHeader>
                    {analysisResult.executiveSummary && (
                      <CardContent className="pt-0">
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-sm text-foreground">{analysisResult.executiveSummary}</p>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* DNA Alignment Panel */}
                  {analysisResult.dnaAlignment && (
                    <DNAAlignmentPanel
                      dnaAlignment={analysisResult.dnaAlignment}
                      brandVoiceCheck={analysisResult.brandVoiceCheck}
                      summary={{
                        quickWins: analysisResult.summary.quickWins,
                        missingFacts: analysisResult.summary.missingFacts,
                        storyOpportunities: analysisResult.summary.storyOpportunities,
                        criticalIssues: analysisResult.summary.criticalIssues,
                      }}
                    />
                  )}

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
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Dna className="w-5 h-5 text-primary" />
                          Content Sections
                        </CardTitle>
                        <CardDescription>
                          Click on a section to expand and see detailed analysis
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
                </div>
              )}
            </div>

            {/* Right Column - Controls & Details */}
            <div className="space-y-6">
              {/* Voice Profile Card */}
              <VoiceProfileCard
                selectedProfileId={selectedProfileId}
                onProfileChange={setSelectedProfileId}
                hasDNA={!!contentDNA?.last_analyzed_at}
              />

              {/* Loading State */}
              {isAnalyzing && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="font-medium">Analyzing content...</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Checking against your Content DNA
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Results-specific right column items */}
              {analysisResult && (
                <>
                  {/* Actions Card */}
                  <AnalysisActionsCard
                    onNewAnalysis={handleNewAnalysis}
                    onRewrite={handleRewrite}
                    showRewrite={showRewrite}
                  />

                  {/* Issues Summary Card */}
                  <IssuesSummaryCard
                    totalIssues={analysisResult.summary.totalIssues}
                    totalStrengths={analysisResult.summary.totalStrengths}
                    criticalIssues={analysisResult.summary.criticalIssues}
                    topStrengths={analysisResult.summary.topStrengths}
                  />

                  {/* Screenshot Preview */}
                  <ScreenshotPreview
                    screenshot={screenshot || undefined}
                    sourceUrl={sourceUrl}
                    isLoading={screenshotLoading}
                  />

                  {/* Selected Section Details */}
                  {selectedSection && !showRewrite && (
                    <BrandScorePanel
                      section={selectedSection}
                      voiceAnalysis={contentDNA?.voice_analysis}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
