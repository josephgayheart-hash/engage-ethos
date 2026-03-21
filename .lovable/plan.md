
# Industry Verticalization — Session Progress

## Completed Sessions

### Session 1-2: Core Infrastructure
- Expanded `tenant_type` enum, created 6 industry vocabulary configs
- Built `IndustryProvider` / `useIndustry()` context
- Refactored `ContextSelector` and `SelectionSummary` to use dynamic vocabulary
- Parameterized edge function prompts (`evaluate-message`, `generate-message`, `playground-chat`)
- Updated `AppSidebar` labels

### Session 3: Story Bank, Build/Strategy/Evaluate Wiring, Admin Labels
- Made Story Bank fully industry-aware (dynamic types, icons, filters)
- Wired `industryContext`/`contentStyle` into BuildPage, StrategyPage, EvaluatePage, CallScriptPage, PlaygroundPage
- Created shared `iconResolver.ts` utility
- Updated admin page labels (ContentDNAPage photography label)

### Session 4: Settings, Onboarding, Config Relevance
- Dynamic `PROFILE_TYPE_LABELS` and page titles in UniversitySettingsPage
- ProfileSetupWizard uses dynamic `classificationOptions` from vocabulary
- OnboardingPage uses `useIndustry().departments` instead of hardcoded list
- SubUnitSetupWizard uses dynamic unit type labels
- InstitutionalConfig hides irrelevant tabs via `relevantConfigFields`
- Widened `InstitutionType` and `Department` types to `string`

### Session 5: Playbook Kits, parse-story, QuickAddTerms
- Seeded 12 industry-specific playbook kits (Enterprise: 3, Nonprofit: 3, Healthcare: 2, Financial: 2, Franchise: 2)
- Made `parse-story` edge function industry-aware (accepts `industryContext`, `contentStyle`, `storyTypes`)
- Updated `useStoryBank.ts` to pass industry params to both `parseStoryFromText` and `scrapeAndParseStory`
- QuickAddTerms: No change needed — Terms tab already hidden for non-higher-ed via `relevantConfigFields`

## Remaining Items (Future Sessions)
- Landing page / marketing page industry adaptation
- CRM page is super-admin internal tooling (not user-facing industry adaptation) — low priority
- Playbook Kit filtering by tenant_type in `usePlaybookKits` hook (currently filters by institution_type from profile)
- Industry-specific seed data for fact book categories
