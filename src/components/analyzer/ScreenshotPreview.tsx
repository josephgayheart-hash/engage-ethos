import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Camera, 
  ExternalLink, 
  ZoomIn,
  Download,
  X
} from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ScreenshotPreviewProps {
  screenshot?: string; // Base64 encoded image
  sourceUrl?: string;
  isLoading?: boolean;
}

export function ScreenshotPreview({ screenshot, sourceUrl, isLoading }: ScreenshotPreviewProps) {
  const [showFullscreen, setShowFullscreen] = useState(false);

  const handleDownload = () => {
    if (!screenshot) return;
    
    const link = document.createElement('a');
    link.href = screenshot.startsWith('data:') ? screenshot : `data:image/png;base64,${screenshot}`;
    link.download = `screenshot-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Camera className="w-4 h-4 text-primary" />
            Page Screenshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full aspect-video rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!screenshot) {
    return null;
  }

  const imageSrc = screenshot.startsWith('data:') ? screenshot : `data:image/png;base64,${screenshot}`;

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Camera className="w-4 h-4 text-primary" />
              Page Screenshot
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0"
                onClick={() => setShowFullscreen(true)}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4" />
              </Button>
              {sourceUrl && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  onClick={() => window.open(sourceUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="relative rounded-lg overflow-hidden border cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
            onClick={() => setShowFullscreen(true)}
          >
            <img 
              src={imageSrc}
              alt="Page screenshot" 
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            <Badge className="absolute bottom-2 right-2 bg-black/50 text-white border-0">
              Click to enlarge
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Dialog */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Page Screenshot
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                {sourceUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(sourceUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Page
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>
          <div className="overflow-auto max-h-[calc(90vh-80px)]">
            <img 
              src={imageSrc}
              alt="Page screenshot full view" 
              className="w-full h-auto"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
