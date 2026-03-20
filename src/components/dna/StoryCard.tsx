import { Story } from '@/hooks/useStoryBank';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  StarOff, 
  Trash2, 
  Pencil, 
  Quote,
  User,
} from 'lucide-react';
import { useIndustry } from '@/contexts/IndustryContext';
import { resolveIcon } from '@/lib/iconResolver';

const typeColors: Record<number, string> = {
  0: 'bg-blue-500',
  1: 'bg-green-500',
  2: 'bg-amber-500',
  3: 'bg-purple-500',
  4: 'bg-indigo-500',
  5: 'bg-teal-500',
  6: 'bg-rose-500',
  7: 'bg-cyan-500',
};

interface StoryCardProps {
  story: Story;
  onEdit?: (story: Story) => void;
  onDelete?: (id: string) => void;
  onToggleFeatured?: (id: string, featured: boolean) => void;
  onClick?: (story: Story) => void;
  isAdmin?: boolean;
}

export function StoryCard({ 
  story, 
  onEdit, 
  onDelete, 
  onToggleFeatured,
  onClick,
  isAdmin = false 
}: StoryCardProps) {
  const { storyTypes } = useIndustry();
  const storyTypeIndex = storyTypes.findIndex(t => t.id === story.story_type);
  const storyTypeDef = storyTypes.find(t => t.id === story.story_type);
  const TypeIcon = resolveIcon(storyTypeDef?.icon);
  const typeLabel = storyTypeDef?.label || story.story_type;
  const typeColor = typeColors[storyTypeIndex >= 0 ? storyTypeIndex % Object.keys(typeColors).length : 5];

  return (
    <Card 
      className={`relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${onClick ? 'hover:border-primary/50' : ''}`}
      onClick={() => onClick?.(story)}
    >
      {/* Type indicator bar */}
      <div className={`absolute top-0 left-0 w-1 h-full ${typeColor}`} />
      
      <CardContent className="p-4 pl-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <TypeIcon className="w-3 h-3" />
              {typeLabel}
            </Badge>
            {story.is_featured && (
              <Badge className="bg-amber-100 text-amber-700 text-xs">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Featured
              </Badge>
            )}
          </div>
          
          {isAdmin && (
            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onToggleFeatured?.(story.id, !story.is_featured)}
              >
                {story.is_featured ? (
                  <StarOff className="w-4 h-4 text-amber-500" />
                ) : (
                  <Star className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onEdit?.(story)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete?.(story.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
          {story.title}
        </h3>

        {/* Subject info */}
        {(story.subject_name || story.subject_role) && (
          <p className="text-sm text-muted-foreground mb-2">
            {story.subject_name}{story.subject_role && ` • ${story.subject_role}`}
          </p>
        )}

        {/* Pull quote */}
        {story.pull_quote && (
          <div className="bg-muted/50 rounded-lg p-3 mb-3">
            <div className="flex gap-2">
              <Quote className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm italic text-muted-foreground line-clamp-2">
                "{story.pull_quote}"
              </p>
            </div>
          </div>
        )}

        {/* Narrative preview */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {story.narrative}
        </p>

        {/* Themes */}
        {story.themes && story.themes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {story.themes.slice(0, 3).map((theme, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {theme}
              </Badge>
            ))}
            {story.themes.length > 3 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{story.themes.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
