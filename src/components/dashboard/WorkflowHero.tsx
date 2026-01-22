import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  FileText, 
  Map, 
  PenTool, 
  RotateCcw,
  TrendingUp,
  Users,
  Dna,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { UserDashboardContext } from '@/hooks/useUserDashboardContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAgencyMode } from '@/hooks/useAgencyMode';
import { formatDistanceToNow } from 'date-fns';

interface WorkflowHeroProps {
  context: UserDashboardContext;
}

export function WorkflowHero({ context }: WorkflowHeroProps) {
  const { profile, tenant, isAdmin } = useAuth();
  const { isAgency } = useAgencyMode();
  const firstName = profile?.first_name || 'there';
  
  const { mode, personalStats, institutionalStats, platformInsight, mostRecentDraft } = context;

  // Dynamic headline based on mode
  const getHeadline = () => {
    if (mode === 'power-user') {
      return `${firstName}'s Command Center`;
    }
    if (mode === 'active') {
      return `Your Workflow Hub`;
    }
    return `Welcome back, ${firstName}`;
  };

  // Dynamic subtitle
  const getSubtitle = () => {
    const institutionName = tenant?.institution_name || 'Your Institution';
    const parts = [institutionName];
    
    if (context.setupProgress.hasDNA) {
      parts.push('Content DNA Active');
    }
    
    if (mode === 'power-user' && personalStats.topTool) {
      return `${personalStats.topTool} specialist • ${personalStats.buildsCount} messages crafted`;
    }
    
    return parts.join(' • ');
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background - more compact for active users */}
      <div className="absolute inset-0 bg-zone-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(200_70%_90%_/_0.2),_transparent_50%)]" />
      
      {/* Subtle lens flares */}
      <div className="absolute top-8 right-[20%] w-20 h-20 bg-[hsl(270_70%_60%_/_0.08)] rounded-full blur-2xl" />
      <div className="absolute bottom-4 left-[15%] w-24 h-24 bg-[hsl(82_85%_55%_/_0.06)] rounded-full blur-3xl" />
      
      <div className="relative py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header Row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="text-center md:text-left">
                {/* Mode Badge */}
                <div className="mb-2 animate-fade-in">
                  {mode === 'power-user' ? (
                    <Badge className="bg-[hsl(82_85%_45%_/_0.15)] text-[hsl(82_85%_35%)] border-[hsl(82_85%_45%_/_0.3)]">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Power User
                    </Badge>
                  ) : (
                    <Badge className="bg-[hsl(200_100%_50%_/_0.15)] text-[hsl(200_100%_40%)] border-[hsl(200_100%_50%_/_0.3)]">
                      <Dna className="w-3 h-3 mr-1" />
                      DNA Active
                    </Badge>
                  )}
                </div>

                {/* Headline */}
                <h1 className="font-serif text-xl md:text-2xl font-bold text-foreground mb-1 animate-fade-in">
                  {getHeadline()}
                </h1>
                <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '100ms' }}>
                  {getSubtitle()}
                </p>
              </div>

              {/* Quick Actions / Resume Draft */}
              {mostRecentDraft && (
                <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                  <Button asChild variant="outline" size="sm" className="group">
                    <Link to={
                      mostRecentDraft.type === 'journey' 
                        ? `/strategy?draft=${mostRecentDraft.id}` 
                        : `/build?draft=${mostRecentDraft.id}`
                    }>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Resume: {mostRecentDraft.title || 'Draft'}
                      <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Actionable Stats Row - only meaningful, clickable items */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
              {/* Drafts - links to library */}
              {personalStats.draftsInProgress > 0 && (
                <Link to="/library" className="group">
                  <ActionableStatCard 
                    icon={FileText}
                    label="Drafts in Progress"
                    value={personalStats.draftsInProgress}
                    color="primary"
                    actionHint="View all →"
                  />
                </Link>
              )}

              {/* Messages Created - links to library */}
              {personalStats.messagesCreated > 0 && (
                <Link to="/library" className="group">
                  <ActionableStatCard 
                    icon={PenTool}
                    label="Messages Created"
                    value={personalStats.messagesCreated}
                    color="cognitive"
                    actionHint="View library →"
                  />
                </Link>
              )}

              {/* Journeys - links to strategy */}
              {personalStats.journeysDesigned > 0 && (
                <Link to="/strategy" className="group">
                  <ActionableStatCard 
                    icon={Map}
                    label="Journeys Designed"
                    value={personalStats.journeysDesigned}
                    color="consensus"
                    actionHint="Design more →"
                  />
                </Link>
              )}

              {/* Admin: Team Activity - links to admin users */}
              {isAdmin && institutionalStats && institutionalStats.activeUsers > 0 && (
                <Link to="/admin/users" className="group">
                  <ActionableStatCard 
                    icon={Users}
                    label="Active Team Members"
                    value={`${institutionalStats.activeUsers}/${institutionalStats.totalUsers}`}
                    color="accent"
                    actionHint="Manage team →"
                  />
                </Link>
              )}
            </div>

            {/* Platform Insight as subtle tip */}
            {platformInsight && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/80 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <Lightbulb className="w-3.5 h-3.5 text-secondary/70" />
                <span>{platformInsight.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1440 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path 
            d="M0 40L60 35C120 30 240 20 360 17C480 14 600 18 720 20C840 22 960 22 1080 20C1200 18 1320 14 1380 12L1440 10V40H1380C1320 40 1200 40 1080 40C960 40 840 40 720 40C600 40 480 40 360 40C240 40 120 40 60 40H0Z" 
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}

interface ActionableStatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: 'primary' | 'cognitive' | 'consensus' | 'accent' | 'authority';
  actionHint: string;
}

function ActionableStatCard({ icon: Icon, label, value, color, actionHint }: ActionableStatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    cognitive: 'bg-pillar-cognitive/10 text-pillar-cognitive',
    consensus: 'bg-pillar-consensus/10 text-pillar-consensus',
    accent: 'bg-accent/10 text-accent',
    authority: 'bg-pillar-authority/10 text-pillar-authority',
  };

  return (
    <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 flex items-center gap-3 transition-all group-hover:border-primary/30 group-hover:shadow-sm">
      <div className={`w-8 h-8 rounded-lg ${colorClasses[color]} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-bold text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-[10px] text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity truncate">{actionHint}</p>
      </div>
    </div>
  );
}
