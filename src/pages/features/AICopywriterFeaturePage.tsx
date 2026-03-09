import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  MessageSquare,
  Dna,
  BookOpen,
  Sparkles,
  CheckCircle2,
  BarChart3,
  Layers,
  History,
  Trash2,
} from "lucide-react";
import campusvoiceLogo from "@/assets/campusvoice-logo.png";
import { FeatureNavigation } from "@/components/FeatureNavigation";
import { SEOHead, getSoftwareApplicationSchema, getWebPageSchema } from "@/components/SEOHead";
import { FeatureBreadcrumbs } from "@/components/FeatureBreadcrumbs";
import { MobileNav } from "@/components/MobileNav";

const conversationExamples = [
  {
    prompt: "Write an email to admitted students about our new honors program",
    response: "Subject: You've Been Selected — Honors at Lakewood Awaits\n\nDear [First Name],\n\nYour academic record speaks volumes. Now imagine amplifying that potential through Lakewood's new Honors Scholars Program...",
  },
  {
    prompt: "Make it warmer and more conversational",
    response: "Subject: Hey [First Name] — Something Special for Standout Students Like You\n\nWe noticed something about you. Your curiosity, your drive, your willingness to go further...",
  },
  {
    prompt: "Now give me an SMS version",
    response: "[First Name], you're invited to Lakewood's new Honors Program! Smaller classes, research opportunities & a $2K scholarship. Details: lkwd.edu/honors Reply STOP to opt out",
  },
];

const capabilities = [
  {
    icon: Dna,
    title: "Content DNA Aware",
    description: "Every response is grounded in your institution's voice profile, brand platform, fact book, and story bank.",
  },
  {
    icon: Layers,
    title: "Profile Context",
    description: "Automatically applies the right institutional profile — university-wide or department-specific — to every conversation.",
  },
  {
    icon: MessageSquare,
    title: "Iterative Refinement",
    description: "Don't start over. Say 'make it shorter' or 'add a stat about retention' and the AI refines in place.",
  },
  {
    icon: BookOpen,
    title: "Fact & Story Integration",
    description: "Reference your fact book and story bank directly. The AI weaves in real institutional data and narratives.",
  },
  {
    icon: History,
    title: "Conversation History",
    description: "Pick up where you left off. Full conversation history persists across sessions with collapsible sidebar navigation.",
  },
  {
    icon: BarChart3,
    title: "Multi-Channel Output",
    description: "Ask for email, SMS, social post, or talking points — the AI adapts format, tone, and length to the channel.",
  },
];

export default function AICopywriterFeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="AI Copywriter - Brand-Aware Messaging Assistant | CampusVoice.AI"
        description="Chat your way to on-brand copy. AI Copywriter knows your voice, facts, and stories — generating institutional messaging through natural conversation."
        keywords={["AI copywriter", "brand messaging assistant", "higher education content", "AI writing tool"]}
        jsonLd={[
          getWebPageSchema("AI Copywriter", "Brand-aware messaging assistant for higher education", "https://engage-ethos.lovable.app/features/ai-copywriter"),
          getSoftwareApplicationSchema("AI Copywriter", "A brand-aware messaging assistant that generates institutional content through natural conversation.", ["Conversational AI", "Content DNA Integration", "Multi-Channel Output", "Conversation History"]),
        ]}
      />

      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2"><img src={campusvoiceLogo} alt="CampusVoice" className="h-8" /></Link>
            <div className="hidden md:block"><FeatureBreadcrumbs items={[{ label: "Features" }, { label: "AI Copywriter" }]} /></div>
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
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-background to-blue-500/5" />
        <div className="absolute top-20 right-[12%] w-32 h-32 bg-[hsl(173_58%_45%_/_0.15)] rounded-full blur-2xl" />
        <div className="absolute bottom-36 left-[8%] w-40 h-40 bg-[hsl(200_100%_50%_/_0.12)] rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-teal-500/10 text-teal-600 border-teal-500/20 animate-fade-in">
              <Bot className="w-3 h-3 mr-1" />
              AI Messaging Assistant
            </Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Chat Your Way
              <span className="block text-teal-600">To On-Brand Copy.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              A conversational AI that knows your institution's voice, facts, and stories. Just describe what you need — it writes in your brand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link to="/request-access">
                <Button size="lg" className="gap-2 bg-teal-600 hover:bg-teal-700">
                  Get Early Access <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(173 40% 96%)" />
          </svg>
        </div>
      </section>

      {/* Conversation Demo */}
      <section className="py-16 bg-[hsl(173_40%_96%)] relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Natural Conversation. Brand-Perfect Output.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Iterate through natural language — refine tone, switch channels, add facts — all in the same thread.</p>
          </div>

          {/* Chat mockup */}
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border-2 border-border overflow-hidden shadow-2xl bg-card">
              {/* Header */}
              <div className="bg-muted/80 border-b px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-teal-600" />
                  <span className="font-semibold text-sm text-foreground">AI Copywriter</span>
                  <Badge variant="outline" className="text-xs">Lakewood State · Admissions</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">Content DNA Active</span>
                </div>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-5 max-h-[420px] overflow-y-auto">
                {conversationExamples.map((msg, i) => (
                  <div key={i} className="space-y-3">
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="bg-teal-600 text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%]">
                        <p className="text-sm">{msg.prompt}</p>
                      </div>
                    </div>
                    {/* AI response */}
                    <div className="flex justify-start">
                      <div className="bg-muted/50 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                        <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{msg.response}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input bar */}
              <div className="border-t px-4 py-3 bg-background">
                <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-4 py-2.5">
                  <span className="text-sm text-muted-foreground flex-1">Ask me to write anything...</span>
                  <Sparkles className="w-4 h-4 text-teal-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes It Different */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Not Another Generic AI Writer</h2>
              <p className="text-muted-foreground mb-6">Most AI tools generate bland, generic copy. CampusVoice's AI Copywriter is pre-loaded with your institution's complete brand context:</p>
              <ul className="space-y-3">
                {[
                  "Voice profile — formality, warmth, energy, authority levels",
                  "Brand platform — promise, pillars, commitments, pathways",
                  "Fact book — enrollment stats, rankings, program data",
                  "Story bank — student narratives, alumni success stories",
                  "Terminology rules — preferred and prohibited terms",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* DNA indicator visual */}
            <div className="rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-blue-50 p-8">
              <div className="flex items-center gap-2 mb-6">
                <Dna className="w-5 h-5 text-teal-600" />
                <span className="font-semibold text-foreground">Content DNA Context</span>
              </div>
              <div className="space-y-3">
                {["Voice Profile", "Brand Platform", "Fact Book", "Story Bank", "Terminology"].map((label, i) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-full bg-teal-100 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${95 - i * 5}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap w-28">{label}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">All context is automatically applied to every response</p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Built for Real Workflows</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {capabilities.map((cap) => (
              <div key={cap.title} className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
                <div className="p-2.5 rounded-lg bg-teal-500/10 w-fit mb-4">
                  <cap.icon className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-[15%] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">Ready for a copywriter that actually knows your brand?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">Stop prompting generic AI tools with brand guidelines. Start with an AI that already knows you.</p>
          <Link to="/request-access">
            <Button size="lg" className="bg-white text-teal-600 hover:bg-white/90 font-bold px-8">
              Get Early Access <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <FeatureNavigation currentFeatureId="ai-copywriter" />
    </div>
  );
}
