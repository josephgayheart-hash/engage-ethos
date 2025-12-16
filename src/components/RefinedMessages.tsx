import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sparkles, Feather, Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RefinedMessagesProps {
  refinedMessage: string;
  reducedLoadMessage: string;
  changeExplanation: string;
}

export function RefinedMessages({ 
  refinedMessage, 
  reducedLoadMessage, 
  changeExplanation 
}: RefinedMessagesProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleCopy = async (text: string, tab: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <Card className="card-elevated animate-slide-up" style={{ animationDelay: '500ms' }}>
      <CardHeader>
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-secondary" />
          Refined Message Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="optimized" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="optimized" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Clarity & Authority
            </TabsTrigger>
            <TabsTrigger value="reduced" className="flex items-center gap-2">
              <Feather className="w-4 h-4" />
              Reduced Load
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="optimized" className="mt-4 space-y-3">
            <div className="relative">
              <div className="bg-muted/30 rounded-lg p-4 border border-border text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {refinedMessage}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(refinedMessage, 'optimized')}
              >
                {copiedTab === 'optimized' ? (
                  <Check className="w-4 h-4 text-status-strong" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Optimized for clarity and authority alignment based on research findings.
            </p>
          </TabsContent>
          
          <TabsContent value="reduced" className="mt-4 space-y-3">
            <div className="relative">
              <div className="bg-muted/30 rounded-lg p-4 border border-border text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {reducedLoadMessage}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(reducedLoadMessage, 'reduced')}
              >
                {copiedTab === 'reduced' ? (
                  <Check className="w-4 h-4 text-status-strong" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Simplified version with reduced cognitive load for higher engagement.
            </p>
          </TabsContent>
        </Tabs>

        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">What Changed</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {changeExplanation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
