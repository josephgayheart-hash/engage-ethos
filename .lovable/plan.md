

## Prospect Mass Email Tool (Super Admin Only)

Build a dedicated mass email composer for CampusVoice prospects, restricted to the Super Admin section. Features three composition modes (Rich Text via TipTap, raw HTML with live preview, and Plain Text), prospect selection with filters, merge tags, and full send/open/click tracking.

---

### 1. Database Migration

Add tracking columns to the existing `outreach_history` table so webhook events can update delivery status:

```text
ALTER TABLE outreach_history
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'resend',
  ADD COLUMN IF NOT EXISTS provider_message_id TEXT,
  ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'sent',
  ADD COLUMN IF NOT EXISTS html_body TEXT,
  ADD COLUMN IF NOT EXISTS from_email TEXT,
  ADD COLUMN IF NOT EXISTS from_name TEXT,
  ADD COLUMN IF NOT EXISTS to_email TEXT,
  ADD COLUMN IF NOT EXISTS to_name TEXT,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_event_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS events JSONB DEFAULT '{}';
```

No new tables needed -- we extend the existing one.

---

### 2. Update Edge Function: `send-prospect-email`

- Accept optional `html_body` and `from_email` fields in the request.
- If `html_body` is provided, use it as the email body directly (for HTML-mode and Rich Text-mode sends). Otherwise fall back to converting plain text as it does today.
- Allow `from_email` to choose sender address (e.g. `sales@campusvoice.ai`, `noreply@campusvoice.ai`).
- Store `provider_message_id` (Resend's returned ID), `to_email`, `to_name`, `from_email`, `from_name`, `html_body`, and `delivery_status` in the `outreach_history` insert.
- Return the Resend message ID in the response.

---

### 3. Update Edge Function: `resend-webhook`

After the existing `email_nudges` lookup, add a fallback check against `outreach_history.provider_message_id`. If a match is found, update the same tracking fields (`delivery_status`, `opened_at`, `clicked_at`, `bounced_at`, `delivered_at`, `last_event_at`, `events`).

---

### 4. New Page: `src/pages/ProspectOutreachPage.tsx`

A two-panel layout with a send history section at the bottom:

**Left Panel -- Prospect Selector:**
- Fetch all `sales_prospects` on mount
- Search by name / university
- Filter by status (new, contacted, qualified, etc.)
- Select all / deselect all checkboxes
- Show selected count

**Right Panel -- Email Composer:**
- From name input (default: "Dan Simmons")
- From email dropdown: `noreply@campusvoice.ai`, `sales@campusvoice.ai`, `support@campusvoice.ai`
- Subject line input with character counter
- Three composition tabs:
  - **Rich Text** -- uses the existing `RichTextEditor` (TipTap) component
  - **HTML Code** -- a `textarea` for raw HTML alongside a live preview rendered in a sandboxed `iframe`
  - **Plain Text** -- a simple `textarea`
- Merge tag insert buttons: `{{first_name}}`, `{{university_name}}`, `{{contact_title}}`
- "Send to X prospects" button with a confirmation dialog
- On send: loops through selected prospects, calls `send-prospect-email` for each, replaces merge tags with prospect data

**Bottom Panel -- Send History:**
- Table of recent `outreach_history` entries with columns: Recipient, Subject, Sent At, Status (badge: Sent/Delivered/Opened/Clicked/Bounced)
- Aggregate stats bar: Total Sent, Delivered %, Opened %, Clicked %
- Auto-refreshes via polling or realtime subscription

---

### 5. Routing and Navigation (Super Admin Only)

**`src/App.tsx`:**
- Add `ProspectOutreachPage` import
- Add route `/admin/prospect-outreach` inside the existing `RequireSuperAdmin` route group (lines 188-196)

**`src/components/app-shell/AppSidebar.tsx`:**
- Add `{ title: "Prospect Outreach", url: "/admin/prospect-outreach", icon: Mail }` to the `superAdminItems` array
- Import `Mail` from lucide-react (already imported in other files)

---

### Files Changed Summary

| File | Change |
|------|--------|
| Database migration | Add tracking columns to `outreach_history` |
| `supabase/functions/send-prospect-email/index.ts` | Accept `html_body`, `from_email`; store tracking fields |
| `supabase/functions/resend-webhook/index.ts` | Also update `outreach_history` on webhook events |
| `src/pages/ProspectOutreachPage.tsx` | New page -- composer + prospect list + history |
| `src/App.tsx` | Add route in super admin section |
| `src/components/app-shell/AppSidebar.tsx` | Add nav link in super admin section |

