import { useState } from "react";
import { Link } from "react-router-dom";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
  Save,
  FileText,
  PenTool,
  Map,
  Settings,
  FolderOpen,
  Library,
  ChevronRight,
  Clock,
  Mail,
  MessageSquare,
  Users,
  Megaphone,
  Plus
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
  const { messages, addMessage } = useMessageLibrary();
  const { templates, addTemplate } = useSharedLibrary();
  const [mode, setMode] = useState<OperationMode | null>(null);
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

  const recentMessages = messages.slice(0, 3);
  const publishedTemplates = templates.filter(t => t.status === 'published').slice(0, 3);

  const clearResults = () => {
    setEvaluationResult(null);
    setBuilderResult(null);
    setMapperResult(null);
  };

  const handleModeChange = (newMode: OperationMode) => {
    setMode(newMode);
    clearResults();
  };

  const saveToLibrary = (content: string, title: string, msgMode: 'evaluated' | 'generated', senderRecommendation?: string) => {
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
      mode: msgMode,
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

  const modeCards = [
    { 
      id: 'evaluator' as OperationMode, 
      title: 'Evaluate', 
      description: 'Analyze existing messages',
      icon: FileText,
      color: 'text-pillar-authority'
    },
    { 
      id: 'builder' as OperationMode, 
      title: 'Build', 
      description: 'Generate new messages',
      icon: PenTool,
      color: 'text-pillar-cognitive'
    },
    { 
      id: 'mapper' as OperationMode, 
      title: 'Map', 
      description: 'Plan messaging strategy',
      icon: Map,
      color: 'text-pillar-consensus'
    },
    { 
      id: 'customization' as OperationMode, 
      title: 'Configure', 
      description: 'Institutional settings',
      icon: Settings,
      color: 'text-pillar-ethics'
    },
  ];

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      default: return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Compact Hero */}
      <section className="gradient-hero py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-3 animate-fade-in">
              Messaging Intelligence for Higher Education
            </h1>
            <p className="text-base md:text-lg text-primary-foreground/80 mb-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
              Design, evaluate, and distribute student-facing communication using peer-reviewed research.
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

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Quick Actions */}
          <section>
            <h2 className="font-serif text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {modeCards.map((card) => {
                const Icon = card.icon;
                const isActive = mode === card.id;
                return (
                  <Card 
                    key={card.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${isActive ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                    onClick={() => handleModeChange(card.id)}
                  >
                    <CardContent className="p-4">
                      <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3 ${isActive ? 'bg-primary/20' : ''}`}>
                        <Icon className={`w-5 h-5 ${card.color}`} />
                      </div>
                      <h3 className="font-semibold text-sm">{card.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Libraries Section */}
          <section className="grid md:grid-cols-2 gap-6">
            {/* My Library */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-secondary" />
                    <CardTitle className="font-serif text-lg">My Library</CardTitle>
                  </div>
                  <Link to="/library">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View All <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
                <CardDescription className="text-xs">Your saved messages and drafts</CardDescription>
              </CardHeader>
              <CardContent>
                {recentMessages.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No messages saved yet</p>
                    <p className="text-xs mt-1">Start by evaluating or building a message</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentMessages.map((msg) => {
                      const ChannelIcon = getChannelIcon(msg.channel);
                      return (
                        <div key={msg.id} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium truncate">{msg.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs px-1.5 py-0">
                                  <ChannelIcon className="w-3 h-3 mr-1" />
                                  {msg.channel}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(msg.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Badge variant={msg.mode === 'generated' ? 'default' : 'secondary'} className="text-xs shrink-0">
                              {msg.mode}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shared Library */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Library className="w-5 h-5 text-primary" />
                    <CardTitle className="font-serif text-lg">Shared Library</CardTitle>
                  </div>
                  <Link to="/shared-library">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Browse All <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
                <CardDescription className="text-xs">Institutional playbooks and templates</CardDescription>
              </CardHeader>
              <CardContent>
                {publishedTemplates.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No published playbooks yet</p>
                    <p className="text-xs mt-1">Visit the Admin panel to create and distribute</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {publishedTemplates.map((template) => (
                      <div key={template.id} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{template.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {template.playbook && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0">
                                  {template.playbook}
                                </Badge>
                              )}
                              {template.collegeName && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {template.collegeName}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant="default" className="text-xs shrink-0 flex items-center gap-1">
                            <Megaphone className="w-3 h-3" />
                            published
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Workspace Section */}
          {mode && (
            <section className="space-y-6">
              <Separator />
              
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
                      <div className="flex items-center gap-2">
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
                        <Button variant="ghost" size="sm" onClick={() => setMode(null)}>
                          Close
                        </Button>
                      </div>
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
                    institutionalConfig={institutionalConfig}
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
            </section>
          )}

          {/* Research Foundation - only show when not in workspace mode */}
          {!mode && <ResearchFoundation />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              PERSIST — Persuasion Intelligence for Student Engagement
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link to="/admin" className="hover:text-foreground transition-colors">
                Admin Panel
              </Link>
              <span>•</span>
              <span>Research: Gayheart (2021), University of Kentucky</span>
            </div>
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
