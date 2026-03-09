import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Image,
  Camera,
  Palette,
  Sparkles,
  CheckCircle2,
  Monitor,
  Smartphone,
  FileText,
  Mail,
  Globe,
  Layers,
  Dna,
  Download,
  Wand2,
  Sun,
  Briefcase,
  Hexagon,
  Waves,
  Type,
  Clock,
  Square,
} from "lucide-react";
import campusvoiceLogo from "@/assets/campusvoice-logo.png";
import { FeatureNavigation } from "@/components/FeatureNavigation";
import { SEOHead, getSoftwareApplicationSchema, getWebPageSchema } from "@/components/SEOHead";
import { FeatureBreadcrumbs } from "@/components/FeatureBreadcrumbs";
import { MobileNav } from "@/components/MobileNav";
import ImageStudioShowcaseDemo from "@/components/feature-showcases/ImageStudioShowcaseDemo";

const formats = [
  { label: "Social Media Post", icon: Smartphone, desc: "Instagram, Facebook, LinkedIn" },
  { label: "Email Header", icon: Mail, desc: "Hero banners and inline images" },
  { label: "Web Banner", icon: Globe, desc: "Homepage, landing page, display ads" },
  { label: "Postcard / Print", icon: FileText, desc: "Direct mail, brochures, posters" },
  { label: "Event Graphic", icon: Monitor, desc: "Digital signage, virtual backgrounds" },
  { label: "Story / Reel", icon: Smartphone, desc: "Vertical-first mobile content" },
];

const photoStyles = [
  { name: "Photorealistic", icon: Camera, desc: "Campus life, student portraits, architecture" },
  { name: "Cinematic", icon: Sparkles, desc: "Dramatic lighting, editorial quality" },
  { name: "Warm & Candid", icon: Sun, desc: "Natural, approachable, authentic feel" },
  { name: "Professional", icon: Briefcase, desc: "Executive portraits, formal events" },
];

const designStyles = [
  { name: "Bold & Geometric", icon: Hexagon, desc: "Clean shapes, strong visual hierarchy" },
  { name: "Gradient Flow", icon: Waves, desc: "Smooth color transitions, modern feel" },
  { name: "Typographic Poster", icon: Type, desc: "Type-driven layouts, impactful headlines" },
  { name: "Collage / Mixed Media", icon: Palette, desc: "Layered textures, editorial style" },
  { name: "Retro / Vintage", icon: Clock, desc: "Nostalgic aesthetics, classic typography" },
  { name: "Abstract Minimal", icon: Square, desc: "Clean, spacious, sophisticated" },
];

const capabilities = [
  {
    icon: Camera,
    title: "Photo & Graphic Design Modes",
    description: "Toggle between photorealistic AI photography and graphic design — each with dedicated style, mood, and layout controls.",
  },
  {
    icon: Layers,
    title: "19 Communication Formats",
    description: "From Instagram stories to direct mail postcards — every format is pre-sized and optimized for its channel.",
  },
  {
    icon: Monitor,
    title: "In-Context Mockup Preview",
    description: "See your image inside realistic device frames — phones, browser windows, magazine spreads — before you download.",
  },
  {
    icon: Dna,
    title: "Content DNA & Design References",
    description: "Upload style references to train the AI on your visual identity. Every generation reflects your brand's design language.",
  },
  {
    icon: Download,
    title: "Multi-Format Export",
    description: "Download in PNG, JPG, or PDF. High-fidelity captures optimized for print or digital distribution.",
  },
  {
    icon: Wand2,
    title: "Blank Canvas Mode",
    description: "Skip AI generation entirely — start from a solid, gradient, or textured background and design from scratch.",
  },
];

export default function ImageStudioFeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="AI Image Studio - On-Brand Visual Generation | CampusVoice.AI"
        description="Generate photorealistic campus imagery and graphic designs across 19 formats. AI-powered visual creation with Content DNA integration for higher education."
        keywords={["AI image generation", "higher education marketing images", "campus photography AI", "graphic design automation"]}
        jsonLd={[
          getWebPageSchema("AI Image Studio", "On-brand visual generation for higher education", "https://engage-ethos.lovable.app/features/image-studio"),
          getSoftwareApplicationSchema("AI Image Studio", "Generate on-brand photography and graphic designs across 19 communication formats.", ["Photo Generation", "Graphic Design", "Mockup Preview", "Multi-Format Export"]),
        ]}
      />

      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={campusvoiceLogo} alt="CampusVoice" className="h-8" />
            </Link>
            <div className="hidden md:block">
              <FeatureBreadcrumbs items={[{ label: "Features" }, { label: "AI Image Studio" }]} />
            </div>
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
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-background to-orange-500/5" />
        <div className="absolute top-20 right-[12%] w-32 h-32 bg-[hsl(340_75%_55%_/_0.15)] rounded-full blur-2xl" />
        <div className="absolute bottom-36 left-[8%] w-40 h-40 bg-[hsl(30_90%_55%_/_0.12)] rounded-full blur-3xl" />
        <div className="absolute top-44 left-[22%] w-24 h-24 bg-[hsl(270_70%_60%_/_0.1)] rounded-full blur-2xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-pink-500/10 text-pink-600 border-pink-500/20 animate-fade-in">
              <Image className="w-3 h-3 mr-1" />
              AI Visual Generation
            </Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Every Image.
              <span className="block text-pink-600">Always On-Brand.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Generate photorealistic campus photography and bold graphic designs across 19 formats — all grounded in your institution's Content DNA and visual identity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link to="/request-access">
                <Button size="lg" className="gap-2 bg-pink-600 hover:bg-pink-700">
                  Get Early Access <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(340 75% 95%)" />
          </svg>
        </div>
      </section>

      {/* Photo vs Graphic Design Mode */}
      <section className="py-16 bg-[hsl(340_75%_95%)] relative overflow-hidden">
        <div className="absolute top-12 right-[10%] w-28 h-28 bg-[hsl(270_70%_60%_/_0.12)] rounded-full blur-2xl" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Two Modes. Infinite Possibilities.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Toggle between photo-realistic AI photography and graphic design mode — each with its own dedicated controls.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Photo Mode */}
            <div className="bg-card rounded-2xl border-2 border-pink-200 p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-pink-500/10">
                  <Camera className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">Photo Mode</h3>
                  <p className="text-sm text-muted-foreground">AI-generated photography</p>
                </div>
              </div>
              <div className="space-y-3">
                {photoStyles.map((s) => (
                  <div key={s.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <s.icon className="w-4 h-4 text-pink-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Graphic Design Mode */}
            <div className="bg-card rounded-2xl border-2 border-orange-200 p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-orange-500/10">
                  <Palette className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">Graphic Design Mode</h3>
                  <p className="text-sm text-muted-foreground">Bold visuals from a design brief</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {designStyles.map((s) => (
                  <div key={s.name} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50">
                    <s.icon className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Format Showcase */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">19 Formats, One Click</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Every format is pre-sized and optimized. Social posts, email headers, print pieces — all from the same generation.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {formats.map((f) => (
              <div key={f.label} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-pink-300 hover:shadow-sm transition-all">
                <div className="p-2 rounded-lg bg-pink-500/10">
                  <f.icon className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* In-Context Mockup Preview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-4">See It In Context</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Every generated image is automatically rendered inside realistic device mockups — phones, browser windows, postcard rotations, magazine spreads.</p>
            </div>

            {/* Mock browser frame */}
            <div className="max-w-3xl mx-auto">
              <div className="rounded-xl border-2 border-border overflow-hidden shadow-2xl">
                <div className="bg-muted/80 border-b px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-background rounded-md px-3 py-1 text-xs text-muted-foreground text-center">campusvoice.ai/image-studio</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-orange-50 p-8 flex items-center justify-center min-h-[280px]">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center mx-auto shadow-lg">
                      <Image className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">In-Context Mockup Preview</p>
                      <p className="text-sm text-muted-foreground">Your image rendered inside realistic device frames</p>
                    </div>
                    <div className="flex justify-center gap-2">
                      <Badge variant="outline" className="text-xs gap-1"><Smartphone className="w-3 h-3" /> Phone</Badge>
                      <Badge variant="outline" className="text-xs gap-1"><Monitor className="w-3 h-3" /> Browser</Badge>
                      <Badge variant="outline" className="text-xs gap-1"><Mail className="w-3 h-3" /> Postcard</Badge>
                      <Badge variant="outline" className="text-xs gap-1"><FileText className="w-3 h-3" /> Magazine</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Built for Brand Teams</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Every feature is designed to keep your visual identity consistent at scale.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {capabilities.map((cap) => (
              <div key={cap.title} className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
                <div className="p-2.5 rounded-lg bg-pink-500/10 w-fit mb-4">
                  <cap.icon className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-pink-600 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-[15%] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-[10%] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">Ready to create on-brand visuals at scale?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">Stop searching stock photo libraries. Generate exactly what you need, grounded in your brand.</p>
          <Link to="/request-access">
            <Button size="lg" className="bg-white text-pink-600 hover:bg-white/90 font-bold px-8">
              Get Early Access <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <FeatureNavigation currentFeatureId="image-studio" />
    </div>
  );
}
