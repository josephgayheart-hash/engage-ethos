import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Type, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, ChevronLeft, ChevronRight, Move, Sparkles, Loader2, Bold, Italic, Underline, Palette } from "lucide-react";
import { OverlayPatternSelector } from "./OverlayPatternSelector";
import { type OverlayPatternId } from "./overlayPatterns";
import type { CanvasBackgroundType } from "./BrandOverlayCanvas";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { CustomOverlay } from "@/hooks/useCustomOverlays";

type LogoPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type HeadlineAlign = "left" | "center" | "right";

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

export interface BrandOverlayControlsProps {
  brandColors: string[];
  overlayColor: string;
  onOverlayColorChange: (c: string) => void;
  overlayOpacity: number;
  onOverlayOpacityChange: (v: number) => void;
  overlayPattern: OverlayPatternId | string;
  onOverlayPatternChange: (id: OverlayPatternId | string) => void;
  secondaryColor: string;
  customOverlays?: CustomOverlay[];
  onCustomOverlaySelect: (overlay: CustomOverlay) => void;

  allLogos: string[];
  showLogo: boolean;
  onShowLogoChange: (v: boolean) => void;
  logoPosition: LogoPosition;
  onLogoPositionChange: (v: LogoPosition) => void;
  logoScale: number;
  onLogoScaleChange: (v: number) => void;
  activeLogoIndex: number;
  onActiveLogoIndexChange: (v: number) => void;

  headlineText: string;
  onHeadlineTextChange: (v: string) => void;
  headlineFontSize: number;
  onHeadlineFontSizeChange: (v: number) => void;
  headlineColor: string;
  onHeadlineColorChange: (v: string) => void;
  headlineAlign: HeadlineAlign;
  onHeadlineAlignChange: (v: HeadlineAlign) => void;
  headlineFont: string;
  onHeadlineFontChange: (v: string) => void;
  headlineWidth?: number;
  onHeadlineWidthChange?: (v: number) => void;
  headlineBold?: boolean;
  onHeadlineBoldChange?: (v: boolean) => void;
  headlineItalic?: boolean;
  onHeadlineItalicChange?: (v: boolean) => void;
  headlineUnderline?: boolean;
  onHeadlineUnderlineChange?: (v: boolean) => void;

  showBottomBar: boolean;
  onShowBottomBarChange: (v: boolean) => void;
  bottomBarText: string;
  onBottomBarTextChange: (v: string) => void;
  bottomBarColor: string;
  onBottomBarColorChange: (v: string) => void;

  institutionName?: string;
  channel?: string;
  audience?: string;
  tone?: string;
  goal?: string;
  sceneDescription?: string;

  // Canvas background (no-image mode)
  hasImage?: boolean;
  canvasBackgroundType?: CanvasBackgroundType;
  onCanvasBackgroundTypeChange?: (v: CanvasBackgroundType) => void;
  canvasBackgroundColor?: string;
  onCanvasBackgroundColorChange?: (v: string) => void;
  canvasBackgroundSecondaryColor?: string;
  onCanvasBackgroundSecondaryColorChange?: (v: string) => void;
}

export function BrandOverlayControls({
  brandColors,
  overlayColor,
  onOverlayColorChange,
  overlayOpacity,
  onOverlayOpacityChange,
  overlayPattern,
  onOverlayPatternChange,
  secondaryColor,
  customOverlays,
  onCustomOverlaySelect,
  allLogos,
  showLogo,
  onShowLogoChange,
  logoPosition,
  onLogoPositionChange,
  logoScale,
  onLogoScaleChange,
  activeLogoIndex,
  onActiveLogoIndexChange,
  headlineText,
  onHeadlineTextChange,
  headlineFontSize,
  onHeadlineFontSizeChange,
  headlineColor,
  onHeadlineColorChange,
  headlineAlign,
  onHeadlineAlignChange,
  headlineFont,
  onHeadlineFontChange,
  headlineWidth,
  onHeadlineWidthChange,
  headlineBold,
  onHeadlineBoldChange,
  headlineItalic,
  onHeadlineItalicChange,
  headlineUnderline,
  onHeadlineUnderlineChange,
  showBottomBar,
  onShowBottomBarChange,
  bottomBarText,
  onBottomBarTextChange,
  bottomBarColor,
  onBottomBarColorChange,
  institutionName,
  channel,
  audience,
  tone,
  goal,
  sceneDescription,
  hasImage,
  canvasBackgroundType,
  onCanvasBackgroundTypeChange,
  canvasBackgroundColor,
  onCanvasBackgroundColorChange,
  canvasBackgroundSecondaryColor,
  onCanvasBackgroundSecondaryColorChange,
}: BrandOverlayControlsProps) {
  const [isGeneratingHeadline, setIsGeneratingHeadline] = useState(false);
  const [isGeneratingCta, setIsGeneratingCta] = useState(false);

  const generateAIText = useCallback(
    async (type: "headline" | "cta") => {
      const setLoading = type === "headline" ? setIsGeneratingHeadline : setIsGeneratingCta;
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("generate-overlay-text", {
          body: { type, channel, audience, tone, institutionName, goal, sceneDescription },
        });
        if (error) throw error;
        if (data?.text) {
          if (type === "headline") {
            onHeadlineTextChange(data.text);
          } else {
            onBottomBarTextChange(data.text);
            if (!showBottomBar) onShowBottomBarChange(true);
          }
          toast.success(`${type === "headline" ? "Headline" : "CTA"} generated!`);
        }
      } catch (err: any) {
        console.error("AI text generation failed:", err);
        toast.error(err?.message || `Failed to generate ${type}. Try again.`);
      } finally {
        setLoading(false);
      }
    },
    [channel, audience, tone, institutionName, goal, sceneDescription, showBottomBar, onHeadlineTextChange, onBottomBarTextChange, onShowBottomBarChange]
  );

  return (
    <div className="space-y-5">
      {/* Canvas Background — only when no base image */}
      {!hasImage && onCanvasBackgroundTypeChange && (
        <div className="space-y-2 pb-4 border-b border-border">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" /> Canvas Background
          </Label>
          <div className="grid grid-cols-2 gap-1.5">
            {([
              { value: "solid" as const, label: "Solid" },
              { value: "gradient-vertical" as const, label: "Vertical" },
              { value: "gradient-horizontal" as const, label: "Horizontal" },
              { value: "gradient-diagonal" as const, label: "Diagonal" },
              { value: "gradient-radial" as const, label: "Radial" },
              { value: "textured-dots" as const, label: "Dots" },
              { value: "textured-stripes" as const, label: "Stripes" },
              { value: "textured-crosshatch" as const, label: "Crosshatch" },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onCanvasBackgroundTypeChange(value)}
                className={cn(
                  "px-2 py-1.5 rounded text-[11px] font-medium transition-all border",
                  canvasBackgroundType === value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="space-y-1">
              <Label className="text-[10px]">Primary</Label>
              <div className="flex items-center gap-1">
                {brandColors.slice(0, 3).map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onCanvasBackgroundColorChange?.(c)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all",
                      canvasBackgroundColor === c ? "border-foreground scale-110" : "border-border"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <Input
                  type="color"
                  value={canvasBackgroundColor || brandColors[0] || "#1e3a5f"}
                  onChange={(e) => onCanvasBackgroundColorChange?.(e.target.value)}
                  className="w-6 h-6 p-0 border-0 cursor-pointer"
                />
              </div>
            </div>
            {canvasBackgroundType !== "solid" && (
              <div className="space-y-1">
                <Label className="text-[10px]">Secondary</Label>
                <div className="flex items-center gap-1">
                  {brandColors.slice(0, 3).map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onCanvasBackgroundSecondaryColorChange?.(c)}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-all",
                        canvasBackgroundSecondaryColor === c ? "border-foreground scale-110" : "border-border"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <Input
                    type="color"
                    value={canvasBackgroundSecondaryColor || brandColors[1] || "#c0392b"}
                    onChange={(e) => onCanvasBackgroundSecondaryColorChange?.(e.target.value)}
                    className="w-6 h-6 p-0 border-0 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pattern Color */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Pattern Color</Label>
        <div className="flex items-center gap-2">
          {brandColors.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onOverlayColorChange(c)}
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
            onChange={(e) => onOverlayColorChange(e.target.value)}
            className="w-7 h-7 p-0 border-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Opacity */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Opacity — {Math.round(overlayOpacity * 100)}%</Label>
        <Slider
          value={[overlayOpacity * 100]}
          onValueChange={([v]) => onOverlayOpacityChange(v / 100)}
          min={0}
          max={80}
          step={1}
        />
      </div>

      {/* Pattern */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Overlay Style</Label>
        <OverlayPatternSelector
          value={overlayPattern}
          onChange={onOverlayPatternChange}
          brandColor={overlayColor}
          secondaryColor={secondaryColor}
          customOverlays={customOverlays}
          onCustomOverlaySelect={(overlay) => onCustomOverlaySelect(overlay)}
        />
      </div>


      {/* Logo Controls */}
      {allLogos.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Logo
            </Label>
            <Switch checked={showLogo} onCheckedChange={onShowLogoChange} />
          </div>
          {showLogo && (
            <div className="space-y-2">
              {allLogos.length > 1 && (
                <div className="flex items-center gap-2">
                  <Label className="text-[10px] shrink-0">Logo</Label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onActiveLogoIndexChange((activeLogoIndex - 1 + allLogos.length) % allLogos.length)}
                      className="p-0.5 rounded hover:bg-muted"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    {allLogos.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onActiveLogoIndexChange(i)}
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
                      onClick={() => onActiveLogoIndexChange((activeLogoIndex + 1) % allLogos.length)}
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
                  <Select value={logoPosition} onValueChange={(v) => onLogoPositionChange(v as LogoPosition)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
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
                    onValueChange={([v]) => onLogoScaleChange(v)}
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
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" /> Headline
          </Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] gap-1 px-2"
            onClick={() => generateAIText("headline")}
            disabled={isGeneratingHeadline}
          >
            {isGeneratingHeadline ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Generate
          </Button>
        </div>
        <Input
          placeholder={institutionName || "Enter headline text…"}
          value={headlineText}
          onChange={(e) => onHeadlineTextChange(e.target.value)}
          className="h-8 text-xs"
        />
        {headlineText && (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-[10px]">Font Size — {headlineFontSize}px</Label>
              <Slider
                value={[headlineFontSize]}
                onValueChange={([v]) => onHeadlineFontSizeChange(v)}
                min={14}
                max={72}
                step={1}
              />
            </div>
            {onHeadlineWidthChange && (
              <div className="space-y-1">
                <Label className="text-[10px]">Text Box Width — {headlineWidth || 90}%</Label>
                <Slider
                  value={[headlineWidth || 90]}
                  onValueChange={([v]) => onHeadlineWidthChange(v)}
                  min={15}
                  max={100}
                  step={1}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px]">Color</Label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onHeadlineColorChange("#ffffff")}
                    className={cn("w-6 h-6 rounded border", headlineColor === "#ffffff" ? "ring-2 ring-primary" : "border-border")}
                    style={{ backgroundColor: "#ffffff" }}
                  />
                  <button
                    type="button"
                    onClick={() => onHeadlineColorChange("#000000")}
                    className={cn("w-6 h-6 rounded border", headlineColor === "#000000" ? "ring-2 ring-primary" : "border-border")}
                    style={{ backgroundColor: "#000000" }}
                  />
                  <Input
                    type="color"
                    value={headlineColor}
                    onChange={(e) => onHeadlineColorChange(e.target.value)}
                    className="w-6 h-6 p-0 border-0 cursor-pointer"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Font</Label>
                <Select value={headlineFont} onValueChange={onHeadlineFontChange}>
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
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {([
                  { val: "left" as const, icon: AlignLeft },
                  { val: "center" as const, icon: AlignCenter },
                  { val: "right" as const, icon: AlignRight },
                ] as const).map(({ val, icon: Icon }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onHeadlineAlignChange(val)}
                    className={cn(
                      "p-1 rounded transition-all",
                      headlineAlign === val ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
              <div className="w-px h-5 bg-border" />
              <div className="flex items-center gap-1">
                {([
                  { val: "bold", icon: Bold, active: headlineBold, toggle: onHeadlineBoldChange },
                  { val: "italic", icon: Italic, active: headlineItalic, toggle: onHeadlineItalicChange },
                  { val: "underline", icon: Underline, active: headlineUnderline, toggle: onHeadlineUnderlineChange },
                ] as const).map(({ val, icon: Icon, active, toggle }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => toggle?.(!active)}
                    className={cn(
                      "p-1 rounded transition-all",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Move className="w-3 h-3" /> Drag to move · Double-click to edit on canvas
            </p>
          </div>
        )}
      </div>

      {/* Bottom Bar Controls */}
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Bottom CTA Bar</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] gap-1 px-2"
              onClick={() => generateAIText("cta")}
              disabled={isGeneratingCta}
            >
              {isGeneratingCta ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Generate
            </Button>
            <Switch checked={showBottomBar} onCheckedChange={onShowBottomBarChange} />
          </div>
        </div>
        {showBottomBar && (
          <div className="space-y-2">
            <Input
              placeholder={institutionName ? `Visit ${institutionName.toLowerCase()}.edu` : "CTA text…"}
              value={bottomBarText}
              onChange={(e) => onBottomBarTextChange(e.target.value)}
              className="h-8 text-xs"
            />
            <div className="flex items-center gap-1.5">
              <Label className="text-[10px] shrink-0">Bar Color</Label>
              {brandColors.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onBottomBarColorChange(c)}
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
  );
}
