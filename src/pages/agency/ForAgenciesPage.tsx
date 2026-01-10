import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Users,
  Layers,
  Library,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Clock,
  DollarSign,
  Quote,
  Calendar,
} from "lucide-react";
import campusvoiceLogo from "@/assets/campusvoice-logo-new.png";
import { RequestDemoDialog } from "@/components/landing/RequestDemoDialog";
import { SEOHead } from "@/components/SEOHead";
import { WaveBackground } from "@/components/WaveBackground";
import GlowOrbs from "@/components/landing/GlowOrbs";

const agencyValueProps = [
  {
    icon: Layers,
    title: "Scale Without Sacrifice",
    description:
      "Manage 5 clients or 50 from the same dashboard. Each university gets their own Content DNA workspace—no crossed wires, no brand confusion.",
  },
  {
    icon: Sparkles,
    title: "Brand Precision at Scale",
    description:
      "Every client's voice is unique. Our AI learns each institution's personality and generates content that sounds authentically theirs, not generic.",
  },
  {
    icon: Library,
    title: "Your Playbook, Their Brand",
    description:
      "Build proven message templates once, deploy across clients with automatic brand adaptation. Keep your best ideas working harder.",
  },
  {
    icon: TrendingUp,
    title: "Prove Your Value",
    description:
      "Per-client analytics show exactly how your messaging performs. Walk into every client meeting with data that demonstrates ROI.",
  },
];

const agencyBenefits = [
  {
    title: "Faster Turnaround",
    description: "Generate on-brand drafts in minutes, not hours",
    icon: Clock,
  },
  {
    title: "Higher Margins",
    description: "Serve more clients without scaling headcount",
    icon: DollarSign,
  },
  {
    title: "Consistent Quality",
    description: "Every message meets brand standards—every time",
    icon: Shield,
  },
  {
    title: "Team Collaboration",
    description: "Role-based access keeps the right people on the right accounts",
    icon: Users,
  },
];

const agencyTestimonial = {
  quote:
    "Before CampusVoice, switching between university clients meant mental gymnastics. Now I flip between brands in seconds and every draft is already on-voice. We've doubled our client capacity without adding staff.",
  author: "Sarah Chen",
  role: "VP of Client Services, Meridian Higher Ed",
};

export default function ForAgenciesPage() {
  return (
    <>
      <SEOHead
        title="For Agencies | CampusVoice.AI"
        description="Manage multiple university clients from one platform. Per-client Content DNA, unified templates, and client-tagged workflows for higher ed marketing agencies."
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="relative z-20 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={campusvoiceLogo}
                alt="CampusVoice.AI"
                className="h-8 w-auto max-w-[160px]"
              />
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  For Universities
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/agency/request-access">
                <Button size="sm" className="gap-2 whitespace-nowrap">
                  <Briefcase className="h-4 w-4 hidden sm:block" />
                  <span className="sm:hidden">Apply</span>
                  <span className="hidden sm:inline">Become a Partner</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section with Wave Background */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 h-[600px]">
            <WaveBackground variant="amber" />
          </div>
          <GlowOrbs variant="hero" />
          
          <div className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <Badge
                variant="outline"
                className="mb-6 px-4 py-1.5 text-sm font-medium bg-background/80 backdrop-blur-sm border-primary/30"
              >
                <Briefcase className="h-3.5 w-3.5 mr-2" />
                Agency Partner Program
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-foreground mb-6">
                Your Clients Deserve
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                  Authentic Brand Voice
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Manage multiple university clients without the context-switching chaos.
                CampusVoice learns each institution's unique voice so every message
                sounds authentically theirs—not templated.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/agency/request-access">
                  <Button size="lg" className="gap-2 text-base px-8 shadow-lg hover:shadow-xl transition-shadow">
                    Become a Partner
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <RequestDemoDialog
                  trigger={
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 text-base px-8 bg-background/80 backdrop-blur-sm"
                    >
                      <Calendar className="h-4 w-4" />
                      Schedule a Demo
                    </Button>
                  }
                />
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Multi-Client Support</span>
                </div>
                <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Per-Client Branding</span>
                </div>
                <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Agency Dashboard</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Agency Challenge Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-6">
              The Higher Ed Agency Challenge
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Every university has a distinct voice. But when you're managing multiple clients,
              keeping those voices separate is exhausting. One wrong tone, one mixed-up message,
              and you've undermined the trust you've spent years building.
            </p>
            <p className="text-lg text-foreground font-medium mt-6">
              CampusVoice eliminates that risk entirely.
            </p>
          </div>
        </section>

        {/* Value Props Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
                Built for How Agencies Actually Work
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to manage multiple university clients efficiently,
                without the context-switching overhead.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {agencyValueProps.map((prop, index) => (
                <Card
                  key={prop.title}
                  className="group border-2 hover:border-primary/40 transition-all duration-300 hover:shadow-lg bg-card/50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start gap-5">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                        <prop.icon className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl mb-3 text-foreground">
                          {prop.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {prop.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0">
            <WaveBackground variant="teal" />
          </div>
          <GlowOrbs variant="section" />
          
          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
                Why Agencies Choose CampusVoice
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {agencyBenefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex items-start gap-4 p-6 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
          <div className="max-w-3xl mx-auto">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <CardContent className="p-10 sm:p-12 text-center">
                <Quote className="h-12 w-12 text-primary/30 mx-auto mb-6" />
                <blockquote className="text-xl sm:text-2xl font-serif italic text-foreground mb-8 leading-relaxed">
                  "{agencyTestimonial.quote}"
                </blockquote>
                <div>
                  <p className="font-semibold text-lg text-foreground">
                    {agencyTestimonial.author}
                  </p>
                  <p className="text-muted-foreground">
                    {agencyTestimonial.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works - Quick Overview */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-6">
              Get Started in Three Steps
            </h2>
            
            <div className="grid sm:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold text-lg mb-2">Apply for Partnership</h3>
                <p className="text-sm text-muted-foreground">Quick application to join our agency program</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold text-lg mb-2">Add Your Clients</h3>
                <p className="text-sm text-muted-foreground">Set up each university with their own workspace</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold text-lg mb-2">Start Creating</h3>
                <p className="text-sm text-muted-foreground">Generate on-brand content for every client</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-primary overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-[10%] w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-[15%] w-60 h-60 bg-white rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary-foreground mb-6">
              Ready to Scale Your Agency?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Join the CampusVoice Agency Partner Program and serve more university
              clients without sacrificing quality or burning out your team.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/agency/request-access">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 text-base px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Apply Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <RequestDemoDialog
                trigger={
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 text-base px-10 py-6 text-lg border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <Calendar className="h-4 w-4" />
                    Schedule a Demo
                  </Button>
                }
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 px-4 sm:px-6 lg:px-8 border-t bg-background">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={campusvoiceLogo}
                alt="CampusVoice.AI"
                className="h-7 w-auto max-w-[140px] opacity-70"
              />
              <span className="text-sm text-muted-foreground">
                © 2026 CampusVoice.AI
              </span>
            </div>
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              For Universities →
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}
