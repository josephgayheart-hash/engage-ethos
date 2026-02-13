

# Brand Overlay Editor — Refined Plan

## Answers to Your Questions

### 1. Brand Colors as Overlay Options
Yes — the overlay editor will automatically pull all brand colors (primary, secondary, tertiary, accent) from the selected institutional profile and present them as a one-click color palette. Users can pick any of their brand colors for the overlay tint, gradient stops, bottom bar, and text colors. They can also use a custom hex picker if needed, but the brand palette is front-and-center so the default workflow stays on-brand.

### 2. Logo from Institutional Profile
The `logoUrl` stored in the institutional profile config will be auto-loaded into the overlay editor. Users toggle it on/off and position it (corners or centered). No re-upload needed.

### 3. UX for Accessing the Overlay Editor
After generating an image, a third tab called **"Brand It"** appears in the existing view-mode toggle bar (alongside "In Context" and "Raw Image"). Clicking it opens the overlay editor with the generated image as the base. This is a post-generation step — the AI creates the base image, then the user layers branding on top.

### 4. Creating Without an Underlying Image (Blank Canvas Mode)
Yes — we will also offer a **"Start from Blank"** option. Before generating, or even without generating at all, users can click a "Create Branded Graphic" button that starts with a solid brand-color background (no AI image underneath). This is perfect for simple branded announcement cards, event graphics, or text-heavy pieces where a photo isn't needed. The blank canvas uses the institution's primary color as the default fill, with all the same overlay controls available.

---

## How It Will Work (User Flow)

```text
Path A: AI Image + Brand Overlay
  1. Fill in scene description, select profile, generate image
  2. New "Brand It" tab appears in the view toggle
  3. Click it -> overlay editor opens with the generated image as base
  4. Pick overlay style (solid, gradient, diagonal slice, etc.)
  5. Pick color from brand palette, adjust opacity
  6. Toggle logo on, position it
  7. Add headline text, optional bottom CTA bar
  8. Download composite PNG

Path B: Blank Canvas Branded Graphic
  1. Click "Create Branded Graphic" button (no generation needed)
  2. Overlay editor opens with a solid brand-color fill as base
  3. Same controls: pattern/geometry, logo, text, bottom bar
  4. Download composite PNG
```

---

## Overlay Style Options

Organized into categories in a visual thumbnail grid:

**Plain**
- None (raw image, no overlay)
- Solid color wash

**Gradients**
- Vertical gradient (top to bottom)
- Horizontal gradient (left to right)
- Diagonal gradient (corner to corner)
- Radial gradient (center fade)
- Split gradient (two brand colors meeting)

**Geometric**
- Diagonal slice (hard angle, one half tinted)
- Corner triangle (brand triangle anchored to a corner)
- Chevron / V-shape band
- Horizontal band (top, middle, or bottom third)
- Frame / thick border

**Patterns**
- Diagonal stripes
- Dot grid
- Crosshatch
- Wave curves

---

## Technical Details

### New Files

| File | Purpose |
|------|---------|
| `src/components/image-generator/BrandOverlayEditor.tsx` | Main editor component with live preview and controls |
| `src/components/image-generator/OverlayPatternSelector.tsx` | Visual thumbnail grid for picking overlay style |
| `src/components/image-generator/overlayPatterns.ts` | Pure utility mapping pattern names to CSS properties (`background`, `clipPath`, etc.) |

### Changes to Existing Files

| File | Change |
|------|--------|
| `src/pages/ImageGeneratorPage.tsx` | Add "Brand It" tab to view toggle; add "Create Branded Graphic" button; pass profile config to overlay editor |

### Brand Color Integration

The overlay editor receives the full `InstitutionalConfig` from the selected profile. It extracts:
- `primaryColor`, `secondaryColor`, `tertiaryColor`, `accentColor` -- rendered as clickable swatches
- `logoUrl` -- loaded as the logo layer
- `institutionName` -- used as default headline text suggestion

### Pattern Rendering

All patterns are pure CSS on absolutely-positioned div layers -- no canvas or SVG. Examples:
- Diagonal slice: `clipPath: polygon(0 0, 100% 0, 0 100%)`
- Gradient: `background: linear-gradient(135deg, primaryColor, secondaryColor)`
- Stripes: `background: repeating-linear-gradient(45deg, color 0px, color 2px, transparent 2px, transparent 12px)`

### Download / Export

Uses the already-installed `html-to-image` library to capture the layered container (`#brand-overlay-canvas`) as a PNG. All CSS clip-paths, gradients, and overlays render correctly in the capture.

### No Backend Changes

Everything is client-side CSS compositing. No new database tables, edge functions, or storage buckets needed for this feature.

