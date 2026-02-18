import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AIBadge } from "@/components/ui/ai-indicator";
import { useToast } from "@/hooks/use-toast";
import { useInstitutionalConfig } from "@/hooks/useInstitutionalConfig";
import { useContentDNAForGeneration } from "@/hooks/useContentDNAForGeneration";
import { useToolTracking } from "@/hooks/useToolTracking";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Mail,
  Sparkles,
  Copy,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Monitor,
  Zap,
  Target,
  Clock,
  TrendingUp
} from "lucide-react";

const SubjectLineOptimizer = () => {
  const { toast } = useToast();
  const { config: institutionalConfig } = useInstitutionalConfig();
  const { contentDNA } = useContentDNAForGeneration();
  const { trackToolUse } = useToolTracking();
  const [subjectLine, setSubjectLine] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [audience, setAudience] = useState("first-year");
  const [goal, setGoal] = useState("open");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [abVariants, setAbVariants] = useState<{ a: string; b: string } | null>(null);

  const charCount = subjectLine.length;
  const previewCharCount = previewText.length;
  
  // Character limit recommendations
  const getCharacterStatus = (count: number, type: 'subject' | 'preview') => {
    if (type === 'subject') {
      if (count === 0) return { status: 'empty', message: 'Enter a subject line', color: 'text-muted-foreground' };
      if (count <= 30) return { status: 'short', message: 'Short - good for mobile', color: 'text-green-600' };
      if (count <= 50) return { status: 'optimal', message: 'Optimal length', color: 'text-green-600' };
      if (count <= 60) return { status: 'good', message: 'Good - may truncate on mobile', color: 'text-yellow-600' };
      return { status: 'long', message: 'Too long - will truncate', color: 'text-destructive' };
    } else {
      if (count === 0) return { status: 'empty', message: 'Add preview text', color: 'text-muted-foreground' };
      if (count <= 90) return { status: 'optimal', message: 'Good preview length', color: 'text-green-600' };
      if (count <= 130) return { status: 'good', message: 'May truncate on some clients', color: 'text-yellow-600' };
      return { status: 'long', message: 'Will likely truncate', color: 'text-destructive' };
    }
  };

  const subjectStatus = getCharacterStatus(charCount, 'subject');
  const previewStatus = getCharacterStatus(previewCharCount, 'preview');

  const handleGenerateSuggestions = async () => {
    if (!subjectLine.trim()) {
      toast({ variant: "destructive", title: "Enter a subject line first" });
      return;
    }

    setIsGenerating(true);
    
    // Track tool usage
    trackToolUse('subject_line_optimizer', 'generate', {
      subjectLength: subjectLine.length,
      audience,
      goal,
      hasContentDNA: !!contentDNA,
    });
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-message', {
        body: {
          type: 'subject-line',
          context: {
            subjectLine,
            audience,
            goal,
            institutionName: institutionalConfig?.institutionName,
          },
          contentDNA: contentDNA || undefined,
        }
      });

      if (error) throw error;

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
      } else {
        // Fallback suggestions if API doesn't return expected format
        setSuggestions([
          `${subjectLine} - Action Required`,
          `Important: ${subjectLine}`,
          `Don't Miss: ${subjectLine}`,
          `[Update] ${subjectLine}`,
          `Your ${subjectLine} Awaits`,
        ]);
      }

      toast({ title: "Suggestions generated!" });
    } catch (error) {
      console.error("Generation failed:", error);
      // Provide fallback suggestions
      setSuggestions([
        `${subjectLine} - Action Required`,
        `Important: ${subjectLine}`,
        `Don't Miss: ${subjectLine}`,
      ]);
      toast({ title: "Suggestions generated (offline mode)" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateABTest = async () => {
    if (!subjectLine.trim()) {
      toast({ variant: "destructive", title: "Enter a subject line first" });
      return;
    }

    setIsGenerating(true);
    try {
      // Generate A/B variants
      const variantA = subjectLine;
      const variantB = subjectLine.length > 40 
        ? subjectLine.slice(0, 40) + '...'
        : `Action Required: ${subjectLine}`;

      setAbVariants({ a: variantA, b: variantB });
      toast({ title: "A/B variants created!" });
    } catch (error) {
      console.error("A/B generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const useSuggestion = (suggestion: string) => {
    setSubjectLine(suggestion);
    toast({ title: "Subject line updated" });
  };

  return (
    <div className="bg-background">
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <Mail className="w-7 h-7 text-primary" />
                Subject Line Optimizer
              </h1>
              <p className="text-muted-foreground mt-1">
                Craft compelling subject lines with AI suggestions and A/B testing
              </p>
            </div>
            <AIBadge />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subject Line Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Subject Line</CardTitle>
                  <CardDescription>
                    Enter your subject line to analyze and optimize
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter your email subject line..."
                      value={subjectLine}
                      onChange={(e) => setSubjectLine(e.target.value)}
                      className="text-lg"
                    />
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${subjectStatus.color}`}>
                        {subjectStatus.message}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {charCount} characters
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((charCount / 60) * 100, 100)} 
                      className={charCount > 60 ? '[&>div]:bg-destructive' : charCount > 50 ? '[&>div]:bg-yellow-500' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preview Text (Preheader)</Label>
                    <Textarea
                      placeholder="Add preview text that appears after the subject..."
                      value={previewText}
                      onChange={(e) => setPreviewText(e.target.value)}
                      rows={2}
                    />
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${previewStatus.color}`}>
                        {previewStatus.message}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {previewCharCount} characters
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <Select value={audience} onValueChange={setAudience}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prospective">Prospective Students</SelectItem>
                          <SelectItem value="first-year">First-Year Students</SelectItem>
                          <SelectItem value="continuing">Continuing Students</SelectItem>
                          <SelectItem value="at-risk">At-Risk Students</SelectItem>
                          <SelectItem value="graduate">Graduate Students</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Goal</Label>
                      <Select value={goal} onValueChange={setGoal}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Maximize Opens</SelectItem>
                          <SelectItem value="click">Drive Clicks</SelectItem>
                          <SelectItem value="action">Prompt Action</SelectItem>
                          <SelectItem value="inform">Inform/Update</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleGenerateSuggestions} 
                      disabled={isGenerating || !subjectLine.trim()}
                      className="flex-1"
                    >
                      {isGenerating ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Generate Suggestions
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleGenerateABTest}
                      disabled={isGenerating || !subjectLine.trim()}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      A/B Test
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Inbox Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="desktop">
                    <TabsList>
                      <TabsTrigger value="desktop" className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        Desktop
                      </TabsTrigger>
                      <TabsTrigger value="mobile" className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Mobile
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="desktop" className="mt-4">
                      <div className="border rounded-lg p-4 bg-card">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                            {institutionalConfig?.institutionName?.[0] || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {institutionalConfig?.institutionName || 'University'}
                              </span>
                              <span className="text-sm text-muted-foreground">10:30 AM</span>
                            </div>
                            <div className="font-medium truncate">
                              {subjectLine || 'Your subject line here...'}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {previewText || 'Preview text will appear here...'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="mobile" className="mt-4">
                      <div className="max-w-[320px] mx-auto border rounded-xl p-4 bg-card">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">
                              {institutionalConfig?.institutionName || 'University'}
                            </span>
                            <span className="text-xs text-muted-foreground">10:30 AM</span>
                          </div>
                          <div className="font-medium text-sm truncate">
                            {subjectLine.slice(0, 35) || 'Subject line...'}
                            {subjectLine.length > 35 && '...'}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {previewText.slice(0, 50) || 'Preview text...'}
                            {previewText.length > 50 && '...'}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* A/B Test Variants */}
              {abVariants && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      A/B Test Variants
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <Badge className="mb-2">Variant A</Badge>
                        <p className="font-medium">{abVariants.a}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => copyToClipboard(abVariants.a)}
                        >
                          <Copy className="w-4 h-4 mr-1" /> Copy
                        </Button>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <Badge variant="secondary" className="mb-2">Variant B</Badge>
                        <p className="font-medium">{abVariants.b}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => copyToClipboard(abVariants.b)}
                        >
                          <Copy className="w-4 h-4 mr-1" /> Copy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Suggestions */}
              {suggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      AI Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {suggestions.map((suggestion, i) => (
                        <div 
                          key={i}
                          className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer group"
                          onClick={() => useSuggestion(suggestion)}
                        >
                          <p className="text-sm">{suggestion}</p>
                          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-7">
                              Use This
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(suggestion);
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Best Practices */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Best Practices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Keep under 50 characters for full display</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Front-load important words</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Use action verbs when appropriate</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Avoid ALL CAPS and excessive punctuation</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                      <span>Avoid spam triggers: FREE, URGENT, Act Now</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Industry Benchmarks */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Higher Ed Benchmarks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Avg Open Rate</span>
                      <span className="font-semibold">28.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Avg Click Rate</span>
                      <span className="font-semibold">4.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Best Send Time</span>
                      <span className="font-semibold">Tue 10am</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubjectLineOptimizer;
