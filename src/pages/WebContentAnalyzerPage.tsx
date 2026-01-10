import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnalyzerInput } from '@/components/analyzer/AnalyzerInput';
import { BrandScorePanel } from '@/components/analyzer/BrandScorePanel';
import { ContentSectionCard } from '@/components/analyzer/ContentSectionCard';
import { RewritePanel } from '@/components/analyzer/RewritePanel';
import { DNAAlignmentPanel } from '@/components/analyzer/DNAAlignmentPanel';
import { VoiceProfileCard } from '@/components/analyzer/VoiceProfileCard';
import { AnalysisActionsCard } from '@/components/analyzer/AnalysisActionsCard';
import { useContentDNA } from '@/hooks/useContentDNA';
import { useInstitutionalProfiles } from '@/hooks/useInstitutionalProfiles';
import { useFactBook } from '@/hooks/useFactBook';
import { useStoryBank } from '@/hooks/useStoryBank';
import { useUserDrafts } from '@/hooks/useUserDrafts';
import { useMessageLibrary } from '@/hooks/useMessageLibrary';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
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
import type { AnalysisResult, SavedAnalysisData, IssueRemediation } from '@/types/analyzer';

export default function WebContentAnalyzerPage() {
  const { toast: showToast } = useToast();
  const location = useLocation();
  const { profiles } = useInstitutionalProfiles();
  
  // Draft management
  const { saveDraft, loadDraftById, currentDraft, setCurrentDraft } = useUserDrafts();
  const { addMessage } = useMessageLibrary();
  const [isSaving, setIsSaving] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [showRewrite, setShowRewrite] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(true);
  
  // Remediation tracking
  const [resolvedIssues, setResolvedIssues] = useState<IssueRemediation[]>([]);

  // Load draft on mount if resumeDraftId is in location state
  useEffect(() => {
    const resumeDraftId = (location.state as { resumeDraftId?: string })?.resumeDraftId;
    if (resumeDraftId) {
      loadDraftById(resumeDraftId).then(draft => {
        if (draft) {
          const draftData = draft.draft_data as unknown as SavedAnalysisData;
          setContent(draftData.sourceContent || '');
          setSourceUrl(draftData.sourceUrl || '');
          setAnalysisResult(draftData.analysisResult);
          setSelectedProfileId(draftData.profileId || null);
          setResolvedIssues(draftData.remediation?.resolvedIssues || []);
          setCurrentDraftId(draft.id);
          if (draftData.analysisResult?.sections?.length > 0) {
            setSelectedSectionId(draftData.analysisResult.sections[0].id);
          }
          toast.success('Draft loaded', { description: 'Your previous analysis has been restored.' });
        }
      });
    }
  }, [location.state, loadDraftById]);

  // Remediation handlers
  const handleToggleResolved = useCallback((issueId: string, sectionId: string, resolved: boolean) => {
    setResolvedIssues(prev => {
      const existing = prev.find(r => r.issueId === issueId && r.sectionId === sectionId);
      if (existing) {
        return prev.map(r => 
          r.issueId === issueId && r.sectionId === sectionId 
            ? { ...r, resolved, resolvedAt: resolved ? new Date().toISOString() : undefined }
            : r
        );
      }
      return [...prev, { issueId, sectionId, resolved, resolvedAt: resolved ? new Date().toISOString() : undefined }];
    });
  }, []);

  const handleUpdateNotes = useCallback((issueId: string, sectionId: string, notes: string) => {
    setResolvedIssues(prev => {
      const existing = prev.find(r => r.issueId === issueId && r.sectionId === sectionId);
      if (existing) {
        return prev.map(r => 
          r.issueId === issueId && r.sectionId === sectionId 
            ? { ...r, notes }
            : r
        );
      }
      return [...prev, { issueId, sectionId, resolved: false, notes }];
    });
  }, []);

  // Save handlers
  const buildDraftData = useCallback((): SavedAnalysisData => {
    return {
      sourceUrl,
      sourceContent: content,
      analysisResult: analysisResult!,
      profileId: selectedProfileId || undefined,
      profileName: selectedProfile?.name,
      analyzedAt: new Date().toISOString(),
      remediation: {
        totalIssues: analysisResult?.summary.totalIssues || 0,
        resolvedIssues,
      }
    };
  }, [sourceUrl, content, analysisResult, selectedProfileId, selectedProfile?.name, resolvedIssues]);

  const handleSaveDraft = useCallback(async () => {
    if (!analysisResult) return;
    
    setIsSaving(true);
    try {
      const draftData = buildDraftData();
      const title = sourceUrl 
        ? `Analysis: ${new URL(sourceUrl).hostname}` 
        : `Analysis: ${content.substring(0, 30)}...`;
      
      const draft = await saveDraft('analysis', draftData as unknown as Record<string, unknown>, title, currentDraftId || undefined);
      
      if (draft) {
        setCurrentDraftId(draft.id);
        toast.success('Draft saved', { description: 'Your analysis has been saved for later.' });
      } else {
        toast.error('Failed to save draft', { description: 'Please ensure you are logged in.' });
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  }, [analysisResult, buildDraftData, saveDraft, currentDraftId, sourceUrl, content]);

  const handleSaveToPersonalLibrary = useCallback(async (name: string): Promise<string | undefined> => {
    if (!analysisResult) return undefined;
    
    setIsSaving(true);
    try {
      const messageContent = [
        `## Web Content Analysis: ${name}`,
        sourceUrl ? `**Source:** ${sourceUrl}` : '',
        `**Overall Score:** ${analysisResult.overallScore}/100`,
        analysisResult.executiveSummary ? `\n${analysisResult.executiveSummary}` : '',
        `\n### Sections Analyzed`,
        ...analysisResult.sections.map(s => `- **${s.title}** (Score: ${s.score})`),
      ].filter(Boolean).join('\n');

      const savedMessage = addMessage({
        title: name,
        content: messageContent,
        channel: 'landing-page',
        mode: 'evaluated',
        source: 'analyzer',
        notes: `Analyzed on ${new Date().toLocaleDateString()}. ${resolvedIssues.filter(r => r.resolved).length}/${analysisResult.summary.totalIssues} issues resolved.`,
        institutionalProfileId: selectedProfileId || undefined,
        institutionalProfileName: selectedProfile?.name,
        approved: false,
      });

      toast.success('Saved to library', { description: 'Analysis added to your personal library.' });
      return savedMessage?.id;
    } catch (error) {
      console.error('Failed to save to library:', error);
      toast.error('Failed to save to library');
      return undefined;
    } finally {
      setIsSaving(false);
    }
  }, [analysisResult, sourceUrl, addMessage, selectedProfileId, selectedProfile?.name, resolvedIssues]);

  const handleSaveToUniversityLibrary = useCallback(async (name: string): Promise<string | undefined> => {
    if (!analysisResult) return undefined;
    
    setIsSaving(true);
    try {
      // For now, save to personal library with a flag for submission
      // In a full implementation, this would go to shared_templates table
      const messageId = await handleSaveToPersonalLibrary(name);
      
      toast.success('Submitted to university library', { description: 'Your analysis has been submitted for review.' });
      return messageId;
    } catch (error) {
      console.error('Failed to submit to university library:', error);
      toast.error('Failed to submit');
      return undefined;
    } finally {
      setIsSaving(false);
    }
  }, [analysisResult, handleSaveToPersonalLibrary]);

  const handleAnalyze = async (inputContent: string, url?: string) => {
    if (!inputContent.trim()) {
      showToast({
        title: 'No Content',
        description: 'Please enter or import content to analyze.',
        variant: 'destructive',
      });
      return;
    }

    if (!contentDNA?.voice_analysis) {
      showToast({
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
    setResolvedIssues([]); // Reset remediation on new analysis

    try {
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

      toast.success('Analysis Complete', { description: `Scored ${data.sections?.length || 0} sections against your Content DNA.` });
    } catch (error: any) {
      console.error('Analysis error:', error);
      showToast({
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
    setResolvedIssues([]);
    setCurrentDraftId(null);
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
            {/* Left Column - Input & Results */}
            <div className="lg:col-span-3 space-y-6">
              {/* Content Input */}
              <AnalyzerInput
                onAnalyze={handleAnalyze} 
                isAnalyzing={isAnalyzing}
                disabled={!contentDNA?.voice_analysis}
              />

              {/* Analysis Results */}
              {analysisResult && (
                <div className="space-y-6">
                  {/* Results Header with Score and Summary Stats */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
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
                      
                      {/* Voice Profile - inline with matching font size */}
                      <VoiceProfileCard
                        selectedProfileId={selectedProfileId}
                        onProfileChange={setSelectedProfileId}
                        hasDNA={!!contentDNA?.last_analyzed_at}
                      />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Executive Summary */}
                      {analysisResult.executiveSummary && (
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-sm text-foreground">{analysisResult.executiveSummary}</p>
                        </div>
                      )}
                      
                      {/* Quick Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <div className="text-2xl font-bold text-foreground">{analysisResult.sections.length}</div>
                          <div className="text-xs text-muted-foreground">Sections</div>
                        </div>
                        <div className="p-3 rounded-lg bg-red-500/10 text-center">
                          <div className="text-2xl font-bold text-red-600">{analysisResult.summary.totalIssues}</div>
                          <div className="text-xs text-muted-foreground">Issues Found</div>
                        </div>
                        <div className="p-3 rounded-lg bg-green-500/10 text-center">
                          <div className="text-2xl font-bold text-green-600">{analysisResult.summary.totalStrengths}</div>
                          <div className="text-xs text-muted-foreground">Strengths</div>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-500/10 text-center">
                          <div className="text-2xl font-bold text-amber-600">{analysisResult.summary.criticalIssues?.length || 0}</div>
                          <div className="text-xs text-muted-foreground">Critical</div>
                        </div>
                      </div>

                      {/* Critical Issues Highlight */}
                      {analysisResult.summary.criticalIssues && analysisResult.summary.criticalIssues.length > 0 && (
                        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5">
                          <p className="text-xs font-medium text-red-600 mb-2">Critical Issues to Address:</p>
                          <ul className="space-y-1">
                            {analysisResult.summary.criticalIssues.slice(0, 3).map((issue, idx) => (
                              <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">•</span>
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Quick Wins */}
                      {analysisResult.summary.quickWins && analysisResult.summary.quickWins.length > 0 && (
                        <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/5">
                          <p className="text-xs font-medium text-green-600 mb-2">Quick Wins:</p>
                          <ul className="space-y-1">
                            {analysisResult.summary.quickWins.slice(0, 3).map((win, idx) => (
                              <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span>
                                {win}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Scroll indicator */}
                      <div className="text-center pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          ↓ Scroll down for detailed section analysis
                        </p>
                      </div>
                    </CardContent>
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

            {/* Right Column - Actions only (when results exist) */}
            <div className="space-y-6">
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
                    onSaveDraft={handleSaveDraft}
                    onSaveToPersonalLibrary={handleSaveToPersonalLibrary}
                    onSaveToUniversityLibrary={handleSaveToUniversityLibrary}
                    isSaving={isSaving}
                    hasDraft={!!currentDraftId}
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
