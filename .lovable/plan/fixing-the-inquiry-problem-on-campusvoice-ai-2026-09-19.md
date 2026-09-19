# Fixing the inquiry problem on campusvoice.ai

## What the numbers actually say (last 30 days)

- 55 visitors, 110 pageviews total.
- Home page: 34 views. Request access page: 4 views. Login: 14. Enterprise page: 5.
- Bounce rate 78%, average visit under a minute for most days.
- Submitted access requests in the last 30 days: **0**. The most recent one ever was in late March.
- Traffic sources: 41 direct, 11 Google, 2 Bing.

Read plainly: about 12 of every 100 home page visitors do click through to the request page, which is not a broken button. The problem is two things stacked on top of each other.

1. **Almost nobody is arriving.** 55 visitors a month, mostly direct (you and people you sent). Even a great page converts single digits of that.
2. **The one thing you ask visitors to do is the hardest possible ask.** "Get Early Access" leads to a form that ends with "an administrator will review your request and send you login credentials in 24-48 hours." That asks a stranger to apply for permission to use software they have never seen. There is no low-commitment option in front of it.

Two things you suspected that are **not** the cause:

- You are **not** requiring a .edu email. There is no such check anywhere — `you@institution.edu` is only placeholder text.
- The form is **not** long. It is already two steps, email and institution first.

One real gap you asked about: **inquiries never reach the CRM.** Requests land in the access-request table. A record only appears in the CRM pipeline after you approve someone and a user account is created. So a new inquiry is invisible in the place you actually work leads, and nobody gets an email when one arrives.

## What to change

### 1. Every inquiry lands in the CRM the moment it is submitted
Add a database trigger so a submitted access request immediately creates or updates a CRM record with status "inbound" — name, email, title, institution, inferred website, and the referral source — deduplicated by email so nothing doubles up. Existing approval behaviour stays as it is.

### 2. You get notified instantly
Send an internal alert email to your address on every submission, with the person's details and a direct link to the admin review screen. The applicant's confirmation email stays as it is.

### 3. Instant access instead of a 24-48 hour approval queue

Yes — this is the single biggest lever, and it is worth doing. Today a person fills in a form, then waits for you to approve them and email credentials. Most people never come back. Change it to: they set their own password, are signed in immediately, and land in a workspace created for them automatically from their email domain.

- Sign-up is self-serve on the request page: email, institution, name, password, done.
- Their workspace is created on the spot; if someone from the same email domain already has a workspace, they join it in a pending state so you keep control of team access.
- Email confirmation is turned on by default so a real address is required, and the confirmation link drops them straight into the app. If you would rather they be signed in the instant they submit, we can skip confirmation — say the word and I will set that instead.
- New accounts start as a trial workspace so you can still gate advanced features; you review afterward rather than blocking the door.
- The approval queue stays for the cases that need it: agency requests, and anyone using a free email address (gmail, outlook, etc.), who still routes to you for manual review.

### 4. Give visitors something to do that is not an application
Make the free copywriter demo the primary action on the home page and the enterprise page, with "Request access" as the secondary. It already exists at `/try-copywriter` and needs no login, which is the strongest asset you have and it is currently the smaller button.

### 5. Replace the "apply for permission" framing
- CTA wording moves from "Get Early Access" to an outcome ("See it write for your institution").
- On the request page, say plainly what happens and when, that any work email is fine, and that there is no cost during the beta.
- Add a third option on that page: a short "Have a question / want a walkthrough" path that only asks email, institution, and one message box, saved as an inquiry and pushed to the CRM the same way.

### 6. Confirmation screen stops being a dead end
After submitting, offer the demo and the enterprise overview instead of only "Back to Login," so a person who just raised their hand keeps engaging.

## What this will not fix

At 55 visitors a month no amount of page tuning produces a pipeline. The changes above make sure nothing leaks and that a visitor has a reason to engage. Volume has to come from outbound and search: the CRM and prospect-outreach tools you already built, plus the fact that only 13 visits came from search in a month. Once inquiries flow into the CRM automatically, running outbound through it becomes the next step.

## Technical notes

- New migration: trigger function on `onboarding_requests` insert writing to `sales_prospects` (status `inbound`, dedupe on `contact_email`, domain inferred from email as the existing profile trigger does).
- New edge function for the internal alert, or extend `send-request-confirmation` with a second send; recipient address stored as a secret so it is not hard-coded.
- `RequestAccessPage.tsx`: becomes self-serve sign-up (password field, `supabase.auth.signUp`), plus copy changes, inquiry mode, new success state. Free-email and agency submissions keep the existing `onboarding_requests` path.
- Enable email/password sign-in on the backend; add a signup trigger that creates the tenant and profile for a new self-serve account (domain-matched join when a workspace already exists).
- `LandingPage.tsx` and `ForEnterprisePage.tsx`: CTA hierarchy and wording only.
