

# Session 3 Completion + Session 4: Settings Labels, Profile Wizard, Onboarding, Config Relevance

## Session 3 Remaining (1 item)
**UniversitySettingsPage.tsx** still has hardcoded "University Settings" in two places (lines 482, 540). Replace with dynamic label from `useIndustry()`.

## Session 4 Scope

### 1. ProfileSetupWizard industry adaptation
`ProfileSetupWizard.tsx` has a hardcoded `institutionTypeOptions` array (lines 351-406) with Carnegie Classifications + a few non-higher-ed types. Replace with dynamic `classificationOptions` from `useIndustry().vocabulary.classificationOptions`. Each industry vocabulary already defines these (e.g., enterprise has "Global Enterprise", "Mid-Market"; healthcare has "Hospital System", "Physician Group").

Also update hardcoded strings throughout the wizard:
- "Enter a .edu domain" → generic "Enter your website domain"
- "Institution Type" / "Institution Identity" → use `labels.organization` dynamically
- Quick Start helper text references ".edu" — make conditional on `isHigherEd`

### 2. OnboardingPage industry adaptation
`OnboardingPage.tsx` has a fully hardcoded higher-ed department list (lines 23-104) with types like "Enrollment Management", "Registrar", "Student Success". Replace with `useIndustry().departments` which each industry vocabulary already defines.

Also update:
- Department icon mapping → use `resolveIcon()` utility
- "Welcome to CampusVoice" header → keep brand name but adjust subtitle
- Audience/moment badges in the selected department card → use dynamic vocabulary IDs

### 3. SubUnitSetupWizard industry adaptation
`SubUnitSetupWizard.tsx` has hardcoded `SUB_UNIT_TYPES` (line 52-58) with "College", "Division", "Unit", "Department". Replace labels with industry-appropriate terms using `useIndustry().labels.subUnit` and vocabulary data.

### 4. InstitutionalConfig field relevance filtering
`InstitutionalConfig.tsx` renders all config tabs (Identity, Systems, Locations, People, CTAs, Terms, Style, Content DNA) regardless of industry. Each vocabulary defines `relevantConfigFields[]`. Use this to:
- Hide irrelevant tabs entirely (e.g., "Terms" tab with academic calendar fields for enterprise)
- Or show a reduced set of fields within tabs

### 5. PROFILE_TYPE_LABELS in UniversitySettingsPage
Lines 76-82 hardcode "University", "College", "Division", "Unit", "Department". Make dynamic based on industry vocabulary labels.

## Technical Details

**ProfileSetupWizard classification swap:**
```typescript
const { vocabulary } = useIndustry();
const institutionTypeOptions = vocabulary.classificationOptions.map(opt => ({
  value: opt.value as InstitutionType,
  label: opt.label,
  description: opt.description,
  icon: resolveIcon(/* derive from value */),
}));
```

**OnboardingPage department swap:**
```typescript
const { departments } = useIndustry();
// departments already has { id, label, description }
```

**InstitutionalConfig relevance pattern:**
```typescript
const { vocabulary } = useIndustry();
const relevant = new Set(vocabulary.relevantConfigFields);
// Conditionally render fields: {relevant.has('mascot') && renderTextField(...)}
```

## Files Changed (~7 files)

| File | Change |
|------|--------|
| `src/pages/UniversitySettingsPage.tsx` | Session 3 fix: dynamic labels + dynamic PROFILE_TYPE_LABELS |
| `src/components/ProfileSetupWizard.tsx` | Dynamic classification options, industry-aware wizard text |
| `src/pages/OnboardingPage.tsx` | Dynamic departments from `useIndustry()` |
| `src/components/SubUnitSetupWizard.tsx` | Dynamic sub-unit type labels |
| `src/components/InstitutionalConfig.tsx` | Field relevance filtering via `relevantConfigFields` |
| `src/types/campusvoice.ts` | Widen `InstitutionType` to `string` for dynamic classification values |
| `src/types/industry.ts` | Add `icon` field to department type if missing |

## What This Does NOT Cover (Session 5+)
- Playbook Kit industry-specific seeding and DB content
- `parse-story` edge function industry-aware prompts
- Landing page / marketing page industry adaptation
- CRM page terminology updates

