import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Header } from "@/components/Header";
import { ContextSelector } from "@/components/ContextSelector";
import { MessageInput } from "@/components/MessageInput";
import { EvaluationResults } from "@/components/EvaluationResults";
import { LibraryNav } from "@/components/LibraryNav";
import { InstitutionalProfileSelector } from "@/components/InstitutionalProfileSelector";
import { ContentDNAIndicator } from "@/components/ContentDNAIndicator";
import { ContentDNAExplainer } from "@/components/ContentDNAExplainer";
import { BrandLayerSelector, BrandLayerSelection } from "@/components/BrandLayerSelector";
import { BuilderStepSection } from "@/components/BuilderStepSection";
import { WaveBackground } from "@/components/WaveBackground";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AIBadge } from "@/components/ui/ai-indicator";
import { useToast } from "@/hooks/use-toast";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useToolTracking } from "@/hooks/useToolTracking";
import { useContentDNAForGeneration } from "@/hooks/useContentDNAForGeneration";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, FileText, AlertCircle, Save, RefreshCw, CalendarIcon, Clock, Building2, Target, Users } from "lucide-react";
import { evaluateMessage } from "@/lib/evaluateMessage";
import { useAuth } from "@/contexts/AuthContext";
import type { MessageContext, EvaluationResult, InstitutionalConfig } from "@/types/uplaybook";

const EvaluatePage = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { addMessage } = useMessageLibrary();
  const { trackToolUse } = useToolTracking();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedProfileName, setSelectedProfileName] = useState<string | undefined>(undefined);
  const [institutionalConfig, setInstitutionalConfig] = useState<InstitutionalConfig | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [context, setContext] = useState<MessageContext>({
    audience: 'first-year',
    moment: 'early-term',
    channel: 'email',
  });
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [useContentDNA, setUseContentDNA] = useState(true);
  const [brandSelection, setBrandSelection] = useState<BrandLayerSelection>({
    pillars: [],
    proofPoints: [],
    commitments: [],
    pathways: [],
    includePromise: true,
  });
  const { contentDNA, isLoading: isContentDNALoading } = useContentDNAForGeneration({ profileId: selectedProfileId });

  const canProcess = messageContent.trim().length > 20;

  const handleEvaluate = async () => {
    if (!canProcess) return;
    
    setIsProcessing(true);
    setEvaluationResult(null);
    
    try {
      const result = await evaluateMessage(messageContent, context, institutionalConfig || undefined);
      setEvaluationResult(result);

      // Track tool usage
      trackToolUse('evaluate', 'use', {
        channel: context.channel,
        audience: context.audience,
        moment: context.moment,
        profileId: selectedProfileId,
        profileName: selectedProfileName,
        messageLength: messageContent.length,
      });
      
      if (autoSave) {
        const title = `Evaluated: ${messageContent.slice(0, 40)}${messageContent.length > 40 ? '...' : ''}`;
        addMessage({
          title,
          content: messageContent,
          channel: context.channel,
          audience: context.audience,
          cohort: context.cohort ? [context.cohort] : undefined,
          domain: context.domain,
          moment: context.moment,
          goal: context.goal,
          tone: context.tone,
          approved: false,
          mode: 'evaluated',
          source: 'evaluate',
          institutionalProfileId: selectedProfileId || undefined,
          institutionalProfileName: selectedProfileName,
          createdByUserId: profile?.id,
          createdByName: profile ? `${profile.first_name} ${profile.last_name}` : undefined,
        });
        toast({
          title: "Evaluation Complete",
          description: "Message analyzed and saved to your library.",
        });
      } else {
        toast({
          title: "Evaluation Complete",
          description: "Your message has been analyzed using the five-pillar framework.",
        });
      }
    } catch (error) {
      console.error("Evaluation failed:", error);
      toast({
        variant: "destructive",
        title: "Evaluation Failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setMessageContent("");
    setEvaluationResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header with wave background */}
      <div className="relative overflow-hidden pb-12">
        <WaveBackground variant="teal" />
        
        <div className="relative container mx-auto px-4 pt-10 pb-8">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
              <span>/</span>
              <span className="text-foreground">Message Evaluator</span>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                  <div className="icon-container icon-container-lg bg-pillar-authority/10">
                    <FileText className="w-6 h-6 text-pillar-authority" />
                  </div>
                  Message Evaluator
                </h1>
                <p className="text-muted-foreground mt-1 ml-14">
                  Analyze existing messages using the five-pillar persuasion framework
                </p>
              </div>
              <AIBadge />
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Library Navigation */}
          <LibraryNav mode="messages" />

          {/* Input Card */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Message Context</CardTitle>
              <CardDescription>
                Set the context for your message to get accurate evaluation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Step 1: Institutional Profile */}
              <BuilderStepSection
                stepNumber={1}
                title="Select Your Profile"
                description="Choose the institutional profile for evaluation"
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

              {/* Step 2: Brand Layer */}
              <BuilderStepSection
                stepNumber={2}
                title="Brand Layer"
                description="Apply your brand voice for evaluation scoring"
                helpText="When enabled, the evaluator will compare your message against your brand voice, platform elements, and custom guidelines."
                icon={<Target className="w-4 h-4" />}
              >
                <div className="space-y-4">
                  <ContentDNAIndicator
                    enabled={useContentDNA}
                    onToggle={setUseContentDNA}
                    selectedProfileId={selectedProfileId}
                    selectedProfileName={selectedProfileName}
                  />

                  {useContentDNA && contentDNA?.brandPlatform && (
                    <BrandLayerSelector
                      brandPlatform={contentDNA.brandPlatform}
                      selection={brandSelection}
                      onSelectionChange={setBrandSelection}
                      isLoading={isContentDNALoading}
                      compact
                    />
                  )}

                  <ContentDNAExplainer
                    context="evaluator"
                    defaultOpen={false}
                    collapsible={true}
                    showManageLink={true}
                  />
                </div>
              </BuilderStepSection>

              {/* Step 3: Audience & Context */}
              <BuilderStepSection
                stepNumber={3}
                title="Define Your Audience"
                description="Who is this message for and what's the situation?"
                icon={<Users className="w-4 h-4" />}
              >
                <ContextSelector context={context} onChange={setContext} mode="evaluator" />
              </BuilderStepSection>

              {/* Step 4: Message Content */}
              <BuilderStepSection
                stepNumber={4}
                title="Your Message"
                description="Paste or type the message you want to evaluate"
                icon={<FileText className="w-4 h-4" />}
              >
                <MessageInput 
                  value={messageContent} 
                  onChange={setMessageContent} 
                />
              </BuilderStepSection>

              {/* Urgency & Deadline Section */}
              <div className="space-y-3 pt-2 border-t border-border">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-destructive" />
                  Urgency & Deadline (Optional)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="urgency-label-eval" className="text-xs text-muted-foreground">Deadline Label</Label>
                    <Input
                      id="urgency-label-eval"
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
                    Evaluation will consider countdown language and urgency relative to this deadline.
                  </p>
                )}
              </div>
              
              {!canProcess && messageContent.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  <span>Please enter at least 20 characters for evaluation.</span>
                </div>
              )}

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
                  {evaluationResult && (
                    <Button variant="outline" onClick={handleReset}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      New Evaluation
                    </Button>
                  )}
                  <Button 
                    onClick={handleEvaluate}
                    disabled={!canProcess || isProcessing}
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Evaluate Message
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {evaluationResult && (
            <div className="animate-fade-in">
              <EvaluationResults result={evaluationResult} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EvaluatePage;
