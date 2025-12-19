import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Target, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Award,
  Compass,
  Quote,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import type { BrandPlatform, BrandPillar } from '@/types/uplaybook';

interface BrandLayerSelectorProps {
  brandPlatform: BrandPlatform | null;
  selectedPillars: string[];
  onPillarsChange: (pillars: string[]) => void;
  isLoading?: boolean;
  className?: string;
  compact?: boolean;
}

export function BrandLayerSelector({
  brandPlatform,
  selectedPillars,
  onPillarsChange,
  isLoading = false,
  className = '',
  compact = false,
}: BrandLayerSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);

  // If no brand platform exists, show a minimal indicator
  if (!brandPlatform && !isLoading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span>No brand platform configured</span>
        <Tooltip>
          <TooltipTrigger>
            <Info className="w-4 h-4" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Upload content samples in Content DNA to extract your brand pillars, promise, and proof points.</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground animate-pulse ${className}`}>
        <Sparkles className="w-4 h-4" />
        <span>Loading brand platform...</span>
      </div>
    );
  }

  const togglePillar = (pillarName: string) => {
    if (selectedPillars.includes(pillarName)) {
      onPillarsChange(selectedPillars.filter(p => p !== pillarName));
    } else {
      onPillarsChange([...selectedPillars, pillarName]);
    }
  };

  const selectAllPillars = () => {
    if (!brandPlatform) return;
    onPillarsChange(brandPlatform.brandPillars.map(p => p.name));
  };

  const clearAllPillars = () => {
    onPillarsChange([]);
  };

  if (compact) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className={className}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span>Brand Layer</span>
              {selectedPillars.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedPillars.length} pillar{selectedPillars.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <BrandPlatformDetails 
            brandPlatform={brandPlatform!}
            selectedPillars={selectedPillars}
            onTogglePillar={togglePillar}
            onSelectAll={selectAllPillars}
            onClearAll={clearAllPillars}
          />
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Card className={`border-primary/20 bg-primary/5 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Brand Layer</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={selectAllPillars}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAllPillars}>
              Clear
            </Button>
          </div>
        </div>
        <CardDescription>
          Select which brand pillars to emphasize in your message
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BrandPlatformDetails 
          brandPlatform={brandPlatform!}
          selectedPillars={selectedPillars}
          onTogglePillar={togglePillar}
          onSelectAll={selectAllPillars}
          onClearAll={clearAllPillars}
        />
      </CardContent>
    </Card>
  );
}

interface BrandPlatformDetailsProps {
  brandPlatform: BrandPlatform;
  selectedPillars: string[];
  onTogglePillar: (name: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

function BrandPlatformDetails({
  brandPlatform,
  selectedPillars,
  onTogglePillar,
}: BrandPlatformDetailsProps) {
  return (
    <div className="space-y-4">
      {/* Brand Promise */}
      {brandPlatform.brandPromise && (
        <div className="p-3 rounded-lg bg-background border">
          <div className="flex items-center gap-2 mb-1">
            <Quote className="w-4 h-4 text-muted-foreground" />
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Brand Promise
            </Label>
          </div>
          <p className="text-sm font-medium">{brandPlatform.brandPromise}</p>
        </div>
      )}

      {/* Brand Pillars */}
      {brandPlatform.brandPillars && brandPlatform.brandPillars.length > 0 && (
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
            <Award className="w-3 h-3" />
            Brand Pillars (select to emphasize)
          </Label>
          <div className="space-y-2 mt-2">
            {brandPlatform.brandPillars.map((pillar) => (
              <div
                key={pillar.name}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedPillars.includes(pillar.name)
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background hover:border-primary/50'
                }`}
                onClick={() => onTogglePillar(pillar.name)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedPillars.includes(pillar.name)}
                    onCheckedChange={() => onTogglePillar(pillar.name)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{pillar.name}</span>
                      {selectedPillars.includes(pillar.name) && (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{pillar.description}</p>
                    {pillar.keywords && pillar.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {pillar.keywords.slice(0, 4).map((keyword) => (
                          <Badge key={keyword} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {pillar.keywords.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{pillar.keywords.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proof Points - Collapsible */}
      {brandPlatform.proofPoints && brandPlatform.proofPoints.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
            <Compass className="w-3 h-3" />
            Proof Points ({brandPlatform.proofPoints.length})
            <ChevronDown className="w-3 h-3" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <ScrollArea className="max-h-32">
              <ul className="space-y-1 text-sm">
                {brandPlatform.proofPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-primary">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Commitments - Collapsible */}
      {brandPlatform.commitments && brandPlatform.commitments.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
            <CheckCircle2 className="w-3 h-3" />
            Commitments ({brandPlatform.commitments.length})
            <ChevronDown className="w-3 h-3" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <ul className="space-y-1 text-sm">
              {brandPlatform.commitments.map((commitment, idx) => (
                <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-primary">•</span>
                  {commitment}
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Pathways - Collapsible */}
      {brandPlatform.brandPathways && brandPlatform.brandPathways.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
            <Compass className="w-3 h-3" />
            Brand Pathways ({brandPlatform.brandPathways.length})
            <ChevronDown className="w-3 h-3" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="space-y-2">
              {brandPlatform.brandPathways.map((pathway, idx) => (
                <div key={idx} className="p-2 rounded bg-muted/50">
                  <p className="font-medium text-sm">{pathway.name}</p>
                  <p className="text-xs text-muted-foreground">{pathway.description}</p>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

// Active indicator badge for displaying in generated content
export function BrandLayerActiveBadge({
  brandPlatform,
  selectedPillars,
  className = '',
}: {
  brandPlatform: BrandPlatform | null;
  selectedPillars: string[];
  className?: string;
}) {
  if (!brandPlatform || selectedPillars.length === 0) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className={`bg-primary/10 border-primary/30 ${className}`}>
          <Target className="w-3 h-3 mr-1" />
          {selectedPillars.length} Pillar{selectedPillars.length !== 1 ? 's' : ''} Applied
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-medium mb-1">Active Brand Pillars:</p>
        <ul className="text-xs">
          {selectedPillars.map(p => (
            <li key={p}>• {p}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
