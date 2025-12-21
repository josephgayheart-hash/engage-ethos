import { useState } from 'react';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { OGImagePreview } from '@/components/OGImagePreview';
import { Download, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OGPreviewPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async () => {
    const element = document.getElementById('og-image-container');
    if (!element) {
      toast.error('Could not find OG image container');
      return;
    }

    setIsExporting(true);
    try {
      const dataUrl = await toPng(element, {
        width: 1200,
        height: 630,
        pixelRatio: 1,
        quality: 1,
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'campusvoice-og-image.png';
      link.href = dataUrl;
      link.click();
      
      setExported(true);
      toast.success('OG image exported successfully!');
      
      // Reset exported state after 3 seconds
      setTimeout(() => setExported(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export OG image');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            OG Image Preview
          </h1>
          <p className="text-muted-foreground">
            This is the share link preview image for CampusVoice.AI (1200×630px).
            Export it and replace <code className="bg-muted px-2 py-1 rounded text-sm">public/og-image.png</code>.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-border rounded-lg overflow-hidden shadow-xl">
            <OGImagePreview />
          </div>

          <div className="flex gap-4 items-center">
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              size="lg"
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Exporting...
                </>
              ) : exported ? (
                <>
                  <Check className="h-5 w-5" />
                  Exported!
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Export as PNG
                </>
              )}
            </Button>
            
            <p className="text-sm text-muted-foreground">
              After exporting, upload the file to replace <code className="bg-muted px-1.5 py-0.5 rounded">public/og-image.png</code>
            </p>
          </div>
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-3">How to update:</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Click "Export as PNG" to download the image</li>
            <li>Go to the Lovable chat and upload the downloaded image</li>
            <li>Ask to replace <code className="bg-muted px-1.5 py-0.5 rounded text-sm">public/og-image.png</code> with the uploaded file</li>
            <li>The new OG image will be used for all share link previews</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
