import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIBadge } from "@/components/ui/ai-indicator";
import { TranslationToggle } from "@/components/TranslationToggle";
import { useToast } from "@/hooks/use-toast";
import { useIndustry } from "@/contexts/IndustryContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Swords,
  Sparkles,
  Copy,
  Check,
  Plus,
  X,
  Languages,
  Printer,
} from "lucide-react";
import { Input } from "@/components/ui/input";

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

const CompetitiveAnalyzerPage = () => {
  const { toast } = useToast();
  const { labels: industryLabels } = useIndustry();

  const [yourCopy, setYourCopy] = useState('');
  const [competitors, setCompetitors] = useState<string[]>(['']);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [outputLanguage, setOutputLanguage] = useState('en');

  const addCompetitor = () => setCompetitors(prev => [...prev, '']);
  const removeCompetitor = (i: number) => setCompetitors(prev => prev.filter((_, idx) => idx !== i));
  const updateCompetitor = (i: number, val: string) => setCompetitors(prev => prev.map((c, idx) => idx === i ? val : c));

  const handleAnalyze = async () => {
    const filledCompetitors = competitors.filter(c => c.trim());
    if (!yourCopy.trim() || filledCompetitors.length === 0) {
      toast({ title: "Missing content", description: "Paste your copy and at least one competitor sample.", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    try {
      const selectedLangLabel = outputLanguages.find(l => l.value === outputLanguage)?.label || outputLanguage;
      const langInstruction = outputLanguage !== 'en'
        ? `\n\nIMPORTANT: Generate the ENTIRE analysis in ${selectedLangLabel}. All sections, bullet points, and recommendations must be in ${selectedLangLabel}. Only section headers may remain in English for structure.`
        : '';

      const prompt = `You are a competitive messaging analyst for ${industryLabels?.industryContext || 'enterprise brand management'}.

Analyze the following brand copy against competitor samples. Identify:
1. **Differentiation Gaps** — Where the brand's messaging overlaps with competitors
2. **Unique Strengths** — What the brand says that no competitor does
3. **Missed Opportunities** — Themes competitors emphasize that the brand ignores
4. **Tone & Voice Comparison** — How the brand's voice differs
5. **Actionable Recommendations** — Specific copy improvements to increase differentiation

## Your Brand Copy:
${yourCopy}

## Competitor Samples:
${filledCompetitors.map((c, i) => `### Competitor ${i + 1}:\n${c}`).join('\n\n')}

Provide a structured analysis with clear headers, bullet points, and a differentiation score (0–100).${langInstruction}`;

      const { data, error } = await supabase.functions.invoke('playground-chat', {
        body: {
          messages: [{ role: 'user', content: prompt }],
          model: 'google/gemini-2.5-flash',
          systemPrompt: 'You are a senior competitive intelligence analyst specializing in brand positioning and messaging differentiation. Use markdown formatting.',
        },
      });

      if (error) throw error;
      setAnalysis(data?.reply || 'No analysis generated.');
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(analysis);
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
              <Swords className="w-6 h-6 text-primary" />
              Competitive Messaging Analyzer
            </h1>
            <p className="text-sm text-muted-foreground">
              Paste your copy and competitor samples to identify differentiation gaps and messaging opportunities.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Brand Copy</CardTitle>
              <CardDescription>Paste messaging you want to benchmark against competitors.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your brand messaging, tagline, landing page copy, or campaign text here..."
                value={yourCopy}
                onChange={e => setYourCopy(e.target.value)}
                rows={5}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Competitor Samples</CardTitle>
                <CardDescription>Add messaging from competitors you want to compare against.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addCompetitor} className="gap-1.5" disabled={competitors.length >= 5}>
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {competitors.map((comp, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Competitor {i + 1}</Label>
                    {competitors.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeCompetitor(i)}>
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    placeholder={`Paste competitor ${i + 1}'s messaging...`}
                    value={comp}
                    onChange={e => updateCompetitor(i, e.target.value)}
                    rows={3}
                  />
                </div>
              ))}
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

          <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full gap-2">
            <Sparkles className="w-4 h-4" />
            {isAnalyzing ? 'Analyzing Differentiation...' : 'Analyze Competitive Positioning'}
            <AIBadge />
          </Button>

          {analysis && (
            <Card className="print:shadow-none print:border-none">
              <CardHeader className="flex flex-row items-start justify-between gap-2 print:px-0">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Competitive Analysis</CardTitle>
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
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 print:px-0">
                {outputLanguage !== 'en' && (
                  <TranslationToggle
                    originalContent={analysis}
                    outputLanguage={outputLanguage}
                  />
                )}
                <div className="prose prose-sm max-w-none dark:prose-invert [&_h1]:text-lg [&_h1]:font-bold [&_h1]:border-b [&_h1]:border-border [&_h1]:pb-2 [&_h1]:mb-4 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1 [&_ul]:my-2 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:my-1 [&_li]:leading-relaxed [&_p]:my-2 [&_p]:leading-relaxed [&_strong]:text-foreground [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_hr]:my-4 [&_hr]:border-border">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompetitiveAnalyzerPage;
