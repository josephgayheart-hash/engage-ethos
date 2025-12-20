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
  ArrowRight
} from "lucide-react";
import uplaybookLogo from "@/assets/uplaybook-logo.png";

const capabilities = [
  {
    icon: Upload,
    title: "Upload Content Samples",
    description: "Add emails, newsletters, speeches, social posts, and web copy. Support for PDF, Word, and text files with automatic text extraction.",
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
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={uplaybookLogo} alt="UPlaybook" className="h-8" />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/request-access">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Join Beta
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Dna className="w-3 h-3 mr-1" />
              AI-Powered Voice Analysis
            </Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your Institution's
              <span className="block text-primary">Content DNA</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload your best communications and let AI learn your unique voice. Every message generated will sound authentically yours—not generic AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/request-access">
                <Button size="lg" className="gap-2">
                  Request Beta Access
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Analysis Demo */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
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
                  {["President's Welcome Email", "Fall Newsletter Intro", "Commencement Speech", "Social Media Campaign"].map((sample, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm flex-1">{sample}</span>
                      <Badge variant="secondary" className="text-xs">
                        {sampleTypes[i % sampleTypes.length]}
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

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Content DNA Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to capture your authentic institutional voice
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

      {/* Sample Types */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
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

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
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
          <img src={uplaybookLogo} alt="UPlaybook" className="h-6 mx-auto mb-4 opacity-60" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} UPlaybook. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
