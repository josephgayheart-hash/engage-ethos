import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Users, 
  Mail, 
  BookMarked,
  Lightbulb,
  X,
  Settings2
} from "lucide-react";
import type { PlaybookKit } from "@/types/playbook";
import { cn } from "@/lib/utils";

interface PlaybookKitGuidanceProps {
  kit: PlaybookKit;
  onClearKit: () => void;
  onCustomize?: () => void;
}

export function PlaybookKitGuidance({ kit, onClearKit, onCustomize }: PlaybookKitGuidanceProps) {
  const phases = kit.journey_template?.phases || [];

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="icon-container icon-container-md bg-primary/20 shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs gap-1 bg-primary/20 text-primary border-0">
                    <CheckCircle2 className="w-3 h-3" />
                    Playbook Active
                  </Badge>
                  <span className="font-semibold text-sm">{kit.name}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {kit.description}
                </p>
              </div>

              {/* Pre-configured elements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    Pre-configured by kit
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {kit.target_audiences?.map((audience, idx) => (
                      <Badge key={idx} variant="outline" className="text-[10px] bg-background/50">
                        <Users className="w-2.5 h-2.5 mr-1" />
                        {audience.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                    {kit.target_cohorts?.map((cohort, idx) => (
                      <Badge key={idx} variant="outline" className="text-[10px] bg-background/50">
                        {cohort.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                  {phases.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {phases.map((phase, idx) => (
                        <span key={idx} className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                          {phase.name} ({phase.duration})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Settings2 className="w-3 h-3 text-blue-600" />
                    You can customize
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-[10px] bg-blue-50/50 border-blue-200/50 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400">
                      <Clock className="w-2.5 h-2.5 mr-1" />
                      Timeline & Duration
                    </Badge>
                    <Badge variant="outline" className="text-[10px] bg-blue-50/50 border-blue-200/50 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400">
                      <Mail className="w-2.5 h-2.5 mr-1" />
                      Channel Mix
                    </Badge>
                    <Badge variant="outline" className="text-[10px] bg-blue-50/50 border-blue-200/50 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400">
                      <BookMarked className="w-2.5 h-2.5 mr-1" />
                      Stories & Facts
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Best practice tip */}
              {kit.best_practices && kit.best_practices.length > 0 && (
                <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/30 dark:border-amber-800/30 rounded px-2 py-1.5">
                  <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
                  <span className="line-clamp-2">{kit.best_practices[0]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              onClick={onClearKit}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
