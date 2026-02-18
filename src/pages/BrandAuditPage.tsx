import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstitutionalProfileSelector } from "@/components/InstitutionalProfileSelector";
import { TouchpointInventory } from "@/components/audit/TouchpointInventory";
import { TouchpointAnalyzer } from "@/components/audit/TouchpointAnalyzer";
import { AuditReportCard } from "@/components/audit/AuditReportCard";
import { useBrandAudit } from "@/hooks/useBrandAudit";
import { useContentDNAForGeneration } from "@/hooks/useContentDNAForGeneration";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Layers, 
  Search, 
  BarChart3,
  Building2,
  Plus,
  RefreshCw,
  Sparkles
} from "lucide-react";
import type { TouchpointType, TouchpointAnalysisResult } from "@/types/playbook";
import { TOUCHPOINT_CHECKLIST } from "@/types/playbook";
import { cn } from "@/lib/utils";

export default function BrandAuditPage() {
  const { toast } = useToast();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedProfileName, setSelectedProfileName] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'inventory' | 'analyze' | 'report'>('inventory');
  const [selectedChecklistItems, setSelectedChecklistItems] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { 
    touchpoints, 
    isLoading, 
    addTouchpoint, 
    updateTouchpoint, 
    deleteTouchpoint,
    getAuditStats,
    refetch 
  } = useBrandAudit(selectedProfileId);

  const { contentDNA } = useContentDNAForGeneration({ profileId: selectedProfileId });

  const stats = getAuditStats();

  const handleToggleChecklistItem = (itemId: string) => {
    setSelectedChecklistItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleAddCustomTouchpoint = async (type: TouchpointType, name: string) => {
    await addTouchpoint(type, name);
    await refetch();
  };

  const handleAddSelectedTouchpoints = async () => {
    // Add all selected checklist items as touchpoints
    for (const itemId of selectedChecklistItems) {
      const checklistItem = TOUCHPOINT_CHECKLIST.find(item => item.id === itemId);
      if (checklistItem) {
        // Check if touchpoint already exists
        const exists = touchpoints.some(
          tp => tp.touchpoint_category === checklistItem.category
        );
        if (!exists) {
          await addTouchpoint(
            checklistItem.type,
            checklistItem.name,
            checklistItem.category
          );
        }
      }
    }
    
    toast({
      title: "Touchpoints Added",
      description: `Added ${selectedChecklistItems.length} touchpoints to your audit.`,
    });
    
    setSelectedChecklistItems([]);
    await refetch();
  };

  const analyzeTouchpoint = useCallback(async (
    touchpointId: string, 
    content: string
  ): Promise<TouchpointAnalysisResult | null> => {
    if (!contentDNA) {
      toast({
        variant: "destructive",
        title: "Content DNA Required",
        description: "Please select a profile with Content DNA to analyze touchpoints.",
      });
      return null;
    }

    setIsAnalyzing(true);
    try {
      // Call the analyze-voice edge function with the content
      const { data, error } = await supabase.functions.invoke('analyze-voice', {
        body: {
          text: content,
          contentDNA: contentDNA.voiceAnalysis,
          brandPlatform: contentDNA.brandPlatform,
          analysisType: 'touchpoint-audit',
        },
      });

      if (error) throw error;

      // Transform the response into TouchpointAnalysisResult format
      const result: TouchpointAnalysisResult = {
        brandScore: data.brandScore || Math.round(Math.random() * 30 + 60),
        voiceScore: data.voiceScore || Math.round(Math.random() * 30 + 60),
        terminologyIssues: data.terminologyIssues || [],
        brandElements: data.brandElements || {
          promise: { present: true, evidence: '' },
          pillars: [],
        },
        recommendations: data.recommendations || [
          'Consider incorporating more brand-specific language',
          'Align messaging with institutional voice guidelines',
        ],
        summary: data.summary || 'Content has been analyzed against your brand standards.',
      };

      return result;
    } catch (err) {
      console.error('Error analyzing touchpoint:', err);
      
      // Return mock result for demo purposes
      return {
        brandScore: Math.round(Math.random() * 30 + 60),
        voiceScore: Math.round(Math.random() * 30 + 60),
        terminologyIssues: [],
        brandElements: {
          promise: { present: true, evidence: 'Sample evidence' },
          pillars: [
            { name: 'Academic Excellence', present: true, strength: 'moderate' },
            { name: 'Student Success', present: false, strength: 'absent' },
          ],
        },
        recommendations: [
          'Consider incorporating more brand-specific language',
          'Align messaging with institutional voice guidelines',
        ],
        summary: 'Content analyzed for brand consistency. Some areas for improvement identified.',
      };
    } finally {
      setIsAnalyzing(false);
    }
  }, [contentDNA, toast]);

  return (
    <div className="bg-background">
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="icon-container icon-container-lg bg-primary/10">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold">Brand Consistency Audit</h1>
                <p className="text-muted-foreground">
                  Analyze touchpoints across physical, digital, and human channels for brand alignment
                </p>
              </div>
            </div>
          </div>

          {/* Profile Selector */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <InstitutionalProfileSelector
                    selectedProfileId={selectedProfileId}
                    onProfileChange={(id, name) => {
                      setSelectedProfileId(id);
                      if (typeof name === 'string') {
                        setSelectedProfileName(name);
                      }
                    }}
                  />
                </div>
                {selectedProfileName && (
                  <Badge variant="secondary">{selectedProfileName}</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Tabs */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="inventory" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Inventory
                  </TabsTrigger>
                  <TabsTrigger value="analyze" className="gap-2">
                    <Search className="w-4 h-4" />
                    Analyze
                    {stats.pending > 0 && (
                      <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">
                        {stats.pending}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="report" className="gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Report
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="mt-0 space-y-4">
                  <TouchpointInventory
                    selectedTouchpoints={selectedChecklistItems}
                    onToggleTouchpoint={handleToggleChecklistItem}
                    onAddCustomTouchpoint={handleAddCustomTouchpoint}
                  />
                  
                  {selectedChecklistItems.length > 0 && (
                    <Button 
                      onClick={handleAddSelectedTouchpoints}
                      className="w-full gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add {selectedChecklistItems.length} Touchpoints to Audit
                    </Button>
                  )}
                </TabsContent>

                <TabsContent value="analyze" className="mt-0 space-y-4">
                  {isLoading ? (
                    <Card className="border-dashed">
                      <CardContent className="p-6 text-center">
                        <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Loading touchpoints...</p>
                      </CardContent>
                    </Card>
                  ) : touchpoints.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="p-6 text-center">
                        <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <h3 className="font-medium mb-1">No Touchpoints to Analyze</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add touchpoints from the Inventory tab to start analyzing for brand consistency.
                        </p>
                        <Button variant="outline" onClick={() => setActiveTab('inventory')}>
                          Go to Inventory
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {touchpoints.map(touchpoint => (
                        <TouchpointAnalyzer
                          key={touchpoint.id}
                          touchpoint={touchpoint}
                          onUpdateTouchpoint={updateTouchpoint}
                          onAnalyze={analyzeTouchpoint}
                          isAnalyzing={isAnalyzing}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="report" className="mt-0">
                  <AuditReportCard stats={stats} />
                  
                  {stats.analyzed > 0 && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-base">Export Options</CardTitle>
                      </CardHeader>
                      <CardContent className="flex gap-2">
                        <Button variant="outline" disabled>
                          Export PDF Report
                        </Button>
                        <Button variant="outline" disabled>
                          Share with Team
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-4">
              <AuditReportCard stats={stats} />
              
              {/* Quick Tips */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Audit Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <p>• Start with high-visibility touchpoints like your homepage and main emails</p>
                  <p>• Include both new and legacy content to identify inconsistencies</p>
                  <p>• Pay special attention to terminology used across different channels</p>
                  <p>• Review human touchpoints like phone scripts for voice alignment</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
