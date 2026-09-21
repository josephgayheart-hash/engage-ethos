import { Link } from '@/lib/router-compat';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const pilotPerks = [
  "Full platform access during pilot",
  "Dedicated onboarding support",
  "Content DNA setup assistance",
  "No credit card required",
];

export default function PricingSignalSection() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="absolute top-12 right-[15%] w-40 h-40 bg-[hsl(216_100%_50%_/_0.06)] rounded-full blur-3xl" />
      <div className="absolute bottom-16 left-[10%] w-32 h-32 bg-[hsl(60_4%_26%_/_0.06)] rounded-full blur-3xl" />

      <div className="max-w-3xl mx-auto relative z-10 text-center">
        <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-3">
          Start with a <span className="text-[hsl(216_100%_46%)]">Free Pilot</span>
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Qualifying institutions get a complimentary pilot period. No contracts, no commitments — just results.
        </p>

        <div className="flex flex-col items-center gap-3 mb-8">
          {pilotPerks.map((perk) => (
            <div key={perk} className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-[hsl(216_100%_46%)] shrink-0" />
              <span>{perk}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-[hsl(216_100%_50%)] text-white hover:bg-[hsl(216_100%_45%)] font-semibold rounded-lg px-6 shadow-[0_8px_24px_-10px_hsl(216_100%_50%_/_0.6)] border-0"
          >
            <Link to="/login?signup=1">
              Create Your Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground/60">
            Flexible usage-based pricing after pilot · Custom enterprise tiers available
          </p>
        </div>
      </div>
    </section>
  );
}
