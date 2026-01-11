import { useState } from "react";
import { RefinedMessages } from "./RefinedMessages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Brain, 
  Gauge, 
  Users, 
  Heart,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EvaluationResult, PillarEvaluation, Rating } from "@/types/campusvoice";

interface EvaluationResultsProps {
  result: EvaluationResult;
}

const pillarIcons = {
  authority: Shield,
  susceptibility: Brain,
  cognitive: Gauge,
  consensus: Users,
  ethics: Heart,
};

const pillarColors = {
  authority: "bg-pillar-authority",
  susceptibility: "bg-pillar-susceptibility",
  cognitive: "bg-pillar-cognitive",
  consensus: "bg-pillar-consensus",
  ethics: "bg-pillar-ethics",
};

const ratingConfig: Record<Rating, { icon: typeof CheckCircle2; variant: 'strong' | 'moderate' | 'attention' }> = {
  'Strong': { icon: CheckCircle2, variant: 'strong' },
  'Moderate': { icon: AlertCircle, variant: 'moderate' },
  'Needs Attention': { icon: AlertTriangle, variant: 'attention' },
};

function PillarBadge({ evaluation, isExpanded, onClick }: { 
  evaluation: PillarEvaluation; 
  isExpanded: boolean;
  onClick: () => void;
}) {
  const Icon = pillarIcons[evaluation.pillarKey] || Shield;
  const ratingData = ratingConfig[evaluation.rating] || ratingConfig['Moderate'];
  const RatingIcon = ratingData.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all cursor-pointer min-w-[80px]",
        "hover:bg-muted/50",
        isExpanded && "bg-muted/70 ring-2 ring-primary/20"
      )}
    >
      <div 
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center",
          pillarColors[evaluation.pillarKey]
        )}
      >
        <Icon className="w-4 h-4 text-primary-foreground" />
      </div>
      <span className="text-xs font-medium text-foreground truncate max-w-[70px]">
        {evaluation.pillar.split(' ')[0]}
      </span>
      <Badge variant={ratingData.variant} className="text-[10px] px-1.5 py-0 h-5">
        <RatingIcon className="w-2.5 h-2.5 mr-0.5" />
        {evaluation.rating === 'Needs Attention' ? 'Attention' : evaluation.rating}
      </Badge>
    </button>
  );
}

export function EvaluationResults({ result }: EvaluationResultsProps) {
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  const handlePillarClick = (pillarKey: string) => {
    setExpandedPillar(expandedPillar === pillarKey ? null : pillarKey);
  };

  const expandedEvaluation = expandedPillar 
    ? result.pillars.find(p => p.pillarKey === expandedPillar) 
    : null;

  return (
    <div className="space-y-4">
      <Card className="card-elevated animate-slide-up">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="font-serif text-lg">Pillar Evaluation</CardTitle>
            <span className="text-xs text-muted-foreground">Click a pillar for details</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Compact Summary Bar */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {result.pillars.map((pillar) => (
              <PillarBadge 
                key={pillar.pillarKey}
                evaluation={pillar}
                isExpanded={expandedPillar === pillar.pillarKey}
                onClick={() => handlePillarClick(pillar.pillarKey)}
              />
            ))}
          </div>

          {/* Expanded Details */}
          {expandedEvaluation && (
            <div className="animate-fade-in border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">{expandedEvaluation.pillar}</h4>
                <button 
                  onClick={() => setExpandedPillar(null)}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {expandedEvaluation.explanation}
              </p>
              <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-1">Recommendation</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {expandedEvaluation.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <RefinedMessages
        refinedMessage={result.refinedMessage}
        reducedLoadMessage={result.reducedLoadMessage}
        changeExplanation={result.changeExplanation}
      />
    </div>
  );
}
