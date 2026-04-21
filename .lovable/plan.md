

# Pop-Out Copywriter Window

Let users detach the AI Copywriter into its own resizable browser window that stays signed in, keeps conversation history, and can sit alongside other apps on their desktop. No native desktop install required — uses standard browser pop-out windows that share the authenticated session.

## How it works (the user-facing experience)

1. In the Copywriter (`/playground`), a new **"Pop out"** button appears next to the sidebar toggle in the top bar.
2. Clicking it opens a focused, chrome-light window (~480×780, resizable) at a new route `/copywriter-popout`.
3. The popout shows the same chat UI without the app sidebar, top nav, or workspace selector — just: profile/DNA selector, model selector, conversation list (collapsible), and chat.
4. The user stays signed in automatically (Supabase's session lives in `localStorage`, which is shared across all windows on the same origin).
5. Conversations sync live: a message sent in the popout shows up in the main app tab and vice versa (via Supabase Realtime on `playground_messages`).
6. The main app shows a small "Copywriter open in popout" indicator with a "Bring back" button that focuses the popout window.
7. Closing the popout returns the user to normal — no data loss, conversations are already persisted.
8. If the user is signed out in any window, the popout detects it and shows a "Session expired — sign in" screen that opens the main app login.

## Why a popout (not a true native desktop app)

- **Zero install.** Works on Mac, Windows, Linux, Chromebook instantly.
- **Always authenticated.** Same-origin popups inherit `localStorage` and cookies from the parent — the existing Supabase session is reused with no re-login.
- **Stays on top / across desktops.** Modern browsers (Chrome, Edge, Arc, Brave) let users pin a window, send it to another desktop/space, or use OS-level "always on top" tools.
- **Optionally installable as a PWA later** — the popout route is a perfect candidate for a "Install Copywriter" experience (Chrome's "Install this site as an app" creates a standalone window with its own dock icon). We can add this in a follow-up.

## Technical plan

**1. New route + lightweight layout**
- Add `src/pages/CopywriterPopoutPage.tsx` — reuses the existing `ChatInterface`, `ConversationList`, `ContextSelector`, `ModelSelector`, and the `usePlaygroundConversations` hook. Same logic as `PlaygroundPage` but rendered in a compact shell (no `AppSidebar`, no `AppTopBar`).
- Register the route in `src/App.tsx` outside `AppLayout`, wrapped instead in a minimal provider stack (`WorkspaceProvider` → `IndustryProvider` → `BrandModeProvider`) — same pattern as `EmbedLayout`. No auth-gating change needed since the existing auth flow handles it.

**2. "Pop out" trigger in `PlaygroundPage`**
- Add a button (icon: `ExternalLink` from lucide) in the top bar.
- Opens with: `window.open('/copywriter-popout', 'copywriter', 'width=480,height=780,resizable=yes,scrollbars=yes')`. Store the returned `Window` reference in a ref so re-clicking focuses the existing popout instead of opening a new one.
- Show a small inline pill ("Copywriter popped out · Bring back") when popout is open; hide on `window.closed` polling.

**3. Live cross-window sync**
- Update `usePlaygroundConversations` to subscribe to Supabase Realtime on `playground_messages` and `playground_conversations` filtered by the current `user_id`.
- On `INSERT`/`UPDATE` events, merge into local state if the change isn't already present. This makes both windows stay in sync without polling.
- Migration: `ALTER PUBLICATION supabase_realtime ADD TABLE public.playground_messages, public.playground_conversations;` and ensure `REPLICA IDENTITY FULL` on both tables.

**4. Session continuity**
- No code change needed for auth — `supabase.auth` reads from `localStorage` which is shared across windows on the same origin, and the existing `onAuthStateChange` listener in `AuthContext` will react to sign-in/sign-out events fired from any tab.
- Add a defensive check in the popout: if `useAuth()` reports `!user` after initial load, render a "Session expired" screen with a button that opens `/login` in the main window (`window.opener?.focus()` + `window.opener.location = '/login'`).

**5. Small polish**
- The popout's `<title>` updates to the current conversation title so it's recognizable in the OS taskbar/dock.
- Set a favicon-friendly compact view (existing favicon is fine).
- Persist `showSidebar` state to `localStorage` keyed `popout-sidebar` so the user's preferred layout sticks.

## Files touched

- **New**: `src/pages/CopywriterPopoutPage.tsx`
- **Edit**: `src/App.tsx` (add route), `src/pages/PlaygroundPage.tsx` (pop-out button + open/focus logic), `src/hooks/usePlaygroundConversations.ts` (Realtime subscription)
- **Migration**: enable Realtime on `playground_messages` and `playground_conversations`

## Out of scope (can be follow-ups)

- A true installable desktop app (Electron / Tauri shell). Not needed unless the user wants offline mode, OS notifications, or "always on top" without using browser/OS tools.
- PWA install banner for the popout route. Easy to add later but introduces service-worker complexity inside the Lovable preview.
- Multi-window conflict resolution beyond Realtime sync (e.g. "user is typing" indicators).

