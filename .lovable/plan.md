
# Brand It Studio -- Expanded Editor

## Overview

Two major enhancements: (1) replace the fixed text size dropdown and preset positions with a continuous font-size slider and free-form drag-to-position for the headline text, and (2) create a dedicated full-page "Brand It Studio" route (`/brand-studio`) that gives users a spacious canvas with side-by-side controls, accessible via the existing "Brand It" tab and a direct link.

---

## Part 1: Text Size Slider and Draggable Positioning

### Font Size Slider
- Replace the current `HeadlineSize` dropdown (sm/md/lg/xl mapping to Tailwind classes) with a pixel-based `Slider` from 14px to 72px (default 28px)
- Apply the value directly via `style={{ fontSize: headlineFontSize }}` instead of Tailwind size classes
- Show the current value: "Font Size -- 28px"

### Draggable Text
- Replace the fixed top/middle/bottom position dropdown with free-form drag
- Track `headlineX` and `headlineY` as percentage values (0-100) so positioning is responsive to any canvas size
- Use `onMouseDown` / `onMouseMove` / `onMouseUp` (and touch equivalents) on the headline element within the canvas
- Show a subtle "grab" cursor on hover, "grabbing" while dragging
- Keep the headline constrained within the canvas bounds
- Default position: centered (x: 50%, y: 50%)

### Files Changed
- `src/components/image-generator/BrandOverlayEditor.tsx` -- Replace size dropdown with slider, replace position dropdown with drag state and handlers

---

## Part 2: Standalone Brand It Studio Page

### New Route: `/brand-studio`
- Full-page layout (no side-by-side with generation controls)
- Two-panel layout using the existing `react-resizable-panels` dependency:
  - **Left panel (~60%)**: Large canvas preview at maximum size
  - **Right panel (~40%)**: All overlay controls (same BrandOverlayEditor controls, but with more room)
- Header with title "Brand It Studio" and a back link to Image Studio
- Accepts state via URL search params or React Router location state (imageUrl, profileId, channel) so users can navigate here from Image Studio

### Navigation
- Add an "Open in Studio" expand button on the existing Brand It tab in Image Studio that links to `/brand-studio` passing the current image URL and profile
- Add the route to `App.tsx` as a protected route

### Files Changed
- `src/pages/BrandStudioPage.tsx` -- New full-page component with resizable panels layout
- `src/components/image-generator/BrandOverlayEditor.tsx` -- Extract shared state/controls, support a `fullscreen` prop or just reuse as-is in the new page
- `src/pages/ImageGeneratorPage.tsx` -- Add "Open in Studio" button on the Brand It tab
- `src/App.tsx` -- Add `/brand-studio` route

---

## Technical Details

### Drag Implementation (no new dependencies)
```text
State:
  headlineX: number (0-100, default 50)
  headlineY: number (0-100, default 50)
  isDragging: boolean

Canvas element (ref: canvasRef):
  onMouseDown on headline div -> set isDragging, capture offset
  onMouseMove on canvas -> update headlineX/Y as % of canvas dimensions
  onMouseUp -> clear isDragging

Headline style:
  position: absolute
  left: `${headlineX}%`
  top: `${headlineY}%`
  transform: translate(-50%, -50%) adjusted for alignment
  cursor: isDragging ? 'grabbing' : 'grab'
```

### Brand Studio Page Layout
```text
+--------------------------------------------------+
| Brand It Studio            [Back to Image Studio] |
+--------------------------------------------------+
|                        |                          |
|                        |  Overlay Color           |
|                        |  Opacity Slider          |
|    Large Canvas        |  Pattern Selector        |
|    (resizable)         |  Logo Controls           |
|                        |  Headline Text + Font    |
|                        |  Font Size Slider        |
|                        |  Color / Alignment       |
|                        |  Bottom Bar              |
|                        |  [Download]              |
+--------------------------------------------------+
```

### Route State Transfer
The "Open in Studio" button will use React Router's `Link` with `state` to pass `{ imageUrl, brandColors, logoUrl, logoUrls, institutionName, channel, profileId }` to the new page. The Brand Studio page reads this from `useLocation().state`.
