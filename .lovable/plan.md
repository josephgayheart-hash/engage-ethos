

# Session 2: Wire Industry Vocabulary into UI Components and Edge Functions

## What Was Done in Session 1
- Expanded `tenant_type` enum in DB
- Created `IndustryVocabulary` type system and 6 industry config files
- Built `IndustryProvider` / `useIndustry()` context
- Wired provider into `AppLayout`

**Problem**: `useIndustry()` is defined but consumed by zero components. All UI dropdowns and AI prompts still use hardcoded higher-ed terminology.

## Session 2 Scope

### 1. Refactor ContextSelector to use industry vocabulary
The main `src/components/ContextSelector.tsx` (705 lines) has ~300 lines of hardcoded audience/cohort/moment/domain/goal arrays. Replace these with data from `useIndustry()`.

- Import `useIndustry` and read `audiences`, `cohorts`, `moments`, `domains`, `goals`, `getCohortsForAudience`, `getMomentsForAudience`
- Replace all hardcoded `audienceOptions`, `studentCohortOptions`, `employeeCohortOptions`, `alumniCohortOptions`, etc. with dynamic arrays from the vocabulary
- Map `IndustryAudience[]` → `{ value, label }[]` format the Select components expect
- Same for moments, domains, goals
- Remove the helper functions `getAudienceCategory()`, `getCohortOptions()`, `getMomentOptions()`, `getDomainOptions()`, `getGoalOptions()` — replaced by context methods

### 2. Refactor SelectionSummary to use industry vocabulary
`src/components/SelectionSummary.tsx` has hardcoded `audienceLabels` and `momentLabels` Record maps. Replace with a lookup into `useIndustry().audiences` and `useIndustry().moments` by id.

### 3. Wire industry labels into AppSidebar
`src/components/app-shell/AppSidebar.tsx` line 85 has `"Institution Settings"` hardcoded. Replace with `labels.organizationSettings` from `useIndustry()`. Also update the govern section label.

### 4. Wire industry labels into key settings/admin pages
- `UniversitySettingsPage.tsx`: Replace "University Settings" with `labels.organizationSettings`
- `UserDetailPage.tsx`: Replace "University Admin" / "University User" with `labels.organizationAdmin` / `labels.organizationUser`
- `ContentDNAPage.tsx`: Replace "Campus Photography" with `labels.photography`

### 5. Parameterize Edge Function prompts with industry context
The two most critical edge functions — `evaluate-message` and `generate-message` — have hardcoded "higher education" system prompts. Update them to:
- Accept an `industryContext` field in the request body (string from `vocabulary.labels.industryContext`)
- Accept a `contentStyle` field (from `vocabulary.labels.contentStyle`)
- Inject these into the system prompt dynamically, falling back to "higher education" if not provided
- Update the client-side call sites (`evaluateMessage.ts`, `BuildPage.tsx`) to pass `industryContext` and `contentStyle` from the vocabulary

### 6. Update playground-chat edge function
Same pattern: accept industry context in the request body, inject into the system prompt instead of hardcoding "higher education."

## Technical Details

**ContextSelector refactor pattern:**
```typescript
const { audiences, getCohortsForAudience, getMomentsForAudience, domains, goals } = useIndustry();
const audienceOptions = audiences.map(a => ({ value: a.id, label: a.label }));
const cohortOptions = context.audience 
  ? getCohortsForAudience(context.audience).map(c => ({ value: c.id, label: c.label }))
  : [];
```

**Edge function prompt injection pattern:**
```typescript
const { industryContext = 'higher education', contentStyle = 'institutional communications' } = await req.json();
const SYSTEM_PROMPT = `You are CampusVoice.AI, an AI-powered strategic messaging platform for ${industryContext}...`;
```

**Client-side payload addition:**
```typescript
const { labels } = useIndustry();
// Pass to edge function calls:
{ ...body, industryContext: labels.industryContext, contentStyle: labels.contentStyle }
```

## Files Changed (~12 files)

| File | Change