## Goal

Give the super admin a dedicated **Platform Operations** dashboard at `/platform` focused on running CampusVoice as a SaaS — not user productivity shortcuts. When a super admin lands on `/`, auto-redirect them to `/platform`. Regular users see today's home unchanged.

## What you'll see at `/platform`

**Header strip** — environment (Live/Preview), build status, last refresh, "Refresh all" button.

**KPI row** (top, dense)
- Total tenants · Active tenants (7d)
- Total users · Active users (7d / 30d)
- Signups last 7d (sparkline)
- Tool runs last 24h / 7d
- Open access requests · New beta feedback (badged)

**Platform Usage & Analytics** (primary panel for v1)
- DAU / WAU / MAU line chart (from `tool_usage_events`, excluding `EXCLUDED_USER_IDS`)
- Top 10 tools by runs (last 30d) — bar chart
- Tenants by activity (table: tenant, users, runs 7d, last activity, plan/type)
- New tenant & user signups over time (area chart, 30d)

**Access & Beta** (secondary cards, compact)
- Pending `onboarding_requests` (latest 5, click → existing admin onboarding page)
- Latest `beta_feedback` (5 newest with rating + status)

**System Health** (compact strip)
- Recent `security_events` (sev: warn/error count last 24h, link to existing SecurityEventsPage)
- Edge function error count last 24h (via `supabase analytics_query` on `function_edge_logs` where status_code >= 500)
- Auth failure count last 24h (via `auth_logs`)
- Last 10 logins across platform (`profiles.last_login_at`)

**Third-party analytics placeholder card** — empty state with "Connect analytics (Plausible / GA / PostHog)" CTA so you can drop in an embed/script later.

**Quick links rail** — to existing admin pages: Users, Onboarding, Institutions, Security Events, NDA Links, AI Tech, QA Diagnostics, Seed Data, CRM.

No "shortcuts to tools", no "resume work", no "drafts", no "library" — those stay on `/`.

## Routing & access

- New route `/platform` rendered inside `AppLayout` (so sidebar/topbar stay), guarded: only `isSuperAdmin` may view; others get redirect to `/`.
- In `src/pages/Index.tsx`, on mount: if `isSuperAdmin && !isImpersonating`, `<Navigate to="/platform" replace />`. During impersonation the super admin still sees the impersonated user's normal home (matches existing impersonation pattern).
- Add a "Platform Ops" entry to the super-admin section of `AppSidebar` so you can return to it.

## Data sources (read-only, RLS already permits super admin)

- `profiles` — counts, last_login_at, signup trend
- `tenants` — tenant list, types, created_at
- `tool_usage_events` — DAU/WAU/MAU, top tools, activity per tenant (filter out `EXCLUDED_USER_IDS`)
- `onboarding_requests` — pending access requests
- `beta_feedback` — latest feedback
- `security_events` — health
- `email_sends` (optional) — delivery health snapshot
- Supabase analytics (`function_edge_logs`, `auth_logs`) via a small `platform-health` edge function (service role) returning aggregated counts only — keeps creds server-side.

## Files

New
- `src/pages/admin/PlatformOpsPage.tsx` — page shell, layout, data orchestration
- `src/components/platform/PlatformKPIs.tsx`
- `src/components/platform/UsageAnalyticsPanel.tsx` (DAU/MAU + top tools + signups; recharts already in project)
- `src/components/platform/TenantActivityTable.tsx`
- `src/components/platform/AccessAndFeedbackPanel.tsx`
- `src/components/platform/SystemHealthStrip.tsx`
- `src/components/platform/AnalyticsEmbedCard.tsx` (placeholder)
- `src/hooks/usePlatformMetrics.ts` — single hook fanning out queries with React Query
- `supabase/functions/platform-health/index.ts` — aggregates edge/auth log counts (super-admin JWT check)

Edited
- `src/App.tsx` — register `/platform` route under `AppLayout`, super-admin guard
- `src/pages/Index.tsx` — redirect super admins to `/platform`
- `src/components/app-shell/AppSidebar.tsx` — add "Platform Ops" link in super-admin group

## Visual style

Follow existing dashboard tokens (cards, neutral surfaces, cyber-lime/purple accents, dense p-4/h-9), same chart patterns as `UniversityDashboardPage`. No new design system. Wave background reused.

## Out of scope (future)

- Embedding a real third-party analytics tool (just the placeholder card for now — tell me which provider when ready)
- Drill-down per tenant beyond linking to existing institution detail page
- Writeable actions (approve requests, resolve feedback) — those stay on existing admin pages and we link to them
