import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Dna, 
  Upload, 
  Sparkles, 
  FileText, 
  MessageSquare,
  TrendingUp,
  Quote,
  Lightbulb,
  CheckCircle2,
  Building2,
  Target,
  BookOpen,
  Zap,
  ArrowRight,
  Workflow,
  Globe
} from "lucide-react";
import campusvoiceLogo from "@/assets/campusvoice-logo.png";
import { FeatureNavigation } from "@/components/FeatureNavigation";
import DNATuningDiagram from "@/components/DNATuningDiagram";
import { SEOHead } from "@/components/SEOHead";
import { FeatureBreadcrumbs } from "@/components/FeatureBreadcrumbs";
import { MobileNav } from "@/components/MobileNav";

const capabilities = [
  {
    icon: Upload,
    title: "Upload Content Samples",
    description: "Add emails, newsletters, speeches, social posts, and web copy. Support for PDF, Word, and text files with automatic text extraction.",
  },
  {
    icon: Globe,
    title: "Web Content Import",
    description: "Scrape content directly from your institution's website. Discover pages, import in bulk, and build your Content DNA from live web sources.",
  },
  {
    icon: Sparkles,
    title: "AI Voice Analysis",
    description: "Our AI analyzes your samples to extract tone, sentence patterns, vocabulary preferences, and rhetorical techniques unique to your institution.",
  },
  {
    icon: Building2,
    title: "Profile-Specific DNA",
    description: "Create distinct Content DNA profiles for different schools, departments, or campaign types within your institution.",
  },
  {
    icon: Target,
    title: "Brand Platform Integration",
    description: "Connect your brand promise, pillars, proof points, and commitments to inform every message generated.",
  },
];

const voiceTraits = [
  { label: "Tone Analysis", description: "Formal vs conversational, inspiring vs practical" },
  { label: "Sentence Patterns", description: "Average length, complexity, rhythm" },
  { label: "Vocabulary Style", description: "Academic, accessible, industry-specific terms" },
  { label: "Rhetorical Techniques", description: "Questions, calls-to-action, storytelling patterns" },
  { label: "Sample Phrases", description: "Key expressions that define your voice" },
];

const sampleTypes = [
  "Email",
  "SMS/Text",
  "Newsletter",
  "News Story",
  "Speech/Remarks",
  "Social Media",
  "Website Copy",
  "Marketing Material",
];

export default function ContentDNAFeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Content DNA Studio - AI Voice Analysis | CampusVoice.AI"
        description="Upload content samples or scrape your website to build your institution's unique Content DNA. AI-powered voice analysis for consistent, on-brand messaging."
        keywords={['content DNA', 'voice analysis', 'AI brand voice', 'higher education messaging', 'institutional voice']}
      />
      
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={campusvoiceLogo} alt="CampusVoice" className="h-8" />
            </Link>
            <div className="hidden md:block">
              <FeatureBreadcrumbs items={[
                { label: 'Features', href: '/features/message-builder' },
                { label: 'Content DNA Studio' }
              ]} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden md:inline-flex">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link to="/login" className="hidden md:inline-flex">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/request-access" className="hidden md:inline-flex">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Join Beta
              </Button>
            </Link>
            <MobileNav />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-background to-pink-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(270_60%_90%_/_0.3),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(330_60%_85%_/_0.25),_transparent_50%)]" />
        
        {/* Lens flares */}
        <div className="absolute top-20 right-[12%] w-32 h-32 bg-[hsl(270_70%_60%_/_0.18)] rounded-full blur-2xl" />
        <div className="absolute bottom-36 left-[8%] w-40 h-40 bg-[hsl(330_60%_55%_/_0.15)] rounded-full blur-3xl" />
        <div className="absolute top-44 left-[22%] w-24 h-24 bg-[hsl(82_85%_55%_/_0.12)] rounded-full blur-2xl" />
        <div className="absolute bottom-48 right-[25%] w-20 h-20 bg-[hsl(200_100%_50%_/_0.1)] rounded-full blur-2xl" />
        <div className="absolute top-32 right-[35%] w-16 h-16 bg-[hsl(270_70%_60%_/_0.15)] rounded-full blur-xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 animate-fade-in">
              <Dna className="w-3 h-3 mr-1" />
              AI-Powered Voice Analysis
            </Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Your Institution's
              <span className="block text-primary">Content DNA Studio</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Upload content samples, scrape content from your website, tune voice dimensions, and manage your content library. Build the complete AI foundation for on-brand messaging.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link to="/request-access">
                <Button size="lg" className="gap-2">
                  Request Beta Access
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(270 60% 95%)"/>
          </svg>
        </div>
      </section>

      {/* Voice Analysis Demo */}
      <section className="py-16 bg-[hsl(270_60%_95%)] relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-12 right-[10%] w-28 h-28 bg-[hsl(82_85%_55%_/_0.15)] rounded-full blur-2xl" />
        <div className="absolute bottom-28 left-[6%] w-36 h-36 bg-[hsl(200_100%_50%_/_0.12)] rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-[40%] w-20 h-20 bg-[hsl(330_60%_55%_/_0.1)] rounded-full blur-2xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Upload Interface Mock */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Content Samples</h3>
                  <Badge variant="outline" className="ml-auto">8 samples</Badge>
                </div>
                
                <div className="space-y-3 mb-6">
                  {[
                    { name: "President's Welcome Email", type: "Email", source: "upload" },
                    { name: "Fall Newsletter Intro", type: "Newsletter", source: "upload" },
                    { name: "About Us Page", type: "Website", source: "web" },
                    { name: "Social Media Campaign", type: "Social Media", source: "upload" },
                  ].map((sample, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      {sample.source === "web" ? (
                        <Globe className="w-4 h-4 text-primary" />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm flex-1">{sample.name}</span>
                      <Badge variant={sample.source === "web" ? "default" : "secondary"} className="text-xs">
                        {sample.source === "web" ? "Web Import" : sample.type}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag files or paste text
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOCX, TXT supported
                  </p>
                </div>
              </div>

              {/* Analysis Results Mock */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Sparkles className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-semibold">Voice Analysis</h3>
                  <Badge className="ml-auto bg-accent text-accent-foreground">Analyzed</Badge>
                </div>

                <div className="space-y-4">
                  {voiceTraits.map((trait, i) => (
                    <div key={i} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                        <span className="font-medium text-sm">{trait.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">{trait.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <div className="flex items-start gap-2">
                    <Quote className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm italic text-foreground">
                        "Your voice combines warmth with academic authority, using conversational openers followed by substantive content..."
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">AI-generated voice summary</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="relative">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0 80L48 70C96 60 192 40 288 35C384 30 480 40 576 45C672 50 768 50 864 45C960 40 1056 30 1152 30C1248 30 1344 40 1392 45L1440 50V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>

      {/* How It Works */}
      <section className="py-20 relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-16 left-[18%] w-32 h-32 bg-[hsl(270_70%_60%_/_0.08)] rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-[15%] w-44 h-44 bg-[hsl(330_60%_55%_/_0.08)] rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Content DNA Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Multiple ways to capture your authentic institutional voice
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {capabilities.map((cap, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <cap.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content DNA Workflow */}
      <section className="py-16 bg-[hsl(270_60%_97%)] relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-8 left-[15%] w-32 h-32 bg-[hsl(270_70%_60%_/_0.12)] rounded-full blur-2xl" />
        <div className="absolute bottom-12 right-[10%] w-40 h-40 bg-[hsl(173_58%_39%_/_0.1)] rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-[30%] w-24 h-24 bg-[hsl(45_93%_47%_/_0.08)] rounded-full blur-2xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Workflow className="w-3 h-3 mr-1" />
                End-to-End Workflow
              </Badge>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                From Samples to On-Brand Content
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See how Content DNA transforms your uploaded samples into perfectly tuned AI-generated messages through our intelligent workflow.
              </p>
            </div>
            
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-xl">
              <DNATuningDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* Sample Types */}
      <section className="py-16 bg-[hsl(330_50%_95%)] relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-12 right-[10%] w-28 h-28 bg-[hsl(270_70%_60%_/_0.12)] rounded-full blur-2xl" />
        <div className="absolute bottom-16 left-[8%] w-32 h-32 bg-[hsl(82_85%_55%_/_0.1)] rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-8">
              Supported Content Types
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {sampleTypes.map((type, i) => (
                <Badge key={i} variant="secondary" className="px-4 py-2 text-sm">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="relative bg-[hsl(330_50%_95%)]">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0 80L60 65C120 50 240 20 360 15C480 10 600 30 720 40C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>

      {/* Benefits */}
      <section className="py-20 relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-1/4 right-[8%] w-36 h-36 bg-[hsl(270_70%_60%_/_0.08)] rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-[12%] w-28 h-28 bg-[hsl(330_60%_55%_/_0.08)] rounded-full blur-2xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="font-serif text-3xl font-bold text-foreground">
                  Why Content DNA Matters
                </h2>
                <p className="text-muted-foreground">
                  Generic AI sounds like everyone else. Content DNA ensures your messages carry the distinct voice your community recognizes and trusts.
                </p>
                <ul className="space-y-3">
                  {[
                    "Consistent voice across all channels",
                    "New staff write like veterans",
                    "AI that sounds like you, not a robot",
                    "Brand platform integration"
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Dna className="w-24 h-24 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore More Features */}
      <FeatureNavigation currentFeatureId="content-dna" />

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Ready to Capture Your Voice?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join the beta to start building your Content DNA profile.
          </p>
          <Link to="/request-access">
            <Button size="lg" variant="secondary" className="gap-2">
              Request Beta Access
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <img src={campusvoiceLogo} alt="CampusVoice" className="h-6 mx-auto mb-4 opacity-60" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CampusVoice. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
