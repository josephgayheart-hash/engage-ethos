import { useState, useMemo } from "react";
import { 
  BookOpen, 
  BarChart3, 
  Star, 
  Users,
  CheckCircle2,
  Filter,
  X
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useStoryBank, Story, StoryType } from "@/hooks/useStoryBank";
import { useFactBook, Fact, FactCategory } from "@/hooks/useFactBook";
import { useIndustry } from "@/contexts/IndustryContext";
import { resolveIcon } from "@/lib/iconResolver";

interface StoryFactSelectorProps {
  profileId: string | null;
  selectedStories: Story[];
  selectedFacts: Fact[];
  onStoriesChange: (stories: Story[]) => void;
  onFactsChange: (facts: Fact[]) => void;
  className?: string;
}

export function StoryFactSelector({
  profileId,
  selectedStories,
  selectedFacts,
  onStoriesChange,
  onFactsChange,
  className,
}: StoryFactSelectorProps) {
  const { stories, isLoading: storiesLoading } = useStoryBank({ profileId: profileId || undefined });
  const { facts, isLoading: factsLoading } = useFactBook({ profileId: profileId || undefined });
  
  const [storyTypeFilter, setStoryTypeFilter] = useState<string>('all');
  const [factCategoryFilter, setFactCategoryFilter] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showHighlightedOnly, setShowHighlightedOnly] = useState(false);

  // Filter stories
  const filteredStories = useMemo(() => {
    let result = stories;
    if (storyTypeFilter !== 'all') {
      result = result.filter(s => s.story_type === storyTypeFilter);
    }
    if (showFeaturedOnly) {
      result = result.filter(s => s.is_featured);
    }
    return result;
  }, [stories, storyTypeFilter, showFeaturedOnly]);

  // Filter facts
  const filteredFacts = useMemo(() => {
    let result = facts;
    if (factCategoryFilter !== 'all') {
      result = result.filter(f => f.category === factCategoryFilter);
    }
    if (showHighlightedOnly) {
      result = result.filter(f => f.is_highlight);
    }
    return result;
  }, [facts, factCategoryFilter, showHighlightedOnly]);

  // Get unique story types and fact categories for filters
  const storyTypes = useMemo(() => {
    const types = new Set(stories.map(s => s.story_type));
    return Array.from(types) as StoryType[];
  }, [stories]);

  const factCategories = useMemo(() => {
    const cats = new Set(facts.map(f => f.category));
    return Array.from(cats);
  }, [facts]);

  const toggleStory = (story: Story) => {
    const isSelected = selectedStories.some(s => s.id === story.id);
    if (isSelected) {
      onStoriesChange(selectedStories.filter(s => s.id !== story.id));
    } else {
      onStoriesChange([...selectedStories, story]);
    }
  };

  const toggleFact = (fact: Fact) => {
    const isSelected = selectedFacts.some(f => f.id === fact.id);
    if (isSelected) {
      onFactsChange(selectedFacts.filter(f => f.id !== fact.id));
    } else {
      onFactsChange([...selectedFacts, fact]);
    }
  };

  const selectFeaturedStories = () => {
    const featured = stories.filter(s => s.is_featured && s.is_approved);
    onStoriesChange(featured);
  };

  const selectHighlightedFacts = () => {
    const highlighted = facts.filter(f => f.is_highlight);
    onFactsChange(highlighted);
  };

  const clearStories = () => onStoriesChange([]);
  const clearFacts = () => onFactsChange([]);

  const totalSelected = selectedStories.length + selectedFacts.length;

  if (!profileId) {
    return (
      <div className={cn("p-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20", className)}>
        <p className="text-sm text-muted-foreground text-center">
          Select an institutional profile to access Stories & Facts
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selection Summary */}
      {totalSelected > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">
            {selectedStories.length > 0 && `${selectedStories.length} ${selectedStories.length === 1 ? 'story' : 'stories'}`}
            {selectedStories.length > 0 && selectedFacts.length > 0 && ' + '}
            {selectedFacts.length > 0 && `${selectedFacts.length} ${selectedFacts.length === 1 ? 'fact' : 'facts'}`}
            {' '}selected
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto h-7 text-xs"
            onClick={() => { clearStories(); clearFacts(); }}
          >
            Clear all
          </Button>
        </div>
      )}

      <Tabs defaultValue="stories" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stories" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Stories
            {selectedStories.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {selectedStories.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="facts" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Facts
            {selectedFacts.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {selectedFacts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Stories Tab */}
        <TabsContent value="stories" className="mt-4 space-y-3">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={storyTypeFilter} onValueChange={setStoryTypeFilter}>
              <SelectTrigger className="w-[140px] h-8">
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {storyTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {storyTypeLabels[type] || type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant={showFeaturedOnly ? "secondary" : "outline"} 
              size="sm" 
              className="h-8 gap-1"
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            >
              <Star className="w-3 h-3" />
              Featured
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs ml-auto"
              onClick={selectFeaturedStories}
            >
              Select all featured
            </Button>
          </div>

          {/* Story List */}
          <ScrollArea className="h-[240px] rounded-md border">
            {storiesLoading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Loading stories...
              </div>
            ) : filteredStories.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {stories.length === 0 
                  ? "No stories in your Story Bank yet"
                  : "No stories match current filters"
                }
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {filteredStories.map(story => {
                  const isSelected = selectedStories.some(s => s.id === story.id);
                  const StoryIcon = storyTypeIcons[story.story_type as StoryType] || Users;
                  
                  return (
                    <div 
                      key={story.id}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all",
                        isSelected 
                          ? "border-accent bg-accent/5" 
                          : "border-border hover:border-muted-foreground/50"
                      )}
                      onClick={() => toggleStory(story)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={isSelected} 
                          onCheckedChange={() => toggleStory(story)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <StoryIcon className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="font-medium text-sm truncate">{story.title}</span>
                            {story.is_featured && (
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                          {story.pull_quote && (
                            <p className="text-xs text-muted-foreground line-clamp-2 italic">
                              "{story.pull_quote}"
                            </p>
                          )}
                          {story.subject_name && (
                            <p className="text-xs text-muted-foreground mt-1">
                              — {story.subject_name}{story.subject_role ? `, ${story.subject_role}` : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Facts Tab */}
        <TabsContent value="facts" className="mt-4 space-y-3">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={factCategoryFilter} onValueChange={setFactCategoryFilter}>
              <SelectTrigger className="w-[160px] h-8">
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {factCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant={showHighlightedOnly ? "secondary" : "outline"} 
              size="sm" 
              className="h-8 gap-1"
              onClick={() => setShowHighlightedOnly(!showHighlightedOnly)}
            >
              <Star className="w-3 h-3" />
              Highlighted
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs ml-auto"
              onClick={selectHighlightedFacts}
            >
              Select all highlighted
            </Button>
          </div>

          {/* Fact List */}
          <ScrollArea className="h-[240px] rounded-md border">
            {factsLoading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Loading facts...
              </div>
            ) : filteredFacts.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {facts.length === 0 
                  ? "No facts in your Fact Book yet"
                  : "No facts match current filters"
                }
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {filteredFacts.map(fact => {
                  const isSelected = selectedFacts.some(f => f.id === fact.id);
                  
                  return (
                    <div 
                      key={fact.id}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all",
                        isSelected 
                          ? "border-accent bg-accent/5" 
                          : "border-border hover:border-muted-foreground/50"
                      )}
                      onClick={() => toggleFact(fact)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={isSelected} 
                          onCheckedChange={() => toggleFact(fact)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                              {fact.category}
                            </Badge>
                            {fact.is_highlight && (
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-primary text-lg">{fact.value}</span>
                            <span className="text-sm text-muted-foreground">{fact.label}</span>
                          </div>
                          {fact.context && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {fact.context}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Compact badge showing story/fact selection count
 */
export function StoryFactSelectionBadge({ 
  storyCount, 
  factCount 
}: { 
  storyCount: number; 
  factCount: number;
}) {
  const total = storyCount + factCount;
  if (total === 0) return null;

  return (
    <Badge variant="secondary" className="gap-1.5 bg-secondary/50">
      {storyCount > 0 && (
        <>
          <BookOpen className="w-3 h-3" />
          {storyCount}
        </>
      )}
      {storyCount > 0 && factCount > 0 && <span className="text-muted-foreground">+</span>}
      {factCount > 0 && (
        <>
          <BarChart3 className="w-3 h-3" />
          {factCount}
        </>
      )}
    </Badge>
  );
}
