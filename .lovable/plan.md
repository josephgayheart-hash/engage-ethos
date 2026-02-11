

# Dashboard Redesign: Communications Command Center

## Overview

Transform the current dashboard from a product-tour layout (numbered workflow steps, tool grids, library previews) into a focused workspace where users land on their active work. University admins get an inline team overview panel.

## Current State

The dashboard today has:
- A hero section with personalized stats (good -- keep this)
- A 4-column "Your Workflow" grid with numbered steps (remove -- redundant with nav)
- My Drafts card (good -- promote this)
- My Library / University Library previews (condense)
- "More Tools" grid (move to dedicated page)
- "Utility Tools" grid (move to dedicated page)
- Research Foundation section (move to dedicated page)
- Full footer with tool links (simplify)

## What Changes

### New Dashboard Layout (Index.tsx rewrite)

```text
+----------------------------------------------+
| Header (unchanged)                           |
+----------------------------------------------+
| DashboardHero (simplified, keep as-is)       |
+----------------------------------------------+
| ResumeWorkCard (already implemented)         |
+----------------------------------------------+
|                                              |
|  [My Drafts -- full width, promoted]         |
|                                              |
+----------------------+-----------------------+
| Recent Messages      | Content DNA Status    |
| (table, last 10)     | (compact health card) |
| with inline actions  |                       |
+----------------------+-----------------------+
|                                              |
| [Admin Only: Team Quick View]                |
| Inline KPIs + compact user list + adoption   |
|                                              |
+----------------------------------------------+
| Quick Links: Build | Evaluate | Strategy |   |
| Library | DNA Studio | All Tools -->         |
+----------------------------------------------+
```

### New /tools Page

All secondary/utility tools move here in a clean grid:
- Campaign Dashboard, Communication Calendar, Subject Line Optimizer
- Accessibility Checker, Content DNA Scorer, Email Preview
- Performance Benchmarks, Translation Tool, Call Scripts
- Copywriter/Playground, BYOC Import, Web Content Analyzer

### University Admin Inline Panel

For admins (`isAdmin && !isSuperAdmin`), a collapsible section appears below the main content showing:
- 4 compact KPI cards (Total Users, Active 7d, Adoption Rate, DNA Completeness)
- Top 5 users by recent login with status badges
- Link to full Institution Dashboard for deeper dive

This reuses data from `useUserDashboardContext` (which already fetches institutional stats) plus a lightweight query for the user list.

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/ToolsPage.tsx` | Grid page for all secondary/utility tools |
| `src/components/dashboard/RecentMessagesPanel.tsx` | Table of recent messages with channel, profile, date, and quick actions |
| `src/components/dashboard/ContentDNAStatusCard.tsx` | Compact DNA health indicator showing completeness and active profiles |
| `src/components/dashboard/AdminTeamOverview.tsx` | Inline admin panel with KPIs, compact user list, adoption rate |
| `src/components/dashboard/QuickLaunchBar.tsx` | Horizontal bar of quick-access tool links at bottom of dashboard |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Major rewrite -- remove workflow grid, More Tools, Utility Tools, Research Foundation. Replace with new layout: Hero -> ResumeWork -> Drafts -> Recent Messages + DNA Status -> Admin Panel -> Quick Launch |
| `src/components/Header.tsx` | Add "Tools" link in non-super-admin nav (between Strategy and Libraries) |
| `src/App.tsx` | Add `/tools` route pointing to ToolsPage |

## Files Unchanged
- `src/components/dashboard/DashboardHero.tsx` -- stays as-is
- `src/components/dashboard/WorkflowHero.tsx` -- stays as-is
- `src/components/dashboard/OnboardingHero.tsx` -- stays as-is
- `src/components/MyDraftsCard.tsx` -- reused, just repositioned
- `src/components/NextStepsBar.tsx` -- already implemented
- `src/components/dashboard/ResumeWorkCard.tsx` -- already implemented
- `src/hooks/useUserDashboardContext.ts` -- reused for stats
- All existing tool pages -- no changes

## Technical Details

### RecentMessagesPanel
- Queries `personal_messages` table for current user's tenant (limit 10, ordered by `created_at desc`)
- Shows title, channel icon, profile name, date, mode badge
- Each row links to `/library` message detail
- "View All" links to `/library`

### ContentDNAStatusCard
- Uses existing `content_dna_analysis` query (already in Index.tsx)
- Shows active/inactive badge, profile count with DNA, last analyzed date
- Links to `/admin/content-dna`

### AdminTeamOverview
- Only renders when `isAdmin && !isSuperAdmin`
- Reuses `institutionalStats` from `useUserDashboardContext` for KPIs
- Adds a lightweight `profiles` query (limit 5, ordered by `last_login_at`) for the compact user list
- "View Full Dashboard" links to `/university-dashboard`

### ToolsPage
- Simple grid layout with all tools currently on the dashboard
- Categorized into sections: Core Tools, Analysis Tools, Utility Tools
- Each tool card links to its existing route

### Header Navigation Update
For non-super-admin users, nav becomes:
- Home | Build | Strategy | Libraries (dropdown) | Tools (new) | Admin (dropdown)

## Implementation Phases

1. Create `ToolsPage.tsx` and add route + nav link
2. Create the 4 new dashboard components (RecentMessagesPanel, ContentDNAStatusCard, AdminTeamOverview, QuickLaunchBar)
3. Rewrite `Index.tsx` with new layout
4. Verify everything connects end-to-end

## Design Principles
- No marketing copy on the dashboard -- users are already sold, they need to work
- Every element is actionable -- no decorative cards, everything links to real content
- Data-forward -- show actual messages, actual scores, actual activity
- Compact density -- more information in less scroll
- The dashboard is gravity -- all paths pull back to it

