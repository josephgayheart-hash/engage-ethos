

# AI Technology Reference Page — Internal Super Admin Page

## What We're Building
A read-only internal reference page at `/admin/ai-technology` accessible from the Super Admin sidebar menu. This page documents every AI model, edge function, external service, and architectural pattern used across the CampusVoice.ai platform — a quick-reference cheat sheet for technical conversations.

## Page Structure

### Section 1: AI Models Inventory
A table/grid of all 8 distinct AI models used, grouped by capability:

**Reasoning / Text Models:**
| Model | Use Cases |
|-------|-----------|
| `google/gemini-2.5-flash` | Core engine — Content DNA analysis, message generation, evaluation, web content analysis, fact-book/story parsing, campus photo analysis, semantic extraction, institution lookup, text extraction from images, web section parsing |
| `google/gemini-2.5-flash-lite` | Lightweight tasks — scratchpad organization, overlay text generation |
| `google/gemini-2.5-pro` | Premium playground chat |
| `google/gemini-3-flash-preview` | Outreach messages, article contact extraction, image prompt building, scratchpad (secondary) |
| `openai/gpt-5-mini` | Playground chat (user-selectable) |

**Image Generation Models:**
| Model | Use Cases |
|-------|-----------|
| `google/gemini-2.5-flash-image` | Default image generation — cover images, collection covers, smart layer images |
| `google/gemini-3-pro-image-preview` | Premium image generation engine |
| `google/gemini-3.1-flash-image-preview` | PDF page image generation |

### Section 2: Edge Functions Inventory (22 functions)
Organized by capability layer with model and purpose for each:

- **Content DNA Engine**: analyze-voice, extract-semantics
- **Generation Suite**: generate-message, playground-chat, generate-outreach-message, generate-overlay-text
- **Evaluation & Analysis**: evaluate-message, analyze-web-content, analyze-campus-photo
- **Image Generation**: generate-channel-image, generate-cover-image, generate-collection-cover, smart-layer-image, generate-pdf-images
- **Content Parsing**: parse-fact-book, parse-story, parse-web-sections, extract-text-from-image, extract-article-contacts, parse-contact-text
- **Data Enrichment**: lookup-institution, find-contact-email, find-linkedin-profile, search-university-logo
- **Utility**: organize-scratchpad

### Section 3: External Services
- **Firecrawl** — Web scraping, search, and site mapping (firecrawl-scrape, firecrawl-search, firecrawl-map, find-contact-email, find-linkedin-profile, search-university-logo)
- **Resend** — Transactional email delivery (10+ email edge functions)

### Section 4: Infrastructure Patterns
- Lovable AI Gateway (`ai.gateway.lovable.dev`)
- Resilient fetch with retries (`_shared/resilience.ts`)
- IP-based rate limiting (`_shared/rateLimit.ts`)
- Streaming responses for playground chat
- Hierarchical Content DNA resolution (Profile → Parent → Tenant)

### Section 5: Content DNA Pipeline
A text-based flow diagram showing: Upload Samples → Voice Analysis → Semantic Extraction → Brand Platform → Generation Enforcement → Evaluation Scoring

## Code Changes

1. **Create** `src/pages/admin/AITechnologyPage.tsx` — The full reference page component with all sections above, using existing Card/Table/Badge UI components.

2. **Update** `src/App.tsx` — Add route `/admin/ai-technology` under the `RequireSuperAdmin` block, import the new page.

3. **Update** `src/components/app-shell/AppSidebar.tsx` — Add `{ title: "AI Technology", url: "/admin/ai-technology", icon: Cpu }` to `superAdminItems`.

