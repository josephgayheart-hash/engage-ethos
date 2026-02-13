import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Type, Image as ImageIcon } from "lucide-react";
import { OverlayPatternSelector } from "./OverlayPatternSelector";
import { getOverlayStyle, type OverlayPatternId } from "./overlayPatterns";
import { cn } from "@/lib/utils";

interface BrandOverlayEditorProps {
  /** Base image URL (null for blank canvas mode) */
  imageUrl: string | null;
  /** Brand colors from institutional profile */
  brandColors: string[];
  /** Logo URL from institutional profile */
  logoUrl?: string;
  /** Institution name for default headline */
  institutionName?: string;
  /** Channel for filename */
  channel?: string;
}

type LogoPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type HeadlinePosition = "top" | "middle" | "bottom";
type HeadlineSize = "sm" | "md" | "lg" | "xl";

const LOGO_POSITION_CLASSES: Record<LogoPosition, string> = {
  "top-left": "top-3 left-3",
  "top-right": "top-3 right-3",
  "bottom-left": "bottom-3 left-3",
  "bottom-right": "bottom-3 right-3",
};

const HEADLINE_POSITION_CLASSES: Record<HeadlinePosition, string> = {
  top: "top-6 left-0 right-0",
  middle: "top-1/2 -translate-y-1/2 left-0 right-0",
  bottom: "bottom-14 left-0 right-0",
};

const HEADLINE_SIZE_CLASSES: Record<HeadlineSize, string> = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
  xl: "text-3xl",
};

export function BrandOverlayEditor({
  imageUrl,
  brandColors,
  logoUrl,
  institutionName,
  channel,
}: BrandOverlayEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Primary and secondary color from brand palette
  const primary = brandColors[0] || "#1e3a5f";
  const secondary = brandColors[1] || brandColors[0] || "#c0392b";

  // Overlay state
  const [overlayPattern, setOverlayPattern] = useState<OverlayPatternId>("solid");
  const [overlayColor, setOverlayColor] = useState(primary);
  const [overlayOpacity, setOverlayOpacity] = useState(0.55);

  // Logo state
  const [showLogo, setShowLogo] = useState(!!logoUrl);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>("top-left");
  const [logoScale, setLogoScale] = useState(60);

  // Headline state
  const [headlineText, setHeadlineText] = useState("");
  const [headlineSize, setHeadlineSize] = useState<HeadlineSize>("lg");
  const [headlinePosition, setHeadlinePosition] = useState<HeadlinePosition>("middle");
  const [headlineColor, setHeadlineColor] = useState("#ffffff");

  // Bottom bar state
  const [showBottomBar, setShowBottomBar] = useState(false);
  const [bottomBarText, setBottomBarText] = useState("");
  const [bottomBarColor, setBottomBarColor] = useState(primary);

  const overlayStyle = getOverlayStyle(overlayPattern, overlayColor, overlayOpacity, secondary);

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
        style={{ aspectRatio: "1 / 1" }}
      >
        {/* Base layer: image or solid fill */}
        {imageUrl ? (
          <img src={imageUrl} alt="Base" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: primary }} />
        )}

        {/* Overlay pattern layer */}
        <div className="absolute inset-0" style={overlayStyle} />

        {/* Logo layer */}
        {showLogo && logoUrl && (
          <img
            src={logoUrl}
            alt="Logo"
            className={cn("absolute object-contain", LOGO_POSITION_CLASSES[logoPosition])}
            style={{ width: logoScale, height: logoScale }}
          />
        )}

        {/* Headline layer */}
        {headlineText && (
          <div
            className={cn(
              "absolute px-6 text-center font-bold drop-shadow-lg",
              HEADLINE_POSITION_CLASSES[headlinePosition],
              HEADLINE_SIZE_CLASSES[headlineSize]
            )}
            style={{ color: headlineColor }}
          >
            {headlineText}
          </div>
        )}

        {/* Bottom bar layer */}
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
        {/* Brand Color Palette Swatches */}
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

        {/* Opacity Slider */}
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

        {/* Pattern Selector */}
        <div className="space-y-1.5">
          <Label className="text-xs">Overlay Style</Label>
          <OverlayPatternSelector
            value={overlayPattern}
            onChange={setOverlayPattern}
            brandColor={overlayColor}
            secondaryColor={secondary}
          />
        </div>

        {/* Logo Controls */}
        {logoUrl && (
          <div className="space-y-2 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Logo
              </Label>
              <Switch checked={showLogo} onCheckedChange={setShowLogo} />
            </div>
            {showLogo && (
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
            )}
          </div>
        )}

        {/* Headline Controls */}
        <div className="space-y-2 border-t border-border pt-3">
          <Label className="text-xs flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" /> Headline
          </Label>
          <Input
            placeholder={institutionName || "Enter headline text…"}
            value={headlineText}
            onChange={(e) => setHeadlineText(e.target.value)}
            className="h-8 text-xs"
          />
          {headlineText && (
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px]">Size</Label>
                <Select value={headlineSize} onValueChange={(v) => setHeadlineSize(v as HeadlineSize)}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Position</Label>
                <Select value={headlinePosition} onValueChange={(v) => setHeadlinePosition(v as HeadlinePosition)}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="middle">Middle</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            </div>
          )}
        </div>

        {/* Bottom Bar Controls */}
        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Bottom CTA Bar</Label>
            <Switch checked={showBottomBar} onCheckedChange={setShowBottomBar} />
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
      <Button onClick={handleDownload} className="w-full" size="sm">
        <Download className="w-4 h-4 mr-1.5" />
        Download Branded Image
      </Button>
    </div>
  );
}
