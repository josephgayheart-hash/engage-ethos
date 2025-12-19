import { useState } from 'react';
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
  Info,
  FileCheck,
  Route
} from 'lucide-react';
import type { BrandPlatform, BrandPillar, BrandPathway } from '@/types/uplaybook';

// Selected brand elements for generation
export interface BrandLayerSelection {
  pillars: string[];
  proofPoints: string[];
  commitments: string[];
  pathways: string[];
  includePromise: boolean;
}

interface BrandLayerSelectorProps {
  brandPlatform: BrandPlatform | null;
  selection: BrandLayerSelection;
  onSelectionChange: (selection: BrandLayerSelection) => void;
  isLoading?: boolean;
  className?: string;
  compact?: boolean;
}

const defaultSelection: BrandLayerSelection = {
  pillars: [],
  proofPoints: [],
  commitments: [],
  pathways: [],
  includePromise: true,
};

export function BrandLayerSelector({
  brandPlatform,
  selection = defaultSelection,
  onSelectionChange,
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
    const newPillars = selection.pillars.includes(pillarName)
      ? selection.pillars.filter(p => p !== pillarName)
      : [...selection.pillars, pillarName];
    onSelectionChange({ ...selection, pillars: newPillars });
  };

  const toggleProofPoint = (point: string) => {
    const newPoints = selection.proofPoints.includes(point)
      ? selection.proofPoints.filter(p => p !== point)
      : [...selection.proofPoints, point];
    onSelectionChange({ ...selection, proofPoints: newPoints });
  };

  const toggleCommitment = (commitment: string) => {
    const newCommitments = selection.commitments.includes(commitment)
      ? selection.commitments.filter(c => c !== commitment)
      : [...selection.commitments, commitment];
    onSelectionChange({ ...selection, commitments: newCommitments });
  };

  const togglePathway = (pathwayName: string) => {
    const newPathways = selection.pathways.includes(pathwayName)
      ? selection.pathways.filter(p => p !== pathwayName)
      : [...selection.pathways, pathwayName];
    onSelectionChange({ ...selection, pathways: newPathways });
  };

  const togglePromise = () => {
    onSelectionChange({ ...selection, includePromise: !selection.includePromise });
  };

  const selectAll = () => {
    if (!brandPlatform) return;
    onSelectionChange({
      pillars: brandPlatform.brandPillars?.map(p => p.name) || [],
      proofPoints: brandPlatform.proofPoints || [],
      commitments: brandPlatform.commitments || [],
      pathways: brandPlatform.brandPathways?.map(p => p.name) || [],
      includePromise: true,
    });
  };

  const clearAll = () => {
    onSelectionChange(defaultSelection);
  };

  const totalSelected = 
    selection.pillars.length + 
    selection.proofPoints.length + 
    selection.commitments.length + 
    selection.pathways.length +
    (selection.includePromise ? 1 : 0);

  if (compact) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className={className}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span>Brand Layer</span>
              {totalSelected > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {totalSelected} selected
                </Badge>
              )}
            </div>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <BrandPlatformDetails 
            brandPlatform={brandPlatform!}
            selection={selection}
            onTogglePillar={togglePillar}
            onToggleProofPoint={toggleProofPoint}
            onToggleCommitment={toggleCommitment}
            onTogglePathway={togglePathway}
            onTogglePromise={togglePromise}
            onSelectAll={selectAll}
            onClearAll={clearAll}
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
            <CardTitle className="text-base">Brand Platform</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear
            </Button>
          </div>
        </div>
        <CardDescription>
          Select brand elements to emphasize in your message - pillars, proof points, commitments, and pathways
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BrandPlatformDetails 
          brandPlatform={brandPlatform!}
          selection={selection}
          onTogglePillar={togglePillar}
          onToggleProofPoint={toggleProofPoint}
          onToggleCommitment={toggleCommitment}
          onTogglePathway={togglePathway}
          onTogglePromise={togglePromise}
          onSelectAll={selectAll}
          onClearAll={clearAll}
        />
      </CardContent>
    </Card>
  );
}

interface BrandPlatformDetailsProps {
  brandPlatform: BrandPlatform;
  selection: BrandLayerSelection;
  onTogglePillar: (name: string) => void;
  onToggleProofPoint: (point: string) => void;
  onToggleCommitment: (commitment: string) => void;
  onTogglePathway: (name: string) => void;
  onTogglePromise: () => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

function BrandPlatformDetails({
  brandPlatform,
  selection,
  onTogglePillar,
  onToggleProofPoint,
  onToggleCommitment,
  onTogglePathway,
  onTogglePromise,
}: BrandPlatformDetailsProps) {
  return (
    <div className="space-y-4">
      {/* Brand Promise */}
      {brandPlatform.brandPromise && (
        <div 
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            selection.includePromise
              ? 'border-primary bg-primary/10'
              : 'border-border bg-background hover:border-primary/50'
          }`}
          onClick={onTogglePromise}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              checked={selection.includePromise}
              onCheckedChange={onTogglePromise}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Quote className="w-4 h-4 text-muted-foreground" />
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Brand Promise
                </Label>
                {selection.includePromise && (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                )}
              </div>
              <p className="text-sm font-medium">{brandPlatform.brandPromise}</p>
            </div>
          </div>
        </div>
      )}

      {/* Brand Pillars */}
      {brandPlatform.brandPillars && brandPlatform.brandPillars.length > 0 && (
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
            <Award className="w-3 h-3" />
            Brand Pillars ({selection.pillars.length}/{brandPlatform.brandPillars.length} selected)
          </Label>
          <div className="space-y-2 mt-2">
            {brandPlatform.brandPillars.map((pillar) => (
              <div
                key={pillar.name}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selection.pillars.includes(pillar.name)
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background hover:border-primary/50'
                }`}
                onClick={() => onTogglePillar(pillar.name)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selection.pillars.includes(pillar.name)}
                    onCheckedChange={() => onTogglePillar(pillar.name)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{pillar.name}</span>
                      {selection.pillars.includes(pillar.name) && (
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

      {/* Proof Points - Selectable */}
      {brandPlatform.proofPoints && brandPlatform.proofPoints.length > 0 && (
        <Collapsible defaultOpen={selection.proofPoints.length > 0}>
          <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors w-full justify-between">
            <div className="flex items-center gap-1">
              <FileCheck className="w-3 h-3" />
              Proof Points ({selection.proofPoints.length}/{brandPlatform.proofPoints.length} selected)
            </div>
            <ChevronDown className="w-3 h-3" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {brandPlatform.proofPoints.map((point, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border cursor-pointer transition-all flex items-start gap-2 ${
                      selection.proofPoints.includes(point)
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background hover:border-primary/50'
                    }`}
                    onClick={() => onToggleProofPoint(point)}
                  >
                    <Checkbox
                      checked={selection.proofPoints.includes(point)}
                      onCheckedChange={() => onToggleProofPoint(point)}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-foreground">{point}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Commitments - Selectable */}
      {brandPlatform.commitments && brandPlatform.commitments.length > 0 && (
        <Collapsible defaultOpen={selection.commitments.length > 0}>
          <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors w-full justify-between">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Commitments ({selection.commitments.length}/{brandPlatform.commitments.length} selected)
            </div>
            <ChevronDown className="w-3 h-3" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="space-y-2">
              {brandPlatform.commitments.map((commitment, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border cursor-pointer transition-all flex items-start gap-2 ${
                    selection.commitments.includes(commitment)
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background hover:border-primary/50'
                  }`}
                  onClick={() => onToggleCommitment(commitment)}
                >
                  <Checkbox
                    checked={selection.commitments.includes(commitment)}
                    onCheckedChange={() => onToggleCommitment(commitment)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-foreground">{commitment}</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Pathways - Selectable */}
      {brandPlatform.brandPathways && brandPlatform.brandPathways.length > 0 && (
        <Collapsible defaultOpen={selection.pathways.length > 0}>
          <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors w-full justify-between">
            <div className="flex items-center gap-1">
              <Route className="w-3 h-3" />
              Brand Pathways ({selection.pathways.length}/{brandPlatform.brandPathways.length} selected)
            </div>
            <ChevronDown className="w-3 h-3" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="space-y-2">
              {brandPlatform.brandPathways.map((pathway, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selection.pathways.includes(pathway.name)
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background hover:border-primary/50'
                  }`}
                  onClick={() => onTogglePathway(pathway.name)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selection.pathways.includes(pathway.name)}
                      onCheckedChange={() => onTogglePathway(pathway.name)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{pathway.name}</span>
                        {selection.pathways.includes(pathway.name) && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{pathway.description}</p>
                    </div>
                  </div>
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
  selection,
  className = '',
}: {
  brandPlatform: BrandPlatform | null;
  selection: BrandLayerSelection;
  className?: string;
}) {
  if (!brandPlatform) return null;

  const totalSelected = 
    selection.pillars.length + 
    selection.proofPoints.length + 
    selection.commitments.length + 
    selection.pathways.length +
    (selection.includePromise ? 1 : 0);

  if (totalSelected === 0) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className={`bg-primary/10 border-primary/30 ${className}`}>
          <Target className="w-3 h-3 mr-1" />
          {totalSelected} Brand Element{totalSelected !== 1 ? 's' : ''} Applied
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="space-y-2">
          {selection.includePromise && (
            <div>
              <p className="font-medium text-xs">Brand Promise</p>
              <p className="text-xs text-muted-foreground">✓ Included</p>
            </div>
          )}
          {selection.pillars.length > 0 && (
            <div>
              <p className="font-medium text-xs">Pillars ({selection.pillars.length})</p>
              <ul className="text-xs text-muted-foreground">
                {selection.pillars.map(p => <li key={p}>• {p}</li>)}
              </ul>
            </div>
          )}
          {selection.proofPoints.length > 0 && (
            <div>
              <p className="font-medium text-xs">Proof Points ({selection.proofPoints.length})</p>
            </div>
          )}
          {selection.commitments.length > 0 && (
            <div>
              <p className="font-medium text-xs">Commitments ({selection.commitments.length})</p>
            </div>
          )}
          {selection.pathways.length > 0 && (
            <div>
              <p className="font-medium text-xs">Pathways ({selection.pathways.length})</p>
              <ul className="text-xs text-muted-foreground">
                {selection.pathways.map(p => <li key={p}>• {p}</li>)}
              </ul>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// Legacy adapter for backward compatibility with selectedPillars
export function useBrandLayerSelectionAdapter(
  selectedPillars: string[],
  onPillarsChange: (pillars: string[]) => void
): [BrandLayerSelection, (selection: BrandLayerSelection) => void] {
  const selection: BrandLayerSelection = {
    pillars: selectedPillars,
    proofPoints: [],
    commitments: [],
    pathways: [],
    includePromise: true,
  };

  const setSelection = (newSelection: BrandLayerSelection) => {
    onPillarsChange(newSelection.pillars);
  };

  return [selection, setSelection];
}
