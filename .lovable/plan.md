

## Enhance Institution Management and Content DNA Dashboard Cards

### 1. Institution Management Card -- Branding and Logo

**Current state:** Plain card with Building2 icon, institution name, sub-unit/profile counts, and Manage/Team buttons.

**Enhancements:**
- Display the institution's **logo** (from `tenant.logo_url`) as an avatar/image next to or above the institution name, with a fallback to a Building2 icon if no logo is set
- Add a **brand color accent strip** at the top of the card using `tenant.primary_color` (similar to the QuickActionsPanel gradient strips)
- Show a small **color swatch row** displaying the primary and accent colors from the tenant record, giving a visual brand identity hint
- Display the institution name with slightly more prominence (larger font, styled with the primary color)

**Data source:** `tenant` object from `useAuth()` already contains `logo_url`, `primary_color`, and `accent_color` -- no new queries needed.

---

### 2. Content DNA Status Card -- Richer Metadata

**Current state:** Shows active/total profile counts and last analyzed date.

**Enhancements:**
- Fetch additional fields from `content_dna_analysis`: `sample_count`, `voice_analysis` (to extract `overallTone`), `brand_platform` (to extract pillar count), `custom_instructions` (to show presence), and `profile_id` (to join with profile names)
- Display a **voice tone summary** line (e.g., "Tone: Warm, authoritative, and approachable") extracted from the voice_analysis JSON
- Show **sample count** (e.g., "12 content samples analyzed")
- Show **brand platform status** -- whether pillars have been extracted (e.g., "3 Brand Pillars defined")
- Show **custom instructions** indicator -- a small badge if custom instructions are configured
- Join with `institutional_profiles` to show **which profiles** have DNA configured (e.g., list profile names with checkmarks)
- Keep the existing Active badge, last analyzed date, and Manage DNA Studio button

**Data source:** Expand the existing Supabase query in ContentDNAStatusCard to include `sample_count`, `voice_analysis`, `brand_platform`, `custom_instructions`, and join profile names.

---

### Technical Details

**Files to modify:**
- `src/components/dashboard/InstitutionManagementCard.tsx` -- add logo rendering, brand color accent, color swatches
- `src/components/dashboard/ContentDNAStatusCard.tsx` -- expand query, parse JSON fields, render additional metadata rows

**No new dependencies or database changes required.** All data is already available in existing tables and the auth context.
