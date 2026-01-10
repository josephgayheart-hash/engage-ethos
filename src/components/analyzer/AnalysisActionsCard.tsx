import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles, Settings2 } from 'lucide-react';

interface AnalysisActionsCardProps {
  onNewAnalysis: () => void;
  onRewrite: () => void;
  showRewrite: boolean;
  isDisabled?: boolean;
}

export function AnalysisActionsCard({ 
  onNewAnalysis, 
  onRewrite, 
  showRewrite,
  isDisabled 
}: AnalysisActionsCardProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="w-4 h-4 text-primary" />
          Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onNewAnalysis}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          New Analysis
        </Button>
        
        <Button
          className="w-full justify-start bg-[hsl(270_70%_55%)] hover:bg-[hsl(270_70%_50%)]"
          onClick={onRewrite}
          disabled={showRewrite || isDisabled}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Rewrite for Brand
        </Button>
      </CardContent>
    </Card>
  );
}
