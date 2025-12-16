import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { ContextSelector } from "@/components/ContextSelector";
import { MapperResults } from "@/components/MapperResults";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIBadge } from "@/components/ui/ai-indicator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Map, RefreshCw } from "lucide-react";
import { mapMessages } from "@/lib/evaluateMessage";
import type { MessageContext, MapperResult } from "@/types/persist";

const StrategyPage = () => {
  const { toast } = useToast();
  const [context, setContext] = useState<MessageContext>({
    audience: 'first-year',
    moment: 'early-term',
    channel: 'email',
  });
  const [mapperResult, setMapperResult] = useState<MapperResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const canProcess = context.audience && context.moment && context.channel;

  const handleGenerateStrategy = async () => {
    if (!canProcess) return;
    
    setIsProcessing(true);
    setMapperResult(null);
    
    try {
      const result = await mapMessages(context);
      setMapperResult(result);
      toast({
        title: "Strategy Generated",
        description: "Your messaging strategy map is ready.",
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
            <span className="text-foreground">Message Strategy</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <Map className="w-7 h-7 text-pillar-consensus" />
                Message Strategy
              </h1>
              <p className="text-muted-foreground mt-1">
                Plan messaging strategy across goals, domains, and timing
              </p>
            </div>
            <AIBadge />
          </div>

          {/* Context Card */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Strategy Context</CardTitle>
              <CardDescription>
                Define your audience and timing to generate a strategic messaging plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ContextSelector context={context} onChange={setContext} mode="mapper" />

              <div className="flex justify-end gap-2">
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
                      Planning...
                    </>
                  ) : (
                    <>
                      Create Strategy Map
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {mapperResult && (
            <div className="animate-fade-in">
              <MapperResults result={mapperResult} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StrategyPage;
