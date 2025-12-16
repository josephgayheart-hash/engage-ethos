import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Shield, 
  Brain, 
  Gauge, 
  Users, 
  Heart,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import type { PillarEvaluation, Rating } from "@/types/persist";
import { cn } from "@/lib/utils";

interface PillarCardProps {
  evaluation: PillarEvaluation;
  index: number;
}

const pillarIcons = {
  authority: Shield,
  susceptibility: Brain,
  cognitive: Gauge,
  consensus: Users,
  ethics: Heart,
};

const pillarDescriptions = {
  authority: "Evaluates whether an authoritative source is clearly established and appropriate for the audience.",
  susceptibility: "Assesses whether the message accounts for audience context and responsiveness to persuasive cues.",
  cognitive: "Analyzes cognitive load, clarity of actions, and alignment with processing routes.",
  consensus: "Identifies social proof usage and whether it meaningfully supports the communication goal.",
  ethics: "Ensures the message preserves student choice and aligns with student-centered values.",
};

const ratingConfig: Record<Rating, { icon: typeof CheckCircle2; variant: 'strong' | 'moderate' | 'attention' }> = {
  'Strong': { icon: CheckCircle2, variant: 'strong' },
  'Moderate': { icon: AlertCircle, variant: 'moderate' },
  'Needs Attention': { icon: AlertTriangle, variant: 'attention' },
};

export function PillarCard({ evaluation, index }: PillarCardProps) {
  const Icon = pillarIcons[evaluation.pillarKey];
  const RatingIcon = ratingConfig[evaluation.rating].icon;
  const description = pillarDescriptions[evaluation.pillarKey];

  return (
    <Card 
      className={cn(
        "card-elevated overflow-hidden animate-slide-up",
        "hover:shadow-elevated-lg transition-shadow duration-300"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div 
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                evaluation.pillarKey === 'authority' && "bg-pillar-authority",
                evaluation.pillarKey === 'susceptibility' && "bg-pillar-susceptibility",
                evaluation.pillarKey === 'cognitive' && "bg-pillar-cognitive",
                evaluation.pillarKey === 'consensus' && "bg-pillar-consensus",
                evaluation.pillarKey === 'ethics' && "bg-pillar-ethics",
              )}
            >
              <Icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-foreground text-base">
                {evaluation.pillar}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            </div>
          </div>
          <Badge variant={ratingConfig[evaluation.rating].variant} className="flex items-center gap-1 shrink-0">
            <RatingIcon className="w-3 h-3" />
            {evaluation.rating}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose-academic">
          <p className="text-sm text-foreground/90 leading-relaxed">
            {evaluation.explanation}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">Recommendation</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {evaluation.recommendation}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
