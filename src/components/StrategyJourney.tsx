import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ArrowRight
} from "lucide-react";
import type { StrategyJourney, Channel, StrategyPhase } from "@/types/persist";

interface StrategyJourneyProps {
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

export function StrategyJourneyDisplay({ journey }: StrategyJourneyProps) {
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
            Detailed touchpoints with channel recommendations and behavioral nudges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            
            <div className="space-y-6">
              {journey.touchpoints.map((touchpoint, index) => (
                <div key={index} className="relative pl-12">
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
                          <Badge variant="outline" className="capitalize flex items-center gap-1">
                            {channelIcons[touchpoint.channel]}
                            {touchpoint.channel.replace('-', ' ')}
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
                    </CardContent>
                  </Card>
                </div>
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
