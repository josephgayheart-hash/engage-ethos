import { useState, useRef, useCallback, useEffect } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Type, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, ChevronLeft, ChevronRight, Move, Sparkles, Loader2 } from "lucide-react";
import { OverlayPatternSelector } from "./OverlayPatternSelector";
import { getOverlayStyle, type OverlayPatternId } from "./overlayPatterns";
import { useCustomOverlays } from "@/hooks/useCustomOverlays";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface BrandOverlayEditorProps {
  imageUrl: string | null;
  brandColors: string[];
  logoUrl?: string;
  logoUrls?: string[];
  institutionName?: string;
  channel?: string;
  hideDownload?: boolean;
  /** Context from the image generation form for AI headline generation */
  sceneDescription?: string;
  audience?: string;
  tone?: string;
  goal?: string;
}

type LogoPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type HeadlineAlign = "left" | "center" | "right";

const LOGO_POSITION_CLASSES: Record<LogoPosition, string> = {
  "top-left": "top-3 left-3",
  "top-right": "top-3 right-3",
  "bottom-left": "bottom-3 left-3",
  "bottom-right": "bottom-3 right-3",
};

const HEADLINE_ALIGN_CLASSES: Record<HeadlineAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter", style: "sans-serif" },
  { value: "Georgia", label: "Georgia", style: "serif" },
  { value: "Playfair Display", label: "Playfair Display", style: "serif" },
  { value: "Merriweather", label: "Merriweather", style: "serif" },
  { value: "Lora", label: "Lora", style: "serif" },
  { value: "Roboto", label: "Roboto", style: "sans-serif" },
  { value: "Open Sans", label: "Open Sans", style: "sans-serif" },
  { value: "Montserrat", label: "Montserrat", style: "sans-serif" },
  { value: "Oswald", label: "Oswald", style: "sans-serif" },
  { value: "Raleway", label: "Raleway", style: "sans-serif" },
  { value: "Bebas Neue", label: "Bebas Neue", style: "sans-serif" },
  { value: "Crimson Text", label: "Crimson Text", style: "serif" },
];

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

  // AI generation state
  const [isGeneratingHeadline, setIsGeneratingHeadline] = useState(false);
  const [isGeneratingCta, setIsGeneratingCta] = useState(false);

  useGoogleFont(headlineFont);

  const isCustomPattern = overlayPattern.startsWith('custom:');
  const overlayStyle = isCustomPattern
    ? { opacity: overlayOpacity }
    : getOverlayStyle(overlayPattern as OverlayPatternId, overlayColor, overlayOpacity, secondary);
  const activeLogo = allLogos[activeLogoIndex] || allLogos[0];

  // AI text generation
  const generateAIText = useCallback(async (type: "headline" | "cta") => {
    const setLoading = type === "headline" ? setIsGeneratingHeadline : setIsGeneratingCta;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-overlay-text", {
        body: {
          type,
          channel,
          audience,
          tone,
          institutionName,
          goal,
          sceneDescription,
        },
      });
      if (error) throw error;
      if (data?.text) {
        if (type === "headline") {
          setHeadlineText(data.text);
        } else {
          setBottomBarText(data.text);
          if (!showBottomBar) setShowBottomBar(true);
        }
        toast.success(`${type === "headline" ? "Headline" : "CTA"} generated!`);
      }
    } catch (err: any) {
      console.error("AI text generation failed:", err);
      toast.error(err?.message || `Failed to generate ${type}. Try again.`);
    } finally {
      setLoading(false);
    }
  }, [channel, audience, tone, institutionName, goal, sceneDescription, showBottomBar]);

  // Drag handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const currentPxX = (headlineX / 100) * rect.width;
    const currentPxY = (headlineY / 100) * rect.height;
    dragOffset.current = {
      x: e.clientX - rect.left - currentPxX,
      y: e.clientY - rect.top - currentPxY,
    };
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

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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
      {/* Live Preview */}
      <div
        ref={canvasRef}
        id="brand-overlay-canvas"
        className="relative w-full overflow-hidden rounded-lg bg-muted"
      >
        {imageUrl ? (
          <img src={imageUrl} alt="Base" className="w-full h-auto block" />
        ) : (
          <div className="w-full" style={{ aspectRatio: "1 / 1", backgroundColor: primary }} />
        )}
        {/* Overlay layers */}
        {isCustomPattern && customOverlayUrl ? (
          <img src={customOverlayUrl} alt="Custom overlay" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: overlayOpacity }} />
        ) : (
          <div className="absolute inset-0 w-full h-full" style={overlayStyle} />
        )}
        {showLogo && activeLogo && (
          <img
            src={activeLogo}
            alt="Logo"
            className={cn("absolute object-contain", LOGO_POSITION_CLASSES[logoPosition])}
            style={{ width: logoScale, height: logoScale }}
          />
        )}
        {headlineText && (
          <div
            className={cn(
              "absolute px-6 font-bold drop-shadow-lg select-none",
              HEADLINE_ALIGN_CLASSES[headlineAlign]
            )}
            style={{
              color: headlineColor,
              fontFamily: `'${headlineFont}', sans-serif`,
              fontSize: `${headlineFontSize}px`,
              left: `${headlineX}%`,
              top: `${headlineY}%`,
              transform: 'translate(-50%, -50%)',
              cursor: isDragging ? 'grabbing' : 'grab',
              maxWidth: '90%',
              lineHeight: 1.2,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {headlineText}
          </div>
        )}
        {showBottomBar && (
          <div
            className="absolute bottom-0 left-0 right-0 py-2 px-4 text-center text-sm font-semibold"
            style={{ backgroundColor: bottomBarColor, color: "#ffffff" }}
          >
            {bottomBarText || institutionName || "Your Institution"}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
        {/* Overlay Color */}
        <div className="space-y-1.5">
          <Label className="text-xs">Overlay Color</Label>
          <div className="flex items-center gap-2">
            {brandColors.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setOverlayColor(c)}
                className={cn(
                  "w-7 h-7 rounded-full border-2 transition-all",
                  overlayColor === c ? "border-foreground scale-110" : "border-border"
                )}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
            <Input
              type="color"
              value={overlayColor}
              onChange={(e) => setOverlayColor(e.target.value)}
              className="w-7 h-7 p-0 border-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Opacity */}
        <div className="space-y-1.5">
          <Label className="text-xs">Opacity — {Math.round(overlayOpacity * 100)}%</Label>
          <Slider
            value={[overlayOpacity * 100]}
            onValueChange={([v]) => setOverlayOpacity(v / 100)}
            min={0}
            max={80}
            step={1}
          />
        </div>

        {/* Pattern */}
        <div className="space-y-1.5">
          <Label className="text-xs">Overlay Style</Label>
          <OverlayPatternSelector
            value={overlayPattern}
            onChange={setOverlayPattern}
            brandColor={overlayColor}
            secondaryColor={secondary}
            customOverlays={customOverlays}
            onCustomOverlaySelect={(overlay) => setCustomOverlayUrl(overlay.fileUrl)}
          />
        </div>

        {/* Logo Controls */}
        {allLogos.length > 0 && (
          <div className="space-y-2 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Logo
              </Label>
              <Switch checked={showLogo} onCheckedChange={setShowLogo} />
            </div>
            {showLogo && (
              <div className="space-y-2">
                {allLogos.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] shrink-0">Logo</Label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveLogoIndex((prev) => (prev - 1 + allLogos.length) % allLogos.length)}
                        className="p-0.5 rounded hover:bg-muted"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      {allLogos.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveLogoIndex(i)}
                          className={cn(
                            "w-8 h-8 rounded border overflow-hidden p-0.5 transition-all",
                            activeLogoIndex === i ? "ring-2 ring-primary border-primary" : "border-border"
                          )}
                        >
                          <img src={url} alt={`Logo ${i + 1}`} className="w-full h-full object-contain" />
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setActiveLogoIndex((prev) => (prev + 1) % allLogos.length)}
                        className="p-0.5 rounded hover:bg-muted"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Position</Label>
                    <Select value={logoPosition} onValueChange={(v) => setLogoPosition(v as LogoPosition)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Size — {logoScale}px</Label>
                    <Slider
                      value={[logoScale]}
                      onValueChange={([v]) => setLogoScale(v)}
                      min={30}
                      max={140}
                      step={5}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Headline Controls */}
        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> Headline
            </Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] gap-1 px-2"
              onClick={() => generateAIText("headline")}
              disabled={isGeneratingHeadline}
            >
              {isGeneratingHeadline ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              Generate
            </Button>
          </div>
          <Input
            placeholder={institutionName || "Enter headline text…"}
            value={headlineText}
            onChange={(e) => setHeadlineText(e.target.value)}
            className="h-8 text-xs"
          />
          {headlineText && (
            <div className="space-y-2">
              {/* Font Size Slider */}
              <div className="space-y-1">
                <Label className="text-[10px]">Font Size — {headlineFontSize}px</Label>
                <Slider
                  value={[headlineFontSize]}
                  onValueChange={([v]) => setHeadlineFontSize(v)}
                  min={14}
                  max={72}
                  step={1}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px]">Color</Label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setHeadlineColor("#ffffff")}
                      className={cn("w-6 h-6 rounded border", headlineColor === "#ffffff" ? "ring-2 ring-primary" : "border-border")}
                      style={{ backgroundColor: "#ffffff" }}
                    />
                    <button
                      type="button"
                      onClick={() => setHeadlineColor("#000000")}
                      className={cn("w-6 h-6 rounded border", headlineColor === "#000000" ? "ring-2 ring-primary" : "border-border")}
                      style={{ backgroundColor: "#000000" }}
                    />
                    <Input
                      type="color"
                      value={headlineColor}
                      onChange={(e) => setHeadlineColor(e.target.value)}
                      className="w-6 h-6 p-0 border-0 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Font</Label>
                  <Select value={headlineFont} onValueChange={setHeadlineFont}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          <span style={{ fontFamily: `'${f.value}', ${f.style}` }}>{f.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Alignment */}
              <div className="space-y-1">
                <Label className="text-[10px]">Alignment</Label>
                <div className="flex items-center gap-1">
                  {([
                    { val: "left" as const, icon: AlignLeft },
                    { val: "center" as const, icon: AlignCenter },
                    { val: "right" as const, icon: AlignRight },
                  ]).map(({ val, icon: Icon }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setHeadlineAlign(val)}
                      className={cn(
                        "p-1.5 rounded transition-all",
                        headlineAlign === val ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Drag hint */}
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Move className="w-3 h-3" /> Drag the headline on the canvas to reposition
              </p>
            </div>
          )}
        </div>

        {/* Bottom Bar Controls */}
        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Bottom CTA Bar</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] gap-1 px-2"
                onClick={() => generateAIText("cta")}
                disabled={isGeneratingCta}
              >
                {isGeneratingCta ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                Generate
              </Button>
              <Switch checked={showBottomBar} onCheckedChange={setShowBottomBar} />
            </div>
          </div>
          {showBottomBar && (
            <div className="space-y-2">
              <Input
                placeholder={institutionName ? `Visit ${institutionName.toLowerCase()}.edu` : "CTA text…"}
                value={bottomBarText}
                onChange={(e) => setBottomBarText(e.target.value)}
                className="h-8 text-xs"
              />
              <div className="flex items-center gap-1.5">
                <Label className="text-[10px] shrink-0">Bar Color</Label>
                {brandColors.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setBottomBarColor(c)}
                    className={cn(
                      "w-5 h-5 rounded-full border",
                      bottomBarColor === c ? "ring-2 ring-primary" : "border-border"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Download */}
      {!hideDownload && (
        <Button onClick={handleDownload} className="w-full" size="sm">
          <Download className="w-4 h-4 mr-1.5" />
          Download Branded Image
        </Button>
      )}
    </div>
  );
}
