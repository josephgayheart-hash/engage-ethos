

# Backend Hardening & Integration Improvements

## Context
You're demoing to EM-Powerhouse, an enrollment management consulting firm that works with Slate CRM, SFMC, and brand strategy. They'll care about reliability during the demo and whether CampusVoice integrates with the tools their clients actually use (Slate, primarily).

## Plan

### 1. Edge Function Reliability Layer
Create a shared `_shared/resilience.ts` utility used across all AI-calling edge functions:
- **Retry with exponential backoff** for transient AI gateway failures (429, 500, 503)
- **Request timeout** via `AbortSignal.timeout(30000)` on all `fetch()` calls to the AI gateway
- **Structured error responses** with consistent shape: `{ error: string, code: string, retryable: boolean }`

Apply to these edge functions that call the AI gateway:
- `generate-message`
- `evaluate-message`
- `analyze-voice`
- `playground-chat`
- `generate-cover-image`
- `analyze-web-content`
- `generate-outreach-message`
- `organize-scratchpad`
- `extract-semantics`
- `parse-story`
- `parse-fact-book`
- `smart-layer-image`
- `generate-channel-image`
- `generate-overlay-text`

### 2. Slate CRM Export Integration
Create a new `push-to-slate` edge function modeled after the existing `push-to-sfmc` pattern:
- Authenticate via Slate API credentials (subdomain + API key)
- Push generated messages as Slate Deliver templates or communication plans
- Map CampusVoice channels to Slate communication types (email, letter, text)
- Store Slate credentials per-tenant in a new `tenant_integrations` table (or pass them per-request like SFMC does currently)

Add a frontend "Push to Slate" button alongside the existing "Push to Salesforce" in the BuildPage and message detail views.

### 3. Client-Side Fetch Resilience
Update `src/lib/errors.ts` with a `resilientInvoke` wrapper:
- Wraps `supabase.functions.invoke()` with automatic retry (1 retry on 500/503)
- Surfaces user-friendly toast messages with retry option
- Adds request timeout handling on the client side

### 4. CORS Header Standardization
Several edge functions use the old short CORS header list. Standardize all to include the full set:
```
authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version
```

### 5. Database: `tenant_integrations` Table
New table to store per-tenant integration credentials (Slate, SFMC):
- `id`, `tenant_id`, `integration_type` (enum: `slate`, `sfmc`), `credentials` (jsonb, encrypted at app level), `is_active`, `created_at`, `updated_at`
- RLS: admins can manage their tenant's integrations; super admins can view all

This replaces the current pattern of passing credentials per-request and enables a "connected" state in the UI.

## What stays unchanged
- All existing workflows, pages, and UI components
- Beta branding and feedback system
- SFMC integration (preserved as-is, just gets CORS update)

## Priority for Demo
Items 1 and 3 are highest priority — they prevent embarrassing failures during a live demo. Item 2 (Slate) is the key differentiator that will resonate most with EM-Powerhouse.

