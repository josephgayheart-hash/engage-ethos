

# Micro CRM for CampusVoice

## Overview
Build a lightweight CRM page as a new super admin feature that gives you a unified view of all contacts, their details, notes/activity timeline, email history, and whether they've signed up for the app.

## What You'll Get

1. **Contact Detail Panel** -- Click any prospect to see a full profile view with all their info (name, email, title, phone, LinkedIn, university, brand launch date, notes) plus inline editing.

2. **Notes & Activity Timeline** -- A new `crm_notes` database table to store timestamped notes per prospect. The UI shows a chronological timeline mixing your manual notes with email outreach history (sent, opened, clicked, bounced).

3. **App Signup Detection** -- Cross-references each prospect's email against the `profiles` table to show if they've created an account, when they last logged in, and their current status. A badge on each contact row shows "Signed Up", "Active", or "Not Yet".

4. **Contacts Table View** -- A searchable, filterable table of all prospects with columns for name, university, email, status, last contacted date, email count, and app signup status. Sortable and with quick-action buttons.

5. **Sidebar Navigation** -- Add "CRM" link to the super admin nav section.

## New Database Table

**`crm_notes`** -- stores notes attached to prospects:
- `id` (uuid, PK)
- `prospect_id` (uuid, FK to sales_prospects)
- `created_by_user_id` (uuid)
- `note_text` (text)
- `note_type` (text, default 'general' -- e.g. general, call, meeting, follow-up)
- `created_at` (timestamptz)

RLS: super admins only (matching `sales_prospects` pattern).

## New Page & Route

**`src/pages/CRMPage.tsx`** -- The main CRM interface with:
- Left side: filterable contacts table with search, status filter, signup status filter
- Right side (or expandable drawer): contact detail + notes timeline + email history

**Route**: `/admin/crm` under the existing `RequireSuperAdmin` wrapper.

## Technical Details

### Files to Create
- `src/pages/CRMPage.tsx` -- Main CRM page with contacts table, detail panel, notes management
- Database migration for `crm_notes` table

### Files to Modify
- `src/components/app-shell/AppSidebar.tsx` -- Add CRM nav item to `superAdminItems`
- `src/App.tsx` -- Add route for `/admin/crm` under super admin routes

### Data Queries
- **Contacts**: Query `sales_prospects` with all columns
- **Email history**: Query `outreach_history` filtered by `prospect_id`
- **App signup check**: Query `profiles` table matching `email` against prospect's `contact_email`, pull status and last sign-in
- **Notes**: Query `crm_notes` by `prospect_id`, ordered by `created_at` desc

### Contact Detail Panel Features
- Inline-editable fields (name, email, title, phone, LinkedIn, notes, status)
- "App Status" section showing if matched to a profile, with link to user detail page if found
- Activity timeline merging notes + outreach history chronologically
- Quick "Add Note" form with note type selector
- Quick "Send Email" button that links to the outreach page pre-filtered

### Contacts Table Columns
- Name / Title
- University
- Email
- Status (new, contacted, qualified, demo_scheduled, closed)
- Emails Sent (count from outreach_history)
- Last Contacted (most recent outreach date)
- App Status (badge: Not Yet / Signed Up / Active)
- Actions (view detail, quick note)

