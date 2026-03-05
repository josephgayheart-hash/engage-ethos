# Local Development

## Prerequisites

- Node.js 18+ (or Bun)
- npm / bun

## Setup

```bash
# 1. Clone the repo
git clone <repo-url> && cd <repo>

# 2. Install dependencies
npm install   # or: bun install

# 3. Copy environment variables
cp .env.example .env
# Fill in the values (see below)

# 4. Start dev server
npm run dev   # or: bun dev
```

The app runs at `http://localhost:5173` by default.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Supabase project API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | ✅ | Supabase project ID (used for storage URLs) |

All three are provided automatically in Lovable Cloud. For local dev, copy them from your Supabase project settings → API.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run build:dev` | Development build (unminified) |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

## Common Issues

### 1. Blank page / auth redirect loop
You need a valid Supabase project with auth configured. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are correct.

### 2. Edge functions return 401
Edge functions require a valid JWT. Sign in first, then calls will include the auth token automatically via the Supabase client.

### 3. `types.ts` or `client.ts` out of date
These files are auto-generated. Do **not** edit them. In Lovable Cloud they update automatically after migrations. Locally, regenerate with `supabase gen types typescript`.

### 4. Storage / file uploads fail
Ensure the required storage buckets exist in your Supabase project. See `ARCHITECTURE.md` for the full bucket list.
