import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AIBadge } from "@/components/ui/ai-indicator";
import { useInstitutionalConfig } from "@/hooks/useInstitutionalConfig";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Palette,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Copy
} from "lucide-react";

interface BrandVoiceAnalysis {
  overallScore: number;
  toneMatch: number;
  vocabularyMatch: number;
  styleMatch: number;
  issues: { type: string; message: string; suggestion: string }[];
  strengths: string[];
}

const BrandVoiceScorer = () => {
  const { toast } = useToast();
  const { config } = useInstitutionalConfig();
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<BrandVoiceAnalysis | null>(null);
  const [improvedContent, setImprovedContent] = useState("");

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast({ variant: "destructive", title: "Enter content to analyze" });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate brand voice analysis based on institutional config
    setTimeout(() => {
      const issues: { type: string; message: string; suggestion: string }[] = [];
      const strengths: string[] = [];
      let toneScore = 85;
      let vocabScore = 80;
      let styleScore = 75;

      // Check for institution name usage
      if (config?.institutionName && !content.includes(config.institutionName)) {
        issues.push({
          type: 'warning',
          message: 'Institution name not mentioned',
          suggestion: `Consider including "${config.institutionName}" for brand reinforcement.`,
        });
        vocabScore -= 10;
      } else if (config?.institutionName) {
        strengths.push('Institution name properly used');
      }

      // Check for words to avoid
      const wordsToAvoid = config?.wordsToAvoid || ['pursuant', 'heretofore', 'matriculate'];
      const foundAvoidWords = wordsToAvoid.filter(word => 
        content.toLowerCase().includes(word.toLowerCase())
      );
      if (foundAvoidWords.length > 0) {
        issues.push({
          type: 'error',
          message: `Found words to avoid: "${foundAvoidWords.join('", "')}"`,
          suggestion: 'Replace these words with simpler, on-brand alternatives.',
        });
        styleScore -= 15 * foundAvoidWords.length;
      } else {
        strengths.push('No prohibited words detected');
      }

      // Check for preferred phrases
      const preferredPhrases = config?.preferredPhrases || ['student success', 'community', 'support'];
      const foundPreferred = preferredPhrases.filter(phrase => 
        content.toLowerCase().includes(phrase.toLowerCase())
      );
      if (foundPreferred.length > 0) {
        strengths.push(`Uses preferred phrases: "${foundPreferred.join('", "')}"`);
        vocabScore += 5 * foundPreferred.length;
      }

      // Check tone indicators
      const formalIndicators = ['therefore', 'furthermore', 'subsequently', 'whereas'];
      const informalIndicators = ['hey', 'gonna', 'wanna', 'awesome', '!!!!'];
      
      const hasFormal = formalIndicators.some(w => content.toLowerCase().includes(w));
      const hasInformal = informalIndicators.some(w => content.toLowerCase().includes(w));
      
      if (hasInformal) {
        issues.push({
          type: 'warning',
          message: 'Informal language detected',
          suggestion: 'Consider a more professional tone for institutional communications.',
        });
        toneScore -= 15;
      }

      // Check for active voice
      const passiveIndicators = ['was sent', 'is required', 'has been', 'will be sent'];
      const hasPassive = passiveIndicators.some(p => content.toLowerCase().includes(p));
      if (hasPassive) {
        issues.push({
          type: 'info',
          message: 'Passive voice detected',
          suggestion: 'Consider using active voice for more engaging communication.',
        });
        styleScore -= 5;
      } else {
        strengths.push('Good use of active voice');
      }

      // Normalize scores
      toneScore = Math.max(0, Math.min(100, toneScore));
      vocabScore = Math.max(0, Math.min(100, vocabScore));
      styleScore = Math.max(0, Math.min(100, styleScore));
      
      const overallScore = Math.round((toneScore + vocabScore + styleScore) / 3);

      setAnalysis({
        overallScore,
        toneMatch: toneScore,
        vocabularyMatch: vocabScore,
        styleMatch: styleScore,
        issues,
        strengths,
      });
      
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleImprove = async () => {
    if (!content.trim()) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-message', {
        body: {
          type: 'brand-improve',
          context: {
            originalContent: content,
            institutionName: config?.institutionName,
            preferredPhrases: config?.preferredPhrases,
            wordsToAvoid: config?.wordsToAvoid,
          }
        }
      });

      if (data?.message) {
        setImprovedContent(data.message);
      } else {
        // Fallback improvement
        let improved = content;
        config?.wordsToAvoid?.forEach(word => {
          improved = improved.replace(new RegExp(word, 'gi'), '[suggested replacement]');
        });
        setImprovedContent(improved);
      }
      toast({ title: "Content improved!" });
    } catch (error) {
      // Simple fallback
      setImprovedContent(content + "\n\n[AI improvements would appear here]");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyImproved = () => {
    navigator.clipboard.writeText(improvedContent);
    toast({ title: "Copied to clipboard!" });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Work';
    return 'Poor';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                  <Palette className="w-7 h-7 text-primary" />
                  Brand Voice Scorer
                </h1>
                <p className="text-muted-foreground mt-1">
                  Check if your message aligns with institutional brand guidelines
                </p>
              </div>
            </div>
            <AIBadge />
          </div>

          {/* Brand Settings Info */}
          {config && (
            <Card className="mb-6 bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-2">Active Brand Settings</h3>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {config.institutionName && (
                        <Badge variant="outline">📍 {config.institutionName}</Badge>
                      )}
                      {config.preferredPhrases && config.preferredPhrases.length > 0 && (
                        <Badge variant="outline">✅ {config.preferredPhrases.length} preferred phrases</Badge>
                      )}
                      {config.wordsToAvoid && config.wordsToAvoid.length > 0 && (
                        <Badge variant="outline">🚫 {config.wordsToAvoid.length} words to avoid</Badge>
                      )}
                    </div>
                  </div>
                  <Link to="/admin">
                    <Button variant="outline" size="sm">Configure</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Your Message</CardTitle>
                  <CardDescription>
                    Paste your content to analyze brand voice alignment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your message content..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !content.trim()}
                      className="flex-1"
                    >
                      {isAnalyzing ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Palette className="w-4 h-4 mr-2" />
                      )}
                      Analyze Brand Voice
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleImprove}
                      disabled={isAnalyzing || !content.trim()}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Auto-Improve
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Improved Content */}
              {improvedContent && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-serif text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Improved Version
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={copyImproved}>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap">
                      {improvedContent}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Results */}
            <div className="space-y-6">
              {analysis ? (
                <>
                  {/* Overall Score */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                          {analysis.overallScore}
                        </div>
                        <div className="text-muted-foreground mt-1">Brand Voice Score</div>
                        <Badge 
                          variant="outline" 
                          className={`mt-2 ${getScoreColor(analysis.overallScore)}`}
                        >
                          {getScoreLabel(analysis.overallScore)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Scores */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif text-lg">Score Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tone Match</span>
                          <span className={getScoreColor(analysis.toneMatch)}>{analysis.toneMatch}%</span>
                        </div>
                        <Progress value={analysis.toneMatch} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Vocabulary Match</span>
                          <span className={getScoreColor(analysis.vocabularyMatch)}>{analysis.vocabularyMatch}%</span>
                        </div>
                        <Progress value={analysis.vocabularyMatch} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Style Match</span>
                          <span className={getScoreColor(analysis.styleMatch)}>{analysis.styleMatch}%</span>
                        </div>
                        <Progress value={analysis.styleMatch} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Issues */}
                  {analysis.issues.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif text-lg flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          Issues ({analysis.issues.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysis.issues.map((issue, i) => (
                            <div key={i} className="p-3 border rounded-lg">
                              <div className="flex items-start gap-2">
                                {issue.type === 'error' ? (
                                  <XCircle className="w-4 h-4 text-destructive mt-0.5" />
                                ) : issue.type === 'warning' ? (
                                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
                                )}
                                <div>
                                  <p className="text-sm font-medium">{issue.message}</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    💡 {issue.suggestion}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Strengths */}
                  {analysis.strengths.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif text-lg flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          Strengths ({analysis.strengths.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.strengths.map((strength, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Palette className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-serif text-lg font-semibold mb-2">Ready to Score</h3>
                    <p className="text-muted-foreground">
                      Enter your message and click "Analyze Brand Voice" to see how well it matches your institutional guidelines.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrandVoiceScorer;
