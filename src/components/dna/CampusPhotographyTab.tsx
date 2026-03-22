import { useState, useRef } from 'react';
import { usePIIScanner } from '@/hooks/usePIIScanner';
import { useCampusPhotography, PhotoAIAnalysis } from '@/hooks/useCampusPhotography';
import { useIndustry } from '@/contexts/IndustryContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Camera, Upload, Trash2, Loader2, ImagePlus, Info, Eye, EyeOff, Sparkles, Sun, TreePine, Users, Palette, Zap
} from 'lucide-react';

interface CampusPhotographyTabProps {
  profileId: string | null;
}

function AnalysisBadges({ analysis }: { analysis: PhotoAIAnalysis }) {
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {analysis.mood && (
        <Badge variant="secondary" className="text-[9px] px-1 py-0 gap-0.5">
          <Sun className="w-2.5 h-2.5" />{analysis.mood}
        </Badge>
      )}
      {analysis.season && analysis.season !== 'unknown' && (
        <Badge variant="secondary" className="text-[9px] px-1 py-0 gap-0.5">
          <TreePine className="w-2.5 h-2.5" />{analysis.season}
        </Badge>
      )}
      {analysis.people_present && (
        <Badge variant="secondary" className="text-[9px] px-1 py-0 gap-0.5">
          <Users className="w-2.5 h-2.5" />people
        </Badge>
      )}
      {analysis.quality_score && (
        <Badge variant={analysis.quality_score >= 4 ? 'default' : 'outline'} className="text-[9px] px-1 py-0">
          {analysis.quality_score}/5
        </Badge>
      )}
    </div>
  );
}

function AnalysisDetail({ analysis }: { analysis: PhotoAIAnalysis }) {
  return (
    <div className="space-y-2 text-[11px]">
      {analysis.best_for && analysis.best_for.length > 0 && (
        <div>
          <p className="font-medium text-foreground flex items-center gap-1 mb-0.5">
            <Zap className="w-3 h-3 text-amber-500" /> Best for image generation:
          </p>
          <div className="flex flex-wrap gap-1">
            {analysis.best_for.map((use, i) => (
              <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">{use}</Badge>
            ))}
          </div>
        </div>
      )}
      {analysis.primary_subjects && analysis.primary_subjects.length > 0 && (
        <div>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Subjects:</span> {analysis.primary_subjects.join(', ')}
          </p>
        </div>
      )}
      {analysis.dominant_colors && analysis.dominant_colors.length > 0 && (
        <div className="flex items-center gap-1.5">
          <Palette className="w-3 h-3 text-muted-foreground" />
          {analysis.dominant_colors.map((color, i) => (
            <Tooltip key={i}>
              <TooltipTrigger>
                <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: color }} />
              </TooltipTrigger>
              <TooltipContent>{color}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}
      {analysis.quality_notes && (
        <p className="text-muted-foreground italic">{analysis.quality_notes}</p>
      )}
    </div>
  );
}

export function CampusPhotographyTab({ profileId }: CampusPhotographyTabProps) {
  const {
    photos,
    isLoading,
    isUploading,
    isAnalyzing,
    uploadPhotos,
    deletePhoto,
    toggleActive,
    analyzePhotos,
    maxPhotos,
    categories,
  } = useCampusPhotography({ profileId });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [expandedPhotoId, setExpandedPhotoId] = useState<string | null>(null);

  const activeCount = photos.filter(p => p.is_active).length;
  const analyzedCount = photos.filter(p => p.ai_analysis).length;
  const unanalyzedIds = photos.filter(p => !p.ai_analysis).map(p => p.id);

  const { checkFiles } = usePIIScanner();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    if (await checkFiles(fileArray)) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    await uploadPhotos(fileArray, 'uncategorized', description || undefined);
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
          <strong className="block mt-1">Photos are automatically analyzed by AI to extract visual metadata (colors, mood, subjects) that improves image generation accuracy.</strong>
        </AlertDescription>
      </Alert>

      {/* AI Analysis Impact Card */}
      {photos.length > 0 && (
        <Card className="border-secondary/30 bg-secondary/5">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Sparkles className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Image Generation Impact</p>
                  <p className="text-xs text-muted-foreground">
                    {analyzedCount}/{photos.length} photos analyzed · {activeCount} active references
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unanalyzedIds.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => analyzePhotos(unanalyzedIds)}
                    disabled={isAnalyzing}
                    className="gap-1.5"
                  >
                    {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Analyze {unanalyzedIds.length} remaining
                  </Button>
                )}
              </div>
            </div>
            {analyzedCount > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {(() => {
                  const moods = photos.filter(p => p.ai_analysis?.mood).map(p => p.ai_analysis!.mood!);
                  const scenes = photos.filter(p => p.ai_analysis?.scene_type).map(p => p.ai_analysis!.scene_type!);
                  const avgQuality = photos.filter(p => p.ai_analysis?.quality_score)
                    .reduce((sum, p) => sum + (p.ai_analysis!.quality_score || 0), 0) / (photos.filter(p => p.ai_analysis?.quality_score).length || 1);
                  const allBestFor = photos.flatMap(p => p.ai_analysis?.best_for || []);
                  const topUse = allBestFor.length > 0 
                    ? Object.entries(allBestFor.reduce((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {} as Record<string, number>))
                        .sort((a, b) => b[1] - a[1])[0]?.[0]
                    : null;
                  
                  return (
                    <>
                      <div className="p-2 rounded-lg bg-background">
                        <p className="text-lg font-bold">{new Set(moods).size}</p>
                        <p className="text-[10px] text-muted-foreground">Mood Variety</p>
                      </div>
                      <div className="p-2 rounded-lg bg-background">
                        <p className="text-lg font-bold">{new Set(scenes).size}</p>
                        <p className="text-[10px] text-muted-foreground">Scene Types</p>
                      </div>
                      <div className="p-2 rounded-lg bg-background">
                        <p className="text-lg font-bold">{avgQuality.toFixed(1)}</p>
                        <p className="text-[10px] text-muted-foreground">Avg Quality</p>
                      </div>
                      <div className="p-2 rounded-lg bg-background">
                        <p className="text-xs font-bold truncate">{topUse || '—'}</p>
                        <p className="text-[10px] text-muted-foreground">Top Use Case</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload zone */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ImagePlus className="w-4 h-4" />
            Add Campus Photos
          </CardTitle>
          <CardDescription>
            {photos.length}/{maxPhotos} photos uploaded · Select multiple files at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Description (optional)</Label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Main quad at sunset"
              className="h-9 text-sm"
            />
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
                <p className="text-sm font-medium">Drop photos here or click to browse</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP · Max 5MB each · Select multiple files</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
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
            <Card 
              key={photo.id} 
              className={`overflow-hidden group cursor-pointer transition-all ${!photo.is_active ? 'opacity-50' : ''} ${expandedPhotoId === photo.id ? 'col-span-2 row-span-2' : ''}`}
              onClick={() => setExpandedPhotoId(expandedPhotoId === photo.id ? null : photo.id)}
            >
              <AspectRatio ratio={expandedPhotoId === photo.id ? 16 / 9 : 4 / 3}>
                <img
                  src={photo.file_url}
                  alt={photo.description || photo.file_name}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
                {isAnalyzing && !photo.ai_analysis && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-secondary" />
                  </div>
                )}
                {photo.ai_analysis && (
                  <div className="absolute top-1 right-1">
                    <Badge variant="default" className="bg-secondary/90 text-[9px] px-1 py-0 gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> AI
                    </Badge>
                  </div>
                )}
              </AspectRatio>
              <div className="p-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {categoryLabel(photo.photo_category)}
                  </Badge>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
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
                {photo.ai_analysis && <AnalysisBadges analysis={photo.ai_analysis} />}
                {expandedPhotoId === photo.id && photo.ai_analysis && (
                  <div className="pt-2 border-t mt-2">
                    <AnalysisDetail analysis={photo.ai_analysis} />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
