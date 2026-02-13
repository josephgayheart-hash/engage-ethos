import { useState, useRef, useCallback, useEffect } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { type OverlayPatternId } from "./overlayPatterns";
import { useCustomOverlays } from "@/hooks/useCustomOverlays";
import { BrandOverlayCanvas } from "./BrandOverlayCanvas";
import { BrandOverlayControls } from "./BrandOverlayControls";

interface BrandOverlayEditorProps {
  imageUrl: string | null;
  brandColors: string[];
  logoUrl?: string;
  logoUrls?: string[];
  institutionName?: string;
  channel?: string;
  hideDownload?: boolean;
  sceneDescription?: string;
  audience?: string;
  tone?: string;
  goal?: string;
}

type LogoPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type HeadlineAlign = "left" | "center" | "right";

function useGoogleFont(fontName: string) {
  useEffect(() => {
    if (!fontName || fontName === "Georgia" || fontName === "Inter") return;
    const id = `gfont-${fontName.replace(/\s+/g, "-")}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;700&display=swap`;
    document.head.appendChild(link);
  }, [fontName]);
}

export { useGoogleFont };

export function BrandOverlayEditor({
  imageUrl,
  brandColors,
  logoUrl,
  logoUrls,
  institutionName,
  channel,
  hideDownload,
  sceneDescription,
  audience,
  tone,
  goal,
}: BrandOverlayEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const primary = brandColors[0] || "#1e3a5f";
  const secondary = brandColors[1] || brandColors[0] || "#c0392b";
  const allLogos = Array.from(new Set([logoUrl, ...(logoUrls || [])].filter(Boolean))) as string[];

  const [overlayPattern, setOverlayPattern] = useState<OverlayPatternId | string>("solid");
  const [overlayColor, setOverlayColor] = useState(primary);
  const [overlayOpacity, setOverlayOpacity] = useState(0.55);
  const [customOverlayUrl, setCustomOverlayUrl] = useState<string | null>(null);
  const { overlays: customOverlays } = useCustomOverlays(undefined);

  const [showLogo, setShowLogo] = useState(!!logoUrl);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>("top-left");
  const [logoScale, setLogoScale] = useState(60);
  const [activeLogoIndex, setActiveLogoIndex] = useState(0);

  const [headlineText, setHeadlineText] = useState("");
  const [headlineFontSize, setHeadlineFontSize] = useState(28);
  const [headlineX, setHeadlineX] = useState(50);
  const [headlineY, setHeadlineY] = useState(50);
  const [headlineColor, setHeadlineColor] = useState("#ffffff");
  const [headlineAlign, setHeadlineAlign] = useState<HeadlineAlign>("center");
  const [headlineFont, setHeadlineFont] = useState("Inter");
  const [headlineWidth, setHeadlineWidth] = useState(90);

  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const [showBottomBar, setShowBottomBar] = useState(false);
  const [bottomBarText, setBottomBarText] = useState("");
  const [bottomBarColor, setBottomBarColor] = useState(primary);

  useGoogleFont(headlineFont);

  const activeLogo = allLogos[activeLogoIndex] || allLogos[0];

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
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
  }, [headlineX, headlineY]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const newX = ((e.clientX - rect.left - dragOffset.current.x) / rect.width) * 100;
    const newY = ((e.clientY - rect.top - dragOffset.current.y) / rect.height) * 100;
    setHeadlineX(Math.max(5, Math.min(95, newX)));
    setHeadlineY(Math.max(5, Math.min(95, newY)));
  }, [isDragging]);

  const handlePointerUp = useCallback(() => { setIsDragging(false); }, []);

  const handleDownload = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await toPng(canvasRef.current, { pixelRatio: 2 });
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

  return (
    <div className="space-y-4">
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
        headlineWidth={headlineWidth}
        isDragging={isDragging}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        showBottomBar={showBottomBar}
        bottomBarText={bottomBarText}
        bottomBarColor={bottomBarColor}
        institutionName={institutionName}
      />

      <div className="max-h-[50vh] overflow-y-auto pr-1">
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
          headlineWidth={headlineWidth}
          onHeadlineWidthChange={setHeadlineWidth}
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

      {!hideDownload && (
        <Button onClick={handleDownload} className="w-full" size="sm">
          <Download className="w-4 h-4 mr-1.5" />
          Download Branded Image
        </Button>
      )}
    </div>
  );
}
