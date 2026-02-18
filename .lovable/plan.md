

# Sidebar Navigation Overhaul

## Overview
Replace the top-header navigation on all authenticated pages with a persistent, collapsible left sidebar using existing Shadcn Sidebar primitives. Public/marketing pages remain unchanged.

## What Changes

### New files to create (in `src/components/app-shell/`)

**1. AppSidebar.tsx** -- The main sidebar component with these sections:
- **Header**: CampusVoice logo (icon-only when collapsed, full wordmark when expanded)
- **Main**: Dashboard, Message Builder, Journey Designer, Evaluator, Tools
- **Libraries**: My Library, University Library (swaps to "Templates" in agency mode), My Drafts
- **Create**: AI Copywriter, Image Studio, Brand Studio
- **Approvals** (visible only to approvers)
- **Admin** (visible only to admins): Admin Console, Content DNA Studio, University Settings (label adapts for agency), Brand Audit; agency mode adds Analytics
- **Super Admin** (visible only to super admins): Super Admin Panel, Admin Users, QA Diagnostics, Seed Data, Security Events
- **Footer**: User avatar, name, email in a dropdown with Profile, Invite a Colleague, Sign Out

**2. AppTopBar.tsx** -- A slim `h-12` sticky header containing:
- SidebarTrigger (hamburger)
- Vertical separator
- Tenant logo + institution name
- Agency badge (if agency mode)
- BetaBanner (badge variant)

**3. AppLayout.tsx** -- Layout wrapper that composes:
- `SidebarProvider` wrapping a flex container
- `AppSidebar` on the left
- Right column with `AppTopBar` + `ImpersonationBanner` + `<Outlet />` for child routes

### Route restructuring (App.tsx)
- Create a parent layout route using `AppLayout` that wraps all authenticated routes via `<Outlet />`
- Public routes (landing, login, features, request-access, onboarding, agency public pages, change-password, setup, og-preview, feedback) remain outside the layout wrapper
- `RequireAuth`, `RequireAdmin`, `RequireSuperAdmin`, `RequireApprover` wrappers continue to work as nested route elements

### Page cleanup (30+ files)
- Remove `<Header />` import and JSX from every authenticated page: Index, BuildPage, EvaluatePage, StrategyPage, PersonalLibrary, SharedLibrary, ToolsPage, PlaygroundPage, CallScriptPage, BYOCPage, ImageGeneratorPage, CampaignDashboard, TranslationTool, AccessibilityChecker, BrandVoiceScorer, AdminPanel, UniversitySettingsPage, CollectionDetailPage, BrandAuditPage, ApprovalsPage, EmailPreview, PerformanceBenchmarks, CommunicationCalendar, SubjectLineOptimizer, MessageDetailPage, TemplateDetailPage, UniversityDashboardPage, WebContentAnalyzerPage, ProfilePage, ChangePasswordPage (only if auth'd), BrandStudioPage, all admin/* pages, all agency/* authenticated pages
- Simplify outermost `div` wrappers since the layout now provides `min-h-screen`
- `<Header />` stays only on public/marketing pages (LandingPage, feature pages, etc.)

## What Stays the Same
- No new dependencies -- uses existing Shadcn Sidebar primitives
- No database changes
- All existing hooks (`useAgencyMode`, `useAuth`) used as-is
- Mobile: sidebar becomes overlay sheet automatically (built into Shadcn Sidebar)
- Public pages completely untouched

## Technical Details

### AppLayout route structure (App.tsx sketch)
```text
<Route element={<RequireAuth><AppLayout /></RequireAuth>}>
  <Route path="/dashboard" element={<Index />} />
  <Route path="/build"     element={<BuildPage />} />
  ...
  <Route element={<RequireAdmin>< Outlet /></RequireAdmin>}>
    <Route path="/admin/console" element={<AdminConsolePage />} />
    ...
  </Route>
  <Route element={<RequireSuperAdmin><Outlet /></RequireSuperAdmin>}>
    <Route path="/admin/panel" element={<AdminPanel />} />
    ...
  </Route>
</Route>
```

### Sidebar collapsible behavior
- Uses `collapsible="icon"` on the `<Sidebar>` component so it shrinks to icons-only (3rem wide) when collapsed
- `NavLink` with `activeClassName` highlights the current route
- Groups use `SidebarGroup` / `SidebarGroupLabel` for visual separation

### Page cleanup pattern (repeated ~30 times)
```text
Before:
  <div className="min-h-screen bg-background">
    <Header />
    <main>...</main>
  </div>

After:
  <div className="bg-background">
    <main>...</main>
  </div>
```

### Estimated scope
- 3 new files created
- ~1 file restructured (App.tsx)
- ~30+ files with minor Header removal edits

