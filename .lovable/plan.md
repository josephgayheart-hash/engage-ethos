

## Graphic Design Mode — No-Image Design Option

### What exists today
- Both Brand Studio and Image Studio have a basic "Blank Canvas" mode that renders a single solid-color square (`primaryColor`) when `imageUrl` is null.
- The overlay system (24 patterns including gradients, geometric, textures) exists but only renders *on top of* an image or solid background.
- Headline text, CTA bottom bar, logo placement, and AI text generation all work regardless of whether an image is present.

### What's missing
The blank canvas is just a flat rectangle in the primary brand color. There's no way to choose a gradient, texture, or multi-color background *as the base* (without an image). The overlay on top of a solid color creates a muddy double-layer effect rather than a clean graphic.

### Plan

**1. Add a "Canvas Background" selector to BrandOverlayControls**
- New collapsible section at the top of controls (above Pattern Color), visible when there's no base image (`imageUrl === null`).
- Options: Solid Color, Vertical Gradient, Horizontal Gradient, Diagonal Gradient, Radial Gradient, Textured (reuses dots/stripes/crosshatch patterns as the base itself).
- Color pickers for primary and secondary background colors (default to brand colors).
- When a canvas background is active, the overlay pattern section becomes optional (user can layer or skip it).

**2. Update BrandOverlayCanvas to render rich backgrounds**
- When `imageUrl` is null, instead of a plain `div` with `backgroundColor`, render the selected canvas background style using a new `canvasBackground` prop.
- New props: `canvasBackgroundType`, `canvasBackgroundColor`, `canvasBackgroundSecondaryColor`.
- Reuse `getOverlayStyle()` logic to generate the CSS for the background div.

**3. Wire state through BrandStudioPage and ImageGeneratorPage**
- Lift new canvas background state in both pages.
- Pass to `BrandOverlayCanvas` and `BrandOverlayControls`.
- Include in save metadata for round-trip editing.

**4. Update the Image Studio blank canvas entry point**
- Currently gated behind `selectedProfileId && brandColors.length > 0`. Make it always available with a default color.
- When activated, show the canvas background selector in the overlay tab.

**5. Enhance the Brand Studio starter panel**
- Update "Start with a Blank Canvas" description: "Solid, gradient, or textured background — no photo needed."
- Pre-select a gradient background type by default for a more polished starting experience.

### Files to modify
- `src/components/image-generator/BrandOverlayControls.tsx` — add Canvas Background section
- `src/components/image-generator/BrandOverlayCanvas.tsx` — render rich backgrounds when no image
- `src/pages/BrandStudioPage.tsx` — wire new state, update starter panel copy, include in metadata
- `src/pages/ImageGeneratorPage.tsx` — wire new state, improve blank canvas entry point

