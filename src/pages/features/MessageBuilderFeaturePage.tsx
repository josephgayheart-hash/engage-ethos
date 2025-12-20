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
import uplaybookLogo from "@/assets/uplaybook-logo.png";
import { FeatureNavigation } from "@/components/FeatureNavigation";

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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-background to-purple-500/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-500/10 text-blue-600 border-blue-500/20">
              <PenTool className="w-3 h-3 mr-1" />
              AI Message Generation
            </Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              One Click.
              <span className="block text-blue-600">10 Channels.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Select your audience, moment, and goals—then generate brand-aligned content for email, SMS, ads, call scripts, and more simultaneously.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/request-access">
                <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                  Request Beta Access
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Channel Showcase */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
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
      </section>

      {/* Builder Interface Mock */}
      <section className="py-20">
        <div className="container mx-auto px-4">
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
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
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
      </section>

      {/* Audience Types */}
      <section className="py-20">
        <div className="container mx-auto px-4">
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
          <img src={uplaybookLogo} alt="UPlaybook" className="h-6 mx-auto mb-4 opacity-60" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} UPlaybook. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
