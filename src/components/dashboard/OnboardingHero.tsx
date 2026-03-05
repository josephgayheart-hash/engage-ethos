import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react';
import { UserDashboardContext } from '@/hooks/useUserDashboardContext';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingHeroProps {
  context: UserDashboardContext;
}

export function OnboardingHero({ context }: OnboardingHeroProps) {
  const { profile } = useAuth();
  const firstName = profile?.first_name || 'there';
  const { setupProgress } = context;

  const getNextStep = () => {
    if (!setupProgress.hasInstitution) return { label: 'Set Up Institution', href: '/university-settings' };
    if (!setupProgress.hasDNA) return { label: 'Configure Content DNA', href: '/content-dna' };
    if (!setupProgress.hasCampusPhotos) return { label: 'Add Campus Photos', href: '/admin/content-dna' };
    return { label: 'Start Creating', href: '/build' };
  };

  const nextStep = getNextStep();

  return (
    <section className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-accent/30 text-accent">
              <Sparkles className="w-2.5 h-2.5 mr-0.5" />
              Getting Started
            </Badge>
          </div>

          <h1 className="text-lg font-semibold text-foreground mb-0.5">
            Welcome, {firstName}! Let's get you set up.
          </h1>
          <p className="text-xs text-muted-foreground mb-4">
            Complete these steps to unlock AI-powered, brand-informed messaging
          </p>

          {/* Progress */}
          <div className="max-w-md mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Setup Progress</span>
              <span className="font-medium text-foreground">{setupProgress.completionPercent}%</span>
            </div>
            <Progress value={setupProgress.completionPercent} className="h-1.5 mb-3" />
            
            <div className="flex items-center justify-between">
              <StepIndicator label="Profile" completed={setupProgress.hasProfile} />
              <div className="flex-1 h-px bg-border mx-1.5" />
              <StepIndicator label="Institution" completed={setupProgress.hasInstitution} />
              <div className="flex-1 h-px bg-border mx-1.5" />
              <StepIndicator label="Content DNA" completed={setupProgress.hasDNA} />
              <div className="flex-1 h-px bg-border mx-1.5" />
              <StepIndicator label="Photos" completed={setupProgress.hasCampusPhotos} />
            </div>
          </div>

          <Button asChild size="sm" className="h-8 text-xs">
            <Link to={nextStep.href}>
              {nextStep.label}
              <ArrowRight className="ml-1.5 w-3 h-3" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function StepIndicator({ label, completed }: { label: string; completed: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {completed ? (
        <CheckCircle2 className="w-4 h-4 text-accent" />
      ) : (
        <Circle className="w-4 h-4 text-muted-foreground/40" />
      )}
      <span className={`text-[10px] ${completed ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );
}
