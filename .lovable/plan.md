

## Graphic Design Mode Toggle with Extended Prompts — ✅ COMPLETED

### What was done

1. **Extracted Graphic Design as a segmented toggle** — "Photo" | "Graphic Design" toggle group at the top of Image Settings, using ToggleGroup with Camera/Palette icons
2. **Removed `graphic-design` from the Style dropdown** — Photo mode shows photo styles only; Graphic Design mode hides the style dropdown entirely
3. **Added 4 Graphic Design sub-controls** (visible only in Graphic Design mode):
   - **Design Style** — radio group: Bold & Geometric, Gradient Flow, Typographic Poster, Collage / Mixed Media, Retro / Vintage, Abstract Minimal
   - **Color Mood** — selectable badge chips: Brand Colors Only, Warm, Cool, Monochrome, High Contrast, Pastel
   - **Typography Style** — radio group: Sans-Serif Modern, Serif Classic, Display / Decorative, Handwritten
   - **Layout Density** — radio group: Spacious, Balanced, Dense
4. **Updated edge function prompt** — accepts `designStyle`, `colorMood`, `typographyStyle`, `layoutDensity` and weaves them into the graphic design prompt
5. **Contextual UI** — Scene Description becomes "Design Brief" with a graphic-design-specific placeholder when in GD mode

## NDA Links — Super Admin Feature — ✅ COMPLETED

### What was done

1. **Database**: Created `nda_links` and `nda_responses` tables with full RLS (super admin CRUD, anonymous INSERT for public signing, anonymous SELECT for active links)
2. **Storage**: Created `nda-signatures` bucket for drawn signature images
3. **Public signing page** (`/nda/sign/:slug`): CampusVoice-branded page with wave emoji heading, agreement text, form fields (name, email, org, title), 3 required checkboxes, typed + optional drawn signature canvas, success screen with countdown redirect
4. **Admin page** (`/admin/nda-links`): Two-tab layout — Links table (create, copy, duplicate, revoke) + Responses table (search, filter, CSV export, detail drawer)
5. **Components**: `CreateNDALinkDialog`, `NDALinksTable`, `NDAResponsesTable`, `NDAResponseDetailDrawer`
6. **Navigation**: Added to Super Admin sidebar with FileSignature icon
7. **Routes**: Public route for `/nda/sign/:slug`, Super Admin route for `/admin/nda-links`
