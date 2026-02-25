

## Plan: Image Generation Performance + "Improve Your Results" Guidance Component

### Part 1: Image Generation Performance Optimizations

After reviewing the edge functions (`generate-channel-image`, `generate-cover-image`, `generate-collection-cover`), the primary bottleneck is **sequential database queries** before the AI call. The AI model itself (`gemini-3-pro-image-preview`) is inherently slow for image gen -- we can't change that, but we can shave seconds off the setup work.

#### Optimizations

1. **Parallelize all DB queries** in `generate-channel-image/index.ts`
   - Currently: tenant fetch → profile fetch → campus photos fetch (sequential)
   - Change to: `Promise.all([tenantQuery, profileQuery, campusPhotosQuery])` -- all three fire simultaneously
   - Same pattern applied to `generate-cover-image` and `generate-collection-cover`

2. **Add a "Fast" engine option** that uses `google/gemini-2.5-flash-image` instead of `gemini-3-pro-image-preview`
   - The `engine` param already exists in the request body but isn't used for model selection
   - Map `engine: "fast"` → `gemini-2.5-flash-image` (faster, lower quality)
   - Map `engine: "premium"` → `gemini-3-pro-image-preview` (current default)
   - This gives users explicit control over speed vs quality

3. **Reduce campus reference photos for "fast" engine** -- skip multimodal photo references when using fast engine (sending images to the model adds latency)

4. **Trim prompt length for cover images** -- `generate-cover-image` doesn't need the full channel-specific best practices since it's just a thumbnail. Shorter prompts = faster inference.

#### Files changed
- `supabase/functions/generate-channel-image/index.ts` -- parallelize queries, respect engine param for model selection
- `supabase/functions/generate-cover-image/index.ts` -- parallelize queries, trim prompt
- `supabase/functions/generate-collection-cover/index.ts` -- parallelize queries

---

### Part 2: "Improve Your Results" Guidance Component

Create a reusable `AIResultsGuidance` component that appears beneath AI-generated content, nudging users to strengthen their institutional profile and Content DNA for better output.

#### Design

```text
┌─────────────────────────────────────────────────────┐
│ 💡 Not getting the results you want?                │
│                                                     │
│ AI-generated content improves when your              │
│ institutional voice and brand are configured.        │
│                                                     │
│ [Update Institutional Profile →]  [Refine DNA →]    │
└─────────────────────────────────────────────────────┘
```

- Subtle, non-intrusive styling (`bg-muted/20`, small text)
- Context-aware: checks if the user has a Content DNA analysis and an institutional profile configured. If both are set up, shows a softer message ("Refine your DNA for even better results"). If neither exists, shows a stronger nudge.
- Links to `/settings` (profile) and `/admin/content-dna` (Content DNA studio)

#### Placement (6 locations)
1. `BuilderResults.tsx` -- after the NextStepsBar
2. `EvaluationResults.tsx` -- after the NextStepsBar
3. `StrategyJourney.tsx` -- at the bottom of the journey display
4. `ImageGeneratorPage.tsx` -- below the generated image preview
5. `ChannelPreview.tsx` -- below generated channel images
6. `PlaygroundPage.tsx` -- at the bottom of the chat area (optional, lighter touch)

#### Files created
- `src/components/AIResultsGuidance.tsx` -- the reusable component

#### Files modified
- `src/components/BuilderResults.tsx`
- `src/components/EvaluationResults.tsx`
- `src/components/StrategyJourney.tsx`
- `src/pages/ImageGeneratorPage.tsx`
- `src/components/ChannelPreview.tsx`
- `supabase/functions/generate-channel-image/index.ts`
- `supabase/functions/generate-cover-image/index.ts`
- `supabase/functions/generate-collection-cover/index.ts`

