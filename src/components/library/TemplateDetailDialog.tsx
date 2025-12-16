import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { SharedTemplate } from "@/types/library";
import { Copy, Download, CheckCircle, AlertTriangle, History, Lightbulb, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TemplateDetailDialogProps {
  template: SharedTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPull: () => void;
}

export function TemplateDetailDialog({ template, open, onOpenChange, onPull }: TemplateDetailDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(template.content);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-serif">{template.title}</DialogTitle>
          <DialogDescription>
            {template.intentStatement}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="template" className="mt-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="variants">Variants ({template.variants?.length || 0})</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {/* Content */}
                <div className="bg-muted rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm font-sans">{template.content}</pre>
                </div>

                {/* Placeholders */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Placeholders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {template.placeholders.map(p => (
                        <div key={p.key} className="text-xs border rounded p-2">
                          <code className="text-primary">{`{{${p.key}}}`}</code>
                          <p className="text-muted-foreground mt-1">{p.description}</p>
                          {p.required && <Badge variant="outline" className="mt-1 text-xs">Required</Badge>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Use Cases */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Use Cases
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-green-600 mb-2 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> When to use
                        </p>
                        <ul className="text-xs space-y-1">
                          {template.useCases.whenToUse.map((u, i) => (
                            <li key={i} className="text-muted-foreground">• {u}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-amber-600 mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> When not to use
                        </p>
                        <ul className="text-xs space-y-1">
                          {template.useCases.whenNotToUse.map((u, i) => (
                            <li key={i} className="text-muted-foreground">• {u}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Required Fields */}
                <div className="flex flex-wrap gap-4 text-xs">
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Audiences</p>
                    <div className="flex flex-wrap gap-1">
                      {template.requiredFields.audience.map(a => (
                        <Badge key={a} variant="secondary">{a}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Channels</p>
                    <div className="flex flex-wrap gap-1">
                      {template.requiredFields.channel.map(c => (
                        <Badge key={c} variant="outline">{c}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Moments</p>
                    <div className="flex flex-wrap gap-1">
                      {template.requiredFields.moment.map(m => (
                        <Badge key={m} variant="outline">{m}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="variants" className="mt-4">
            <ScrollArea className="h-[400px]">
              {template.variants && template.variants.length > 0 ? (
                <Accordion type="single" collapsible>
                  {template.variants.map(variant => (
                    <AccordionItem key={variant.id} value={variant.id}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{variant.name}</span>
                          <span className="text-xs text-muted-foreground">{variant.description}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-muted rounded-lg p-4">
                          <pre className="whitespace-pre-wrap text-sm font-sans">{variant.content}</pre>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No variants available</p>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="guidelines" className="mt-4">
            <ScrollArea className="h-[400px]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Ethical Guardrails
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {template.ethicalGuardrails.map((g, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="mt-4 text-sm">
                <p className="text-muted-foreground">
                  <strong>Owner:</strong> {template.owner}
                </p>
                <p className="text-muted-foreground">
                  <strong>Maintainer:</strong> {template.maintainer}
                </p>
                <p className="text-muted-foreground">
                  <strong>Version:</strong> {template.version}
                </p>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <ScrollArea className="h-[400px]">
              {template.changeHistory.length > 0 ? (
                <div className="space-y-3">
                  {template.changeHistory.map(change => (
                    <div key={change.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{change.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(change.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{change.description}</p>
                      <Badge variant="outline" className="text-xs mt-2">
                        From v{change.previousVersion}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No change history</p>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button onClick={handleCopy} variant="outline" size="sm" className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={onPull} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Pull to My Library
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
