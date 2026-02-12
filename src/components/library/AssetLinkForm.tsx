import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import type { ExternalAsset, AssetPlatform } from '@/types/library';
import { detectPlatform, getPlatformLabel } from '@/lib/assetPlatform';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AssetLinkFormProps {
  onAdd: (asset: ExternalAsset) => void;
  onCancel?: () => void;
}

const platforms: AssetPlatform[] = ['canva', 'figma', 'google-drive', 'brandfolder', 'bynder', 'dropbox', 'other'];

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.svg,.webp';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

function getFileAssetPlatform(mimeType: string): AssetPlatform {
  return 'other';
}

function isImageMime(mime: string): boolean {
  return mime.startsWith('image/');
}

export function AssetLinkForm({ onAdd, onCancel }: AssetLinkFormProps) {
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'link' | 'upload'>('link');

  // Link fields
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [platform, setPlatform] = useState<AssetPlatform>('other');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Upload fields
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLabel, setUploadLabel] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value) {
      const detected = detectPlatform(value);
      setPlatform(detected);
    }
  };

  const handleLinkSubmit = () => {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert('File must be under 20 MB.');
      return;
    }
    setSelectedFile(file);
    if (!uploadLabel) {
      setUploadLabel(file.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !uploadLabel || !profile) return;
    setIsUploading(true);

    try {
      const fileId = crypto.randomUUID();
      const ext = selectedFile.name.split('.').pop() || '';
      const storagePath = `${profile.tenant_id}/${fileId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('collection-assets')
        .upload(storagePath, selectedFile);

      if (uploadError) {
        console.error('Upload failed:', uploadError);
        setIsUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('collection-assets')
        .getPublicUrl(storagePath);

      const publicUrl = urlData.publicUrl;
      const thumbnailForImages = isImageMime(selectedFile.type) ? publicUrl : undefined;

      onAdd({
        id: fileId,
        label: uploadLabel,
        url: publicUrl,
        type: getFileAssetPlatform(selectedFile.type),
        thumbnail_url: thumbnailForImages,
        notes: uploadNotes || undefined,
        is_upload: true,
        file_type: selectedFile.type,
        file_size: selectedFile.size,
      });

      setSelectedFile(null);
      setUploadLabel('');
      setUploadNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3 p-4 border border-border rounded-lg bg-card">
      <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
        <TabsList className="w-full">
          <TabsTrigger value="link" className="flex-1 flex items-center gap-1">
            <LinkIcon className="w-3.5 h-3.5" />
            Paste Link
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex-1 flex items-center gap-1">
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </TabsTrigger>
        </TabsList>

        <TabsContent value="link" className="mt-3 space-y-3">
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
            <Button size="sm" onClick={handleLinkSubmit} disabled={!url || !label}>
              <Plus className="w-4 h-4 mr-1" />
              Add Asset Link
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-3 space-y-3">
          <div
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleFileSelect}
              className="hidden"
            />
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(0)} KB · {selectedFile.type || 'Unknown type'}
                </p>
                <Button variant="ghost" size="sm" className="text-xs" onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}>
                  Change file
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload PDF, Word, PowerPoint, Excel, or images
                </p>
                <p className="text-xs text-muted-foreground">Max 20 MB</p>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Label *</Label>
            <Input
              placeholder="e.g., Campaign Brand Guide"
              value={uploadLabel}
              onChange={(e) => setUploadLabel(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Notes (optional)</Label>
            <Textarea
              placeholder="e.g., Latest approved version, March 2026"
              value={uploadNotes}
              onChange={(e) => setUploadNotes(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
            )}
            <Button size="sm" onClick={handleUploadSubmit} disabled={!selectedFile || !uploadLabel || isUploading}>
              {isUploading ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Uploading...</>
              ) : (
                <><Upload className="w-4 h-4 mr-1" />Upload & Add</>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
