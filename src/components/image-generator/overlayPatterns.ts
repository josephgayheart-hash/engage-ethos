import type { CSSProperties } from "react";

export type OverlayPatternId =
  | "none"
  | "solid"
  | "gradient-vertical"
  | "gradient-horizontal"
  | "gradient-diagonal"
  | "gradient-radial"
  | "gradient-radial-top-left"
  | "gradient-radial-top-right"
  | "gradient-radial-bottom-left"
  | "gradient-radial-bottom-right"
  | "gradient-split"
  | "slice-diagonal"
  | "corner-triangle"
  | "chevron"
  | "band-horizontal"
  | "frame"
  | "checker-corners"
  | "quarter-blocks"
  | "half-sweep"
  | "box-left"
  | "box-right"
  | "spotlight"
  | "stripes"
  | "dots"
  | "crosshatch"
  | "wave"
  | "diamond-grid"
  | "halftone";

export interface OverlayPatternMeta {
  id: OverlayPatternId;
  label: string;
  category: "Plain" | "Gradients" | "Geometric" | "Patterns";
}

export const OVERLAY_PATTERNS: OverlayPatternMeta[] = [
  { id: "none", label: "None", category: "Plain" },
  { id: "solid", label: "Solid Wash", category: "Plain" },
  { id: "gradient-vertical", label: "Vertical", category: "Gradients" },
  { id: "gradient-horizontal", label: "Horizontal", category: "Gradients" },
  { id: "gradient-diagonal", label: "Diagonal", category: "Gradients" },
  { id: "gradient-radial", label: "Radial Center", category: "Gradients" },
  { id: "gradient-radial-top-left", label: "Radial Top Left", category: "Gradients" },
  { id: "gradient-radial-top-right", label: "Radial Top Right", category: "Gradients" },
  { id: "gradient-radial-bottom-left", label: "Radial Bottom Left", category: "Gradients" },
  { id: "gradient-radial-bottom-right", label: "Radial Bottom Right", category: "Gradients" },
  { id: "gradient-split", label: "Split", category: "Gradients" },
  { id: "slice-diagonal", label: "Diagonal Slice", category: "Geometric" },
  { id: "corner-triangle", label: "Corner Triangle", category: "Geometric" },
  { id: "chevron", label: "Chevron Band", category: "Geometric" },
  { id: "band-horizontal", label: "Horizontal Band", category: "Geometric" },
  { id: "frame", label: "Frame", category: "Geometric" },
  { id: "checker-corners", label: "Checker Corners", category: "Geometric" },
  { id: "quarter-blocks", label: "Quarter Blocks", category: "Geometric" },
  { id: "half-sweep", label: "Half Sweep", category: "Geometric" },
  { id: "box-left", label: "Box Left", category: "Geometric" },
  { id: "box-right", label: "Box Right", category: "Geometric" },
  { id: "spotlight", label: "Spotlight", category: "Geometric" },
  { id: "stripes", label: "Stripes", category: "Patterns" },
  { id: "dots", label: "Dot Grid", category: "Patterns" },
  { id: "crosshatch", label: "Crosshatch", category: "Patterns" },
  { id: "wave", label: "Wave", category: "Patterns" },
  { id: "diamond-grid", label: "Diamond Grid", category: "Patterns" },
  { id: "halftone", label: "Halftone", category: "Patterns" },
];

/**
 * Returns inline CSSProperties for rendering the overlay pattern.
 * `color` is the primary overlay color (hex), `opacity` is 0–1,
 * `secondaryColor` is optional for gradients.
 */
export function getOverlayStyle(
  pattern: OverlayPatternId,
  color: string,
  opacity: number,
  secondaryColor?: string
): CSSProperties {
  const c2 = secondaryColor || color;

  switch (pattern) {
    case "none":
      return { opacity: 0 };

    case "solid":
      return { backgroundColor: color, opacity };

    case "gradient-vertical":
      return {
        background: `linear-gradient(to bottom, ${color}, ${c2})`,
        opacity,
      };

    case "gradient-horizontal":
      return {
        background: `linear-gradient(to right, ${color}, ${c2})`,
        opacity,
      };

    case "gradient-diagonal":
      return {
        background: `linear-gradient(135deg, ${color}, ${c2})`,
        opacity,
      };

    case "gradient-radial":
      return {
        background: `radial-gradient(circle at center, ${color}, ${c2})`,
        opacity,
      };

    case "gradient-split":
      return {
        background: `linear-gradient(to right, ${color} 50%, ${c2} 50%)`,
        opacity,
      };

    case "slice-diagonal":
      return {
        backgroundColor: color,
        clipPath: "polygon(0 0, 100% 0, 0 100%)",
        opacity,
      };

    case "corner-triangle":
      return {
        backgroundColor: color,
        clipPath: "polygon(0 0, 60% 0, 0 60%)",
        opacity,
      };

    case "chevron":
      return {
        backgroundColor: color,
        clipPath: "polygon(0 35%, 50% 20%, 100% 35%, 100% 65%, 50% 50%, 0 65%)",
        opacity,
      };

    case "band-horizontal":
      return {
        backgroundColor: color,
        clipPath: "polygon(0 60%, 100% 60%, 100% 100%, 0 100%)",
        opacity,
      };

    case "frame":
      return {
        background: "transparent",
        boxShadow: `inset 0 0 0 20px ${color}`,
        opacity,
      };

    case "stripes":
      return {
        background: `repeating-linear-gradient(45deg, ${color} 0px, ${color} 3px, transparent 3px, transparent 14px)`,
        opacity,
      };

    case "dots":
      return {
        backgroundImage: `radial-gradient(${color} 2px, transparent 2px)`,
        backgroundSize: "16px 16px",
        opacity,
      };

    case "crosshatch":
      return {
        background: `repeating-linear-gradient(45deg, ${color} 0px, ${color} 1.5px, transparent 1.5px, transparent 10px), repeating-linear-gradient(-45deg, ${color} 0px, ${color} 1.5px, transparent 1.5px, transparent 10px)`,
        opacity,
      };

    case "wave":
      return {
        backgroundColor: color,
        clipPath:
          "polygon(0% 55%, 5% 50%, 10% 47%, 20% 45%, 30% 47%, 40% 52%, 50% 55%, 60% 52%, 70% 47%, 80% 45%, 90% 47%, 95% 50%, 100% 55%, 100% 100%, 0% 100%)",
        opacity,
      };

    case "checker-corners":
      return {
        background: `
          linear-gradient(${color} 50%, transparent 50%) top right / 50% 50% no-repeat,
          linear-gradient(${color} 50%, transparent 50%) bottom left / 50% 50% no-repeat`,
        opacity,
      };

    case "quarter-blocks":
      return {
        background: `
          linear-gradient(${color} 100%, ${color} 100%) top left / 25% 25% no-repeat,
          linear-gradient(${c2} 100%, ${c2} 100%) top right / 25% 25% no-repeat,
          linear-gradient(${c2} 100%, ${c2} 100%) bottom left / 25% 25% no-repeat,
          linear-gradient(${color} 100%, ${color} 100%) bottom right / 25% 25% no-repeat`,
        opacity,
      };

    case "half-sweep":
      return {
        background: `linear-gradient(160deg, ${color} 45%, transparent 45.5%)`,
        opacity,
      };

    case "box-left":
      return {
        backgroundColor: color,
        clipPath: "polygon(0 0, 40% 0, 40% 100%, 0 100%)",
        opacity,
      };

    case "box-right":
      return {
        backgroundColor: color,
        clipPath: "polygon(60% 0, 100% 0, 100% 100%, 60% 100%)",
        opacity,
      };

    case "spotlight":
      return {
        background: `radial-gradient(circle at 30% 40%, transparent 30%, ${color} 70%)`,
        opacity,
      };

    case "diamond-grid":
      return {
        backgroundImage: `
          linear-gradient(45deg, ${color} 25%, transparent 25%),
          linear-gradient(-45deg, ${color} 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, ${color} 75%),
          linear-gradient(-45deg, transparent 75%, ${color} 75%)`,
        backgroundSize: "24px 24px",
        backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
        opacity,
      };

    case "halftone":
      return {
        backgroundImage: `radial-gradient(${color} 3px, transparent 3px)`,
        backgroundSize: "12px 12px",
        backgroundPosition: "0 0",
        opacity,
      };

    default:
      return { backgroundColor: color, opacity };
  }
}
