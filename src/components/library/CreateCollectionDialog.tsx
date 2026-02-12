import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import type { CollectionType } from '@/types/library';

interface CreateCollectionDialogProps {
  onSubmit: (data: {
    name: string;
    description?: string;
    collectionType: CollectionType;
    tags?: string[];
  }) => Promise<any>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const typeOptions: { value: CollectionType; label: string; description: string }[] = [
  { value: 'campaign', label: 'Campaign', description: 'A marketing or enrollment campaign' },
  { value: 'initiative', label: 'Initiative', description: 'A strategic initiative or project' },
  { value: 'program', label: 'Program', description: 'An academic program or department effort' },
  { value: 'custom', label: 'Collection', description: 'A general-purpose grouping' },
];

export function CreateCollectionDialog({ onSubmit, trigger, open: controlledOpen, onOpenChange }: CreateCollectionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [collectionType, setCollectionType] = useState<CollectionType>('campaign');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange || (() => {})) : setInternalOpen;

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    const result = await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      collectionType,
    });
    setIsSubmitting(false);
    if (result) {
      setName('');
      setDescription('');
      setCollectionType('campaign');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">New Collection</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input
              placeholder="e.g., Fall 2026 Enrollment Campaign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={collectionType} onValueChange={(v) => setCollectionType(v as CollectionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div>
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{opt.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <Textarea
              placeholder="Brief summary of this campaign or initiative..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || isSubmitting}>
            <Plus className="w-4 h-4 mr-1" />
            {isSubmitting ? 'Creating...' : 'Create Collection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
