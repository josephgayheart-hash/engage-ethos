import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, PenTool, User, FileText, Ruler, FolderPlus, Library, RefreshCw, Sparkles, ExternalLink, Map } from "lucide-react";
import { EvaluationResults } from "./EvaluationResults";
import { NextStepsBar } from "./NextStepsBar";
import { AIBadge } from "@/components/ui/ai-indicator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useContentDNAForGeneration } from "@/hooks/useContentDNAForGeneration";
import { openInGoogleDocs, formatForGoogleDocs } from "@/lib/googleDocsExport";
import { AIResultsGuidance } from "@/components/AIResultsGuidance";
import type { BuilderResult, MessageContext, InstitutionalConfig } from "@/types/campusvoice";
interface BuilderResultsProps {
  result: BuilderResult;
  context?: MessageContext;
  institutionalConfig?: InstitutionalConfig;
  onSaveToLibrary?: (content: string, title: string) => void;
  onSubmitToShared?: (content: string) => void;
  onRegeneratedDraft?: (draft: string) => void;
}

export function BuilderResults({ 
  result, 
  context, 
  institutionalConfig,
  onSaveToLibrary, 
  onSubmitToShared,
  onRegeneratedDraft 
}: BuilderResultsProps) {
  const { toast } = useToast();
  const { contentDNA } = useContentDNAForGeneration();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [activeDraft, setActiveDraft] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [drafts, setDrafts] = useState(result.drafts);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleOpenInGoogleDocs = async (draft: string, index: number) => {
    const formattedContent = formatForGoogleDocs(draft, {
      title: `Draft ${index + 1}: ${context?.domain || 'Message'}`,
      channel: context?.channel,
      audience: context?.audience,
      generatedAt: new Date(),
    });
    const success = await openInGoogleDocs(formattedContent);
    if (success) {
      toast({
        title: "Opening Google Docs",
        description: "Content copied! Paste (Ctrl/Cmd+V) in the new document.",
      });
    }
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

  const handleGenerateNew = async () => {
    if (!context) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-message', {
        body: { 
          type: 'builder',
          context,
          institutionalConfig,
          contentDNA: contentDNA || undefined
        }
      });

      if (error) throw error;
      
      if (data?.message) {
        const newDrafts = [...drafts, data.message];
        setDrafts(newDrafts);
        setActiveDraft(newDrafts.length - 1);
        onRegeneratedDraft?.(data.message);
        toast({ 
          title: "New draft generated",
          description: "AI created a new message based on your context."
        });
      }
    } catch (error) {
      console.error("Failed to generate:", error);
      toast({ 
        variant: "destructive",
        title: "Generation failed", 
        description: "Could not generate a new message. Please try again."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="card-elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <PenTool className="w-5 h-5 text-secondary" />
                Generated Messages
                <AIBadge className="ml-2" />
              </CardTitle>
              <CardDescription>
                Draft messages based on your context and goals
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateNew}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate New
                </>
              )}
            </Button>
          </div>
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
          <Tabs value={`draft-${activeDraft}`} onValueChange={(v) => setActiveDraft(parseInt(v.split('-')[1]))}>
            <TabsList className={`grid w-full`} style={{ gridTemplateColumns: `repeat(${Math.min(drafts.length, 4)}, 1fr)` }}>
              {drafts.slice(0, 4).map((_, index) => (
                <TabsTrigger key={index} value={`draft-${index}`}>
                  Draft {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>
            {drafts.map((draft, index) => (
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenInGoogleDocs(draft, index)}
                        title="Copy into Google Docs"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm whitespace-pre-wrap pr-24">{draft}</p>
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

      <NextStepsBar
        message="Message generated — what would you like to do next?"
        steps={[
          { label: "Evaluate This Message", href: "/evaluate", icon: FileText },
          { label: "Design a Journey", href: "/strategy", icon: Map },
        ]}
      />

      <AIResultsGuidance />
    </div>
  );
}
