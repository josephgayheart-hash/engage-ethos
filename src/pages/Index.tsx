import { useState } from "react";
import { Header } from "@/components/Header";
import { ModeSelector } from "@/components/ModeSelector";
import { ContextSelector } from "@/components/ContextSelector";
import { MessageInput } from "@/components/MessageInput";
import { EvaluationResults } from "@/components/EvaluationResults";
import { BuilderResults } from "@/components/BuilderResults";
import { MapperResults } from "@/components/MapperResults";
import { InstitutionalConfig } from "@/components/InstitutionalConfig";
import { ResearchFoundation } from "@/components/ResearchFoundation";
import { CreateTemplateDialog } from "@/components/library/CreateTemplateDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Brain, 
  Target,
  AlertCircle,
  Save
} from "lucide-react";
import { evaluateMessage, buildMessage, mapMessages } from "@/lib/evaluateMessage";
import type { 
  MessageContext, 
  EvaluationResult, 
  BuilderResult, 
  MapperResult,
  OperationMode,
  InstitutionalConfig as InstitutionalConfigType 
} from "@/types/persist";

const Index = () => {
  const { toast } = useToast();
  const { addMessage } = useMessageLibrary();
  const { addTemplate } = useSharedLibrary();
  const [mode, setMode] = useState<OperationMode>('evaluator');
  const [messageContent, setMessageContent] = useState("");
  const [context, setContext] = useState<MessageContext>({
    audience: 'first-year',
    moment: 'early-term',
    channel: 'email',
  });
  const [institutionalConfig, setInstitutionalConfig] = useState<InstitutionalConfigType>({});
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [builderResult, setBuilderResult] = useState<BuilderResult | null>(null);
  const [mapperResult, setMapperResult] = useState<MapperResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [submitToSharedOpen, setSubmitToSharedOpen] = useState(false);
  const [draftToSubmit, setDraftToSubmit] = useState('');

  const clearResults = () => {
    setEvaluationResult(null);
    setBuilderResult(null);
    setMapperResult(null);
  };

  const handleModeChange = (newMode: OperationMode) => {
    setMode(newMode);
    clearResults();
  };

  const saveToLibrary = (content: string, title: string, mode: 'evaluated' | 'generated', senderRecommendation?: string) => {
    addMessage({
      title,
      content,
      channel: context.channel,
      audience: context.audience,
      cohort: context.cohort ? [context.cohort] : undefined,
      domain: context.domain,
      moment: context.moment,
      goal: context.goal,
      tone: context.tone,
      senderRecommendation,
      approved: false,
      mode,
    });
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    clearResults();
    
    try {
      switch (mode) {
        case 'evaluator':
          if (!messageContent.trim()) return;
          const evalResult = await evaluateMessage(messageContent, context, institutionalConfig);
          setEvaluationResult(evalResult);
          
          if (autoSave) {
            const title = `Evaluated: ${messageContent.slice(0, 40)}${messageContent.length > 40 ? '...' : ''}`;
            saveToLibrary(messageContent, title, 'evaluated');
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
          break;
          
        case 'builder':
          const buildResult = await buildMessage(context, institutionalConfig);
          setBuilderResult(buildResult);
          
          if (autoSave && buildResult.drafts.length > 0) {
            const title = `Generated: ${context.domain || context.moment} ${context.audience} message`;
            saveToLibrary(buildResult.drafts[0], title, 'generated', buildResult.recommendedSender);
            toast({
              title: "Messages Generated",
              description: "Draft saved to your library.",
            });
          } else {
            toast({
              title: "Messages Generated",
              description: "Draft messages have been created based on your context.",
            });
          }
          break;
          
        case 'mapper':
          const mapResult = await mapMessages(context, institutionalConfig);
          setMapperResult(mapResult);
          toast({
            title: "Strategy Generated",
            description: "Your messaging strategy map is ready.",
          });
          break;
      }
    } catch (error) {
      console.error("Processing failed:", error);
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const canProcess = mode === 'evaluator' 
    ? messageContent.trim().length > 20 
    : context.audience && context.moment && context.channel;

  const getButtonText = () => {
    if (isProcessing) return 'Processing...';
    switch (mode) {
      case 'evaluator': return 'Evaluate Message';
      case 'builder': return 'Generate Messages';
      case 'mapper': return 'Create Strategy Map';
      case 'customization': return 'Save Configuration';
      default: return 'Process';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 animate-fade-in">
              Messaging Intelligence for Higher Education
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
              PERSIST helps you design, evaluate, and plan student-facing communication 
              using peer-reviewed research tested in higher education contexts.
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <Shield className="w-4 h-4" />
                <span>Evidence-Based</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <Brain className="w-4 h-4" />
                <span>Cognitively Informed</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <Target className="w-4 h-4" />
                <span>Student-Centered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Mode Selection */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Select Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <ModeSelector mode={mode} onChange={handleModeChange} />
            </CardContent>
          </Card>

          {/* Institutional Config Mode */}
          {mode === 'customization' && (
            <InstitutionalConfig 
              config={institutionalConfig} 
              onChange={setInstitutionalConfig} 
            />
          )}

          {/* Input Section (for non-customization modes) */}
          {mode !== 'customization' && (
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-xl flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-secondary" />
                    {mode === 'evaluator' && 'Message Evaluation'}
                    {mode === 'builder' && 'Message Builder'}
                    {mode === 'mapper' && 'Messaging Strategy'}
                  </CardTitle>
                  {(mode === 'evaluator' || mode === 'builder') && (
                    <Button
                      variant={autoSave ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAutoSave(!autoSave)}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Auto-save {autoSave ? 'On' : 'Off'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ContextSelector context={context} onChange={setContext} mode={mode} />
                
                {mode === 'evaluator' && (
                  <>
                    <Separator />
                    <MessageInput 
                      value={messageContent} 
                      onChange={setMessageContent} 
                    />
                    {!canProcess && messageContent.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="w-4 h-4" />
                        <span>Please enter at least 20 characters for evaluation.</span>
                      </div>
                    )}
                  </>
                )}

                <Button 
                  onClick={handleProcess}
                  disabled={!canProcess || isProcessing}
                  className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {getButtonText()}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {evaluationResult && (
            <div className="animate-fade-in">
              <EvaluationResults result={evaluationResult} />
            </div>
          )}

          {builderResult && (
            <div className="animate-fade-in">
              <BuilderResults 
                result={builderResult} 
                context={context}
                onSaveToLibrary={(content, title) => {
                  saveToLibrary(content, title, 'generated', builderResult.recommendedSender);
                }}
                onSubmitToShared={(content) => {
                  setDraftToSubmit(content);
                  setSubmitToSharedOpen(true);
                }}
              />
            </div>
          )}

          {mapperResult && (
            <div className="animate-fade-in">
              <MapperResults result={mapperResult} />
            </div>
          )}

          {/* Research Foundation */}
          <ResearchFoundation />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              PERSIST — Persuasion Intelligence for Student Engagement
            </p>
            <p className="text-xs text-muted-foreground">
              Research foundation: Gayheart (2021), University of Kentucky
            </p>
          </div>
        </div>
      </footer>

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

export default Index;
