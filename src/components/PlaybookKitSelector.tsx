import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlaybookKits } from "@/hooks/usePlaybookKits";
import { 
  BookOpen, 
  Users, 
  ArrowRight, 
  GraduationCap, 
  Briefcase, 
  Heart,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lightbulb
} from "lucide-react";
import type { PlaybookKit } from "@/types/playbook";
import { cn } from "@/lib/utils";

interface PlaybookKitSelectorProps {
  onSelectKit: (kit: PlaybookKit) => void;
  selectedKitKey?: string;
  institutionType?: string;
  showAllKits?: boolean;
  onToggleShowAll?: (showAll: boolean) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  'community-college': GraduationCap,
  'enrollment-decline': AlertTriangle,
  'workforce': Briefcase,
  'belonging': Heart,
};

const categoryLabels: Record<string, string> = {
  'community-college': 'Community College',
  'enrollment-decline': 'Enrollment Recovery',
  'workforce': 'Workforce Development',
  'belonging': 'Belonging & Community',
};

const categoryColors: Record<string, string> = {
  'community-college': 'bg-pillar-cognitive/10 text-pillar-cognitive border-pillar-cognitive/20',
  'enrollment-decline': 'bg-destructive/10 text-destructive border-destructive/20',
  'workforce': 'bg-pillar-authority/10 text-pillar-authority border-pillar-authority/20',
  'belonging': 'bg-pillar-consensus/10 text-pillar-consensus border-pillar-consensus/20',
};

export function PlaybookKitSelector({ 
  onSelectKit, 
  selectedKitKey,
  institutionType,
  showAllKits = false,
  onToggleShowAll,
}: PlaybookKitSelectorProps) {
  // Map Carnegie institution types to playbook kit institution_types values
  const kitInstitutionType = (() => {
    if (!institutionType) return 'community-college';
    // Map new Carnegie types to existing kit filters
    if (institutionType === 'associates-college' || institutionType === 'community-college' || institutionType === 'technical-college') return 'community-college';
    if (institutionType === 'doctoral-university' || institutionType === 'masters-university' || institutionType === 'four-year-university') return 'four-year-university';
    if (institutionType === 'baccalaureate-college') return 'four-year-university';
    if (institutionType === 'special-focus' || institutionType === 'graduate-school' || institutionType === 'professional-school') return 'graduate-school';
    return institutionType;
  })();
    
  const { kits: allKits, isLoading, error } = usePlaybookKits(kitInstitutionType);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Filter kits based on institution type unless showAllKits is true
  const kits = showAllKits 
    ? allKits 
    : allKits.filter(kit => 
        !kit.institution_types || 
        kit.institution_types.length === 0 ||
        kit.institution_types.includes(kitInstitutionType)
      );

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading playbook kits...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || kits.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No playbook kits available. Create a custom journey below.
          </p>
        </CardContent>
      </Card>
    );
  }

  const categories = ['all', ...new Set(kits.map(k => k.category))];
  const filteredKits = activeCategory === 'all' 
    ? kits 
    : kits.filter(k => k.category === activeCategory);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="icon-container icon-container-md bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Start from a Playbook</CardTitle>
              <CardDescription>
                Research-backed journey templates based on Lumina Foundation best practices
              </CardDescription>
            </div>
          </div>
          {onToggleShowAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleShowAll(!showAllKits)}
              className="text-xs"
            >
              {showAllKits ? 'Show Relevant' : 'Show All Kits'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="w-full justify-start mb-4 h-auto flex-wrap gap-1 bg-transparent p-0">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All Kits
            </TabsTrigger>
            {categories.filter(c => c !== 'all').map(category => {
              const Icon = categoryIcons[category] || BookOpen;
              return (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {categoryLabels[category] || category}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <ScrollArea className="h-[280px] pr-3">
            <div className="grid gap-3">
              {filteredKits.map(kit => {
                const isSelected = kit.kit_key === selectedKitKey;
                const Icon = categoryIcons[kit.category] || BookOpen;
                const phases = kit.journey_template?.phases || [];

                return (
                  <Card 
                    key={kit.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md group",
                      isSelected && "ring-2 ring-primary bg-primary/5"
                    )}
                    onClick={() => onSelectKit(kit)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Badge 
                              variant="outline" 
                              className={cn("text-[10px] gap-1", categoryColors[kit.category])}
                            >
                              <Icon className="w-3 h-3" />
                              {categoryLabels[kit.category] || kit.category}
                            </Badge>
                            {isSelected && (
                              <Badge className="bg-primary text-primary-foreground text-[10px]">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Selected
                              </Badge>
                            )}
                          </div>
                          
                          <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                            {kit.name}
                          </h4>
                          
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {kit.description}
                          </p>

                          {/* Phases preview */}
                          {phases.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {phases.map((phase, idx) => (
                                <div 
                                  key={idx}
                                  className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded"
                                >
                                  <Clock className="w-2.5 h-2.5" />
                                  {phase.name}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Best practices preview */}
                          {kit.best_practices && kit.best_practices.length > 0 && (
                            <div className="flex items-start gap-1 text-[10px] text-muted-foreground">
                              <Lightbulb className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
                              <span className="line-clamp-1">{kit.best_practices[0]}</span>
                            </div>
                          )}
                        </div>

                        <Button 
                          variant={isSelected ? "default" : "ghost"}
                          size="sm"
                          className="shrink-0"
                        >
                          {isSelected ? 'Selected' : 'Use Kit'}
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
