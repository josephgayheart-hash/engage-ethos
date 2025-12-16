import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Header } from "@/components/Header";
import { ContextSelector } from "@/components/ContextSelector";
import { LibraryNav } from "@/components/LibraryNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AIBadge } from "@/components/ui/ai-indicator";
import { useToast } from "@/hooks/use-toast";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { useInstitutionalConfig } from "@/hooks/useInstitutionalConfig";
import { CreateTemplateDialog } from "@/components/library/CreateTemplateDialog";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  ArrowRight, 
  PenTool, 
  Save, 
  RefreshCw, 
  Sparkles,
  Copy,
  Check,
  User,
  FileText,
  Ruler,
  FolderPlus,
  Library,
  Trash2,
  Mail,
  CalendarIcon,
  Clock
} from "lucide-react";
import { buildMessage } from "@/lib/evaluateMessage";
import { EvaluationResults } from "@/components/EvaluationResults";
import type { MessageContext, BuilderResult, InstitutionalConfig, Channel } from "@/types/persist";

const channelOptions: { value: Channel; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS/Text' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'portal', label: 'Portal' },
  { value: 'landing-page', label: 'Landing Page' },
  { value: 'direct-mail', label: 'Direct Mail' },
  { value: 'phone-call', label: 'Phone Call' },
];

const BuildPage = () => {
  const { toast } = useToast();
  const { addMessage } = useMessageLibrary();
  const { addTemplate } = useSharedLibrary();
  const { config: institutionalConfig } = useInstitutionalConfig();
  const [context, setContext] = useState<MessageContext>({
    audience: 'first-year',
    moment: 'early-term',
    channel: 'email',
  });
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(['email']);
  const [builderResult, setBuilderResult] = useState<BuilderResult | null>(null);
  const [drafts, setDrafts] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [activeDraft, setActiveDraft] = useState(0);
  const [submitToSharedOpen, setSubmitToSharedOpen] = useState(false);
  const [draftToSubmit, setDraftToSubmit] = useState('');

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
    setDrafts([]);
    
    try {
      // Use selected channels in context
      const contextWithChannels = { ...context, channel: selectedChannels[0], channels: selectedChannels };
      const result = await buildMessage(contextWithChannels, institutionalConfig);
      setBuilderResult(result);
      setDrafts(result.drafts);
      setActiveDraft(0);
      
      if (autoSave && result.drafts.length > 0) {
        const title = `Generated: ${context.domain || context.moment} ${context.audience} message`;
        addMessage({
          title,
          content: result.drafts[0],
          channel: selectedChannels[0],
          audience: context.audience,
          cohort: context.cohort ? [context.cohort] : undefined,
          domain: context.domain,
          moment: context.moment,
          goal: context.goal,
          tone: context.tone,
          senderRecommendation: result.recommendedSender,
          approved: false,
          mode: 'generated',
        });
        toast({
          title: "Messages Generated",
          description: "First draft saved to your library.",
        });
      } else {
        toast({
          title: "Messages Generated",
          description: "Draft messages created based on your context.",
        });
      }
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

  const handleGenerateMore = async () => {
    setIsGeneratingMore(true);
    try {
      const contextWithChannels = { ...context, channel: selectedChannels[0], channels: selectedChannels };
      const { data, error } = await supabase.functions.invoke('generate-message', {
        body: { type: 'builder', context: contextWithChannels, institutionalConfig }
      });

      if (error) throw error;
      
      if (data?.message) {
        const newDrafts = [...drafts, data.message];
        setDrafts(newDrafts);
        setActiveDraft(newDrafts.length - 1);
        toast({ 
          title: "New draft generated",
          description: "AI created another message option."
        });
      }
    } catch (error) {
      console.error("Generation failed:", error);
      toast({ 
        variant: "destructive",
        title: "Generation failed", 
        description: "Could not generate additional message."
      });
    } finally {
      setIsGeneratingMore(false);
    }
  };

  const handleDeleteDraft = (index: number) => {
    if (drafts.length <= 1) {
      toast({ variant: "destructive", title: "Cannot delete", description: "You need at least one draft." });
      return;
    }
    const newDrafts = drafts.filter((_, i) => i !== index);
    setDrafts(newDrafts);
    if (activeDraft >= newDrafts.length) {
      setActiveDraft(newDrafts.length - 1);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveToLibrary = (draft: string, index: number) => {
    const title = `Generated: ${context.domain || context.moment} for ${context.audience}`;
    addMessage({
      title,
      content: draft,
      channel: selectedChannels[0],
      audience: context.audience,
      cohort: context.cohort ? [context.cohort] : undefined,
      domain: context.domain,
      moment: context.moment,
      goal: context.goal,
      tone: context.tone,
      senderRecommendation: builderResult?.recommendedSender,
      approved: false,
      mode: 'generated',
    });
    setSavedIndex(index);
    setTimeout(() => setSavedIndex(null), 2000);
    toast({ title: "Saved to your library" });
  };

  const handleReset = () => {
    setBuilderResult(null);
    setDrafts([]);
    setActiveDraft(0);
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
                  {drafts.length > 0 && (
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
          {drafts.length > 0 && builderResult && (
            <div className="space-y-6 animate-fade-in">
              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      Generated Messages
                      <Badge variant="secondary" className="text-xs">
                        {drafts.length} draft{drafts.length > 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateMore}
                      disabled={isGeneratingMore || drafts.length >= 5}
                      className="flex items-center gap-2"
                    >
                      {isGeneratingMore ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Another
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
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

                  {/* Drafts Tabs */}
                  <Tabs value={`draft-${activeDraft}`} onValueChange={(v) => setActiveDraft(parseInt(v.split('-')[1]))}>
                    <TabsList className="flex flex-wrap gap-1">
                      {drafts.map((_, index) => (
                        <TabsTrigger key={index} value={`draft-${index}`} className="text-sm">
                          Draft {index + 1}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {drafts.map((draft, index) => (
                      <TabsContent key={index} value={`draft-${index}`}>
                        <div className="relative p-4 bg-card border border-border rounded-lg">
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(draft, index)}
                              title="Copy to clipboard"
                            >
                              {copiedIndex === index ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            {drafts.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDraft(index)}
                                title="Delete draft"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm whitespace-pre-wrap pr-20">{draft}</p>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveToLibrary(draft, index)}
                            className="flex items-center gap-2"
                          >
                            {savedIndex === index ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <FolderPlus className="w-4 h-4" />
                            )}
                            Save to My Library
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDraftToSubmit(draft);
                              setSubmitToSharedOpen(true);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Library className="w-4 h-4" />
                            Submit to Shared Library
                          </Button>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>

              {/* Evaluation */}
              {builderResult.evaluation && (
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-medium flex items-center gap-2">
                    Draft Evaluation
                    <span className="text-xs text-secondary flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Analysis
                    </span>
                  </h3>
                  <EvaluationResults result={builderResult.evaluation} />
                </div>
              )}
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
