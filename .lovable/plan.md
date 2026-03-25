

## Plan: Social Media Post Builder with Direct Publishing

Extends the previously approved Social Post Builder plan with the ability to publish directly to social platforms from the app.

---

### Direct Publishing Architecture

Since there are no pre-built connectors for social platforms, direct posting requires **platform API credentials** stored as secrets in edge functions.

**Supported platforms and requirements:**

| Platform | API Type | Credentials Needed |
|---|---|---|
| X / Twitter | OAuth 1.0a | Consumer Key/Secret + Access Token/Secret |
| LinkedIn | OAuth 2.0 | Client ID/Secret + Access Token (user must authorize) |
| Facebook/Instagram | Graph API | App ID/Secret + Page Access Token |

**Approach:** A single edge function `publish-social-post` that accepts platform, caption, image URL, and CTA — then routes to the correct platform API.

---

### New / Modified Files

**Database:**
- `social_posts` table (as previously planned) — add `published_at` timestamptz column and `publish_error` text column for tracking publish results

**Edge Function:**
- `supabase/functions/publish-social-post/index.ts` — Routes to platform APIs:
  - **X/Twitter**: Uses `api.x.com/2/tweets` with OAuth 1.0a signing, optional media upload via `upload.twitter.com/1.1/media/upload.json`
  - **LinkedIn**: Uses `api.linkedin.com/v2/ugcPosts` with Bearer token
  - **Facebook/Instagram**: Uses Graph API `/{page-id}/feed` or `/{ig-user-id}/media`
  - Returns success/failure per platform, updates `social_posts.status` to `published` and sets `published_at`

**Frontend components:**
- `src/pages/SocialPostsPage.tsx` — Main page with queue + composer
- `src/components/social/PostComposerCard.tsx` — Compose form with platform selector, caption, image, schedule, and **"Publish Now"** button
- `src/components/social/PostQueueList.tsx` — Queue view with status badges (draft / scheduled / published / failed)
- `src/components/social/PostImagePicker.tsx` — Upload / AI generate / brand overlay
- `src/components/social/PlatformAccountsDialog.tsx` — Settings dialog where users connect their social accounts (enter API credentials per platform)
- `src/hooks/useSocialPosts.ts` — CRUD hook + `publishPost` mutation that invokes the edge function

**Modified files:**
- `src/App.tsx` — Add `/social-posts` route
- `src/config/brandConfig.ts` — Add `socialPosts` nav label
- `src/components/app-shell/AppSidebar.tsx` — Add nav item

**Secrets (requested on first use):**
- `TWITTER_CONSUMER_KEY`, `TWITTER_CONSUMER_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_TOKEN_SECRET`
- LinkedIn and Facebook tokens would be added when those platforms are enabled

---

### Publishing Flow

```text
User clicks "Publish Now" or scheduled time arrives
  → Frontend calls useSocialPosts.publishPost(postId)
    → supabase.functions.invoke('publish-social-post', { postId, platforms })
      → Edge function reads post from DB
      → For each platform in post.platform[]:
          → Upload image if present
          → Post content via platform API
          → Record result
      → Update social_posts: status='published', published_at=now()
      → Return per-platform results
```

---

### Phased Rollout

**Phase 1 (this build):** X/Twitter direct posting + queue UI with draft/schedule/publish workflow
**Phase 2 (follow-up):** LinkedIn and Facebook/Instagram posting, scheduled auto-publish via pg_cron

This keeps the initial build focused while establishing the architecture for all platforms.

---

### Technical Notes

- Twitter uses OAuth 1.0a signature — the edge function handles HMAC-SHA1 signing server-side
- Image uploads to Twitter require a two-step flow (upload media, then attach media_id to tweet)
- Platform credentials are stored as Supabase secrets, never exposed to the client
- RLS on `social_posts`: users CRUD their own tenant's posts, admins view all within tenant
- The "Publish Now" button is only enabled when at least one platform has credentials configured

