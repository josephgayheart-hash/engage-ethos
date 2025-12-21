import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dna, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Target, 
  MessageSquare,
  ArrowRight,
  Settings,
  ToggleLeft,
  Quote,
  Layers,
  Sliders,
  Library,
  Search,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentDNAExplainerProps {
  context: 'content-dna-page' | 'message-builder' | 'journey-designer';
  defaultOpen?: boolean;
  collapsible?: boolean;
  showManageLink?: boolean;
  className?: string;
}

export function ContentDNAExplainer({
  context,
  defaultOpen = false,
  collapsible = true,
  showManageLink = true,
  className,
}: ContentDNAExplainerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const isBuilderContext = context === 'message-builder' || context === 'journey-designer';
  const isContentDNAPage = context === 'content-dna-page';

  const content = (
    <div className="space-y-6">
      {/* Section: Core Analysis */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Core Analysis</h4>
        
        <div className="grid gap-3">
          {/* Content DNA Analysis */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200/60">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-blue-100 shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-emerald-800">Content DNA Analysis</h4>
                <Badge variant="outline" className="text-[10px] bg-emerald-100/50 text-emerald-700 border-emerald-200">
                  Unified
                </Badge>
              </div>
              <p className="text-xs text-emerald-700/80 leading-relaxed">
                Upload content samples and run a single analysis that extracts both your voice profile and brand platform together.
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="flex items-start gap-2 text-xs bg-white/60 p-2 rounded border border-emerald-100">
                  <Sparkles className="w-3 h-3 mt-0.5 shrink-0 text-emerald-600" />
                  <span className="text-emerald-700"><strong>Voice Profile:</strong> Tone, vocabulary, sentence patterns</span>
                </div>
                <div className="flex items-start gap-2 text-xs bg-white/60 p-2 rounded border border-blue-100">
                  <Target className="w-3 h-3 mt-0.5 shrink-0 text-blue-600" />
                  <span className="text-blue-700"><strong>Brand Platform:</strong> Pillars, promise, proof points</span>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50/80 border border-purple-200/60">
            <div className="p-2 rounded-lg bg-purple-100 shrink-0">
              <Quote className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-purple-800">Custom Instructions</h4>
              <p className="text-xs text-purple-700/80 mt-1 leading-relaxed">
                Add specific guidelines—terminology preferences, phrases to avoid, formatting rules—layered on top of your DNA analysis.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Fine-Tuning (Content DNA Page only) */}
      {isContentDNAPage && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fine-Tuning</h4>
          
          <div className="grid gap-3">
            {/* DNA Tuning Controls */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/80 border border-amber-200/60">
              <div className="p-2 rounded-lg bg-amber-100 shrink-0">
                <Sliders className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-amber-800">DNA Tuning Controls</h4>
                <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                  Adjust dimension sliders (tone formality, warmth, CTA strength), provide section-specific feedback, and create override rules to fine-tune how AI applies your DNA.
                </p>
              </div>
            </div>

            {/* Content Library */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-sky-50/80 border border-sky-200/60">
              <div className="p-2 rounded-lg bg-sky-100 shrink-0">
                <Library className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-sky-800">Content Library</h4>
                <p className="text-xs text-sky-700/80 mt-1 leading-relaxed">
                  Upload content directly in the library, search indexed samples by theme or keyword, and manage your collection of brand communications.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Arrow to Result */}
      <div className="flex items-center justify-center gap-3 py-1">
        <div className="h-px flex-1 bg-border" />
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Result */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/10 border border-accent/30">
        <div className="p-2 rounded-lg bg-accent shrink-0">
          <MessageSquare className="w-4 h-4 text-accent-foreground" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-foreground">On-Brand Content Generation</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            When you generate messages, the AI combines your voice profile, brand platform, custom instructions, and tuning adjustments to produce content that sounds authentically like your institution.
          </p>
        </div>
      </div>

      {/* Builder-specific sections */}
      {isBuilderContext && (
        <div className="space-y-3 pt-2 border-t border-border">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Using in Message Builder</h4>
          
          <div className="grid gap-3">
            {/* Toggle Explanation */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border">
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <ToggleLeft className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Content DNA Toggle</h4>
                <div className="grid gap-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">ON</Badge>
                    <span className="text-muted-foreground">Matches your brand voice for official communications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">OFF</Badge>
                    <span className="text-muted-foreground">Generic AI output for non-branded content</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Layer Selector */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border">
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <Layers className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground">Brand Layer Selector</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Choose which brand elements to emphasize—select specific pillars, proof points, or commitments to focus your message.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Link */}
      {showManageLink && isBuilderContext && (
        <div className="pt-3 border-t border-border">
          <Link to="/content-dna">
            <Button variant="ghost" size="sm" className="w-full h-8 text-xs text-muted-foreground hover:text-foreground">
              <Settings className="w-3 h-3 mr-1.5" />
              Manage Content DNA Settings
            </Button>
          </Link>
        </div>
      )}
    </div>
  );

  if (!collapsible) {
    return (
      <Card className={cn("border-border", className)}>
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-accent">
              <Dna className="w-4 h-4 text-accent-foreground" />
            </div>
            <h3 className="font-medium text-foreground">How Content DNA Works</h3>
          </div>
          {content}
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <Card className="border-border">
        <CollapsibleTrigger asChild>
          <CardContent className="py-3.5 px-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent">
                  <Dna className="w-4 h-4 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">How Content DNA Works</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Learn how your voice, brand platform, and tuning shape AI-generated content
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-5 px-4">
            <div className="h-px bg-border mb-5" />
            {content}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
