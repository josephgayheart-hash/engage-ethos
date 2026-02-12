

## Campus Photography Library for AI Image Training

### Overview

Add a **"Campus Photography"** section to the Content DNA Studio where users can upload sample photos from their real campus photography library. These reference images will then be injected into ALL image generation prompts (Image Studio, cover images, channel previews) so the AI produces visuals that match the institution's actual aesthetic -- building styles, landscaping, lighting preferences, and photographic tone.

### Why This Is Valuable

- Currently, image generation relies on the AI's general knowledge of a university's campus (via the institution name in the prompt). This works okay for well-known schools but produces generic results for smaller institutions.
- Real sample photos give the AI concrete visual references for architectural style, campus feel, seasonal context, and photographic tone -- producing dramatically more accurate and on-brand results.
- Gemini 3 Pro Image Preview already supports multi-image inputs, so reference photos can be passed directly alongside the text prompt without any model changes.

### Technical Plan

#### 1. Storage Bucket

Create a new `campus-photography` storage bucket (public) to hold uploaded reference images, organized by tenant and profile.

#### 2. Database Table

Create a `campus_photo_samples` table to track uploaded photos with metadata:

- `id`, `tenant_id`, `profile_id`, `user_id`
- `file_name`, `file_url` (public URL from storage)
- `photo_category` (e.g., "architecture", "campus-life", "landscape", "athletics", "traditions", "aerial")
- `description` (optional user note about the photo)
- `is_active` (boolean, default true -- allows disabling without deleting)
- `created_at`

RLS policies: tenant-scoped read, user-scoped insert/delete, admin full management.

#### 3. Content DNA Studio -- New "Campus Photography" Tab

Add a new tab alongside the existing Samples / Web Crawl / Story Bank / Fact Book tabs:

- **Upload zone**: Drag-and-drop or click to upload JPG/PNG/WEBP photos (max 5MB each, limit ~20 photos per profile)
- **Category selector**: Tag each photo with a category (Architecture, Campus Life, Landscape, Athletics, Traditions, Aerial)
- **Photo grid**: Display uploaded photos as a thumbnail grid with delete and toggle-active controls
- **Guidance text**: Explain what types of photos work best ("Upload your best campus photography -- building exteriors, quad shots, student life candids, iconic landmarks. These teach the AI what your campus actually looks like.")

#### 4. Update Image Generation Edge Functions

Modify both `generate-channel-image` and `generate-cover-image` to:

1. Query `campus_photo_samples` for the tenant/profile (limit to ~3-4 active photos to stay within token limits)
2. Fetch the image URLs and convert to base64 for the AI request
3. Pass them as additional image content in the `messages` array alongside the text prompt
4. Add a prompt instruction: "Use the following reference photos as visual guides for campus architecture, environment, lighting style, and photographic tone. Match the aesthetic feel of these real campus images."

The message structure would look like:
```text
messages: [
  {
    role: "user",
    content: [
      { type: "text", text: "<existing prompt>" },
      { type: "text", text: "REFERENCE CAMPUS PHOTOGRAPHY -- match the architectural style, lighting, and feel of these real photos:" },
      { type: "image_url", image_url: { url: "<photo1_url>" } },
      { type: "image_url", image_url: { url: "<photo2_url>" } },
      { type: "image_url", image_url: { url: "<photo3_url>" } }
    ]
  }
]
```

#### 5. Smart Photo Selection

When generating, select reference photos strategically based on context:
- If the prompt mentions "architecture" or "building", prefer photos tagged "architecture"
- If it mentions "students" or "campus life", prefer "campus-life" photos
- Default: pick a mix across categories for general reference
- Always cap at 3-4 images to avoid exceeding input limits and slowing generation

#### 6. Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/...campus_photo_samples.sql` | New table + RLS + storage bucket |
| `src/hooks/useCampusPhotography.ts` | New hook for CRUD on campus photos |
| `src/components/dna/CampusPhotographyTab.tsx` | New tab component with upload grid |
| `src/pages/admin/ContentDNAPage.tsx` | Add the new tab to the DNA Studio tabs |
| `supabase/functions/generate-channel-image/index.ts` | Fetch + inject reference photos |
| `supabase/functions/generate-cover-image/index.ts` | Fetch + inject reference photos |

#### 7. Constraints and Guardrails

- Max 20 photos per institutional profile to keep storage manageable
- Max 5MB per photo (resize/compress on client if needed)
- Only JPG, PNG, WEBP accepted
- Photos are never used to "fine-tune" a model -- they are passed as in-context visual references at generation time
- Generation will gracefully degrade if no photos are uploaded (current behavior unchanged)

