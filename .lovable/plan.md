

## Brand Studio: Standalone Entry with Image Upload and Generation

Currently, Brand Studio shows a dead-end "go to Image Studio" message when opened directly (no brand colors in navigation state). This plan replaces that empty state with a self-service onboarding flow.

---

### What Changes

**Replace the empty state in `src/pages/BrandStudioPage.tsx`** (lines 424-438) with a welcoming starter panel that lets the user:

1. **Select an institutional profile** -- a dropdown of their configured profiles (uses `useInstitutionalProfiles`). Selecting one auto-loads brand colors, logos, and institution name into the editor state.

2. **Choose an image source** (two options):
   - **Upload your own image** -- a file input (drag-and-drop zone) that accepts PNG/JPG/WebP. The uploaded file is converted to a local object URL and used as the canvas base image.
   - **Generate with AI** -- a text input for a scene description plus a "Generate" button that calls the existing `generate-channel-image` edge function, then loads the result onto the canvas.

3. **Start with a blank canvas** -- a button that skips the image entirely and opens the editor with just a solid-color background (using the profile's primary color). This already works today once brand colors are set.

Once the user picks a profile and provides an image (or chooses blank), the component sets the internal state (brandColors, logoUrl, etc.) and the full editor appears -- no navigation required.

---

### Technical Details

#### File: `src/pages/BrandStudioPage.tsx`

- Import `useInstitutionalProfiles` and add it to the component.
- Add local state: `localImageUrl`, `selectedProfileId`, `isGenerating`, `generatePrompt`.
- Replace the `if (brandColors.length === 0)` block with a new `StartPanel` section:
  - Profile selector (`Select` dropdown from profiles list)
  - Three-option layout: Upload Image | Generate Image | Blank Canvas
  - Upload uses a hidden file input + styled drop zone
  - Generate uses an input + button calling `generate-channel-image`
- When user completes the starter flow, derive `brandColors`, `logoUrl`, `logoUrls`, `institutionName` from the selected profile's config and set them into component state (convert these from `const` destructuring to `useState` so they can be overridden).
- Refactor the existing destructured state variables (`imageUrl`, `brandColors`, etc.) to use `useState` with the navigation state as initial values, so they can be updated by the starter flow.

#### No new files, no database changes, no new edge functions.

The existing `generate-channel-image` function already accepts `channel`, `contentSummary`, `tenantId`, and `profileId` -- the starter panel will call it with channel "social-media" and the user's prompt as the content summary.
