import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { Header } from "@/components/Header";
import { ContextSelector } from "@/components/ContextSelector";
import { LibraryNav } from "@/components/LibraryNav";
import { InstitutionalProfileSelector } from "@/components/InstitutionalProfileSelector";
import { ChannelPreview } from "@/components/ChannelPreview";
import { ContentDNAIndicator, ContentDNAActiveBadge } from "@/components/ContentDNAIndicator";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";
import { ContentDNAExplainer } from "@/components/ContentDNAExplainer";
import { BuilderStepSection, BuilderStepDivider } from "@/components/BuilderStepSection";
import { WaveBackground } from "@/components/WaveBackground";
import { SelectionSummary } from "@/components/SelectionSummary";
import { StoryFactSelector } from "@/components/StoryFactSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AIBadge } from "@/components/ui/ai-indicator";
import { useToast } from "@/hooks/use-toast";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { useContentDNAForGeneration } from "@/hooks/useContentDNAForGeneration";
import { useToolTracking } from "@/hooks/useToolTracking";
import { useUserDrafts } from "@/hooks/useUserDrafts";
import { useLastUsedProfile } from "@/hooks/useLastUsedProfile";
import { BrandLayerSelector, BrandLayerActiveBadge, BrandLayerSelection } from "@/components/BrandLayerSelector";
import { BrandAdherenceScore } from "@/components/BrandAdherenceScore";

import { SaveToLibraryDialog } from "@/components/library/SaveToLibraryDialog";
import { AddToCollectionDialog } from "@/components/library/AddToCollectionDialog";
import { useLibraryCollections } from "@/hooks/useLibraryCollections";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  PenTool, 
  Save, 
  RefreshCw, 
  Sparkles,
  User,
  FileText,
  Ruler,
  Mail,
  CalendarIcon,
  Clock,
  Users,
  UserCheck,
  FolderPlus,
  Library,
  GitBranch,
  X,
  Building2,
  Dna,
  MessageSquare,
  Target,
  FileEdit,
  Smartphone,
  Share2,
  Globe,
  LayoutTemplate,
  Send,
  Phone,
  Search,
  Megaphone,
  Mic,
  Newspaper,
  Heart,
  BookMarked,
  type LucideIcon,
  Folder
} from "lucide-react";
import { buildMessage } from "@/lib/evaluateMessage";
import { useAuth } from "@/contexts/AuthContext";
import type { MessageContext, BuilderResult, InstitutionalConfig, Channel, ChannelDrafts } from "@/types/campusvoice";
import type { Story } from "@/hooks/useStoryBank";
import type { Fact } from "@/hooks/useFactBook";

const channelIcons: Record<Channel, LucideIcon> = {
  'email': Mail,
  'sms': Smartphone,
  'social-media': Share2,
  'portal': Globe,
  'landing-page': LayoutTemplate,
  'direct-mail': Send,
  'phone-call': Phone,
  'digital-ad-search': Search,
  'digital-ad-social': Megaphone,
  'talking-points': Mic,
  'news-article': Newspaper,
  'case-for-care': Heart,
};

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
  { value: 'news-article', label: 'News Article' },
  { value: 'case-for-care', label: 'Case for Support' },
];

const audienceLabels: Record<string, string> = {
  'general': 'General',
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

const BuildPage = () => {
  const { toast } = useToast();
  const { profile, isAdmin, isApprover, tenant } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addMessage } = useMessageLibrary();
  const { addTemplate } = useSharedLibrary();
  const { collections, addItemToCollection, createCollection } = useLibraryCollections();
  const { trackToolUse } = useToolTracking();
  const { profiles } = useInstitutionalProfiles();
  const { saveDraft, currentDraft, setCurrentDraft, deleteDraft, loadDraftById } = useUserDrafts('message');
  const { lastUsedProfileId, setLastUsedProfileId, isLoaded: profilePrefLoaded } = useLastUsedProfile();
  
  // Check for profileId from URL params (from Content DNA page navigation)
  const profileIdFromUrl = searchParams.get('profileId');
  
  // Check for remix state or resume draft from navigation
  const remixState = location.state as {
    remixMode?: boolean;
    resumeDraftId?: string;
    remixContext?: {
      audience: string;
      moment: string;
      channel: string;
      channels: string[];
    };
    remixContent?: string;
    institutionalProfileId?: string;
    institutionalProfileName?: string;
    originalTitle?: string;
    originalId?: string;
    source?: string;
  } | null;

  // Find profile name from URL param if needed
  const profileFromUrl = profileIdFromUrl ? profiles.find(p => p.id === profileIdFromUrl) : null;

  const [selectedProfileId, setSelectedProfileIdLocal] = useState<string | null>(
    profileIdFromUrl || remixState?.institutionalProfileId || null
  );
  const [selectedProfileName, setSelectedProfileName] = useState<string | undefined>(
    profileFromUrl?.name || remixState?.institutionalProfileName
  );
  
  // Wrapper to persist profile selection
  const setSelectedProfileId = useCallback((id: string | null) => {
    setSelectedProfileIdLocal(id);
    if (id) {
      setLastUsedProfileId(id);
    }
  }, [setLastUsedProfileId]);
  
  // Initialize from last used profile when there's no URL param or remix state
  useEffect(() => {
    if (!profilePrefLoaded || !profiles?.length) return;
    if (profileIdFromUrl || remixState?.institutionalProfileId) return; // Already set from URL/remix
    if (selectedProfileId) return; // Already set
    
    // Check if last used profile exists
    if (lastUsedProfileId) {
      const found = profiles.find(p => p.id === lastUsedProfileId);
      if (found) {
        setSelectedProfileIdLocal(lastUsedProfileId);
        setSelectedProfileName(found.name);
        return;
      }
    }
    
    // Fall back to first profile
    if (profiles[0]) {
      setSelectedProfileIdLocal(profiles[0].id);
      setSelectedProfileName(profiles[0].name);
      setLastUsedProfileId(profiles[0].id);
    }
  }, [profiles, profilePrefLoaded, lastUsedProfileId, selectedProfileId, profileIdFromUrl, remixState?.institutionalProfileId, setLastUsedProfileId]);
  
  // Update profile name when profiles load and we have a URL param
  useEffect(() => {
    if (profileIdFromUrl && !selectedProfileName && profiles.length > 0) {
      const foundProfile = profiles.find(p => p.id === profileIdFromUrl);
      if (foundProfile) {
        setSelectedProfileName(foundProfile.name);
      }
    }
  }, [profileIdFromUrl, profiles, selectedProfileName]);
  const [institutionalConfig, setInstitutionalConfig] = useState<InstitutionalConfig | null>(null);

  // Ensure institutionalConfig is populated when restoring a draft / deep-linking.
  // Without this, generation can run with no institution context and the model will fall back to placeholders.
  useEffect(() => {
    if (!selectedProfileId) return;
    if (institutionalConfig) return;
    if (profiles.length === 0) return;

    const found = profiles.find(p => p.id === selectedProfileId);
    if (found?.config) {
      setInstitutionalConfig(found.config);
    }
  }, [selectedProfileId, institutionalConfig, profiles]);
  const [context, setContext] = useState<MessageContext>({
    audience: (remixState?.remixContext?.audience as any) || undefined,
    moment: (remixState?.remixContext?.moment as any) || undefined,
    channel: (remixState?.remixContext?.channel as any) || 'email',
  });
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(
    (remixState?.remixContext?.channels as Channel[]) || []
  );
  const [builderResult, setBuilderResult] = useState<BuilderResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [saveToLibraryOpen, setSaveToLibraryOpen] = useState(false);
  const [saveToLibraryChannel, setSaveToLibraryChannel] = useState<Channel | null>(null);
  const [saveToLibraryType, setSaveToLibraryType] = useState<'personal' | 'shared'>('personal');
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [lastSavedMessageId, setLastSavedMessageId] = useState<string | null>(null);
  const [useContentDNA, setUseContentDNA] = useState(true);
  const [brandSelection, setBrandSelection] = useState<BrandLayerSelection>({
    pillars: [],
    proofPoints: [],
    commitments: [],
    pathways: [],
    includePromise: true,
  });
  const [selectedStories, setSelectedStories] = useState<Story[]>([]);
  const [selectedFacts, setSelectedFacts] = useState<Fact[]>([]);
  const { contentDNA, isLoading: isContentDNALoading } = useContentDNAForGeneration({ profileId: selectedProfileId });
  const resultsRef = useRef<HTMLDivElement>(null);
  const canProcess = context.audience && context.moment && selectedChannels.length > 0;

  // If remix mode, show the original content as a starting point
  const [remixOriginalContent, setRemixOriginalContent] = useState<string | null>(
    remixState?.remixContent || null
  );
  const [remixOriginalTitle, setRemixOriginalTitle] = useState<string | null>(
    remixState?.originalTitle || null
  );

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

  const handleBuild = async () => {
    if (!canProcess) return;

    if (useContentDNA && isContentDNALoading) {
      toast({
        title: "Loading Content DNA",
        description: "Please try again in a moment.",
      });
      return;
    }
    
    setIsProcessing(true);
    setBuilderResult(null);
    
    try {
      const contextWithChannels = { ...context, channel: selectedChannels[0], channels: selectedChannels };

      const selectedProfileConfig = selectedProfileId
        ? profiles.find(p => p.id === selectedProfileId)?.config ?? null
        : null;

      const baseConfig = institutionalConfig ?? selectedProfileConfig;

      // Always send an institutionalConfig to generation when we have *any* source of truth.
      // This prevents placeholder fallbacks like "[University Name]".
      const resolvedConfig: InstitutionalConfig | undefined = baseConfig
        ? {
            ...baseConfig,
            institutionName:
              baseConfig.institutionName?.trim() ||
              tenant?.institution_name ||
              baseConfig.unitName?.trim() ||
              selectedProfileName ||
              "our institution",
            unitName: (baseConfig.unitName || selectedProfileName)?.trim() || undefined,
            primaryColor: baseConfig.primaryColor || tenant?.primary_color,
            accentColor: baseConfig.accentColor || tenant?.accent_color,
            logoUrl: baseConfig.logoUrl || tenant?.logo_url || undefined,
          }
        : tenant
          ? {
              institutionName: tenant.institution_name,
              unitName: selectedProfileName || undefined,
              primaryColor: tenant.primary_color,
              accentColor: tenant.accent_color,
              logoUrl: tenant.logo_url || undefined,
            }
          : undefined;

      const configForGeneration = resolvedConfig
        ? {
            ...resolvedConfig,
            // IMPORTANT: Always use the selected profile's Content DNA when enabled (never a cloned/stale voiceAnalysis).
            voiceAnalysis: useContentDNA
              ? ((contentDNA?.voiceAnalysis ?? undefined) as any)
              : undefined,
            // Pass brand platform and selected brand elements for generation
            brandPlatform: useContentDNA ? contentDNA?.brandPlatform : undefined,
            brandSelection: useContentDNA ? brandSelection : undefined,
            // Pass selected stories and facts for content enrichment
            stories: selectedStories.length > 0 ? selectedStories.map(s => ({
              id: s.id,
              title: s.title,
              narrative: s.narrative,
              pullQuote: s.pull_quote,
              subjectName: s.subject_name,
              subjectRole: s.subject_role,
              storyType: s.story_type,
              themes: s.themes,
            })) : undefined,
            facts: selectedFacts.length > 0 ? selectedFacts.map(f => ({
              id: f.id,
              category: f.category,
              label: f.label,
              value: f.value,
              context: f.context,
              year: f.year,
            })) : undefined,
          }
        : undefined;

      const result = await buildMessage(contextWithChannels, configForGeneration);
      setBuilderResult(result);
      setJustGenerated(true); // Mark as freshly generated to trigger scroll

      // Track tool usage
      trackToolUse('build', 'use', {
        channels: selectedChannels,
        audience: context.audience,
        moment: context.moment,
        profileId: selectedProfileId,
        profileName: selectedProfileName,
        useContentDNA,
        channelCount: selectedChannels.length,
      });
      
      toast({
        title: "Messages Generated",
        description: `Content created for ${selectedChannels.length} channel${selectedChannels.length > 1 ? 's' : ''}. Auto-saving to drafts...`,
      });
    } catch (error) {
      console.error("Build failed:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Track whether we just generated (vs resumed a draft)
  const [justGenerated, setJustGenerated] = useState(false);
  
  // Auto-scroll to results only when freshly generated (not when resuming a draft)
  useEffect(() => {
    if (justGenerated && builderResult?.channelDrafts && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setJustGenerated(false); // Reset so we don't scroll again
    }
  }, [justGenerated, builderResult]);

  // Show remix notification
  useEffect(() => {
    if (remixState?.remixMode && remixOriginalTitle) {
      toast({
        title: "Remixing Playbook",
        description: `Loaded settings from "${remixOriginalTitle}". Adjust context and generate new content.`,
      });
    }
  }, []);

  // Resume draft from navigation
  useEffect(() => {
    const resumeDraftId = remixState?.resumeDraftId;
    if (!resumeDraftId) return;

    const loadAndResumeDraft = async () => {
      const draft = await loadDraftById(resumeDraftId);
      if (draft) {
        const draftData = draft.draft_data as Record<string, unknown>;
        if (draftData.context) setContext(draftData.context as MessageContext);
        if (draftData.selectedChannels) setSelectedChannels(draftData.selectedChannels as Channel[]);
        if (draftData.selectedProfileId) setSelectedProfileId(draftData.selectedProfileId as string);
        if (draftData.selectedProfileName) setSelectedProfileName(draftData.selectedProfileName as string);
        if (draftData.builderResult) setBuilderResult(draftData.builderResult as BuilderResult);
        toast({
          title: "Draft Resumed",
          description: `Continuing "${draft.title || 'your message draft'}"`,
        });
      }
      // Clear navigation state
      window.history.replaceState({}, document.title);
    };

    loadAndResumeDraft();
  }, [remixState?.resumeDraftId, loadDraftById]);

  // Auto-save draft periodically
  const [draftSavedRecently, setDraftSavedRecently] = useState(false);
  
  useEffect(() => {
    // Only auto-save if there's meaningful content
    const hasContent = context.audience || context.moment || builderResult;
    if (!hasContent) return;

    const draftData = {
      context,
      selectedChannels,
      selectedProfileId,
      selectedProfileName,
      builderResult,
      useContentDNA,
    };

    // Generate title from context
    const title = context.audience 
      ? `${audienceLabels[context.audience] || context.audience}${context.moment ? ` - ${context.moment}` : ''}`
      : 'Message Draft';

    const saveTimeout = setTimeout(async () => {
      // Use silent mode for background auto-save (no refetch, no toast)
      await saveDraft('message', draftData, title, currentDraft?.id, true);
      setDraftSavedRecently(true);
      // Reset the indicator after 3 seconds
      setTimeout(() => setDraftSavedRecently(false), 3000);
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(saveTimeout);
  }, [context, selectedChannels, selectedProfileId, builderResult, useContentDNA]);

  // Clear draft when saving to library
  const clearDraftAfterSave = useCallback(async () => {
    if (currentDraft) {
      await deleteDraft(currentDraft.id);
      setCurrentDraft(null);
    }
  }, [currentDraft, deleteDraft, setCurrentDraft]);

  const handleCopyContent = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handleReset = () => {
    setBuilderResult(null);
  };

  const formatTalkingPointsForLibrary = (tp: any): string => {
    const keyMessages = Array.isArray(tp?.keyMessages) ? tp.keyMessages : [];
    const supportingData = Array.isArray(tp?.supportingData) ? tp.supportingData : [];
    const anticipatedQuestions = Array.isArray(tp?.anticipatedQuestions) ? tp.anticipatedQuestions : [];
    const suggestedResponses = Array.isArray(tp?.suggestedResponses) ? tp.suggestedResponses : [];
    const transitionPhrases = Array.isArray(tp?.transitionPhrases) ? tp.transitionPhrases : [];

    let result = `EXECUTIVE TALKING POINTS\n${'='.repeat(40)}\n\n`;
    if (tp?.context) result += `CONTEXT: ${tp.context}\n`;
    if (tp?.audience) result += `AUDIENCE: ${tp.audience}\n\n`;
    if (tp?.openingHook) result += `OPENING HOOK:\n"${tp.openingHook}"\n\n`;

    if (keyMessages.length) {
      result += `KEY TALKING POINTS:\n${keyMessages.map((m: string, i: number) => `${i + 1}. ${m}`).join('\n\n')}\n\n`;
    }

    if (supportingData.length) {
      result += `SUPPORTING DATA & EVIDENCE:\n${supportingData.map((d: string) => `📊 ${d}`).join('\n')}\n\n`;
    }

    if (anticipatedQuestions.length || suggestedResponses.length) {
      result += `ANTICIPATED Q&A:\n`;
      const max = Math.max(anticipatedQuestions.length, suggestedResponses.length);
      for (let i = 0; i < max; i++) {
        const q = anticipatedQuestions[i];
        const a = suggestedResponses[i];
        if (q) result += `Q: ${q}\n`;
        if (a) result += `A: ${a}\n`;
        result += `\n`;
      }
    }

    if (transitionPhrases.length) {
      result += `TRANSITION PHRASES:\n${transitionPhrases.map((t: string) => `→ "${t}"`).join('\n')}\n\n`;
    }

    if (tp?.closingStatement) result += `CLOSING STATEMENT:\n"${tp.closingStatement}"`;
    return result.trim();
  };

  const handleSaveToLibraryClick = () => {
    if (!builderResult?.channelDrafts) return;
    setSaveToLibraryChannel(null); // null means save all channels as kit
    setSaveToLibraryType('personal');
    setSaveToLibraryOpen(true);
  };

  const handleSaveToLibraryConfirm = async (name: string): Promise<string | undefined> => {
    if (!builderResult?.channelDrafts) return undefined;
    
    // Serialize channel drafts to content for backwards compatibility
    const contentSummary = selectedChannels.map(ch => {
      const content = builderResult.channelDrafts[ch];
      if (typeof content === 'string') return `[${ch.toUpperCase()}]\n${content}`;
      if (content && typeof content === 'object') {
        if ('subject' in content) return `[EMAIL]\nSubject: ${content.subject}\n${content.body}`;
        if ('opening' in content && 'purpose' in content) return `[PHONE CALL]\n${content.opening}`;
        if ('body' in content && 'cta' in content) return `[LANDING PAGE]\n${content.headline}\n${content.body}`;
        if ('headlines' in content) return `[SEARCH AD]\n${content.headlines.join(' | ')}`;
        if ('primaryText' in content) return `[SOCIAL AD]\n${content.headline}\n${content.primaryText}`;
        if ('keyMessages' in content) return `[TALKING POINTS]\n${formatTalkingPointsForLibrary(content)}`;
      }
      return '';
    }).filter(Boolean).join('\n\n---\n\n');

    const savedMessage = await addMessage({
      title: name,
      content: contentSummary,
      channel: selectedChannels[0],
      channels: selectedChannels.length > 1 ? selectedChannels : undefined,
      channelDrafts: builderResult?.channelDrafts,
      audience: context.audience,
      cohort: context.cohort ? [context.cohort] : undefined,
      domain: context.domain,
      moment: context.moment,
      goal: context.goal,
      tone: context.tone,
      senderRecommendation: builderResult?.recommendedSender,
      approved: false,
      mode: 'generated',
      source: 'builder',
      institutionalProfileId: selectedProfileId || undefined,
      institutionalProfileName: selectedProfileName,
      // Creator information
      createdByUserId: profile?.id,
      createdByName: profile ? `${profile.first_name} ${profile.last_name}` : undefined,
    });

    // Track the saved message ID for "Add to Collection"
    if (savedMessage?.id) {
      setLastSavedMessageId(savedMessage.id);
    }

    // Clear the draft after saving to library
    clearDraftAfterSave();

    return savedMessage?.id;
  };

  const handleShareToLibraryClick = () => {
    if (!builderResult?.channelDrafts) return;
    setSaveToLibraryChannel(null);
    setSaveToLibraryType('shared');
    setSaveToLibraryOpen(true);
  };

  const handleShareToLibraryConfirm = async (name: string): Promise<string | undefined> => {
    if (!builderResult?.channelDrafts) return undefined;

    // For multi-channel kits, store the first channel's content as JSON for proper rendering
    // and include metadata about all channels
    const primaryChannel = selectedChannels[0];
    const primaryContent = builderResult.channelDrafts[primaryChannel];
    
    // Store structured content as JSON string for proper parsing later
    let contentToStore: string;
    if (typeof primaryContent === 'object' && primaryContent !== null) {
      contentToStore = JSON.stringify(primaryContent);
    } else if (typeof primaryContent === 'string') {
      contentToStore = primaryContent;
    } else {
      // Fallback to text summary for multiple channels
      contentToStore = selectedChannels.map(ch => {
        const content = builderResult.channelDrafts[ch];
        if (typeof content === 'string') return `[${ch.toUpperCase()}]\n${content}`;
        if (content && typeof content === 'object') {
          if ('subject' in content) return `[EMAIL]\nSubject: ${content.subject}\n${content.body}`;
          if ('opening' in content && 'purpose' in content) return `[PHONE CALL]\n${content.opening}`;
          if ('body' in content && 'cta' in content) return `[LANDING PAGE]\n${content.headline}\n${content.body}`;
          if ('headlines' in content) return `[SEARCH AD]\n${content.headlines.join(' | ')}`;
          if ('primaryText' in content) return `[SOCIAL AD]\n${content.headline}\n${content.primaryText}`;
          if ('keyMessages' in content) return `[TALKING POINTS]\n${formatTalkingPointsForLibrary(content)}`;
        }
        return '';
      }).filter(Boolean).join('\n\n---\n\n');
    }

    const savedTemplate = await addTemplate({
      title: name,
      intentStatement: `Multi-channel message kit for ${context.audience || 'students'} - ${context.moment || 'general'}`,
      content: contentToStore,
      playbook: 'Message Kits',
      owner: 'Current User',
      maintainer: 'Current User',
      // Auto-publish for admins and approvers
      status: (isAdmin || isApprover) ? 'published' as const : 'submitted' as const,
      version: '1.0',
      requiredFields: {
        audience: context.audience ? [context.audience] : [],
        moment: context.moment ? [context.moment] : [],
        channel: selectedChannels,
      },
      useCases: {
        whenToUse: [`${context.audience || 'Student'} communications via ${selectedChannels.join(', ')}`],
        whenNotToUse: [],
      },
      ethicalGuardrails: ['Review all content before publishing', 'Ensure messaging aligns with institutional voice'],
      placeholders: [],
      source: 'builder',
      // Persist institutional profile info for library generation
      institutionalProfileId: selectedProfileId || undefined,
      institutionalProfileName: selectedProfileName,
    });

    return savedTemplate?.id;
  };

  const handleContentChange = (channel: Channel, newContent: ChannelDrafts[keyof ChannelDrafts]) => {
    if (!builderResult) return;
    setBuilderResult({
      ...builderResult,
      channelDrafts: {
        ...builderResult.channelDrafts,
        [channel]: newContent,
      },
    });
  };

  const handleSaveIndividualChannelClick = (channel: Channel) => {
    setSaveToLibraryChannel(channel);
    setSaveToLibraryOpen(true);
  };

  const handleSaveIndividualChannelConfirm = async (name: string): Promise<string | undefined> => {
    if (!saveToLibraryChannel || !builderResult?.channelDrafts) return undefined;
    
    const content = builderResult.channelDrafts[saveToLibraryChannel];
    let contentText = '';
    if (typeof content === 'string') {
      contentText = content;
    } else if (content && typeof content === 'object') {
      if ('subject' in content) contentText = `Subject: ${content.subject}\n\n${content.body}`;
      else if ('opening' in content) contentText = content.opening;
      else if ('body' in content && 'headline' in content) contentText = `${content.headline}\n\n${content.body}`;
      else contentText = JSON.stringify(content, null, 2);
    }

    const savedMessage = await addMessage({
      title: name,
      content: contentText,
      channel: saveToLibraryChannel,
      audience: context.audience,
      domain: context.domain,
      moment: context.moment,
      goal: context.goal,
      tone: context.tone,
      senderRecommendation: builderResult?.recommendedSender,
      approved: false,
      mode: 'generated',
      source: 'builder',
      institutionalProfileId: selectedProfileId || undefined,
      institutionalProfileName: selectedProfileName,
      createdByUserId: profile?.id,
      createdByName: profile ? `${profile.first_name} ${profile.last_name}` : undefined,
    });

    return savedMessage?.id;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header with solid colored wave background */}
      <div className="relative overflow-hidden pb-12">
        <WaveBackground variant="teal" />
        
        <div className="relative container mx-auto px-4 pt-10 pb-8 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Message Builder</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="icon-container icon-container-lg bg-pillar-cognitive/10">
                  <PenTool className="w-6 h-6 text-pillar-cognitive" />
                </div>
                Message Builder
              </h1>
              <p className="text-muted-foreground mt-1 ml-14">
                Generate new messages based on context and audience
              </p>
            </div>
            <AIBadge />
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">

          {/* Auto-save Draft Indicator */}
          {(currentDraft || draftSavedRecently) && (
            <div className={cn(
              "flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-all",
              draftSavedRecently 
                ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20" 
                : "bg-muted/50 text-muted-foreground"
            )}>
              <FileEdit className="w-4 h-4" />
              <span>{draftSavedRecently ? '✓ Saved to My Drafts' : 'Draft auto-saved'}</span>
              <span className="text-xs">•</span>
              <span className="text-xs">{currentDraft?.title || 'Untitled'}</span>
            </div>
          )}

          {/* Remix Banner */}
          {remixState?.remixMode && remixOriginalTitle && (
            <Card className="border-secondary/50 bg-secondary/5">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                      <GitBranch className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Remixing: {remixOriginalTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        Context loaded from university library. Adjust settings and generate new content.
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setRemixOriginalContent(null);
                      setRemixOriginalTitle(null);
                      // Clear the location state
                      window.history.replaceState({}, document.title);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Library Navigation */}
          <LibraryNav mode="messages" />

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Build Your Message</CardTitle>
              <CardDescription>
                Follow the steps below to configure your audience, context, and channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Step 1: Institutional Profile */}
              <BuilderStepSection
                stepNumber={1}
                title="Select Your Profile"
                description="Choose the institutional profile for your message"
                helpText="Select which college, department, or unit this message represents."
                icon={<Building2 className="w-4 h-4" />}
              >
                <InstitutionalProfileSelector
                  selectedProfileId={selectedProfileId}
                  onProfileChange={(id, config, name) => {
                    setSelectedProfileId(id);
                    setInstitutionalConfig(config);
                    setSelectedProfileName(name);
                  }}
                />
              </BuilderStepSection>

              {/* Step 2: Brand Layer (with Content DNA inside) */}
              <BuilderStepSection
                stepNumber={2}
                title="Brand Layer"
                description="Apply your brand voice and platform elements"
                helpText="When Content DNA is enabled, the AI combines your Voice Analysis (tone, vocabulary, sentence patterns) with your Brand Platform (pillars, proof points) and Custom Instructions to generate on-brand messaging."
                icon={<Target className="w-4 h-4" />}
              >
                <div className="space-y-4">
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
                    context="message-builder"
                    defaultOpen={false}
                    collapsible={true}
                    showManageLink={true}
                  />
                </div>
              </BuilderStepSection>

              {/* Step 3: Stories & Facts */}
              <BuilderStepSection
                stepNumber={3}
                title="Stories & Facts"
                description="Select stories and statistics to weave into your message"
                helpText="Stories humanize your message with real examples. Facts add credibility with concrete data points. These are optional but recommended for richer content."
                icon={<BookMarked className="w-4 h-4" />}
                optional
              >
                <StoryFactSelector
                  profileId={selectedProfileId}
                  selectedStories={selectedStories}
                  selectedFacts={selectedFacts}
                  onStoriesChange={setSelectedStories}
                  onFactsChange={setSelectedFacts}
                />
              </BuilderStepSection>

              {/* Step 4: Audience & Context */}
              <BuilderStepSection
                stepNumber={4}
                title="Define Your Audience"
                description="Who are you communicating with and what's the situation?"
                helpText="Select the primary audience type, their specific cohort characteristics, and the communication moment. These selections help the AI generate contextually appropriate messaging."
                icon={<Users className="w-4 h-4" />}
              >
                <ContextSelector context={context} onChange={setContext} mode="builder" />
              </BuilderStepSection>

              {/* Step 5: Channel Selection */}
              <BuilderStepSection
                stepNumber={5}
                title="Choose Your Channels"
                description="Select which communication channels to generate content for"
                helpText="You can select multiple channels to generate a coordinated multi-channel message kit. Each channel will receive appropriately formatted content."
                icon={<Mail className="w-4 h-4" />}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-end">
                    <Button variant="ghost" size="sm" onClick={selectAllChannels}>
                      Select All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {channelOptions.map(channel => {
                      const ChannelIcon = channelIcons[channel.value];
                      return (
                        <div key={channel.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`channel-${channel.value}`}
                            checked={selectedChannels.includes(channel.value)}
                            onCheckedChange={() => toggleChannel(channel.value)}
                          />
                          <ChannelIcon className="w-4 h-4 text-muted-foreground" />
                          <label
                            htmlFor={`channel-${channel.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {channel.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </BuilderStepSection>

              <BuilderStepDivider label="Optional Enhancements" />

              {/* Step 6: Urgency & Deadline */}
              <BuilderStepSection
                stepNumber={6}
                title="Urgency & Deadline"
                description="Add time-sensitive elements to create urgency"
                helpText="When you specify a deadline, the AI will incorporate countdown language and urgency cues into your messaging to motivate action."
                icon={<Clock className="w-4 h-4" />}
                optional
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="urgency-label" className="text-xs text-muted-foreground">Deadline Label</Label>
                    <Input
                      id="urgency-label"
                      placeholder="e.g., Registration Deadline"
                      value={context.urgencyLabel || ''}
                      onChange={(e) => setContext({ ...context, urgencyLabel: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !context.dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {context.dueDate ? format(new Date(context.dueDate), "PPP") : "Pick due date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={context.dueDate ? new Date(context.dueDate) : undefined}
                          onSelect={(date) => setContext({ ...context, dueDate: date?.toISOString() })}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {context.dueDate && (
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setContext({ ...context, dueDate: undefined, urgencyLabel: undefined })}
                        className="text-muted-foreground"
                      >
                        Clear deadline
                      </Button>
                    </div>
                  )}
                </div>
                {context.dueDate && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Messages will include countdown language referencing this deadline.
                  </p>
                )}
              </BuilderStepSection>

              {/* Step 7: Additional Context */}
              <BuilderStepSection
                stepNumber={7}
                title="Additional Context"
                description="Provide campaign-specific details for more targeted messaging"
                helpText="Add specific instructions, campaign themes, or refinement notes. Examples: 'Emphasize career outcomes' or 'Focus on FAFSA deadline' or 'Highlight peer success stories'."
                icon={<FileText className="w-4 h-4" />}
                optional
              >
                <textarea
                  value={context.additionalContext || ''}
                  onChange={(e) => setContext({ ...context, additionalContext: e.target.value })}
                  placeholder="Add campaign context or refinement notes..."
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
                    storyCount={selectedStories.length}
                    factCount={selectedFacts.length}
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant={autoSave ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoSave(!autoSave)}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Auto-save {autoSave ? 'On' : 'Off'}
                  </Button>
                  
                  {builderResult && (
                    <Button variant="outline" onClick={handleReset}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Start Over
                    </Button>
                  )}
                  <Button 
                    onClick={handleBuild}
                    disabled={!canProcess || isProcessing}
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Messages
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {builderResult?.channelDrafts && (
            <div ref={resultsRef} className="space-y-6 animate-fade-in scroll-mt-6">
              {/* Header with metadata */}
              <Card>
              <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="font-serif text-lg flex items-center gap-2">
                        Generated Content
                        <Badge variant="secondary" className="text-xs">
                          {selectedChannels.length} channel{selectedChannels.length > 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                      {useContentDNA && <ContentDNAActiveBadge profileId={selectedProfileId} institutionName={selectedProfileName} />}
                      {useContentDNA && contentDNA?.brandPlatform && (
                        <BrandLayerActiveBadge 
                          brandPlatform={contentDNA.brandPlatform} 
                          selection={brandSelection} 
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Date stamp and user info */}
                      {currentDraft && (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span>{profile ? `${profile.first_name} ${profile.last_name}` : 'You'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            <span>{format(new Date(currentDraft.updated_at), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{format(new Date(currentDraft.updated_at), 'h:mm a')}</span>
                          </div>
                        </div>
                      )}
                      <Button variant="outline" size="sm" onClick={handleReset}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Start Over
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Recipient & Recommendations */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted/30 rounded-lg">
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
                      <User className="w-4 h-4 text-secondary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Recommended Sender</p>
                        <p className="text-sm font-medium">{builderResult.recommendedSender}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-secondary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Authority Level</p>
                        <p className="text-sm font-medium">{builderResult.recommendedAuthority}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Ruler className="w-4 h-4 text-secondary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Recommended Length</p>
                        <p className="text-sm font-medium">{builderResult.recommendedLength}</p>
                      </div>
                    </div>
                  </div>

                  {/* Save Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border flex-wrap">
                    <Button onClick={handleSaveToLibraryClick} variant="outline" className="flex-1">
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Save to My Library
                    </Button>
                    <Button onClick={handleShareToLibraryClick} variant="secondary" className="flex-1">
                      <Library className="w-4 h-4 mr-2" />
                      Submit to University Library
                    </Button>
                    {lastSavedMessageId && (
                      <Button onClick={() => setShowCollectionDialog(true)} variant="outline" size="sm">
                        <Folder className="w-4 h-4 mr-2" />
                        Add to Collection
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Brand Adherence Score */}
              {builderResult.brandAdherence && (
                <BrandAdherenceScore 
                  adherence={builderResult.brandAdherence} 
                />
              )}

              {/* Channel-specific previews */}
              <div className={cn(
                "grid gap-4",
                selectedChannels.length === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
              )}>
                {selectedChannels.map(channel => {
                  const content = builderResult.channelDrafts[channel];
                  if (!content) return null;
                  return (
                    <ChannelPreview
                      key={channel}
                      channel={channel}
                      content={content}
                      onCopy={handleCopyContent}
                      onContentChange={handleContentChange}
                      onSaveToLibrary={() => handleSaveIndividualChannelClick(channel)}
                      institutionName={(() => {
                        const cfg = institutionalConfig || (selectedProfileId ? profiles.find(p => p.id === selectedProfileId)?.config : null);
                        const unit = (cfg?.unitName || selectedProfileName || "").trim();
                        const inst = (cfg?.institutionName || tenant?.institution_name || "").trim();
                        if (unit && inst) return `${unit}\n${inst}`;
                        return inst || unit || undefined;
                      })()}
                      branding={(() => {
                        // Default colors that should be treated as "not set" (legacy defaults)
                        const defaultPrimary = ['#1F2A44', '#1f2a44'];
                        const defaultAccent = ['#2C7A7B', '#2c7a7b'];
                        const defaultTertiary = ['#E2E8F0', '#e2e8f0'];
                        
                        // Only use profile color if it's explicitly set and NOT a default value
                        const profilePrimary = institutionalConfig?.primaryColor;
                        const profileAccent = institutionalConfig?.accentColor;
                        const profileTertiary = institutionalConfig?.tertiaryColor;
                        
                        const effectivePrimary = (profilePrimary && !defaultPrimary.includes(profilePrimary)) 
                          ? profilePrimary 
                          : (tenant?.primary_color || undefined);
                        const effectiveAccent = (profileAccent && !defaultAccent.includes(profileAccent)) 
                          ? profileAccent 
                          : (tenant?.accent_color || undefined);
                        const effectiveTertiary = (profileTertiary && !defaultTertiary.includes(profileTertiary)) 
                          ? profileTertiary 
                          : undefined;
                        
                        return {
                          primaryColor: effectivePrimary,
                          accentColor: effectiveAccent,
                          tertiaryColor: effectiveTertiary,
                          logoUrl: institutionalConfig?.logoUrl || tenant?.logo_url || undefined,
                        };
                      })()}
                      tenantId={profile?.tenant_id}
                      profileId={selectedProfileId || undefined}
                      audience={context.audience || undefined}
                      goal={context.goal || undefined}
                      tone={context.tone || undefined}
                      moment={context.moment || undefined}
                      cohort={context.cohort || undefined}
                      domain={context.domain || undefined}
                      contentSummary={context.moment ? `${context.moment} message for ${context.audience || 'students'}${context.goal ? `. Goal: ${context.goal}` : ''}${context.tone ? `. Tone: ${context.tone}` : ''}${context.cohort && context.cohort !== 'none' ? `. Cohort: ${context.cohort}` : ''}${context.domain ? `. Domain: ${context.domain}` : ''}` : undefined}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <SaveToLibraryDialog
        open={saveToLibraryOpen}
        onOpenChange={setSaveToLibraryOpen}
        onSave={
          saveToLibraryType === 'shared'
            ? handleShareToLibraryConfirm
            : saveToLibraryChannel
            ? handleSaveIndividualChannelConfirm
            : handleSaveToLibraryConfirm
        }
        onSaveToPersonal={saveToLibraryType === 'shared' ? handleSaveToLibraryConfirm : undefined}
        onSaveToShared={saveToLibraryType === 'personal' ? handleShareToLibraryConfirm : undefined}
        libraryType={saveToLibraryType}
        defaultName={
          saveToLibraryChannel
            ? `${audienceLabels[context.audience || ''] || 'Message'} - ${channelOptions.find(c => c.value === saveToLibraryChannel)?.label || saveToLibraryChannel}`
            : `${audienceLabels[context.audience || ''] || 'Message'} Kit - ${selectedChannels.join(', ')}`
        }
        contentType={saveToLibraryChannel ? "message" : "message kit"}
      />

      {/* Add to Collection Dialog */}
      <AddToCollectionDialog
        open={showCollectionDialog}
        onOpenChange={setShowCollectionDialog}
        collections={collections}
        onAddToExisting={async (collectionId) => {
          if (!lastSavedMessageId) return;
          const success = await addItemToCollection(collectionId, {
            itemType: 'message',
            messageId: lastSavedMessageId,
          });
          if (success) {
            toast({ title: "Added to collection" });
          }
        }}
        onCreateAndAdd={async (input) => {
          if (!lastSavedMessageId) return;
          const result = await createCollection(input);
          if (result) {
            await addItemToCollection(result.id, {
              itemType: 'message',
              messageId: lastSavedMessageId,
            });
            toast({ title: "Collection created & item added" });
          }
        }}
      />
    </div>
  );
};

export default BuildPage;
