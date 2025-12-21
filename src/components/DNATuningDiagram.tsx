import { useState } from 'react';
import { ArrowRight, ArrowDown, Dna, Sliders, FileText, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const tuningTypes = [
  {
    id: 'dimensions',
    label: 'Voice Dimensions',
    shortLabel: 'Dimensions',
    color: 'pillar-cognitive',
    colorHsl: '173 58% 39%',
    description: 'Adjust formality, warmth, urgency, and CTA strength with intuitive sliders',
    examples: ['Formal ↔ Conversational', 'Warm ↔ Professional', 'Soft CTA ↔ Strong CTA']
  },
  {
    id: 'brand',
    label: 'Brand Platform',
    shortLabel: 'Brand',
    color: 'pillar-consensus',
    colorHsl: '45 93% 47%',
    description: 'Your brand promise, pillars, proof points, and commitments integrated into every message',
    examples: ['Brand Promise', 'Key Pillars', 'Proof Points']
  },
  {
    id: 'feedback',
    label: 'Section Feedback',
    shortLabel: 'Feedback',
    color: 'pillar-susceptibility',
    colorHsl: '262 52% 47%',
    description: 'Give thumbs up/down on specific voice analysis sections to refine AI understanding',
    examples: ['Approve tone patterns', 'Adjust vocabulary', 'Refine sentence style']
  },
  {
    id: 'rules',
    label: 'Override Rules',
    shortLabel: 'Rules',
    color: 'pillar-ethics',
    colorHsl: '340 75% 55%',
    description: 'Set explicit rules that always apply, like "never use jargon" or "always include CTA"',
    examples: ['Always include...', 'Never use...', 'Prefer X over Y']
  }
];

const TuningItem = ({ item, compact = false }: { item: typeof tuningTypes[0], compact?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip open={isHovered}>
        <TooltipTrigger asChild>
          <div
            className={`
              flex items-center gap-2 text-xs bg-white/70 dark:bg-background/50 
              rounded-${compact ? 'full' : 'lg'} ${compact ? 'px-2.5 py-1' : 'px-3 py-2'} 
              border border-[hsl(var(--${item.color})_/_0.2)]
              cursor-pointer transition-all duration-200
              hover:border-[hsl(var(--${item.color})_/_0.5)]
              hover:bg-[hsl(var(--${item.color})_/_0.1)]
              hover:shadow-sm
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className={`w-${compact ? '1.5' : '2'} h-${compact ? '1.5' : '2'} rounded-full bg-[hsl(var(--${item.color}))]`} />
            <span>{compact ? item.shortLabel : item.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="max-w-[280px] p-4 bg-card border shadow-lg"
          sideOffset={8}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full bg-[hsl(var(--${item.color}))]`} />
              <h4 className="font-semibold text-sm">{item.label}</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.description}
            </p>
            <div className="pt-2 border-t border-border">
              <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Examples:</p>
              <div className="flex flex-wrap gap-1">
                {item.examples.map((example, i) => (
                  <span 
                    key={i} 
                    className={`text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--${item.color})_/_0.1)] text-[hsl(var(--${item.color}))]`}
                  >
                    {example}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const DNATuningDiagram = () => {
  return (
    <div className="w-full py-6">
      {/* Desktop Flow - Horizontal */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {/* Base DNA */}
        <div className="flex-1 max-w-[200px]">
          <div className="bg-gradient-to-br from-[hsl(270_70%_60%_/_0.15)] to-[hsl(270_70%_60%_/_0.05)] border border-[hsl(270_70%_60%_/_0.3)] rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:border-[hsl(270_70%_60%_/_0.5)]">
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(270_70%_60%)] to-[hsl(270_70%_50%)] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Dna className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold text-sm mb-1">Base Content DNA</h4>
            <p className="text-xs text-muted-foreground">
              Voice analysis from your uploaded samples
            </p>
          </div>
        </div>

        <ArrowRight className="h-6 w-6 text-[hsl(var(--accent))] flex-shrink-0 animate-pulse" />

        {/* Tuning Layer */}
        <div className="flex-1 max-w-[260px]">
          <div className="bg-gradient-to-br from-[hsl(173_58%_39%_/_0.15)] to-[hsl(173_58%_39%_/_0.05)] border border-[hsl(173_58%_39%_/_0.3)] rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-[hsl(173_58%_39%_/_0.5)]">
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(173_58%_39%)] to-[hsl(173_58%_34%)] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Sliders className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold text-sm text-center mb-3">DNA Tuning Layer</h4>
            <div className="space-y-2">
              {tuningTypes.map((item) => (
                <TuningItem key={item.id} item={item} />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-3 italic">
              Hover for details
            </p>
          </div>
        </div>

        <ArrowRight className="h-6 w-6 text-[hsl(var(--accent))] flex-shrink-0 animate-pulse" />

        {/* Generation */}
        <div className="flex-1 max-w-[200px]">
          <div className="bg-gradient-to-br from-[hsl(45_93%_47%_/_0.15)] to-[hsl(45_93%_47%_/_0.05)] border border-[hsl(45_93%_47%_/_0.3)] rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:border-[hsl(45_93%_47%_/_0.5)]">
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(45_93%_47%)] to-[hsl(45_93%_42%)] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Sparkles className="h-6 w-6 text-[hsl(var(--foreground))]" />
            </div>
            <h4 className="font-semibold text-sm mb-1">AI Generation</h4>
            <p className="text-xs text-muted-foreground">
              Tuned parameters guide output
            </p>
          </div>
        </div>

        <ArrowRight className="h-6 w-6 text-[hsl(var(--accent))] flex-shrink-0 animate-pulse" />

        {/* Output */}
        <div className="flex-1 max-w-[200px]">
          <div className="bg-gradient-to-br from-[hsl(158_64%_42%_/_0.15)] to-[hsl(158_64%_42%_/_0.05)] border border-[hsl(158_64%_42%_/_0.3)] rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:border-[hsl(158_64%_42%_/_0.5)]">
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
              {tuningTypes.map((item) => (
                <TuningItem key={item.id} item={item} compact />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2 italic">
              Tap for details
            </p>
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