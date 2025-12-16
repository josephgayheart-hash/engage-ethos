import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, PenTool, User, FileText, Ruler } from "lucide-react";
import { EvaluationResults } from "./EvaluationResults";
import type { BuilderResult } from "@/types/persist";

interface BuilderResultsProps {
  result: BuilderResult;
}

export function BuilderResults({ result }: BuilderResultsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <PenTool className="w-5 h-5 text-secondary" />
            Generated Messages
          </CardTitle>
          <CardDescription>
            Draft messages based on your context and goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-secondary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Recommended Sender</p>
                <p className="text-sm font-medium">{result.recommendedSender}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-secondary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Authority Level</p>
                <p className="text-sm font-medium">{result.recommendedAuthority}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Ruler className="w-4 h-4 text-secondary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Recommended Length</p>
                <p className="text-sm font-medium">{result.recommendedLength}</p>
              </div>
            </div>
          </div>

          {/* Drafts */}
          <Tabs defaultValue="draft-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="draft-1">Draft 1</TabsTrigger>
              <TabsTrigger value="draft-2">Draft 2</TabsTrigger>
            </TabsList>
            {result.drafts.map((draft, index) => (
              <TabsContent key={index} value={`draft-${index + 1}`}>
                <div className="relative p-4 bg-card border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(draft, index)}
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <p className="text-sm whitespace-pre-wrap pr-10">{draft}</p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Evaluation of drafts */}
      {result.evaluation && (
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-medium">Draft Evaluation</h3>
          <EvaluationResults result={result.evaluation} />
        </div>
      )}
    </div>
  );
}
