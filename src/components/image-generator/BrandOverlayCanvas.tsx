import { forwardRef, useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getOverlayStyle, type OverlayPatternId } from "./overlayPatterns";

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

export interface BrandOverlayCanvasProps {
  imageUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
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
  headlineBold?: boolean;
  headlineItalic?: boolean;
  headlineUnderline?: boolean;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
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
      headlineBold,
      headlineItalic,
      headlineUnderline,
      isDragging,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onHeadlineTextChange,
      showBottomBar,
      bottomBarText,
      bottomBarColor,
      institutionName,
    },
    ref
  ) => {
    const [isEditing, setIsEditing] = useState(false);
    const headlineRef = useRef<HTMLDivElement>(null);
    const isCustomPattern = overlayPattern.startsWith("custom:");
    const overlayStyle = isCustomPattern
      ? { opacity: overlayOpacity }
      : getOverlayStyle(overlayPattern as OverlayPatternId, overlayColor, overlayOpacity, secondaryColor);

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
          <div className="w-full" style={{ aspectRatio: "1 / 1", backgroundColor: primaryColor }} />
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
            ref={headlineRef}
            contentEditable={isEditing}
            suppressContentEditableWarning
            className={cn(
              "absolute px-6 drop-shadow-lg select-none outline-none",
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
              left: `${headlineX}%`,
              top: `${headlineY}%`,
              transform: "translate(-50%, -50%)",
              cursor: isEditing ? "text" : isDragging ? "grabbing" : "grab",
              maxWidth: "90%",
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
    );
  }
);

BrandOverlayCanvas.displayName = "BrandOverlayCanvas";
