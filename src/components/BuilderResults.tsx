import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, PenTool, User, FileText, Ruler, FolderPlus, Library, Save } from "lucide-react";
import { EvaluationResults } from "./EvaluationResults";
import type { BuilderResult, MessageContext } from "@/types/persist";
import { useToast } from "@/hooks/use-toast";

interface BuilderResultsProps {
  result: BuilderResult;
  context?: MessageContext;
  onSaveToLibrary?: (content: string, title: string) => void;
  onSubmitToShared?: (content: string) => void;
}

export function BuilderResults({ result, context, onSaveToLibrary, onSubmitToShared }: BuilderResultsProps) {
  const { toast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [activeDraft, setActiveDraft] = useState(0);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveToLibrary = (draft: string, index: number) => {
    if (onSaveToLibrary) {
      const title = `Generated: ${context?.domain || context?.moment || 'message'} for ${context?.audience || 'students'}`;
      onSaveToLibrary(draft, title);
      setSavedIndex(index);
      setTimeout(() => setSavedIndex(null), 2000);
      toast({ title: "Saved to your library" });
    }
  };

  const handleSubmitToShared = (draft: string) => {
    if (onSubmitToShared) {
      onSubmitToShared(draft);
      toast({ 
        title: "Submitted for review", 
        description: "Your template will appear in the Shared Library after approval."
      });
    }
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
          <Tabs defaultValue="draft-0" onValueChange={(v) => setActiveDraft(parseInt(v.split('-')[1]))}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="draft-0">Draft 1</TabsTrigger>
              <TabsTrigger value="draft-1">Draft 2</TabsTrigger>
            </TabsList>
            {result.drafts.map((draft, index) => (
              <TabsContent key={index} value={`draft-${index}`}>
                <div className="relative p-4 bg-card border border-border rounded-lg">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(draft, index)}
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap pr-20">{draft}</p>
                </div>
                
                {/* Save Actions */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {onSaveToLibrary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveToLibrary(draft, index)}
                      className="flex items-center gap-2"
                    >
                      {savedIndex === index ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <FolderPlus className="w-4 h-4" />
                      )}
                      Save to My Library
                    </Button>
                  )}
                  {onSubmitToShared && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSubmitToShared(draft)}
                      className="flex items-center gap-2"
                    >
                      <Library className="w-4 h-4" />
                      Submit to Shared Library
                    </Button>
                  )}
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
