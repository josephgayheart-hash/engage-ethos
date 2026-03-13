import { useState, useRef } from 'react';
import { usePIIScanner } from '@/hooks/usePIIScanner';
import { useDesignReferences } from '@/hooks/useDesignReferences';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Palette, Upload, Trash2, Loader2, ImagePlus, Info, Sparkles,
} from 'lucide-react';

interface DesignReferencesTabProps {
  profileId: string | null;
}

export function DesignReferencesTab({ profileId }: DesignReferencesTabProps) {
  const {
    references,
    isLoading,
    isUploading,
    uploadReference,
    deleteReference,
    maxReferences,
  } = useDesignReferences({ profileId });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    await uploadReference(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    );
    if (files.length > 0) {
      await uploadReference(files);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="w-5 h-5 text-secondary" />
                Design References
              </CardTitle>
              <CardDescription>
                Upload graphic design inspiration images to guide AI image generation style
              </CardDescription>
            </div>
            <Badge variant="outline">
              {references.length} / {maxReferences}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="bg-muted/50 border-muted">
            <Sparkles className="w-4 h-4" />
            <AlertDescription className="text-xs">
              Upload examples of design styles you love — posters, social graphics, brochure layouts, brand collateral.
              These references influence the Graphic Design mode in Image Studio, helping the AI match your preferred aesthetic.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Upload Zone */}
      {references.length < maxReferences && (
        <Card className="border-border">
          <CardContent className="p-6">
            <div
              className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/20 hover:border-primary/50 bg-muted/20'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <ImagePlus className="w-8 h-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Drop design inspiration images here</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, or WebP — up to 5MB each — select multiple files at once
                    </p>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* References Grid */}
      {references.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {references.map((ref) => (
            <Card key={ref.id} className="group relative overflow-hidden border-border">
              <AspectRatio ratio={4 / 3}>
                <img
                  src={ref.file_url}
                  alt={ref.name}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </AspectRatio>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{ref.name}</p>
                {ref.description && (
                  <p className="text-[10px] text-muted-foreground truncate">{ref.description}</p>
                )}
              </div>
              {/* Delete overlay */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => deleteReference(ref.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove reference</TooltipContent>
                </Tooltip>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-muted-foreground/20">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Palette className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No design references yet</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Upload examples of graphic design styles you want the AI to reference when creating
              promotional graphics in Image Studio's Graphic Design mode.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
