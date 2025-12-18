import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { checkAccessibility, getScoreColor, getScoreLabel, type AccessibilityResult } from "@/lib/accessibilityChecker";
import { analyzeReadingLevel, type ReadingLevelResult } from "@/lib/readingLevel";
import { 
  ArrowLeft, 
  Accessibility,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  RefreshCw,
  BookOpen,
  Eye,
  Ear
} from "lucide-react";

const AccessibilityCheckerPage = () => {
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState("email");
  const [accessibilityResult, setAccessibilityResult] = useState<AccessibilityResult | null>(null);
  const [readingResult, setReadingResult] = useState<ReadingLevelResult | null>(null);

  const handleAnalyze = () => {
    if (!content.trim()) return;
    
    const accessibility = checkAccessibility(content, channel);
    const reading = analyzeReadingLevel(content);
    
    setAccessibilityResult(accessibility);
    setReadingResult(reading);
  };

  const handleClear = () => {
    setContent("");
    setAccessibilityResult(null);
    setReadingResult(null);
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getReadingLevelColor = (score: number) => {
    if (score >= 60) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <Accessibility className="w-7 h-7 text-primary" />
                Accessibility & Reading Level
              </h1>
              <p className="text-muted-foreground mt-1">
                Ensure your messages are accessible to all students
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Check Your Message</CardTitle>
                  <CardDescription>
                    Paste your message content to analyze accessibility and readability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Channel</Label>
                    <Select value={channel} onValueChange={setChannel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="portal">Portal</SelectItem>
                        <SelectItem value="social-media">Social Media</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Message Content</Label>
                    <Textarea
                      placeholder="Paste your message here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {content.length} characters
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={!content.trim()}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Analyze Accessibility
                    </Button>
                    {(accessibilityResult || content) && (
                      <Button variant="outline" onClick={handleClear}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <Ear className="w-5 h-5" />
                    Screen Reader Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Use descriptive link text (not "click here")</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Avoid ALL CAPS for emphasis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Limit emoji use (1-2 per message)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Spell out abbreviations on first use</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>Use clear date formats (January 15, 2025)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {accessibilityResult && (
                <>
                  {/* Score Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className={`text-4xl font-bold ${getScoreColor(accessibilityResult.score)}`}>
                            {accessibilityResult.score}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">Accessibility Score</div>
                          <Badge variant="outline" className={`mt-2 ${getScoreColor(accessibilityResult.score)}`}>
                            {getScoreLabel(accessibilityResult.score)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    {readingResult && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className={`text-4xl font-bold ${getReadingLevelColor(readingResult.fleschReadingEase)}`}>
                              {readingResult.fleschReadingEase}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">Reading Ease</div>
                            <Badge variant="outline" className="mt-2">
                              Grade {readingResult.fleschKincaid}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Reading Level Details */}
                  {readingResult && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif text-lg flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          Reading Level Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Word Count</span>
                            <span className="font-medium">{readingResult.wordCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sentences</span>
                            <span className="font-medium">{readingResult.sentenceCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg Words/Sentence</span>
                            <span className="font-medium">{readingResult.avgWordsPerSentence}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Reading Time</span>
                            <span className="font-medium">{readingResult.readingTime} min</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-sm font-medium mb-2">{readingResult.gradeLevel}</p>
                          <Progress 
                            value={Math.min(readingResult.fleschReadingEase, 100)} 
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Higher scores = easier to read. Aim for 60+ for student communications.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Issues */}
                  {accessibilityResult.issues.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif text-lg flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          Issues Found ({accessibilityResult.issues.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {accessibilityResult.issues.map((issue, i) => (
                            <div key={i} className="p-3 border rounded-lg">
                              <div className="flex items-start gap-2">
                                {getIssueIcon(issue.type)}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{issue.category}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {issue.type}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {issue.message}
                                  </p>
                                  <p className="text-sm text-primary mt-2">
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

                  {/* Passed Checks */}
                  {accessibilityResult.passed.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif text-lg flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          Passed Checks ({accessibilityResult.passed.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {accessibilityResult.passed.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Reading Suggestions */}
                  {readingResult && readingResult.suggestions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif text-lg">Readability Suggestions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {readingResult.suggestions.map((suggestion, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {!accessibilityResult && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Accessibility className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-serif text-lg font-semibold mb-2">Ready to Analyze</h3>
                    <p className="text-muted-foreground">
                      Enter your message content and click "Analyze Accessibility" to check for issues.
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

export default AccessibilityCheckerPage;
