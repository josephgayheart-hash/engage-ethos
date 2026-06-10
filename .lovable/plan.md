
# Personal AI — Studio Upgrade

Turn the chat into a Claude-style **artifact workbench**: the AI renders diagrams, branded one-pagers, SVG infographics, and interactive previews into a side panel you can edit, version, export, and save. Plus folders for chats and drag-and-drop file/image uploads as context.

## What you'll see

```text
┌───────────┬──────────────────────┬────────────────────────────┐
│ Folders   │  Chat                │  Artifact Panel            │
│  ▸ Ops    │  • User msg          │  ┌──────────────────────┐  │
│  ▸ Brand  │  • AI msg + [chip]   │  │ Workflow v3   ⇆ Code │  │
│  ▸ Q3     │  • [Mermaid pill]    │  │ ──────────────────── │  │
│  + New    │  • [One-pager pill]  │  │   (rendered diagram) │  │
│           │                      │  │                      │  │
│ Chats     │  [+] [📎] [🎯Preset] │  │ v1 v2 v3  ⤓PNG ⤓SVG │  │
│  • Today  │  ┌─prompt──────────┐ │  │ ⤓PDF  ↗Share  Iterate│  │
└───────────┴──────────────────────┴────────────────────────────┘
```

When the AI produces structured output, it streams into a **pill** in the message ("📊 Workflow Diagram — Open") and into the right panel. Click any past pill to re-open.

## Scope (in order)

### Phase 1 — Artifact engine + Mermaid + HTML one-pagers
1. **Artifact data model** (new table `personal_ai_artifacts`): id, thread_id, message_id, kind (`mermaid`|`svg`|`html`|`react`|`markdown`|`image`), title, source, version, parent_artifact_id, created_at. RLS scoped to user.
2. **Tool-call contract** for the chat model: add four "tools" the model emits as fenced blocks the renderer extracts:
   - ` ```artifact:mermaid title="..." ` → Mermaid source
   - ` ```artifact:svg title="..." ` → raw SVG
   - ` ```artifact:html title="..." ` → branded HTML one-pager (sandboxed iframe)
   - ` ```artifact:react title="..." ` → single TSX component (sandboxed preview)
3. **Side panel** (`ArtifactPanel.tsx`): resizable split, tabs for Preview/Source, version dropdown, "Iterate on this" button (re-prompts with artifact as context), copy/download.
4. **Renderers**:
   - Mermaid via `mermaid` npm package, light/dark aware
   - SVG: sanitized inline render
   - HTML: sandboxed iframe with auto-injected brand CSS (tenant primary/secondary/logo)
   - React/TSX: `sandpack-react` preview
5. **Intent detection extension** — auto-route prompts like "diagram", "workflow", "one-pager", "org chart", "framework", "2x2" to add a system instruction biasing the appropriate artifact kind.

### Phase 2 — Workflow & operating-model presets
Quick-action chips above the composer (collapsible):
- **Workflow Builder** → Mermaid flowchart + swim lanes + RACI markdown table
- **Operating Model One-Pager** → branded HTML (Vision · Inputs · Process · Outputs · Metrics · Owners)
- **Process Map (BPMN-ish)** → SVG
- **Org / Capability Map** → Mermaid or SVG tree
- **System Architecture** → Mermaid C4
- **Framework Canvas** → 2x2 / pyramid / value chain (SVG)

Each preset = curated system prompt + forced artifact kind + a starter template.

### Phase 3 — Image upgrades
- **Variations**: generate 3–4 in parallel, pick favorite
- **Edit existing image**: use `imagegen--edit_image` flow ("make it darker", "add a label")
- **Style presets**: Editorial · Whiteboard sketch · Flat illustration · Isometric · Corporate clean
- **Brand-aware injection**: auto-append tenant primary/secondary hex + logo reference to the prompt
- **Aspect ratio picker**: Square, 16:9 slide, 9:16 story, LinkedIn banner
- **Annotate/overlay text** (reuses existing `generate-overlay-text` + smart-layer pipeline)

### Phase 4 — Export & share
- **Per-artifact**: download PNG/SVG/PDF; copy-as-image to clipboard
- **Deck export**: select artifacts from a chat → bundle into `.pptx` via existing `compass-generate-pptx`
- **Shareable link**: read-only public URL for a single artifact (token-based, optional)

### Phase 5 — Folders + uploads + QoL
- **Folders/Projects** for chats: new table `personal_ai_folders` (id, user_id, name, color, sort_order). `personal_ai_threads` gains `folder_id` nullable FK. Sidebar shows collapsible folders, drag-to-move, rename, delete.
- **Pin, rename, search** chats (search across thread titles + message text via Postgres FTS).
- **File/image upload** in composer: drop PDF/DOCX/PNG/JPG → uploaded to `compass-artifacts` bucket → sent as multimodal `content` blocks to the chat model. PDFs parsed server-side to markdown (Gemini multimodal) before injection.
- **System prompt per chat** (Settings drawer on the chat).
- **Branch a conversation** from any AI message ("Continue from here in new chat").

## Technical details

**New tables (migration):**
```sql
CREATE TABLE public.personal_ai_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  thread_id uuid NOT NULL REFERENCES public.personal_ai_threads(id) ON DELETE CASCADE,
  message_id uuid,
  kind text NOT NULL CHECK (kind IN ('mermaid','svg','html','react','markdown','image')),
  title text,
  source text NOT NULL,
  preview_url text,
  version int NOT NULL DEFAULT 1,
  parent_artifact_id uuid REFERENCES public.personal_ai_artifacts(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_ai_artifacts TO authenticated;
GRANT ALL ON public.personal_ai_artifacts TO service_role;
ALTER TABLE public.personal_ai_artifacts ENABLE ROW LEVEL SECURITY;
-- policy: user_id = auth.uid()

CREATE TABLE public.personal_ai_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  color text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
-- + grants + RLS

ALTER TABLE public.personal_ai_threads
  ADD COLUMN folder_id uuid REFERENCES public.personal_ai_folders(id) ON DELETE SET NULL,
  ADD COLUMN pinned boolean DEFAULT false,
  ADD COLUMN system_prompt text;
```

**Edge function changes:**
- `personal-ai-chat`: extend system prompt with artifact contract; accept `mode` (preset) and `attachments[]`; pass file/image blocks per `ai-multimodal-input`.
- New `personal-ai-parse-file` for PDF/DOCX → markdown (Gemini multimodal).
- New `personal-ai-render-html-png` (optional, Phase 4) for PNG export of HTML one-pagers using a headless render of the iframe srcdoc into SVG, then `<img>` paint to canvas client-side instead — server function avoided if client-side works.

**New deps:** `mermaid`, `dompurify`, `@codesandbox/sandpack-react` (Phase 1 React previews; can defer), `html2canvas` (client PNG export), `file-saver`.

**Files touched/created (high-level):**
- `src/pages/admin/PersonalAIPage.tsx` — split into chat column + `ArtifactPanel`
- `src/components/personal-ai/ArtifactPanel.tsx` (new)
- `src/components/personal-ai/renderers/{MermaidRenderer,SvgRenderer,HtmlRenderer,ReactRenderer}.tsx` (new)
- `src/components/personal-ai/PresetChips.tsx` (new)
- `src/components/personal-ai/FolderSidebar.tsx` (new)
- `src/components/personal-ai/AttachmentDrop.tsx` (new)
- `src/hooks/usePersonalAIArtifacts.ts`, `usePersonalAIFolders.ts` (new)
- `supabase/functions/personal-ai-chat/index.ts` — artifact contract + attachments
- `supabase/functions/personal-ai-parse-file/index.ts` (new)
- migration for new tables/columns

## Cut lines (so we ship)
If we need to trim, drop in this order: React/TSX previews → BPMN preset → share links → branching. Mermaid, HTML one-pagers, presets, image variations, folders, and file uploads are the core promise.

## What I'll do first
Implement **Phase 1 + Phase 2** in one pass (artifact engine, Mermaid, HTML one-pagers, SVG, presets), then ship Phases 3–5 in follow-ups. Estimated as one substantial build cycle.

