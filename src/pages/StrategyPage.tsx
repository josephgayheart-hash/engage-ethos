import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { ContextSelector } from "@/components/ContextSelector";
import { StrategyJourneyDisplay } from "@/components/StrategyJourney";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AIBadge } from "@/components/ui/ai-indicator";
import { useToast } from "@/hooks/use-toast";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { ArrowLeft, ArrowRight, Map, RefreshCw, Calendar, Save, Share2, BookMarked } from "lucide-react";
import { mapMessages } from "@/lib/evaluateMessage";
import type { MessageContext, MapperResult, Channel } from "@/types/persist";

const channelOptions: { value: Channel; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS/Text' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'portal', label: 'Portal' },
  { value: 'direct-mail', label: 'Direct Mail' },
  { value: 'phone-call', label: 'Phone Call' },
];

const StrategyPage = () => {
  const { toast } = useToast();
  const { addMessage } = useMessageLibrary();
  const { addTemplate } = useSharedLibrary();
  const [context, setContext] = useState<MessageContext>({
    audience: 'first-year',
    moment: 'early-term',
    channel: 'email',
  });
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(['email', 'sms']);
  const [journeyWeeks, setJourneyWeeks] = useState(12);
  const [mapperResult, setMapperResult] = useState<MapperResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleGenerateStrategy = async () => {
    if (!canProcess) return;
    
    setIsProcessing(true);
    setMapperResult(null);
    
    try {
      // Use the first selected channel for the context
      const contextWithChannels = { ...context, channel: selectedChannels[0], channels: selectedChannels };
      const result = await mapMessages(contextWithChannels, undefined, journeyWeeks);
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

  const handleSaveToLibrary = () => {
    if (!mapperResult?.journey) return;

    const journeyContent = JSON.stringify(mapperResult.journey, null, 2);
    const title = `Strategy Journey: ${context.audience} - ${context.moment} (${journeyWeeks} weeks)`;
    
    addMessage({
      title,
      content: journeyContent,
      channel: context.channel,
      audience: context.audience,
      cohort: context.cohort ? [context.cohort] : undefined,
      domain: context.domain,
      moment: context.moment,
      goal: context.goal,
      tone: context.tone,
      approved: false,
      mode: 'generated',
    });

    toast({
      title: "Saved to Personal Library",
      description: "Your strategy journey has been saved.",
    });
  };

  const handleShareToLibrary = () => {
    if (!mapperResult?.journey) return;

    const journey = mapperResult.journey;
    
    addTemplate({
      title: `Strategy Journey: ${context.audience} - ${context.moment}`,
      intentStatement: journey.overview,
      content: JSON.stringify(journey, null, 2),
      playbook: 'Strategy Journeys',
      owner: 'Current User',
      maintainer: 'Current User',
      status: 'submitted' as const,
      version: '1.0',
      requiredFields: {
        audience: [context.audience],
        moment: [context.moment],
        channel: selectedChannels,
      },
      useCases: {
        whenToUse: journey.phases.map(p => p.focus),
        whenNotToUse: journey.risks,
      },
      ethicalGuardrails: ['Review all touchpoints before publishing', 'Ensure messaging aligns with institutional voice'],
      placeholders: [],
    });

    toast({
      title: "Submitted for Review",
      description: "Your strategy journey has been submitted to the shared library for admin approval.",
    });
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

              {/* Channel Selection */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Channel Modalities</Label>
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
            <div className="animate-fade-in space-y-6">
              {/* Save/Share Actions */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <BookMarked className="w-5 h-5 text-primary" />
                      <span className="font-medium">Save this journey</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleSaveToLibrary}>
                        <Save className="w-4 h-4 mr-2" />
                        Save to My Library
                      </Button>
                      <Button variant="default" onClick={handleShareToLibrary}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Send to Shared Library
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <StrategyJourneyDisplay journey={mapperResult.journey} context={context} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StrategyPage;
