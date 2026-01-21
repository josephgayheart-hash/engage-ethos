import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Sparkles, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileText,
  ArrowRight
} from "lucide-react";
import type { BrandAuditTouchpoint, TerminologyIssue, TouchpointAnalysisResult } from "@/types/playbook";
import { cn } from "@/lib/utils";

interface TouchpointAnalyzerProps {
  touchpoint: BrandAuditTouchpoint;
  onUpdateTouchpoint: (id: string, updates: Partial<BrandAuditTouchpoint>) => Promise<void>;
  onAnalyze: (touchpointId: string, content: string) => Promise<TouchpointAnalysisResult | null>;
  isAnalyzing?: boolean;
}

export function TouchpointAnalyzer({
  touchpoint,
  onUpdateTouchpoint,
  onAnalyze,
  isAnalyzing = false,
}: TouchpointAnalyzerProps) {
  const [content, setContent] = useState(touchpoint.content_sample || '');
  const [localAnalyzing, setLocalAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!content.trim()) return;

    setLocalAnalyzing(true);
    try {
      await onUpdateTouchpoint(touchpoint.id, { content_sample: content });
      const result = await onAnalyze(touchpoint.id, content);
      
      if (result) {
        await onUpdateTouchpoint(touchpoint.id, {
          brand_score: result.brandScore,
          voice_score: result.voiceScore,
          terminology_issues: result.terminologyIssues,
          analysis_result: result,
          status: 'analyzed',
        });
      }
    } finally {
      setLocalAnalyzing(false);
    }
  };

  const analysisResult = touchpoint.analysis_result;
  const hasAnalysis = touchpoint.status === 'analyzed' && analysisResult;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Moderate';
    return 'Needs Attention';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="icon-container icon-container-md bg-secondary/10">
              <Search className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-base">{touchpoint.touchpoint_name}</CardTitle>
              <CardDescription className="text-xs">
                {touchpoint.touchpoint_type} · {touchpoint.touchpoint_category || 'Uncategorized'}
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant="outline"
            className={cn(
              touchpoint.status === 'analyzed' && 'bg-green-50 text-green-700 border-green-200',
              touchpoint.status === 'pending' && 'bg-amber-50 text-amber-700 border-amber-200',
              touchpoint.status === 'remediated' && 'bg-blue-50 text-blue-700 border-blue-200'
            )}
          >
            {touchpoint.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Content Input */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Content Sample</Label>
          <Textarea
            placeholder="Paste or type the content from this touchpoint that you want to analyze for brand consistency..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {content.length} characters · Paste headlines, body copy, CTAs, or any text from this touchpoint
          </p>
        </div>

        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={!content.trim() || localAnalyzing || isAnalyzing}
          className="w-full gap-2"
        >
          {localAnalyzing || isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze for Brand Consistency
            </>
          )}
        </Button>

        {/* Analysis Results */}
        {hasAnalysis && (
          <div className="space-y-4 pt-4 border-t">
            {/* Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Brand Score</span>
                  <span className={cn("text-lg font-bold", getScoreColor(analysisResult.brandScore))}>
                    {analysisResult.brandScore}%
                  </span>
                </div>
                <Progress value={analysisResult.brandScore} className="h-2" />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {getScoreLabel(analysisResult.brandScore)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Voice Score</span>
                  <span className={cn("text-lg font-bold", getScoreColor(analysisResult.voiceScore))}>
                    {analysisResult.voiceScore}%
                  </span>
                </div>
                <Progress value={analysisResult.voiceScore} className="h-2" />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {getScoreLabel(analysisResult.voiceScore)}
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="p-3 rounded-lg border bg-card">
              <h4 className="text-sm font-medium mb-2">Analysis Summary</h4>
              <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
            </div>

            {/* Brand Elements */}
            {analysisResult.brandElements && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Brand Elements</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    {analysisResult.brandElements.promise.present ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span>Brand Promise</span>
                    {analysisResult.brandElements.promise.evidence && (
                      <span className="text-xs text-muted-foreground truncate">
                        — "{analysisResult.brandElements.promise.evidence}"
                      </span>
                    )}
                  </div>
                  {analysisResult.brandElements.pillars.map((pillar, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {pillar.present ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span>{pillar.name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {pillar.strength}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terminology Issues */}
            {analysisResult.terminologyIssues && analysisResult.terminologyIssues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Terminology Inconsistencies
                </h4>
                <div className="space-y-1.5">
                  {analysisResult.terminologyIssues.map((issue, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 text-sm p-2 rounded bg-amber-50 dark:bg-amber-950/20"
                    >
                      <span className="text-destructive line-through">{issue.found}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-green-700 dark:text-green-400 font-medium">{issue.preferred}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Recommendations</h4>
                <ul className="space-y-1.5">
                  {analysisResult.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
