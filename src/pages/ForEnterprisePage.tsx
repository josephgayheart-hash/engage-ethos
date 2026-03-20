import { Link } from "react-router-dom";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Factory,
  Globe,
  Heart,
  Building2,
  Landmark,
  Shield,
  Layers,
  CheckCircle2,
  BarChart3,
  Lock,
  Palette,
  Eye,
  ImageIcon,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { RequestDemoDialog } from "@/components/landing/RequestDemoDialog";
import { SEOHead } from "@/components/SEOHead";
import { WaveBackground } from "@/components/WaveBackground";
import GlowOrbs from "@/components/landing/GlowOrbs";
import EnterpriseShowcases from "@/components/enterprise/EnterpriseShowcases";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const industries = [
  {
    icon: Factory,
    title: "Franchise & Reseller Networks",
    pain: "Local dealers creating off-brand ads, translating taglines incorrectly, using outdated logos.",
    example: "Automotive, QSR, retail franchises",
    color: "from-[hsl(var(--cyber-lime))] to-[hsl(82_85%_40%)]",
  },
  {
    icon: Globe,
    title: "Global Enterprises",
    pain: "Regional offices in 40+ countries adapting campaigns without brand guardrails.",
    example: "CPG, tech, manufacturing",
    color: "from-[hsl(var(--cyber-blue))] to-[hsl(200_100%_40%)]",
  },
  {
    icon: Heart,
    title: "Nonprofits & NGOs",
    pain: "Chapters and affiliates diluting the mission message with inconsistent tone and imagery.",
    example: "United Way, Red Cross, advocacy orgs",
    color: "from-[hsl(340_75%_55%)] to-[hsl(340_75%_42%)]",
  },
  {
    icon: Building2,
    title: "Healthcare Systems",
    pain: "Individual hospitals and clinics creating inconsistent patient communications.",
    example: "Hospital networks, insurance groups",
    color: "from-[hsl(var(--accent))] to-[hsl(173_58%_30%)]",
  },
  {
    icon: Landmark,
    title: "Financial Services",
    pain: "Branch offices and advisors going rogue on messaging, risking compliance.",
    example: "Banks, insurance, wealth management",
    color: "from-[hsl(var(--cyber-purple))] to-[hsl(270_70%_45%)]",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Define Your Brand DNA",
    description:
      "Upload brand guidelines, voice samples, and approved messaging. Our AI learns your exact tone, terminology, and visual standards.",
    icon: Palette,
  },
  {
    step: "02",
    title: "Distribute & Govern",
    description:
      "Regional teams generate content within your guardrails. Every output is scored against your brand standard before it goes live.",
    icon: Shield,
  },
  {
    step: "03",
    title: "Monitor & Enforce",
    description:
      "A central dashboard shows brand adherence scores across all regions and affiliates. Flag off-brand content before it reaches customers.",
    icon: Eye,
  },
];

const enterpriseFeatures = [
  {
    icon: Layers,
    title: "Multi-Tier Brand Hierarchies",
    description: "HQ → Region → Local. Each level inherits the parent brand and can customize within approved bounds.",
  },
  {
    icon: BarChart3,
    title: "Brand Adherence Scoring",
    description: "Every asset gets a real-time brand score. Spot drift before it becomes a crisis.",
  },
  {
    icon: CheckCircle2,
    title: "Approval Workflows",
    description: "Route content through HQ review before publish. Configurable by region, channel, or risk level.",
  },
  {
    icon: Lock,
    title: "Voice Enforcement Across Languages",
    description: "Content DNA ensures your brand sounds right in every market, every language.",
  },
  {
    icon: ImageIcon,
    title: "Locked Brand Overlays",
    description: "AI Image Studio with approved templates, color palettes, and logo placement rules baked in.",
  },
  {
    icon: Eye,
    title: "Compliance Audit Dashboard",
    description: "Full visibility into brand health across your entire network. Exportable reports for leadership.",
  },
];

const stats = [
  { value: "19+", label: "Channel Formats" },
  { value: "Real-Time", label: "Brand Scoring" },
  { value: "Multi-Level", label: "Governance" },
  { value: "AI-Powered", label: "Voice Enforcement" },
];

/* ------------------------------------------------------------------ */
/*  Brand Degradation Diagram                                          */
/* ------------------------------------------------------------------ */

function BrandDegradationDiagram() {
  const levels = [
    {
      label: "HQ Brand Team",
      message: "Empowering communities through sustainable innovation and shared prosperity.",
      score: 100,
      color: "border-[hsl(var(--status-strong))]",
      bg: "bg-[hsl(var(--status-strong)_/_0.08)]",
      scoreBg: "bg-[hsl(var(--status-strong))]",
    },
    {
      label: "Regional Marketing",
      message: "We help communities grow with innovative, sustainable solutions.",
      score: 72,
      color: "border-[hsl(var(--status-moderate))]",
      bg: "bg-[hsl(var(--status-moderate)_/_0.08)]",
      scoreBg: "bg-[hsl(var(--status-moderate))]",
    },
    {
      label: "Local Affiliate",
      message: "Great deals on services near you! Call now for a free quote!!",
      score: 23,
      color: "border-[hsl(var(--status-attention))]",
      bg: "bg-[hsl(var(--status-attention)_/_0.08)]",
      scoreBg: "bg-[hsl(var(--status-attention))]",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {levels.map((level, i) => (
        <div key={level.label}>
          <div className={`rounded-xl border-2 ${level.color} ${level.bg} p-5 transition-all`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/50">
                {level.label}
              </span>
              <Badge className={`${level.scoreBg} text-white text-xs font-bold`}>
                {level.score}% on-brand
              </Badge>
            </div>
            <p className="text-primary-foreground font-medium italic">"{level.message}"</p>
          </div>
          {i < levels.length - 1 && (
            <div className="flex items-center justify-center py-2 text-primary-foreground/40">
              <AlertTriangle className="h-4 w-4 mr-2 text-[hsl(var(--status-attention)_/_0.6)]" />
              <span className="text-xs">Brand drift</span>
              <ChevronRight className="h-4 w-4 ml-1 rotate-90" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ForEnterprisePage() {
  return (
    <>
      <SEOHead
        title="Enterprise Brand Control | CampusVoice.AI"
        description="One brand, every market, always on-voice. Control messaging across franchises, affiliates, regions, and chapters with AI-powered brand governance."
      />

      <div className="min-h-screen bg-primary text-primary-foreground">
        {/* Nav */}
        <LandingNav />

        {/* ---- HERO ---- */}
        <section className="relative overflow-hidden">
          <GlowOrbs variant="hero" />
          <div className="relative z-10 pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <Badge
                variant="outline"
                className="mb-6 px-4 py-1.5 text-sm font-medium border-[hsl(var(--cyber-lime)_/_0.4)] text-[hsl(var(--cyber-lime))] bg-[hsl(var(--cyber-lime)_/_0.08)]"
              >
                <Globe className="h-3.5 w-3.5 mr-2" />
                Enterprise Brand Governance
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight mb-6 leading-[1.1]">
                One Brand. Every Market.
                <br />
                <span className="bg-gradient-to-r from-[hsl(var(--cyber-lime))] to-[hsl(var(--cyber-blue))] bg-clip-text text-transparent">
                  Always On-Voice.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-primary-foreground/60 mb-10 max-w-2xl mx-auto leading-relaxed">
                When hundreds of affiliates, resellers, and regional teams create their own content,
                brand drift isn't a risk — it's a certainty. Take back control with the
                AI-powered brand command center.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <RequestDemoDialog
                  trigger={
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-[hsl(var(--cyber-lime))] to-[hsl(82_85%_45%)] text-primary hover:from-[hsl(82_85%_50%)] hover:to-[hsl(82_85%_40%)] font-bold rounded-full px-8 text-base"
                    >
                      Request a Demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  }
                />
                <a href="#how-it-works">
                  <Button
                    size="lg"
                    className="border border-[hsl(var(--cyber-lime)_/_0.4)] bg-transparent text-[hsl(var(--cyber-lime))] hover:bg-[hsl(var(--cyber-lime)_/_0.1)] rounded-full px-8 text-base"
                  >
                    See How It Works
                  </Button>
                </a>
              </div>

              {/* Industry icon strip */}
              <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-primary-foreground/30">
                {industries.map((ind) => (
                  <div key={ind.title} className="flex items-center gap-2 text-xs uppercase tracking-wider">
                    <ind.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{ind.title.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---- THE PROBLEM ---- */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-primary-foreground/[0.03]">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
              The Brand Degradation Problem
            </h2>
            <p className="text-primary-foreground/60 text-lg max-w-2xl mx-auto">
              Without centralized governance, your carefully crafted brand message
              degrades at every level — like a game of telephone with your reputation at stake.
            </p>
          </div>
          <BrandDegradationDiagram />
          <p className="text-center mt-8 text-sm text-primary-foreground/40 max-w-lg mx-auto">
            Every layer of delegation introduces drift. By the time your message reaches the local level,
            it's unrecognizable — and your brand pays the price.
          </p>
        </section>

        {/* ---- HOW IT WORKS ---- */}
        <section id="how-it-works" className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
                How Brand Governance Works
              </h2>
              <p className="text-primary-foreground/60 text-lg max-w-2xl mx-auto">
                Three steps to ensure every piece of content, in every market, sounds like it came from HQ.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {howItWorks.map((step) => (
                <div
                  key={step.step}
                  className="relative p-6 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.03] hover:bg-primary-foreground/[0.06] transition-colors"
                >
                  <span className="text-5xl font-serif font-bold text-[hsl(var(--cyber-lime)_/_0.15)] absolute top-4 right-5 select-none">
                    {step.step}
                  </span>
                  <div className="p-3 rounded-xl bg-[hsl(var(--cyber-lime)_/_0.1)] w-fit mb-4">
                    <step.icon className="h-6 w-6 text-[hsl(var(--cyber-lime))]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-primary-foreground/60 text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- INDUSTRY USE CASES ---- */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-foreground/[0.03]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
                Built for Distributed Brands
              </h2>
              <p className="text-primary-foreground/60 text-lg max-w-2xl mx-auto">
                Any organization with decentralized teams creating content needs a brand command center.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {industries.map((ind) => (
                <Card
                  key={ind.title}
                  className="bg-primary-foreground/[0.04] border-primary-foreground/10 hover:border-[hsl(var(--cyber-lime)_/_0.3)] transition-all group"
                >
                  <CardContent className="p-6">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${ind.color} w-fit mb-4 opacity-80 group-hover:opacity-100 transition-opacity`}>
                      <ind.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary-foreground mb-2">{ind.title}</h3>
                    <p className="text-sm text-primary-foreground/60 mb-3">{ind.pain}</p>
                    <span className="text-xs text-primary-foreground/40 italic">{ind.example}</span>
                  </CardContent>
                </Card>
              ))}

              {/* Extra CTA card */}
              <Card className="bg-primary-foreground/[0.04] border-primary-foreground/10 border-dashed flex items-center justify-center min-h-[180px]">
                <CardContent className="p-6 text-center">
                  <p className="text-primary-foreground/60 text-sm mb-4">
                    Don't see your industry? We work with any distributed organization.
                  </p>
                  <RequestDemoDialog
                    trigger={
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-[hsl(var(--cyber-lime))] to-[hsl(82_85%_45%)] text-primary hover:from-[hsl(82_85%_50%)] hover:to-[hsl(82_85%_40%)] font-bold"
                      >
                        Talk to Us
                        <ArrowRight className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ---- PRODUCT SHOWCASES ---- */}
        <EnterpriseShowcases />

        {/* ---- ENTERPRISE FEATURES GRID ---- */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
                Enterprise-Grade Brand Control
              </h2>
              <p className="text-primary-foreground/60 text-lg max-w-2xl mx-auto">
                Purpose-built features for organizations that can't afford brand inconsistency.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enterpriseFeatures.map((feat) => (
                <div
                  key={feat.title}
                  className="p-6 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.03] hover:bg-primary-foreground/[0.06] transition-colors"
                >
                  <div className="p-2.5 rounded-lg bg-[hsl(var(--cyber-purple)_/_0.1)] w-fit mb-3">
                    <feat.icon className="h-5 w-5 text-[hsl(var(--cyber-purple))]" />
                  </div>
                  <h3 className="font-semibold text-base mb-1.5">{feat.title}</h3>
                  <p className="text-sm text-primary-foreground/60 leading-relaxed">{feat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- STATS STRIP ---- */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-primary-foreground/10 bg-primary-foreground/[0.02]">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-[hsl(var(--cyber-lime))]">
                  {s.value}
                </p>
                <p className="text-xs text-primary-foreground/50 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---- FINAL CTA ---- */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
              See It in Action for Your Industry
            </h2>
            <p className="text-primary-foreground/60 text-lg mb-8 max-w-xl mx-auto">
              Schedule a personalized demo and discover how CampusVoice gives your brand team
              complete control — no matter how distributed your organization.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <RequestDemoDialog
                trigger={
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[hsl(var(--cyber-lime))] to-[hsl(82_85%_45%)] text-primary hover:from-[hsl(82_85%_50%)] hover:to-[hsl(82_85%_40%)] font-bold rounded-full px-8 text-base"
                  >
                    Request a Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                }
              />
              <Link to="/request-access">
                <Button
                  size="lg"
                  className="border border-[hsl(var(--cyber-lime)_/_0.4)] bg-transparent text-[hsl(var(--cyber-lime))] hover:bg-[hsl(var(--cyber-lime)_/_0.1)] rounded-full px-8 text-base"
                >
                  Get Early Access
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <LandingFooter variant="dark" />
      </div>
    </>
  );
}
