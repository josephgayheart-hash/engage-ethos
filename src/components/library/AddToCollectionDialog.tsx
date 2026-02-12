import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Folder, Plus, Check } from 'lucide-react';
import type { LibraryCollection, CollectionType } from '@/types/library';

interface AddToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: LibraryCollection[];
  onAddToExisting: (collectionId: string) => Promise<void>;
  onCreateAndAdd: (input: { name: string; description?: string; collectionType: CollectionType }) => Promise<void>;
}

export function AddToCollectionDialog({
  open,
  onOpenChange,
  collections,
  onAddToExisting,
  onCreateAndAdd,
}: AddToCollectionDialogProps) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedId, setSelectedId] = useState<string>('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<CollectionType>('campaign');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCollections = collections.filter(c => c.status === 'active');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (mode === 'existing' && selectedId) {
        await onAddToExisting(selectedId);
      } else if (mode === 'new' && newName) {
        await onCreateAndAdd({ name: newName, description: newDescription || undefined, collectionType: newType });
      }
      onOpenChange(false);
      setSelectedId('');
      setNewName('');
      setNewDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = mode === 'existing' ? !!selectedId : !!newName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Add to Collection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {activeCollections.length > 0 && (
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'existing' | 'new')}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="existing" id="existing" />
                  <Label htmlFor="existing" className="text-sm cursor-pointer">Existing collection</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="new" id="new" />
                  <Label htmlFor="new" className="text-sm cursor-pointer">Create new</Label>
                </div>
              </div>
            </RadioGroup>
          )}

          {mode === 'existing' && activeCollections.length > 0 ? (
            <ScrollArea className="max-h-60">
              <div className="space-y-2">
                {activeCollections.map(c => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedId === c.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.itemCount || 0} items</p>
                      </div>
                      {selectedId === c.id && <Check className="w-4 h-4 text-primary" />}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Collection Name *</Label>
                <Input
                  placeholder="e.g., Fall 2026 Enrollment Campaign"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Type</Label>
                <Select value={newType} onValueChange={(v) => setNewType(v as CollectionType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="campaign">Campaign</SelectItem>
                    <SelectItem value="initiative">Initiative</SelectItem>
                    <SelectItem value="program">Program</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description (optional)</Label>
                <Textarea
                  placeholder="What this collection is for..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            {mode === 'new' ? (
              <>
                <Plus className="w-4 h-4 mr-1" />
                Create & Add
              </>
            ) : (
              'Add to Collection'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
