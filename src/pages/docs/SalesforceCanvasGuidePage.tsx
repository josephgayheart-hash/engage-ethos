import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Cloud, Shield, Boxes, Zap } from "lucide-react";

const EMBED_TARGETS = [
  { tool: "AI Copywriter", route: "/embed/playground", surface: "Lightning record page (Account, Lead, Opportunity), SFMC Content Builder block" },
  { tool: "Message Builder", route: "/embed/build", surface: "Lightning utility bar, Campaign record page" },
  { tool: "Region & Tone Adapter (Fieldmark)", route: "/embed/region-adapter", surface: "Account / Territory record page" },
  { tool: "Translation Tool", route: "/embed/translate", surface: "Utility bar (always-available popout)" },
  { tool: "Competitive Analyzer", route: "/embed/competitive-analyzer", surface: "Opportunity record page" },
  { tool: "Campaign Brief", route: "/embed/campaign-brief", surface: "Campaign record page" },
  { tool: "Regional Playbook", route: "/embed/regional-playbook", surface: "Territory / Account record page" },
  { tool: "Brand Audit", route: "/embed/brand-audit", surface: "Account record page" },
  { tool: "Image Generator", route: "/embed/image-generator", surface: "SFMC Content Builder, Campaign page" },
  { tool: "Web Analyzer", route: "/embed/web-analyzer", surface: "Lead / Account record page" },
];

export default function SalesforceCanvasGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Salesforce Canvas Embed Guide | Fieldmark & CampusVoice"
        description="How to embed Fieldmark and CampusVoice tools (Copywriter, Message Builder, Translate, Region Adapter) inside Salesforce as Canvas apps."
      />

      <div className="border-b bg-card/40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" />Back to home</Link>
          </Button>
          <Badge variant="secondary" className="gap-1">
            <Cloud className="w-3 h-3" /> Salesforce integration
          </Badge>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Embedding tools in Salesforce as a Canvas app</h1>
          <p className="text-lg text-muted-foreground">
            Run AI Copywriter, Message Builder, Translate, Region & Tone Adapter, and other tools directly inside
            Sales Cloud, Service Cloud, or Marketing Cloud — without leaving the record you're working on.
          </p>
        </header>

        {/* Already in place */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Boxes className="w-5 h-5 text-primary" />What's already in place</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong className="text-foreground">/embed/* route family</strong> — every supported tool has a headless URL with sidebar and topbar stripped, ready to render inside an iframe.</p>
            <p>• <strong className="text-foreground">Canvas signed-request parser</strong> — extracts the Salesforce user, org ID, instance URL, and OAuth token from the iframe handshake.</p>
            <p>• <strong className="text-foreground">Brand-aware shell</strong> — Fieldmark branding renders automatically for enterprise / franchise / manufacturer workspaces; CampusVoice for Higher-Ed.</p>
            <p>• <strong className="text-foreground">SFMC outbound push</strong> — proven path from a generated message to a Content Builder asset (one-click "Push to SFMC").</p>
          </CardContent>
        </Card>

        {/* How Canvas works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-primary" />How Salesforce Canvas works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ol className="list-decimal list-inside space-y-2">
              <li>You register a <strong className="text-foreground">Connected App</strong> in Salesforce with Canvas enabled, pointing to e.g. <code className="text-xs bg-muted px-1.5 py-0.5 rounded">https://www.campusvoice.ai/embed/playground</code>.</li>
              <li>Salesforce loads that URL in an iframe inside Lightning, Sales Cloud, Service Cloud, or SFMC, and POSTs (or postMessages) a <strong className="text-foreground">signed request</strong> containing the SF user, org, and an OAuth token.</li>
              <li>The app verifies the signed request server-side using the Connected App's <strong className="text-foreground">consumer secret</strong> (HMAC-SHA256), then either maps the SF user to a Fieldmark / CampusVoice user, or runs in a trusted SF session without a separate login.</li>
            </ol>
          </CardContent>
        </Card>

        {/* Embed targets */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended embed targets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Tool</th>
                    <th className="py-2 pr-4 font-medium">Embed route</th>
                    <th className="py-2 font-medium">Best Salesforce surface</th>
                  </tr>
                </thead>
                <tbody>
                  {EMBED_TARGETS.map((t) => (
                    <tr key={t.route} className="border-b last:border-0">
                      <td className="py-2.5 pr-4 font-medium">{t.tool}</td>
                      <td className="py-2.5 pr-4"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{t.route}</code></td>
                      <td className="py-2.5 text-muted-foreground">{t.surface}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Two patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" />Two deployment patterns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-lg border p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">Pattern A</Badge>
                <span className="font-medium">Bring your own login — fastest to demo</span>
              </div>
              <p className="text-muted-foreground">User logs into Fieldmark / CampusVoice once inside the iframe (Google SSO works), then it's remembered on that browser. Ships in days. Best for pilots.</p>
            </div>
            <div className="rounded-lg border p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">Pattern B</Badge>
                <span className="font-medium">True Canvas SSO — production</span>
              </div>
              <p className="text-muted-foreground">Signed request → server-side verify → auto-mint a Lovable session bound to the SF user. Best UX, ~1–2 weeks of work, requires the verification edge function plus an identity-mapping table.</p>
            </div>
          </CardContent>
        </Card>

        {/* What still needs to be built */}
        <Card>
          <CardHeader>
            <CardTitle>What still needs to be built (Pattern B)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong className="text-foreground">1. Signed-request verification edge function</strong> — verifies the HMAC signature using <code className="text-xs bg-muted px-1.5 py-0.5 rounded">SF_CANVAS_CONSUMER_SECRET</code> and returns the parsed SF context. Currently parsed client-side, which is fine for prototyping but not for production.</p>
            <p><strong className="text-foreground">2. SF user → Lovable identity mapping</strong> — table <code className="text-xs bg-muted px-1.5 py-0.5 rounded">sf_canvas_user_links (sf_user_id, sf_org_id, profile_id, tenant_id)</code> plus a one-time "first run" flow where the SF user picks which workspace and profile to bind to.</p>
            <p><strong className="text-foreground">3. Per-tool embed pages</strong> — read pre-fill context from URL params (<code className="text-xs bg-muted px-1.5 py-0.5 rounded">?recordId=001xx&accountName=Acme</code>), hide nav/save UI we don't want in the iframe, and post results back via <code className="text-xs bg-muted px-1.5 py-0.5 rounded">postMessage</code> or the Canvas SDK.</p>
            <p><strong className="text-foreground">4. Canvas SDK include</strong> — load <code className="text-xs bg-muted px-1.5 py-0.5 rounded">publisher.js</code> from the SF instance so the iframe can self-resize and call back into Salesforce.</p>
            <p><strong className="text-foreground">5. CSP / X-Frame-Options</strong> — confirm Lovable hosting allows framing from <code className="text-xs bg-muted px-1.5 py-0.5 rounded">*.force.com</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded">*.salesforce.com</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded">*.lightning.force.com</code>, and <code className="text-xs bg-muted px-1.5 py-0.5 rounded">*.exacttarget.com</code> (SFMC).</p>
          </CardContent>
        </Card>

        <div className="rounded-lg border bg-card p-6 space-y-3">
          <h2 className="text-xl font-semibold">Ready to pilot?</h2>
          <p className="text-muted-foreground text-sm">
            We typically start with <strong>Pattern A</strong> — embedding Copywriter and Translate on a single Lightning record page — so your team can validate the workflow inside Salesforce within a week. Then we layer Canvas SSO on top.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild>
              <Link to="/request-access">Get early access</Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://help.salesforce.com/s/articleView?id=sf.canvas_app_overview.htm" target="_blank" rel="noopener noreferrer">
                Salesforce Canvas docs <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
