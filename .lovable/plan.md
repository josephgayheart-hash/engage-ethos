

## Graphic Design Mode Toggle with Extended Prompts — ✅ COMPLETED

### What was done

1. **Extracted Graphic Design as a segmented toggle** — "Photo" | "Graphic Design" toggle group at the top of Image Settings, using ToggleGroup with Camera/Palette icons
2. **Removed `graphic-design` from the Style dropdown** — Photo mode shows photo styles only; Graphic Design mode hides the style dropdown entirely
3. **Added 4 Graphic Design sub-controls** (visible only in Graphic Design mode):
   - **Design Style** — radio group: Bold & Geometric, Gradient Flow, Typographic Poster, Collage / Mixed Media, Retro / Vintage, Abstract Minimal
   - **Color Mood** — selectable badge chips: Brand Colors Only, Warm, Cool, Monochrome, High Contrast, Pastel
   - **Typography Style** — radio group: Sans-Serif Modern, Serif Classic, Display / Decorative, Handwritten
   - **Layout Density** — radio group: Spacious, Balanced, Dense
4. **Updated edge function prompt** — accepts `designStyle`, `colorMood`, `typographyStyle`, `layoutDensity` and weaves them into the graphic design prompt
5. **Contextual UI** — Scene Description becomes "Design Brief" with a graphic-design-specific placeholder when in GD mode
