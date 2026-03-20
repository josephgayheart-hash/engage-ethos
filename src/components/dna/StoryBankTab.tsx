import { useState, useMemo } from 'react';
import { useStoryBank, Story, StoryType, CreateStoryInput } from '@/hooks/useStoryBank';
import { useAuth } from '@/contexts/AuthContext';
import { useIndustry } from '@/contexts/IndustryContext';
import { resolveIcon } from '@/lib/iconResolver';
import { StoryCard } from './StoryCard';
import { StoryDetailDialog } from './StoryDetailDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Wand2, 
  Loader2, 
  BookOpen,
  Star,
  Search,
  Link,
  FileText,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function StoryBankTab({ profileId }: StoryBankTabProps) {
  const { isAdmin } = useAuth();
  const { storyTypes: industryStoryTypes } = useIndustry();
  
  const storyTypes = useMemo(() => 
    industryStoryTypes.map(t => ({
      value: t.id,
      label: t.label,
      icon: resolveIcon(t.icon),
    })),
    [industryStoryTypes]
  );
  const {
    stories,
    isLoading,
    isParsing,
    isSaving,
    addStory,
    updateStory,
    deleteStory,
    deleteAllStories,
    parseStoryFromText,
    scrapeAndParseStory,
    toggleFeatured,
  } = useStoryBank({ profileId });

  const [isDeleting, setIsDeleting] = useState(false);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view');
  const [filterType, setFilterType] = useState<StoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add form state
  const [newStory, setNewStory] = useState<CreateStoryInput>({
    title: '',
    story_type: 'student',
    narrative: '',
    pull_quote: '',
    subject_name: '',
    subject_role: '',
    themes: [],
    is_featured: false,
  });
  const [newTheme, setNewTheme] = useState('');

  // Import state
  const [importText, setImportText] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [importMode, setImportMode] = useState<'text' | 'url'>('url');
  const [parsedStory, setParsedStory] = useState<CreateStoryInput | null>(null);
  const [isScraping, setIsScraping] = useState(false);

  const filteredStories = stories.filter(story => {
    const matchesType = filterType === 'all' || story.story_type === filterType;
    const matchesSearch = !searchQuery || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.narrative.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.subject_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const featuredCount = stories.filter(s => s.is_featured).length;

  const handleAddStory = async () => {
    if (!newStory.title || !newStory.narrative) return;
    
    await addStory(newStory);
    setShowAddDialog(false);
    setNewStory({
      title: '',
      story_type: 'student',
      narrative: '',
      pull_quote: '',
      subject_name: '',
      subject_role: '',
      themes: [],
      is_featured: false,
    });
  };

  const handleParseStory = async () => {
    if (!importText.trim()) return;
    
    const parsed = await parseStoryFromText(importText);
    if (parsed) {
      setParsedStory(parsed);
    }
  };

  const handleScrapeUrl = async () => {
    if (!importUrl.trim()) return;
    
    setIsScraping(true);
    try {
      const parsed = await scrapeAndParseStory(importUrl);
      if (parsed) {
        setParsedStory(parsed);
      }
    } finally {
      setIsScraping(false);
    }
  };

  const handleImportParsed = async () => {
    if (!parsedStory) return;
    
    await addStory(parsedStory);
    setShowImportDialog(false);
    setImportText('');
    setParsedStory(null);
  };

  const handleSaveStory = async (story: Story, updates: Partial<CreateStoryInput>) => {
    await updateStory(story.id, updates);
    setSelectedStory(null);
  };

  const addThemeToNew = () => {
    if (newTheme.trim() && !newStory.themes?.includes(newTheme.trim())) {
      setNewStory(prev => ({
        ...prev,
        themes: [...(prev.themes || []), newTheme.trim()]
      }));
      setNewTheme('');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading stories...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Story Bank
            </CardTitle>
            <CardDescription>
              Curated stories from students, alumni, donors, and faculty for use in Case for Support and messaging
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {stories.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete all stories?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {stories.length} stories from your Story Bank. 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={async () => {
                        setIsDeleting(true);
                        await deleteAllStories();
                        setIsDeleting(false);
                      }}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Delete All'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <Wand2 className="w-4 h-4 mr-2" />
              Import with AI
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Story
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Row */}
        <div className="flex items-center gap-6 mb-6 p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="text-2xl font-bold">{stories.length}</p>
            <p className="text-sm text-muted-foreground">Total Stories</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{featuredCount}</p>
            <p className="text-sm text-muted-foreground">Featured</p>
          </div>
          {storyTypes.map(type => {
            const count = stories.filter(s => s.story_type === type.value).length;
            if (count === 0) return null;
            return (
              <div key={type.value}>
                <p className="text-lg font-semibold">{count}</p>
                <p className="text-xs text-muted-foreground">{type.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search stories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={(v: StoryType | 'all') => setFilterType(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
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

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-lg mb-2">No stories yet</h3>
            <p className="text-muted-foreground mb-4">
              Add compelling stories from your community to enhance your messaging
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Story
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStories.map(story => (
              <StoryCard
                key={story.id}
                story={story}
                isAdmin={isAdmin}
                onClick={() => {
                  setSelectedStory(story);
                  setDialogMode('view');
                }}
                onEdit={() => {
                  setSelectedStory(story);
                  setDialogMode('edit');
                }}
                onDelete={deleteStory}
                onToggleFeatured={toggleFeatured}
              />
            ))}
          </div>
        )}

        {/* Add Story Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Story</DialogTitle>
              <DialogDescription>
                Create a new story entry for your Story Bank
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={newStory.title}
                    onChange={e => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Story title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Story Type *</Label>
                  <Select
                    value={newStory.story_type}
                    onValueChange={(v: StoryType) => setNewStory(prev => ({ ...prev, story_type: v }))}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject Name</Label>
                  <Input
                    value={newStory.subject_name || ''}
                    onChange={e => setNewStory(prev => ({ ...prev, subject_name: e.target.value }))}
                    placeholder="e.g., Jane Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject Role</Label>
                  <Input
                    value={newStory.subject_role || ''}
                    onChange={e => setNewStory(prev => ({ ...prev, subject_role: e.target.value }))}
                    placeholder="e.g., Class of 2024"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Story Narrative *</Label>
                <Textarea
                  value={newStory.narrative}
                  onChange={e => setNewStory(prev => ({ ...prev, narrative: e.target.value }))}
                  placeholder="Tell the story..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label>Pull Quote</Label>
                <Textarea
                  value={newStory.pull_quote || ''}
                  onChange={e => setNewStory(prev => ({ ...prev, pull_quote: e.target.value }))}
                  placeholder="A memorable quote..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Themes</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTheme}
                    onChange={e => setNewTheme(e.target.value)}
                    placeholder="Add theme..."
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addThemeToNew())}
                  />
                  <Button type="button" variant="outline" onClick={addThemeToNew}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {newStory.themes && newStory.themes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newStory.themes.map((theme, idx) => (
                      <Badge key={idx} variant="secondary">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddStory} 
                disabled={isSaving || !newStory.title || !newStory.narrative}
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Story
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Import Story with AI
              </DialogTitle>
              <DialogDescription>
                Scrape a news article URL or paste story text to import
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!parsedStory ? (
                <>
                  {/* Import Mode Tabs */}
                  <Tabs value={importMode} onValueChange={(v: 'text' | 'url') => setImportMode(v)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="url" className="gap-2">
                        <Link className="w-4 h-4" />
                        From URL
                      </TabsTrigger>
                      <TabsTrigger value="text" className="gap-2">
                        <FileText className="w-4 h-4" />
                        Paste Text
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="url" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>News Article or Story URL</Label>
                        <Input
                          value={importUrl}
                          onChange={e => setImportUrl(e.target.value)}
                          placeholder="https://news.university.edu/story/..."
                          type="url"
                        />
                        <p className="text-xs text-muted-foreground">
                          Paste a URL from a news article, alumni magazine, or any webpage with a story
                        </p>
                      </div>
                      <Button 
                        onClick={handleScrapeUrl} 
                        disabled={isParsing || isScraping || !importUrl.trim()}
                        className="w-full"
                      >
                        {(isParsing || isScraping) ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {isScraping ? 'Scraping page...' : 'Analyzing story...'}
                          </>
                        ) : (
                          <>
                            <Link className="w-4 h-4 mr-2" />
                            Scrape & Import
                          </>
                        )}
                      </Button>
                    </TabsContent>

                    <TabsContent value="text" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Story Text</Label>
                        <Textarea
                          value={importText}
                          onChange={e => setImportText(e.target.value)}
                          placeholder="Paste a story from a newsletter, article, or document..."
                          rows={10}
                        />
                      </div>
                      <Button 
                        onClick={handleParseStory} 
                        disabled={isParsing || !importText.trim()}
                        className="w-full"
                      >
                        {isParsing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing story...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Parse Story
                          </>
                        )}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                <>
                  {/* Success Banner */}
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800 dark:text-green-200">
                          Story Parsed Successfully
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Review the details below before adding
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Parsed Story Preview */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Title:</span>
                        <p className="font-medium">{parsedStory.title}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-medium capitalize">{parsedStory.story_type}</p>
                      </div>
                      {parsedStory.subject_name && (
                        <div>
                          <span className="text-muted-foreground">Subject:</span>
                          <p className="font-medium">{parsedStory.subject_name}</p>
                        </div>
                      )}
                      {parsedStory.source_url && (
                        <div>
                          <span className="text-muted-foreground">Source:</span>
                          <p className="font-medium truncate text-xs">{parsedStory.source_url}</p>
                        </div>
                      )}
                    </div>
                    {parsedStory.pull_quote && (
                      <div className="border-l-2 border-primary/50 pl-3 italic text-sm">
                        "{parsedStory.pull_quote}"
                      </div>
                    )}
                    {parsedStory.themes && parsedStory.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {parsedStory.themes.map((theme, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Narrative Preview</Label>
                    <ScrollArea className="h-32 border rounded-lg">
                      <div className="p-3 text-sm">
                        {parsedStory.narrative}
                      </div>
                    </ScrollArea>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowImportDialog(false);
                  setImportText('');
                  setImportUrl('');
                  setParsedStory(null);
                }}
              >
                Cancel
              </Button>
              {parsedStory && (
                <Button onClick={handleImportParsed} disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add to Story Bank
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Story Detail Dialog */}
        <StoryDetailDialog
          story={selectedStory}
          open={!!selectedStory}
          onOpenChange={(open) => !open && setSelectedStory(null)}
          onSave={handleSaveStory}
          isSaving={isSaving}
          mode={dialogMode}
        />
      </CardContent>
    </Card>
  );
}
