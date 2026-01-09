import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  FileText
} from 'lucide-react';

interface ContentSection {
  id: string;
  title: string;
  content: string;
  score: number;
  issues: { type: string; message: string; severity: 'error' | 'warning' | 'info' }[];
  strengths: string[];
}

interface ContentSectionCardProps {
  section: ContentSection;
  isSelected: boolean;
  onClick: () => void;
}

export function ContentSectionCard({ section, isSelected, onClick }: ContentSectionCardProps) {
  const errorCount = section.issues.filter(i => i.severity === 'error').length;
  const warningCount = section.issues.filter(i => i.severity === 'warning').length;

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all",
        isSelected 
          ? "border-primary bg-primary/5 shadow-sm" 
          : "hover:border-primary/50 hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
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
            <ChevronRight className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              isSelected && "rotate-90"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
