import { useState, useEffect, useMemo } from 'react';
import { Story, StoryType, CreateStoryInput } from '@/hooks/useStoryBank';
import { useIndustry } from '@/contexts/IndustryContext';
import { resolveIcon } from '@/lib/iconResolver';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Quote, 
  Star, 
  Loader2,
  User,
  X,
  Plus
} from 'lucide-react';

interface StoryDetailDialogProps {
  story: Story | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (story: Story, updates: Partial<CreateStoryInput>) => void;
  isSaving?: boolean;
  mode?: 'view' | 'edit';
}

export function StoryDetailDialog({
  story,
  open,
  onOpenChange,
  onSave,
  isSaving = false,
  mode = 'view'
}: StoryDetailDialogProps) {
  const { storyTypes: industryStoryTypes } = useIndustry();
  const storyTypes = useMemo(() => 
    industryStoryTypes.map(t => ({
      value: t.id,
      label: t.label,
      icon: resolveIcon(t.icon),
    })),
    [industryStoryTypes]
  );
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [formData, setFormData] = useState<Partial<CreateStoryInput>>({});
  const [newTheme, setNewTheme] = useState('');

  useEffect(() => {
    if (story) {
      setFormData({
        title: story.title,
        story_type: story.story_type,
        narrative: story.narrative,
        pull_quote: story.pull_quote || '',
        subject_name: story.subject_name || '',
        subject_role: story.subject_role || '',
        themes: story.themes || [],
        programs: story.programs || [],
        is_featured: story.is_featured,
        source_url: story.source_url || '',
        source_description: story.source_description || '',
      });
    }
    setIsEditing(mode === 'edit');
  }, [story, mode]);

  const handleSave = () => {
    if (story && onSave) {
      onSave(story, formData);
    }
  };

  const addTheme = () => {
    if (newTheme.trim() && !formData.themes?.includes(newTheme.trim())) {
      setFormData(prev => ({
        ...prev,
        themes: [...(prev.themes || []), newTheme.trim()]
      }));
      setNewTheme('');
    }
  };

  const removeTheme = (theme: string) => {
    setFormData(prev => ({
      ...prev,
      themes: (prev.themes || []).filter(t => t !== theme)
    }));
  };

  if (!story) return null;

  const TypeIcon = storyTypes.find(t => t.value === story.story_type)?.icon || User;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TypeIcon className="w-5 h-5" />
            {isEditing ? 'Edit Story' : story.title}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Make changes to this story' : 'Story details and content'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isEditing ? (
            <>
              {/* Title */}
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title || ''}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Story title"
                />
              </div>

              {/* Story Type */}
              <div className="space-y-2">
                <Label>Story Type</Label>
                <Select
                  value={formData.story_type}
                  onValueChange={(value: StoryType) => setFormData(prev => ({ ...prev, story_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {storyTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject Name</Label>
                  <Input
                    value={formData.subject_name || ''}
                    onChange={e => setFormData(prev => ({ ...prev, subject_name: e.target.value }))}
                    placeholder="e.g., Jane Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject Role</Label>
                  <Input
                    value={formData.subject_role || ''}
                    onChange={e => setFormData(prev => ({ ...prev, subject_role: e.target.value }))}
                    placeholder="e.g., Class of 2024"
                  />
                </div>
              </div>

              {/* Narrative */}
              <div className="space-y-2">
                <Label>Story Narrative</Label>
                <Textarea
                  value={formData.narrative || ''}
                  onChange={e => setFormData(prev => ({ ...prev, narrative: e.target.value }))}
                  placeholder="The full story..."
                  rows={6}
                />
              </div>

              {/* Pull Quote */}
              <div className="space-y-2">
                <Label>Pull Quote (optional)</Label>
                <Textarea
                  value={formData.pull_quote || ''}
                  onChange={e => setFormData(prev => ({ ...prev, pull_quote: e.target.value }))}
                  placeholder="A memorable quote from the story..."
                  rows={2}
                />
              </div>

              {/* Themes */}
              <div className="space-y-2">
                <Label>Themes</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTheme}
                    onChange={e => setNewTheme(e.target.value)}
                    placeholder="Add a theme..."
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTheme())}
                  />
                  <Button type="button" variant="outline" onClick={addTheme}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.themes && formData.themes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.themes.map((theme, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        {theme}
                        <button onClick={() => removeTheme(theme)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center justify-between">
                <Label>Featured Story</Label>
                <Switch
                  checked={formData.is_featured || false}
                  onCheckedChange={checked => setFormData(prev => ({ ...prev, is_featured: checked }))}
                />
              </div>

              {/* Source Info */}
              <div className="space-y-2">
                <Label>Source Description (optional)</Label>
                <Input
                  value={formData.source_description || ''}
                  onChange={e => setFormData(prev => ({ ...prev, source_description: e.target.value }))}
                  placeholder="Where this story came from..."
                />
              </div>
            </>
          ) : (
            <>
              {/* View Mode */}
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {storyTypes.find(t => t.value === story.story_type)?.label}
                </Badge>
                {story.is_featured && (
                  <Badge className="bg-amber-100 text-amber-700">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
              </div>

              {/* Subject */}
              {(story.subject_name || story.subject_role) && (
                <div className="mb-4">
                  <p className="font-medium text-foreground">{story.subject_name}</p>
                  {story.subject_role && (
                    <p className="text-sm text-muted-foreground">{story.subject_role}</p>
                  )}
                </div>
              )}

              {/* Pull Quote */}
              {story.pull_quote && (
                <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg mb-4">
                  <div className="flex gap-2">
                    <Quote className="w-5 h-5 text-primary shrink-0" />
                    <p className="italic text-foreground">"{story.pull_quote}"</p>
                  </div>
                </div>
              )}

              {/* Narrative */}
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground whitespace-pre-wrap">{story.narrative}</p>
              </div>

              {/* Themes */}
              {story.themes && story.themes.length > 0 && (
                <div className="mt-4">
                  <Label className="text-muted-foreground mb-2 block">Themes</Label>
                  <div className="flex flex-wrap gap-1">
                    {story.themes.map((theme, idx) => (
                      <Badge key={idx} variant="outline">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Source */}
              {story.source_description && (
                <p className="text-xs text-muted-foreground mt-4">
                  Source: {story.source_description}
                </p>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                Edit Story
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
