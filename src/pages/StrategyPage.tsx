// Strategy Page - Journey Designer with PDF Export
import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { format, differenceInWeeks, addWeeks } from "date-fns";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Header } from "@/components/Header";
import { ContextSelector } from "@/components/ContextSelector";
import { StrategyJourneyDisplay } from "@/components/StrategyJourney";
import { JourneyFlowDiagram } from "@/components/JourneyFlowDiagram";
import { LibraryNav } from "@/components/LibraryNav";
import { InstitutionalProfileSelector } from "@/components/InstitutionalProfileSelector";
import { ContentDNAIndicator, ContentDNAActiveBadge } from "@/components/ContentDNAIndicator";
import { ContentDNAExplainer } from "@/components/ContentDNAExplainer";
import { BrandLayerSelector, BrandLayerActiveBadge, BrandLayerSelection } from "@/components/BrandLayerSelector";
import { CadenceSelector, CadenceFrequency, EscalationPattern } from "@/components/CadenceSelector";
import { SaveToLibraryDialog } from "@/components/library/SaveToLibraryDialog";
import { BuilderStepSection, BuilderStepDivider } from "@/components/BuilderStepSection";
import { WaveBackground } from "@/components/WaveBackground";
import { SelectionSummary } from "@/components/SelectionSummary";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AIBadge } from "@/components/ui/ai-indicator";
import { useToast } from "@/hooks/use-toast";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { useContentDNAForGeneration } from "@/hooks/useContentDNAForGeneration";
import { useToolTracking } from "@/hooks/useToolTracking";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Map, RefreshCw, Calendar as CalendarIcon, Save, Share2, BookMarked, Clock, Target, Users, UserCheck, Mail, FileDown, MessageSquare, Globe, Phone, FileText, Search, Megaphone, Building2 } from "lucide-react";
import { mapMessages } from "@/lib/evaluateMessage";
import { useAuth } from "@/contexts/AuthContext";
import type { MessageContext, MapperResult, Channel, InstitutionalConfig } from "@/types/uplaybook";

const channelOptions: { value: Channel; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS/Text' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'portal', label: 'Portal' },
  { value: 'landing-page', label: 'Landing Page' },
  { value: 'direct-mail', label: 'Direct Mail' },
  { value: 'phone-call', label: 'Phone Call' },
  { value: 'digital-ad-search', label: 'Search Ads (Google/Bing)' },
  { value: 'digital-ad-social', label: 'Social Ads (Meta/LinkedIn)' },
  { value: 'talking-points', label: 'Executive Talking Points' },
];

const audienceLabels: Record<string, string> = {
  'prospective': 'Prospective Student',
  'first-year': 'First-Year Student',
  'continuing': 'Continuing Student',
  'at-risk': 'At-Risk Student',
  'graduate': 'Graduate Student',
  'online-learner': 'Online Learner',
  'alumni': 'Alumni',
  'parents': 'Parents/Family',
  'donors': 'Donors',
  'policy-makers': 'Policy Makers',
  'community-partners': 'Community Partners',
  'higher-ed-leaders': 'Higher Education Leaders',
};

const cohortLabels: Record<string, string> = {
  'none': 'No specific cohort',
  'first-gen': 'First-Generation',
  'probation': 'Academic Probation',
  'online': 'Online Student',
  'commuter': 'Commuter',
  'residential': 'Residential',
  'transfer': 'Transfer Student',
  'international': 'International',
  'veteran': 'Veteran',
  'parent': 'Student Parent',
  'working-adult': 'Working Adult',
};

const StrategyPage = () => {
  const { toast } = useToast();
  const { profile, isAdmin, isApprover } = useAuth();
  const { addMessage, updateMessage } = useMessageLibrary();
  const { addTemplate } = useSharedLibrary();
  const { trackToolUse } = useToolTracking();
  const location = useLocation();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedProfileName, setSelectedProfileName] = useState<string | undefined>(undefined);
  const [institutionalConfig, setInstitutionalConfig] = useState<InstitutionalConfig | null>(null);
  const [context, setContext] = useState<MessageContext>({
    audience: undefined,
    moment: undefined,
    channel: 'email',
  });
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(['email', 'sms']);
  const [journeyWeeks, setJourneyWeeks] = useState(12);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [mapperResult, setMapperResult] = useState<MapperResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [buildDiagram, setBuildDiagram] = useState(true);
  const [cadence, setCadence] = useState<CadenceFrequency>('weekly');
  const [escalation, setEscalation] = useState<EscalationPattern>('none');
  const [estimatedTouchpoints, setEstimatedTouchpoints] = useState<number>(12);
  const [useContentDNA, setUseContentDNA] = useState(false);
  const [brandSelection, setBrandSelection] = useState<BrandLayerSelection>({
    pillars: [],
    proofPoints: [],
    commitments: [],
    pathways: [],
    includePromise: true,
  });
  const { contentDNA, isLoading: isContentDNALoading } = useContentDNAForGeneration({ profileId: selectedProfileId });
  const [saveToLibraryOpen, setSaveToLibraryOpen] = useState(false);
  const [saveToLibraryType, setSaveToLibraryType] = useState<'personal' | 'shared'>('personal');
  
  // Edit/Remix mode state
  const [editMode, setEditMode] = useState<'new' | 'edit' | 'remix'>('new');
  const [editingJourneyId, setEditingJourneyId] = useState<string | null>(null);
  const [remixedFrom, setRemixedFrom] = useState<{ title: string; id?: string; source: 'personal' | 'university' } | null>(null);

  // Load journey data from navigation state (for edit/remix)
  useEffect(() => {
    const state = location.state as { 
      editMode?: 'edit' | 'remix';
      journeyId?: string;
      journeyData?: any;
      metadata?: any;
      originalTitle?: string;
      originalId?: string;
      source?: 'personal' | 'university';
    } | null;

    if (state?.journeyData) {
      // Set the journey result
      setMapperResult({ journey: state.journeyData });
      
      // Set edit mode
      setEditMode(state.editMode || 'remix');
      
      if (state.editMode === 'edit' && state.journeyId) {
        setEditingJourneyId(state.journeyId);
      }

      // Track remix source
      if (state.editMode === 'remix' && state.originalTitle) {
        setRemixedFrom({
          title: state.originalTitle,
          id: state.originalId,
          source: state.source || 'personal',
        });
      }

      // Restore context from metadata if available
      if (state.metadata?.context) {
        const ctx = state.metadata.context;
        setContext(prev => ({
          ...prev,
          audience: ctx.audience || prev.audience,
          moment: ctx.moment || prev.moment,
          moments: ctx.moments || prev.moments,
          goal: ctx.goal || prev.goal,
          goals: ctx.goals || prev.goals,
          cohort: ctx.cohort || prev.cohort,
          domain: ctx.domain || prev.domain,
          tone: ctx.tone || prev.tone,
        }));
        
        if (ctx.channels) {
          setSelectedChannels(ctx.channels);
        }
      }

      // Restore profile and DNA settings from metadata
      if (state.metadata?.institutionalProfileId) {
        setSelectedProfileId(state.metadata.institutionalProfileId);
        setSelectedProfileName(state.metadata.institutionalProfileName);
      }
      if (state.metadata?.useContentDNA !== undefined) {
        setUseContentDNA(state.metadata.useContentDNA);
      }

      // Restore dates
      if (state.metadata?.startDate) {
        setStartDate(new Date(state.metadata.startDate));
      }
      if (state.metadata?.endDate) {
        setEndDate(new Date(state.metadata.endDate));
      }

      // Show toast
      toast({
        title: state.editMode === 'edit' ? "Editing Journey" : "Remixing Journey",
        description: state.editMode === 'edit' 
          ? "Make changes and save to update the original."
          : `Creating a remix of "${state.originalTitle}"`,
      });

      // Clear the navigation state to prevent reloading on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

  // Auto-calculate weeks when dates change
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (date && endDate) {
      const weeks = differenceInWeeks(endDate, date);
      if (weeks > 0 && weeks <= 52) setJourneyWeeks(weeks);
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    if (date && startDate) {
      const weeks = differenceInWeeks(date, startDate);
      if (weeks > 0 && weeks <= 52) setJourneyWeeks(weeks);
    } else if (date && !startDate) {
      // If only end date, calculate start from weeks
      setStartDate(addWeeks(date, -journeyWeeks));
    }
  };

  const handleWeeksChange = (weeks: number) => {
    setJourneyWeeks(weeks);
    if (startDate) {
      setEndDate(addWeeks(startDate, weeks));
    }
  };

  const canProcess = context.audience && context.moment && selectedChannels.length > 0;

  const toggleChannel = (channel: Channel) => {
    setSelectedChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const selectAllChannels = () => {
    setSelectedChannels(channelOptions.map(c => c.value));
  };

  const handleGenerateStrategy = async () => {
    if (!canProcess) return;

    if (useContentDNA && isContentDNALoading) {
      toast({
        title: "Loading Content DNA",
        description: "Please try again in a moment.",
      });
      return;
    }
    
    setIsProcessing(true);
    setMapperResult(null);
    
    try {
      // Use the first selected channel for the context
      const contextWithChannels = { 
        ...context, 
        channel: selectedChannels[0], 
        channels: selectedChannels,
        cadence,
        escalation,
        estimatedTouchpoints,
      };

      const configForGeneration = institutionalConfig
        ? {
            ...institutionalConfig,
            // IMPORTANT: Always use the selected profile's Content DNA when enabled (never a cloned/stale voiceAnalysis).
            voiceAnalysis: useContentDNA
              ? ((contentDNA?.voiceAnalysis ?? undefined) as any)
              : undefined,
            // Pass brand platform and selected brand elements for generation
            brandPlatform: useContentDNA ? contentDNA?.brandPlatform : undefined,
            brandSelection: useContentDNA ? brandSelection : undefined,
          }
        : undefined;

      const result = await mapMessages(
        contextWithChannels, 
        configForGeneration, 
        journeyWeeks,
        startDate?.toISOString(),
        endDate?.toISOString()
      );
      setMapperResult(result);

      // Track tool usage
      trackToolUse('mapper', 'use', {
        channels: selectedChannels,
        audience: context.audience,
        moment: context.moment,
        profileId: selectedProfileId,
        profileName: selectedProfileName,
        useContentDNA,
        journeyWeeks,
        cadence,
        escalation,
      });

      toast({
        title: "Strategy Generated",
        description: "Your messaging journey map is ready.",
      });
    } catch (error) {
      console.error("Strategy generation failed:", error);
      toast({
        variant: "destructive",
        title: "Strategy Generation Failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setMapperResult(null);
    // Also reset edit mode when clearing results
    setEditMode('new');
    setEditingJourneyId(null);
  };

  const handleSaveToLibraryClick = () => {
    if (!mapperResult?.journey) return;
    setSaveToLibraryType('personal');
    setSaveToLibraryOpen(true);
  };

  const handleSaveToLibraryConfirm = (name: string): string | undefined => {
    if (!mapperResult?.journey) return undefined;

    // Include journey data with metadata for diagram rendering AND profile/DNA info
    const journeyWithMetadata = {
      ...mapperResult.journey,
      _metadata: {
        context: {
          audience: context.audience,
          cohort: context.cohort,
          moment: context.moment,
          moments: context.moments,
          goal: context.goal,
          goals: context.goals,
          domain: context.domain,
          tone: context.tone,
          channels: selectedChannels,
        },
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        channels: selectedChannels,
        // Persist profile and DNA settings for library playback
        institutionalProfileId: selectedProfileId,
        institutionalProfileName: selectedProfileName,
        useContentDNA: useContentDNA,
      }
    };
    
    const journeyContent = JSON.stringify(journeyWithMetadata, null, 2);
    
    // If editing an existing journey, update it instead of creating new
    if (editMode === 'edit' && editingJourneyId) {
      updateMessage(editingJourneyId, {
        title: name,
        content: journeyContent,
        audience: context.audience,
        cohort: context.cohort ? [context.cohort] : undefined,
        domain: context.domain,
        moment: context.moment,
        goal: context.goal,
        tone: context.tone,
        // Persist profile info
        institutionalProfileId: selectedProfileId || undefined,
        institutionalProfileName: selectedProfileName || undefined,
      }, true); // Add as new version
      
      toast({
        title: "Journey Updated",
        description: "Your changes have been saved to the original journey.",
      });
      
      // Reset edit mode
      setEditMode('new');
      setEditingJourneyId(null);
      
      return editingJourneyId;
    }
    
    // Create new journey (for new or remix mode)
    const savedMessage = addMessage({
      title: name,
      content: journeyContent,
      channel: context.channel,
      audience: context.audience,
      cohort: context.cohort ? [context.cohort] : undefined,
      domain: context.domain,
      moment: context.moment,
      goal: context.goal,
      tone: context.tone,
      approved: false,
      mode: 'generated',
      source: 'journey',
      // Persist institutional profile info for library generation
      institutionalProfileId: selectedProfileId || undefined,
      institutionalProfileName: selectedProfileName || undefined,
      // Track remix source if this is a remix
      remixedFrom: remixedFrom || undefined,
      // Creator information
      createdByUserId: profile?.id,
      createdByName: profile ? `${profile.first_name} ${profile.last_name}` : undefined,
    });

    // Reset remix mode after saving
    if (editMode === 'remix') {
      setEditMode('new');
      setRemixedFrom(null);
    }

    return savedMessage.id;
  };

  const handleShareToLibraryClick = () => {
    if (!mapperResult?.journey) return;
    setSaveToLibraryType('shared');
    setSaveToLibraryOpen(true);
  };

  const handleShareToLibraryConfirm = (name: string): string | undefined => {
    if (!mapperResult?.journey) return undefined;

    const journey = mapperResult.journey;
    
    // Include journey data with metadata for diagram rendering AND profile/DNA info
    const journeyWithMetadata = {
      ...journey,
      _metadata: {
        context: {
          audience: context.audience,
          cohort: context.cohort,
          moment: context.moment,
          goal: context.goal,
          domain: context.domain,
          tone: context.tone,
        },
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        channels: selectedChannels,
        // Persist profile and DNA settings for library playback
        institutionalProfileId: selectedProfileId,
        institutionalProfileName: selectedProfileName,
        useContentDNA: useContentDNA,
      }
    };
    
    const savedTemplate = addTemplate({
      title: name,
      intentStatement: journey.overview,
      content: JSON.stringify(journeyWithMetadata, null, 2),
      playbook: 'Strategy Journeys',
      owner: 'Current User',
      maintainer: 'Current User',
      // Auto-publish for admins and approvers
      status: (isAdmin || isApprover) ? 'published' as const : 'submitted' as const,
      version: '1.0',
      requiredFields: {
        audience: [context.audience],
        moment: [context.moment],
        channel: selectedChannels,
      },
      useCases: {
        whenToUse: journey.phases.map(p => p.focus),
        whenNotToUse: journey.risks,
      },
      ethicalGuardrails: ['Review all touchpoints before publishing', 'Ensure messaging aligns with institutional voice'],
      placeholders: [],
      source: 'journey',
      // Persist institutional profile info for library generation
      institutionalProfileId: selectedProfileId || undefined,
      institutionalProfileName: selectedProfileName || undefined,
    });

    return savedTemplate.id;
  };

  // PDF Export function
  const handleExportPdf = useCallback(async () => {
    if (!resultsRef.current || !mapperResult?.journey) return;

    setIsExportingPdf(true);
    toast({
      title: "Generating PDF",
      description: "Please wait while we capture your journey...",
    });

    try {
      // Ensure fonts are loaded before capture (prevents text overlap/layout shifts)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (document as any).fonts?.ready;

      const root = resultsRef.current;
      const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-pdf-section]"));
      const exportTargets = sections.length ? sections : [root];

      const commonCanvasOpts = {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: -window.scrollY,
        onclone: (clonedDoc: Document) => {
          // PDF capture stabilizers: fix badge alignment + remove layout-shifting effects
          const style = clonedDoc.createElement("style");
          style.innerHTML = `
            * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            body { line-height: 1.4; }
            p { line-height: 1.4; }
            .shadow, [class*="shadow"], [class*="backdrop"], [style*="filter"], [style*="backdrop-filter"] {
              filter: none !important;
              backdrop-filter: none !important;
            }
          `;
          clonedDoc.head.appendChild(style);

          const badges = clonedDoc.querySelectorAll('[class*="badge"], [class*="Badge"]');
          badges.forEach((badge) => {
            const el = badge as HTMLElement;
            el.style.display = "inline-flex";
            el.style.alignItems = "center";
            el.style.verticalAlign = "middle";
            el.style.lineHeight = "1";
            el.style.gap = "4px";
            el.style.whiteSpace = "nowrap";
          });

          const flexContainers = clonedDoc.querySelectorAll('[class*="flex"][class*="gap"]');
          flexContainers.forEach((container) => {
            const el = container as HTMLElement;
            el.style.display = "flex";
            el.style.alignItems = "center";
            el.style.flexWrap = "wrap";
          });

          const icons = clonedDoc.querySelectorAll("svg");
          icons.forEach((icon) => {
            const el = icon as unknown as HTMLElement;
            el.style.display = "inline-block";
            el.style.verticalAlign = "middle";
            el.style.flexShrink = "0";
          });
        },
      } as const;

      const canvases: HTMLCanvasElement[] = [];
      for (const target of exportTargets) {
        const canvas = await html2canvas(target, {
          ...commonCanvasOpts,
          windowWidth: target.scrollWidth,
          windowHeight: target.scrollHeight,
        });
        canvases.push(canvas);
      }

      // Standard A4 multi-page export with section-aware page breaks
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const marginX = 40;
      const headerH = 44;
      const marginBottom = 40;
      const sectionGap = 18;

      const availableWidth = pageWidth - marginX * 2;
      const availableHeight = pageHeight - headerH - marginBottom;

      let pageNum = 1;
      let cursorY = headerH;

      const addHeader = () => {
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Strategy Journey Export • ${format(new Date(), "MMM d, yyyy")} • Page ${pageNum}`,
          marginX,
          28
        );
      };

      const newPage = () => {
        pdf.addPage();
        pageNum += 1;
        addHeader();
        cursorY = headerH;
      };

      const coverFooter = () => {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, pageHeight - marginBottom, pageWidth, marginBottom, "F");
      };

      addHeader();

      for (const canvas of canvases) {
        const imgData = canvas.toDataURL("image/png");
        const imgHeight = (canvas.height * availableWidth) / canvas.width;

        const remaining = pageHeight - marginBottom - cursorY;

        // If this section won't fit, start it on a fresh page
        if (imgHeight > remaining) {
          if (cursorY !== headerH) newPage();
        }

        if (imgHeight <= availableHeight) {
          pdf.addImage(imgData, "PNG", marginX, cursorY, availableWidth, imgHeight, undefined, "FAST");
          coverFooter();
          cursorY += imgHeight + sectionGap;

          // If we ended too close to the bottom, move to a clean new page
          if (cursorY > pageHeight - marginBottom - 24) newPage();
          continue;
        }

        // Multi-page slice for very tall sections
        const pagesForCanvas = Math.max(1, Math.ceil(imgHeight / availableHeight));
        for (let i = 0; i < pagesForCanvas; i++) {
          if (i > 0) newPage();

          const y = headerH - i * availableHeight;
          pdf.addImage(imgData, "PNG", marginX, y, availableWidth, imgHeight, undefined, "FAST");
          coverFooter();
        }

        const remainder = imgHeight - (pagesForCanvas - 1) * availableHeight;
        cursorY = headerH + remainder + sectionGap;
        if (cursorY > pageHeight - marginBottom - 24) newPage();
      }

      const timestamp = format(new Date(), "yyyy-MM-dd");
      const audienceLabel = context.audience ? audienceLabels[context.audience] || context.audience : "journey";
      const filename = `strategy-journey-${audienceLabel.toLowerCase().replace(/\s+/g, "-")}-${timestamp}.pdf`;

      pdf.save(filename);

      toast({
        title: "PDF Exported",
        description: "Your strategy journey has been downloaded.",
      });
    } catch (error) {
      console.error("PDF export failed:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not generate PDF. Please try again.",
      });
    } finally {
      setIsExportingPdf(false);
    }
  }, [mapperResult, context.audience, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header with solid colored wave background */}
      <div className="relative overflow-hidden pb-12">
        <WaveBackground variant="amber" />
        
        <div className="relative container mx-auto px-4 pt-10 pb-8 max-w-5xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Journey Designer</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="icon-container icon-container-lg bg-pillar-consensus/10">
                  <Map className="w-6 h-6 text-pillar-consensus" />
                </div>
                Journey Designer
                {editMode !== 'new' && (
                  <Badge variant={editMode === 'edit' ? 'default' : 'secondary'} className="ml-2 text-xs">
                    {editMode === 'edit' ? 'Editing' : 'Remixing'}
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground mt-1 ml-14">
                {editMode === 'edit' 
                  ? "Make changes to your journey and save to update the original"
                  : editMode === 'remix'
                    ? "Customize this journey and save as a new copy"
                    : "Design detailed week-by-week communication journeys"
                }
              </p>
            </div>
            <AIBadge />
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Library Navigation */}
          <LibraryNav mode="journeys" />

          {/* Context Card */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Design Your Journey</CardTitle>
              <CardDescription>
                Follow the steps below to configure your audience, timeline, and channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Step 1: Brand & Profile */}
              <BuilderStepSection
                stepNumber={1}
                title="Select Your Brand Context"
                description="Choose the institutional profile and voice settings for your journey"
                helpText="Select which college, department, or unit this journey represents. When Content DNA is enabled, the AI combines your Voice Analysis (tone, vocabulary, patterns) with your Brand Platform (pillars, proof points) and Custom Instructions to generate on-brand journey content."
                icon={<Building2 className="w-4 h-4" />}
              >
                <div className="space-y-4">
                  <InstitutionalProfileSelector
                    selectedProfileId={selectedProfileId}
                    onProfileChange={(id, config, name) => {
                      setSelectedProfileId(id);
                      setInstitutionalConfig(config);
                      setSelectedProfileName(name);
                    }}
                  />

                  {/* Content DNA Indicator */}
                  <ContentDNAIndicator
                    enabled={useContentDNA}
                    onToggle={setUseContentDNA}
                    selectedProfileId={selectedProfileId}
                    selectedProfileName={selectedProfileName}
                  />

                  {/* Brand Layer Selector - only show when Content DNA is enabled and brand platform exists */}
                  {useContentDNA && contentDNA?.brandPlatform && (
                    <BrandLayerSelector
                      brandPlatform={contentDNA.brandPlatform}
                      selection={brandSelection}
                      onSelectionChange={setBrandSelection}
                      isLoading={isContentDNALoading}
                      compact
                    />
                  )}

                  {/* How Content DNA Works - Expandable Helper */}
                  <ContentDNAExplainer
                    context="journey-designer"
                    defaultOpen={false}
                    collapsible={true}
                    showManageLink={true}
                  />
                </div>
              </BuilderStepSection>

              {/* Step 2: Audience & Context */}
              <BuilderStepSection
                stepNumber={2}
                title="Define Your Audience"
                description="Who are you communicating with and what's the situation?"
                helpText="Select the primary audience type, their specific cohort characteristics, and the communication moment. These selections help the AI generate contextually appropriate touchpoints throughout the journey."
                icon={<Users className="w-4 h-4" />}
              >
                <ContextSelector context={context} onChange={setContext} mode="mapper" />
              </BuilderStepSection>

              {/* Step 3: Channel Selection */}
              <BuilderStepSection
                stepNumber={3}
                title="Choose Your Channels"
                description="Select which channels to use throughout the journey"
                helpText="The AI will strategically distribute touchpoints across your selected channels based on effectiveness and audience preferences."
                icon={<Mail className="w-4 h-4" />}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-end">
                    <Button variant="ghost" size="sm" onClick={selectAllChannels}>
                      Select All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {channelOptions.map(channel => (
                      <div key={channel.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`channel-${channel.value}`}
                          checked={selectedChannels.includes(channel.value)}
                          onCheckedChange={() => toggleChannel(channel.value)}
                        />
                        <label
                          htmlFor={`channel-${channel.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {channel.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </BuilderStepSection>

              {/* Step 4: Journey Timeline */}
              <BuilderStepSection
                stepNumber={4}
                title="Set Your Timeline"
                description="Define the start date, end date, and duration of your journey"
                helpText="Typical journeys are 8-12 weeks for enrollment campaigns, 16 weeks for semester-long, or 32+ weeks for year-long initiatives. The AI will distribute touchpoints appropriately."
                icon={<Clock className="w-4 h-4" />}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={handleStartDateChange}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">End Date (Due)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !endDate && "text-muted-foreground"
                            )}
                          >
                            <Target className="mr-2 h-4 w-4 text-destructive" />
                            {endDate ? format(endDate, "MMM d, yyyy") : "Due date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={handleEndDateChange}
                            disabled={(date) => startDate ? date < startDate : false}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="journey-weeks" className="text-xs text-muted-foreground">Duration (weeks)</Label>
                      <Input
                        id="journey-weeks"
                        type="number"
                        min={4}
                        max={52}
                        value={journeyWeeks}
                        onChange={(e) => handleWeeksChange(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {(startDate || endDate) && (
                      <div className="flex items-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setStartDate(undefined); setEndDate(undefined); }}
                          className="text-muted-foreground"
                        >
                          Clear dates
                        </Button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {startDate && endDate 
                      ? `Journey runs from ${format(startDate, "MMM d")} to ${format(endDate, "MMM d, yyyy")} (${journeyWeeks} weeks)`
                      : "Typical journeys: 8-12 weeks (enrollment), 16 weeks (semester), 32+ weeks (year-long)"
                    }
                  </p>
                </div>
              </BuilderStepSection>

              {/* Step 5: Cadence & Escalation */}
              <BuilderStepSection
                stepNumber={5}
                title="Configure Cadence & Escalation"
                description="Set the frequency and intensity pattern of your touchpoints"
                helpText="Cadence controls how often touchpoints occur. Escalation patterns adjust intensity over time - e.g., 'gradual increase' starts gently and builds urgency as deadlines approach."
                icon={<Target className="w-4 h-4" />}
              >
                <CadenceSelector
                  journeyWeeks={journeyWeeks}
                  onCadenceChange={setCadence}
                  onEscalationChange={setEscalation}
                  onEstimatedTouchpointsChange={setEstimatedTouchpoints}
                  initialCadence={cadence}
                  initialEscalation={escalation}
                />
              </BuilderStepSection>

              <BuilderStepDivider label="Optional Enhancements" />

              {/* Step 6: Diagram Toggle */}
              <BuilderStepSection
                stepNumber={6}
                title="Visual Journey Diagram"
                description="Generate an interactive flow diagram of the journey"
                helpText="The diagram provides a visual overview of your journey, showing how touchpoints connect and flow over time. Great for presentations and stakeholder reviews."
                icon={<Map className="w-4 h-4" />}
                optional
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="build-diagram"
                    checked={buildDiagram}
                    onCheckedChange={(checked) => setBuildDiagram(checked as boolean)}
                  />
                  <label
                    htmlFor="build-diagram"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Build Interactive Diagram
                  </label>
                </div>
              </BuilderStepSection>

              {/* Step 7: Additional Context */}
              <BuilderStepSection
                stepNumber={7}
                title="Additional Context"
                description="Provide campaign-specific details for more targeted messaging"
                helpText="Add specific instructions, campaign themes, or refinement notes. Examples: 'Target late-registering students' or 'Emphasize career outcomes and ROI'."
                icon={<FileText className="w-4 h-4" />}
                optional
              >
                <textarea
                  value={context.additionalContext || ''}
                  onChange={(e) => setContext({ ...context, additionalContext: e.target.value })}
                  placeholder="Add campaign context to tailor your journey..."
                  className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                />
              </BuilderStepSection>

              {/* Selection Summary + Actions */}
              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
                <div className="flex-1">
                  <SelectionSummary
                    selectedProfileName={selectedProfileName}
                    audience={context.audience}
                    cohort={context.cohort}
                    moment={context.moment}
                    channels={selectedChannels}
                    useContentDNA={useContentDNA}
                    journeyWeeks={journeyWeeks}
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  {mapperResult && (
                    <Button variant="outline" onClick={handleReset}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      New Strategy
                    </Button>
                  )}
                  <Button 
                    onClick={handleGenerateStrategy}
                    disabled={!canProcess || isProcessing}
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Generating Journey...
                      </>
                    ) : (
                      <>
                        Create Strategy Journey
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {mapperResult?.journey && (
            <div className="animate-fade-in space-y-6">
              {/* Save/Share/Export Actions */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <BookMarked className="w-5 h-5 text-primary" />
                      <span className="font-medium">Save this journey</span>
                      {useContentDNA && <ContentDNAActiveBadge profileId={selectedProfileId} institutionName={selectedProfileName} />}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleExportPdf}
                        disabled={isExportingPdf}
                      >
                        {isExportingPdf ? (
                          <>
                            <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <FileDown className="w-4 h-4 mr-2" />
                            Export PDF
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={handleSaveToLibraryClick}>
                        <Save className="w-4 h-4 mr-2" />
                        Save to My Library
                      </Button>
                      <Button variant="default" onClick={handleShareToLibraryClick}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Send to Shared Library
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PDF Export Target Area */}
              <div ref={resultsRef} className="space-y-6 bg-background pb-10">
                {/* Channel Analytics - Floated to top */}
                <div data-pdf-section="analytics" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {(() => {
                    const channelCounts: Record<string, number> = {};
                    mapperResult.journey.touchpoints.forEach(tp => {
                      channelCounts[tp.channel] = (channelCounts[tp.channel] || 0) + 1;
                    });
                    return Object.entries(channelCounts).map(([channel, count]) => (
                      <Card key={channel} className="bg-muted/30">
                        <CardContent className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                            {channel === 'email' && <Mail className="w-4 h-4" />}
                            {channel === 'sms' && <MessageSquare className="w-4 h-4" />}
                            {channel === 'social-media' && <Share2 className="w-4 h-4" />}
                            {channel === 'portal' && <Globe className="w-4 h-4" />}
                            {channel === 'phone-call' && <Phone className="w-4 h-4" />}
                            {channel === 'direct-mail' && <FileText className="w-4 h-4" />}
                            {channel === 'landing-page' && <FileText className="w-4 h-4" />}
                            {channel === 'digital-ad-search' && <Search className="w-4 h-4" />}
                            {channel === 'digital-ad-social' && <Megaphone className="w-4 h-4" />}
                            <span className="text-xs font-medium uppercase tracking-wide">
                              {channel === 'sms' ? 'SMS' : channel === 'digital-ad-search' ? 'Search Ads' : channel === 'digital-ad-social' ? 'Social Ads' : channel.replace(/-/g, ' ')}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-foreground">{count}</p>
                        </CardContent>
                      </Card>
                    ));
                  })()}
                  <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-2 text-primary mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Weeks</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">{mapperResult.journey.totalWeeks}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/10 border-secondary/20">
                    <CardContent className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-2 text-secondary mb-1">
                        <Target className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Touchpoints</span>
                      </div>
                      <p className="text-2xl font-bold text-secondary">{mapperResult.journey.touchpoints.length}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Designated Recipient */}
                <div
                  data-pdf-section="recipient"
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Audience Type</p>
                      <p className="text-sm font-medium">{context.audience ? audienceLabels[context.audience] || context.audience : '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <UserCheck className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Cohort Context</p>
                      <p className="text-sm font-medium">{context.cohort && context.cohort !== 'none' ? cohortLabels[context.cohort] || context.cohort : '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-secondary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Journey Duration</p>
                      <p className="text-sm font-medium">{journeyWeeks} weeks</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-secondary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Channels</p>
                      <p className="text-sm font-medium">{selectedChannels.length} selected</p>
                    </div>
                  </div>
                </div>
                
                {/* Interactive Journey Flow Diagram */}
                {buildDiagram && (
                  <Card data-pdf-section="diagram">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-serif text-lg flex items-center gap-2">
                        <Map className="w-5 h-5 text-pillar-consensus" />
                        Journey Flow Diagram
                      </CardTitle>
                      <CardDescription>
                        Drag nodes to rearrange • Scroll to zoom • Click and drag background to pan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <JourneyFlowDiagram 
                        journey={mapperResult.journey} 
                        context={context}
                        startDate={startDate?.toISOString()} 
                        endDate={endDate?.toISOString()}
                      />
                    </CardContent>
                  </Card>
                )}

                <div data-pdf-section="timeline">
                  <StrategyJourneyDisplay 
                    journey={mapperResult.journey} 
                    context={context} 
                    startDate={startDate?.toISOString()}
                    endDate={endDate?.toISOString()}
                    selectedProfileId={selectedProfileId}
                    selectedProfileName={selectedProfileName}
                    institutionalConfig={institutionalConfig}
                    useContentDNA={useContentDNA}
                    contentDNA={contentDNA}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <SaveToLibraryDialog
        open={saveToLibraryOpen}
        onOpenChange={setSaveToLibraryOpen}
        onSave={saveToLibraryType === 'personal' ? handleSaveToLibraryConfirm : handleShareToLibraryConfirm}
        libraryType={saveToLibraryType}
        defaultName={`Strategy Journey: ${audienceLabels[context.audience || ''] || context.audience} - ${context.moment} (${journeyWeeks} weeks)`}
        contentType="journey"
      />
    </div>
  );
};

export default StrategyPage;
