import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Palette,
  Layers,
  Type,
  Sparkles,
  Image,
  Download,
  Move,
  Wand2,
  CheckCircle2,
  Dna,
} from "lucide-react";
import campusvoiceLogo from "@/assets/campusvoice-logo.png";
import { FeatureNavigation } from "@/components/FeatureNavigation";
import { SEOHead, getSoftwareApplicationSchema, getWebPageSchema } from "@/components/SEOHead";
import { FeatureBreadcrumbs } from "@/components/FeatureBreadcrumbs";
import { MobileNav } from "@/components/MobileNav";
import BrandStudioShowcaseDemo from "@/components/feature-showcases/BrandStudioShowcaseDemo";

const overlayLayers = [
  {
    step: "01",
    title: "Your Image",
    description: "Start from an AI-generated image, a library asset, or upload your own.",
    color: "hsl(270 70% 60%)",
    colorMuted: "bg-purple-500/10",
    colorText: "text-purple-600",
  },
  {
    step: "02",
    title: "Brand Pattern",
    description: "Apply institutional patterns with Smart Layer masking — subjects stay in front, patterns stay behind.",
    color: "hsl(200 100% 50%)",
    colorMuted: "bg-blue-500/10",
    colorText: "text-blue-600",
  },
  {
    step: "03",
    title: "Logo & Headlines",
    description: "Drag-and-drop your logo. Add AI-generated or custom headlines with rich text formatting.",
    color: "hsl(82 85% 55%)",
    colorMuted: "bg-green-500/10",
    colorText: "text-green-600",
  },
  {
    step: "04",
    title: "CTA Bar",
    description: "Bottom-bar CTAs with customizable text, colors, and AI-powered copy suggestions.",
    color: "hsl(340 75% 55%)",
    colorMuted: "bg-pink-500/10",
    colorText: "text-pink-600",
  },
];

const smartLayerFeatures = [
  "Subject stays in front of the pattern — hair, clothing, accessories all preserved",
  "Pattern extends edge-to-edge with no cropping or fading",
  "Three-layer masking: Background → Pattern → Subject",
  "Works with any AI-generated or uploaded image",
];

const capabilities = [
  {
    icon: Layers,
    title: "Smart Layer Masking",
    description: "AI segments subjects with pixel-perfect precision. Brand patterns sit naturally between background and subject.",
  },
  {
    icon: Type,
    title: "Rich Text Headlines",
    description: "Free-form draggable headlines with full formatting — fonts, sizes, colors, shadows. Position anywhere on the canvas.",
  },
  {
    icon: Wand2,
    title: "AI Copy Generation",
    description: "Click Generate and get brand-aligned headlines and CTAs based on your scene, audience, and strategic goal.",
  },
  {
    icon: Move,
    title: "Drag & Drop Canvas",
    description: "Reposition logos, headlines, and CTA bars interactively. What you see is what gets exported.",
  },
  {
    icon: Dna,
    title: "Custom Pattern Library",
    description: "Upload institutional patterns or choose from built-in options. Patterns auto-adapt to each image.",
  },
  {
    icon: Download,
    title: "High-Fidelity Export",
    description: "Download in PNG, JPG, or PDF with exact pixel fidelity. Saved assets preserve full editing state for round-trip workflows.",
  },
];

export default function BrandStudioFeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="AI Brand Studio - Smart Overlay Editor | CampusVoice.AI"
        description="Layer logos, headlines, CTAs, and brand patterns onto any image with AI-powered Smart Layer masking. On-brand visual branding for higher education."
        keywords={["brand overlay editor", "smart layer masking", "institutional branding", "AI brand studio"]}
        jsonLd={[
          getWebPageSchema("AI Brand Studio", "Smart overlay editor for institutional branding", "https://engage-ethos.lovable.app/features/brand-studio"),
          getSoftwareApplicationSchema("AI Brand Studio", "Layer logos, headlines, CTAs, and brand patterns onto any image with AI-powered Smart Layer masking.", ["Smart Layer", "AI Headlines", "Pattern Overlays", "Multi-Format Export"]),
        ]}
      />

      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2"><img src={campusvoiceLogo} alt="CampusVoice" className="h-8" /></Link>
            <div className="hidden md:block"><FeatureBreadcrumbs items={[{ label: "Features" }, { label: "AI Brand Studio" }]} /></div>
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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-background to-blue-500/5" />
        <div className="absolute top-20 right-[12%] w-32 h-32 bg-[hsl(270_70%_60%_/_0.15)] rounded-full blur-2xl" />
        <div className="absolute bottom-36 left-[8%] w-40 h-40 bg-[hsl(200_100%_50%_/_0.12)] rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-purple-500/10 text-purple-600 border-purple-500/20 animate-fade-in">
              <Palette className="w-3 h-3 mr-1" />
              Visual Branding
            </Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Brand Any Image.
              <span className="block text-purple-600">In Seconds.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Layer your logo, brand patterns, AI-generated headlines, and CTAs onto any image with Smart Layer masking that keeps subjects looking natural.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link to="/request-access">
                <Button size="lg" className="gap-2 bg-purple-600 hover:bg-purple-700">
                  Get Early Access <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(270 60% 96%)" />
          </svg>
        </div>
      </section>

      {/* The Layering Process */}
      <section className="py-16 bg-[hsl(270_60%_96%)] relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Four Layers. One Branded Image.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Every branded image is built progressively — image, pattern, headlines, CTA — with AI assisting at each step.</p>
          </div>

          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {overlayLayers.map((layer) => (
              <div key={layer.step} className="relative bg-card rounded-xl border-2 p-5 hover:shadow-lg transition-shadow" style={{ borderColor: `${layer.color}40` }}>
                <div className="text-xs font-bold px-2 py-0.5 rounded-full w-fit mb-3" style={{ background: layer.color, color: "white" }}>{layer.step}</div>
                <h3 className="font-semibold text-foreground mb-2">{layer.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{layer.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Layer Deep Dive */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-blue-500/10 text-blue-600 border-blue-500/20">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
              <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Smart Layer Masking</h2>
              <p className="text-muted-foreground mb-6">Traditional overlays cover your subject. Smart Layer uses AI segmentation to place brand patterns behind people, creating depth without distortion.</p>
              <ul className="space-y-3">
                {smartLayerFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual diagram */}
            <div className="relative">
              <div className="rounded-2xl border-2 border-border overflow-hidden shadow-xl bg-gradient-to-br from-purple-50 to-blue-50 p-8">
                <div className="space-y-3">
                  {["Background", "Pattern", "Subject"].map((label, i) => {
                    const colors = ["bg-blue-200 border-blue-300", "bg-purple-200 border-purple-300", "bg-green-200 border-green-300"];
                    return (
                      <div key={label} className={`rounded-lg border-2 p-4 text-center font-medium text-sm ${colors[i]}`} style={{ marginLeft: `${i * 16}px` }}>
                        Layer {i + 1}: {label}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">Three-layer depth composition</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Full Creative Control</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {capabilities.map((cap) => (
              <div key={cap.title} className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
                <div className="p-2.5 rounded-lg bg-purple-500/10 w-fit mb-4">
                  <cap.icon className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-[15%] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-[10%] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">Ready to brand every image in seconds?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">From raw photo to fully branded asset — with AI-powered patterns, headlines, and CTAs.</p>
          <Link to="/request-access">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 font-bold px-8">
              Get Early Access <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <FeatureNavigation currentFeatureId="brand-studio" />
    </div>
  );
}
