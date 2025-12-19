import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Quote,
  FileCheck,
  Handshake,
  Route,
  Lightbulb
} from 'lucide-react';
import { useState } from 'react';
import type { BrandAdherenceResult, BrandElementScore } from '@/types/uplaybook';

interface BrandAdherenceScoreProps {
  adherence: BrandAdherenceResult;
  className?: string;
}

const ratingColors: Record<string, string> = {
  'Excellent': 'text-green-600 dark:text-green-400',
  'Good': 'text-blue-600 dark:text-blue-400',
  'Fair': 'text-amber-600 dark:text-amber-400',
  'Needs Improvement': 'text-red-600 dark:text-red-400',
};

const ratingBgColors: Record<string, string> = {
  'Excellent': 'bg-green-100 dark:bg-green-950/50 border-green-200 dark:border-green-800',
  'Good': 'bg-blue-100 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
  'Fair': 'bg-amber-100 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
  'Needs Improvement': 'bg-red-100 dark:bg-red-950/50 border-red-200 dark:border-red-800',
};

const strengthIcons: Record<string, React.ReactNode> = {
  'strong': <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />,
  'moderate': <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
  'weak': <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />,
  'absent': <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />,
};

const elementTypeIcons: Record<string, React.ReactNode> = {
  'promise': <Quote className="w-3.5 h-3.5" />,
  'pillar': <Award className="w-3.5 h-3.5" />,
  'proofPoint': <FileCheck className="w-3.5 h-3.5" />,
  'commitment': <Handshake className="w-3.5 h-3.5" />,
  'pathway': <Route className="w-3.5 h-3.5" />,
};

const elementTypeLabels: Record<string, string> = {
  'promise': 'Brand Promise',
  'pillar': 'Pillar',
  'proofPoint': 'Proof Point',
  'commitment': 'Commitment',
  'pathway': 'Pathway',
};

export function BrandAdherenceScore({ adherence, className = '' }: BrandAdherenceScoreProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const incorporatedCount = adherence.elementScores.filter(e => e.incorporated).length;
  const totalCount = adherence.elementScores.length;

  // Group elements by type
  const groupedElements = adherence.elementScores.reduce((acc, score) => {
    const type = score.elementType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(score);
    return acc;
  }, {} as Record<string, BrandElementScore[]>);

  return (
    <Card className={`border-primary/20 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Brand Adherence</CardTitle>
          </div>
          <Badge 
            variant="outline" 
            className={`${ratingBgColors[adherence.overallRating]} ${ratingColors[adherence.overallRating]} border`}
          >
            {adherence.overallRating}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          How well the generated content reflects your brand elements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Score</span>
            <span className={`font-bold text-lg ${ratingColors[adherence.overallRating]}`}>
              {adherence.overallScore}%
            </span>
          </div>
          <Progress value={adherence.overallScore} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {incorporatedCount} of {totalCount} selected brand elements incorporated
          </p>
        </div>

        {/* Summary */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm">{adherence.summary}</p>
        </div>

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="text-xs">View Element Details</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-4">
            {/* Element Scores by Type */}
            {Object.entries(groupedElements).map(([type, elements]) => (
              <div key={type} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {elementTypeIcons[type]}
                  <span>{elementTypeLabels[type]}s</span>
                </div>
                <div className="space-y-1.5">
                  {elements.map((element, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2 rounded-lg border text-sm flex items-start gap-2 ${
                        element.incorporated 
                          ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800/50' 
                          : 'bg-muted/30 border-border'
                      }`}
                    >
                      {strengthIcons[element.strength]}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs">{element.element}</p>
                        {element.evidence && (
                          <p className="text-xs text-muted-foreground mt-0.5 italic">
                            "{element.evidence}"
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] capitalize ${
                          element.strength === 'strong' ? 'border-green-500 text-green-600' :
                          element.strength === 'moderate' ? 'border-amber-500 text-amber-600' :
                          element.strength === 'weak' ? 'border-orange-500 text-orange-600' :
                          'border-red-500 text-red-600'
                        }`}
                      >
                        {element.strength}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Suggestions */}
            {adherence.suggestions && adherence.suggestions.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                    Suggestions
                  </span>
                </div>
                <ul className="space-y-1">
                  {adherence.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                      <span className="text-amber-500">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// Compact inline version for channel previews
export function BrandAdherenceBadge({ 
  adherence, 
  className = '' 
}: { 
  adherence: BrandAdherenceResult; 
  className?: string;
}) {
  const incorporatedCount = adherence.elementScores.filter(e => e.incorporated).length;
  const totalCount = adherence.elementScores.length;

  return (
    <Badge 
      variant="outline" 
      className={`${ratingBgColors[adherence.overallRating]} ${ratingColors[adherence.overallRating]} border ${className}`}
    >
      <Target className="w-3 h-3 mr-1" />
      Brand: {adherence.overallScore}% ({incorporatedCount}/{totalCount})
    </Badge>
  );
}
