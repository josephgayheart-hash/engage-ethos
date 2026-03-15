

## Plan: Add AI Model Selector to the Advanced Options in ContextSelector

### Overview
Add a model selection field inside the existing "Advanced Options" collapsible section of the `ContextSelector` component. It will show the current default model and expand to let users pick from all available models. This flows through to the Message Builder, Journey Designer, and Evaluator via the existing context/config pattern.

### Changes

**1. Expand `ModelSelector.tsx` — add all available models**
- Update the `AIModel` type to include: `google/gemini-3-flash-preview` (new default), `google/gemini-3.1-pro-preview`, `openai/gpt-5`, `openai/gpt-5-nano`, `openai/gpt-5.2`
- Update the models array with names, descriptions, icons, and badges
- Mark `google/gemini-3-flash-preview` as "Default"

**2. Add model selector into `ContextSelector.tsx` Advanced Options**
- Add new props: `selectedModel` and `onModelChange`
- Show a compact model indicator (current model name + icon) alongside the "Advanced Options" trigger button so it's always visible
- Inside the collapsible advanced section, render a full model `Select` dropdown as the first field in the grid
- Default to `google/gemini-3-flash-preview`

**3. Thread model state through BuildPage, StrategyPage, and EvaluatePage**
- Add `selectedModel` state (default: `google/gemini-3-flash-preview`) to each page
- Pass `selectedModel` and `onModelChange` to `ContextSelector`
- Pass `selectedModel` to the generation functions (`buildMessage`, `mapMessages`, `evaluateMessage`)

**4. Update `src/lib/evaluateMessage.ts`**
- Add optional `model?: string` parameter to `evaluateMessage()`, `buildMessage()`, and `mapMessages()`
- Include `model` in the request body sent to the edge function

**5. Update edge functions to accept model param**
- `supabase/functions/evaluate-message/index.ts`: Read `model` from request body, validate against allowed list, use it instead of hardcoded `google/gemini-2.5-flash`
- `supabase/functions/generate-message/index.ts`: Same change

### Files Modified
- `src/components/playground/ModelSelector.tsx` — expand model list and type
- `src/components/ContextSelector.tsx` — add model selector in advanced options
- `src/pages/BuildPage.tsx` — add model state, pass through
- `src/pages/StrategyPage.tsx` — add model state, pass through
- `src/pages/EvaluatePage.tsx` — add model state, pass through
- `src/lib/evaluateMessage.ts` — accept and forward model param
- `supabase/functions/evaluate-message/index.ts` — use dynamic model
- `supabase/functions/generate-message/index.ts` — use dynamic model

