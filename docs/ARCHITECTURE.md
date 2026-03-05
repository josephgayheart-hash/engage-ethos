# CampusVoice — Architecture

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Lovable Cloud) — Postgres, Auth, Edge Functions, Storage
- **State:** React Query (provider only — hooks use direct Supabase calls), React Context (`AuthContext`)
- **Routing:** React Router v6

## Directory Layout

```
src/
├── assets/              # Static images imported as ES modules
├── components/
│   ├── ui/              # shadcn/ui primitives (button, dialog, toast…)
│   ├── app-shell/       # AppLayout, AppSidebar, AppTopBar
│   ├── admin/           # Super-admin dashboard & analytics
│   ├── analyzer/        # Web content analyzer panels
│   ├── audit/           # Brand audit components
│   ├── dashboard/       # Dashboard widgets (hero, quick-actions, recent messages…)
│   ├── dna/             # Content DNA tabs (fact book, story bank, photography…)
│   ├── image-generator/ # Brand overlay editor & channel mockups
│   ├── landing/         # Marketing landing page sections
│   ├── library/         # Message & template library (cards, dialogs, viewers)
│   ├── playground/      # AI playground chat interface
│   └── university/      # Institution dashboard panels
├── contexts/            # AuthContext (user, tenant, roles)
├── hooks/               # Custom hooks — data fetching, tracking, config
├── integrations/
│   └── supabase/        # Auto-generated client.ts & types.ts (DO NOT EDIT)
├── lib/                 # Utilities (PDF export, reading level, CRM, etc.)
├── pages/               # Route-level components
│   ├── admin/           # Admin console, users, QA, seed, security
│   ├── agency/          # Agency dashboard, clients, analytics
│   └── features/        # Feature marketing pages
├── types/               # Shared TypeScript interfaces
supabase/
├── config.toml          # Auto-managed Supabase config (DO NOT EDIT)
├── functions/           # Edge Functions (AI generation, email, scraping…)
│   └── _shared/         # Shared utilities (rate limiting)
public/                  # Static assets served at root (logos, OG image, robots.txt)
```

## Key Patterns

### Authentication & Authorization

- `AuthContext` wraps the app; exposes `user`, `profile`, `tenant`, `isAdmin`, `isSuperAdmin`, `isApprover`.
- Roles stored in `user_roles` table (enum: `admin`, `user`, `super_admin`, `agency_admin`, `agency_user`, `approver`).
- Route guards: `RequireAuth`, `RequireAdmin`, `RequireSuperAdmin`, `RequireApprover` in `App.tsx`.
- RLS policies on all tables enforce tenant isolation via `get_user_tenant_id()`.

### Multi-Tenancy

- Every data table has a `tenant_id` column.
- `profiles.tenant_id` links users to their institution.
- `institutional_profiles` supports hierarchical sub-units (parent → child profiles).

### Data Fetching

- Hooks use the Supabase JS client directly (`supabase.from(…).select(…)`).
- Error handling via `useToast()` — destructive variant for errors.
- No React Query `useQuery`/`useMutation` wrappers yet; `QueryClientProvider` is mounted for future use.

### Edge Functions

- Located in `supabase/functions/`.
- Called via `supabase.functions.invoke()` or direct `fetch()` to the Supabase URL.
- AI calls use the `LOVABLE_API_KEY` secret to proxy through Lovable AI models.

### Routing

- Public routes (landing, login, feature pages) render without the sidebar.
- Authenticated routes are wrapped in `<AppLayout>` which provides sidebar + top bar.
- Nested admin/super-admin routes use `<Outlet>` for layout composition.
