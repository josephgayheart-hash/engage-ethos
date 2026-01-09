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
  CheckCircle2
} from 'lucide-react';
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
    parseFactBookFromText,
    toggleHighlight,
    getCategories,
    getFactsByCategory,
  } = useFactBook({ profileId });

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingFact, setEditingFact] = useState<Fact | null>(null);

  // Add form state
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

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
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

        {/* Facts Grid */}
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
        ) : (
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
        )}

        {/* Add Fact Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Fact</DialogTitle>
              <DialogDescription>
                Add a statistic or data point to your Fact Book
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddFact} 
                disabled={isSaving || !newFact.label || !newFact.value}
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Fact
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Import Fact Book
              </DialogTitle>
              <DialogDescription>
                Upload a PDF or paste text to extract facts automatically
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {parsedFacts.length === 0 ? (
                <>
                  {/* File Upload */}
                  <div 
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept={getAcceptString()}
                      onChange={handleFileSelect}
                    />
                    {isExtractingFile ? (
                      <>
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">Extracting text...</p>
                      </>
                    ) : (
                      <>
                        <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="font-medium">Click to upload a PDF</p>
                        <p className="text-sm text-muted-foreground">or drag and drop</p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-sm text-muted-foreground">or paste text</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="space-y-2">
                    <Label>Source Document Name</Label>
                    <Input
                      value={sourceDocument}
                      onChange={e => setSourceDocument(e.target.value)}
                      placeholder="e.g., Fast Facts 2024"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Fact Book Text</Label>
                    <Textarea
                      value={importText}
                      onChange={e => setImportText(e.target.value)}
                      placeholder="Paste fact book content here..."
                      rows={10}
                    />
                  </div>

                  <Button 
                    onClick={handleParseFactBook} 
                    disabled={isParsing || !importText.trim()}
                    className="w-full"
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Extracting facts...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Extract Facts
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-green-800">
                        {parsedFacts.length} Facts Extracted
                      </h4>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={selectAllFacts}>
                          Select All
                        </Button>
                        <Button size="sm" variant="ghost" onClick={deselectAllFacts}>
                          Deselect All
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-green-700">
                      {selectedParsedFacts.size} selected for import
                    </p>
                  </div>

                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 pr-4">
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
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${
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
