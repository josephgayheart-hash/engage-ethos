

# Replace "Thinkers" with "Planners" + Add "Strategists"

## Changes

### `src/pages/LandingPage.tsx`
- Line 116: Change `"Thinkers"` → `"Planners"`
- Note: "Strategists" already exists at line 123, so no addition needed here (avoids duplicate)

### `src/pages/LoginPage.tsx`
- Line 19: Change `"Thinkers"` → `"Planners"`
- Add `{ text: "Strategists", color: "hsl(82 85% 55%)" }` as a new entry in the `WELCOME_PHRASES` array

Two files, simple text swaps.

