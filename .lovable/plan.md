

# NDA Links — Super Admin Feature

## Overview
A complete NDA signing workflow: Super Admins create unique links, recipients sign a friendly confidentiality agreement on a public page, all responses are stored and viewable in the admin panel.

## Database

### Table: `nda_links`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| slug | text UNIQUE | crypto-random, used in public URL |
| label | text NOT NULL | link name |
| recipient_name | text | optional |
| recipient_email | text | optional |
| organization | text | optional |
| redirect_url | text | optional, post-sign redirect |
| expires_at | timestamptz | optional |
| is_active | boolean DEFAULT true | |
| is_one_time | boolean DEFAULT true | |
| agreement_version | text DEFAULT '1.0' | |
| notes | text | |
| created_by | uuid | auth.uid() of super admin |
| created_at | timestamptz DEFAULT now() | |
| status | text DEFAULT 'active' | active/signed/revoked/expired |

### Table: `nda_responses`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| nda_link_id | uuid FK → nda_links | |
| signer_name | text NOT NULL | |
| signer_email | text NOT NULL | |
| signer_organization | text | |
| signer_title | text | |
| typed_signature | text NOT NULL | |
| drawn_signature_url | text | stored in storage bucket |
| agreement_text | text NOT NULL | exact text at signing |
| agreement_version | text | |
| submitted_at | timestamptz DEFAULT now() | |
| user_agent | text | |
| timezone | text | |
| redirect_url | text | |
| public_slug | text | |
| status | text DEFAULT 'signed' | |

### RLS Policies
- **nda_links**: Super admins full CRUD; public anonymous SELECT by slug (for the signing page) restricted to active links only
- **nda_responses**: Super admins SELECT/INSERT; anonymous INSERT (for public signing); no UPDATE/DELETE by non-super-admins

### Storage
- New `nda-signatures` bucket (public) for drawn signature images

## Routes

| Route | Access | Component |
|-------|--------|-----------|
| `/admin/nda-links` | Super Admin | `NDALinksPage` |
| `/nda/sign/:slug` | Public | `NDASignPage` |

## Frontend Components

### 1. `src/pages/admin/NDALinksPage.tsx`
Two-tab layout:
- **Links tab**: Table of all NDA links with status badges, copy-link button, create/revoke actions. "Create NDA Link" dialog with all fields (label, recipient info, redirect URL, expiration date picker, one-time toggle, notes).
- **Responses tab**: Searchable/filterable table of all signed responses. Click row → detail drawer showing full response, agreement text, typed signature, drawn signature preview, metadata. CSV export button.

### 2. `src/pages/NDASignPage.tsx` (Public)
- CampusVoice logo at top
- Wave emoji heading: "Hey, I can't wait to show you what I've built."
- Subtext as specified
- Agreement text in a styled scrollable card
- Form: name, email, org, title, typed signature, drawn signature canvas (optional)
- Three required checkboxes
- Submit → success screen with countdown redirect (if redirect URL exists)
- Expired/revoked/already-signed states show friendly messages

### 3. `src/components/admin/nda/` folder
- `CreateNDALinkDialog.tsx` — form dialog for creating/editing links
- `NDAResponseDetailDrawer.tsx` — sheet/drawer showing full signed response
- `NDALinksTable.tsx` — admin table component
- `NDAResponsesTable.tsx` — responses table with search/filter

### 4. Signature pad
Use a simple HTML5 canvas for drawn signatures. On submit, convert to PNG data URL, upload to `nda-signatures` storage bucket, store the URL.

## Sidebar Navigation
Add to `superAdminItems` in `AppSidebar.tsx`:
```
{ title: "NDA Links", url: "/admin/nda-links", icon: FileSignature }
```

## App Router
Add to Super Admin route group in `App.tsx`:
```
<Route path="/admin/nda-links" element={<NDALinksPage />} />
```
Add public route (no auth):
```
<Route path="/nda/sign/:slug" element={<NDASignPage />} />
```

## Key Implementation Details

- **Slug generation**: `crypto.randomUUID().slice(0,12)` for clean short slugs
- **Public URL format**: `{window.location.origin}/nda/sign/{slug}`
- **Anonymous access**: The public signing page queries `nda_links` by slug (RLS allows anon SELECT on active links) and inserts into `nda_responses` (RLS allows anon INSERT)
- **Status logic**: On response submission, if `is_one_time` is true, update link status to `signed` and set `signed_at`
- **Expiration check**: Client-side and RLS-level check — expired links show friendly "This link has expired" message
- **Agreement text**: Stored as a constant in the signing page component, snapshot saved verbatim into `nda_responses.agreement_text` at signing time
- **CSV export**: Client-side generation from the responses data, downloadable as `.csv`
- **Drawn signature**: Optional canvas, saved as base64 PNG → uploaded to storage bucket

## What stays unchanged
- All existing admin panels, workflows, and navigation
- No changes to existing tables or auth flow

