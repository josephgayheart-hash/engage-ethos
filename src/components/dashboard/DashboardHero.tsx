import { useAuth } from '@/contexts/AuthContext';
import { useUserDashboardContext } from '@/hooks/useUserDashboardContext';
import { OnboardingHero } from './OnboardingHero';
import { WorkflowHero } from './WorkflowHero';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardHero() {
  const { user } = useAuth();
  const context = useUserDashboardContext();

  // Not logged in - show default marketing hero
  if (!user) {
    return <MarketingHero />;
  }

  // Loading state
  if (context.isLoading) {
    return (
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-zone-hero" />
        <div className="relative py-10 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-10 w-80 mx-auto" />
              <Skeleton className="h-5 w-64 mx-auto" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Render appropriate hero based on mode
  if (context.mode === 'onboarding') {
    return <OnboardingHero context={context} />;
  }

  return <WorkflowHero context={context} />;
}

// Fallback marketing hero for non-logged-in users
function MarketingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-zone-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(200_70%_90%_/_0.3),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(173_58%_85%_/_0.2),_transparent_50%)]" />
      
      <div className="absolute top-12 right-[15%] w-24 h-24 bg-[hsl(270_70%_60%_/_0.1)] rounded-full blur-2xl" />
      <div className="absolute bottom-8 left-[10%] w-32 h-32 bg-[hsl(82_85%_55%_/_0.08)] rounded-full blur-3xl" />
      
      <div className="relative py-10 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2 animate-fade-in">
              <span className="text-[hsl(82_85%_45%)]">Plan.</span>{' '}
              <span className="text-[hsl(270_70%_55%)]">Strategize.</span>{' '}
              <span className="text-[hsl(200_100%_45%)]">Execute.</span>
            </h1>
            <p className="text-base text-muted-foreground animate-fade-in" style={{ animationDelay: '100ms' }}>
              Your digital playbook for higher ed. Craft meaningful, research-driven, brand-informed messaging at scale.
            </p>
          </div>
        </div>
      </div>
      
      <WaveDivider />
    </section>
  );
}

function WaveDivider() {
  return (
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
  );
}
