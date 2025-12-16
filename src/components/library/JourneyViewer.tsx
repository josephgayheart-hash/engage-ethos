import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  TrendingUp
} from "lucide-react";
import type { StrategyJourney, Channel, StrategyPhase } from "@/types/persist";

interface JourneyViewerProps {
  journey: StrategyJourney;
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

export function JourneyViewer({ journey }: JourneyViewerProps) {
  // Calculate analytics
  const analytics = journey.touchpoints.reduce((acc, tp) => {
    acc[tp.channel] = (acc[tp.channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Analytics Summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {Object.entries(analytics).map(([channel, count]) => (
          <div key={channel} className="bg-muted/50 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              {channelIcons[channel as Channel]}
              <span className="text-xs">{formatChannelName(channel)}</span>
            </div>
            <p className="text-lg font-bold">{count}</p>
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
