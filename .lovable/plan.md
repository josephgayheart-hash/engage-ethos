
# Industry Verticalization — Complete

## All Sessions Complete

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
- Made `parse-story` edge function industry-aware
- Updated `useStoryBank.ts` to pass industry params to parse-story calls

### Session 5b: Playbook Kit Filtering, Landing Page, Fact Book Categories
- `usePlaybookKits` now filters by `tenantType` from `useIndustry()`
- Landing page: broadened hero rotation ("Audience Growth" not "Enrollment Growth", "Brand Teams" not "Educators"), updated SEO meta/schema, renamed "University Library" → "Content Library"
- Fact Book: created 7 industry-specific category sets (higher-ed, enterprise, nonprofit, healthcare, financial, franchise) with `getFactCategoriesForTenant()` utility
- FactBookTab dynamically resolves categories based on active tenant type

## How to Add a New Industry
1. Add type to `TenantType` union in `src/types/industry.ts`
2. Create vocabulary file in `src/config/industry-vocabularies/`
3. Register in `src/config/industry-vocabularies/index.ts`
4. Add fact categories in `src/hooks/useFactBook.ts` `CATEGORY_REGISTRY`
5. Run DB migration: `ALTER TYPE public.tenant_type ADD VALUE 'new-type';`
6. Optionally seed playbook kits for the new industry
