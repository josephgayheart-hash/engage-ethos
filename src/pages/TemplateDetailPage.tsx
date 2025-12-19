import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useJourneyExport } from "@/hooks/useJourneyExport";
import { JourneyViewer, isJourneyContent, parseJourneyContent } from "@/components/library/JourneyViewer";
import type { LibraryEntryStatus } from "@/types/library";
import { 
  ChevronRight, 
  ArrowLeft, 
  Copy, 
  Download, 
  Map,
  CheckCircle,
  AlertTriangle,
  Users,
  Lightbulb,
  ShieldCheck,
  Edit3,
  Clock,
  BookOpen,
  FileText,
  Send,
  Edit,
  GitBranch,
  FileDown,
  Printer
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const statusConfig: Record<LibraryEntryStatus, { label: string; icon: typeof CheckCircle; variant: 'default' | 'secondary' | 'outline' }> = {
  draft: { label: 'Draft', icon: FileText, variant: 'outline' },
  submitted: { label: 'Submitted', icon: Send, variant: 'secondary' },
  approved: { label: 'Approved', icon: CheckCircle, variant: 'default' },
  published: { label: 'Published', icon: BookOpen, variant: 'default' },
};

// Mock usage data - in production this would come from database
const generateMockUsage = (templateId: string) => {
  const users = [
    { name: 'Sarah Johnson', dept: 'Student Success' },
    { name: 'Michael Chen', dept: 'Academic Affairs' },
    { name: 'Emily Rodriguez', dept: 'Enrollment' },
    { name: 'David Kim', dept: 'Advising' },
    { name: 'Jessica Williams', dept: 'Financial Aid' },
  ];
  
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

const TemplateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { templates, getTemplateById } = useSharedLibrary();
  const { addMessage } = useMessageLibrary();
  const [copied, setCopied] = useState(false);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const journeyContentRef = useRef<HTMLDivElement>(null);

  const template = getTemplateById(id || '');
  const isJourney = useMemo(() => template ? isJourneyContent(template.content) : false, [template]);
  const journeyData = useMemo(() => isJourney && template ? parseJourneyContent(template.content) : null, [template, isJourney]);
  const usageHistory = useMemo(() => template ? generateMockUsage(template.id) : [], [template]);

  const { isExporting, exportToPdf, printJourney } = useJourneyExport({
    title: template?.title || "Template Export",
    containerRef: journeyContentRef,
  });

  // Initialize placeholder values
  useEffect(() => {
    if (template) {
      const initial: Record<string, string> = {};
      template.placeholders.forEach(p => {
        initial[p.key] = p.defaultValue || '';
      });
      setPlaceholderValues(initial);
    }
  }, [template]);

  // Generate customized content
  const customizedContent = useMemo(() => {
    if (!template) return '';
    let content = template.content;
    Object.entries(placeholderValues).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      content = content.replace(regex, value || `{{${key}}}`);
    });
    return content;
  }, [template, placeholderValues]);

  // Check if all required placeholders are filled
  const allRequiredFilled = useMemo(() => {
    if (!template) return false;
    return template.placeholders
      .filter(p => p.required)
      .every(p => placeholderValues[p.key]?.trim());
  }, [template, placeholderValues]);

  if (!template) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="font-serif text-2xl font-bold mb-2">Template Not Found</h1>
            <p className="text-muted-foreground mb-6">This template may have been removed or doesn't exist.</p>
            <Link to="/shared-library">
              <Button>Back to University Library</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const StatusBadge = ({ status }: { status: LibraryEntryStatus }) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(customizedContent);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePull = () => {
    addMessage({
      title: `${template.title} (from University Library)`,
      content: customizedContent,
      channel: template.requiredFields.channel[0] as any,
      audience: template.requiredFields.audience[0] as any,
      moment: template.requiredFields.moment[0] as any,
      approved: false,
      mode: 'generated',
    });
    toast({
      title: "Template added to My Library",
      description: "You can now customize it further in your personal library.",
    });
    navigate("/library");
  };

  const handleRemixJourney = () => {
    if (!journeyData) return;
    
    const journeyWithMetadata = journeyData as (typeof journeyData & { _metadata?: any });
    navigate('/strategy', { 
      state: { 
        editMode: 'remix',
        journeyData: journeyData,
        metadata: journeyWithMetadata?._metadata,
        originalTitle: template.title,
        originalId: template.id,
        source: 'university'
      } 
    });
  };

  const updatePlaceholder = (key: string, value: string) => {
    setPlaceholderValues(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/shared-library">University Library</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{template.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
            <div className="flex items-start gap-4">
              <Link to="/shared-library">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                    {template.title}
                  </h1>
                  <StatusBadge status={template.status} />
                </div>
                <p className="text-muted-foreground">{template.intentStatement}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {template.owner}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    v{template.version}
                  </div>
                  <span>
                    Updated {new Date(template.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:shrink-0 flex-wrap">
              {isJourney && journeyData && (
                <>
                  <Button onClick={handleRemixJourney} variant="outline" className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Remix Journey
                  </Button>
                  <Button onClick={exportToPdf} variant="outline" className="flex items-center gap-2" disabled={isExporting}>
                    <FileDown className="w-4 h-4" />
                    {isExporting ? "Exporting..." : "Export PDF"}
                  </Button>
                  <Button onClick={printJourney} variant="outline" className="flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    Print
                  </Button>
                </>
              )}
              <Button onClick={handleCopy} variant="outline" className="flex items-center gap-2">
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button onClick={handlePull} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Pull to My Library
              </Button>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="template" className="space-y-6">
            <TabsList className="w-full md:w-auto flex-wrap h-auto">
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

            <TabsContent value="template" className="space-y-6">
              {isJourney && journeyData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Map className="w-5 h-5 text-primary" />
                      Strategy Journey
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div ref={journeyContentRef} data-pdf-section>
                      <JourneyViewer journey={journeyData} />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Live Preview</CardTitle>
                      {!allRequiredFilled && (
                        <Badge variant="outline" className="text-xs">
                          Fill placeholders in Customize tab
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-lg p-6 border-2 border-dashed border-border">
                      <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{customizedContent}</pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Use Cases */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="w-5 h-5" />
                    Use Cases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-3 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> When to use
                      </p>
                      <ul className="text-sm space-y-2">
                        {template.useCases.whenToUse.map((u, i) => (
                          <li key={i} className="text-muted-foreground flex items-start gap-2">
                            <span className="text-green-500">•</span>
                            {u}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-600 mb-3 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> When not to use
                      </p>
                      <ul className="text-sm space-y-2">
                        {template.useCases.whenNotToUse.map((u, i) => (
                          <li key={i} className="text-muted-foreground flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            {u}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Required Fields */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Target Audiences & Channels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <p className="font-medium text-muted-foreground mb-2">Audiences</p>
                      <div className="flex flex-wrap gap-2">
                        {template.requiredFields.audience.map(a => (
                          <Badge key={a} variant="secondary">{a}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground mb-2">Channels</p>
                      <div className="flex flex-wrap gap-2">
                        {template.requiredFields.channel.map(c => (
                          <Badge key={c} variant="outline">{c}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground mb-2">Moments</p>
                      <div className="flex flex-wrap gap-2">
                        {template.requiredFields.moment.map(m => (
                          <Badge key={m} variant="outline">{m}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customize" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customize Placeholders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-6">
                    Fill in the placeholders below to customize this template for your use. Required fields are marked with *.
                  </p>
                  
                  <div className="grid gap-6">
                    {template.placeholders.map(placeholder => (
                      <div key={placeholder.key} className="space-y-2">
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preview with Your Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-6">
                    <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{customizedContent}</pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="variants" className="space-y-6">
              {template.variants && template.variants.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-4">
                  {template.variants.map(variant => (
                    <AccordionItem key={variant.id} value={variant.id} className="border rounded-lg px-4">
                      <AccordionTrigger className="py-4">
                        <div className="flex items-center gap-3 text-left">
                          <span className="font-medium">{variant.name}</span>
                          <span className="text-sm text-muted-foreground">{variant.description}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="bg-muted rounded-lg p-4 mb-4">
                          <pre className="whitespace-pre-wrap text-sm font-sans">{variant.content}</pre>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
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
                <Card className="text-center py-12">
                  <CardContent>
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No variants available for this template</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="guidelines" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="w-5 h-5" />
                    Ethical Guardrails
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {template.ethicalGuardrails.map((g, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ownership & Maintenance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Owner</p>
                      <p className="text-sm">{template.owner}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Maintainer</p>
                      <p className="text-sm">{template.maintainer}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Version</p>
                      <p className="text-sm">{template.version}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Usage History</CardTitle>
                    <Badge variant="secondary">{usageHistory.length} uses</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-6">
                    Track who has used this template across your organization.
                  </p>

                  {usageHistory.length > 0 ? (
                    <div className="space-y-3">
                      {usageHistory.map((usage) => (
                        <div key={usage.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{usage.userName}</p>
                              <p className="text-sm text-muted-foreground">{usage.department}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={usage.action === 'pulled' ? 'default' : 'outline'}>
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
                      <p className="text-muted-foreground">No usage history yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Version History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Version History</CardTitle>
                </CardHeader>
                <CardContent>
                  {template.changeHistory.length > 0 ? (
                    <div className="space-y-4">
                      {template.changeHistory.map(change => (
                        <div key={change.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{change.author}</span>
                            <span className="text-sm text-muted-foreground">
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default TemplateDetailPage;
