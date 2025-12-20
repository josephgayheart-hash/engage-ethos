import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { SharedTemplate } from "@/types/library";
import type { InstitutionalConfig } from "@/types/uplaybook";
import { JourneyViewer, isJourneyContent, parseJourneyContent } from "./JourneyViewer";
import { SalesforceCredentialsDialog } from "@/components/SalesforceCredentialsDialog";
import { Copy, Download, CheckCircle, AlertTriangle, Users, Lightbulb, ShieldCheck, Edit3, Map, Cloud } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";

interface TemplateDetailDialogProps {
  template: SharedTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPull: (customizedContent: string) => void;
}

// Mock usage data - in production this would come from database
const generateMockUsage = (templateId: string) => {
  const departments = ['Academic Affairs', 'Student Success', 'Enrollment', 'Financial Aid', 'Advising', 'Dean of Students'];
  const users = [
    { name: 'Sarah Johnson', dept: 'Student Success' },
    { name: 'Michael Chen', dept: 'Academic Affairs' },
    { name: 'Emily Rodriguez', dept: 'Enrollment' },
    { name: 'David Kim', dept: 'Advising' },
    { name: 'Jessica Williams', dept: 'Financial Aid' },
  ];
  
  // Generate consistent mock data based on template ID
  const seed = templateId.charCodeAt(0);
  const usageCount = 3 + (seed % 5);
  
  return Array.from({ length: usageCount }, (_, i) => {
    const user = users[(seed + i) % users.length];
    const daysAgo = i * 3 + (seed % 7);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    return {
      id: `usage-${i}`,
      userName: user.name,
      department: user.dept,
      date: date.toISOString(),
      action: i === 0 ? 'pulled' : (i % 2 === 0 ? 'pulled' : 'copied'),
    };
  });
};

export function TemplateDetailDialog({ template, open, onOpenChange, onPull }: TemplateDetailDialogProps) {
  const { toast } = useToast();
  const { getProfile } = useInstitutionalProfiles();
  const [copied, setCopied] = useState(false);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('template');
  const [profileConfig, setProfileConfig] = useState<InstitutionalConfig | null>(null);
  const [sfmcDialogOpen, setSfmcDialogOpen] = useState(false);

  // Fetch institutional profile config if the template has one
  useEffect(() => {
    if (template?.institutionalProfileId) {
      const profile = getProfile(template.institutionalProfileId);
      if (profile) {
        setProfileConfig(profile.config as InstitutionalConfig);
      }
    } else {
      setProfileConfig(null);
    }
  }, [template?.institutionalProfileId, getProfile]);

  // Initialize placeholder values with defaults
  useEffect(() => {
    const initial: Record<string, string> = {};
    template.placeholders.forEach(p => {
      initial[p.key] = p.defaultValue || '';
    });
    setPlaceholderValues(initial);
  }, [template]);

  // Generate customized content with filled placeholders
  const customizedContent = useMemo(() => {
    let content = template.content;
    Object.entries(placeholderValues).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      content = content.replace(regex, value || `{{${key}}}`);
    });
    return content;
  }, [template.content, placeholderValues]);

  // Check if all required placeholders are filled
  const allRequiredFilled = useMemo(() => {
    return template.placeholders
      .filter(p => p.required)
      .every(p => placeholderValues[p.key]?.trim());
  }, [template.placeholders, placeholderValues]);

  const usageHistory = useMemo(() => generateMockUsage(template.id), [template.id]);
  const isJourney = useMemo(() => isJourneyContent(template.content), [template.content]);
  const journeyData = useMemo(() => isJourney ? parseJourneyContent(template.content) : null, [template.content, isJourney]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(customizedContent);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePull = () => {
    onPull(customizedContent);
  };

  const updatePlaceholder = (key: string, value: string) => {
    setPlaceholderValues(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isJourney ? "max-w-5xl max-h-[90vh]" : "max-w-3xl max-h-[90vh]"}>
        <DialogHeader>
          <DialogTitle className="font-serif">{template.title}</DialogTitle>
          <DialogDescription>
            {template.intentStatement}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="customize" className="flex items-center gap-1">
              <Edit3 className="w-3 h-3" />
              Customize ({template.placeholders.length})
            </TabsTrigger>
            <TabsTrigger value="variants">Variants ({template.variants?.length || 0})</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Usage ({usageHistory.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="mt-4">
            <ScrollArea className={isJourney ? "h-[550px]" : "h-[400px]"}>
              <div className="space-y-4">
                {/* Journey or Message Preview */}
                {isJourney && journeyData ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Map className="w-4 h-4 text-primary" />
                      <Label className="text-sm font-medium">Strategy Journey</Label>
                    </div>
                    <JourneyViewer 
                      journey={journeyData} 
                      institutionalProfileId={template?.institutionalProfileId}
                      institutionalConfig={profileConfig}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Live Preview</Label>
                      {!allRequiredFilled && (
                        <Badge variant="outline" className="text-xs">
                          Fill placeholders in Customize tab
                        </Badge>
                      )}
                    </div>
                    <div className="bg-muted rounded-lg p-4 border-2 border-dashed border-border">
                      <pre className="whitespace-pre-wrap text-sm font-sans">{customizedContent}</pre>
                    </div>
                  </div>
                )}

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

          <TabsContent value="customize" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Fill in the placeholders below to customize this template for your use. Required fields are marked with *.
                </p>
                
                <div className="grid gap-4">
                  {template.placeholders.map(placeholder => (
                    <div key={placeholder.key} className="space-y-1.5">
                      <Label htmlFor={placeholder.key} className="flex items-center gap-1">
                        {placeholder.label}
                        {placeholder.required && <span className="text-destructive">*</span>}
                      </Label>
                      <Input
                        id={placeholder.key}
                        value={placeholderValues[placeholder.key] || ''}
                        onChange={(e) => updatePlaceholder(placeholder.key, e.target.value)}
                        placeholder={placeholder.description}
                      />
                      <p className="text-xs text-muted-foreground">{placeholder.description}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Preview with filled values */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Preview with your values</Label>
                  <div className="bg-muted rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm font-sans">{customizedContent}</pre>
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={async () => {
                            await navigator.clipboard.writeText(variant.content);
                            toast({ title: "Variant copied" });
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Variant
                        </Button>
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

          <TabsContent value="usage" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    Track who has used this template across your organization.
                  </p>
                  <Badge variant="secondary">{usageHistory.length} uses</Badge>
                </div>

                {usageHistory.length > 0 ? (
                  <div className="space-y-2">
                    {usageHistory.map((usage) => (
                      <div key={usage.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{usage.userName}</p>
                            <p className="text-xs text-muted-foreground">{usage.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={usage.action === 'pulled' ? 'default' : 'outline'} className="text-xs">
                            {usage.action === 'pulled' ? 'Pulled to Library' : 'Copied'}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(usage.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">No usage history yet</p>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Version History */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Version History</h4>
                  {template.changeHistory.length > 0 ? (
                    <div className="space-y-2">
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
                    <p className="text-sm text-muted-foreground">No version changes recorded</p>
                  )}
                </div>
              </div>
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
            {template.requiredFields?.channel?.some(ch => ['email', 'sms', 'landing-page'].includes(ch)) && (
              <Button onClick={() => setSfmcDialogOpen(true)} variant="outline" size="sm" className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-blue-500" />
                Salesforce
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handlePull} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Pull to My Library
            </Button>
          </div>
        </div>

        <SalesforceCredentialsDialog
          open={sfmcDialogOpen}
          onOpenChange={setSfmcDialogOpen}
          content={customizedContent}
          contentName={template.title}
          channel={template.requiredFields?.channel?.[0] || 'email'}
        />
      </DialogContent>
    </Dialog>
  );
}
