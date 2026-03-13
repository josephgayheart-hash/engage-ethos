

# Expand AI Technology Page to Full Technology Stack Reference

## What We're Building
Expand the existing `AITechnologyPage.tsx` to include **all** tools, libraries, and services used across the platform — not just AI models. This turns it into a comprehensive "Technology Stack Reference" page.

## New Sections to Add

### Section: Frontend Libraries & Tools
A table of all key npm dependencies with their role in the platform:

| Library | Purpose |
|---------|---------|
| React 18 + TypeScript | Core UI framework |
| Vite + SWC | Build tooling with fast HMR |
| Tailwind CSS | Utility-first styling |
| shadcn/ui (Radix UI) | 20+ accessible UI primitives (Dialog, Select, Tabs, etc.) |
| TanStack React Query | Server state management and caching |
| React Router v6 | Client-side routing with nested layouts |
| Tiptap | Rich text editor (story bank, message editing) |
| React Flow | Visual journey/flow diagram builder |
| Recharts | Data visualization (analytics charts, dashboards) |
| Embla Carousel | Image carousels and slideshows |
| React Resizable Panels | Split-pane layouts |
| cmdk | Command palette interface |
| Zod + React Hook Form | Schema validation and form management |
| date-fns | Date formatting and manipulation |
| Lucide React | Icon library (462+ icons) |
| next-themes | Dark/light mode theming |
| Sonner | Toast notification system |

### Section: Document & Media Processing
| Library | Purpose |
|---------|---------|
| PDF.js (pdfjs-dist) | Client-side PDF text extraction |
| Mammoth | Word document (.docx) text extraction |
| jsPDF | PDF generation and export |
| html-to-image | DOM-to-image screenshot capture |
| html2canvas | HTML element to canvas rendering |
| react-markdown | Markdown content rendering |

### Section: CRM Integrations
| Integration | Purpose |
|-------------|---------|
| Salesforce Marketing Cloud (SFMC) | Push content to SFMC Content Builder via API |
| Technolutions Slate | Push content to Slate Deliver via API |
| Ellucian CRM Recruit | XML export format for communications |
| Generic CSV/JSON | Universal export for any CRM |

### Section: Email & Communication Functions
Add a new edge function group for the 11+ email functions using Resend, plus `track-email-click` for click tracking and `resend-webhook` for delivery status webhooks.

### Section: Backend Infrastructure
| Component | Purpose |
|-----------|---------|
| Supabase (Postgres) | Database with RLS, multi-tenant isolation |
| Supabase Auth | Authentication with email/password |
| Supabase Edge Functions | 30+ Deno serverless functions |
| Supabase Storage | File uploads (campus photos, documents) |
| Supabase Realtime | Live updates for collaborative features |

## Code Changes

### 1. Update `src/pages/admin/AITechnologyPage.tsx`
- Rename page title to "Technology Stack Reference"
- Add new data arrays: `frontendLibraries`, `documentProcessing`, `crmIntegrations`, `emailFunctions`, `backendInfra`
- Add new Card sections for each, using existing Table/Badge patterns
- Add the email/CRM edge functions to the edge function inventory
- Import additional icons (`Package`, `FileText`, `Database`, `MailIcon`)

No routing or sidebar changes needed — the page already exists at `/admin/ai-technology`.

