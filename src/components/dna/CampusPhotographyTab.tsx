import { useState, useRef } from 'react';
import { useCampusPhotography } from '@/hooks/useCampusPhotography';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, Upload, Trash2, Loader2, ImagePlus, Info, Eye, EyeOff 
} from 'lucide-react';

interface CampusPhotographyTabProps {
  profileId: string | null;
}

export function CampusPhotographyTab({ profileId }: CampusPhotographyTabProps) {
  const {
    photos,
    isLoading,
    isUploading,
    uploadPhoto,
    deletePhoto,
    toggleActive,
    maxPhotos,
    categories,
  } = useCampusPhotography({ profileId });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('campus-life');
  const [description, setDescription] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const activeCount = photos.filter(p => p.is_active).length;

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    await uploadPhoto(file, selectedCategory, description || undefined);
    setDescription('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const categoryLabel = (value: string) =>
    categories.find(c => c.value === value)?.label || value;

  return (
    <div className="space-y-6">
      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Upload your best campus photography — building exteriors, quad shots, student life candids, iconic landmarks. 
          These teach the AI what your campus actually looks like, so generated images match your real aesthetic.
          <strong className="block mt-1">Even without photos, all generated imagery uses your institutional profile, brand colors, and identity details.</strong>
          Adding photos takes accuracy even further by grounding visuals in your actual campus environment.
        </AlertDescription>
      </Alert>

      {/* Upload zone */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ImagePlus className="w-4 h-4" />
            Add Campus Photos
          </CardTitle>
          <CardDescription>
            {photos.length}/{maxPhotos} photos uploaded · {activeCount} active for image generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Photo Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description (optional)</Label>
              <Input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Main quad at sunset"
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}
              ${photos.length >= maxPhotos ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium">Drop a photo here or click to browse</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP · Max 5MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={e => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Photo grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : photos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Camera className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              No campus photos uploaded yet. Add photos to improve AI-generated imagery.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map(photo => (
            <Card key={photo.id} className={`overflow-hidden group ${!photo.is_active ? 'opacity-50' : ''}`}>
              <AspectRatio ratio={4 / 3}>
                <img
                  src={photo.file_url}
                  alt={photo.description || photo.file_name}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </AspectRatio>
              <div className="p-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {categoryLabel(photo.photo_category)}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleActive(photo.id)}
                      title={photo.is_active ? 'Disable' : 'Enable'}
                    >
                      {photo.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => deletePhoto(photo.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {photo.description && (
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{photo.description}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
