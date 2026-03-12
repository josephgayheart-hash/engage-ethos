import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Dna,
  Lightbulb,
} from 'lucide-react';
import { UserDashboardContext } from '@/hooks/useUserDashboardContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAgencyMode } from '@/hooks/useAgencyMode';
import { InsightCards } from './InsightCards';

const ROTATING_MESSAGES = [
  "Let's craft something that moves people today.",
  "Your brand voice is warmed up and ready to go.",
  "Every great campaign starts with a single draft.",
  "Time to turn strategy into on-voice messaging.",
  "Your audience is waiting — let's make it count.",
  "On-brand, on-voice, on-mission. Let's go.",
  "Great comms don't happen by accident. You're here.",
  "What story will you tell today?",
  "Fresh day, fresh messaging. Let's build.",
  "Your institution's voice, amplified by AI.",
  "Consistency is your superpower. Let's use it.",
  "Ready to turn insights into impact?",
];

interface WorkflowHeroProps {
  context: UserDashboardContext;
}

export function WorkflowHero({ context }: WorkflowHeroProps) {
  const { profile, tenant } = useAuth();
  const { isAgency, labels } = useAgencyMode();
  const firstName = profile?.first_name || 'there';
  
  const { mode, personalStats, platformInsight } = context;

  // Rotating motivational message
  const [messageIndex, setMessageIndex] = useState(() =>
    Math.floor(Math.random() * ROTATING_MESSAGES.length)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % ROTATING_MESSAGES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = isAgency
    ? (tenant?.institution_name || firstName)
    : firstName;

  return (
    <section className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
            <div>
              {/* Badge ABOVE welcome */}
              <div className="flex items-center gap-2 mb-1.5">
                {mode === 'power-user' ? (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-primary/30 text-primary">
                    <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                    Power User
                  </Badge>
                ) : context.setupProgress.hasDNA ? (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-accent/30 text-accent">
                    <Dna className="w-2.5 h-2.5 mr-0.5" />
                    Content DNA Active
                  </Badge>
                ) : null}
                {isAgency && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-secondary/30 text-secondary-foreground">
                    {labels.accountType}
                  </Badge>
                )}
              </div>

              {/* Personalized welcome */}
              <h1 className="text-lg font-semibold text-foreground leading-tight">
                {getGreeting()}, {displayName}
              </h1>

              {/* Rotating on-brand message */}
              <p
                key={messageIndex}
                className="text-xs text-muted-foreground mt-0.5 animate-in fade-in duration-500"
              >
                {ROTATING_MESSAGES[messageIndex]}
              </p>
            </div>
          </div>

          {/* Insight Cards Row */}
          <InsightCards context={context} />

          {/* Platform Insight */}
          {platformInsight && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
              <Lightbulb className="w-3 h-3 text-secondary/60" />
              <span>{platformInsight.message}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
