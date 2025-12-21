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
 * Shows users how Voice Analysis, Brand Platform, and Custom Instructions
 * are synthesized into AI-generated messages.
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
        {/* Step 1: Voice Analysis */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <div className="p-2 rounded-lg bg-emerald-100 shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-emerald-800">Voice Analysis</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              AI analyzes your content samples to capture your tone, sentence patterns, vocabulary choices, and rhetorical style. 
              This creates a fingerprint of how your institution communicates.
            </p>
          </div>
        </div>

        {/* Step 2: Brand Platform */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="p-2 rounded-lg bg-blue-100 shrink-0">
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800">Brand Platform</h4>
            <p className="text-xs text-blue-700 mt-0.5">
              Your brand promise, pillars, proof points, and commitments are extracted to ensure messaging 
              stays aligned with your strategic positioning and value propositions.
            </p>
          </div>
        </div>

        {/* Step 3: Custom Instructions */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
          <div className="p-2 rounded-lg bg-purple-100 shrink-0">
            <Quote className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-purple-800">Custom Instructions</h4>
            <p className="text-xs text-purple-700 mt-0.5">
              Any specific guidelines you add (terminology preferences, phrases to avoid, formatting rules) 
              are layered on top to fine-tune the output.
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
        <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary shrink-0">
            <MessageSquare className="w-4 h-4 text-white" />
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
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Dna className="w-4 h-4 text-white" />
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
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
                  <Dna className="w-4 h-4 text-white" />
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
