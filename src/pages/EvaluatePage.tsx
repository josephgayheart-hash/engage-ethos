import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { ContextSelector } from "@/components/ContextSelector";
import { MessageInput } from "@/components/MessageInput";
import { EvaluationResults } from "@/components/EvaluationResults";
import { LibraryNav } from "@/components/LibraryNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AIBadge } from "@/components/ui/ai-indicator";
import { useToast } from "@/hooks/use-toast";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { ArrowLeft, ArrowRight, FileText, AlertCircle, Save, RefreshCw } from "lucide-react";
import { evaluateMessage } from "@/lib/evaluateMessage";
import type { MessageContext, EvaluationResult, InstitutionalConfig } from "@/types/persist";

const EvaluatePage = () => {
  const { toast } = useToast();
  const { addMessage } = useMessageLibrary();
  const [messageContent, setMessageContent] = useState("");
  const [context, setContext] = useState<MessageContext>({
    audience: 'first-year',
    moment: 'early-term',
    channel: 'email',
  });
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  const canProcess = messageContent.trim().length > 20;

  const handleEvaluate = async () => {
    if (!canProcess) return;
    
    setIsProcessing(true);
    setEvaluationResult(null);
    
    try {
      const result = await evaluateMessage(messageContent, context);
      setEvaluationResult(result);
      
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
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
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
                <FileText className="w-7 h-7 text-pillar-authority" />
                Message Evaluator
              </h1>
              <p className="text-muted-foreground mt-1">
                Analyze existing messages using the five-pillar persuasion framework
              </p>
            </div>
            <AIBadge />
          </div>

          {/* Library Navigation */}
          <LibraryNav mode="messages" />

          {/* Input Card */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Message Context</CardTitle>
              <CardDescription>
                Set the context for your message to get accurate evaluation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ContextSelector context={context} onChange={setContext} mode="evaluator" />
              
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
