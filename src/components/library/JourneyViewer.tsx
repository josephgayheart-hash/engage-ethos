import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useInstitutionalConfig } from "@/hooks/useInstitutionalConfig";
import { supabase } from "@/integrations/supabase/client";
import { JourneyFlowDiagram } from "@/components/JourneyFlowDiagram";
import { 
  Mail, 
  MessageSquare, 
  Globe, 
  Phone,
  Share2,
  FileText,
  Target,
  Calendar,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Map,
  List,
  Megaphone
} from "lucide-react";
import type { StrategyJourney, Channel, StrategyPhase, JourneyTouchpoint, MessageContext } from "@/types/persist";

// Metadata stored with saved journeys
interface JourneyMetadata {
  context?: Partial<MessageContext>;
  startDate?: string;
  endDate?: string;
  channels?: string[];
}

interface JourneyViewerProps {
  journey: StrategyJourney & { _metadata?: JourneyMetadata };
  allowGeneration?: boolean;
}

const channelIcons: Record<Channel, React.ReactNode> = {
  'email': <Mail className="w-4 h-4" />,
  'sms': <MessageSquare className="w-4 h-4" />,
  'portal': <Globe className="w-4 h-4" />,
  'landing-page': <FileText className="w-4 h-4" />,
  'social-media': <Share2 className="w-4 h-4" />,
  'direct-mail': <FileText className="w-4 h-4" />,
  'phone-call': <Phone className="w-4 h-4" />,
  'digital-ad-search': <Target className="w-4 h-4" />,
  'digital-ad-social': <Megaphone className="w-4 h-4" />,
};

const formatChannelName = (channel: string): string => {
  if (channel === 'sms') return 'SMS';
  return channel.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const phaseColors: Record<StrategyPhase, string> = {
  'short-term': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
  'mid-term': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
  'long-term': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200',
};

const phaseBorderColors: Record<StrategyPhase, string> = {
  'short-term': 'border-l-emerald-500',
  'mid-term': 'border-l-amber-500',
  'long-term': 'border-l-violet-500',
};

export function JourneyViewer({ journey, allowGeneration = true }: JourneyViewerProps) {
  const { toast } = useToast();
  const { config: institutionalConfig } = useInstitutionalConfig();
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [selectedTouchpoint, setSelectedTouchpoint] = useState<JourneyTouchpoint | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'diagram' | 'timeline'>('diagram');

  // Extract metadata if available
  const metadata = journey._metadata;
  const context = metadata?.context;
  const startDate = metadata?.startDate;
  const endDate = metadata?.endDate;

  // Calculate analytics
  const analytics = journey.touchpoints.reduce((acc, tp) => {
    acc[tp.channel] = (acc[tp.channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleGenerateMessage = async (touchpoint: JourneyTouchpoint, index: number) => {
    setGeneratingIndex(index);
    setSelectedTouchpoint(touchpoint);
    setGeneratedMessage(null);
    setCopied(false);

    try {
      const { data, error } = await supabase.functions.invoke('generate-message', {
        body: {
          type: 'touchpoint',
          touchpoint: {
            title: touchpoint.title,
            description: touchpoint.description,
            channel: touchpoint.channel,
            domain: touchpoint.domain,
            tone: touchpoint.tone,
            goal: touchpoint.goal,
            behavioralNudge: touchpoint.behavioralNudge,
            week: touchpoint.week,
            phase: touchpoint.phase,
          },
          institutionalConfig
        }
      });

      if (error) throw error;
      
      if (data?.message) {
        setGeneratedMessage(data.message);
      }
    } catch (error) {
      console.error("Generation failed:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate message for this touchpoint.",
      });
      setSelectedTouchpoint(null);
    } finally {
      setGeneratingIndex(null);
    }
  };

  const handleCopy = async () => {
    if (generatedMessage) {
      await navigator.clipboard.writeText(generatedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = () => {
    if (selectedTouchpoint) {
      const index = journey.touchpoints.findIndex(tp => 
        tp.title === selectedTouchpoint.title && tp.week === selectedTouchpoint.week
      );
      if (index !== -1) {
        handleGenerateMessage(selectedTouchpoint, index);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'diagram' | 'timeline')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="diagram" className="flex items-center gap-1.5">
            <Map className="w-4 h-4" />
            Diagram
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-1.5">
            <List className="w-4 h-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Diagram View */}
        <TabsContent value="diagram" className="mt-4">
          <JourneyFlowDiagram 
            journey={journey} 
            context={context as MessageContext | undefined}
            startDate={startDate}
            endDate={endDate}
          />
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline" className="mt-4 space-y-4">
          {/* Analytics Summary */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {Object.entries(analytics).map(([channel, count]) => (
              <div key={channel} className="bg-muted/50 rounded-lg p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  {channelIcons[channel as Channel]}
                  <span className="text-xs">{formatChannelName(channel)}</span>
                </div>
                <p className="text-lg font-bold">{count as number}</p>
              </div>
            ))}
            <div className="bg-primary/10 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Weeks</span>
              </div>
              <p className="text-lg font-bold text-primary">{journey.totalWeeks}</p>
            </div>
          </div>

          {/* Overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Strategy Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{journey.overview}</p>
            </CardContent>
          </Card>

          {/* Phases */}
          <div className="grid md:grid-cols-3 gap-3">
            {journey.phases.map((phase) => (
              <Card key={phase.phase} className={`border-l-4 ${phaseBorderColors[phase.phase]}`}>
                <CardHeader className="pb-2">
                  <Badge className={`w-fit text-xs ${phaseColors[phase.phase]}`}>
                    {phase.weekRange}
                  </Badge>
                  <CardTitle className="text-sm mt-1">{phase.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground">{phase.focus}</p>
                  <div className="space-y-1">
                    {phase.keyObjectives.slice(0, 2).map((obj, i) => (
                      <div key={i} className="flex items-start gap-1 text-xs">
                        <ArrowRight className="w-3 h-3 mt-0.5 text-muted-foreground shrink-0" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Touchpoints Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Journey Touchpoints ({journey.touchpoints.length})
              </CardTitle>
              {allowGeneration && (
                <CardDescription className="text-xs">
                  Click the sparkle icon to generate AI-powered message content for each touchpoint
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
                
                {journey.touchpoints.map((touchpoint, index) => (
                  <div key={index} className="relative">
                    <div className={`absolute -left-4 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold ${
                      touchpoint.phase === 'short-term' ? 'bg-emerald-500 text-white' :
                      touchpoint.phase === 'mid-term' ? 'bg-amber-500 text-white' :
                      'bg-violet-500 text-white'
                    }`}>
                      {touchpoint.week}
                    </div>
                    
                    <div className={`border-l-2 ${phaseBorderColors[touchpoint.phase]} pl-3 py-2`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{touchpoint.title}</span>
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          {channelIcons[touchpoint.channel]}
                          {formatChannelName(touchpoint.channel)}
                        </Badge>
                        {allowGeneration && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 px-3 text-xs font-medium shadow-sm hover:shadow-md transition-all border border-secondary-foreground/20"
                            onClick={() => handleGenerateMessage(touchpoint, index)}
                            disabled={generatingIndex === index}
                          >
                            {generatingIndex === index ? (
                              <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                            ) : (
                              <Sparkles className="w-3 h-3 mr-1" />
                            )}
                            {generatingIndex === index ? 'Generating...' : 'Generate Copy'}
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{touchpoint.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">{touchpoint.domain}</Badge>
                        <Badge variant="outline" className="text-xs">{touchpoint.tone}</Badge>
                        <Badge variant="outline" className="text-xs">{touchpoint.goal}</Badge>
                      </div>
                      
                      {touchpoint.behavioralNudge && (
                        <div className="flex items-start gap-1 mt-2 text-xs text-muted-foreground">
                          <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                          <span>{touchpoint.behavioralNudge}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risks & Metrics */}
          <div className="grid md:grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {journey.risks.map((risk, i) => (
                    <li key={i} className="text-xs flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Success Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {journey.successMetrics.map((metric, i) => (
                    <li key={i} className="text-xs flex items-start gap-2">
                      <span className="text-emerald-500">•</span>
                      {metric}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Generated Message Dialog */}
      <Dialog open={!!selectedTouchpoint && !!generatedMessage} onOpenChange={() => {
        setSelectedTouchpoint(null);
        setGeneratedMessage(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              Generated Message: {selectedTouchpoint?.title}
            </DialogTitle>
            <DialogDescription>
              Week {selectedTouchpoint?.week} • {selectedTouchpoint?.channel && formatChannelName(selectedTouchpoint.channel)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm font-sans">{generatedMessage}</pre>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={generatingIndex !== null}>
                <RefreshCw className={`w-4 h-4 mr-1 ${generatingIndex !== null ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper to check if content is a journey JSON
export function isJourneyContent(content: string): boolean {
  try {
    const parsed = JSON.parse(content);
    return parsed && parsed.touchpoints && parsed.phases && parsed.overview;
  } catch {
    return false;
  }
}

// Helper to parse journey content
export function parseJourneyContent(content: string): StrategyJourney | null {
  try {
    const parsed = JSON.parse(content);
    if (parsed.touchpoints && parsed.phases && parsed.overview) {
      return parsed as StrategyJourney;
    }
    return null;
  } catch {
    return null;
  }
}
