

# Scratchpad -- Enhanced with Modern LLM Techniques

## Magic-Feel Enhancements

### 1. Streaming Progressive Reveal

Instead of a loading spinner followed by a wall of results, **stream the organized output token-by-token** (like the Copywriter chat already does). But go further -- structure it as a **staged reveal**:

- First, a one-line summary fades in ("Sounds like a yield campaign targeting admitted students...")
- Then extracted fields animate in as chips/badges (Audience, Channel, Timing)
- Finally, recommendation cards slide up one by one

This uses the same SSE streaming pattern already in `playground-chat` but with a structured system prompt that outputs sections in order.

### 2. Live Intent Detection While Typing (Debounced)

Use `google/gemini-2.5-flash-lite` (the fastest/cheapest model) for a **lightweight debounced call** as the user types. After 1.5s of inactivity with 30+ characters, fire a quick classification call that returns:

- A subtle inline hint like "Looks like a yield campaign idea" or "Meeting notes about financial aid outreach"
- A tiny contextual icon that shifts based on detected intent (mail icon for email ideas, map icon for journey plans, etc.)

This makes the scratchpad feel alive and aware before the user even clicks "Organize."

### 3. Multi-Model Pipeline

Chain two models for speed + depth:

- **Stage 1** (`gemini-2.5-flash-lite`): Instant classification and field extraction (~200ms) -- show results immediately
- **Stage 2** (`gemini-3-flash-preview`): Deep recommendations with research-grounded reasoning, streamed in after

The user sees something useful almost instantly, then richer recommendations stream in. This removes the "waiting" feeling entirely.

### 4. Context-Aware Recommendations

Pull the user's **active Content DNA voice profile** and **recent drafts** into the system prompt so recommendations reference their actual institutional voice and in-progress work. For example:

- "You have a draft yield email from 2 days ago -- this could extend it into a 3-touch journey"
- "Your DNA voice is warm and conversational -- a text-first approach would match well"

This uses data already available via `useContentDNA` and `useUserDrafts` hooks.

### 5. Tool-Calling for Structured Output

Instead of asking the LLM to return JSON in prose (fragile), use the **tool-calling API** to force structured output. Define a `organize_notes` tool schema that guarantees clean typed fields every time -- no parsing errors, no malformed JSON.

---

## Revised Technical Architecture

### Edge Function: `organize-scratchpad`

A single edge function with a `stage` parameter:

- `stage: "classify"` -- Uses `gemini-2.5-flash-lite`, returns `{ intent, hint_text, icon }` in ~200ms via tool-calling (non-streaming)
- `stage: "organize"` -- Uses `gemini-3-flash-preview`, streams full organized output with recommendations via SSE

Both stages receive optional Content DNA context and recent draft titles for personalization.

### Component: `ScratchpadCapture`

- **Debounced classify call**: 1.5s after typing stops (30+ char minimum), fires classify stage, shows subtle inline hint
- **Organize button**: Fires the full organize stage with SSE streaming
- **Progressive UI**: Results render in stages using CSS transitions -- summary first, then fields, then recommendation cards
- **Persist in localStorage**: Raw text saved on every keystroke so nothing is lost

### Config

Add to `supabase/config.toml`:
```
[functions.organize-scratchpad]
verify_jwt = false
```

### Files

| File | Action |
|------|--------|
| `supabase/functions/organize-scratchpad/index.ts` | Create -- multi-stage edge function with classify + organize |
| `src/components/dashboard/ScratchpadCapture.tsx` | Create -- component with debounced hints, streaming results, progressive reveal |
| `src/pages/Index.tsx` | Modify -- add ScratchpadCapture above ResumeWorkCard |

No database changes required.

