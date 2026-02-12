

# Campaign Collections and Asset Previews for the Library

## What You're Describing

A way to group library items (messages, journeys, templates, and linked assets) under a campaign, initiative, or program -- creating a "container" that holds everything associated with that effort. Plus, visual thumbnails and previews for linked artwork and graphics.

---

## Part 1: Campaign/Initiative/Program Collections

### New Database Table: `library_collections`

A lightweight grouping mechanism that acts as a named container:

```text
library_collections
  id           uuid (PK)
  tenant_id    uuid (not null)
  created_by   uuid (not null)
  name         text (e.g., "Fall 2026 Enrollment Campaign")
  description  text (optional summary)
  collection_type  text ("campaign" | "initiative" | "program" | "custom")
  cover_image_url  text (optional -- a hero image or logo for the collection)
  tags         text[] (additional labels)
  status       text ("active" | "archived")
  created_at   timestamptz
  updated_at   timestamptz
```

### Linking Table: `library_collection_items`

Associates any library item or external asset with a collection:

```text
library_collection_items
  id              uuid (PK)
  collection_id   uuid (FK to library_collections)
  tenant_id       uuid (not null)
  item_type       text ("template" | "message" | "external_asset")
  template_id     uuid (nullable -- for shared_templates)
  message_id      uuid (nullable -- for personal_messages)
  external_asset  jsonb (nullable -- for linked assets not yet in a library item)
  sort_order      integer (for manual ordering)
  added_by        uuid
  added_at        timestamptz
```

RLS on both tables: tenant-scoped read/write, admin delete.

### What This Enables

- Create a collection called "Spring 2026 Open House" and tag messages, journeys, Canva graphics, and templates to it
- Browse the library filtered by collection
- See a collection detail page showing all associated assets in one place
- Archive collections when a campaign ends (items remain in the library)

---

## Part 2: Thumbnail Previews for External Assets

### How Thumbnails Work (No File Storage Needed)

For linked external assets, we generate preview thumbnails using URL-based approaches:

| Platform | Thumbnail Method |
|----------|-----------------|
| Canva | Canva share links render an Open Graph image -- we extract the `og:image` meta tag |
| Google Drive | Google Drive API provides thumbnail URLs for shared files |
| Figma | Figma share links include an `og:image` with a preview of the design |
| Brandfolder / Bynder | DAM platforms expose thumbnail URLs in their share links |
| Generic URLs | Use the page's `og:image` or a favicon + domain placeholder |
| Direct image URLs (.png, .jpg, .svg) | Display the URL directly as an `<img>` tag |

### Implementation

- **`ExternalAsset` type update**: Add optional `thumbnail_url` field
- **Auto-detection on paste**: When a user pastes a URL, attempt to infer the platform and construct a thumbnail URL (client-side heuristics based on domain)
- **Manual override**: Users can paste a direct image URL as the thumbnail if auto-detection doesn't work
- **Display**: Asset cards show a 16:9 thumbnail preview with the platform icon overlaid in the corner, plus the label and notes below

### New Component: `AssetCard`

A reusable card that renders:
- Thumbnail image (with fallback to a platform-branded placeholder)
- Platform icon badge (Canva, Figma, Google Drive, etc.)
- Asset label and optional notes
- "Open in [Platform]" link
- Collection badges showing which campaigns/initiatives the asset belongs to

---

## Part 3: Collection UI

### Collection Browser (New tab on SharedLibrary page)

- Add a "Collections" tab alongside "All Playbooks" in the library
- Shows collection cards with: name, description, cover image, item count, status badge
- Click into a collection to see all its items (messages, templates, assets) in a detail view

### Collection Detail Page

- Hero section with collection name, description, type badge, cover image
- Tabbed view: "Messages & Journeys" | "Assets & Creative" | "All Items"
- Add items to collection via a search/select dialog
- Add external asset links directly from the collection detail page
- Remove items from collection (doesn't delete the item itself)

### Adding Items to Collections

From any template or message detail page:
- "Add to Collection" button opens a dropdown of existing collections (or create new)
- From the collection detail page: "Add Item" button to search and link existing library items or paste new external asset URLs

---

## Part 4: External Assets Column on Existing Tables

As previously planned, add `external_assets` (jsonb, default `[]`) to:
- `shared_templates`
- `personal_messages`

This allows individual library items to carry their own linked assets even outside of a collection context.

---

## Files to Create or Modify

| File | Action |
|------|--------|
| Migration SQL | Create `library_collections`, `library_collection_items` tables; add `external_assets` to `shared_templates` and `personal_messages` |
| `src/types/library.ts` | Add `ExternalAsset`, `LibraryCollection`, `CollectionItem` interfaces |
| `src/hooks/useLibraryCollections.ts` | New hook -- CRUD for collections and collection items |
| `src/hooks/useSharedLibrary.ts` | Map `external_assets` field |
| `src/hooks/useMessageLibrary.ts` | Map `external_assets` field |
| `src/components/library/AssetCard.tsx` | New -- thumbnail preview card for external assets |
| `src/components/library/AssetLinkForm.tsx` | New -- form to add external asset links with URL, label, platform, thumbnail |
| `src/components/library/CollectionCard.tsx` | New -- card for browsing collections |
| `src/components/library/AddToCollectionDialog.tsx` | New -- dialog for adding items to collections |
| `src/pages/SharedLibrary.tsx` | Add "Collections" tab, collection filter |
| `src/pages/CollectionDetailPage.tsx` | New -- detail view for a collection |
| `src/pages/TemplateDetailPage.tsx` | Add "Assets" tab, "Add to Collection" button |
| `src/App.tsx` | Add route for `/collections/:id` |

---

## What This Does NOT Do

- Does not store files in the database (links and thumbnails only)
- Does not integrate with Canva/DAM APIs (just links to them)
- Does not replace existing campaign dashboard -- collections are a library-level organizational concept
- Does not require users to create collections -- they're optional grouping

