import { useState, useEffect, useCallback } from "react";
import { useLastUsedProfile } from "@/hooks/useLastUsedProfile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIBadge } from "@/components/ui/ai-indicator";
import { TranslationToggle } from "@/components/TranslationToggle";
import { PlaybookRenderer } from "@/components/playbook/PlaybookRenderer";
import { useToast } from "@/hooks/use-toast";
import { useIndustry } from "@/contexts/IndustryContext";
import { useAuth } from "@/contexts/AuthContext";
import { InstitutionalProfileSelector } from "@/components/InstitutionalProfileSelector";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";
import { supabase } from "@/integrations/supabase/client";
import {
  Globe2,
  Sparkles,
  Languages,
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
  const { profile: authProfile } = useAuth();
  const { profiles } = useInstitutionalProfiles();
  const { lastUsedProfileId, setLastUsedProfileId } = useLastUsedProfile(profiles);
  const [selectedProfileId, setSelectedProfileIdLocal] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProfileId || !lastUsedProfileId || !profiles?.length) return;
    const found = profiles.find(p => p.id === lastUsedProfileId);
    if (found) setSelectedProfileIdLocal(lastUsedProfileId);
  }, [lastUsedProfileId, profiles, selectedProfileId]);

  const setSelectedProfileId = useCallback((id: string | null) => {
    setSelectedProfileIdLocal(id);
    if (id) setLastUsedProfileId(id);
  }, [setLastUsedProfileId]);

  const [sourceCopy, setSourceCopy] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [adaptations, setAdaptations] = useState<Record<string, string>>({});
  const [isAdapting, setIsAdapting] = useState(false);
  const [displayContent, setDisplayContent] = useState('');
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
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-1.5">
                <Label>Profile</Label>
                <InstitutionalProfileSelector
                  selectedProfileId={selectedProfileId}
                  onProfileChange={(id) => setSelectedProfileId(id)}
                />
              </div>
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
              <CardContent className="pt-6 print:px-0">
                <PlaybookRenderer
                  content={displayContent || adaptations._full}
                  title="Regional Adaptations"
                  outputLanguage={outputLanguage}
                  outputLanguageLabel={outputLanguages.find(l => l.value === outputLanguage)?.label}
                  brandColors={{
                    primary: profiles.find(p => p.id === selectedProfileId)?.config?.primaryColor || profiles.find(p => p.id === selectedProfileId)?.config?.accentColor,
                    secondary: profiles.find(p => p.id === selectedProfileId)?.config?.secondaryColor,
                    tertiary: profiles.find(p => p.id === selectedProfileId)?.config?.tertiaryColor,
                  }}
                  orgName={profiles.find(p => p.id === selectedProfileId)?.name}
                  translationToggle={
                    outputLanguage !== 'en' ? (
                      <TranslationToggle
                        originalContent={adaptations._full}
                        outputLanguage={outputLanguage}
                        inline={false}
                        onToggle={(content) => setDisplayContent(content)}
                      />
                    ) : undefined
                  }
                />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default RegionAdapterPage;
