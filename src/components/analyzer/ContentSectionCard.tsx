import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown,
  FileText,
  Quote,
  Lightbulb,
  Info
} from 'lucide-react';
import { useState } from 'react';

interface IssueDetail {
  type: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  quotedText?: string;
  recommendation?: string;
  dnaReference?: string;
}

interface StrengthDetail {
  type?: string;
  message: string;
  quotedText?: string;
  dnaReference?: string;
}

interface ContentSection {
  id: string;
  title: string;
  content: string;
  score: number;
  issues: IssueDetail[];
  strengths: (StrengthDetail | string)[];
}

interface ContentSectionCardProps {
  section: ContentSection;
  isSelected: boolean;
  onClick: () => void;
}

export function ContentSectionCard({ section, isSelected, onClick }: ContentSectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const errorCount = section.issues.filter(i => i.severity === 'error').length;
  const warningCount = section.issues.filter(i => i.severity === 'warning').length;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Info className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-500/5 border-red-500/20';
      case 'warning':
        return 'bg-amber-500/5 border-amber-500/20';
      default:
        return 'bg-blue-500/5 border-blue-500/20';
    }
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card 
        className={cn(
          "transition-all",
          isSelected 
            ? "border-primary bg-primary/5 shadow-sm" 
            : "hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <CollapsibleTrigger asChild>
          <CardContent 
            className="p-4 cursor-pointer"
            onClick={(e) => {
              onClick();
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-medium text-sm truncate">{section.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {section.content.slice(0, 120)}...
                </p>
                
                <div className="flex items-center gap-2 mt-2">
                  {errorCount > 0 && (
                    <Badge variant="destructive" className="text-xs px-1.5 py-0">
                      {errorCount} {errorCount === 1 ? 'error' : 'errors'}
                    </Badge>
                  )}
                  {warningCount > 0 && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0 text-amber-600 border-amber-500/30">
                      {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
                    </Badge>
                  )}
                  {section.strengths.length > 0 && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0 text-green-600 border-green-500/30">
                      {section.strengths.length} {section.strengths.length === 1 ? 'strength' : 'strengths'}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center">
                  <div className={cn(
                    "text-xl font-bold",
                    section.score >= 80 ? 'text-green-500' :
                    section.score >= 60 ? 'text-amber-500' :
                    'text-red-500'
                  )}>
                    {section.score}
                  </div>
                  <div className="text-[10px] text-muted-foreground">score</div>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  isExpanded && "rotate-180"
                )} />
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t pt-4">
            {/* Issues */}
            {section.issues.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Issues ({section.issues.length})
                </h5>
                <div className="space-y-2">
                  {section.issues.map((issue, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "p-3 rounded-lg border",
                        getSeverityBg(issue.severity)
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <p className="text-xs font-medium">{issue.message}</p>
                          
                          {issue.quotedText && (
                            <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-background/50 p-2 rounded border">
                              <Quote className="w-3 h-3 mt-0.5 shrink-0" />
                              <span className="italic">"{issue.quotedText}"</span>
                            </div>
                          )}
                          
                          {issue.recommendation && (
                            <div className="flex items-start gap-1.5 text-xs text-green-700 dark:text-green-400">
                              <Lightbulb className="w-3 h-3 mt-0.5 shrink-0" />
                              <span>{issue.recommendation}</span>
                            </div>
                          )}
                          
                          {issue.dnaReference && (
                            <Badge variant="outline" className="text-[10px] bg-primary/5">
                              DNA: {issue.dnaReference}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Strengths */}
            {section.strengths.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  Strengths ({section.strengths.length})
                </h5>
                <div className="space-y-2">
                  {section.strengths.map((strength, idx) => {
                    const strengthData = typeof strength === 'string' 
                      ? { message: strength } 
                      : strength;
                    
                    return (
                      <div 
                        key={idx} 
                        className="p-3 rounded-lg border bg-green-500/5 border-green-500/20"
                      >
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <p className="text-xs">{strengthData.message}</p>
                            
                            {strengthData.quotedText && (
                              <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-background/50 p-2 rounded border">
                                <Quote className="w-3 h-3 mt-0.5 shrink-0" />
                                <span className="italic">"{strengthData.quotedText}"</span>
                              </div>
                            )}
                            
                            {strengthData.dnaReference && (
                              <Badge variant="outline" className="text-[10px] bg-primary/5">
                                DNA: {strengthData.dnaReference}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* No issues or strengths */}
            {section.issues.length === 0 && section.strengths.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                No detailed analysis available for this section.
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
