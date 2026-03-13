

# Redesign AI Technology Page — Client-Ready Showcase

## Goal
Transform the current data-heavy reference page into a visually polished, client-presentable technology showcase. Use branded hero header, model provider logos (inline SVGs), visual cards instead of raw tables, the Content DNA pipeline as a proper visual diagram, and the existing design system (WaveBackground, gradient zones, hover-lift cards).

## Design Approach

### 1. Hero Header with WaveBackground
- Add a `WaveBackground` variant at the top with a bold headline: "Technology Platform" and subtitle about the 8 models, 35+ functions, and full stack
- Stat pills showing key numbers: "8 AI Models", "35+ Edge Functions", "22 Libraries"

### 2. AI Models Section — Visual Cards with Provider Logos
Replace the plain tables with branded cards:
- **Google Gemini** card cluster — inline SVG of the Gemini sparkle icon in Google blue, listing all 7 Gemini models as chips with tier badges
- **OpenAI** card — inline SVG of the OpenAI logo mark, showing GPT-5 Mini
- Each model gets a colored tier badge (Core/Premium/Lite/Preview) and a compact use-case list
- Cards use `card-interactive hover-lift` classes for polish

### 3. Edge Functions — Grouped Visual Grid
Replace the nested tables with a grid of compact cards per capability layer:
- Each group gets an icon, count badge, and expandable function list
- Use `Collapsible` from Radix to keep it clean — show group summary, expand for details
- Color-code by layer (DNA = teal, Generation = amber, Evaluation = navy, etc.)

### 4. Content DNA Pipeline — Visual Flow Diagram
Replace the inline flex of boxes with a proper stepped pipeline:
- Horizontal connected nodes with gradient backgrounds
- Animated connecting lines using the existing `animate-beam-flow` CSS
- Each step as a rounded card with icon, title, and description

### 5. Frontend & Backend Stacks — Icon Grid Cards
Replace library tables with a visual grid:
- Each library gets a small card with the library name, icon, and one-line purpose
- Group into "UI Framework", "Data & State", "Content Processing", "Build Tools"
- Backend infra shown as a horizontal architecture strip

### 6. CRM & Services — Integration Cards
- Each integration gets a card with the service logo area, connection type badge, and description
- Salesforce, Slate, Firecrawl, Resend as distinct branded cards

### 7. Architecture Patterns — Clean Feature List
- Horizontal cards with pattern name and detail, using subtle left-border accents

## Code Changes

### Update `src/pages/admin/AITechnologyPage.tsx`
Complete rewrite of the render, keeping all existing data arrays. Changes:
- Import `WaveBackground`, `Collapsible`/`CollapsibleTrigger`/`CollapsibleContent`
- Add inline SVG components for Google Gemini sparkle and OpenAI logomark
- Hero section with WaveBackground and stat counters
- Model cards with provider branding instead of tables
- Collapsible edge function groups as a visual grid
- Pipeline as connected visual nodes
- Library grid cards instead of tables
- Integration cards for CRM/services
- Use existing CSS classes: `card-interactive`, `hover-lift`, `bg-zone-hero`, `bg-zone-mint`

No routing or sidebar changes needed.

