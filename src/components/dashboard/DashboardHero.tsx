import { useAuth } from '@/contexts/AuthContext';
import { useUserDashboardContext } from '@/hooks/useUserDashboardContext';
import { OnboardingHero } from './OnboardingHero';
import { WorkflowHero } from './WorkflowHero';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardHero() {
  const { user } = useAuth();
  const context = useUserDashboardContext();

  if (!user) return <MarketingHero />;

  if (context.isLoading) {
    return (
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-6xl mx-auto space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </section>
    );
  }

  if (context.mode === 'onboarding') return <OnboardingHero context={context} />;
  return <WorkflowHero context={context} />;
}

function MarketingHero() {
  return (
    <section className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-xl md:text-2xl font-semibold text-foreground mb-1">
            <span className="text-primary">Plan.</span>{' '}
            <span className="text-accent">Strategize.</span>{' '}
            <span className="text-primary">Execute.</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Your digital playbook for higher ed messaging at scale.
          </p>
        </div>
      </div>
    </section>
  );
}
