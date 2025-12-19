import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AIIndicator } from "@/components/ui/ai-indicator";
import { SmsCharCounter } from "@/components/ui/sms-char-counter";
import { useToast } from "@/hooks/use-toast";
import { useInstitutionalConfig } from "@/hooks/useInstitutionalConfig";
import { useContentDNAForGeneration, type ContentDNAForGeneration } from "@/hooks/useContentDNAForGeneration";
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
  ChevronUp,
  Megaphone
} from "lucide-react";
import type { StrategyJourney, Channel, StrategyPhase, JourneyTouchpoint, MessageContext, InstitutionalConfig } from "@/types/uplaybook";

interface StrategyJourneyProps {
  journey: StrategyJourney;
  context: MessageContext;
  startDate?: string;
  endDate?: string;

  /** Institutional profile selection from Journey Designer (prevents cross-institution bleed). */
  selectedProfileId?: string | null;
  selectedProfileName?: string;
  institutionalConfig?: InstitutionalConfig | null;

  /** Whether to apply Content DNA to generation (UI toggle). */
  useContentDNA?: boolean;
  contentDNA?: ContentDNAForGeneration | null;
}

interface GeneratedMessage {
  touchpointIndex: number;
  channel: Channel;
  content: unknown;
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

// Channel colors - matches diagram node colors
const channelColors: Record<Channel, string> = {
  'email': 'bg-blue-500 text-white',
  'sms': 'bg-green-500 text-white',
  'portal': 'bg-orange-500 text-white',
  'landing-page': 'bg-gray-500 text-white',
  'social-media': 'bg-pink-500 text-white',
  'direct-mail': 'bg-gray-500 text-white',
  'phone-call': 'bg-purple-500 text-white',
  'digital-ad-search': 'bg-yellow-500 text-black',
  'digital-ad-social': 'bg-indigo-500 text-white',
};

const channelBorderColors: Record<Channel, string> = {
  'email': 'border-l-blue-500',
  'sms': 'border-l-green-500',
  'portal': 'border-l-orange-500',
  'landing-page': 'border-l-gray-500',
  'social-media': 'border-l-pink-500',
  'direct-mail': 'border-l-gray-500',
  'phone-call': 'border-l-purple-500',
  'digital-ad-search': 'border-l-yellow-500',
  'digital-ad-social': 'border-l-indigo-500',
};

const channelDotColors: Record<Channel, string> = {
  'email': 'bg-blue-500',
  'sms': 'bg-green-500',
  'portal': 'bg-orange-500',
  'landing-page': 'bg-gray-500',
  'social-media': 'bg-pink-500',
  'direct-mail': 'bg-gray-500',
  'phone-call': 'bg-purple-500',
  'digital-ad-search': 'bg-yellow-500',
  'digital-ad-social': 'bg-indigo-500',
};

const allChannels: Channel[] = ['email', 'sms', 'portal', 'social-media', 'landing-page', 'direct-mail', 'phone-call', 'digital-ad-search', 'digital-ad-social'];

// Helper to format channel names with proper capitalization
const formatChannelName = (channel: string): string => {
  if (channel === 'sms') return 'SMS';
  return channel.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
};

// Helper to calculate date for a specific week
const calculateWeekDate = (startDate: string | undefined, weekNumber: number): string | null => {
  if (!startDate) return null;
  try {
    const start = new Date(startDate);
    const weekDate = new Date(start);
    weekDate.setDate(start.getDate() + (weekNumber - 1) * 7);
    return weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return null;
  }
};

function getGeneratedMessageText(channel: Channel, content: unknown): string {
  if (typeof content === "string") return content;
  if (content == null) return "";
  if (typeof content !== "object") return String(content);

  if (channel === "digital-ad-search") {
    const ad = content as { headlines?: unknown; descriptions?: unknown; displayUrl?: unknown };
    const headlines = Array.isArray(ad.headlines) ? ad.headlines.map(String) : [];
    const descriptions = Array.isArray(ad.descriptions) ? ad.descriptions.map(String) : [];
    const displayUrl = typeof ad.displayUrl === "string" ? ad.displayUrl : "";

    return `HEADLINES:\n${headlines.join("\n")}\n\nDESCRIPTIONS:\n${descriptions.join("\n")}${displayUrl ? `\n\nDISPLAY URL: ${displayUrl}` : ""}`;
  }

  if (channel === "digital-ad-social") {
    const ad = content as { primaryText?: unknown; headline?: unknown; description?: unknown; ctaButton?: unknown; platform?: unknown };
    const primaryText = typeof ad.primaryText === "string" ? ad.primaryText : "";
    const headline = typeof ad.headline === "string" ? ad.headline : "";
    const description = typeof ad.description === "string" ? ad.description : "";
    const ctaButton = typeof ad.ctaButton === "string" ? ad.ctaButton : "";
    const platform = typeof ad.platform === "string" ? ad.platform : "";

    return `PRIMARY TEXT:\n${primaryText}\n\nHEADLINE: ${headline}${description ? `\nDESCRIPTION: ${description}` : ""}\n\nCTA: ${ctaButton}${platform ? `\nPLATFORM: ${platform}` : ""}`;
  }

  try {
    return JSON.stringify(content, null, 2);
  } catch {
    return String(content);
  }
}

function TouchpointCard({ 
  touchpoint, 
  index, 
  context,
  generatedMessages,
  onGenerateMessage,
  isGenerating,
  startDate
}: { 
  touchpoint: JourneyTouchpoint; 
  index: number;
  context: MessageContext;
  generatedMessages: GeneratedMessage[];
  onGenerateMessage: (index: number, channels: Channel[]) => void;
  isGenerating: number | null;
  startDate?: string;
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

  const weekDate = calculateWeekDate(startDate, touchpoint.week);

  return (
    <div className="relative pl-12">
      {/* Timeline dot - colored by channel to match diagram */}
      <div className={`absolute left-2 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-white ${channelDotColors[touchpoint.channel]}`}>
        {touchpoint.week}
      </div>
      
      <Card className={`border-l-4 ${channelBorderColors[touchpoint.channel]}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base font-medium">
              Week {touchpoint.week}{weekDate ? ` (${weekDate})` : ''}: {touchpoint.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`flex items-center gap-1 ${channelColors[touchpoint.channel]}`}>
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
                variant={expanded ? "ghost" : "outline"}
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className={`text-sm transition-all ${!expanded ? 'border-primary/40 hover:border-primary hover:bg-primary/10' : ''}`}
              >
                {expanded ? 'Hide' : 'Generate'} Message Copy
                {!expanded && <AIIndicator className="ml-2" />}
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
                      className={`cursor-pointer transition-colors ${
                        selectedChannels.includes(channel) 
                          ? 'hover:bg-primary/80' 
                          : 'hover:bg-primary/20 hover:border-primary/50 hover:text-primary'
                      }`}
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
                    {thisMessages.map((msg, i) => {
                      const contentText = getGeneratedMessageText(msg.channel, msg.content);

                      return (
                        <div key={i} className="p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="flex items-center gap-1">
                              {channelIcons[msg.channel]}
                              {formatChannelName(msg.channel)}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(contentText, msg.channel)}
                            >
                              {copiedChannel === msg.channel ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <Textarea 
                            value={contentText} 
                            readOnly 
                            className="min-h-[100px] text-sm bg-background"
                          />
                          {msg.channel === 'sms' && (
                            <SmsCharCounter text={contentText} />
                          )}
                        </div>
                      );
                    })}
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


export function StrategyJourneyDisplay({
  journey,
  context,
  startDate,
  endDate,
  selectedProfileId,
  institutionalConfig,
  useContentDNA = true,
  contentDNA: contentDNAOverride,
}: StrategyJourneyProps) {
  const { toast } = useToast();
  const { config: fallbackInstitutionalConfig } = useInstitutionalConfig();
  const { contentDNA: fetchedContentDNA } = useContentDNAForGeneration({ profileId: selectedProfileId });
  const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState<number | null>(null);

  const institutionalConfigForGeneration = institutionalConfig ?? fallbackInstitutionalConfig;
  const contentDNAForGeneration = useContentDNA ? (contentDNAOverride ?? fetchedContentDNA) : null;

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
          institutionalConfig: institutionalConfigForGeneration,
          startDate,
          endDate,
          contentDNA: contentDNAForGeneration || undefined,
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const newMessages: GeneratedMessage[] = data.messages.map((msg: { channel: Channel; content: unknown }) => ({
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
                  startDate={startDate}
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
