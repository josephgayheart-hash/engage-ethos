## Goal

Convert the warm visitors you already have. Current data shows 21 visitors, 82% bounce, ~9-second sessions, 62% mobile, no signups. The fix is to make the first 5 seconds clearer, give visitors a way to *experience* the product before signing up, and reduce the cost of the signup ask.

## Changes

### 1. Sharper, less abstract hero (`src/pages/LandingPage.tsx`)

The rotating noun ("Built for Planners / Smarter Messaging / Strategists…") is creative but ambiguous on a 9-second visit. Replace with a concrete, scannable hero that answers *what is this* and *who is it for* immediately.

- New H1 (static, no rotation): **"AI copywriting that stays on your brand."**
- Subhead (one line): **"Upload your brand voice once. Generate emails, social posts, journeys, and campaigns that sound like you — across every channel."**
- Keep the "Strategic Messaging Intelligence" badge but smaller.
- Add a one-line audience tag under the CTAs: *"For higher-ed, enterprise, nonprofit, and healthcare brand teams."*

### 2. Add a low-commitment CTA next to "Get Early Access"

Right now both CTAs are commitment-heavy (full form OR sign in). Add a third, frictionless option:

- Primary: **Get Early Access** (unchanged)
- Secondary (NEW): **Try the Evaluator → free, no signup** linking to `/evaluate` (or `/features/evaluate` if `/evaluate` requires auth — we'll verify and route appropriately).
- Tertiary: Sign In (smaller, as today).

This gives warm visitors a way to *touch the product* in one click, which is the single biggest lever for converting 9-second bounces.

### 3. Inline product proof above the fold (mobile-friendly)

Add a single static visual under the hero (before scroll-revealed sections) showing a real generated message with brand voice applied — a screenshot-style card, not an animation. Static = fast on mobile.

- New component `src/components/landing/HeroProductProof.tsx`: a styled "before / after" card — left shows a plain prompt ("Write a welcome email"), right shows a branded result with the user's logo color, voice tone, and a snippet.
- Renders below the hero, above `SocialProofStrip`.
- No animation, no scroll-trigger, no large images — pure CSS so it's instant on mobile.

### 4. Trim the `/request-access` form (`src/pages/RequestAccessPage.tsx`)

Today's required fields: First Name, Last Name, Email, Institution. Optional: Phone, Department, Title, Referral source.

Change to a **two-step** flow:

- **Step 1 (visible on load):** Email + Institution only. Single "Continue" button.
- **Step 2 (after Continue):** First name, Last name, optional Phone/Department/Title, Referral source, submit.

Visitors get a tiny first ask, commit, then complete. We keep all the same data; we just stop scaring people off at the door. Form state and submission logic stay identical.

### 5. Mobile performance trim on the landing page

13 of 21 visits are mobile. The hero has 4 animated floating orbs + dot grid + scroll-reveal on every section. On mid-tier phones this is heavy.

- Hide all 4 floating orbs on mobile (already partial — verify `hidden sm:block` everywhere).
- Disable scroll-reveal on the first 2 below-fold sections so they render immediately (no opacity-0 → opacity-100 wait).
- Lazy-load `ProductTourTabs`, `EnterpriseShowcases`, and other heavy showcase components below the fold using `React.lazy` + `Suspense`.

### 6. Sticky CTA: add the Evaluator option

`src/components/landing/StickyCtaBar.tsx` currently has only "Get Early Access." Add a small secondary "Try free" link so the lower-friction path follows the user as they scroll.

## Out of scope (follow-ups if you want)

- Adding a 30-sec demo video (need recorded footage).
- A/B testing framework — too early at 21 visitors/week to be statistically meaningful.
- Pricing page — separate question.

## Files touched

- `src/pages/LandingPage.tsx` — hero copy, CTA group, audience line, lazy-loading.
- `src/components/landing/HeroProductProof.tsx` — NEW static proof card.
- `src/components/landing/StickyCtaBar.tsx` — add secondary "Try free" link.
- `src/pages/RequestAccessPage.tsx` — split into 2-step flow (no schema/db changes).

## Why this works

The data says: warm visitors arrive, can't decode the offer in 9 seconds, and have no way to try the product without filling a form. Steps 1–3 fix decoding and give a try-now path; step 4 lowers the cost of the signup; step 5 removes mobile friction. Same traffic, different funnel math.