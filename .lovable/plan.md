

# Session 3: Story Bank Industry Adaptation, Build/Strategy/Evaluate Industry Wiring, and Remaining UI Labels

## What Was Done in Sessions 1-2
- Expanded `tenant_type` enum, created 6 industry vocabulary configs
- Built `IndustryProvider` / `useIndustry()` context
- Refactored `ContextSelector` and `SelectionSummary` to use dynamic vocabulary
- Parameterized edge function prompts (`evaluate-message`, `generate-message`, `playground-chat`)
- Updated `AppSidebar` label

**Remaining gaps**: Story Bank is locked to higher-ed types. BuildPage/StrategyPage/EvaluatePage/CallScriptPage/PlaygroundPage don't pass `industryContext`/`contentStyle` to edge functions. Several admin pages still have hardcoded labels.

## Session 3 Scope

### 1. Make Story Bank industry-aware
The `story_type` column is plain `text` (not an enum), so no DB migration needed. The industry vocabularies already define `storyTypes[]` per industry. Wire these into:

- **`StoryBankTab.tsx`** (line 63-70): Replace hardcoded `storyTypes` array with `useIndustry().storyTypes` mapped to `{ value, label, icon }`. Map icon strings from vocabulary to Lucide components via a lookup table.
- **`StoryCard.tsx`** (line 28-34): Replace hardcoded `storyTypeConfig` Record with a dynamic lookup from `useIndustry().storyTypes`. Fall back gracefully for unknown types.
- **`StoryDetailDialog.tsx`**: Update the story type `<Select>` to render options from `useIndustry().storyTypes`.
- **`StoryFactSelector.tsx`** (line 32-48): Replace hardcoded `storyTypeIcons` and `storyTypeLabels` with dynamic vocabulary lookups.
- **`useStoryBank.ts`** (line 13): Widen the `StoryType` union to `string` so it accepts any industry's story types. Keep the named type alias for documentation.

### 2. Wire industry context into BuildPage generation calls
`BuildPage.tsx` line 485 calls `buildMessage(context, config, model)` without `industryContext`/`contentStyle`. The function signature already accepts these (added in Session 2). Changes:
- Import `useIndustry` in `BuildPage.tsx`
- Pass `labels.industryContext` and `labels.contentStyle` to the `buildMessage()` call
- Replace hardcoded `audienceLabels` and `cohortLabels` Records (lines 122-150) with dynamic lookups from `useIndustry().audiences` and `useIndustry().cohorts`

### 3. Wire industry context into StrategyPage generation calls
`StrategyPage.tsx` line 464 calls `mapMessages(context, config, weeks, start, end, model)` without industry params. Same pattern:
- Import `useIndustry`, pass `labels.industryContext` and `labels.contentStyle` to `mapMessages()`

### 4. Wire industry context into EvaluatePage
`EvaluatePage.tsx` line 69 calls `evaluateMessage(content, context, config, model)` without industry params. Add the two extra args.

### 5. Wire industry context into CallScriptPage
`CallScriptPage.tsx` line 169 invokes `generate-message` directly. Add `industryContext` and `contentStyle` to the request body.

### 6. Wire industry context into PlaygroundPage
`PlaygroundPage.tsx` line 139 calls `playground-chat` via fetch. Add `industryContext` and `contentStyle` to the JSON body.

### 7. Update remaining admin page labels
- **`UniversitySettingsPage.tsx`**: Replace "University Settings" (line 482, 540) with `useIndustry().labels.organizationSettings`
- **`ContentDNAPage.tsx`**: Replace "Campus Photography" (line 1362) with `useIndustry().labels.photography`

### 8. Create shared icon resolver utility
Multiple components need to map `storyType.icon` strings (e.g., `'graduation-cap'`, `'heart'`) to Lucide components. Create a small utility `src/lib/iconResolver.ts` with a lookup map to avoid duplicating icon imports everywhere.

## Technical Details

**Story type widening pattern:**
```typescript
// useStoryBank.ts — widen to accept any industry's types
export type StoryType = string;
```

**Icon resolver utility:**
```typescript
// src/lib/iconResolver.ts
import { GraduationCap, Users, Heart, Briefcase, User, Building2, ... } from 'lucide-react';
const iconMap: Record<string, LucideIcon> = {
  'graduation-cap': GraduationCap, 'users': Users, 'heart': Heart, ...
};
export function resolveIcon(name?: string): LucideIcon { return iconMap[name || ''] || User; }
```

**BuildPage audience label replacement:**
```typescript
const { audiences, cohorts, labels } = useIndustry();
const getAudienceLabel = (id: string) => audiences.find(a => a.id === id)?.label || id;
const getCohortLabel = (id: string) => cohorts.find(c => c.id === id)?.label || id;
```

## Files Changed (~14 files)

| File | Change |
|------|--------|
| `src/lib/iconResolver.ts` | New — shared icon string→component resolver |
| `src/hooks/useStoryBank.ts` | Widen `StoryType` to `string` |
| `src/components/dna/StoryBankTab.tsx` | Dynamic story types from `useIndustry()` |
| `src/components/dna/StoryCard.tsx` | Dynamic type config from `useIndustry()` |
| `src/components/dna/StoryDetailDialog.tsx` | Dynamic type select options |
| `src/components/StoryFactSelector.tsx` | Dynamic type icons/labels |
| `src/pages/BuildPage.tsx` | Pass industry context + replace hardcoded labels |
| `src/pages/StrategyPage.tsx` | Pass industry context to `mapMessages` |
| `src/pages/EvaluatePage.tsx` | Pass industry context to `evaluateMessage` |
| `src/pages/CallScriptPage.tsx` | Pass industry context to `generate-message` |
| `src/pages/PlaygroundPage.tsx` | Pass industry context to `playground-chat` |
| `src/pages/UniversitySettingsPage.tsx` | Dynamic page title |
| `src/pages/admin/ContentDNAPage.tsx` | Dynamic "Campus Photography" label |

## What This Does NOT Cover (Session 4+)
- Playbook Kit industry-specific libraries and DB seeding
- InstitutionalConfig field relevance filtering per industry
- Onboarding flow adaptation per industry
- Profile Setup Wizard classification options per industry
- `parse-story` edge function industry-aware prompt

