import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIBadge } from "@/components/ui/ai-indicator";
import { useToast } from "@/hooks/use-toast";
import { useContentDNAForGeneration } from "@/hooks/useContentDNAForGeneration";
import { useToolTracking } from "@/hooks/useToolTracking";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Languages,
  Copy,
  RefreshCw,
  ArrowRight
} from "lucide-react";

const languages = [
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' },
];

const TranslationTool = () => {
  const { toast } = useToast();
  const { contentDNA } = useContentDNAForGeneration();
  const { trackToolUse } = useToolTracking();
  const [sourceText, setSourceText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({ variant: "destructive", title: "Enter text to translate" });
      return;
    }

    setIsTranslating(true);
    
    // Track tool usage
    trackToolUse('translation', 'translate', {
      sourceLanguage,
      targetLanguage,
      textLength: sourceText.length,
    });
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-message', {
        body: {
          type: 'translate',
          context: {
            sourceText,
            sourceLanguage,
            targetLanguage,
            targetLanguageName: languages.find(l => l.code === targetLanguage)?.name || targetLanguage,
          },
          contentDNA: contentDNA || undefined,
        }
      });

      if (data?.message) {
        setTranslatedText(data.message);
        toast({ title: "Translation complete!" });
      } else {
        // Fallback message
        setTranslatedText(`[Translation to ${languages.find(l => l.code === targetLanguage)?.name || targetLanguage} would appear here. Connect to AI to enable translations.]`);
        toast({ title: "Translation placeholder generated" });
      }
    } catch (error) {
      console.error("Translation failed:", error);
      setTranslatedText(`[Translation to ${languages.find(l => l.code === targetLanguage)?.name || targetLanguage} would appear here. Connect to AI to enable translations.]`);
      toast({ title: "Translation placeholder generated (offline mode)" });
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const swapLanguages = () => {
    if (sourceLanguage === 'en') {
      setSourceLanguage(targetLanguage);
      setTargetLanguage('en');
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    } else {
      const temp = sourceLanguage;
      setSourceLanguage(targetLanguage);
      setTargetLanguage(temp);
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                  <Languages className="w-7 h-7 text-primary" />
                  Multi-Language Support
                </h1>
                <p className="text-muted-foreground mt-1">
                  Translate your messages for diverse student populations
                </p>
              </div>
            </div>
            <AIBadge />
          </div>

          {/* Language Stats */}
          <Card className="mb-6 bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Top Languages in US Higher Education</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Spanish (13%)</Badge>
                    <Badge variant="outline">Chinese (6%)</Badge>
                    <Badge variant="outline">Vietnamese (3%)</Badge>
                    <Badge variant="outline">Korean (2%)</Badge>
                    <Badge variant="outline">Arabic (2%)</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Source: NCES data on language diversity in higher education
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Translation Interface */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Source */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-lg">Source Text</CardTitle>
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      {languages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your message text here..."
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  rows={12}
                  className="resize-none"
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{sourceText.length} characters</span>
                  <span>{sourceText.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </CardContent>
            </Card>

            {/* Target */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-lg">Translation</CardTitle>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name} ({lang.nativeName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Translation will appear here..."
                  value={translatedText}
                  onChange={(e) => setTranslatedText(e.target.value)}
                  rows={12}
                  className="resize-none"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {translatedText.length} characters
                  </span>
                  {translatedText && (
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(translatedText)}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="outline"
              onClick={swapLanguages}
              disabled={!translatedText}
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Swap
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={handleTranslate}
              disabled={isTranslating || !sourceText.trim()}
              size="lg"
            >
              {isTranslating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4 mr-2" />
                  Translate
                </>
              )}
            </Button>
          </div>

          {/* Tips */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Translation Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Keep sentences short and simple for better translations</li>
                  <li>• Avoid idioms and colloquialisms that don't translate well</li>
                  <li>• Use formal language appropriate for academic settings</li>
                  <li>• Have a native speaker review important communications</li>
                  <li>• Consider cultural context, not just language</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Offer language preferences in student profiles</li>
                  <li>• Translate critical deadlines and requirements</li>
                  <li>• Include both English and translated versions</li>
                  <li>• Test SMS character limits after translation</li>
                  <li>• Maintain consistent terminology across translations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TranslationTool;
