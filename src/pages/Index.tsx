import { useState } from "react";
import { Header } from "@/components/Header";
import { ContextSelector } from "@/components/ContextSelector";
import { MessageInput } from "@/components/MessageInput";
import { EvaluationResults } from "@/components/EvaluationResults";
import { ResearchFoundation } from "@/components/ResearchFoundation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Brain, 
  Target,
  AlertCircle
} from "lucide-react";
import { evaluateMessage } from "@/lib/evaluateMessage";
import type { MessageContext, EvaluationResult } from "@/types/persist";

const Index = () => {
  const { toast } = useToast();
  const [messageContent, setMessageContent] = useState("");
  const [context, setContext] = useState<MessageContext>({
    audience: 'first-year',
    moment: 'early-term',
    channel: 'email',
  });
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleEvaluate = async () => {
    if (!messageContent.trim()) return;
    
    setIsEvaluating(true);
    setResult(null);
    
    try {
      const evaluation = await evaluateMessage(messageContent, context);
      setResult(evaluation);
      toast({
        title: "Evaluation Complete",
        description: "Your message has been analyzed using the five-pillar framework.",
      });
    } catch (error) {
      console.error("Evaluation failed:", error);
      toast({
        variant: "destructive",
        title: "Evaluation Failed",
        description: error instanceof Error ? error.message : "Failed to evaluate message. Please try again.",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const canEvaluate = messageContent.trim().length > 20;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 animate-fade-in">
              Evaluate Student Messages with Research-Backed Insights
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
              PERSIST analyzes your student-facing communications using peer-reviewed 
              persuasion research tested in higher education contexts.
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
          
          {/* Input Section */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                Message Evaluation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ContextSelector context={context} onChange={setContext} />
              
              <Separator />
              
              <MessageInput 
                value={messageContent} 
                onChange={setMessageContent} 
              />

              {!canEvaluate && messageContent.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  <span>Please enter at least 20 characters for evaluation.</span>
                </div>
              )}

              <Button 
                onClick={handleEvaluate}
                disabled={!canEvaluate || isEvaluating}
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                {isEvaluating ? (
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
            </CardContent>
          </Card>

          {/* Results Section */}
          {result && (
            <div className="animate-fade-in">
              <EvaluationResults result={result} />
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
    </div>
  );
};

export default Index;
