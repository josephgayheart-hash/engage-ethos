import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Header } from "@/components/Header";
import { ContextSelector } from "@/components/ContextSelector";
import { LibraryNav } from "@/components/LibraryNav";
import { InstitutionalProfileSelector } from "@/components/InstitutionalProfileSelector";
import { ChannelPreview } from "@/components/ChannelPreview";
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
import { CreateTemplateDialog } from "@/components/library/CreateTemplateDialog";
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
  Library
} from "lucide-react";
import { buildMessage } from "@/lib/evaluateMessage";

import type { MessageContext, BuilderResult, InstitutionalConfig, Channel, ChannelDrafts } from "@/types/uplaybook";

const channelOptions: { value: Channel; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS/Text' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'portal', label: 'Portal' },
  { value: 'landing-page', label: 'Landing Page' },
  { value: 'direct-mail', label: 'Direct Mail' },
  { value: 'phone-call', label: 'Phone Call' },
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
  const { addMessage } = useMessageLibrary();
  const { addTemplate } = useSharedLibrary();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedProfileName, setSelectedProfileName] = useState<string | undefined>(undefined);
  const [institutionalConfig, setInstitutionalConfig] = useState<InstitutionalConfig | null>(null);
  const [context, setContext] = useState<MessageContext>({
    audience: 'first-year',
    moment: 'early-term',
    channel: 'email',
  });
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(['email']);
  const [builderResult, setBuilderResult] = useState<BuilderResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null);
  const [submitToSharedOpen, setSubmitToSharedOpen] = useState(false);
  const [draftToSubmit, setDraftToSubmit] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

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

  const handleBuild = async () => {
    if (!canProcess) return;
    
    setIsProcessing(true);
    setBuilderResult(null);
    
    try {
      const contextWithChannels = { ...context, channel: selectedChannels[0], channels: selectedChannels };
      const result = await buildMessage(contextWithChannels, institutionalConfig || undefined);
      setBuilderResult(result);
      
      toast({
        title: "Messages Generated",
        description: `Content created for ${selectedChannels.length} channel${selectedChannels.length > 1 ? 's' : ''}.`,
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

  // Auto-scroll to results when content is generated
  useEffect(() => {
    if (builderResult?.channelDrafts && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [builderResult]);

  const handleCopyContent = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handleReset = () => {
    setBuilderResult(null);
  };

  const handleSaveToLibrary = () => {
    if (!builderResult?.channelDrafts) return;
    
    const channelList = selectedChannels.join(', ');
    const title = `${audienceLabels[context.audience || ''] || 'Message'} Kit - ${channelList}`;
    
    // Serialize channel drafts to content for backwards compatibility
    const contentSummary = selectedChannels.map(ch => {
      const content = builderResult.channelDrafts[ch];
      if (typeof content === 'string') return `[${ch.toUpperCase()}]\n${content}`;
      if (content && typeof content === 'object') {
        if ('subject' in content) return `[EMAIL]\nSubject: ${content.subject}\n${content.body}`;
        if ('opening' in content) return `[PHONE CALL]\n${content.opening}`;
        if ('body' in content && 'cta' in content) return `[LANDING PAGE]\n${content.headline}\n${content.body}`;
        if ('headlines' in content) return `[SEARCH AD]\n${content.headlines.join(' | ')}`;
        if ('primaryText' in content) return `[SOCIAL AD]\n${content.headline}\n${content.primaryText}`;
      }
      return '';
    }).filter(Boolean).join('\n\n---\n\n');

    addMessage({
      title,
      content: contentSummary,
      channels: selectedChannels,
      channelDrafts: builderResult.channelDrafts,
      audience: context.audience,
      domain: context.domain,
      moment: context.moment,
      goal: context.goal,
      tone: context.tone,
      senderRecommendation: builderResult.recommendedSender,
      approved: false,
      mode: 'kit',
      institutionalProfileId: selectedProfileId || undefined,
      institutionalProfileName: selectedProfileName,
    });

    toast({
      title: "Saved to Personal Library",
      description: "Your message kit has been saved.",
    });
  };

  const handleSubmitToShared = () => {
    if (!builderResult?.channelDrafts) return;
    
    const channelList = selectedChannels.join(', ');
    const contentSummary = selectedChannels.map(ch => {
      const content = builderResult.channelDrafts[ch];
      if (typeof content === 'string') return `[${ch.toUpperCase()}]\n${content}`;
      if (content && typeof content === 'object') {
        if ('subject' in content) return `[EMAIL]\nSubject: ${content.subject}\n${content.body}`;
        if ('opening' in content) return `[PHONE CALL]\n${content.opening}`;
        if ('body' in content && 'cta' in content) return `[LANDING PAGE]\n${content.headline}\n${content.body}`;
        if ('headlines' in content) return `[SEARCH AD]\n${content.headlines.join(' | ')}`;
        if ('primaryText' in content) return `[SOCIAL AD]\n${content.headline}\n${content.primaryText}`;
      }
      return '';
    }).filter(Boolean).join('\n\n---\n\n');

    setDraftToSubmit(contentSummary);
    setSubmitToSharedOpen(true);
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

  const handleSaveIndividualChannel = (channel: Channel, channelContent: ChannelDrafts[keyof ChannelDrafts], contentText: string) => {
    const channelLabel = channelOptions.find(c => c.value === channel)?.label || channel;
    const title = `${audienceLabels[context.audience || ''] || 'Message'} - ${channelLabel}`;

    addMessage({
      title,
      content: contentText,
      channel,
      audience: context.audience,
      domain: context.domain,
      moment: context.moment,
      goal: context.goal,
      tone: context.tone,
      senderRecommendation: builderResult?.recommendedSender,
      approved: false,
      mode: 'generated',
      institutionalProfileId: selectedProfileId || undefined,
      institutionalProfileName: selectedProfileName,
    });

    toast({
      title: "Saved to Personal Library",
      description: `Your ${channelLabel} message has been saved.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
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
                <PenTool className="w-7 h-7 text-pillar-cognitive" />
                Message Builder
              </h1>
              <p className="text-muted-foreground mt-1">
                Generate new messages based on context and audience
              </p>
            </div>
            <AIBadge />
          </div>

          {/* Library Navigation */}
          <LibraryNav mode="messages" />

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Message Context</CardTitle>
              <CardDescription>
                Define your audience, timing, and channel to generate tailored messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Institutional Profile Selector */}
              <InstitutionalProfileSelector
                selectedProfileId={selectedProfileId}
                onProfileChange={(id, config, name) => {
                  setSelectedProfileId(id);
                  setInstitutionalConfig(config);
                  setSelectedProfileName(name);
                }}
              />

              <ContextSelector context={context} onChange={setContext} mode="builder" />

              {/* Channel Selection */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-pillar-consensus" />
                    Channel Modalities
                  </Label>
                  <Button variant="ghost" size="sm" onClick={selectAllChannels}>
                    Select All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
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

              {/* Urgency & Deadline Section */}
              <div className="space-y-3 pt-2 border-t border-border">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-destructive" />
                  Urgency & Deadline (Optional)
                </Label>
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
                  <p className="text-xs text-muted-foreground">
                    Messages will include countdown language referencing this deadline.
                  </p>
                )}
              </div>

              {/* Additional Context */}
              <div className="space-y-2 pt-2 border-t border-border">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Additional Context (Optional)
                </Label>
                <textarea
                  value={context.additionalContext || ''}
                  onChange={(e) => setContext({ ...context, additionalContext: e.target.value })}
                  placeholder="Add campaign context or refinement notes. Examples: 'Emphasize career outcomes and ROI for this cohort' or 'Focus on FAFSA deadline urgency' or 'Highlight peer success stories from this program'"
                  className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                />
                <p className="text-xs text-muted-foreground">
                  Provide campaign-specific details to make your messaging more relevant and targeted.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant={autoSave ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAutoSave(!autoSave)}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Auto-save {autoSave ? 'On' : 'Off'}
                </Button>
                
                <div className="flex gap-2">
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
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      Generated Content
                      <Badge variant="secondary" className="text-xs">
                        {selectedChannels.length} channel{selectedChannels.length > 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Start Over
                    </Button>
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
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <Button onClick={handleSaveToLibrary} variant="outline" className="flex-1">
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Save to Personal Library
                    </Button>
                    <Button onClick={handleSubmitToShared} variant="secondary" className="flex-1">
                      <Library className="w-4 h-4 mr-2" />
                      Submit to Shared Library
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Channel-specific previews */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                      onSaveToLibrary={handleSaveIndividualChannel}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <CreateTemplateDialog
        open={submitToSharedOpen}
        onOpenChange={setSubmitToSharedOpen}
        onSubmit={(template) => {
          addTemplate(template);
          toast({
            title: "Template submitted",
            description: "Your message has been submitted to the Shared Library for review.",
          });
          setDraftToSubmit('');
        }}
        initialContent={draftToSubmit}
      />
    </div>
  );
};

export default BuildPage;
