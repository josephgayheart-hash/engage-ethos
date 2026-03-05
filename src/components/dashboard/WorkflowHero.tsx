import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  RotateCcw,
  Dna,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { UserDashboardContext } from '@/hooks/useUserDashboardContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAgencyMode } from '@/hooks/useAgencyMode';
import { InsightCards } from './InsightCards';

interface WorkflowHeroProps {
  context: UserDashboardContext;
}

export function WorkflowHero({ context }: WorkflowHeroProps) {
  const { profile, tenant } = useAuth();
  const firstName = profile?.first_name || 'there';
  
  const { mode, personalStats, platformInsight, mostRecentDraft } = context;

  const getHeadline = () => {
    if (mode === 'power-user') return `${firstName}'s Command Center`;
    if (mode === 'active') return `Your Workflow Hub`;
    return `Welcome back, ${firstName}`;
  };

  const getSubtitle = () => {
    const institutionName = tenant?.institution_name || 'Your Institution';
    if (mode === 'power-user' && personalStats.topTool) {
      return `${personalStats.topTool} specialist • ${personalStats.buildsCount} messages crafted`;
    }
    const parts = [institutionName];
    if (context.setupProgress.hasDNA) parts.push('Content DNA Active');
    return parts.join(' • ');
  };

  return (
    <section className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Row — compact workspace-style */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                {mode === 'power-user' ? (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-primary/30 text-primary">
                    <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                    Power User
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-accent/30 text-accent">
                    <Dna className="w-2.5 h-2.5 mr-0.5" />
                    DNA Active
                  </Badge>
                )}
              </div>
              <h1 className="text-lg font-semibold text-foreground leading-tight">
                {getHeadline()}
              </h1>
              <p className="text-xs text-muted-foreground">
                {getSubtitle()}
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
