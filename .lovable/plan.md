

## Add Image Studio and Brand It Studio to Quick Brief

The Quick Brief AI assistant currently recommends 7 tools (Builder, Evaluator, Journey Designer, AI Copywriter, Content Analyzer, Content DNA Studio, Institutional Profiles). This plan adds **Image Studio** and **Brand It Studio** as two new recommendable outputs.

---

### Changes

#### 1. Frontend: `src/components/dashboard/ScratchpadCapture.tsx`

- Add two new entries to `toolRoutes`:
  - `"image-studio"` pointing to `/image-generator` with the `Image` icon
  - `"brand-studio"` pointing to `/brand-studio` with the `Paintbrush` icon
- Import `Image` and `Paintbrush` from `lucide-react`

#### 2. Backend: `supabase/functions/organize-scratchpad/index.ts`

- **Classify stage**: Add `"visual_content"` and `"brand_design"` to the `intent` enum, and add `"image"` to the `icon` enum so the classifier can detect visual/branding intents.
- **Organize stage**: Update the system prompt to include `image-studio` and `brand-studio` in the valid tool list:
  - `image-studio` -- for generating on-brand campus visuals for social, email, web, signage, etc.
  - `brand-studio` -- for overlaying logos, headlines, and brand elements onto images
- Add guidance so the AI recommends these tools when the user mentions visuals, graphics, social media imagery, branded photos, signage, viewbooks, or similar creative needs.

#### 3. Frontend icon map update

- Add `"image"` to the `iconMap` in `ScratchpadCapture.tsx` so the classify hint renders correctly for visual intents.

---

### Technical Detail

**New `toolRoutes` entries:**
```text
image-studio  -> /image-generator  | "Image Studio"     | Image icon
brand-studio  -> /brand-studio     | "Brand It Studio"  | Paintbrush icon
```

**Updated prompt snippet (organize stage):**
```text
**Tool:** [one of: builder, evaluator, journey, copywriter, analyzer,
           content-dna, profiles, image-studio, brand-studio]
```

With matching descriptions so the AI knows when to recommend each.

