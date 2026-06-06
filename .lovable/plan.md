## What we're building

A new lightweight user type that only ever sees one feature: **Voice Studio** (the renamed Personal AI tool). They sign in, run a one-time setup wizard, and the rest of the app stays invisible to them.

You (super admin) invite them from a new page in Platform Admin.

---

## 1. Rename: Personal AI → Voice Studio

- Sidebar item label, page title, header, empty-state copy.
- Route `/admin/personal-ai` stays for backward compat. New canonical route: `/voice-studio`. Tool-only users land here; the old admin route redirects super admins to the same page.
- Memory dialog, system prompt fallback copy updated.

## 2. Per-user `tool_only` flag

Add `tool_only boolean default false` to `public.profiles`.
- New helper `public.is_tool_only(uuid)` (security definer) used by route guards.
- No change to `user_roles` or super-admin behavior. You stay full-access.

## 3. Access lock-down for tool-only users

A new `<ToolOnlyGuard>` wrapper at the router level:
- If `profile.tool_only === true`:
  - All routes except `/voice-studio`, `/voice-studio/setup`, `/auth`, `/logout`, `/account` redirect → `/voice-studio` (or `/voice-studio/setup` if not finished).
  - The app shell **hides the sidebar entirely** for them — full-bleed Voice Studio with a slim top bar (logo, profile menu, sign out).
  - Dashboard, settings, admin, library, etc. are unreachable.
- Super admins / normal users: unaffected.

## 4. First-login onboarding wizard

New page `/voice-studio/setup` (4 short steps, ~2 min):

1. **How you'll use it** — multi-select: exec emails, meeting summaries, marketing copy, internal memos, general writing, other. Tunes the base prompt.
2. **About you** — name, role/title, company, what you work on (1–3 lines). Persisted as durable context injected every turn.
3. **Response preferences** — length (concise / balanced / detailed), format (bullets / prose / mixed), formality (casual → formal slider), banned words (free text), em-dash rule (on/off), markdown on/off.
4. **Voice training** — paste 2–3 real writing samples (min 1, max 5). On submit, calls a new edge function `voice-studio-train` that uses Gemini to extract a concise voice profile (tone, sentence rhythm, vocabulary, structural habits, do/don't list) and saves it.

Wizard saves to `personal_ai_profile` (existing table) — we extend it with the new columns rather than create a parallel one. After completion → redirect to `/voice-studio`.

A "Retrain voice" / "Edit setup" button in the Voice Studio header re-opens the wizard at any time.

## 5. Chat behavior wired to the new profile

`personal-ai-chat` edge function already merges profile + facts into the system prompt. We extend the assembled prompt with the new structured fields (use cases, about-me, response prefs, extracted voice profile) so tool-only users get a tailored copilot from message one.

## 6. Super-admin invite UI

New page **Platform Admin → Tool-only users** (`/admin/voice-studio-users`):
- Table of existing tool-only users (email, name, last active, "Reset setup").
- **Invite** dialog: email, first name, last name → creates a `onboarding_requests` row (or reuses invite_tokens) marked as `tool_only`, calls an edge function `invite-tool-only-user` that:
  - Creates the auth user (or sends magic-link signup),
  - Inserts a profile with `tool_only = true`,
  - Sends a Resend email with the sign-in link.
- New sidebar item under your Platform Admin section: "Tool-only users".

## 7. Edge functions

- `invite-tool-only-user` (admin only) — provisions account, sends email.
- `voice-studio-train` — accepts samples, returns + saves extracted voice profile.
- Update `personal-ai-chat` — read new profile columns, inject into system prompt. No breaking change for existing super-admin use.

---

## Technical details

**Schema changes (one migration):**
```sql
ALTER TABLE public.profiles ADD COLUMN tool_only boolean NOT NULL DEFAULT false;

ALTER TABLE public.personal_ai_profile
  ADD COLUMN use_cases text[] DEFAULT '{}',
  ADD COLUMN about_me text,
  ADD COLUMN response_prefs jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN voice_profile jsonb,                 -- extracted from samples
  ADD COLUMN voice_samples text[],                -- raw pasted samples (for retraining)
  ADD COLUMN setup_completed_at timestamptz;

CREATE OR REPLACE FUNCTION public.is_tool_only(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT COALESCE((SELECT tool_only FROM public.profiles WHERE id = _user_id), false) $$;
```
No new tables, so no new GRANTs needed. Existing RLS on `personal_ai_profile` (user owns own row) covers the new columns.

**Frontend files (new):**
- `src/pages/voice-studio/VoiceStudioSetup.tsx` — the 4-step wizard.
- `src/pages/admin/ToolOnlyUsersPage.tsx` — invite + list.
- `src/components/auth/ToolOnlyGuard.tsx` — route gating + shell stripping.
- `src/hooks/useToolOnly.ts` — reads `tool_only` from profile.

**Frontend files (edited):**
- `src/pages/admin/PersonalAIPage.tsx` — rename UI strings, hide app sidebar when `tool_only`, add "Edit setup" button.
- `src/components/app-shell/AppSidebar.tsx` — rename menu item to "Voice Studio", add "Tool-only users" entry.
- `src/App.tsx` (or router root) — wrap routes with `<ToolOnlyGuard>` and add new routes.
- `src/contexts/AuthContext.tsx` — expose `isToolOnly`.

**Edge functions (new):**
- `supabase/functions/invite-tool-only-user/index.ts`
- `supabase/functions/voice-studio-train/index.ts`

**Edge functions (edited):**
- `supabase/functions/personal-ai-chat/index.ts` — include voice profile + use cases + about-me + prefs in system prompt.

**Out of scope (ask before adding):** custom branding per tool-only user, file uploads in setup, voice cloning (audio), multi-tenant isolation for tool-only users (they're treated as standalone accounts in your tenant), self-serve signup.
