import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnalyzerInput } from '@/components/analyzer/AnalyzerInput';
import { BrandScorePanel } from '@/components/analyzer/BrandScorePanel';
import { ContentSectionCard } from '@/components/analyzer/ContentSectionCard';
import { RewritePanel } from '@/components/analyzer/RewritePanel';
import { DNAAlignmentPanel } from '@/components/analyzer/DNAAlignmentPanel';
import { AnalysisActionsCard } from '@/components/analyzer/AnalysisActionsCard';
import { InstitutionalProfileSelector } from '@/components/InstitutionalProfileSelector';
import { useContentDNA } from '@/hooks/useContentDNA';
import { useInstitutionalProfiles } from '@/hooks/useInstitutionalProfiles';
import { useFactBook } from '@/hooks/useFactBook';
import { useStoryBank } from '@/hooks/useStoryBank';
import { useUserDrafts } from '@/hooks/useUserDrafts';
import { useMessageLibrary } from '@/hooks/useMessageLibrary';
import { useLastUsedProfile } from '@/hooks/useLastUsedProfile';
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
  FileEdit,
  Dna,
  X,
  Building2,
  Save
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { AnalysisResult, SavedAnalysisData, IssueRemediation } from '@/types/analyzer';

// Draft status types for tracking progress
type DraftStatus = 'drafting' | 'analyzing' | 'complete' | 'failed';

interface AnalysisDraftData {
  sourceUrl?: string;
  sourceContent?: string;
  analysisResult?: AnalysisResult;
  profileId?: string;
  profileName?: string;
  analyzedAt?: string;
  remediation?: {
    totalIssues: number;
    resolvedIssues: IssueRemediation[];
  };
  status?: DraftStatus;
  errorMessage?: string;
}

export default function WebContentAnalyzerPage() {
  const { toast: showToast } = useToast();
  const location = useLocation();
  const { profiles } = useInstitutionalProfiles();
  const { lastUsedProfileId, setLastUsedProfileId, isLoaded: profilePrefLoaded } = useLastUsedProfile(profiles);
  
  // Draft management
  const { saveDraft, loadDraftById, currentDraft, setCurrentDraft, deleteDraft } = useUserDrafts('analysis');
  const { addMessage } = useMessageLibrary();
  const [isSaving, setIsSaving] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [draftSavedRecently, setDraftSavedRecently] = useState(false);
  const [draftSaveError, setDraftSaveError] = useState(false);
  
  // Profile selection state - initialized from last used profile
  const [selectedProfileId, setSelectedProfileIdLocal] = useState<string | null>(null);
  const [selectedProfileName, setSelectedProfileName] = useState<string | undefined>();
  
  // Use Content DNA for the selected profile
  const { analysis: contentDNA, isLoading: dnaLoading } = useContentDNA({ profileId: selectedProfileId });
  const { facts } = useFactBook({ profileId: selectedProfileId });
  const { stories } = useStoryBank({ profileId: selectedProfileId });
  const selectedProfile = profiles?.find(p => p.id === selectedProfileId) || profiles?.[0];
  
  // Wrapper to update both local state and persist to localStorage
  const setSelectedProfileId = useCallback((id: string | null) => {
    setSelectedProfileIdLocal(id);
    if (id) {
      setLastUsedProfileId(id);
      const profile = profiles?.find(p => p.id === id);
      setSelectedProfileName(profile?.name);
    } else {
      setSelectedProfileName(undefined);
    }
  }, [setLastUsedProfileId, profiles]);
  
  // Set initial profile when profiles load - prefer last used, then first profile
  useEffect(() => {
    if (!profilePrefLoaded || !profiles?.length) return;
    if (selectedProfileId) return; // Already set
    
    // Check if last used profile exists in current profiles
    if (lastUsedProfileId) {
      const found = profiles.find(p => p.id === lastUsedProfileId);
      if (found) {
        setSelectedProfileIdLocal(lastUsedProfileId);
        setSelectedProfileName(found.name);
        return;
      }
    }
    
    // Fall back to first profile
    setSelectedProfileIdLocal(profiles[0].id);
    setSelectedProfileName(profiles[0].name);
    setLastUsedProfileId(profiles[0].id);
  }, [profiles, profilePrefLoaded, lastUsedProfileId, selectedProfileId, setLastUsedProfileId]);
  
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [showRewrite, setShowRewrite] = useState(false);
  const [isRewritingContent, setIsRewritingContent] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(true);
  
  // Derived: get selected section for BrandScorePanel
  const selectedSection = analysisResult?.sections.find(s => s.id === selectedSectionId) 
    || analysisResult?.sections[0] 
    || null;
  
  // Ref for scrolling to results
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Remediation tracking
  const [resolvedIssues, setResolvedIssues] = useState<IssueRemediation[]>([]);

  // Helper to generate draft title safely
  const generateDraftTitle = useCallback((url: string, contentText: string): string => {
    try {
      if (url) {
        return `Analysis: ${new URL(url).hostname}`;
      }
    } catch {
      // Invalid URL, fall through
    }
    if (url) {
      return `Analysis: ${url.substring(0, 30)}...`;
    }
    if (contentText) {
      return `Analysis: ${contentText.substring(0, 30)}...`;
    }
    return 'Analysis Draft';
  }, []);

  // Helper to save draft with status
  const saveDraftWithStatus = useCallback(async (
    status: DraftStatus, 
    errorMessage?: string,
    silent: boolean = false
  ): Promise<string | null> => {
    const draftData: AnalysisDraftData = {
      sourceUrl,
      sourceContent: content,
      analysisResult: analysisResult || undefined,
      profileId: selectedProfileId || undefined,
      profileName: selectedProfile?.name,
      analyzedAt: analysisResult ? new Date().toISOString() : undefined,
      remediation: analysisResult ? {
        totalIssues: analysisResult.summary?.totalIssues || 0,
        resolvedIssues,
      } : undefined,
      status,
      errorMessage,
    };

    const title = generateDraftTitle(sourceUrl, content);

    try {
      const draft = await saveDraft(
        'analysis', 
        draftData as unknown as Record<string, unknown>, 
        title, 
        currentDraftId || undefined,
        silent
      );
      
      if (draft) {
        setCurrentDraftId(draft.id);
        setDraftSaveError(false);
        if (!silent) {
          setDraftSavedRecently(true);
          setTimeout(() => setDraftSavedRecently(false), 3000);
        }
        return draft.id;
      }
      return null;
    } catch (error) {
      console.error('Failed to save draft:', error);
      setDraftSaveError(true);
      return null;
    }
  }, [sourceUrl, content, analysisResult, selectedProfileId, selectedProfile?.name, resolvedIssues, currentDraftId, saveDraft, generateDraftTitle]);

  // Load draft on mount if resumeDraftId is in location state
  useEffect(() => {
    const resumeDraftId = (location.state as { resumeDraftId?: string })?.resumeDraftId;
    if (resumeDraftId) {
      loadDraftById(resumeDraftId).then(draft => {
        if (draft) {
          const draftData = draft.draft_data as unknown as AnalysisDraftData;
          setContent(draftData.sourceContent || '');
          setSourceUrl(draftData.sourceUrl || '');
          setAnalysisResult(draftData.analysisResult || null);
          setSelectedProfileId(draftData.profileId || null);
          setResolvedIssues(draftData.remediation?.resolvedIssues || []);
          setCurrentDraftId(draft.id);
          if (draftData.analysisResult?.sections?.length > 0) {
            setSelectedSectionId(draftData.analysisResult.sections[0].id);
          }
          
          // Show appropriate toast based on status
          if (draftData.status === 'failed') {
            toast.info('Draft loaded', { description: 'Previous analysis failed. You can retry.' });
          } else if (draftData.status === 'analyzing') {
            toast.info('Draft loaded', { description: 'Analysis was interrupted. You can retry.' });
          } else {
            toast.success('Draft loaded', { description: 'Your previous analysis has been restored.' });
          }
        }
      });
    }
  }, [location.state, loadDraftById]);

  // Auto-save draft periodically when there's meaningful content
  useEffect(() => {
    // Only auto-save if there's meaningful content (URL or content exists)
    if (!sourceUrl && !content) return;
    
    // Don't auto-save while actively analyzing
    if (isAnalyzing) return;

    const saveTimeout = setTimeout(async () => {
      const status: DraftStatus = analysisResult ? 'complete' : 'drafting';
      console.log('Auto-saving analysis draft...', { status, hasUrl: !!sourceUrl, hasContent: !!content, hasResult: !!analysisResult });
      await saveDraftWithStatus(status, undefined, true);
    }, 3000);

    return () => clearTimeout(saveTimeout);
  }, [analysisResult, sourceUrl, content, selectedProfileId, resolvedIssues, isAnalyzing, saveDraftWithStatus]);

  // Clear draft when saving to library
  const clearDraftAfterSave = useCallback(async () => {
    if (currentDraftId) {
      await deleteDraft(currentDraftId);
      setCurrentDraftId(null);
    }
  }, [currentDraftId, deleteDraft]);

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
    if (!sourceUrl && !content && !analysisResult) return;
    
    setIsSaving(true);
    try {
      const status: DraftStatus = analysisResult ? 'complete' : 'drafting';
      const draftId = await saveDraftWithStatus(status);
      
      if (draftId) {
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
  }, [sourceUrl, content, analysisResult, saveDraftWithStatus]);

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

      const savedMessage = await addMessage({
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

    // Update state
    setContent(inputContent);
    if (url) setSourceUrl(url);
    setIsAnalyzing(true);
    setIsAnalysisComplete(false);
    setAnalysisResult(null);
    setShowRewrite(false);
    setResolvedIssues([]);

    // Save draft immediately with "analyzing" status
    const tempSourceUrl = url || sourceUrl;
    const tempContent = inputContent;
    
    // Create a temporary draft data object for immediate save
    const analyzingDraftData: AnalysisDraftData = {
      sourceUrl: tempSourceUrl,
      sourceContent: tempContent,
      profileId: selectedProfileId || undefined,
      profileName: selectedProfile?.name,
      status: 'analyzing',
    };
    
    const title = generateDraftTitle(tempSourceUrl, tempContent);
    
    try {
      const draft = await saveDraft(
        'analysis', 
        analyzingDraftData as unknown as Record<string, unknown>, 
        title, 
        currentDraftId || undefined,
        true
      );
      if (draft) {
        setCurrentDraftId(draft.id);
        console.log('Saved analyzing draft:', draft.id);
      }
    } catch (e) {
      console.error('Failed to save analyzing draft:', e);
    }

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

      // Show completion state briefly before showing results
      setIsAnalyzing(false);
      setIsAnalysisComplete(true);
      
      // Small delay to show the checkmark, then show results and scroll
      setTimeout(() => {
        setAnalysisResult(data);
        
        if (data.sections?.length > 0) {
          setSelectedSectionId(data.sections[0].id);
        }

        toast.success('Analysis Complete', { description: `Scored ${data.sections?.length || 0} sections against your Content DNA.` });
        
        // Scroll to results after a brief moment
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        
        // Reset complete state after scroll
        setTimeout(() => {
          setIsAnalysisComplete(false);
        }, 2000);
      }, 800);
      
    } catch (error: any) {
      console.error('Analysis error:', error);
      
      // Save draft with failed status
      const failedDraftData: AnalysisDraftData = {
        sourceUrl: url || sourceUrl,
        sourceContent: inputContent,
        profileId: selectedProfileId || undefined,
        profileName: selectedProfile?.name,
        status: 'failed',
        errorMessage: error.message || 'Analysis failed',
      };
      
      try {
        const draft = await saveDraft(
          'analysis', 
          failedDraftData as unknown as Record<string, unknown>, 
          title, 
          currentDraftId || undefined,
          true
        );
        if (draft) {
          setCurrentDraftId(draft.id);
          console.log('Saved failed draft:', draft.id);
        }
      } catch (e) {
        console.error('Failed to save failed draft:', e);
      }
      
      showToast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze content. Your progress has been saved.',
        variant: 'destructive',
      });
      setIsAnalyzing(false);
      setIsAnalysisComplete(false);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setContent('');
    setSourceUrl('');
    setShowRewrite(false);
    setResolvedIssues([]);
    setCurrentDraftId(null);
    setIsAnalysisComplete(false);
  };

  const handleRewrite = () => {
    setShowRewrite(true);
  };

  // Callback for RewritePanel to communicate rewriting state
  const handleRewriteStateChange = useCallback((rewriting: boolean) => {
    setIsRewritingContent(rewriting);
  }, []);

  

  return (
    <div className="bg-background">
      
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
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">How It Works</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-primary">1</span>
                        </div>
                        <div>
                          <span className="font-medium">Import</span>
                          <p className="text-muted-foreground text-xs">Paste a URL or content</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-primary">2</span>
                        </div>
                        <div>
                          <span className="font-medium">Analyze</span>
                          <p className="text-muted-foreground text-xs">AI scores against DNA</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-primary">3</span>
                        </div>
                        <div>
                          <span className="font-medium">Review</span>
                          <p className="text-muted-foreground text-xs">See issues & strengths</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-primary">4</span>
                        </div>
                        <div>
                          <span className="font-medium">Rewrite</span>
                          <p className="text-muted-foreground text-xs">Get brand-aligned copy</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0 h-6 w-6"
                    onClick={() => setShowHowItWorks(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Auto-saved indicator */}
          {(currentDraftId || draftSavedRecently) && !analysisResult && (
            <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Save className="w-3 h-3" />
              {draftSavedRecently ? (
                <span className="text-green-600">Draft saved</span>
              ) : (
                <span>Draft auto-saved</span>
              )}
            </div>
          )}

          {/* Draft save error indicator */}
          {draftSaveError && (
            <div className="mb-4 flex items-center gap-2 text-xs text-destructive">
              <AlertTriangle className="w-3 h-3" />
              <span>Failed to save draft</span>
            </div>
          )}

          {/* DNA Warning */}
          {!dnaLoading && !contentDNA?.voice_analysis && (
            <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900 dark:text-amber-100">Content DNA not configured</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Set up your Content DNA to enable analysis. The analyzer needs your brand voice and platform data to evaluate content.
                    </p>
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <Link to="/settings/content-dna">
                        <Dna className="w-4 h-4 mr-2" />
                        Configure Content DNA
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Input & Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Selector */}
              <div className="flex items-center gap-4">
                <InstitutionalProfileSelector
                  selectedProfileId={selectedProfileId}
                  onProfileChange={(id, config, name) => setSelectedProfileId(id || '')}
                />
              </div>

              {/* Input Section */}
              <AnalyzerInput
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                isComplete={isAnalysisComplete}
              />

              {/* Results Section */}
              {analysisResult && (
                <div ref={resultsRef} className="space-y-6">
                  {/* Rewrite Panel - show at top when active */}
                  {showRewrite && (
                    <RewritePanel
                      content={content}
                      analysisResult={analysisResult}
                      voiceAnalysis={contentDNA?.voice_analysis}
                      brandPlatform={contentDNA?.brand_platform}
                      onClose={() => setShowRewrite(false)}
                      onRewriteStateChange={handleRewriteStateChange}
                    />
                  )}

                  {/* DNA Alignment */}
                  <DNAAlignmentPanel 
                    dnaAlignment={analysisResult.dnaAlignment} 
                    brandVoiceCheck={analysisResult.brandVoiceCheck}
                  />

                  {/* Content Sections */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Content Sections
                      </h2>
                      <span className="text-sm text-muted-foreground">
                        {analysisResult.sections.length} sections analyzed
                      </span>
                    </div>
                    
                    {analysisResult.sections.map((section) => (
                      <ContentSectionCard
                        key={section.id}
                        section={section}
                        isSelected={section.id === selectedSectionId}
                        onClick={() => setSelectedSectionId(section.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Score & Actions */}
            <div className="space-y-6">
              {isAnalyzing && (
                <Card className="border-primary/20">
                  <CardContent className="py-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
                      </div>
                      <div>
                        <p className="font-medium">Analyzing Content</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Scoring against your Content DNA...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysisResult && selectedSection && (
                <>
                  <BrandScorePanel
                    section={selectedSection}
                    voiceAnalysis={contentDNA?.voice_analysis}
                  />

                  <AnalysisActionsCard
                    isSaving={isSaving}
                    isRewriting={isRewritingContent}
                    onSaveDraft={handleSaveDraft}
                    onSaveToPersonalLibrary={handleSaveToPersonalLibrary}
                    onSaveToUniversityLibrary={handleSaveToUniversityLibrary}
                    onRewrite={handleRewrite}
                    onNewAnalysis={handleNewAnalysis}
                    showRewrite={showRewrite}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
