import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Cpu, Zap, Brain, ImageIcon, Globe, Mail, Shield, ArrowRight,
  Server, RefreshCw, Package, FileText, Database, MailIcon, Plug,
  Layout, ChevronDown, Sparkles, Eye, Layers, Upload, Search,
  Lock, BarChart3, Type, Palette, Code2, Workflow
} from "lucide-react";
import { WaveBackground } from "@/components/WaveBackground";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

/* ── Inline SVG Logos ── */

function GeminiLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} fill="none">
      <path
        d="M14 0C14 7.732 7.732 14 0 14c7.732 0 14 6.268 14 14 0-7.732 6.268-14 14-14C20.268 14 14 7.732 14 0Z"
        fill="url(#gemini-gradient)"
      />
      <defs>
        <linearGradient id="gemini-gradient" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4285F4" />
          <stop offset="0.5" stopColor="#9B72CB" />
          <stop offset="1" stopColor="#D96570" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function OpenAILogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zM8.392 12.84l-2.02-1.164a.08.08 0 0 1-.038-.057V6.038a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.794 5.42a.795.795 0 0 0-.393.681l-.009 6.738zm1.1-2.368 2.605-1.506 2.606 1.502v3.006l-2.606 1.506-2.605-1.506z" />
    </svg>
  );
}

/* ── Data (unchanged) ── */

const textModels = [
  { model: "gemini-2.5-flash", provider: "google", tier: "Core", uses: "Content DNA analysis, message generation, evaluation, web analysis, parsing" },
  { model: "gemini-2.5-flash-lite", provider: "google", tier: "Lite", uses: "Scratchpad organization, overlay text generation" },
  { model: "gemini-2.5-pro", provider: "google", tier: "Premium", uses: "Premium playground chat, complex reasoning" },
  { model: "gemini-3-flash-preview", provider: "google", tier: "Preview", uses: "Outreach messages, contact extraction, image prompts" },
  { model: "gpt-5-mini", provider: "openai", tier: "Alt", uses: "Playground chat (user-selectable)" },
];

const imageModels = [
  { model: "gemini-2.5-flash-image", provider: "google", tier: "Default", uses: "Cover images, collection covers, smart layer images" },
  { model: "gemini-3-pro-image-preview", provider: "google", tier: "Premium", uses: "Premium image generation engine" },
  { model: "gemini-3.1-flash-image-preview", provider: "google", tier: "Fast", uses: "PDF page image generation" },
];

const frontendLibraries = [
  { name: "React 18", icon: Code2, purpose: "Core UI framework", category: "Framework" },
  { name: "TypeScript", icon: Code2, purpose: "Type-safe development", category: "Framework" },
  { name: "Tailwind CSS", icon: Palette, purpose: "Utility-first styling", category: "Styling" },
  { name: "shadcn/ui", icon: Layers, purpose: "20+ accessible UI primitives", category: "Components" },
  { name: "TanStack Query", icon: RefreshCw, purpose: "Server state & caching", category: "Data" },
  { name: "React Router v6", icon: Workflow, purpose: "Client-side routing", category: "Framework" },
  { name: "Tiptap", icon: Type, purpose: "Rich text editing", category: "Content" },
  { name: "React Flow", icon: Workflow, purpose: "Visual flow diagrams", category: "Visualization" },
  { name: "Recharts", icon: BarChart3, purpose: "Data visualization", category: "Visualization" },
  { name: "Zod", icon: Shield, purpose: "Schema validation", category: "Data" },
  { name: "Lucide", icon: Sparkles, purpose: "462+ icons", category: "Components" },
  { name: "date-fns", icon: RefreshCw, purpose: "Date manipulation", category: "Utility" },
];

const documentProcessing = [
  { name: "PDF.js", icon: FileText, purpose: "Client-side PDF extraction" },
  { name: "Mammoth", icon: FileText, purpose: ".docx text extraction" },
  { name: "jsPDF", icon: FileText, purpose: "PDF generation & export" },
  { name: "html-to-image", icon: ImageIcon, purpose: "DOM screenshot capture" },
  { name: "html2canvas", icon: ImageIcon, purpose: "HTML to canvas rendering" },
  { name: "react-markdown", icon: Type, purpose: "Markdown rendering" },
];

const crmIntegrations = [
  { name: "Salesforce Marketing Cloud", short: "SFMC", type: "API", purpose: "Push content to SFMC Content Builder via REST API", color: "hsl(var(--cyber-blue))" },
  { name: "Technolutions Slate", short: "Slate", type: "API", purpose: "Push content to Slate Deliver via REST API", color: "hsl(var(--accent))" },
  { name: "Ellucian CRM Recruit", short: "Recruit", type: "Export", purpose: "XML export format for communications", color: "hsl(var(--pillar-susceptibility))" },
  { name: "Generic CSV / JSON", short: "Universal", type: "Export", purpose: "Universal export for any CRM system", color: "hsl(var(--muted-foreground))" },
];

const edgeFunctionGroups = [
  {
    label: "Content DNA Engine", icon: Brain, color: "bg-accent/10 text-accent", count: 2,
    functions: [
      { name: "analyze-voice", model: "gemini-2.5-flash", purpose: "Extract voice profile & brand platform" },
      { name: "extract-semantics", model: "gemini-2.5-flash", purpose: "Derive key themes and semantic summary" },
    ],
  },
  {
    label: "Generation Suite", icon: Zap, color: "bg-secondary/20 text-secondary-foreground", count: 4,
    functions: [
      { name: "generate-message", model: "gemini-2.5-flash", purpose: "Multi-mode message generation with DNA enforcement" },
      { name: "playground-chat", model: "gemini-2.5-pro / gpt-5-mini", purpose: "Conversational AI copywriter with streaming" },
      { name: "generate-outreach-message", model: "gemini-3-flash-preview", purpose: "Prospect outreach email generation" },
      { name: "generate-overlay-text", model: "gemini-2.5-flash-lite", purpose: "Short text for image overlays" },
    ],
  },
  {
    label: "Evaluation & Analysis", icon: Shield, color: "bg-primary/10 text-primary", count: 3,
    functions: [
      { name: "evaluate-message", model: "gemini-2.5-flash", purpose: "5-pillar behavioral science scoring" },
      { name: "analyze-web-content", model: "gemini-2.5-flash", purpose: "Website brand consistency analysis" },
      { name: "analyze-campus-photo", model: "gemini-2.5-flash", purpose: "Campus photography brand alignment" },
    ],
  },
  {
    label: "Image Generation", icon: ImageIcon, color: "bg-pillar-ethics/10 text-pillar-ethics", count: 5,
    functions: [
      { name: "generate-channel-image", model: "gemini-2.5-flash-image", purpose: "Channel-specific images (social, email)" },
      { name: "generate-cover-image", model: "gemini-2.5-flash-image", purpose: "Library message cover images" },
      { name: "generate-collection-cover", model: "gemini-2.5-flash-image", purpose: "Collection cover art" },
      { name: "smart-layer-image", model: "gemini-2.5-flash-image", purpose: "Brand overlay compositing" },
      { name: "generate-pdf-images", model: "gemini-3.1-flash-image-preview", purpose: "PDF page visual generation" },
    ],
  },
  {
    label: "Content Parsing", icon: Server, color: "bg-accent/10 text-accent", count: 6,
    functions: [
      { name: "parse-fact-book", model: "gemini-2.5-flash", purpose: "Extract structured facts from documents" },
      { name: "parse-story", model: "gemini-2.5-flash", purpose: "Parse narratives into story bank entries" },
      { name: "parse-web-sections", model: "gemini-2.5-flash", purpose: "Parse crawled pages into sections" },
      { name: "extract-text-from-image", model: "gemini-2.5-flash", purpose: "OCR-style text extraction" },
      { name: "extract-article-contacts", model: "gemini-3-flash-preview", purpose: "Extract contacts from articles" },
      { name: "parse-contact-text", model: "gemini-3-flash-preview", purpose: "Parse unstructured contact text" },
    ],
  },
  {
    label: "Data Enrichment", icon: Search, color: "bg-cyber-blue/10 text-foreground", count: 4,
    functions: [
      { name: "lookup-institution", model: "gemini-2.5-flash", purpose: "Identify institution from name/domain" },
      { name: "find-contact-email", model: "Firecrawl", purpose: "Discover contact emails from web" },
      { name: "find-linkedin-profile", model: "Firecrawl", purpose: "Find LinkedIn profiles" },
      { name: "search-university-logo", model: "Firecrawl", purpose: "Find official university logos" },
    ],
  },
  {
    label: "CRM Push", icon: Plug, color: "bg-pillar-susceptibility/10 text-pillar-susceptibility", count: 2,
    functions: [
      { name: "push-to-sfmc", model: "Salesforce API", purpose: "Push content to SFMC Content Builder" },
      { name: "push-to-slate", model: "Slate API", purpose: "Push content to Slate Deliver" },
    ],
  },
  {
    label: "Email & Comms", icon: MailIcon, color: "bg-secondary/20 text-secondary-foreground", count: 13,
    functions: [
      { name: "send-invite-email", model: "Resend", purpose: "Team member invitations" },
      { name: "send-referral-email", model: "Resend", purpose: "Colleague referrals" },
      { name: "send-demo-request", model: "Resend", purpose: "Demo request to sales" },
      { name: "send-beta-feedback-email", model: "Resend", purpose: "Feedback notifications" },
      { name: "send-approval-email", model: "Resend", purpose: "Content approval requests" },
      { name: "send-engagement-emails", model: "Resend", purpose: "Batch engagement nudges" },
      { name: "send-reengagement-email", model: "Resend", purpose: "Re-engagement campaigns" },
      { name: "send-prospect-email", model: "Resend", purpose: "Prospect outreach" },
      { name: "send-request-confirmation", model: "Resend", purpose: "Access request confirmations" },
      { name: "send-test-email", model: "Resend", purpose: "Template test emails" },
      { name: "resend-invite", model: "Resend", purpose: "Resend expired invitations" },
      { name: "resend-webhook", model: "Webhook", purpose: "Delivery status webhooks" },
      { name: "track-email-click", model: "Redirect", purpose: "Email click tracking" },
    ],
  },
  {
    label: "Web Crawling", icon: Globe, color: "bg-accent/10 text-accent", count: 3,
    functions: [
      { name: "firecrawl-scrape", model: "Firecrawl", purpose: "Scrape individual web pages" },
      { name: "firecrawl-search", model: "Firecrawl", purpose: "Search the web for content" },
      { name: "firecrawl-map", model: "Firecrawl", purpose: "Map all pages on a domain" },
    ],
  },
  {
    label: "Admin & Auth", icon: Lock, color: "bg-primary/10 text-primary", count: 3,
    functions: [
      { name: "admin-users", model: "Admin API", purpose: "User management & roles" },
      { name: "bootstrap-admin", model: "Admin API", purpose: "Initial super admin setup" },
      { name: "impersonate-user", model: "Admin API", purpose: "Support impersonation" },
    ],
  },
  {
    label: "Utility", icon: RefreshCw, color: "bg-muted text-muted-foreground", count: 1,
    functions: [
      { name: "organize-scratchpad", model: "gemini-2.5-flash-lite", purpose: "Auto-organize notes" },
    ],
  },
];

const backendInfra = [
  { component: "Postgres Database", icon: Database, purpose: "Row-Level Security for multi-tenant data isolation" },
  { component: "Authentication", icon: Lock, purpose: "Email/password auth with invite-based onboarding" },
  { component: "Edge Functions", icon: Server, purpose: "35+ Deno serverless functions for AI & integrations" },
  { component: "File Storage", icon: Upload, purpose: "Campus photos, DNA samples, design references, overlays" },
  { component: "Realtime", icon: RefreshCw, purpose: "Live updates for collaborative features" },
  { component: "AI Gateway", icon: Sparkles, purpose: "Unified model routing, auth, and usage tracking" },
];

const pipelineSteps = [
  { step: "Upload", desc: "PDFs, URLs, or pasted text", icon: Upload },
  { step: "Voice Analysis", desc: "Tone, vocabulary, patterns", icon: Brain },
  { step: "Semantic Extraction", desc: "Themes, keywords, summary", icon: Search },
  { step: "Brand Platform", desc: "Pillars, taglines, differentiators", icon: Layers },
  { step: "Generation", desc: "DNA-enforced content creation", icon: Zap },
  { step: "Evaluation", desc: "Adherence scoring & feedback", icon: Eye },
];

const infrastructurePatterns = [
  { pattern: "Multi-Tenant RLS", detail: "Every table uses tenant_id-based Row-Level Security for complete data isolation" },
  { pattern: "Hierarchical Profiles", detail: "University → College → Department with cascading Content DNA" },
  { pattern: "AI Gateway Routing", detail: "All LLM calls through unified gateway for auth, routing, and tracking" },
  { pattern: "Resilient Fetch", detail: "Automatic retries with exponential backoff for transient failures" },
  { pattern: "Rate Limiting", detail: "IP-based rate limiting on public-facing edge functions" },
  { pattern: "Streaming Responses", detail: "Server-Sent Events for real-time token streaming" },
  { pattern: "Email Event Tracking", detail: "Webhooks track delivery, opens, bounces, and clicks" },
  { pattern: "DNA Resolution", detail: "Profile → Parent → Tenant cascading content DNA hierarchy" },
];

/* ── Helpers ── */

const tierStyles: Record<string, string> = {
  Core: "bg-accent/15 text-accent border-accent/30",
  Premium: "bg-secondary/20 text-secondary-foreground border-secondary/40",
  Lite: "bg-muted text-muted-foreground border-border",
  Preview: "bg-pillar-susceptibility/15 text-pillar-susceptibility border-pillar-susceptibility/30",
  Alt: "bg-primary/10 text-primary border-primary/20",
  Default: "bg-accent/15 text-accent border-accent/30",
  Fast: "bg-cyber-blue/15 text-foreground border-cyber-blue/30",
};

const totalFunctions = edgeFunctionGroups.reduce((sum, g) => sum + g.functions.length, 0);

/* ── Page ── */

export default function AITechnologyPage() {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ── Hero ── */}
      <div className="relative -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 sm:px-6 pt-8 pb-16 overflow-hidden rounded-b-2xl">
        <WaveBackground variant="default" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-card/80 backdrop-blur-sm rounded-full border border-border/60 mb-4">
            <Cpu className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-foreground">Platform Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            Technology Platform
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-6">
            The complete technology stack powering intelligent, on-brand communication at scale
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "AI Models", value: "8", icon: Brain },
              { label: "Edge Functions", value: `${totalFunctions}`, icon: Server },
              { label: "Frontend Libraries", value: `${frontendLibraries.length + documentProcessing.length}`, icon: Package },
              { label: "CRM Integrations", value: "4", icon: Plug },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 px-4 py-2 bg-card/90 backdrop-blur-sm rounded-lg border border-border/50 shadow-sm">
                <stat.icon className="h-4 w-4 text-primary" />
                <span className="text-lg font-bold text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-10 px-1">

        {/* ── AI Models ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-accent to-primary" />
            <h2 className="text-xl font-bold text-foreground">AI Models</h2>
            <Badge variant="secondary" className="ml-2">8 models</Badge>
          </div>

          {/* Google Gemini */}
          <div className="card-interactive rounded-xl p-5 mb-4">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[hsl(220_70%_96%)] to-[hsl(270_50%_96%)] border border-border/40">
                <GeminiLogo className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground">Google Gemini</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Primary AI provider — 7 models across text reasoning and image generation</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Text & Reasoning</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {textModels.filter((m) => m.provider === "google").map((m) => (
                  <div key={m.model} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                    <div className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${tierStyles[m.tier]}`}>
                      {m.tier}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{m.model}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{m.uses}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground pt-2">Image Generation</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {imageModels.map((m) => (
                  <div key={m.model} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                    <div className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${tierStyles[m.tier]}`}>
                      {m.tier}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{m.model}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{m.uses}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* OpenAI */}
          <div className="card-interactive rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[hsl(0_0%_96%)] to-[hsl(0_0%_92%)] border border-border/40">
                <OpenAILogo className="h-8 w-8 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground">OpenAI</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Alternative model for user-selectable playground conversations</p>
                <div className="mt-3">
                  {textModels.filter((m) => m.provider === "openai").map((m) => (
                    <div key={m.model} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                      <div className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${tierStyles[m.tier]}`}>
                        {m.tier}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground">{m.model}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{m.uses}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Content DNA Pipeline ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-accent to-accent/40" />
            <h2 className="text-xl font-bold text-foreground">Content DNA Pipeline</h2>
          </div>
          <div className="card-interactive rounded-xl p-5 overflow-x-auto">
            <div className="flex items-stretch gap-2 min-w-[640px]">
              {pipelineSteps.map((s, i) => (
                <div key={s.step} className="flex items-center gap-2 flex-1">
                  <div className="flex-1 text-center p-3 rounded-xl bg-gradient-to-b from-muted/60 to-muted/30 border border-border/50 hover:shadow-md transition-shadow">
                    <div className="mx-auto w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <s.icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">{s.step}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{s.desc}</p>
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <div className="flex items-center shrink-0">
                      <div className="w-5 h-px bg-border relative">
                        <ArrowRight className="h-3 w-3 text-muted-foreground absolute -right-1.5 -top-1.5" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Edge Functions ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-secondary to-secondary/40" />
            <h2 className="text-xl font-bold text-foreground">Edge Functions</h2>
            <Badge variant="secondary" className="ml-2">{totalFunctions} functions</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {edgeFunctionGroups.map((group) => (
              <Collapsible
                key={group.label}
                open={openGroups[group.label]}
                onOpenChange={() => toggleGroup(group.label)}
              >
                <div className="card-interactive rounded-xl overflow-hidden">
                  <CollapsibleTrigger className="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${group.color}`}>
                      <group.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{group.label}</p>
                      <p className="text-[11px] text-muted-foreground">{group.functions.length} function{group.functions.length !== 1 ? "s" : ""}</p>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openGroups[group.label] ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-1.5">
                      {group.functions.map((fn) => (
                        <div key={fn.name} className="flex items-start gap-2 p-2 rounded-md bg-muted/30">
                          <code className="text-[11px] font-mono text-foreground shrink-0">{fn.name}</code>
                          <span className="text-[10px] text-muted-foreground leading-snug">{fn.purpose}</span>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </section>

        {/* ── CRM & Service Integrations ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-pillar-susceptibility to-pillar-susceptibility/40" />
            <h2 className="text-xl font-bold text-foreground">Integrations</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {crmIntegrations.map((crm) => (
              <div key={crm.name} className="card-interactive rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg border border-border/50 flex items-center justify-center bg-muted/30">
                    <Plug className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{crm.name}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0">{crm.type}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{crm.purpose}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* External Services */}
          <div className="grid gap-3 sm:grid-cols-2 mt-3">
            {[
              { name: "Firecrawl", purpose: "Web scraping, search, and site mapping", icon: Globe, count: "6 functions" },
              { name: "Resend", purpose: "Transactional email delivery & webhook tracking", icon: Mail, count: "13 functions" },
            ].map((svc) => (
              <div key={svc.name} className="card-interactive rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg border border-border/50 flex items-center justify-center bg-muted/30">
                    <svc.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{svc.name}</p>
                      <Badge variant="outline" className="text-[10px]">{svc.count}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{svc.purpose}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Frontend Stack ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-cyber-blue to-cyber-blue/40" />
            <h2 className="text-xl font-bold text-foreground">Frontend Stack</h2>
            <Badge variant="secondary" className="ml-2">{frontendLibraries.length} libraries</Badge>
          </div>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {frontendLibraries.map((lib) => (
              <div key={lib.name} className="card-interactive rounded-xl p-3 text-center group">
                <div className="mx-auto w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <lib.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xs font-semibold text-foreground">{lib.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{lib.purpose}</p>
              </div>
            ))}
          </div>

          {/* Document Processing */}
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mt-6 mb-3">Document & Media Processing</p>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {documentProcessing.map((lib) => (
              <div key={lib.name} className="card-interactive rounded-xl p-3 text-center group">
                <div className="mx-auto w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <lib.icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="text-xs font-semibold text-foreground">{lib.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{lib.purpose}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Backend Infrastructure ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-primary/40" />
            <h2 className="text-xl font-bold text-foreground">Backend Infrastructure</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {backendInfra.map((b) => (
              <div key={b.component} className="card-interactive rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                    <b.icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{b.component}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{b.purpose}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Architecture Patterns ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-muted-foreground to-muted-foreground/30" />
            <h2 className="text-xl font-bold text-foreground">Architecture Patterns</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {infrastructurePatterns.map((p) => (
              <div key={p.pattern} className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card hover:shadow-sm transition-shadow">
                <div className="w-1 self-stretch rounded-full bg-primary/20 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground">{p.pattern}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{p.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="text-[10px] text-muted-foreground text-center pt-4 pb-2">
          CampusVoice.ai Technology Platform · Last updated March 2026
        </p>
      </div>
    </div>
  );
}
