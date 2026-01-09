import { useState, useRef } from 'react';
import { useFactBook, Fact, FactCategory, FACT_CATEGORIES, CreateFactInput } from '@/hooks/useFactBook';
import { useAuth } from '@/contexts/AuthContext';
import { FactCard } from './FactCard';
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
  BarChart3,
  Upload,
  FileText,
  Star,
  TrendingUp,
  Users,
  Award,
  DollarSign,
  GraduationCap,
  Building2,
  BookOpen,
  FlaskConical,
  Heart,
  Trophy,
  Clock,
  Wallet,
  MoreHorizontal,
  CheckCircle2,
  LayoutGrid,
  List,
  FileSearch,
  Sparkles,
  Database,
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
import { extractTextFromFile, getAcceptString } from '@/lib/documentParser';

interface FactBookTabProps {
  profileId?: string | null;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  enrollment: Users,
  research: FlaskConical,
  rankings: Award,
  affordability: DollarSign,
  outcomes: TrendingUp,
  diversity: Heart,
  athletics: Trophy,
  history: Clock,
  facilities: Building2,
  financials: Wallet,
  faculty: GraduationCap,
  academics: BookOpen,
  other: MoreHorizontal,
};

export function FactBookTab({ profileId }: FactBookTabProps) {
  const { isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    facts,
    isLoading,
    isParsing,
    isSaving,
    addFact,
    addFactsBulk,
    updateFact,
    deleteFact,
    deleteAllFacts,
    parseFactBookFromText,
    toggleHighlight,
    getCategories,
    getFactsByCategory,
  } = useFactBook({ profileId });

  const [isDeleting, setIsDeleting] = useState(false);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingFact, setEditingFact] = useState<Fact | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Add form state
  const [addMode, setAddMode] = useState<'manual' | 'generate'>('manual');
  const [generateText, setGenerateText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newFact, setNewFact] = useState<CreateFactInput>({
    category: 'enrollment',
    label: '',
    value: '',
    context: '',
    year: '',
    display_format: 'number',
    is_highlight: false,
  });

  // Import state
  const [importText, setImportText] = useState('');
  const [sourceDocument, setSourceDocument] = useState('');
  const [parsedFacts, setParsedFacts] = useState<CreateFactInput[]>([]);
  const [selectedParsedFacts, setSelectedParsedFacts] = useState<Set<number>>(new Set());
  const [isExtractingFile, setIsExtractingFile] = useState(false);

  const categories = getCategories();
  const highlightedCount = facts.filter(f => f.is_highlight).length;

  const displayFacts = selectedCategory === 'all' 
    ? facts 
    : getFactsByCategory(selectedCategory);

  const handleAddFact = async () => {
    if (!newFact.label || !newFact.value) return;
    
    await addFact(newFact);
    setShowAddDialog(false);
    setAddMode('manual');
    setGenerateText('');
    setNewFact({
      category: 'enrollment',
      label: '',
      value: '',
      context: '',
      year: '',
      display_format: 'number',
      is_highlight: false,
    });
  };

  const handleGenerateFromText = async () => {
    if (!generateText.trim()) return;
    
    setIsGenerating(true);
    try {
      const parsed = await parseFactBookFromText(generateText);
      if (parsed.length > 0) {
        // Take the first parsed fact and populate the form
        const firstFact = parsed[0];
        setNewFact({
          category: firstFact.category || 'other',
          label: firstFact.label || '',
          value: firstFact.value || '',
          context: firstFact.context || '',
          year: firstFact.year || '',
          display_format: firstFact.display_format || 'number',
          is_highlight: firstFact.is_highlight || false,
          source_document: firstFact.source_document || '',
        });
        setAddMode('manual');
        setGenerateText('');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleParseFactBook = async () => {
    if (!importText.trim()) return;
    
    const parsed = await parseFactBookFromText(importText, sourceDocument);
    if (parsed.length > 0) {
      setParsedFacts(parsed);
      setSelectedParsedFacts(new Set(parsed.map((_, i) => i)));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingFile(true);
    try {
      const { text, success, message } = await extractTextFromFile(file);
      if (success && text) {
        setImportText(text);
        setSourceDocument(file.name.replace(/\.[^/.]+$/, ''));
      } else {
        console.error('Could not extract text:', message);
      }
    } catch (error) {
      console.error('Extract error:', error);
    } finally {
      setIsExtractingFile(false);
    }
  };

  const handleImportSelected = async () => {
    const factsToImport = parsedFacts.filter((_, i) => selectedParsedFacts.has(i));
    if (factsToImport.length === 0) return;
    
    await addFactsBulk(factsToImport.map(f => ({ ...f, source_document: sourceDocument })));
    setShowImportDialog(false);
    setImportText('');
    setSourceDocument('');
    setParsedFacts([]);
    setSelectedParsedFacts(new Set());
  };

  const toggleFactSelection = (index: number) => {
    setSelectedParsedFacts(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const selectAllFacts = () => {
    setSelectedParsedFacts(new Set(parsedFacts.map((_, i) => i)));
  };

  const deselectAllFacts = () => {
    setSelectedParsedFacts(new Set());
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading facts...</p>
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
              <BarChart3 className="w-5 h-5" />
              Fact Book
            </CardTitle>
            <CardDescription>
              Institutional statistics and data points for use in messaging and Case for Support
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {facts.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete all facts?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {facts.length} facts from your Fact Book. 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={async () => {
                        setIsDeleting(true);
                        await deleteAllFacts();
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
              Import from PDF
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Fact
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Row */}
        <div className="flex items-center gap-6 mb-6 p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="text-2xl font-bold">{facts.length}</p>
            <p className="text-sm text-muted-foreground">Total Facts</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{highlightedCount}</p>
            <p className="text-sm text-muted-foreground">Key Stats</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{categories.length}</p>
            <p className="text-sm text-muted-foreground">Categories</p>
          </div>
        </div>

        {/* Category Tabs + View Toggle */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="all" className="text-xs">
                All ({facts.length})
              </TabsTrigger>
              {FACT_CATEGORIES.filter(cat => 
                facts.some(f => f.category === cat.value)
              ).map(cat => {
                const Icon = categoryIcons[cat.value] || MoreHorizontal;
                const count = getFactsByCategory(cat.value).length;
                return (
                  <TabsTrigger key={cat.value} value={cat.value} className="text-xs gap-1">
                    <Icon className="w-3 h-3" />
                    {cat.label} ({count})
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
          
          {/* View Toggle */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Facts Display */}
        {displayFacts.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-lg mb-2">No facts yet</h3>
            <p className="text-muted-foreground mb-4">
              Import your institution's fact book or add statistics manually
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import PDF
              </Button>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Fact
              </Button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayFacts.map(fact => (
              <FactCard
                key={fact.id}
                fact={fact}
                isAdmin={isAdmin}
                onEdit={setEditingFact}
                onDelete={deleteFact}
                onToggleHighlight={toggleHighlight}
              />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="border rounded-lg divide-y">
            {displayFacts.map(fact => {
              const Icon = categoryIcons[fact.category] || MoreHorizontal;
              return (
                <div
                  key={fact.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{fact.label}</p>
                      {fact.is_highlight && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {fact.category}
                      </Badge>
                      {fact.year && <span>{fact.year}</span>}
                      {fact.context && <span className="truncate">• {fact.context}</span>}
                    </div>
                  </div>
                  <p className="text-xl font-bold shrink-0">{fact.value}</p>
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleHighlight(fact.id, !fact.is_highlight)}
                      >
                        <Star className={`w-4 h-4 ${fact.is_highlight ? 'text-amber-500 fill-amber-500' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditingFact(fact)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Fact Dialog */}
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) {
            setAddMode('manual');
            setGenerateText('');
          }
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Fact</DialogTitle>
              <DialogDescription>
                Add a statistic or data point to your Fact Book
              </DialogDescription>
            </DialogHeader>
            
            {/* Mode Toggle */}
            <Tabs value={addMode} onValueChange={(v: 'manual' | 'generate') => setAddMode(v)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Manual Entry
                </TabsTrigger>
                <TabsTrigger value="generate" className="gap-2">
                  <Wand2 className="w-4 h-4" />
                  Generate from Text
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="generate" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Paste text containing a fact</Label>
                  <Textarea
                    value={generateText}
                    onChange={e => setGenerateText(e.target.value)}
                    placeholder="e.g., 'Our university has 67,957 students enrolled for Fall 2024, representing a 3% increase from last year.'"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    AI will extract the fact details and populate the form for you to review
                  </p>
                </div>
                <Button 
                  onClick={handleGenerateFromText} 
                  disabled={isGenerating || !generateText.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extracting fact...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Extract & Fill Form
                    </>
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="manual" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={newFact.category}
                      onValueChange={v => setNewFact(prev => ({ ...prev, category: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FACT_CATEGORIES.map(cat => {
                          const Icon = categoryIcons[cat.value] || MoreHorizontal;
                          return (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {cat.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      value={newFact.year || ''}
                      onChange={e => setNewFact(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="e.g., 2024-25"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Label *</Label>
                  <Input
                    value={newFact.label}
                    onChange={e => setNewFact(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g., Total Enrollment"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Value *</Label>
                    <Input
                      value={newFact.value}
                      onChange={e => setNewFact(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="e.g., 67,957"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Display Format</Label>
                    <Select
                      value={newFact.display_format}
                      onValueChange={(v: Fact['display_format']) => setNewFact(prev => ({ ...prev, display_format: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="currency">Currency</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="ranking">Ranking</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Context (optional)</Label>
                  <Input
                    value={newFact.context || ''}
                    onChange={e => setNewFact(prev => ({ ...prev, context: e.target.value }))}
                    placeholder="Additional context..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Source Document</Label>
                  <Input
                    value={newFact.source_document || ''}
                    onChange={e => setNewFact(prev => ({ ...prev, source_document: e.target.value }))}
                    placeholder="e.g., Fast Facts 2024"
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              {addMode === 'manual' && (
                <Button 
                  onClick={handleAddFact} 
                  disabled={isSaving || !newFact.label || !newFact.value}
                >
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Fact
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Import Fact Book
              </DialogTitle>
              <DialogDescription>
                Upload a PDF or paste text to extract facts automatically
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {parsedFacts.length === 0 ? (
                <>
                  {/* Processing Status Indicator */}
                  {(isExtractingFile || isParsing) && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            {isExtractingFile ? 'Extracting Document Text...' : 'AI Processing Facts...'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {isExtractingFile 
                              ? 'Reading and parsing your document content' 
                              : 'Identifying and categorizing facts from your content'}
                          </p>
                        </div>
                      </div>
                      {/* Progress Steps */}
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                          isExtractingFile || isParsing ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          <FileSearch className="w-4 h-4" />
                          <span>Read Document</span>
                          {!isExtractingFile && importText && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                        </div>
                        <div className="h-px w-4 bg-border" />
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                          isParsing ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Sparkles className="w-4 h-4" />
                          <span>Extract Facts</span>
                        </div>
                        <div className="h-px w-4 bg-border" />
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-muted text-muted-foreground">
                          <Database className="w-4 h-4" />
                          <span>Save to Fact Book</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* File Upload */}
                  {!isExtractingFile && !isParsing && (
                    <>
                      <div 
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept={getAcceptString()}
                          onChange={handleFileSelect}
                        />
                        <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                        <p className="font-medium text-lg">Click to upload a PDF</p>
                        <p className="text-sm text-muted-foreground">or drag and drop your fact book document</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-sm text-muted-foreground">or paste text directly</span>
                        <div className="h-px flex-1 bg-border" />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Source Document Name</Label>
                          <Input
                            value={sourceDocument}
                            onChange={e => setSourceDocument(e.target.value)}
                            placeholder="e.g., Fast Facts 2024"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label>Fact Book Text</Label>
                          <Textarea
                            value={importText}
                            onChange={e => setImportText(e.target.value)}
                            placeholder="Paste fact book content here..."
                            rows={8}
                            className="resize-none"
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={handleParseFactBook} 
                        disabled={isParsing || !importText.trim()}
                        className="w-full"
                        size="lg"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Extract Facts with AI
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Step 1: Extraction Success Banner */}
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800 dark:text-green-200">
                          Extraction Complete!
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {parsedFacts.length} facts found in your document
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Add to Fact Book Section */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">
                          Add to Your Fact Book
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Select the facts you want to import
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={selectAllFacts}>
                          Select All
                        </Button>
                        <Button size="sm" variant="ghost" onClick={deselectAllFacts}>
                          Deselect All
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {selectedParsedFacts.size} of {parsedFacts.length} selected
                      </Badge>
                    </div>
                  </div>

                  {/* Fact List */}
                  <ScrollArea className="h-[350px] border rounded-lg">
                    <div className="space-y-2 p-3">
                      {parsedFacts.map((fact, idx) => {
                        const Icon = categoryIcons[fact.category] || MoreHorizontal;
                        const isSelected = selectedParsedFacts.has(idx);
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-muted-foreground/50'
                            }`}
                            onClick={() => toggleFactSelection(idx)}
                          >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/50'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <Badge variant="outline" className="shrink-0">
                              <Icon className="w-3 h-3 mr-1" />
                              {fact.category}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{fact.label}</p>
                              {fact.context && (
                                <p className="text-xs text-muted-foreground truncate">{fact.context}</p>
                              )}
                            </div>
                            <span className="font-bold text-lg shrink-0">{fact.value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowImportDialog(false);
                  setImportText('');
                  setSourceDocument('');
                  setParsedFacts([]);
                  setSelectedParsedFacts(new Set());
                }}
              >
                Cancel
              </Button>
              {parsedFacts.length > 0 && (
                <Button 
                  onClick={handleImportSelected} 
                  disabled={isSaving || selectedParsedFacts.size === 0}
                >
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Import {selectedParsedFacts.size} Facts
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Fact Dialog */}
        <Dialog open={!!editingFact} onOpenChange={(open) => !open && setEditingFact(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Fact</DialogTitle>
            </DialogHeader>
            {editingFact && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={editingFact.category}
                      onValueChange={v => setEditingFact(prev => prev ? { ...prev, category: v } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FACT_CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      value={editingFact.year || ''}
                      onChange={e => setEditingFact(prev => prev ? { ...prev, year: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input
                    value={editingFact.label}
                    onChange={e => setEditingFact(prev => prev ? { ...prev, label: e.target.value } : null)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      value={editingFact.value}
                      onChange={e => setEditingFact(prev => prev ? { ...prev, value: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Display Format</Label>
                    <Select
                      value={editingFact.display_format}
                      onValueChange={(v: Fact['display_format']) => setEditingFact(prev => prev ? { ...prev, display_format: v } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="currency">Currency</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="ranking">Ranking</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Context</Label>
                  <Input
                    value={editingFact.context || ''}
                    onChange={e => setEditingFact(prev => prev ? { ...prev, context: e.target.value } : null)}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingFact(null)}>
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  if (editingFact) {
                    await updateFact(editingFact.id, {
                      category: editingFact.category,
                      label: editingFact.label,
                      value: editingFact.value,
                      context: editingFact.context,
                      year: editingFact.year,
                      display_format: editingFact.display_format,
                    });
                    setEditingFact(null);
                  }
                }}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
