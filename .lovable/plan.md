

## Graphic Design Mode Toggle with Extended Prompts

### Current State
"Graphic Design" is buried as the last option inside the Style dropdown alongside photography styles. When selected, no additional design-specific controls appear -- users only have the generic "Scene Description" textarea.

### Plan

**1. Extract Graphic Design as a toggle above the style selector**
- Add a prominent toggle/switch (or segmented control) at the top of the controls card: **"Photo" | "Graphic Design"**
- When "Photo" is active, show the existing Style dropdown (photorealistic, cinematic, illustrated, watercolor, minimal)
- When "Graphic Design" is active, hide the photography Style dropdown and show design-specific controls instead
- Remove `graphic-design` from the `styleOptions` array

**2. Add Graphic Design sub-controls (visible only when toggle is on)**
- **Design Style** -- radio group or small card selector: "Bold & Geometric", "Gradient Flow", "Typographic Poster", "Collage / Mixed Media", "Retro / Vintage", "Abstract Minimal"
- **Color Mood** -- selectable chips: "Brand Colors Only", "Warm Palette", "Cool Palette", "Monochrome", "High Contrast", "Pastel"
- **Typography Style** -- radio group: "Sans-Serif Modern", "Serif Classic", "Display / Decorative", "Handwritten"
- **Layout Density** -- radio group: "Spacious / Breathable", "Balanced", "Dense / Packed"
- These values will be appended to the prompt sent to the edge function

**3. Update prompt construction in the edge function**
- Accept new optional fields: `designStyle`, `colorMood`, `typographyStyle`, `layoutDensity`
- When present, weave them into the graphic-design prompt block for more targeted AI output

**4. Update the Scene Description label contextually**
- When in Graphic Design mode, change the label to "Design Brief" and the placeholder to something like "e.g. Open house event flyer with bold headline 'Discover Your Future' and event details"

### Files to modify
- `src/pages/ImageGeneratorPage.tsx` -- add toggle, conditional controls, new state, pass to generate call
- `supabase/functions/generate-channel-image/index.ts` -- accept and use new design parameters in prompt

