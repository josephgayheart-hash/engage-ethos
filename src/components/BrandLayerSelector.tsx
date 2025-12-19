import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Target, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Award,
  Quote,
  CheckCircle2,
  AlertCircle,
  Info,
  FileCheck,
  Route,
  Handshake
} from 'lucide-react';
import type { BrandPlatform } from '@/types/uplaybook';

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
  const [activeTab, setActiveTab] = useState('pillars');

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
          <TooltipContent className="max-w-xs bg-popover text-popover-foreground border shadow-lg z-50">
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

  // Count items per category
  const pillarCount = brandPlatform?.brandPillars?.length || 0;
  const proofCount = brandPlatform?.proofPoints?.length || 0;
  const commitmentCount = brandPlatform?.commitments?.length || 0;
  const pathwayCount = brandPlatform?.brandPathways?.length || 0;

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
          <BrandPlatformTabs 
            brandPlatform={brandPlatform!}
            selection={selection}
            activeTab={activeTab}
            onTabChange={setActiveTab}
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
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Brand Platform</CardTitle>
            {totalSelected > 0 && (
              <Badge variant="default" className="ml-1">
                {totalSelected} selected
              </Badge>
            )}
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
          Select brand elements to emphasize in your message
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BrandPlatformTabs 
          brandPlatform={brandPlatform!}
          selection={selection}
          activeTab={activeTab}
          onTabChange={setActiveTab}
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

interface BrandPlatformTabsProps {
  brandPlatform: BrandPlatform;
  selection: BrandLayerSelection;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onTogglePillar: (name: string) => void;
  onToggleProofPoint: (point: string) => void;
  onToggleCommitment: (commitment: string) => void;
  onTogglePathway: (name: string) => void;
  onTogglePromise: () => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

function BrandPlatformTabs({
  brandPlatform,
  selection,
  activeTab,
  onTabChange,
  onTogglePillar,
  onToggleProofPoint,
  onToggleCommitment,
  onTogglePathway,
  onTogglePromise,
}: BrandPlatformTabsProps) {
  const pillarCount = brandPlatform?.brandPillars?.length || 0;
  const proofCount = brandPlatform?.proofPoints?.length || 0;
  const commitmentCount = brandPlatform?.commitments?.length || 0;
  const pathwayCount = brandPlatform?.brandPathways?.length || 0;

  // Determine which tabs to show based on available data
  const availableTabs = [
    { id: 'pillars', label: 'Pillars', icon: Award, count: pillarCount, selected: selection.pillars.length },
    { id: 'proofPoints', label: 'Proof Points', icon: FileCheck, count: proofCount, selected: selection.proofPoints.length },
    { id: 'commitments', label: 'Commitments', icon: Handshake, count: commitmentCount, selected: selection.commitments.length },
    { id: 'pathways', label: 'Pathways', icon: Route, count: pathwayCount, selected: selection.pathways.length },
  ].filter(tab => tab.count > 0);

  return (
    <div className="space-y-4">
      {/* Selection Summary - At the top for visibility */}
      {(selection.pillars.length > 0 || selection.proofPoints.length > 0 || 
        selection.commitments.length > 0 || selection.pathways.length > 0 || selection.includePromise) && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
          <Label className="text-xs font-semibold text-primary mb-2 block">Active Brand Elements</Label>
          <div className="flex flex-wrap gap-1.5">
            {selection.includePromise && (
              <Badge className="text-xs bg-primary text-primary-foreground">
                <Quote className="w-3 h-3 mr-1" />
                Promise
              </Badge>
            )}
            {selection.pillars.map(p => (
              <Badge key={p} className="text-xs bg-primary text-primary-foreground">
                <Award className="w-3 h-3 mr-1" />
                {p}
              </Badge>
            ))}
            {selection.proofPoints.length > 0 && (
              <Badge className="text-xs bg-secondary text-secondary-foreground border border-border">
                <FileCheck className="w-3 h-3 mr-1" />
                {selection.proofPoints.length} proof point{selection.proofPoints.length > 1 ? 's' : ''}
              </Badge>
            )}
            {selection.commitments.length > 0 && (
              <Badge className="text-xs bg-secondary text-secondary-foreground border border-border">
                <Handshake className="w-3 h-3 mr-1" />
                {selection.commitments.length} commitment{selection.commitments.length > 1 ? 's' : ''}
              </Badge>
            )}
            {selection.pathways.map(p => (
              <Badge key={p} className="text-xs bg-accent text-accent-foreground">
                <Route className="w-3 h-3 mr-1" />
                {p}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Brand Promise */}
      {brandPlatform.brandPromise && (
        <div 
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            selection.includePromise
              ? 'border-primary bg-primary/10 ring-1 ring-primary/20'
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
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Quote className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Brand Promise
                </Label>
                {selection.includePromise && (
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-sm font-medium">{brandPlatform.brandPromise}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabbed interface for other elements */}
      {availableTabs.length > 0 && (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full h-auto p-1 bg-muted/50" style={{ gridTemplateColumns: `repeat(${availableTabs.length}, 1fr)` }}>
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex flex-col gap-0.5 py-2 px-2 text-xs data-[state=active]:bg-background"
                >
                  <div className="flex items-center gap-1">
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge 
                      variant={tab.selected > 0 ? "default" : "outline"} 
                      className="text-[10px] px-1.5 py-0 h-4"
                    >
                      {tab.selected}/{tab.count}
                    </Badge>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Pillars Tab */}
          <TabsContent value="pillars" className="mt-3 space-y-2">
            {brandPlatform.brandPillars?.map((pillar) => (
              <div
                key={pillar.name}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selection.pillars.includes(pillar.name)
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/20'
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{pillar.name}</span>
                      {selection.pillars.includes(pillar.name) && (
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
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
                            +{pillar.keywords.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Proof Points Tab */}
          <TabsContent value="proofPoints" className="mt-3 space-y-2">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-xs text-muted-foreground">
                Select proof points to reference in your message
              </Label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={() => {
                  if (selection.proofPoints.length === (brandPlatform.proofPoints?.length || 0)) {
                    // Deselect all proof points
                    brandPlatform.proofPoints?.forEach(p => {
                      if (selection.proofPoints.includes(p)) {
                        onToggleProofPoint(p);
                      }
                    });
                  } else {
                    // Select all proof points
                    brandPlatform.proofPoints?.forEach(p => {
                      if (!selection.proofPoints.includes(p)) {
                        onToggleProofPoint(p);
                      }
                    });
                  }
                }}
              >
                {selection.proofPoints.length === (brandPlatform.proofPoints?.length || 0) ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            {brandPlatform.proofPoints?.map((point, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selection.proofPoints.includes(point)
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/20'
                    : 'border-border bg-background hover:border-primary/50'
                }`}
                onClick={() => onToggleProofPoint(point)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selection.proofPoints.includes(point)}
                    onCheckedChange={() => onToggleProofPoint(point)}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <span className="text-sm">{point}</span>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Commitments Tab */}
          <TabsContent value="commitments" className="mt-3 space-y-2">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-xs text-muted-foreground">
                Select commitments to emphasize
              </Label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={() => {
                  if (selection.commitments.length === (brandPlatform.commitments?.length || 0)) {
                    brandPlatform.commitments?.forEach(c => {
                      if (selection.commitments.includes(c)) {
                        onToggleCommitment(c);
                      }
                    });
                  } else {
                    brandPlatform.commitments?.forEach(c => {
                      if (!selection.commitments.includes(c)) {
                        onToggleCommitment(c);
                      }
                    });
                  }
                }}
              >
                {selection.commitments.length === (brandPlatform.commitments?.length || 0) ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            {brandPlatform.commitments?.map((commitment, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selection.commitments.includes(commitment)
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/20'
                    : 'border-border bg-background hover:border-primary/50'
                }`}
                onClick={() => onToggleCommitment(commitment)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selection.commitments.includes(commitment)}
                    onCheckedChange={() => onToggleCommitment(commitment)}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <span className="text-sm">{commitment}</span>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Pathways Tab */}
          <TabsContent value="pathways" className="mt-3 space-y-2">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-xs text-muted-foreground">
                Select brand pathways to incorporate
              </Label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={() => {
                  if (selection.pathways.length === (brandPlatform.brandPathways?.length || 0)) {
                    brandPlatform.brandPathways?.forEach(p => {
                      if (selection.pathways.includes(p.name)) {
                        onTogglePathway(p.name);
                      }
                    });
                  } else {
                    brandPlatform.brandPathways?.forEach(p => {
                      if (!selection.pathways.includes(p.name)) {
                        onTogglePathway(p.name);
                      }
                    });
                  }
                }}
              >
                {selection.pathways.length === (brandPlatform.brandPathways?.length || 0) ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            {brandPlatform.brandPathways?.map((pathway, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selection.pathways.includes(pathway.name)
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/20'
                    : 'border-border bg-background hover:border-primary/50'
                }`}
                onClick={() => onTogglePathway(pathway.name)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selection.pathways.includes(pathway.name)}
                    onCheckedChange={() => onTogglePathway(pathway.name)}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{pathway.name}</span>
                      {selection.pathways.includes(pathway.name) && (
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{pathway.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
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
