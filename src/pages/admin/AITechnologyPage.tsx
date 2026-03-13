import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Cpu, Zap, Brain, ImageIcon, Globe, Mail, Shield, ArrowRight, Server, RefreshCw } from "lucide-react";
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
    label: "Utility",
    icon: RefreshCw,
    functions: [
      { name: "organize-scratchpad", model: "gemini-2.5-flash-lite", purpose: "Auto-organize scratchpad notes into structured content" },
    ],
  },
];

const externalServices = [
  { name: "Firecrawl", purpose: "Web scraping, search, and site mapping", functions: "firecrawl-scrape, firecrawl-search, firecrawl-map, find-contact-email, find-linkedin-profile, search-university-logo" },
  { name: "Resend", purpose: "Transactional email delivery", functions: "send-invite-email, send-referral-email, send-demo-request, send-beta-feedback-email, send-approval-email, send-engagement-emails, send-reengagement-email, send-prospect-email, send-request-confirmation, send-test-email, resend-invite" },
];

const infrastructurePatterns = [
  { pattern: "Lovable AI Gateway", detail: "All LLM calls route through ai.gateway.lovable.dev — unified auth, model routing, and usage tracking" },
  { pattern: "Resilient Fetch", detail: "_shared/resilience.ts — automatic retries with exponential backoff for transient failures" },
  { pattern: "Rate Limiting", detail: "_shared/rateLimit.ts — IP-based rate limiting on public-facing edge functions" },
  { pattern: "Streaming Responses", detail: "playground-chat uses Server-Sent Events for real-time token streaming" },
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
          AI Technology Reference
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Internal reference for all AI models, edge functions, and infrastructure powering CampusVoice.ai
        </p>
      </div>

      {/* Section 1: Models */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Reasoning & Text Models</CardTitle>
          <CardDescription>5 models used across 22 edge functions</CardDescription>
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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Image Generation Models</CardTitle>
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

      {/* Section 2: Edge Functions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Edge Functions Inventory</CardTitle>
          <CardDescription>22 serverless functions organized by capability layer</CardDescription>
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

      {/* Section 3: External Services */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">External Services</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Service</TableHead>
                <TableHead className="w-[200px]">Purpose</TableHead>
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

      {/* Section 4: Infrastructure */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Infrastructure Patterns</CardTitle>
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

      {/* Section 5: Content DNA Pipeline */}
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
