import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight,
  PenTool, 
  Mail, 
  MessageSquare, 
  Phone,
  Globe,
  Search,
  Megaphone,
  FileText,
  Users,
  Target,
  Sparkles,
  CheckCircle2,
  Layers,
  Dna
} from "lucide-react";
import campusvoiceLogo from "@/assets/campusvoice-logo.png";
import { FeatureNavigation } from "@/components/FeatureNavigation";
import { SEOHead } from "@/components/SEOHead";
import { FeatureBreadcrumbs } from "@/components/FeatureBreadcrumbs";
import { MobileNav } from "@/components/MobileNav";
import { BuilderStepsShowcase } from "@/components/BuilderStepsShowcase";

const channels = [
  { icon: Mail, label: "Email", color: "text-blue-500", description: "Subject lines, body copy, CTAs" },
  { icon: MessageSquare, label: "SMS/Text", color: "text-green-500", description: "Character-optimized messaging" },
  { icon: Globe, label: "Landing Page", color: "text-purple-500", description: "Headlines, body, hero copy" },
  { icon: Phone, label: "Call Script", color: "text-orange-500", description: "Opening, purpose, objection handling" },
  { icon: Search, label: "Search Ads", color: "text-red-500", description: "Headlines, descriptions, extensions" },
  { icon: Megaphone, label: "Social Ads", color: "text-pink-500", description: "Primary text, headlines, CTAs" },
  { icon: FileText, label: "Direct Mail", color: "text-amber-500", description: "Letters, postcards, brochures" },
  { icon: Users, label: "Talking Points", color: "text-teal-500", description: "Executive briefings, Q&A prep" },
];

const audiences = [
  "Prospective Students",
  "First-Year Students",
  "Continuing Students",
  "At-Risk Students",
  "Graduate Students",
  "Online Learners",
  "Alumni",
  "Parents/Family",
  "Donors",
  "Policy Makers",
];

const features = [
  {
    icon: Users,
    title: "12 Audience Types",
    description: "From prospective students to donors and policy makers—context-aware messaging for every stakeholder.",
  },
  {
    icon: Target,
    title: "Journey Moment Awareness",
    description: "Pre-enrollment, early term, mid-term, at-risk, graduation—messages tuned to where students are.",
  },
  {
    icon: Layers,
    title: "Brand Layer Selection",
    description: "Choose which brand pillars, proof points, and commitments to emphasize in each message.",
  },
  {
    icon: Dna,
    title: "Content DNA Integration",
    description: "Every message generated reflects your institution's unique voice and vocabulary patterns.",
  },
];

export default function MessageBuilderFeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="AI Message Builder - Multi-Channel Content | CampusVoice.AI"
        description="Generate brand-aligned content across 8 channels including email, SMS, landing pages, and call scripts. AI-powered messaging for higher education."
        keywords={['AI message builder', 'higher education marketing', 'multi-channel messaging', 'enrollment communications']}
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
                { label: 'Features' },
                { label: 'Message Builder' }
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-background to-purple-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(220_70%_90%_/_0.3),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(270_60%_85%_/_0.25),_transparent_50%)]" />
        
        {/* Lens flares */}
        <div className="absolute top-20 right-[12%] w-32 h-32 bg-[hsl(220_70%_60%_/_0.18)] rounded-full blur-2xl" />
        <div className="absolute bottom-36 left-[8%] w-40 h-40 bg-[hsl(270_70%_55%_/_0.15)] rounded-full blur-3xl" />
        <div className="absolute top-44 left-[22%] w-24 h-24 bg-[hsl(200_100%_50%_/_0.12)] rounded-full blur-2xl" />
        <div className="absolute bottom-48 right-[25%] w-20 h-20 bg-[hsl(82_85%_55%_/_0.1)] rounded-full blur-2xl" />
        <div className="absolute top-32 right-[35%] w-16 h-16 bg-[hsl(340_75%_55%_/_0.12)] rounded-full blur-xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-500/10 text-blue-600 border-blue-500/20 animate-fade-in">
              <PenTool className="w-3 h-3 mr-1" />
              AI Message Generation
            </Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              One Click.
              <span className="block text-blue-600">10 Channels.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Select your audience, moment, and goals—then generate brand-aligned content for email, SMS, ads, call scripts, and more simultaneously.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link to="/request-access">
                <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
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
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(220 70% 95%)"/>
          </svg>
        </div>
      </section>

      {/* Channel Showcase */}
      <section className="py-16 bg-[hsl(220_70%_95%)] relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-12 right-[10%] w-28 h-28 bg-[hsl(270_70%_60%_/_0.15)] rounded-full blur-2xl" />
        <div className="absolute bottom-28 left-[6%] w-36 h-36 bg-[hsl(82_85%_55%_/_0.12)] rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-[40%] w-20 h-20 bg-[hsl(200_100%_50%_/_0.1)] rounded-full blur-2xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              Generate Content For Any Channel
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each channel gets optimized content—not one-size-fits-all copy pasted everywhere.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {channels.map((channel, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4 hover:shadow-lg transition-shadow">
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3`}>
                  <channel.icon className={`w-5 h-5 ${channel.color}`} />
                </div>
                <h3 className="font-semibold text-sm mb-1">{channel.label}</h3>
                <p className="text-xs text-muted-foreground">{channel.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 80L48 70C96 60 192 40 288 35C384 30 480 40 576 45C672 50 768 50 864 45C960 40 1056 30 1152 30C1248 30 1344 40 1392 45L1440 50V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Builder Steps Showcase */}
      <section className="py-20 relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-20 left-[15%] w-40 h-40 bg-[hsl(220_70%_60%_/_0.08)] rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-[10%] w-32 h-32 bg-[hsl(82_85%_55%_/_0.1)] rounded-full blur-2xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <BuilderStepsShowcase />
        </div>
      </section>
      <section className="py-20 relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-16 left-[18%] w-32 h-32 bg-[hsl(200_100%_50%_/_0.08)] rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-[15%] w-44 h-44 bg-[hsl(270_70%_60%_/_0.08)] rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Context Selection Mock */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-xl">
                <h3 className="font-semibold mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Message Context
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Audience</label>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <span className="text-sm">First-Year Students</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Journey Moment</label>
                    <div className="p-3 bg-muted rounded-lg border border-border">
                      <span className="text-sm">Early Term Check-In</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Channels</label>
                    <div className="flex flex-wrap gap-2">
                      {["Email", "SMS", "Portal"].map((ch, i) => (
                        <Badge key={i} variant={i === 0 ? "default" : "secondary"}>
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {ch}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Brand Layers</label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-purple-300 text-purple-600">
                        Student Success
                      </Badge>
                      <Badge variant="outline" className="border-purple-300 text-purple-600">
                        Community
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-6 gap-2 bg-blue-600 hover:bg-blue-700">
                  <Sparkles className="w-4 h-4" />
                  Generate Messages
                </Button>
              </div>

              {/* Output Preview Mock */}
              <div className="space-y-4">
                <div className="bg-card rounded-xl border border-border p-5 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-sm">Email</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Subject</div>
                    <div className="text-sm font-medium">Quick check-in: How's your first month going?</div>
                    <div className="text-xs text-muted-foreground mt-3">Preview</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      Hi [First Name], We know the first few weeks can feel overwhelming. That's why we wanted to reach out and see how you're settling in...
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-5 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-sm">SMS</span>
                    <Badge variant="secondary" className="text-xs ml-auto">142 chars</Badge>
                  </div>
                  <div className="text-sm">
                    Hey [First Name]! Your advisor is here to help. Book a quick chat this week: [link]. We're rooting for you! 🎓
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-5 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-purple-500" />
                    <span className="font-medium text-sm">Portal Notification</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">New resources available</span> — Check out our first-year success toolkit with study tips, campus maps, and advisor scheduling.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-[hsl(48_100%_92%)] relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-12 right-[10%] w-28 h-28 bg-[hsl(220_70%_60%_/_0.12)] rounded-full blur-2xl" />
        <div className="absolute bottom-16 left-[8%] w-32 h-32 bg-[hsl(270_70%_60%_/_0.1)] rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              Smart Generation Features
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 80L60 65C120 50 240 20 360 15C480 10 600 30 720 40C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Audience Types */}
      <section className="py-20 relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-1/4 right-[8%] w-36 h-36 bg-[hsl(82_85%_55%_/_0.08)] rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-[12%] w-28 h-28 bg-[hsl(200_100%_50%_/_0.08)] rounded-full blur-2xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-8">
              Built for Higher Ed Audiences
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {audiences.map((audience, i) => (
                <Badge key={i} variant="secondary" className="px-4 py-2 text-sm">
                  {audience}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Explore More Features */}
      <FeatureNavigation currentFeatureId="message-builder" />

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Better Messages?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join the beta to start generating multi-channel content in seconds.
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
