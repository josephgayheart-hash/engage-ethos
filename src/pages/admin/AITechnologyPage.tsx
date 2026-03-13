import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Cpu, Zap, Brain, ImageIcon, Globe, Mail, Shield, ArrowRight, Server, RefreshCw, Package, FileText, Database, MailIcon, Plug, Layout } from "lucide-react";
import { Separator } from "@/components/ui/separator";

/* ── Data ── */

const textModels = [
  { model: "google/gemini-2.5-flash", tier: "Core", uses: "Content DNA analysis, message generation, evaluation, web content analysis, fact-book / story parsing, campus photo analysis, semantic extraction, institution lookup, text extraction from images, web section parsing" },
  { model: "google/gemini-2.5-flash-lite", tier: "Lite", uses: "Scratchpad organization, overlay text generation" },
  { model: "google/gemini-2.5-pro", tier: "Premium", uses: "Premium playground chat" },
  { model: "google/gemini-3-flash-preview", tier: "Preview", uses: "Outreach messages, article contact extraction, image prompt building, scratchpad (secondary)" },
  { model: "openai/gpt-5-mini", tier: "Alt", uses: "Playground chat (user-selectable)" },
];

const imageModels = [
  { model: "google/gemini-2.5-flash-image", tier: "Default", uses: "Cover images, collection covers, smart layer images" },
  { model: "google/gemini-3-pro-image-preview", tier: "Premium", uses: "Premium image generation engine" },
  { model: "google/gemini-3.1-flash-image-preview", tier: "Fast", uses: "PDF page image generation" },
];

const frontendLibraries = [
  { name: "React 18 + TypeScript", pkg: "react, react-dom", purpose: "Core UI framework" },
  { name: "Vite + SWC", pkg: "vite", purpose: "Build tooling with fast HMR" },
  { name: "Tailwind CSS", pkg: "tailwindcss", purpose: "Utility-first styling with design tokens" },
  { name: "shadcn/ui (Radix UI)", pkg: "@radix-ui/*", purpose: "20+ accessible UI primitives (Dialog, Select, Tabs, Toast, etc.)" },
  { name: "TanStack React Query", pkg: "@tanstack/react-query", purpose: "Server state management, caching, and background refetching" },
  { name: "React Router v6", pkg: "react-router-dom", purpose: "Client-side routing with nested layouts and guards" },
  { name: "Tiptap", pkg: "@tiptap/react", purpose: "Rich text editor (story bank, message editing)" },
  { name: "React Flow", pkg: "reactflow", purpose: "Visual journey/flow diagram builder" },
  { name: "Recharts", pkg: "recharts", purpose: "Data visualization (analytics charts, dashboards)" },
  { name: "Embla Carousel", pkg: "embla-carousel-react", purpose: "Image carousels and slideshows" },
  { name: "React Resizable Panels", pkg: "react-resizable-panels", purpose: "Split-pane layouts" },
  { name: "cmdk", pkg: "cmdk", purpose: "Command palette interface" },
  { name: "Zod + React Hook Form", pkg: "zod, react-hook-form", purpose: "Schema validation and form management" },
  { name: "date-fns", pkg: "date-fns", purpose: "Date formatting and manipulation" },
  { name: "Lucide React", pkg: "lucide-react", purpose: "Icon library (462+ icons)" },
  { name: "next-themes", pkg: "next-themes", purpose: "Dark/light mode theming" },
  { name: "Sonner", pkg: "sonner", purpose: "Toast notification system" },
  { name: "Framer Motion (via CVA)", pkg: "class-variance-authority", purpose: "Component variant management" },
];

const documentProcessing = [
  { name: "PDF.js", pkg: "pdfjs-dist", purpose: "Client-side PDF text extraction (large PDFs without backend round-trip)" },
  { name: "Mammoth", pkg: "mammoth", purpose: "Word document (.docx) text extraction" },
  { name: "jsPDF", pkg: "jspdf", purpose: "PDF generation and export (reports, campaigns)" },
  { name: "html-to-image", pkg: "html-to-image", purpose: "DOM-to-image screenshot capture" },
  { name: "html2canvas", pkg: "html2canvas", purpose: "HTML element to canvas rendering" },
  { name: "react-markdown", pkg: "react-markdown", purpose: "Markdown content rendering (playground, AI responses)" },
];

const crmIntegrations = [
  { name: "Salesforce Marketing Cloud (SFMC)", type: "API", purpose: "Push content to SFMC Content Builder via REST API", functions: "push-to-sfmc" },
  { name: "Technolutions Slate", type: "API", purpose: "Push content to Slate Deliver via REST API", functions: "push-to-slate" },
  { name: "Ellucian CRM Recruit", type: "Export", purpose: "XML export format for Recruit communications", functions: "Client-side export" },
  { name: "Generic CSV / JSON", type: "Export", purpose: "Universal export for any CRM system", functions: "Client-side export" },
];

const edgeFunctionGroups = [
  {
    label: "Content DNA Engine",
    icon: Brain,
    functions: [
      { name: "analyze-voice", model: "gemini-2.5-flash", purpose: "Extract voice profile & brand platform from uploaded samples" },
      { name: "extract-semantics", model: "gemini-2.5-flash", purpose: "Derive key themes and semantic summary from content samples" },
    ],
  },
  {
    label: "Generation Suite",
    icon: Zap,
    functions: [
      { name: "generate-message", model: "gemini-2.5-flash", purpose: "Multi-mode message generation with DNA enforcement" },
      { name: "playground-chat", model: "gemini-2.5-pro / gpt-5-mini", purpose: "Conversational AI copywriter with streaming" },
      { name: "generate-outreach-message", model: "gemini-3-flash-preview", purpose: "Prospect outreach email generation" },
      { name: "generate-overlay-text", model: "gemini-2.5-flash-lite", purpose: "Short text for image overlays" },
    ],
  },
  {
    label: "Evaluation & Analysis",
    icon: Shield,
    functions: [
      { name: "evaluate-message", model: "gemini-2.5-flash", purpose: "5-pillar behavioral science scoring with brand adherence" },
      { name: "analyze-web-content", model: "gemini-2.5-flash", purpose: "Website content analysis for brand consistency" },
      { name: "analyze-campus-photo", model: "gemini-2.5-flash", purpose: "Campus photography analysis for brand alignment" },
    ],
  },
  {
    label: "Image Generation",
    icon: ImageIcon,
    functions: [
      { name: "generate-channel-image", model: "gemini-2.5-flash-image", purpose: "Channel-specific images (social, email headers)" },
      { name: "generate-cover-image", model: "gemini-2.5-flash-image", purpose: "Library message cover images" },
      { name: "generate-collection-cover", model: "gemini-2.5-flash-image", purpose: "Collection cover art" },
      { name: "smart-layer-image", model: "gemini-2.5-flash-image", purpose: "Brand overlay compositing" },
      { name: "generate-pdf-images", model: "gemini-3.1-flash-image-preview", purpose: "PDF page visual generation" },
    ],
  },
  {
    label: "Content Parsing",
    icon: Server,
    functions: [
      { name: "parse-fact-book", model: "gemini-2.5-flash", purpose: "Extract structured facts from institutional documents" },
      { name: "parse-story", model: "gemini-2.5-flash", purpose: "Parse narratives into structured story bank entries" },
      { name: "parse-web-sections", model: "gemini-2.5-flash", purpose: "Parse crawled web pages into structured sections" },
      { name: "extract-text-from-image", model: "gemini-2.5-flash", purpose: "OCR-style text extraction from images" },
      { name: "extract-article-contacts", model: "gemini-3-flash-preview", purpose: "Extract contact information from articles" },
      { name: "parse-contact-text", model: "gemini-3-flash-preview", purpose: "Parse unstructured contact text into fields" },
    ],
  },
  {
    label: "Data Enrichment",
    icon: Globe,
    functions: [
      { name: "lookup-institution", model: "gemini-2.5-flash", purpose: "Identify institution details from name/domain" },
      { name: "find-contact-email", model: "Firecrawl", purpose: "Discover contact emails from web presence" },
      { name: "find-linkedin-profile", model: "Firecrawl", purpose: "Find LinkedIn profiles for contacts" },
      { name: "search-university-logo", model: "Firecrawl", purpose: "Find official university logos" },
    ],
  },
  {
    label: "CRM Push",
    icon: Plug,
    functions: [
      { name: "push-to-sfmc", model: "Salesforce API", purpose: "Push approved content to SFMC Content Builder" },
      { name: "push-to-slate", model: "Slate API", purpose: "Push approved content to Slate Deliver" },
    ],
  },
  {
    label: "Email & Communications",
    icon: MailIcon,
    functions: [
      { name: "send-invite-email", model: "Resend", purpose: "Team member invitation emails" },
      { name: "send-referral-email", model: "Resend", purpose: "Colleague referral emails" },
      { name: "send-demo-request", model: "Resend", purpose: "Demo request notification to sales" },
      { name: "send-beta-feedback-email", model: "Resend", purpose: "Beta feedback submission notification" },
      { name: "send-approval-email", model: "Resend", purpose: "Content approval request emails" },
      { name: "send-engagement-emails", model: "Resend", purpose: "Batch engagement nudge emails" },
      { name: "send-reengagement-email", model: "Resend", purpose: "Re-engagement campaign emails" },
      { name: "send-prospect-email", model: "Resend", purpose: "Sales prospect outreach emails" },
      { name: "send-request-confirmation", model: "Resend", purpose: "Access request confirmation emails" },
      { name: "send-test-email", model: "Resend", purpose: "Template test/preview emails" },
      { name: "resend-invite", model: "Resend", purpose: "Re-send expired invitation emails" },
      { name: "resend-webhook", model: "Webhook", purpose: "Process Resend delivery status webhooks (delivered, bounced, opened)" },
      { name: "track-email-click", model: "Redirect", purpose: "Track email link clicks via redirect proxy" },
    ],
  },
  {
    label: "Web Crawling",
    icon: Globe,
    functions: [
      { name: "firecrawl-scrape", model: "Firecrawl", purpose: "Scrape individual web page content" },
      { name: "firecrawl-search", model: "Firecrawl", purpose: "Search the web for relevant content" },
      { name: "firecrawl-map", model: "Firecrawl", purpose: "Map all pages on a website domain" },
    ],
  },
  {
    label: "Admin & Auth",
    icon: Shield,
    functions: [
      { name: "admin-users", model: "Supabase Admin", purpose: "User management (list, invite, update roles)" },
      { name: "bootstrap-admin", model: "Supabase Admin", purpose: "Initial super admin account setup" },
      { name: "impersonate-user", model: "Supabase Admin", purpose: "Super admin user impersonation for support" },
    ],
  },
  {
    label: "Utility",
    icon: RefreshCw,
    functions: [
      { name: "organize-scratchpad", model: "gemini-2.5-flash-lite", purpose: "Auto-organize scratchpad notes into structured content" },
    ],
  },
];

const externalServices = [
  { name: "Firecrawl", purpose: "Web scraping, search, and site mapping", functions: "firecrawl-scrape, firecrawl-search, firecrawl-map, find-contact-email, find-linkedin-profile, search-university-logo" },
  { name: "Resend", purpose: "Transactional email delivery & webhook tracking", functions: "11 send-* functions, resend-webhook, track-email-click" },
  { name: "Salesforce MC", purpose: "Marketing content distribution", functions: "push-to-sfmc" },
  { name: "Slate (Technolutions)", purpose: "Enrollment communication delivery", functions: "push-to-slate" },
];

const backendInfra = [
  { component: "Postgres (via Supabase)", purpose: "Primary database with Row-Level Security for multi-tenant data isolation" },
  { component: "Supabase Auth", purpose: "Authentication with email/password, invite-based onboarding, and session management" },
  { component: "Edge Functions (Deno)", purpose: "35+ serverless functions for AI, email, CRM, and data processing" },
  { component: "Supabase Storage", purpose: "File uploads — campus photos, content DNA samples, design references, overlay patterns" },
  { component: "Supabase Realtime", purpose: "Live updates for collaborative features and activity feeds" },
  { component: "Lovable AI Gateway", purpose: "Unified AI model routing, auth, and usage tracking (ai.gateway.lovable.dev)" },
];

const infrastructurePatterns = [
  { pattern: "Multi-Tenant RLS", detail: "Every table uses tenant_id-based Row-Level Security for complete data isolation between institutions" },
  { pattern: "Hierarchical Profiles", detail: "Institutional profiles support parent→child hierarchy (University → College → Department) with cascading Content DNA" },
  { pattern: "Lovable AI Gateway", detail: "All LLM calls route through ai.gateway.lovable.dev — unified auth, model routing, and usage tracking" },
  { pattern: "Resilient Fetch", detail: "_shared/resilience.ts — automatic retries with exponential backoff for transient failures" },
  { pattern: "Rate Limiting", detail: "_shared/rateLimit.ts — IP-based rate limiting on public-facing edge functions" },
  { pattern: "Streaming Responses", detail: "playground-chat uses Server-Sent Events for real-time token streaming" },
  { pattern: "Email Event Tracking", detail: "Resend webhooks → resend-webhook function → email_nudges table tracks delivery, opens, bounces, and clicks" },
  { pattern: "Hierarchical DNA Resolution", detail: "Profile → Parent Profile → Tenant — content DNA cascades through institutional hierarchy" },
];

const pipelineSteps = [
  { step: "Upload Samples", desc: "PDFs, URLs, or pasted text added as content_dna_samples" },
  { step: "Voice Analysis", desc: "analyze-voice extracts tone, vocabulary, sentence patterns" },
  { step: "Semantic Extraction", desc: "extract-semantics derives themes, keywords, and summary" },
  { step: "Brand Platform", desc: "Structured brand attributes: pillars, taglines, differentiators" },
  { step: "Generation Enforcement", desc: "generate-message injects DNA context into every prompt" },
  { step: "Evaluation Scoring", desc: "evaluate-message measures adherence to extracted DNA" },
];

/* ── Helpers ── */

function tierColor(tier: string) {
  switch (tier) {
    case "Core": return "default";
    case "Premium": return "secondary";
    case "Lite": return "outline";
    case "Preview": return "secondary";
    case "Alt": return "outline";
    case "Default": return "default";
    case "Fast": return "outline";
    default: return "outline";
  }
}

/* ── Page ── */

export default function AITechnologyPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Cpu className="h-6 w-6 text-primary" />
          Technology Stack Reference
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete internal reference for all tools, libraries, AI models, edge functions, and infrastructure powering CampusVoice.ai
        </p>
      </div>

      {/* Section: Frontend Libraries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Package className="h-4 w-4 text-primary" />
            Frontend Libraries & Tools
          </CardTitle>
          <CardDescription>{frontendLibraries.length} key dependencies</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Library</TableHead>
                <TableHead className="w-[180px]">Package</TableHead>
                <TableHead>Purpose</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {frontendLibraries.map((lib) => (
                <TableRow key={lib.name}>
                  <TableCell className="font-medium text-xs">{lib.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{lib.pkg}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{lib.purpose}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Section: Document & Media Processing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-primary" />
            Document & Media Processing
          </CardTitle>
          <CardDescription>{documentProcessing.length} libraries for file handling</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Library</TableHead>
                <TableHead className="w-[140px]">Package</TableHead>
                <TableHead>Purpose</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentProcessing.map((lib) => (
                <TableRow key={lib.name}>
                  <TableCell className="font-medium text-xs">{lib.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{lib.pkg}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{lib.purpose}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Section: AI Text Models */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Brain className="h-4 w-4 text-primary" />
            AI Reasoning & Text Models
          </CardTitle>
          <CardDescription>5 models used across AI-powered edge functions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[260px]">Model</TableHead>
                <TableHead className="w-[80px]">Tier</TableHead>
                <TableHead>Use Cases</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {textModels.map((m) => (
                <TableRow key={m.model}>
                  <TableCell className="font-mono text-xs">{m.model}</TableCell>
                  <TableCell><Badge variant={tierColor(m.tier) as any}>{m.tier}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{m.uses}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Section: AI Image Models */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-primary" />
            AI Image Generation Models
          </CardTitle>
          <CardDescription>3 models for visual content creation</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[260px]">Model</TableHead>
                <TableHead className="w-[80px]">Tier</TableHead>
                <TableHead>Use Cases</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {imageModels.map((m) => (
                <TableRow key={m.model}>
                  <TableCell className="font-mono text-xs">{m.model}</TableCell>
                  <TableCell><Badge variant={tierColor(m.tier) as any}>{m.tier}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{m.uses}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Section: CRM Integrations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Plug className="h-4 w-4 text-primary" />
            CRM Integrations
          </CardTitle>
          <CardDescription>4 CRM platforms supported for content distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">Integration</TableHead>
                <TableHead className="w-[80px]">Type</TableHead>
                <TableHead className="w-[200px]">Purpose</TableHead>
                <TableHead>Functions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crmIntegrations.map((crm) => (
                <TableRow key={crm.name}>
                  <TableCell className="font-medium text-xs">{crm.name}</TableCell>
                  <TableCell><Badge variant="outline">{crm.type}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{crm.purpose}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{crm.functions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Section: Edge Functions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Server className="h-4 w-4 text-primary" />
            Edge Functions Inventory
          </CardTitle>
          <CardDescription>35+ serverless functions organized by capability layer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {edgeFunctionGroups.map((group) => (
            <div key={group.label}>
              <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                <group.icon className="h-3.5 w-3.5 text-primary" />
                {group.label}
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[220px]">Function</TableHead>
                    <TableHead className="w-[200px]">Model / Service</TableHead>
                    <TableHead>Purpose</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.functions.map((fn) => (
                    <TableRow key={fn.name}>
                      <TableCell className="font-mono text-xs">{fn.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fn.model}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fn.purpose}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Separator className="mt-3" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section: External Services */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-primary" />
            External Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Service</TableHead>
                <TableHead className="w-[220px]">Purpose</TableHead>
                <TableHead>Edge Functions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {externalServices.map((s) => (
                <TableRow key={s.name}>
                  <TableCell className="font-semibold text-xs">{s.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.purpose}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{s.functions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Section: Backend Infrastructure */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Database className="h-4 w-4 text-primary" />
            Backend Infrastructure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Component</TableHead>
                <TableHead>Purpose</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backendInfra.map((b) => (
                <TableRow key={b.component}>
                  <TableCell className="font-semibold text-xs">{b.component}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{b.purpose}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Section: Infrastructure Patterns */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Layout className="h-4 w-4 text-primary" />
            Architecture Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {infrastructurePatterns.map((p) => (
            <div key={p.pattern} className="flex gap-3 items-start">
              <Badge variant="outline" className="shrink-0 mt-0.5 text-[10px]">{p.pattern}</Badge>
              <p className="text-xs text-muted-foreground">{p.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section: Content DNA Pipeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Content DNA Pipeline</CardTitle>
          <CardDescription>End-to-end flow from sample ingestion to evaluation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-1">
            {pipelineSteps.map((s, i) => (
              <div key={s.step} className="flex items-center gap-1">
                <div className="border rounded-md px-3 py-2 bg-muted/40">
                  <p className="text-xs font-semibold">{s.step}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
                {i < pipelineSteps.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-[10px] text-muted-foreground text-center pb-4">
        Last updated: March 2026 · Internal use only
      </p>
    </div>
  );
}
