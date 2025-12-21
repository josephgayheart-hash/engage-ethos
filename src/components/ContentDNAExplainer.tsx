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
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentDNAExplainerProps {
  /**
   * Where this explainer is displayed - affects messaging
   */
  context: 'content-dna-page' | 'message-builder' | 'journey-designer';
  /**
   * Whether to show as collapsible (default) or always expanded
   */
  defaultOpen?: boolean;
  /**
   * Whether the explainer can be collapsed
   */
  collapsible?: boolean;
  /**
   * Show link to Content DNA page (for builder contexts)
   */
  showManageLink?: boolean;
  /**
   * Additional class names
   */
  className?: string;
}

/**
 * ContentDNAExplainer - Educational component explaining how Content DNA works
 * 
 * Shows users how Content DNA Analysis extracts voice profile AND brand platform
 * together in a single unified analysis, plus how Custom Instructions are layered on top.
 */
export function ContentDNAExplainer({
  context,
  defaultOpen = false,
  collapsible = true,
  showManageLink = true,
  className,
}: ContentDNAExplainerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const isBuilderContext = context === 'message-builder' || context === 'journey-designer';

  const content = (
    <div className="space-y-4">
      {/* How It Works Flow */}
      <div className="grid gap-3">
        {/* Step 1: Content DNA Analysis (Unified) */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-blue-100 shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-emerald-800">Content DNA Analysis</h4>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">Single Analysis</span>
            </div>
            <p className="text-xs text-emerald-700 mt-0.5">
              When you analyze your content samples, <strong>both</strong> are extracted together in one unified analysis:
            </p>
            <div className="mt-2 grid gap-2">
              <div className="flex items-start gap-2 text-xs text-emerald-700 bg-white/60 p-2 rounded">
                <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
                <div>
                  <strong>Voice Profile:</strong> Tone, sentence patterns, vocabulary choices, and rhetorical style—the fingerprint of how your institution communicates.
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-blue-700 bg-white/60 p-2 rounded">
                <Target className="w-3 h-3 mt-0.5 shrink-0" />
                <div>
                  <strong>Brand Platform:</strong> Brand promise, pillars, pathways, proof points, and commitments—extracted to keep messaging aligned with your strategic positioning.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Custom Instructions */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
          <div className="p-2 rounded-lg bg-purple-100 shrink-0">
            <Quote className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-purple-800">Custom Instructions (Optional)</h4>
            <p className="text-xs text-purple-700 mt-0.5">
              Any specific guidelines you add (terminology preferences, phrases to avoid, formatting rules) 
              are layered on top to fine-tune the AI output.
            </p>
          </div>
        </div>

        {/* Arrow to Synthesis */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-px w-8 bg-border" />
            <ArrowRight className="w-4 h-4" />
            <div className="h-px w-8 bg-border" />
          </div>
        </div>

        {/* Synthesis Result */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/10 border border-accent/30">
          <div className="p-2 rounded-lg bg-accent shrink-0">
            <MessageSquare className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground">On-Brand Content Generation</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              When you generate messages, the AI combines all three elements to produce content that 
              sounds like your institution—matching your voice, incorporating your brand themes, 
              and following your specific guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* Toggle Explanation for Builders */}
      {isBuilderContext && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <ToggleLeft className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Using the Content DNA Toggle</span>
          </div>
          <div className="grid gap-2 text-xs">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] shrink-0">
                ON
              </Badge>
              <span className="text-muted-foreground">
                Generated content will match your institutional voice, incorporate brand messaging, 
                and follow custom instructions. Great for official communications.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-[10px] shrink-0">
                OFF
              </Badge>
              <span className="text-muted-foreground">
                AI generates generic content without your brand voice. Useful for drafting content 
                that will be heavily edited or for non-branded communications.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Brand Layer Selector Explanation */}
      {isBuilderContext && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Customize What's Applied</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Use the Brand Layer Selector to choose which brand elements to emphasize in your generated content. 
            Select specific pillars, proof points, or commitments to focus the messaging on particular themes.
          </p>
        </div>
      )}

      {/* Manage Link */}
      {showManageLink && isBuilderContext && (
        <div className="pt-2 border-t border-border">
          <Link to="/content-dna">
            <Button variant="ghost" size="sm" className="w-full h-8 text-xs text-muted-foreground hover:text-foreground">
              <Settings className="w-3 h-3 mr-1" />
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
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-4">
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
          <CardContent className="py-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-accent">
                  <Dna className="w-4 h-4 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">How Content DNA Works</h3>
                  <p className="text-xs text-muted-foreground">
                    Learn how your voice, brand platform, and instructions shape AI-generated content
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
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
          <CardContent className="pt-0 pb-4">
            <div className="h-px bg-border mb-4" />
            {content}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
