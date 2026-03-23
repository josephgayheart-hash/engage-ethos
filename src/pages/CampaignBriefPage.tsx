import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIBadge } from "@/components/ui/ai-indicator";
import { TranslationToggle } from "@/components/TranslationToggle";
import { useToast } from "@/hooks/use-toast";
import { useIndustry } from "@/contexts/IndustryContext";
import { useAuth } from "@/contexts/AuthContext";
import { InstitutionalProfileSelector } from "@/components/InstitutionalProfileSelector";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText,
  Sparkles,
  Target,
  Users,
  Calendar,
  Download,
  Copy,
  Check,
  Languages,
  Printer,
} from "lucide-react";

const outputLanguages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'it', label: 'Italian' },
  { value: 'ru', label: 'Russian' },
];

const campaignTypes = [
  { value: 'product-launch', label: 'Product Launch' },
  { value: 'brand-awareness', label: 'Brand Awareness' },
  { value: 'lead-generation', label: 'Lead Generation' },
  { value: 'event-promotion', label: 'Event Promotion' },
  { value: 'seasonal-campaign', label: 'Seasonal Campaign' },
  { value: 'internal-comms', label: 'Internal Communications' },
  { value: 'crisis-comms', label: 'Crisis Communications' },
  { value: 'rebranding', label: 'Rebranding Initiative' },
];

const CampaignBriefPage = () => {
  const { toast } = useToast();
  const { audiences, labels: industryLabels } = useIndustry();
  const { profile, tenant } = useAuth();
  const { profiles } = useInstitutionalProfiles();

  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState('');
  const [objective, setObjective] = useState('');
  const [audience, setAudience] = useState('');
  const [timeline, setTimeline] = useState('');
  const [budget, setBudget] = useState('');
  const [keyMessages, setKeyMessages] = useState('');
  const [constraints, setConstraints] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [outputLanguage, setOutputLanguage] = useState('en');

  const [generatedBrief, setGeneratedBrief] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!campaignName || !campaignType || !objective) {
      toast({ title: "Missing fields", description: "Please fill in campaign name, type, and objective.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const selectedProfile = profiles.find(p => p.id === selectedProfileId);
      const selectedLangLabel = outputLanguages.find(l => l.value === outputLanguage)?.label || outputLanguage;
      const langInstruction = outputLanguage !== 'en'
        ? `\n\nIMPORTANT: Generate the ENTIRE brief in ${selectedLangLabel}. All sections, descriptions, and recommendations must be in ${selectedLangLabel}. Only the numbered section headers may remain in English for structure.`
        : '';

      const prompt = `Generate a comprehensive campaign brief for the following:

Campaign Name: ${campaignName}
Campaign Type: ${campaignTypes.find(t => t.value === campaignType)?.label || campaignType}
Organization: ${selectedProfile?.name || 'Not specified'}
Objective: ${objective}
Target Audience: ${audiences.find(a => a.id === audience)?.label || audience || 'General'}
Timeline: ${timeline || 'Not specified'}
Budget Range: ${budget || 'Not specified'}
Key Messages: ${keyMessages || 'Not specified'}
Constraints: ${constraints || 'None'}

Generate a structured creative brief with these sections:
1. Executive Summary
2. Campaign Objectives & KPIs
3. Target Audience Profile
4. Key Messages & Positioning
5. Channel Strategy (recommended channels and rationale)
6. Content Requirements
7. Timeline & Milestones
8. Success Metrics
9. Risk Considerations

Use professional, actionable language suitable for a brand/marketing team.${langInstruction}`;

      const { data, error } = await supabase.functions.invoke('playground-chat', {
        body: {
          messages: [{ role: 'user', content: prompt }],
          model: 'google/gemini-2.5-flash',
          systemPrompt: `You are a senior brand strategist creating campaign briefs for ${industryLabels?.industryContext || 'enterprise brand management'}. Write in a clear, professional tone using markdown formatting.`,
        },
      });

      if (error) throw error;
      setGeneratedBrief(data?.reply || 'No response generated.');
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedBrief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="font-serif text-2xl font-bold mb-1 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Campaign Brief Generator
            </h1>
            <p className="text-sm text-muted-foreground">
              Generate structured creative briefs grounded in your brand DNA.
            </p>
          </div>

          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaign Details</CardTitle>
              <CardDescription>Fill in the campaign parameters to generate a brief.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Campaign Name *</Label>
                  <Input placeholder="e.g., Q4 Product Launch" value={campaignName} onChange={e => setCampaignName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Campaign Type *</Label>
                  <Select value={campaignType} onValueChange={setCampaignType}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {campaignTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {profiles.length > 0 && (
                <div className="space-y-1.5">
                  <Label>{industryLabels?.organizationProfile || 'Profile'}</Label>
                  <InstitutionalProfileSelector
                    selectedProfileId={selectedProfileId}
                    onProfileChange={(id) => setSelectedProfileId(id)}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Campaign Objective *</Label>
                <Textarea placeholder="What should this campaign achieve? Be specific about desired outcomes..." value={objective} onChange={e => setObjective(e.target.value)} rows={3} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Target Audience</Label>
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger><SelectValue placeholder="Select audience" /></SelectTrigger>
                    <SelectContent>
                      {audiences.map(a => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Timeline</Label>
                  <Input placeholder="e.g., 6 weeks, Q4 2026" value={timeline} onChange={e => setTimeline(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Budget Range</Label>
                  <Input placeholder="e.g., $50K–$100K" value={budget} onChange={e => setBudget(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Constraints</Label>
                  <Input placeholder="e.g., No paid social, must include partner logos" value={constraints} onChange={e => setConstraints(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Key Messages</Label>
                <Textarea placeholder="Core messages or talking points to include..." value={keyMessages} onChange={e => setKeyMessages(e.target.value)} rows={2} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Languages className="w-3.5 h-3.5" /> Output Language</Label>
                  <Select value={outputLanguage} onValueChange={setOutputLanguage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {outputLanguages.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2">
                <Sparkles className="w-4 h-4" />
                {isGenerating ? 'Generating Brief...' : 'Generate Campaign Brief'}
                <AIBadge />
              </Button>
            </CardContent>
          </Card>

          {/* Generated Brief */}
          {generatedBrief && (
            <Card className="print:shadow-none print:border-none">
              <CardHeader className="flex flex-row items-center justify-between print:px-0">
                <CardTitle className="text-base">Generated Campaign Brief</CardTitle>
                <div className="flex items-center gap-1 print:hidden">
                  <Button variant="ghost" size="sm" onClick={() => window.print()} className="gap-1.5">
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 print:px-0">
                {outputLanguage !== 'en' && (
                  <TranslationToggle
                    originalContent={generatedBrief}
                    outputLanguage={outputLanguage}
                  />
                )}
                <div className="prose prose-sm max-w-none dark:prose-invert [&_h1]:text-lg [&_h1]:font-bold [&_h1]:border-b [&_h1]:border-border [&_h1]:pb-2 [&_h1]:mb-4 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1 [&_ul]:my-2 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:my-1 [&_li]:leading-relaxed [&_p]:my-2 [&_p]:leading-relaxed [&_strong]:text-foreground [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_hr]:my-4 [&_hr]:border-border [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:text-sm [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedBrief}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default CampaignBriefPage;
