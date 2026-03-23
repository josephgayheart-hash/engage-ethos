import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIBadge } from "@/components/ui/ai-indicator";
import { TranslationToggle } from "@/components/TranslationToggle";
import { useToast } from "@/hooks/use-toast";
import { useIndustry } from "@/contexts/IndustryContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Globe2,
  Sparkles,
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
  { value: 'vi', label: 'Vietnamese' },
  { value: 'th', label: 'Thai' },
];

const regions = [
  { id: 'north-america', label: 'North America', description: 'US & Canada — casual, direct tone' },
  { id: 'latam', label: 'Latin America', description: 'Warm, relationship-first, formal register' },
  { id: 'uk-europe', label: 'UK & Europe', description: 'Understated, professional, formal' },
  { id: 'middle-east', label: 'Middle East & Africa', description: 'Respectful, community-oriented' },
  { id: 'asia-pacific', label: 'Asia-Pacific', description: 'Indirect, hierarchy-aware, polished' },
  { id: 'dach', label: 'DACH (DE/AT/CH)', description: 'Precise, structured, quality-focused' },
  { id: 'nordic', label: 'Nordics', description: 'Egalitarian, transparent, concise' },
];

const RegionAdapterPage = () => {
  const { toast } = useToast();
  const { labels: industryLabels } = useIndustry();

  const [sourceCopy, setSourceCopy] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [adaptations, setAdaptations] = useState<Record<string, string>>({});
  const [isAdapting, setIsAdapting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [outputLanguage, setOutputLanguage] = useState('en');

  const toggleRegion = (id: string) => {
    setSelectedRegions(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleAdapt = async () => {
    if (!sourceCopy.trim() || selectedRegions.length === 0) {
      toast({ title: "Missing inputs", description: "Paste source copy and select at least one region.", variant: "destructive" });
      return;
    }

    setIsAdapting(true);
    try {
      const regionDescriptions = selectedRegions.map(id => {
        const r = regions.find(reg => reg.id === id);
        return `- ${r?.label}: ${r?.description}`;
      }).join('\n');

      const selectedLangLabel = outputLanguages.find(l => l.value === outputLanguage)?.label || outputLanguage;
      const langInstruction = outputLanguage !== 'en'
        ? `\n\nIMPORTANT: Generate ALL adapted copy and adaptation notes in ${selectedLangLabel}. The adapted messaging for each region must be written in ${selectedLangLabel}. Only region name headers may remain in English.`
        : '';

      const prompt = `You are a regional brand adaptation specialist for ${industryLabels?.industryContext || 'enterprise brand management'}.

Take the following source copy and adapt it for each specified region. Each adaptation should:
1. Maintain the core message and brand positioning
2. Adjust tone, formality, and cultural references for the region
3. Use region-appropriate idioms and phrasing${outputLanguage === 'en' ? ' (still in English unless specified)' : ''}
4. Consider local business customs and communication norms
5. Flag any culturally sensitive elements

## Source Copy:
${sourceCopy}

## Target Regions:
${regionDescriptions}

For each region, provide:
- The adapted copy
- A brief note explaining what was changed and why

Use this exact format for each region:
### [Region Name]
**Adapted Copy:**
[adapted text]

**Adaptation Notes:**
[explanation of changes]

---${langInstruction}`;

      const { data, error } = await supabase.functions.invoke('playground-chat', {
        body: {
          messages: [{ role: 'user', content: prompt }],
          model: 'google/gemini-2.5-flash',
          systemPrompt: 'You are an expert in cross-cultural brand communications. Maintain brand integrity while adapting for regional nuance. Use markdown.',
        },
      });

      if (error) throw error;

      const reply = data?.reply || '';
      setAdaptations({ _full: reply });
    } catch (err: any) {
      toast({ title: "Adaptation failed", description: err.message, variant: "destructive" });
    } finally {
      setIsAdapting(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="font-serif text-2xl font-bold mb-1 flex items-center gap-2">
              <Globe2 className="w-6 h-6 text-primary" />
              Region & Tone Adapter
            </h1>
            <p className="text-sm text-muted-foreground">
              Adapt one message for multiple regions with culturally-aware tone adjustments — beyond translation.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Source Copy</CardTitle>
              <CardDescription>Paste the original message you want adapted.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your original messaging here..."
                value={sourceCopy}
                onChange={e => setSourceCopy(e.target.value)}
                rows={5}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Target Regions</CardTitle>
              <CardDescription>Select regions to generate adapted versions for.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {regions.map(region => (
                  <label
                    key={region.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRegions.includes(region.id) ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/30'
                    }`}
                  >
                    <Checkbox
                      checked={selectedRegions.includes(region.id)}
                      onCheckedChange={() => toggleRegion(region.id)}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium">{region.label}</span>
                      <p className="text-xs text-muted-foreground">{region.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><Languages className="w-3.5 h-3.5" /> Output Language</Label>
                <Select value={outputLanguage} onValueChange={setOutputLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {outputLanguages.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleAdapt} disabled={isAdapting} className="w-full gap-2">
            <Sparkles className="w-4 h-4" />
            {isAdapting ? 'Adapting for Regions...' : `Adapt for ${selectedRegions.length} Region${selectedRegions.length !== 1 ? 's' : ''}`}
            <AIBadge />
          </Button>

          {adaptations._full && (
            <Card className="print:shadow-none print:border-none">
              <CardHeader className="flex flex-row items-center justify-between print:px-0">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Regional Adaptations</CardTitle>
                  {outputLanguage !== 'en' && (
                    <Badge variant="outline" className="gap-1 text-xs print:hidden">
                      <Languages className="w-3 h-3" />
                      {outputLanguages.find(l => l.value === outputLanguage)?.label}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0 print:hidden">
                  <Button variant="ghost" size="sm" onClick={() => window.print()} className="gap-1.5">
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(adaptations._full, 'full')} className="gap-1.5">
                    {copiedId === 'full' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === 'full' ? 'Copied' : 'Copy All'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {outputLanguage !== 'en' && (
                  <TranslationToggle
                    originalContent={adaptations._full}
                    outputLanguage={outputLanguage}
                  />
                )}
                <div className="prose prose-sm max-w-none dark:prose-invert [&_h1]:text-lg [&_h1]:font-bold [&_h1]:border-b [&_h1]:border-border [&_h1]:pb-2 [&_h1]:mb-4 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1 [&_ul]:my-2 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:my-1 [&_li]:leading-relaxed [&_p]:my-2 [&_p]:leading-relaxed [&_strong]:text-foreground [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_hr]:my-4 [&_hr]:border-border [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:text-sm [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{adaptations._full}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default RegionAdapterPage;
