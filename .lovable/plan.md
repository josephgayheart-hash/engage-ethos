

# Library Production-Ready Implementation Plan

## Overview
This plan addresses two combined objectives: (1) closing the feature gaps identified in the library (tagging, real usage tracking, robust metadata), and (2) making both libraries fully production-ready with proper database persistence, tenant isolation, and agency terminology support.

---

## Phase 1: Database Schema Enhancements

### 1a. Add missing columns to `shared_templates`
- Add `institutional_profile_id` (uuid, nullable) for profile association
- Add `college_name` and `department_name` (text, nullable) for organizational context
- Add `change_history` (jsonb, default `'[]'`) for version tracking
- Add `created_by_name` (text, nullable) for creator attribution display
- Add `source` (text, nullable) for tracking origin (builder, journey, etc.)
- Add `tags` (text array, nullable) for free-form labeling/tagging

### 1b. Add missing columns to `personal_messages`
- Add `tags` (text array, nullable) for free-form labels
- Add `channels` (text array, nullable) for multi-channel messages
- Add `channel_drafts` (jsonb, nullable) for per-channel content
- Add `cohort` (jsonb, nullable) for cohort context
- Add `source` (text, nullable) -- already in metadata, but explicit column is cleaner
- Add `versions` (jsonb, default `'[]'`) for version history
- Add `submitted_to_library` (boolean, default false)
- Add `submitted_at` (timestamptz, nullable)
- Add `created_by_name` (text, nullable) for attribution
- Add `remixed_from` (jsonb, nullable) for remix tracking

### 1c. Create `library_usage_events` table (replaces mocked analytics)
- `id` (uuid, PK)
- `tenant_id` (uuid, not null)
- `user_id` (uuid, not null)
- `template_id` (uuid, nullable) -- for shared templates
- `message_id` (uuid, nullable) -- for personal messages
- `action` (text: 'view', 'copy', 'remix', 'export', 'pull')
- `metadata` (jsonb)
- `created_at` (timestamptz)
- RLS: users can insert their own; admins can view tenant-wide; super admins can view all

---

## Phase 2: Rewrite `useSharedLibrary` Hook (Database-First)

Replace the current localStorage-based implementation with full database persistence:

- **Load**: Query `shared_templates` table filtered by `tenant_id = get_user_tenant_id(auth.uid())`
- **Add**: Insert into `shared_templates` with `tenant_id`, `created_by_user_id`, and `created_by_name` from auth context
- **Update status**: Update record in DB (admin/approver only, enforced by RLS)
- **Delete**: Delete from DB (admin only, enforced by RLS)
- **Filter**: All filtering happens client-side on the fetched dataset (same logic, just sourced from DB)
- **Remove**: All `localStorage` references for `persist_shared_library`
- **Remove**: Hardcoded `DEFAULT_TEMPLATES` array (seed data should come from DB if needed)

---

## Phase 3: Rewrite `useMessageLibrary` Hook (Database-First)

Replace the localStorage-primary approach with database as source of truth:

- **Load**: Query `personal_messages` filtered by `user_id = auth.uid()`
- **Add**: Insert into `personal_messages` with all fields including `versions`, `tags`, `created_by_name`
- **Update**: Update record in DB
- **Delete**: Delete from DB
- **Duplicate**: Insert a new record cloned from original
- **Export**: Read from state (already loaded from DB)
- **Remove**: `STORAGE_KEY` and `SYNCED_DB_MESSAGES_KEY` localStorage logic
- **Remove**: The sync-from-DB-to-localStorage bridge pattern

---

## Phase 4: Agency Terminology in Shared Library

Update `SharedLibrary.tsx` to use `useAgencyMode()`:

- Page title: "University Library" becomes dynamic (`isAgency ? 'Template Library' : 'University Library'`)
- Breadcrumb text adapts
- "Submit to University Library" button label adapts
- Admin review panel labels adapt
- Empty state messaging adapts

---

## Phase 5: Tagging System

Add a free-form tagging UI to both libraries:

- **Tag input component**: Inline chip-style input allowing users to add/remove tags when saving or editing messages/templates
- **Filter by tag**: Add a tag filter dropdown to both library pages, populated from existing tags in the dataset
- **Display**: Show tags as colored badges on library cards and list rows
- **Persistence**: Tags stored as text arrays in both `personal_messages.tags` and `shared_templates.tags`

---

## Phase 6: Real Usage Tracking

Replace mocked analytics in `TemplateDetailPage.tsx`:

- When a user views, copies, remixes, or exports a template/message, insert a record into `library_usage_events`
- On the template detail page, query `library_usage_events` for that template to show real usage history (who used it, when, what action)
- Display usage count on library cards

---

## Phase 7: Enhanced Author & Notes Metadata

Ensure complete author information flows through:

- On save (both personal and shared), capture `created_by_name` from the user's profile (`profile.first_name + ' ' + profile.last_name`)
- Display creator name prominently in card view, list view, and detail pages
- Notes field is editable on detail pages and persisted to DB

---

## Files to Create or Modify

| File | Action |
|------|--------|
| Migration SQL | Create -- schema changes for all three tables |
| `src/hooks/useSharedLibrary.ts` | Rewrite -- database-first with tenant isolation |
| `src/hooks/useMessageLibrary.ts` | Rewrite -- database-first, remove localStorage |
| `src/pages/SharedLibrary.tsx` | Modify -- agency mode labels, tag filter, usage counts |
| `src/pages/PersonalLibrary.tsx` | Modify -- tag display, tag filter |
| `src/pages/TemplateDetailPage.tsx` | Modify -- real usage tracking, tag display |
| `src/pages/MessageDetailPage.tsx` | Modify -- tag editing, usage tracking |
| `src/components/library/TagInput.tsx` | Create -- reusable tag input component |
| `src/hooks/useLibraryUsageTracking.ts` | Create -- hook for recording and querying usage events |

---

## Security Considerations

- All existing RLS policies on `shared_templates` and `personal_messages` already enforce tenant isolation -- no changes needed
- New `library_usage_events` table gets tenant-scoped RLS
- Agency partners see only their own tenant's library content (same RLS, different label)
- Super admins retain cross-tenant visibility per existing policies

