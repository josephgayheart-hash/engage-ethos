import { ArrowRight, ArrowDown, Dna, Sliders, FileText, Sparkles } from 'lucide-react';

const DNATuningDiagram = () => {
  return (
    <div className="w-full py-6">
      {/* Desktop Flow - Horizontal */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {/* Base DNA */}
        <div className="flex-1 max-w-[200px]">
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Dna className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold text-sm mb-1">Base Content DNA</h4>
            <p className="text-xs text-muted-foreground">
              Voice analysis from your uploaded samples
            </p>
          </div>
        </div>

        <ArrowRight className="h-6 w-6 text-muted-foreground/50 flex-shrink-0" />

        {/* Tuning Layer */}
        <div className="flex-1 max-w-[240px]">
          <div className="bg-accent/50 border border-border rounded-xl p-4">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
              <Sliders className="h-6 w-6 text-accent-foreground" />
            </div>
            <h4 className="font-semibold text-sm text-center mb-3">DNA Tuning Layer</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs bg-background/50 rounded-lg px-3 py-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Voice Dimensions</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-background/50 rounded-lg px-3 py-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Section Feedback</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-background/50 rounded-lg px-3 py-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Override Rules</span>
              </div>
            </div>
          </div>
        </div>

        <ArrowRight className="h-6 w-6 text-muted-foreground/50 flex-shrink-0" />

        {/* Generation */}
        <div className="flex-1 max-w-[200px]">
          <div className="bg-muted/50 border border-border rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-foreground" />
            </div>
            <h4 className="font-semibold text-sm mb-1">AI Generation</h4>
            <p className="text-xs text-muted-foreground">
              Tuned parameters guide output
            </p>
          </div>
        </div>

        <ArrowRight className="h-6 w-6 text-muted-foreground/50 flex-shrink-0" />

        {/* Output */}
        <div className="flex-1 max-w-[200px]">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
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
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Dna className="h-5 w-5 text-primary" />
            </div>
            <h4 className="font-semibold text-sm mb-1">Base Content DNA</h4>
            <p className="text-xs text-muted-foreground">
              Voice analysis from samples
            </p>
          </div>
        </div>

        <ArrowDown className="h-5 w-5 text-muted-foreground/50" />

        {/* Tuning Layer */}
        <div className="w-full max-w-[280px]">
          <div className="bg-accent/50 border border-border rounded-xl p-4">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
              <Sliders className="h-5 w-5 text-accent-foreground" />
            </div>
            <h4 className="font-semibold text-sm text-center mb-2">DNA Tuning Layer</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              <div className="flex items-center gap-1.5 text-xs bg-background/50 rounded-full px-2.5 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Dimensions</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs bg-background/50 rounded-full px-2.5 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>Feedback</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs bg-background/50 rounded-full px-2.5 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Rules</span>
              </div>
            </div>
          </div>
        </div>

        <ArrowDown className="h-5 w-5 text-muted-foreground/50" />

        {/* Generation */}
        <div className="w-full max-w-[280px]">
          <div className="bg-muted/50 border border-border rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkles className="h-5 w-5 text-foreground" />
            </div>
            <h4 className="font-semibold text-sm mb-1">AI Generation</h4>
            <p className="text-xs text-muted-foreground">
              Tuned parameters guide output
            </p>
          </div>
        </div>

        <ArrowDown className="h-5 w-5 text-muted-foreground/50" />

        {/* Output */}
        <div className="w-full max-w-[280px]">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
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
          then tuning adjustments let you fine-tune specific dimensions, add section-level feedback, 
          and set override rules—all applied during AI generation for precisely calibrated output.
        </p>
      </div>
    </div>
  );
};

export default DNATuningDiagram;
