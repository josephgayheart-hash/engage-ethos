import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AIIndicator } from "@/components/ui/ai-indicator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Mail, 
  MessageSquare, 
  Globe, 
  Phone,
  Share2,
  FileText,
  AlertTriangle,
  Target,
  TrendingUp,
  Lightbulb,
  Calendar,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import type { StrategyJourney, Channel, StrategyPhase, JourneyTouchpoint, MessageContext } from "@/types/persist";

interface StrategyJourneyProps {
  journey: StrategyJourney;
  context: MessageContext;
}

interface GeneratedMessage {
  touchpointIndex: number;
  channel: Channel;
  content: string;
}

const channelIcons: Record<Channel, React.ReactNode> = {
  'email': <Mail className="w-4 h-4" />,
  'sms': <MessageSquare className="w-4 h-4" />,
  'portal': <Globe className="w-4 h-4" />,
  'landing-page': <FileText className="w-4 h-4" />,
  'social-media': <Share2 className="w-4 h-4" />,
  'direct-mail': <FileText className="w-4 h-4" />,
  'phone-call': <Phone className="w-4 h-4" />,
};

const phaseColors: Record<StrategyPhase, string> = {
  'short-term': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-300',
  'mid-term': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border-amber-300',
  'long-term': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200 border-violet-300',
};

const phaseBgColors: Record<StrategyPhase, string> = {
  'short-term': 'border-l-emerald-500',
  'mid-term': 'border-l-amber-500',
  'long-term': 'border-l-violet-500',
};

const allChannels: Channel[] = ['email', 'sms', 'social-media'];

// Helper to format channel names with proper capitalization
const formatChannelName = (channel: string): string => {
  if (channel === 'sms') return 'SMS';
  return channel.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
};

function TouchpointCard({ 
  touchpoint, 
  index, 
  context,
  generatedMessages,
  onGenerateMessage,
  isGenerating
}: { 
  touchpoint: JourneyTouchpoint; 
  index: number;
  context: MessageContext;
  generatedMessages: GeneratedMessage[];
  onGenerateMessage: (index: number, channels: Channel[]) => void;
  isGenerating: number | null;
}) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([touchpoint.channel]);

  const thisMessages = generatedMessages.filter(m => m.touchpointIndex === index);

  const handleCopy = async (content: string, channel: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedChannel(channel);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedChannel(null), 2000);
  };

  const toggleChannel = (channel: Channel) => {
    setSelectedChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const selectAllChannels = () => {
    setSelectedChannels(allChannels);
  };

  return (
    <div className="relative pl-12">
      {/* Timeline dot */}
      <div className={`absolute left-2 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold ${
        touchpoint.phase === 'short-term' ? 'bg-emerald-500 text-white' :
        touchpoint.phase === 'mid-term' ? 'bg-amber-500 text-white' :
        'bg-violet-500 text-white'
      }`}>
        {touchpoint.week}
      </div>
      
      <Card className={`border-l-4 ${phaseBgColors[touchpoint.phase]}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base font-medium">
              Week {touchpoint.week}: {touchpoint.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                {channelIcons[touchpoint.channel]}
                {formatChannelName(touchpoint.channel)}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {touchpoint.domain}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {touchpoint.description}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Behavioral Nudge
              </p>
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm">{touchpoint.behavioralNudge}</p>
              </div>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Goal & Tone
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize text-xs">
                  {touchpoint.goal}
                </Badge>
                <Badge variant="outline" className="capitalize text-xs">
                  {touchpoint.tone}
                </Badge>
              </div>
            </div>
          </div>

          {touchpoint.sampleSubject && (
            <div className="p-3 border border-dashed border-border rounded-lg">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Sample Subject Line
              </p>
              <p className="text-sm font-medium">{touchpoint.sampleSubject}</p>
            </div>
          )}

          {touchpoint.keyMessage && (
            <div className="p-3 border border-dashed border-border rounded-lg">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Key Message
              </p>
              <p className="text-sm italic">"{touchpoint.keyMessage}"</p>
            </div>
          )}

          {/* Generate Message Section */}
          <div className="pt-3 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="text-sm"
              >
                {expanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                {expanded ? 'Hide' : 'Generate'} Message Copy
              </Button>
            </div>

            {expanded && (
              <div className="space-y-3 animate-fade-in">
                {/* Channel Selection */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Channels:</span>
                  {allChannels.map(channel => (
                    <Badge
                      key={channel}
                      variant={selectedChannels.includes(channel) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleChannel(channel)}
                    >
                      {channelIcons[channel]}
                      <span className="ml-1">{formatChannelName(channel)}</span>
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" onClick={selectAllChannels}>
                    All
                  </Button>
                </div>

                <Button
                  onClick={() => onGenerateMessage(index, selectedChannels)}
                  disabled={isGenerating === index || selectedChannels.length === 0}
                  size="sm"
                  className="w-full"
                >
                  {isGenerating === index ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate for {selectedChannels.length} channel{selectedChannels.length > 1 ? 's' : ''}
                      <AIIndicator className="ml-2" />
                    </>
                  )}
                </Button>

                {/* Generated Messages */}
                {thisMessages.length > 0 && (
                  <div className="space-y-3">
                    {thisMessages.map((msg, i) => (
                      <div key={i} className="p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            {channelIcons[msg.channel]}
                            {formatChannelName(msg.channel)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(msg.content, msg.channel)}
                          >
                            {copiedChannel === msg.channel ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <Textarea 
                          value={msg.content} 
                          readOnly 
                          className="min-h-[100px] text-sm bg-background"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export function StrategyJourneyDisplay({ journey, context }: StrategyJourneyProps) {
  const { toast } = useToast();
  const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState<number | null>(null);

  // Calculate analytics from touchpoints
  const analytics = journey.touchpoints.reduce((acc, tp) => {
    acc[tp.channel] = (acc[tp.channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleGenerateMessage = async (touchpointIndex: number, channels: Channel[]) => {
    const touchpoint = journey.touchpoints[touchpointIndex];
    setIsGenerating(touchpointIndex);

    try {
      const { data, error } = await supabase.functions.invoke('generate-message', {
        body: {
          type: 'touchpoint',
          touchpoint,
          channels,
          context,
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const newMessages: GeneratedMessage[] = data.messages.map((msg: { channel: Channel; content: string }) => ({
        touchpointIndex,
        channel: msg.channel,
        content: msg.content,
      }));

      setGeneratedMessages(prev => [
        ...prev.filter(m => m.touchpointIndex !== touchpointIndex || !channels.includes(m.channel)),
        ...newMessages
      ]);

      toast({
        title: "Messages Generated",
        description: `Generated ${newMessages.length} message${newMessages.length > 1 ? 's' : ''} for this touchpoint.`,
      });
    } catch (error) {
      console.error("Message generation failed:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Object.entries(analytics).map(([channel, count]) => (
          <Card key={channel} className="bg-muted/30">
            <CardContent className="py-4 px-4 text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                {channelIcons[channel as Channel]}
                <span className="text-xs font-medium uppercase tracking-wide">
                  {formatChannelName(channel)}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{count}</p>
            </CardContent>
          </Card>
        ))}
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="py-4 px-4 text-center">
            <div className="flex items-center justify-center gap-2 text-primary mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Weeks</span>
            </div>
            <p className="text-2xl font-bold text-primary">{journey.totalWeeks}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/10 border-secondary/20">
          <CardContent className="py-4 px-4 text-center">
            <div className="flex items-center justify-center gap-2 text-secondary mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Touchpoints</span>
            </div>
            <p className="text-2xl font-bold text-secondary">{journey.touchpoints.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Overview */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Strategy Overview
          </CardTitle>
          <CardDescription>
            {journey.totalWeeks}-week communication journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {journey.overview}
          </p>
        </CardContent>
      </Card>

      {/* Phase Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {journey.phases.map((phase) => (
          <Card key={phase.phase} className={`border-l-4 ${phaseBgColors[phase.phase]}`}>
            <CardHeader className="pb-2">
              <Badge className={`w-fit ${phaseColors[phase.phase]}`}>
                {phase.weekRange}
              </Badge>
              <CardTitle className="text-lg font-medium mt-2">{phase.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{phase.focus}</p>
              <div className="space-y-1">
                {phase.keyObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="w-3 h-3 mt-1 text-muted-foreground shrink-0" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Journey Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary" />
            Week-by-Week Journey
          </CardTitle>
          <CardDescription>
            Click "Generate Message Copy" on any touchpoint to create ready-to-use messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            
            <div className="space-y-6">
              {journey.touchpoints.map((touchpoint, index) => (
                <TouchpointCard
                  key={index}
                  touchpoint={touchpoint}
                  index={index}
                  context={context}
                  generatedMessages={generatedMessages}
                  onGenerateMessage={handleGenerateMessage}
                  isGenerating={isGenerating}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risks & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Risks to Monitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {journey.risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-500">•</span>
                  {risk}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Success Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {journey.successMetrics.map((metric, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-emerald-500">•</span>
                  {metric}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
