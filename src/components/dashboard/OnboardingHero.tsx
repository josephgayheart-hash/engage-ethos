import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ArrowRight, Sparkles, Camera } from 'lucide-react';
import { UserDashboardContext } from '@/hooks/useUserDashboardContext';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingHeroProps {
  context: UserDashboardContext;
}

export function OnboardingHero({ context }: OnboardingHeroProps) {
  const { profile } = useAuth();
  const firstName = profile?.first_name || 'there';
  const { setupProgress } = context;

  // Determine next step
  const getNextStep = () => {
    if (!setupProgress.hasInstitution) {
      return { label: 'Set Up Institution', href: '/university-settings' };
    }
    if (!setupProgress.hasDNA) {
      return { label: 'Configure Content DNA', href: '/content-dna' };
    }
    if (!setupProgress.hasCampusPhotos) {
      return { label: 'Add Campus Photos', href: '/admin/content-dna' };
    }
    return { label: 'Start Creating', href: '/build' };
  };

  const nextStep = getNextStep();

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-zone-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(200_70%_90%_/_0.3),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(173_58%_85%_/_0.2),_transparent_50%)]" />
      
      {/* Subtle lens flares */}
      <div className="absolute top-12 right-[15%] w-24 h-24 bg-[hsl(270_70%_60%_/_0.1)] rounded-full blur-2xl" />
      <div className="absolute bottom-8 left-[10%] w-32 h-32 bg-[hsl(82_85%_55%_/_0.08)] rounded-full blur-3xl" />
      
      <div className="relative py-10 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Beta Badge */}
            <div className="mb-3 animate-fade-in">
              <Badge className="bg-[hsl(200_100%_50%_/_0.15)] text-[hsl(200_100%_40%)] border-[hsl(200_100%_50%_/_0.3)] hover:bg-[hsl(200_100%_50%_/_0.2)]">
                <Sparkles className="w-3 h-3 mr-1" />
                Getting Started
              </Badge>
            </div>

            {/* Personalized Headline */}
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2 animate-fade-in">
              Welcome, {firstName}! Let's get you set up.
            </h1>
            <p className="text-base text-muted-foreground mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              Complete these steps to unlock AI-powered, brand-informed messaging
            </p>

            {/* Progress Section */}
            <div className="max-w-md mx-auto mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Setup Progress</span>
                <span className="font-medium text-foreground">{setupProgress.completionPercent}% Complete</span>
              </div>
              <Progress value={setupProgress.completionPercent} className="h-2 mb-4" />
              
              {/* Step Indicators */}
              <div className="flex items-center justify-between">
                <StepIndicator 
                  label="Profile" 
                  completed={setupProgress.hasProfile} 
                />
                <div className="flex-1 h-px bg-border mx-2" />
                <StepIndicator 
                  label="Institution" 
                  completed={setupProgress.hasInstitution} 
                />
                <div className="flex-1 h-px bg-border mx-2" />
                <StepIndicator 
                  label="Content DNA" 
                  completed={setupProgress.hasDNA} 
                />
                <div className="flex-1 h-px bg-border mx-2" />
                <StepIndicator 
                  label="Campus Photos" 
                  completed={setupProgress.hasCampusPhotos} 
                />
              </div>
            </div>

            {/* CTA */}
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Button asChild size="lg" className="group">
                <Link to={nextStep.href}>
                  {nextStep.label}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1440 60" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path 
            d="M0 60L60 52C120 44 240 28 360 24C480 20 600 28 720 32C840 36 960 36 1080 32C1200 28 1320 20 1380 16L1440 12V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" 
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}

function StepIndicator({ label, completed }: { label: string; completed: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {completed ? (
        <CheckCircle2 className="w-5 h-5 text-accent" />
      ) : (
        <Circle className="w-5 h-5 text-muted-foreground/50" />
      )}
      <span className={`text-xs ${completed ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );
}
