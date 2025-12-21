import { ArrowRight, ArrowDown, Dna, Sliders, FileText, Sparkles, Target } from 'lucide-react';

const DNATuningDiagram = () => {
  return (
    <div className="w-full py-6">
      {/* Desktop Flow - Horizontal */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {/* Base DNA */}
        <div className="flex-1 max-w-[200px]">
          <div className="bg-gradient-to-br from-[hsl(270_70%_60%_/_0.15)] to-[hsl(270_70%_60%_/_0.05)] border border-[hsl(270_70%_60%_/_0.3)] rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(270_70%_60%)] to-[hsl(270_70%_50%)] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Dna className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold text-sm mb-1">Base Content DNA</h4>
            <p className="text-xs text-muted-foreground">
              Voice analysis from your uploaded samples
            </p>
          </div>
        </div>

        <ArrowRight className="h-6 w-6 text-[hsl(var(--accent))] flex-shrink-0" />

        {/* Tuning Layer */}
        <div className="flex-1 max-w-[240px]">
          <div className="bg-gradient-to-br from-[hsl(173_58%_39%_/_0.15)] to-[hsl(173_58%_39%_/_0.05)] border border-[hsl(173_58%_39%_/_0.3)] rounded-xl p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(173_58%_39%)] to-[hsl(173_58%_34%)] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Sliders className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold text-sm text-center mb-3">DNA Tuning Layer</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs bg-white/70 dark:bg-background/50 rounded-lg px-3 py-2 border border-[hsl(var(--pillar-cognitive)_/_0.2)]">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--pillar-cognitive))]" />
                <span>Voice Dimensions</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-white/70 dark:bg-background/50 rounded-lg px-3 py-2 border border-[hsl(var(--pillar-consensus)_/_0.2)]">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--pillar-consensus))]" />
                <span>Brand Platform</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-white/70 dark:bg-background/50 rounded-lg px-3 py-2 border border-[hsl(var(--pillar-susceptibility)_/_0.2)]">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--pillar-susceptibility))]" />
                <span>Section Feedback</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-white/70 dark:bg-background/50 rounded-lg px-3 py-2 border border-[hsl(var(--pillar-ethics)_/_0.2)]">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--pillar-ethics))]" />
                <span>Override Rules</span>
              </div>
            </div>
          </div>
        </div>

        <ArrowRight className="h-6 w-6 text-[hsl(var(--accent))] flex-shrink-0" />

        {/* Generation */}
        <div className="flex-1 max-w-[200px]">
          <div className="bg-gradient-to-br from-[hsl(45_93%_47%_/_0.15)] to-[hsl(45_93%_47%_/_0.05)] border border-[hsl(45_93%_47%_/_0.3)] rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(45_93%_47%)] to-[hsl(45_93%_42%)] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Sparkles className="h-6 w-6 text-[hsl(var(--foreground))]" />
            </div>
            <h4 className="font-semibold text-sm mb-1">AI Generation</h4>
            <p className="text-xs text-muted-foreground">
              Tuned parameters guide output
            </p>
          </div>
        </div>

        <ArrowRight className="h-6 w-6 text-[hsl(var(--accent))] flex-shrink-0" />

        {/* Output */}
        <div className="flex-1 max-w-[200px]">
          <div className="bg-gradient-to-br from-[hsl(158_64%_42%_/_0.15)] to-[hsl(158_64%_42%_/_0.05)] border border-[hsl(158_64%_42%_/_0.3)] rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(158_64%_42%)] to-[hsl(158_64%_37%)] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold text-sm mb-1">Refined Content</h4>
            <p className="text-xs text-muted-foreground">
              On-brand, tuned to your preferences
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Flow - Vertical */}
      <div className="flex md:hidden flex-col items-center gap-3">
        {/* Base DNA */}
        <div className="w-full max-w-[280px]">
          <div className="bg-gradient-to-br from-[hsl(270_70%_60%_/_0.15)] to-[hsl(270_70%_60%_/_0.05)] border border-[hsl(270_70%_60%_/_0.3)] rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-[hsl(270_70%_60%)] to-[hsl(270_70%_50%)] rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
              <Dna className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-sm mb-1">Base Content DNA</h4>
            <p className="text-xs text-muted-foreground">
              Voice analysis from samples
            </p>
          </div>
        </div>

        <ArrowDown className="h-5 w-5 text-[hsl(var(--accent))]" />

        {/* Tuning Layer */}
        <div className="w-full max-w-[280px]">
          <div className="bg-gradient-to-br from-[hsl(173_58%_39%_/_0.15)] to-[hsl(173_58%_39%_/_0.05)] border border-[hsl(173_58%_39%_/_0.3)] rounded-xl p-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[hsl(173_58%_39%)] to-[hsl(173_58%_34%)] rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
              <Sliders className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-sm text-center mb-2">DNA Tuning Layer</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              <div className="flex items-center gap-1.5 text-xs bg-white/70 dark:bg-background/50 rounded-full px-2.5 py-1 border border-[hsl(var(--pillar-cognitive)_/_0.3)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--pillar-cognitive))]" />
                <span>Dimensions</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs bg-white/70 dark:bg-background/50 rounded-full px-2.5 py-1 border border-[hsl(var(--pillar-consensus)_/_0.3)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--pillar-consensus))]" />
                <span>Brand</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs bg-white/70 dark:bg-background/50 rounded-full px-2.5 py-1 border border-[hsl(var(--pillar-susceptibility)_/_0.3)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--pillar-susceptibility))]" />
                <span>Feedback</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs bg-white/70 dark:bg-background/50 rounded-full px-2.5 py-1 border border-[hsl(var(--pillar-ethics)_/_0.3)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--pillar-ethics))]" />
                <span>Rules</span>
              </div>
            </div>
          </div>
        </div>

        <ArrowDown className="h-5 w-5 text-[hsl(var(--accent))]" />

        {/* Generation */}
        <div className="w-full max-w-[280px]">
          <div className="bg-gradient-to-br from-[hsl(45_93%_47%_/_0.15)] to-[hsl(45_93%_47%_/_0.05)] border border-[hsl(45_93%_47%_/_0.3)] rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-[hsl(45_93%_47%)] to-[hsl(45_93%_42%)] rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
              <Sparkles className="h-5 w-5 text-[hsl(var(--foreground))]" />
            </div>
            <h4 className="font-semibold text-sm mb-1">AI Generation</h4>
            <p className="text-xs text-muted-foreground">
              Tuned parameters guide output
            </p>
          </div>
        </div>

        <ArrowDown className="h-5 w-5 text-[hsl(var(--accent))]" />

        {/* Output */}
        <div className="w-full max-w-[280px]">
          <div className="bg-gradient-to-br from-[hsl(158_64%_42%_/_0.15)] to-[hsl(158_64%_42%_/_0.05)] border border-[hsl(158_64%_42%_/_0.3)] rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-[hsl(158_64%_42%)] to-[hsl(158_64%_37%)] rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-sm mb-1">Refined Content</h4>
            <p className="text-xs text-muted-foreground">
              On-brand, tuned to preferences
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          <span className="font-medium">How it works:</span> Your base Content DNA establishes voice patterns, 
          then tuning adjustments let you integrate your brand platform, fine-tune specific voice dimensions, 
          add section-level feedback, and set override rules—all applied during AI generation for precisely calibrated output.
        </p>
      </div>
    </div>
  );
};

export default DNATuningDiagram;