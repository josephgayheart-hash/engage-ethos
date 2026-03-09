import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Search,
  Dna,
  FileText,
  CheckCircle2,
  Sparkles,
  Layers,
  Zap,
  Target,
  Eye,
} from "lucide-react";
import campusvoiceLogo from "@/assets/campusvoice-logo.png";
import { FeatureNavigation } from "@/components/FeatureNavigation";
import { SEOHead, getSoftwareApplicationSchema, getWebPageSchema } from "@/components/SEOHead";
import { FeatureBreadcrumbs } from "@/components/FeatureBreadcrumbs";
import { MobileNav } from "@/components/MobileNav";

const crawlSteps = [
  {
    step: "1",
    title: "Enter Your URL",
    description: "Provide your institution's homepage or any starting page. The crawler maps your entire site structure.",
    icon: Globe,
    color: "bg-blue-500",
  },
  {
    step: "2",
    title: "AI Analyzes Content",
    description: "Natural language processing extracts voice patterns, terminology, tone markers, and brand signals from every page.",
    icon: Search,
    color: "bg-purple-500",
  },
  {
    step: "3",
    title: "Content DNA Generated",
    description: "Results flow directly into your Content DNA — voice profile, terminology patterns, and structural analysis.",
    icon: Dna,
    color: "bg-green-500",
  },
];

const extractionTypes = [
  { label: "Voice Patterns", desc: "Formality, warmth, energy, authority", icon: "🎯" },
  { label: "Terminology", desc: "Preferred terms, phrases, and naming conventions", icon: "📝" },
  { label: "Brand Signals", desc: "Values, commitments, differentiators", icon: "🏛️" },
  { label: "Tone Markers", desc: "How your institution speaks to different audiences", icon: "🎤" },
  { label: "Page Structure", desc: "Content hierarchy, navigation patterns, information architecture", icon: "🗂️" },
  { label: "Key Themes", desc: "Recurring topics, strategic emphases, campaign language", icon: "💡" },
];

const capabilities = [
  {
    icon: Zap,
    title: "Automatic Site Mapping",
    description: "The crawler discovers all pages linked from your starting URL. No manual page entry required.",
  },
  {
    icon: Layers,
    title: "Section-Level Analysis",
    description: "Each page is broken into semantic sections — headers, body copy, CTAs — for granular voice extraction.",
  },
  {
    icon: Target,
    title: "Per-Page Scoring",
    description: "See which pages are most on-brand and which deviate. Prioritize content updates with data.",
  },
  {
    icon: Eye,
    title: "Visual Screenshot Capture",
    description: "The crawler captures screenshots of every analyzed page for quick visual reference.",
  },
  {
    icon: FileText,
    title: "Exportable Reports",
    description: "Download comprehensive analysis reports showing voice extraction results and recommendations.",
  },
  {
    icon: Dna,
    title: "Direct DNA Integration",
    description: "Crawl results feed directly into your Content DNA analysis — no manual data entry between tools.",
  },
];

export default function WebCrawlFeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="WebCrawl Intelligence - AI Voice Extraction | CampusVoice.AI"
        description="Automatically extract your institution's brand voice from your website. AI crawls your pages to understand tone, terminology, and brand signals."
        keywords={["web crawl AI", "brand voice extraction", "website analysis", "content intelligence"]}
        jsonLd={[
          getWebPageSchema("WebCrawl Intelligence", "AI-powered brand voice extraction from your website", "https://engage-ethos.lovable.app/features/webcrawl"),
          getSoftwareApplicationSchema("WebCrawl Intelligence", "Automatically extract brand voice, terminology, and tone from your institutional website.", ["Site Mapping", "Voice Extraction", "Terminology Analysis", "Screenshot Capture"]),
        ]}
      />

      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2"><img src={campusvoiceLogo} alt="CampusVoice" className="h-8" /></Link>
            <div className="hidden md:block"><FeatureBreadcrumbs items={[{ label: "Features" }, { label: "WebCrawl Intelligence" }]} /></div>
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-background to-green-500/5" />
        <div className="absolute top-20 right-[12%] w-32 h-32 bg-[hsl(200_100%_50%_/_0.15)] rounded-full blur-2xl" />
        <div className="absolute bottom-36 left-[8%] w-40 h-40 bg-[hsl(82_85%_55%_/_0.12)] rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-500/10 text-blue-600 border-blue-500/20 animate-fade-in">
              <Globe className="w-3 h-3 mr-1" />
              Content Intelligence
            </Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Your Website
              <span className="block text-blue-600">Already Knows Your Voice.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Point our AI crawler at your website and it extracts your brand voice, terminology patterns, and tone markers — automatically building your Content DNA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link to="/request-access">
                <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                  Get Early Access <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(200 70% 96%)" />
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-[hsl(200_70%_96%)] relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Three Steps to Voice Intelligence</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">From URL to Content DNA in minutes — no manual content entry required.</p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            {crawlSteps.map((step, i) => (
              <div key={step.step} className="relative text-center">
                <div className={`w-14 h-14 rounded-full ${step.color} text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  {step.step}
                </div>
                {i < crawlSteps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-px bg-border" />
                )}
                <h3 className="font-semibold text-lg text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Gets Extracted */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">What the Crawler Extracts</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Six dimensions of brand intelligence, automatically extracted from your existing web content.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {extractionTypes.map((t) => (
              <div key={t.label} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:border-blue-300 hover:shadow-sm transition-all">
                <span className="text-xl mt-0.5">{t.icon}</span>
                <div>
                  <p className="font-medium text-sm text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* URL Input Mock */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border-2 border-border overflow-hidden shadow-2xl bg-card">
              <div className="bg-muted/80 border-b px-5 py-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-sm text-foreground">WebCrawl Intelligence</span>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Institution Website URL</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-muted/40 rounded-lg px-4 py-3 text-sm text-muted-foreground border border-border">
                      https://www.lakewoodstate.edu
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                      <Search className="w-4 h-4" />
                      Start Crawl
                    </Button>
                  </div>
                </div>

                {/* Simulated results */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">47 pages discovered</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">Voice patterns extracted from 12,400 words</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">34 terminology patterns identified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                    <span className="text-muted-foreground">Generating Content DNA analysis...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Full Crawl Capabilities</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {capabilities.map((cap) => (
              <div key={cap.title} className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
                <div className="p-2.5 rounded-lg bg-blue-500/10 w-fit mb-4">
                  <cap.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-500 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-[15%] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">Ready to extract your brand voice automatically?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">Your website already speaks in your voice. Let AI turn that into actionable Content DNA.</p>
          <Link to="/request-access">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 font-bold px-8">
              Get Early Access <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <FeatureNavigation currentFeatureId="webcrawl" />
    </div>
  );
}
