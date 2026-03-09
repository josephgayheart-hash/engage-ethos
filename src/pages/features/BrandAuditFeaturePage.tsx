import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  BarChart,
  Shield,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Globe,
  Mail,
  Eye,
  Layers,
  Target,
} from "lucide-react";
import campusvoiceLogo from "@/assets/campusvoice-logo.png";
import { FeatureNavigation } from "@/components/FeatureNavigation";
import { SEOHead, getSoftwareApplicationSchema, getWebPageSchema } from "@/components/SEOHead";
import { FeatureBreadcrumbs } from "@/components/FeatureBreadcrumbs";
import { MobileNav } from "@/components/MobileNav";
import BrandAuditShowcaseDemo from "@/components/feature-showcases/BrandAuditShowcaseDemo";

const touchpointTypes = [
  { icon: Globe, label: "Website Pages", desc: "Homepage, program pages, news" },
  { icon: Mail, label: "Email Campaigns", desc: "Admissions, advancement, events" },
  { icon: FileText, label: "Print Materials", desc: "Brochures, postcards, letters" },
  { icon: Eye, label: "Social Content", desc: "Posts, ads, stories" },
];

const scoringDimensions = [
  { label: "Voice Consistency", score: 87, color: "bg-green-500" },
  { label: "Brand Platform Alignment", score: 72, color: "bg-blue-500" },
  { label: "Terminology Compliance", score: 64, color: "bg-yellow-500" },
  { label: "Audience Appropriateness", score: 91, color: "bg-purple-500" },
];

const capabilities = [
  {
    icon: Eye,
    title: "Touchpoint Inventory",
    description: "Catalog every piece of content your institution produces — from web pages to printed brochures to social posts.",
  },
  {
    icon: Shield,
    title: "Brand Scoring Engine",
    description: "AI scores each touchpoint against your voice profile, brand platform, and terminology standards.",
  },
  {
    icon: AlertTriangle,
    title: "Issue Detection",
    description: "Automatically surfaces brand violations — wrong terminology, off-voice tone, missing brand elements.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor remediation progress over time. See scores improve as your team addresses flagged issues.",
  },
  {
    icon: Target,
    title: "Per-Profile Auditing",
    description: "Audit at the institutional level or drill into specific departments and sub-units for granular insights.",
  },
  {
    icon: Layers,
    title: "Remediation Notes",
    description: "Document what was fixed and why. Build an institutional record of brand governance decisions.",
  },
];

export default function BrandAuditFeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Brand Audit & Scoring - Institutional Brand Governance | CampusVoice.AI"
        description="Audit every touchpoint across your institution. Score brand consistency, detect terminology violations, and track remediation progress over time."
        keywords={["brand audit", "brand consistency scoring", "institutional governance", "higher education branding"]}
        jsonLd={[
          getWebPageSchema("Brand Audit & Scoring", "Institutional brand governance for higher education", "https://engage-ethos.lovable.app/features/brand-audit"),
          getSoftwareApplicationSchema("Brand Audit & Scoring", "Audit touchpoints, score brand consistency, and track remediation across your institution.", ["Touchpoint Inventory", "Brand Scoring", "Issue Detection", "Progress Tracking"]),
        ]}
      />

      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2"><img src={campusvoiceLogo} alt="CampusVoice" className="h-8" /></Link>
            <div className="hidden md:block"><FeatureBreadcrumbs items={[{ label: "Features" }, { label: "Brand Audit & Scoring" }]} /></div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden md:inline-flex"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link>
            <Link to="/login" className="hidden md:inline-flex"><Button variant="outline" size="sm">Sign In</Button></Link>
            <Link to="/request-access" className="hidden md:inline-flex"><Button size="sm">Get Early Access</Button></Link>
            <MobileNav />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-background to-red-500/5" />
        <div className="absolute top-20 right-[12%] w-32 h-32 bg-[hsl(30_90%_55%_/_0.15)] rounded-full blur-2xl" />
        <div className="absolute bottom-36 left-[8%] w-40 h-40 bg-[hsl(0_70%_55%_/_0.1)] rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-amber-500/10 text-amber-600 border-amber-500/20 animate-fade-in">
              <BarChart className="w-3 h-3 mr-1" />
              Brand Governance
            </Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Know Your Brand.
              <span className="block text-amber-600">Everywhere It Lives.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Audit every touchpoint across your institution. Score brand consistency, detect violations, and track remediation — all from one dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link to="/request-access">
                <Button size="lg" className="gap-2 bg-amber-600 hover:bg-amber-700">
                  Get Early Access <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(30 80% 96%)" />
          </svg>
        </div>
      </section>

      {/* Scoring Dashboard Preview */}
      <section className="py-16 bg-[hsl(30_80%_96%)] relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Your Brand Health at a Glance</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">AI scores every dimension of brand consistency across all audited touchpoints.</p>
          </div>

          {/* Score card mock */}
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border-2 border-border overflow-hidden shadow-2xl bg-card">
              <div className="bg-muted/80 border-b px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-sm text-foreground">Brand Consistency Report</span>
                </div>
                <Badge variant="outline" className="text-xs">Lakewood State University</Badge>
              </div>
              <div className="p-6">
                {/* Overall score */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-amber-400 bg-amber-50 mb-3">
                    <span className="text-3xl font-bold text-amber-600">78</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Overall Brand Consistency Score</p>
                  <p className="text-xs text-muted-foreground">Based on 142 touchpoints audited</p>
                </div>

                {/* Dimension scores */}
                <div className="space-y-4">
                  {scoringDimensions.map((dim) => (
                    <div key={dim.label} className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground w-48 shrink-0">{dim.label}</span>
                      <div className="flex-1 bg-muted rounded-full h-3">
                        <div className={`${dim.color} h-3 rounded-full transition-all duration-1000`} style={{ width: `${dim.score}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-foreground w-10 text-right">{dim.score}</span>
                    </div>
                  ))}
                </div>

                {/* Issues summary */}
                <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-500">12</p>
                    <p className="text-xs text-muted-foreground">Critical Issues</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-500">28</p>
                    <p className="text-xs text-muted-foreground">Warnings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">102</p>
                    <p className="text-xs text-muted-foreground">Passing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Touchpoint Types */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Audit Every Touchpoint</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">From your homepage to printed postcards — catalog and score every piece of content your institution produces.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {touchpointTypes.map((t) => (
              <div key={t.label} className="p-5 rounded-xl border border-border bg-card text-center hover:shadow-md transition-shadow">
                <div className="p-3 rounded-lg bg-amber-500/10 w-fit mx-auto mb-3">
                  <t.icon className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-sm">{t.label}</h3>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Complete Brand Intelligence</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {capabilities.map((cap) => (
              <div key={cap.title} className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
                <div className="p-2.5 rounded-lg bg-amber-500/10 w-fit mb-4">
                  <cap.icon className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-red-500 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-[15%] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">Ready to know where your brand stands?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">Start auditing touchpoints today. Protect your brand across every department.</p>
          <Link to="/request-access">
            <Button size="lg" className="bg-white text-amber-600 hover:bg-white/90 font-bold px-8">
              Get Early Access <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <FeatureNavigation currentFeatureId="brand-audit" />
    </div>
  );
}
