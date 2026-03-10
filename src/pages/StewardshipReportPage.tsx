import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { InstitutionalProfileSelector } from "@/components/InstitutionalProfileSelector";
import { GenerationLoadingOverlay } from "@/components/GenerationLoadingOverlay";
import { AIBadge } from "@/components/ui/ai-indicator";
import { useFactBook, Fact } from "@/hooks/useFactBook";
import { useStoryBank, Story } from "@/hooks/useStoryBank";
import { useAdvancementCampaigns } from "@/hooks/useAdvancementCampaigns";
import { useContentDNAForGeneration } from "@/hooks/useContentDNAForGeneration";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Heart, BookOpen, BarChart3, Users, Gift, Mail, MessageSquare,
  Megaphone, FileText, Copy, RefreshCw, Sparkles, Check, Star, TrendingUp,
  DollarSign, Award, CheckCircle2
} from "lucide-react";

const CHANNELS = [
  { id: "email", label: "Thank-You Email", icon: Mail },
  { id: "social", label: "Social Posts", icon: Megaphone },
  { id: "landing", label: "Impact Landing Page", icon: FileText },
  { id: "letter", label: "Stewardship Letter", icon: BookOpen },
] as const;

type OutputChannel = typeof CHANNELS[number]["id"];

interface GeneratedOutput {
  email?: { subject: string; body: string };
  social?: string[];
  landing?: { headline: string; subheadline: string; body: string; cta: string };
  letter?: string;
}

const StewardshipReportPage = () => {
  const { toast } = useToast();
  const { tenant } = useAuth();

  // Profile selection
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Data hooks
  const { facts, isLoading: factsLoading } = useFactBook({ profileId: selectedProfileId });
  const { stories, isLoading: storiesLoading } = useStoryBank({ profileId: selectedProfileId });
  const { campaigns } = useAdvancementCampaigns();
  const { contentDNA } = useContentDNAForGeneration({ profileId: selectedProfileId });

  // UI state
  const [selectedFactIds, setSelectedFactIds] = useState<Set<string>>(new Set());
  const [selectedStoryIds, setSelectedStoryIds] = useState<Set<string>>(new Set());
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("none");
  const [selectedChannels, setSelectedChannels] = useState<Set<OutputChannel>>(new Set(["email", "social"]));
  const [campaignName, setCampaignName] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<GeneratedOutput | null>(null);
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null);

  // Derived data
  const highlightedFacts = useMemo(() => facts.filter(f => f.is_highlight), [facts]);
  const donorStories = useMemo(() => stories.filter(s => s.story_type === 'donor' || s.story_type === 'alumni'), [stories]);
  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  // When campaign is selected, populate context
  const effectiveCampaignName = selectedCampaign?.name || campaignName;

  const toggleFact = (id: string) => {
    setSelectedFactIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleStory = (id: string) => {
    setSelectedStoryIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleChannel = (ch: OutputChannel) => {
    setSelectedChannels(prev => {
      const next = new Set(prev);
      next.has(ch) ? next.delete(ch) : next.add(ch);
      return next;
    });
  };

  const selectAllHighlights = () => {
    setSelectedFactIds(new Set(highlightedFacts.map(f => f.id)));
  };

  const selectAllDonorStories = () => {
    setSelectedStoryIds(new Set(donorStories.map(s => s.id)));
  };

  const handleGenerate = async () => {
    if (selectedFactIds.size === 0 && selectedStoryIds.size === 0) {
      toast({ title: "Select content", description: "Pick at least one fact or story to include.", variant: "destructive" });
      return;
    }
    if (selectedChannels.size === 0) {
      toast({ title: "Select channels", description: "Pick at least one output channel.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const selectedFacts = facts.filter(f => selectedFactIds.has(f.id));
      const selectedStories = stories.filter(s => selectedStoryIds.has(s.id));

      const { data, error } = await supabase.functions.invoke('generate-message', {
        body: {
          mode: 'stewardship-report',
          context: {
            audience: 'donors',
            moment: 'stewardship',
            channel: 'email',
            tone: 'celebratory',
            additionalContext: [
              effectiveCampaignName ? `Campaign: ${effectiveCampaignName}` : '',
              selectedCampaign?.goal_amount ? `Goal: ${selectedCampaign.goal_amount}` : '',
              additionalContext,
            ].filter(Boolean).join('\n'),
          },
          stewardshipData: {
            facts: selectedFacts.map(f => ({ label: f.label, value: f.value, category: f.category, context: f.context })),
            stories: selectedStories.map(s => ({ title: s.title, narrative: s.narrative, pullQuote: s.pull_quote, subjectName: s.subject_name })),
            channels: Array.from(selectedChannels),
            campaignName: effectiveCampaignName || 'Giving Campaign',
          },
          contentDNA: contentDNA || undefined,
        },
      });

      if (error) throw error;

      // Parse the response - the edge function returns stewardship-specific outputs
      const output: GeneratedOutput = {};
      if (data.stewardshipReport) {
        output.email = data.stewardshipReport.email;
        output.social = data.stewardshipReport.social;
        output.landing = data.stewardshipReport.landing;
        output.letter = data.stewardshipReport.letter;
      } else if (data.drafts?.email) {
        // Fallback to standard generate-message output
        output.email = data.drafts.email;
        if (data.drafts['social-media']) output.social = [data.drafts['social-media']];
      }

      setGeneratedOutput(output);
      toast({ title: "Report generated", description: "Your stewardship content is ready across all selected channels." });
    } catch (err: any) {
      console.error('Generation error:', err);
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, channel: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedChannel(channel);
    setTimeout(() => setCopiedChannel(null), 2000);
    toast({ title: "Copied!", description: `${channel} content copied to clipboard.` });
  };

  const isDataLoading = factsLoading || storiesLoading;

  return (
    <div className="bg-background">
      {isGenerating && <GenerationLoadingOverlay isVisible={isGenerating} context={{ mode: 'stewardship', audience: 'donors', channel: 'email' }} />}

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div className="flex-1">
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <Heart className="w-7 h-7 text-primary" />
                Stewardship Impact Report
              </h1>
              <p className="text-muted-foreground mt-1">
                Generate branded thank-you content from your Fact Book & Story Bank
              </p>
            </div>
            <AIBadge />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column: Inputs */}
            <div className="lg:col-span-2 space-y-6">

              {/* Profile + Campaign selector */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Gift className="w-4 h-4" /> Campaign Context
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Institutional Profile</Label>
                      <InstitutionalProfileSelector
                        selectedProfileId={selectedProfileId}
                        onProfileChange={(id) => setSelectedProfileId(id)}
                        compact
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Link to Campaign (optional)</Label>
                      <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Standalone report" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Standalone — no campaign</SelectItem>
                          {campaigns.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {!selectedCampaign && (
                    <div className="space-y-2">
                      <Label className="text-xs">Campaign / Initiative Name</Label>
                      <Input
                        placeholder="e.g., Spring 2026 Giving Day"
                        value={campaignName}
                        onChange={e => setCampaignName(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-xs">Additional Context (optional)</Label>
                    <Textarea
                      placeholder="e.g., We exceeded our goal by 15%. Record alumni participation. Focus on scholarship impact."
                      value={additionalContext}
                      onChange={e => setAdditionalContext(e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Fact Book Selector */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" /> Select Impact Facts
                      <Badge variant="secondary" className="text-[10px]">{selectedFactIds.size} selected</Badge>
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={selectAllHighlights} disabled={highlightedFacts.length === 0}>
                      <Star className="w-3 h-3 mr-1" /> Select Highlights ({highlightedFacts.length})
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isDataLoading ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">Loading facts...</div>
                  ) : facts.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">
                      No facts in your Fact Book yet. <Link to="/content-dna" className="text-primary underline">Add facts →</Link>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {facts.map(fact => (
                        <div
                          key={fact.id}
                          className={cn(
                            "flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors",
                            selectedFactIds.has(fact.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                          )}
                          onClick={() => toggleFact(fact.id)}
                        >
                          <Checkbox checked={selectedFactIds.has(fact.id)} className="mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium flex items-center gap-1">
                              {fact.is_highlight && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                              <span className="truncate">{fact.label}</span>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <span className="font-semibold text-foreground">{fact.value}</span>
                              {fact.change_direction === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Story Bank Selector */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Select Stories
                      <Badge variant="secondary" className="text-[10px]">{selectedStoryIds.size} selected</Badge>
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={selectAllDonorStories} disabled={donorStories.length === 0}>
                      <Users className="w-3 h-3 mr-1" /> Donor Stories ({donorStories.length})
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isDataLoading ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">Loading stories...</div>
                  ) : stories.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">
                      No stories in your Story Bank yet. <Link to="/content-dna" className="text-primary underline">Add stories →</Link>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {stories.map(story => (
                        <div
                          key={story.id}
                          className={cn(
                            "flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors",
                            selectedStoryIds.has(story.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                          )}
                          onClick={() => toggleStory(story.id)}
                        >
                          <Checkbox checked={selectedStoryIds.has(story.id)} className="mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">{story.title}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] px-1 py-0 capitalize">{story.story_type}</Badge>
                              {story.subject_name && <span>{story.subject_name}</span>}
                            </div>
                            {story.pull_quote && (
                              <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1">"{story.pull_quote}"</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column: Channels + Generate */}
            <div className="space-y-6">
              {/* Output Channels */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Output Channels</CardTitle>
                  <CardDescription className="text-xs">Select which formats to generate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {CHANNELS.map(ch => {
                    const Icon = ch.icon;
                    return (
                      <div
                        key={ch.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                          selectedChannels.has(ch.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                        )}
                        onClick={() => toggleChannel(ch.id)}
                      >
                        <Checkbox checked={selectedChannels.has(ch.id)} />
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{ch.label}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Selection Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Facts selected</span>
                    <span className="font-medium">{selectedFactIds.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stories selected</span>
                    <span className="font-medium">{selectedStoryIds.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Output channels</span>
                    <span className="font-medium">{selectedChannels.size}</span>
                  </div>
                  {effectiveCampaignName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Campaign</span>
                      <span className="font-medium truncate ml-2">{effectiveCampaignName}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <Button
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={isGenerating || (selectedFactIds.size === 0 && selectedStoryIds.size === 0) || selectedChannels.size === 0}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Impact Report
                  </Button>
                </CardContent>
              </Card>

              {/* Linked campaign info */}
              {selectedCampaign && (
                <Card className="border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Linked Campaign</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>{selectedCampaign.name}</div>
                      {selectedCampaign.goal_amount && <div>Goal: {selectedCampaign.goal_amount}</div>}
                      <div>{selectedCampaign.touchpoints.length} touchpoints planned</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Generated Output */}
          {generatedOutput && (
            <div className="mt-8 space-y-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <h2 className="font-serif text-xl font-bold">Generated Stewardship Content</h2>
                <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate
                </Button>
              </div>

              <Tabs defaultValue={generatedOutput.email ? "email" : generatedOutput.social ? "social" : "landing"}>
                <TabsList>
                  {generatedOutput.email && <TabsTrigger value="email"><Mail className="w-3.5 h-3.5 mr-1" /> Email</TabsTrigger>}
                  {generatedOutput.social && <TabsTrigger value="social"><Megaphone className="w-3.5 h-3.5 mr-1" /> Social</TabsTrigger>}
                  {generatedOutput.landing && <TabsTrigger value="landing"><FileText className="w-3.5 h-3.5 mr-1" /> Landing Page</TabsTrigger>}
                  {generatedOutput.letter && <TabsTrigger value="letter"><BookOpen className="w-3.5 h-3.5 mr-1" /> Letter</TabsTrigger>}
                </TabsList>

                {generatedOutput.email && (
                  <TabsContent value="email">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Thank-You Email</CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(`Subject: ${generatedOutput.email!.subject}\n\n${generatedOutput.email!.body}`, 'email')}
                          >
                            {copiedChannel === 'email' ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                            {copiedChannel === 'email' ? 'Copied' : 'Copy'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Subject Line</Label>
                            <p className="text-sm font-medium mt-1">{generatedOutput.email.subject}</p>
                          </div>
                          <Separator />
                          <div>
                            <Label className="text-xs text-muted-foreground">Body</Label>
                            <div className="text-sm mt-1 whitespace-pre-wrap leading-relaxed">{generatedOutput.email.body}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {generatedOutput.social && (
                  <TabsContent value="social">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Social Posts</CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(generatedOutput.social!.join('\n\n---\n\n'), 'social')}
                          >
                            {copiedChannel === 'social' ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                            {copiedChannel === 'social' ? 'Copied' : 'Copy All'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {generatedOutput.social.map((post, i) => (
                          <div key={i} className="p-3 rounded-lg border bg-muted/30">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-[10px]">Post {i + 1}</Badge>
                              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => copyToClipboard(post, `social-${i}`)}>
                                {copiedChannel === `social-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              </Button>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{post}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {generatedOutput.landing && (
                  <TabsContent value="landing">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Impact Landing Page</CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(
                              `# ${generatedOutput.landing!.headline}\n## ${generatedOutput.landing!.subheadline}\n\n${generatedOutput.landing!.body}\n\n[${generatedOutput.landing!.cta}]`,
                              'landing'
                            )}
                          >
                            {copiedChannel === 'landing' ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                            {copiedChannel === 'landing' ? 'Copied' : 'Copy'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Headline</Label>
                          <p className="text-lg font-bold mt-1">{generatedOutput.landing.headline}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Subheadline</Label>
                          <p className="text-sm text-muted-foreground mt-1">{generatedOutput.landing.subheadline}</p>
                        </div>
                        <Separator />
                        <div>
                          <Label className="text-xs text-muted-foreground">Body</Label>
                          <div className="text-sm mt-1 whitespace-pre-wrap leading-relaxed">{generatedOutput.landing.body}</div>
                        </div>
                        <div className="pt-2">
                          <Badge className="text-sm px-4 py-1.5">{generatedOutput.landing.cta}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {generatedOutput.letter && (
                  <TabsContent value="letter">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Stewardship Letter</CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(generatedOutput.letter!, 'letter')}
                          >
                            {copiedChannel === 'letter' ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                            {copiedChannel === 'letter' ? 'Copied' : 'Copy'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">{generatedOutput.letter}</div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StewardshipReportPage;
