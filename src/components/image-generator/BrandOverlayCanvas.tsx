import { forwardRef, useState, useCallback, useRef, useEffect, type PointerEvent as RPointerEvent, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { getOverlayStyle, type OverlayPatternId } from "./overlayPatterns";

function getCanvasBackgroundStyle(
  type: string,
  color: string,
  secondaryColor: string
): CSSProperties {
  switch (type) {
    case "gradient-vertical":
      return { background: `linear-gradient(to bottom, ${color}, ${secondaryColor})` };
    case "gradient-horizontal":
      return { background: `linear-gradient(to right, ${color}, ${secondaryColor})` };
    case "gradient-diagonal":
      return { background: `linear-gradient(135deg, ${color}, ${secondaryColor})` };
    case "gradient-radial":
      return { background: `radial-gradient(circle at center, ${color}, ${secondaryColor})` };
    case "textured-dots":
      return {
        backgroundColor: color,
        backgroundImage: `radial-gradient(${secondaryColor} 2px, transparent 2px)`,
        backgroundSize: "16px 16px",
      };
    case "textured-stripes":
      return {
        backgroundColor: color,
        backgroundImage: `repeating-linear-gradient(45deg, ${secondaryColor} 0px, ${secondaryColor} 3px, transparent 3px, transparent 14px)`,
      };
    case "textured-crosshatch":
      return {
        backgroundColor: color,
        backgroundImage: `repeating-linear-gradient(45deg, ${secondaryColor} 0px, ${secondaryColor} 1.5px, transparent 1.5px, transparent 10px), repeating-linear-gradient(-45deg, ${secondaryColor} 0px, ${secondaryColor} 1.5px, transparent 1.5px, transparent 10px)`,
      };
    default:
      return { backgroundColor: color };
  }
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

export type CanvasBackgroundType =
  | "solid"
  | "gradient-vertical"
  | "gradient-horizontal"
  | "gradient-diagonal"
  | "gradient-radial"
  | "textured-dots"
  | "textured-stripes"
  | "textured-crosshatch";

export interface BrandOverlayCanvasProps {
  imageUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  canvasBackgroundType?: CanvasBackgroundType;
  canvasBackgroundColor?: string;
  canvasBackgroundSecondaryColor?: string;
  overlayPattern: OverlayPatternId | string;
  overlayColor: string;
  overlayOpacity: number;
  customOverlayUrl: string | null;
  showLogo: boolean;
  activeLogo: string | undefined;
  logoPosition: LogoPosition;
  logoScale: number;
  headlineText: string;
  headlineFontSize: number;
  headlineX: number;
  headlineY: number;
  headlineColor: string;
  headlineAlign: HeadlineAlign;
  headlineFont: string;
  headlineWidth?: number;
  headlineBold?: boolean;
  headlineItalic?: boolean;
  headlineUnderline?: boolean;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onHeadlineWidthChange?: (w: number) => void;
  onHeadlineTextChange?: (text: string) => void;
  showBottomBar: boolean;
  bottomBarText: string;
  bottomBarColor: string;
  institutionName?: string;
}

export const BrandOverlayCanvas = forwardRef<HTMLDivElement, BrandOverlayCanvasProps>(
  (
    {
      imageUrl,
      primaryColor,
      secondaryColor,
      canvasBackgroundType = "solid",
      canvasBackgroundColor,
      canvasBackgroundSecondaryColor,
      overlayPattern,
      overlayColor,
      overlayOpacity,
      customOverlayUrl,
      showLogo,
      activeLogo,
      logoPosition,
      logoScale,
      headlineText,
      headlineFontSize,
      headlineX,
      headlineY,
      headlineColor,
      headlineAlign,
      headlineFont,
      headlineWidth,
      headlineBold,
      headlineItalic,
      headlineUnderline,
      isDragging,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onHeadlineWidthChange,
      onHeadlineTextChange,
      showBottomBar,
      bottomBarText,
      bottomBarColor,
      institutionName,
    },
    ref
  ) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const resizeRef = useRef<{ side: "left" | "right"; startX: number; startWidth: number } | null>(null);
    const headlineRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isCustomPattern = overlayPattern.startsWith("custom:");
    const overlayStyle = isCustomPattern
      ? { opacity: overlayOpacity }
      : getOverlayStyle(overlayPattern as OverlayPatternId, overlayColor, overlayOpacity, secondaryColor);

    // Click outside to deselect — use mousedown (not pointerdown) to avoid
    // racing with handle pointerdown, and delay check with requestAnimationFrame
    useEffect(() => {
      if (!isSelected) return;
      const handleClickOutside = (e: MouseEvent) => {
        // Use rAF so the handle's onPointerDown fires first and sets isResizing
        requestAnimationFrame(() => {
          if (containerRef.current && !containerRef.current.contains(e.target as Node) && !resizeRef.current) {
            setIsSelected(false);
          }
        });
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isSelected]);

    // Document-level move/up for smooth resizing
    useEffect(() => {
      if (!isResizing) return;
      const handleMove = (e: PointerEvent) => {
        if (!resizeRef.current) return;
        const canvas = (ref as React.RefObject<HTMLDivElement>)?.current;
        if (!canvas) return;
        const canvasWidth = canvas.getBoundingClientRect().width;
        const deltaX = e.clientX - resizeRef.current.startX;
        const multiplier = resizeRef.current.side === "right" ? 2 : -2;
        const newWidthPx = resizeRef.current.startWidth + deltaX * multiplier;
        const newWidthPct = Math.max(15, Math.min(100, (newWidthPx / canvasWidth) * 100));
        onHeadlineWidthChange?.(Math.round(newWidthPct));
      };
      const handleUp = () => {
        setIsResizing(false);
        resizeRef.current = null;
      };
      document.addEventListener("pointermove", handleMove);
      document.addEventListener("pointerup", handleUp);
      return () => {
        document.removeEventListener("pointermove", handleMove);
        document.removeEventListener("pointerup", handleUp);
      };
    }, [isResizing, ref, onHeadlineWidthChange]);

    const handleResizePointerDown = useCallback((e: RPointerEvent, side: "left" | "right") => {
      e.preventDefault();
      e.stopPropagation();
      const canvas = (ref as React.RefObject<HTMLDivElement>)?.current;
      if (!canvas) return;
      const canvasWidth = canvas.getBoundingClientRect().width;
      const currentWidthPx = ((headlineWidth || 90) / 100) * canvasWidth;
      resizeRef.current = { side, startX: e.clientX, startWidth: currentWidthPx };
      setIsResizing(true);
    }, [headlineWidth, ref]);

    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onHeadlineTextChange) {
        setIsEditing(true);
        // Focus after state update
        setTimeout(() => headlineRef.current?.focus(), 0);
      }
    }, [onHeadlineTextChange]);

    const handleBlur = useCallback(() => {
      setIsEditing(false);
      if (headlineRef.current && onHeadlineTextChange) {
        onHeadlineTextChange(headlineRef.current.innerText);
      }
    }, [onHeadlineTextChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditing(false);
        headlineRef.current?.blur();
      }
    }, []);

    // Sync text from parent when not editing
    useEffect(() => {
      if (!isEditing && headlineRef.current && headlineRef.current.innerText !== headlineText) {
        headlineRef.current.innerText = headlineText;
      }
    }, [headlineText, isEditing]);

    return (
      <div
        ref={ref}
        id="brand-overlay-canvas"
        className="relative w-full overflow-hidden rounded-lg bg-muted shadow-2xl"
      >
        {imageUrl ? (
          <img src={imageUrl} alt="Base" className="w-full h-auto block" />
        ) : (
          <div className="w-full" style={{ aspectRatio: "1 / 1", ...getCanvasBackgroundStyle(canvasBackgroundType, canvasBackgroundColor || primaryColor, canvasBackgroundSecondaryColor || secondaryColor) }} />
        )}
        {isCustomPattern && customOverlayUrl ? (
          <img
            src={customOverlayUrl}
            alt="Custom overlay"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: overlayOpacity }}
          />
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
        {(headlineText || isEditing) && (
          <div
            ref={containerRef}
            className="absolute"
            style={{
              left: `${headlineX}%`,
              top: `${headlineY}%`,
              transform: "translate(-50%, -50%)",
              width: `${headlineWidth || 90}%`,
              maxWidth: `${headlineWidth || 90}%`,
            }}
            onPointerDown={(e) => { if (!isEditing) { e.stopPropagation(); setIsSelected(true); } }}
          >
            {/* Resize handles - visible when selected and not editing */}
            {isSelected && !isEditing && onHeadlineWidthChange && (
              <>
                {/* Left handle */}
                <div
                  className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-8 bg-white border border-border rounded-sm shadow-md cursor-ew-resize z-10 hover:bg-primary/20 transition-colors"
                  onPointerDown={(e) => handleResizePointerDown(e, "left")}
                />
                {/* Right handle */}
                <div
                  className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-8 bg-white border border-border rounded-sm shadow-md cursor-ew-resize z-10 hover:bg-primary/20 transition-colors"
                  onPointerDown={(e) => handleResizePointerDown(e, "right")}
                />
                {/* Selection border */}
                <div className="absolute inset-0 border-2 border-white/60 border-dashed rounded pointer-events-none" />
              </>
            )}
            <div
              ref={headlineRef}
              contentEditable={isEditing}
              suppressContentEditableWarning
              className={cn(
                "px-6 drop-shadow-lg select-none outline-none w-full",
                HEADLINE_ALIGN_CLASSES[headlineAlign],
                isEditing && "ring-2 ring-white/50 rounded cursor-text select-auto bg-black/20"
              )}
              style={{
                color: headlineColor,
                fontFamily: `'${headlineFont}', sans-serif`,
                fontSize: `${headlineFontSize}px`,
                fontWeight: headlineBold ? "bold" : "normal",
                fontStyle: headlineItalic ? "italic" : "normal",
                textDecoration: headlineUnderline ? "underline" : "none",
                cursor: isEditing ? "text" : isDragging ? "grabbing" : "grab",
                lineHeight: 1.2,
                minWidth: isEditing ? "80px" : undefined,
                minHeight: isEditing ? "1.2em" : undefined,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
              onPointerDown={isEditing ? undefined : onPointerDown}
              onPointerMove={isEditing ? undefined : onPointerMove}
              onPointerUp={isEditing ? undefined : onPointerUp}
              onDoubleClick={handleDoubleClick}
              onBlur={handleBlur}
              onKeyDown={isEditing ? handleKeyDown : undefined}
            >
              {headlineText || (isEditing ? "" : "")}
            </div>
          </div>
        )}
        {showBottomBar && (
          <div
            className="absolute bottom-0 left-0 right-0 py-2 px-4 text-center text-sm font-semibold"
            style={{ backgroundColor: bottomBarColor, color: "#ffffff", fontFamily: `'${headlineFont}', sans-serif` }}
          >
            {bottomBarText || institutionName || "Your Institution"}
          </div>
        )}
      </div>
    );
  }
);

BrandOverlayCanvas.displayName = "BrandOverlayCanvas";
