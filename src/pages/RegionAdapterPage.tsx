import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AIBadge } from "@/components/ui/ai-indicator";
import { useToast } from "@/hooks/use-toast";
import { useIndustry } from "@/contexts/IndustryContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Globe2,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";

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

      const prompt = `You are a regional brand adaptation specialist for ${industryLabels?.industryContext || 'enterprise brand management'}.

Take the following source copy and adapt it for each specified region. Each adaptation should:
1. Maintain the core message and brand positioning
2. Adjust tone, formality, and cultural references for the region
3. Use region-appropriate idioms and phrasing (still in English unless specified)
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

---`;

      const { data, error } = await supabase.functions.invoke('playground-chat', {
        body: {
          messages: [{ role: 'user', content: prompt }],
          model: 'google/gemini-2.5-flash',
          systemPrompt: 'You are an expert in cross-cultural brand communications. Maintain brand integrity while adapting for regional nuance. Use markdown.',
        },
      });

      if (error) throw error;

      const reply = data?.reply || '';
      // Store as a single block — regions are separated by headers
      const result: Record<string, string> = {};
      selectedRegions.forEach(id => {
        const r = regions.find(reg => reg.id === id);
        if (r) result[id] = reply; // full reply for now
      });
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

          <Button onClick={handleAdapt} disabled={isAdapting} className="w-full gap-2">
            <Sparkles className="w-4 h-4" />
            {isAdapting ? 'Adapting for Regions...' : `Adapt for ${selectedRegions.length} Region${selectedRegions.length !== 1 ? 's' : ''}`}
            <AIBadge />
          </Button>

          {adaptations._full && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Regional Adaptations</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(adaptations._full, 'full')} className="gap-1.5">
                  {copiedId === 'full' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === 'full' ? 'Copied' : 'Copy All'}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                  {adaptations._full}
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
