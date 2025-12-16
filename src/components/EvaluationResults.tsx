import { PillarCard } from "./PillarCard";
import { RefinedMessages } from "./RefinedMessages";
import type { EvaluationResult } from "@/types/persist";

interface EvaluationResultsProps {
  result: EvaluationResult;
}

export function EvaluationResults({ result }: EvaluationResultsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-bold text-foreground mb-1">
          Five-Pillar Evaluation
        </h2>
        <p className="text-sm text-muted-foreground">
          Analysis based on peer-reviewed persuasion and communication research tested in higher education contexts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {result.pillars.map((pillar, index) => (
          <PillarCard key={pillar.pillarKey} evaluation={pillar} index={index} />
        ))}
      </div>

      <RefinedMessages
        refinedMessage={result.refinedMessage}
        reducedLoadMessage={result.reducedLoadMessage}
        changeExplanation={result.changeExplanation}
      />
    </div>
  );
}
