

# Redesign Brand It Studio Layout

## Problem
The current layout places the full BrandOverlayEditor (canvas + controls stacked vertically) in the left panel and a "Tips" sidebar on the right. This causes the image to be cut off at the top, forces awkward scrolling to reach controls below the canvas, and wastes the right panel on unhelpful tips.

## Solution
Flip and split the layout: editing controls on the left, stable full-size image preview on the right. Remove the tips panel entirely.

## Architecture Change

```text
CURRENT (broken):
+----------------------------+------------------+
| [Canvas]                   |  Tips            |
| [Controls below, scroll]   |  Institution     |
|                            |  Saved status    |
+----------------------------+------------------+

NEW (proposed):
+---------------------+------------------------------+
| Overlay Color       |                              |
| Opacity Slider      |                              |
| Pattern Selector    |    Stable Image Canvas       |
| Logo Controls       |    (centered, full size,     |
| Headline + Font     |     no scroll needed)        |
| Font Size Slider    |                              |
| Color / Alignment   |                              |
| Bottom Bar          |                              |
| [Download] [Save]   |                              |
+---------------------+------------------------------+
```

## Implementation

### 1. Split BrandOverlayEditor into two render modes
Add a `renderMode` prop to `BrandOverlayEditor`:
- `"full"` (default) -- current behavior, canvas + controls together (used in ImageGeneratorPage)
- `"canvas-only"` -- renders only the image canvas with overlays, headline, logo, bottom bar
- `"controls-only"` -- renders only the editing controls (color, opacity, pattern, logo, headline, CTA bar, download)

This avoids duplicating state by keeping all state in a single component instance. Instead, we'll lift the state up to `BrandStudioPage` and pass it down to two separate render sections.

**Alternative (cleaner):** Extract the canvas and controls into two exported sub-components (`BrandOverlayCanvas` and `BrandOverlayControls`) that share state via props. The parent (`BrandStudioPage`) manages all the state and passes it to both.

Going with the sub-component approach for cleanliness.

### 2. Refactor BrandOverlayEditor.tsx
- Extract `BrandOverlayCanvas` -- just the image preview div with overlays, logo, headline, bottom bar
- Extract `BrandOverlayControls` -- all the sliders, inputs, selectors, switches
- Keep the existing `BrandOverlayEditor` component as a wrapper that renders both together (preserves ImageGeneratorPage usage unchanged)
- Both sub-components receive shared state via props

### 3. Rewrite BrandStudioPage.tsx layout
- Left panel (35-40%): scrollable controls panel with all editing tools, plus Download/Save/Collection buttons at the bottom
- Right panel (60-65%): stable canvas centered in the viewport, no scrolling needed
- Remove the Tips section entirely
- Remove the institution color swatch display (redundant with controls)
- Keep the "Saved to Library" status and "Add to Collection" button inline with other action buttons
- Header stays the same

### Files Changed
- `src/components/image-generator/BrandOverlayEditor.tsx` -- Extract `BrandOverlayCanvas` and `BrandOverlayControls` sub-components; keep `BrandOverlayEditor` as the combined wrapper
- `src/pages/BrandStudioPage.tsx` -- New two-panel layout with controls left, canvas right; remove tips; lift editor state to page level

