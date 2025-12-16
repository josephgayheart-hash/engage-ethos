import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { ContextSelector } from "@/components/ContextSelector";
import { StrategyJourneyDisplay } from "@/components/StrategyJourney";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AIBadge } from "@/components/ui/ai-indicator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Map, RefreshCw, Calendar } from "lucide-react";
import { mapMessages } from "@/lib/evaluateMessage";
import type { MessageContext, MapperResult } from "@/types/persist";

const StrategyPage = () => {
  const { toast } = useToast();
  const [context, setContext] = useState<MessageContext>({
    audience: 'first-year',
    moment: 'early-term',
    channel: 'email',
  });
  const [journeyWeeks, setJourneyWeeks] = useState(12);
  const [mapperResult, setMapperResult] = useState<MapperResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const canProcess = context.audience && context.moment && context.channel;

  const handleGenerateStrategy = async () => {
    if (!canProcess) return;
    
    setIsProcessing(true);
    setMapperResult(null);
    
    try {
      const result = await mapMessages(context, undefined, journeyWeeks);
      setMapperResult(result);
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
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
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
                Message Strategy Journey
              </h1>
              <p className="text-muted-foreground mt-1">
                Generate a detailed week-by-week communication plan with behavioral nudges and channel recommendations
              </p>
            </div>
            <AIBadge />
          </div>

          {/* Context Card */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Journey Configuration</CardTitle>
              <CardDescription>
                Define your audience, goals, and timeline to generate a comprehensive messaging strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ContextSelector context={context} onChange={setContext} mode="mapper" />

              {/* Journey Duration */}
              <div className="flex items-end gap-4 pt-2 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="journey-weeks" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Journey Duration (weeks)
                  </Label>
                  <Input
                    id="journey-weeks"
                    type="number"
                    min={4}
                    max={52}
                    value={journeyWeeks}
                    onChange={(e) => setJourneyWeeks(Number(e.target.value))}
                    className="w-24"
                  />
                </div>
                <p className="text-sm text-muted-foreground pb-2">
                  Typical journeys: 8-12 weeks (enrollment), 16 weeks (semester), 32+ weeks (year-long)
                </p>
              </div>

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
            </CardContent>
          </Card>

          {/* Results */}
          {mapperResult?.journey && (
            <div className="animate-fade-in">
              <StrategyJourneyDisplay journey={mapperResult.journey} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StrategyPage;
