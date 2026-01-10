import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IssuesSummaryCardProps {
  totalIssues: number;
  totalStrengths: number;
  criticalIssues?: string[];
  topStrengths?: string[];
}

export function IssuesSummaryCard({ 
  totalIssues, 
  totalStrengths, 
  criticalIssues,
  topStrengths
}: IssuesSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Issues Found ({totalIssues})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm">
              <span className="font-bold">{totalIssues}</span> issues
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm">
              <span className="font-bold">{totalStrengths}</span> strengths
            </span>
          </div>
        </div>
        
        {/* Critical Issues */}
        {criticalIssues && criticalIssues.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Critical Issues
            </h5>
            <ScrollArea className="max-h-[120px]">
              <div className="space-y-1.5 pr-2">
                {criticalIssues.map((issue, i) => (
                  <div 
                    key={i} 
                    className="flex items-start gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/20"
                  >
                    <span className="text-red-500 font-bold text-xs">•</span>
                    <p className="text-xs">{issue}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {/* Top Strengths */}
        {topStrengths && topStrengths.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-green-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Top Strengths
            </h5>
            <ScrollArea className="max-h-[100px]">
              <div className="space-y-1.5 pr-2">
                {topStrengths.slice(0, 3).map((strength, i) => (
                  <div 
                    key={i} 
                    className="flex items-start gap-2 p-2 rounded-lg bg-green-500/5 border border-green-500/20"
                  >
                    <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-xs">{strength}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {/* Empty state */}
        {(!criticalIssues || criticalIssues.length === 0) && (!topStrengths || topStrengths.length === 0) && (
          <p className="text-xs text-muted-foreground text-center py-2">
            No critical issues or notable strengths detected.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
