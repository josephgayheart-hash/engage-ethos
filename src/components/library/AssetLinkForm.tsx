import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import type { ExternalAsset, AssetPlatform } from '@/types/library';
import { detectPlatform, getPlatformLabel } from '@/lib/assetPlatform';

interface AssetLinkFormProps {
  onAdd: (asset: ExternalAsset) => void;
  onCancel?: () => void;
}

const platforms: AssetPlatform[] = ['canva', 'figma', 'google-drive', 'brandfolder', 'bynder', 'dropbox', 'other'];

export function AssetLinkForm({ onAdd, onCancel }: AssetLinkFormProps) {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [platform, setPlatform] = useState<AssetPlatform>('other');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [notes, setNotes] = useState('');

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value) {
      const detected = detectPlatform(value);
      setPlatform(detected);
    }
  };

  const handleSubmit = () => {
    if (!url || !label) return;
    onAdd({
      id: crypto.randomUUID(),
      label,
      url,
      type: platform,
      thumbnail_url: thumbnailUrl || undefined,
      notes: notes || undefined,
    });
    setUrl('');
    setLabel('');
    setPlatform('other');
    setThumbnailUrl('');
    setNotes('');
  };

  return (
    <div className="space-y-3 p-4 border border-border rounded-lg bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Asset URL *</Label>
          <Input
            placeholder="https://www.canva.com/design/..."
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Label *</Label>
          <Input
            placeholder="e.g., Enrollment Email Header"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Platform</Label>
          <Select value={platform} onValueChange={(v) => setPlatform(v as AssetPlatform)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {platforms.map(p => (
                <SelectItem key={p} value={p}>{getPlatformLabel(p)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Thumbnail URL (optional)</Label>
          <Input
            placeholder="https://... direct image link"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Notes (optional)</Label>
        <Textarea
          placeholder="e.g., Use the 16:9 version for email"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        )}
        <Button size="sm" onClick={handleSubmit} disabled={!url || !label}>
          <Plus className="w-4 h-4 mr-1" />
          Add Asset Link
        </Button>
      </div>
    </div>
  );
}
