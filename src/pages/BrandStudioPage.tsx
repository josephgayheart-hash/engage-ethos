import { useRef, useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { BrandOverlayEditor } from "@/components/image-generator/BrandOverlayEditor";
import { SaveToLibraryDialog } from "@/components/library/SaveToLibraryDialog";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { ArrowLeft, Download, Maximize2, FolderPlus } from "lucide-react";

interface BrandStudioState {
  imageUrl: string | null;
  brandColors: string[];
  logoUrl?: string;
  logoUrls?: string[];
  institutionName?: string;
  channel?: string;
  profileId?: string;
  sceneDescription?: string;
  audience?: string;
  tone?: string;
  goal?: string;
}

const BrandStudioPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as BrandStudioState | null) || {} as Partial<BrandStudioState>;
  const canvasRef = useRef<HTMLDivElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const { addMessage } = useMessageLibrary();

  const {
    imageUrl = null,
    brandColors = [],
    logoUrl,
    logoUrls,
    institutionName,
    channel,
    sceneDescription,
    audience,
    tone,
    goal,
    profileId,
  } = state;

  const handleDownload = useCallback(async () => {
    const canvas = document.getElementById("brand-overlay-canvas");
    if (!canvas) return;
    try {
      const dataUrl = await toPng(canvas as HTMLElement, { pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `branded-${channel || "image"}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Branded image downloaded!");
    } catch {
      toast.error("Download failed. Try again.");
    }
  }, [channel]);

  const handleSaveToLibrary = useCallback(async (name: string) => {
    const canvas = document.getElementById("brand-overlay-canvas");
    if (!canvas) {
      toast.error("Could not capture the image.");
      return undefined;
    }
    try {
      const dataUrl = await toPng(canvas as HTMLElement, { pixelRatio: 2 });
      const result = await addMessage({
        title: name,
        content: `![Branded Image](${dataUrl})`,
        channel: (channel as any) || "social-media",
        mode: "generated",
        source: "other",
        approved: false,
        institutionalProfileId: profileId,
        institutionalProfileName: institutionName,
      });
      return result?.id;
    } catch {
      toast.error("Failed to capture image for library.");
      return undefined;
    }
  }, [channel, profileId, institutionName, addMessage]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  if (brandColors.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-8">
        <Maximize2 className="w-12 h-12 text-muted-foreground/30" />
        <h2 className="text-lg font-semibold">Brand It Studio</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Open this page from Image Studio by clicking "Open Brand Studio" on the Brand It tab. 
          Your image, colors, and profile will transfer automatically.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate("/image-generator")}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Go to Image Studio
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4" />
            Back to Image Studio
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className="font-serif text-lg font-bold flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-primary" />
            Brand It Studio
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(true)}>
            <FolderPlus className="w-4 h-4 mr-1.5" />
            Save to Library
          </Button>
          <Button onClick={handleDownload} size="sm">
            <Download className="w-4 h-4 mr-1.5" />
            Download
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Canvas panel */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full flex items-center justify-center p-6 bg-muted/30 overflow-auto">
              <div className="w-full max-w-3xl">
                <BrandOverlayEditor
                  imageUrl={imageUrl}
                  brandColors={brandColors}
                  logoUrl={logoUrl}
                  logoUrls={logoUrls}
                  institutionName={institutionName}
                  channel={channel}
                  sceneDescription={sceneDescription}
                  audience={audience}
                  tone={tone}
                  goal={goal}
                  hideDownload
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Info panel */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <div className="h-full overflow-y-auto p-4 space-y-4">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold">Tips</h2>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li>Drag the headline text on the canvas to reposition it freely</li>
                  <li>Use the font size slider for precise sizing (14px – 72px)</li>
                  <li>Resize the panels by dragging the divider</li>
                  <li>All controls are on the canvas panel — scroll down to access them</li>
                </ul>
              </div>
              {institutionName && (
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <p className="text-xs font-medium">{institutionName}</p>
                  <div className="flex items-center gap-1.5">
                    {brandColors.map((c, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border border-border"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <SaveToLibraryDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={handleSaveToLibrary}
        libraryType="personal"
        contentType="branded image"
        defaultName={`${institutionName || "Branded"} — ${channel || "image"}`}
      />
    </div>
  );
};

export default BrandStudioPage;
