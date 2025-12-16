import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight, Map } from "lucide-react";
import type { MapperResult } from "@/types/persist";

interface MapperResultsProps {
  result: MapperResult;
}

const emphasisColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
};

export function MapperResults({ result }: MapperResultsProps) {
  return (
    <div className="space-y-6">
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <Map className="w-5 h-5 text-secondary" />
            Messaging Strategy Map
          </CardTitle>
          <CardDescription>
            Strategic recommendations for your communication plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.recommendations.map((rec, index) => (
            <div 
              key={index}
              className="p-4 border border-border rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize">{rec.domain}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <Badge className={emphasisColors[rec.emphasis]}>
                    {rec.emphasis} emphasis
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Authority Balance:</span> {rec.authorityBalance}
              </p>
              
              {rec.risks.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">Risks to avoid: </span>
                    {rec.risks.join('; ')}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {result.strategyNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Strategy Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {result.strategyNotes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
