import { Link } from "react-router-dom";
import { LandingFooter } from "@/components/landing/LandingFooter";
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
      "Manage 5 institutions or 50 from the same dashboard. Each gets their own Content DNA workspace—no crossed wires, no brand confusion.",
  },
  {
    icon: Sparkles,
    title: "Brand Precision at Scale",
    description:
      "Every institution's voice is unique. Our AI learns each one's personality and generates content that sounds authentically theirs, not generic.",
  },
  {
    icon: Library,
    title: "Your Playbook, Their Brand",
    description:
      "Build proven message templates once, deploy across partner institutions with automatic brand adaptation. Keep your best ideas working harder.",
  },
  {
    icon: TrendingUp,
    title: "Prove Your Value",
    description:
      "Per-institution analytics show exactly how your messaging performs. Walk into every meeting with data that demonstrates ROI.",
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
    description: "Serve more institutions without scaling headcount",
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


export default function ForAgenciesPage() {
  return (
    <>
      <SEOHead
        title="For Agencies | CampusVoice.AI"
        description="Manage multiple partner institutions from one platform. Per-institution Content DNA, unified templates, and institution-tagged workflows for higher ed marketing agencies."
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
                  <span className="hidden sm:inline">Get Early Access</span>
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
                    Get Early Access
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

        {/* Client Portfolio Showcase */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
                Manage Your Entire Portfolio
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Switch between university clients instantly. Each institution gets 
                dedicated Content DNA, messaging history, and brand settings.
              </p>
            </div>

            {/* Mock Client Dashboard */}
            <Card className="border-2 overflow-hidden">
              <div className="bg-muted/50 border-b px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Your University Clients</span>
                  <Badge variant="secondary" className="ml-2">24 Active</Badge>
                  <Badge variant="outline" className="ml-1 text-xs text-muted-foreground border-muted-foreground/30">Example</Badge>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  <Users className="h-4 w-4" />
                  Add Client
                </Button>
              </div>
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {[
                  { name: "Lakewood State University", status: "active", messages: 847, dna: true },
                  { name: "Pacific Ridge University", status: "active", messages: 632, dna: true },
                  { name: "Summit Valley State", status: "active", messages: 521, dna: true },
                  { name: "Northfield University", status: "active", messages: 489, dna: true },
                  { name: "Crestview College", status: "active", messages: 456, dna: true },
                  { name: "Harbor Point University", status: "active", messages: 423, dna: true },
                  { name: "Westbrook State University", status: "active", messages: 398, dna: true },
                  { name: "Pinecrest University", status: "active", messages: 367, dna: true },
                  { name: "Redstone State University", status: "active", messages: 345, dna: true },
                  { name: "Clearwater College", status: "active", messages: 334, dna: true },
                  { name: "Ironwood University", status: "active", messages: 312, dna: true },
                  { name: "Briarfield State", status: "active", messages: 298, dna: true },
                  { name: "Mapleton University", status: "active", messages: 287, dna: true },
                  { name: "Silver Creek College", status: "active", messages: 276, dna: false },
                  { name: "Ashford University", status: "active", messages: 265, dna: true },
                  { name: "Cedar Springs State", status: "active", messages: 254, dna: true },
                  { name: "Willowbrook University", status: "active", messages: 243, dna: true },
                  { name: "Granite Hills College", status: "active", messages: 232, dna: true },
                  { name: "Foxfield University", status: "active", messages: 221, dna: false },
                  { name: "Emerald Coast State", status: "active", messages: 210, dna: true },
                  { name: "Oakridge University", status: "active", messages: 198, dna: true },
                  { name: "Stonegate College", status: "active", messages: 187, dna: true },
                  { name: "Bayview University", status: "active", messages: 176, dna: true },
                  { name: "Thornhill College", status: "active", messages: 165, dna: false },
                ].map((client, index) => (
                  <div 
                    key={client.name}
                    className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {client.name.split(' ').slice(0, 2).map(w => w[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {client.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {client.messages.toLocaleString()} messages generated
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {client.dna ? (
                        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                          <Sparkles className="h-3 w-3 mr-1" />
                          DNA Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Setup Needed
                        </Badge>
                      )}
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Each client workspace includes Content DNA, message library, templates, and analytics—completely isolated from other clients.
            </p>
          </div>
        </section>

        {/* How It Works - Quick Overview */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
              How to Become a Partner
            </h2>
            <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
              We work closely with each agency partner to ensure the right fit and pricing for your client portfolio.
            </p>
            
            <div className="grid sm:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold text-lg mb-2">Submit Interest</h3>
                <p className="text-sm text-muted-foreground">Tell us about your agency and university clients</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold text-lg mb-2">Discovery Call</h3>
                <p className="text-sm text-muted-foreground">We'll discuss scope, scale, and usage to determine the right plan</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold text-lg mb-2">Onboarding</h3>
                <p className="text-sm text-muted-foreground">Get set up with your agency dashboard and first client workspaces</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  4
                </div>
                <h3 className="font-semibold text-lg mb-2">Start Building</h3>
                <p className="text-sm text-muted-foreground">Begin creating on-brand content and managing client accounts</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-10 max-w-xl mx-auto">
              Agency partnership includes custom pricing based on your client count and usage needs. 
              Contact us to learn more about partnership tiers.
            </p>
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
                  Get Early Access
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <RequestDemoDialog
                trigger={
                  <Button
                    size="lg"
                    variant="secondary"
                    className="gap-2 text-base px-10 py-6 text-lg"
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
        <LandingFooter variant="light" />
      </div>
    </>
  );
}
