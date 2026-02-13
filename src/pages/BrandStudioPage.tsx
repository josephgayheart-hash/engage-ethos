import { useRef, useCallback, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrandOverlayCanvas } from "@/components/image-generator/BrandOverlayCanvas";
import { BrandOverlayControls } from "@/components/image-generator/BrandOverlayControls";
import { useGoogleFont } from "@/components/image-generator/BrandOverlayEditor";
import { SaveToLibraryDialog } from "@/components/library/SaveToLibraryDialog";
import { AddToCollectionDialog } from "@/components/library/AddToCollectionDialog";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useLibraryCollections } from "@/hooks/useLibraryCollections";
import { useCustomOverlays } from "@/hooks/useCustomOverlays";
import { ArrowLeft, Download, Maximize2, FolderPlus, Folder, RefreshCw } from "lucide-react";
import type { CollectionType } from "@/types/library";
import type { OverlayPatternId } from "@/components/image-generator/overlayPatterns";

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

type LogoPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type HeadlineAlign = "left" | "center" | "right";

const BrandStudioPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as BrandStudioState | null) || ({} as Partial<BrandStudioState>);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [lastSavedMessageId, setLastSavedMessageId] = useState<string | null>(null);
  const { addMessage } = useMessageLibrary();
  const { collections, addItemToCollection, createCollection } = useLibraryCollections();

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

  const primary = brandColors[0] || "#1e3a5f";
  const secondary = brandColors[1] || brandColors[0] || "#c0392b";
  const allLogos = Array.from(new Set([logoUrl, ...(logoUrls || [])].filter(Boolean))) as string[];

  // Overlay state
  const [overlayPattern, setOverlayPattern] = useState<OverlayPatternId | string>("solid");
  const [overlayColor, setOverlayColor] = useState(primary);
  const [overlayOpacity, setOverlayOpacity] = useState(0.55);
  const [customOverlayUrl, setCustomOverlayUrl] = useState<string | null>(null);
  const { overlays: customOverlays } = useCustomOverlays(undefined);

  // Logo state
  const [showLogo, setShowLogo] = useState(!!logoUrl);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>("top-left");
  const [logoScale, setLogoScale] = useState(60);
  const [activeLogoIndex, setActiveLogoIndex] = useState(0);

  // Headline state
  const [headlineText, setHeadlineText] = useState("");
  const [headlineFontSize, setHeadlineFontSize] = useState(28);
  const [headlineX, setHeadlineX] = useState(50);
  const [headlineY, setHeadlineY] = useState(50);
  const [headlineColor, setHeadlineColor] = useState("#ffffff");
  const [headlineAlign, setHeadlineAlign] = useState<HeadlineAlign>("center");
  const [headlineFont, setHeadlineFont] = useState("Inter");

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Bottom bar state
  const [showBottomBar, setShowBottomBar] = useState(false);
  const [bottomBarText, setBottomBarText] = useState("");
  const [bottomBarColor, setBottomBarColor] = useState(primary);

  useGoogleFont(headlineFont);

  const activeLogo = allLogos[activeLogoIndex] || allLogos[0];

  // Drag handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const currentPxX = (headlineX / 100) * rect.width;
      const currentPxY = (headlineY / 100) * rect.height;
      dragOffset.current = { x: e.clientX - rect.left - currentPxX, y: e.clientY - rect.top - currentPxY };
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [headlineX, headlineY]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const newX = ((e.clientX - rect.left - dragOffset.current.x) / rect.width) * 100;
      const newY = ((e.clientY - rect.top - dragOffset.current.y) / rect.height) * 100;
      setHeadlineX(Math.max(5, Math.min(95, newX)));
      setHeadlineY(Math.max(5, Math.min(95, newY)));
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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

  const handleSaveToLibrary = useCallback(
    async (name: string) => {
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
        if (result?.id) {
          setLastSavedMessageId(result.id);
        }
        return result?.id;
      } catch {
        toast.error("Failed to capture image for library.");
        return undefined;
      }
    },
    [channel, profileId, institutionName, addMessage]
  );

  const handleAddToExistingCollection = useCallback(
    async (collectionId: string) => {
      if (!lastSavedMessageId) {
        toast.error("Save to library first before adding to a collection.");
        return;
      }
      const success = await addItemToCollection(collectionId, {
        itemType: "message",
        messageId: lastSavedMessageId,
      });
      if (success) toast.success("Added to collection!");
      else toast.error("Failed to add to collection.");
    },
    [lastSavedMessageId, addItemToCollection]
  );

  const handleCreateAndAddToCollection = useCallback(
    async (input: { name: string; description?: string; collectionType: CollectionType }) => {
      if (!lastSavedMessageId) {
        toast.error("Save to library first before adding to a collection.");
        return;
      }
      const collection = await createCollection(input);
      if (collection?.id) {
        const success = await addItemToCollection(collection.id, {
          itemType: "message",
          messageId: lastSavedMessageId,
        });
        if (success) toast.success(`Created "${input.name}" and added image!`);
      } else {
        toast.error("Failed to create collection.");
      }
    },
    [lastSavedMessageId, createCollection, addItemToCollection]
  );

  if (brandColors.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-8">
        <Maximize2 className="w-12 h-12 text-muted-foreground/30" />
        <h2 className="text-lg font-semibold">Brand It Studio</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Open this page from Image Studio by clicking "Open Brand Studio" on the Brand It tab. Your image, colors, and
          profile will transfer automatically.
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
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className="font-serif text-base font-bold flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-primary" />
            Brand It Studio
          </h1>
        </div>
      </div>

      {/* Main content: controls left, canvas right */}
      <div className="flex-1 min-h-0 flex">
        {/* Left: Controls */}
        <div className="w-[340px] shrink-0 border-r border-border flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4">
              <BrandOverlayControls
                brandColors={brandColors}
                overlayColor={overlayColor}
                onOverlayColorChange={setOverlayColor}
                overlayOpacity={overlayOpacity}
                onOverlayOpacityChange={setOverlayOpacity}
                overlayPattern={overlayPattern}
                onOverlayPatternChange={setOverlayPattern}
                secondaryColor={secondary}
                customOverlays={customOverlays}
                onCustomOverlaySelect={(overlay) => setCustomOverlayUrl(overlay.fileUrl)}
                allLogos={allLogos}
                showLogo={showLogo}
                onShowLogoChange={setShowLogo}
                logoPosition={logoPosition}
                onLogoPositionChange={setLogoPosition}
                logoScale={logoScale}
                onLogoScaleChange={setLogoScale}
                activeLogoIndex={activeLogoIndex}
                onActiveLogoIndexChange={setActiveLogoIndex}
                headlineText={headlineText}
                onHeadlineTextChange={setHeadlineText}
                headlineFontSize={headlineFontSize}
                onHeadlineFontSizeChange={setHeadlineFontSize}
                headlineColor={headlineColor}
                onHeadlineColorChange={setHeadlineColor}
                headlineAlign={headlineAlign}
                onHeadlineAlignChange={setHeadlineAlign}
                headlineFont={headlineFont}
                onHeadlineFontChange={setHeadlineFont}
                showBottomBar={showBottomBar}
                onShowBottomBarChange={setShowBottomBar}
                bottomBarText={bottomBarText}
                onBottomBarTextChange={setBottomBarText}
                bottomBarColor={bottomBarColor}
                onBottomBarColorChange={setBottomBarColor}
                institutionName={institutionName}
                channel={channel}
                audience={audience}
                tone={tone}
                goal={goal}
                sceneDescription={sceneDescription}
              />
            </div>
          </ScrollArea>

        </div>

        {/* Right: Canvas */}
        <div className="flex-1 flex items-center justify-center p-8 bg-muted/30 overflow-hidden">
          <div className="max-w-2xl w-full relative group">
            <BrandOverlayCanvas
              ref={canvasRef}
              imageUrl={imageUrl}
              primaryColor={primary}
              secondaryColor={secondary}
              overlayPattern={overlayPattern}
              overlayColor={overlayColor}
              overlayOpacity={overlayOpacity}
              customOverlayUrl={customOverlayUrl}
              showLogo={showLogo}
              activeLogo={activeLogo}
              logoPosition={logoPosition}
              logoScale={logoScale}
              headlineText={headlineText}
              headlineFontSize={headlineFontSize}
              headlineX={headlineX}
              headlineY={headlineY}
              headlineColor={headlineColor}
              headlineAlign={headlineAlign}
              headlineFont={headlineFont}
              isDragging={isDragging}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              showBottomBar={showBottomBar}
              bottomBarText={bottomBarText}
              bottomBarColor={bottomBarColor}
              institutionName={institutionName}
            />
            {/* Hover overlay actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-center pb-5 opacity-0 group-hover:opacity-100 rounded-lg pointer-events-none">
              <div className="flex gap-2 pointer-events-auto">
                <Button size="sm" variant="secondary" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setSaveDialogOpen(true)}>
                  <FolderPlus className="w-4 h-4 mr-1" />
                  Save to Library
                </Button>
                {lastSavedMessageId && (
                  <Button size="sm" variant="secondary" onClick={() => setCollectionDialogOpen(true)}>
                    <Folder className="w-4 h-4 mr-1" />
                    Add to Collection
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => navigate(-1)}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Regenerate
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SaveToLibraryDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={handleSaveToLibrary}
        libraryType="personal"
        contentType="branded image"
        defaultName={`${institutionName || "Branded"} — ${channel || "image"}`}
      />

      <AddToCollectionDialog
        open={collectionDialogOpen}
        onOpenChange={setCollectionDialogOpen}
        collections={collections}
        onAddToExisting={handleAddToExistingCollection}
        onCreateAndAdd={handleCreateAndAddToCollection}
      />
    </div>
  );
};

export default BrandStudioPage;
