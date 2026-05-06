import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * Static, mobile-friendly "before / after" proof card.
 * No animations or large images — instant on mobile.
 */
export function HeroProductProof() {
  return (
    <section className="relative bg-background py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
            See it in 5 seconds
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
            One prompt. Your brand voice. Every time.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
          {/* Prompt card */}
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 flex flex-col">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              You write
            </div>
            <p className="text-sm text-foreground/80 font-mono leading-relaxed flex-1">
              "Write a welcome email to admitted students."
            </p>
            <div className="mt-3 text-[10px] text-muted-foreground">
              Plain prompt · 7 words
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center text-[hsl(82_85%_45%)]">
            <ArrowRight className="w-6 h-6" />
          </div>
          <div className="flex md:hidden items-center justify-center text-[hsl(82_85%_45%)]">
            <ArrowRight className="w-5 h-5 rotate-90" />
          </div>

          {/* Output card */}
          <div className="rounded-2xl border-2 border-[hsl(82_85%_55%_/_0.3)] bg-gradient-to-br from-background to-[hsl(82_85%_55%_/_0.04)] p-5 shadow-[0_0_24px_hsl(82_85%_55%_/_0.08)] flex flex-col">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3 h-3 text-[hsl(82_85%_45%)]" />
              <span className="text-[10px] uppercase tracking-wider text-[hsl(82_85%_35%)] font-bold">
                Your brand voice
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              Welcome to the class of 2030, future Wildcat.
            </p>
            <p className="text-sm text-foreground/75 leading-relaxed flex-1">
              You worked for this. We saw it in your essays, your transcripts, your story. Now we'd like to show you what comes next — campus tours, scholarship next steps, and a few first-year traditions worth knowing about…
            </p>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(82_85%_55%)]" />
                Voice match: 96%
              </span>
              <span>·</span>
              <span>Brand-safe</span>
              <span>·</span>
              <span>Ready to send</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Sample output. Your messages reflect your institution's voice, facts, and stories.
        </p>
      </div>
    </section>
  );
}

export default HeroProductProof;
