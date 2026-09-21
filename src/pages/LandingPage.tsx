import { lazy, Suspense } from 'react';
import { Link } from '@/lib/router-compat';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  BarChart3,
  BookOpen,
  Shield,
  ArrowRight,
  Sparkles,
  Target,
  Brain,
  Zap,
  CheckCircle2,
  GraduationCap,
  Globe,
  Image,
  Palette,
  Bot,
  PenTool,
  BarChart,
  Layers,
} from 'lucide-react';
import campusvoiceLogo from '@/assets/campusvoice-logo-new.png';
import fieldmarkLogoWhite from '@/assets/fieldmark-logo-white.png';
import HowItWorksSection from '@/components/landing/HowItWorksSection';

import PricingSignalSection from '@/components/landing/PricingSignalSection';
import AICredibilitySection from '@/components/landing/AICredibilitySection';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SEOHead, getOrganizationSchema, getSoftwareApplicationSchema } from '@/components/SEOHead';
import { StickyCtaBar } from '@/components/landing/StickyCtaBar';
import { SocialProofStrip } from '@/components/landing/SocialProofStrip';
import { HeroProductProof } from '@/components/landing/HeroProductProof';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

// Lazy-load heavy below-the-fold showcases for faster mobile LCP
const ProductTourTabs = lazy(() => import('@/components/landing/ProductTourTabs'));
const MessageBuilderShowcase = lazy(() =>
  import('@/components/landing/ProductShowcases').then(m => ({ default: m.MessageBuilderShowcase }))
);
const JourneyBuilderShowcase = lazy(() =>
  import('@/components/landing/ProductShowcases').then(m => ({ default: m.JourneyBuilderShowcase }))
);

// JSON-LD schemas for landing page
const landingPageSchemas = [
  getOrganizationSchema(),
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CampusVoice.AI',
    url: 'https://www.campusvoice.ai',
    description: 'Strategic Messaging Intelligence for Brand Teams',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.campusvoice.ai/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  },
  getSoftwareApplicationSchema(
    'CampusVoice.AI',
    'AI-powered strategic messaging intelligence platform. Plan, strategize, and execute brand-aligned communications at scale for education, enterprise, nonprofit, and healthcare.',
    [
      'AI Message Builder',
      'Content DNA Studio',
      'Journey Flow Planner',
      'Message Evaluator',
      'Content Library'
    ]
  )
];

const features = [
  {
    icon: MessageSquare,
    title: 'Brand-Aligned Messaging',
    description: 'Generate content grounded in your brand promise and positioning.',
    link: '/features/message-builder',
  },
  {
    icon: BarChart3,
    title: 'Content DNA Studio',
    description: 'Upload samples or scrape your site. AI extracts voice and brand elements.',
    link: '/features/content-dna',
  },
  {
    icon: Bot,
    title: 'AI Copywriter',
    description: 'A brand-aware assistant that knows your voice, facts, and stories.',
    link: '/features/ai-copywriter',
  },
  {
    icon: Target,
    title: 'Journey Flow Builder',
    description: 'Map multi-channel strategies with duration and intensity controls.',
    link: '/features/journey-designer',
  },
  {
    icon: BookOpen,
    title: 'Content Library',
    description: 'Governed content with approval workflows and shared collections.',
    link: '/features/library',
  },
  {
    icon: Layers,
    title: 'More Capabilities',
    description: 'Image Studio, Brand Studio, Evaluator, WebCrawl and Brand Audit.',
    link: '/features',
  },
];

const valueProps = [
  {
    title: 'Brand Protection at Scale',
    description: 'Guard your brand across every department — no extra meetings required.',
  },
  {
    title: 'Subunit Governance',
    description: 'One institutional profile. Subunits inherit or customize as needed.',
  },
  {
    title: 'Audience-First Messaging',
    description: "Start with who you\u2019re reaching. Align to brand pillars automatically.",
  },
  {
    title: 'Journey Planning',
    description: 'Map multi-week flows with intensity controls and visual timelines.',
  },
];

const trustIndicators = [
  { icon: Shield, label: 'Brand Governance' },
  { icon: Brain, label: 'Brand Platform-Driven' },
  { icon: GraduationCap, label: 'Built for Teams' },
];

function ScrollRevealSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn(
        "transition-none",
        isVisible ? "opacity-100 animate-reveal-up" : "opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StickyCtaBar />
      <SEOHead
        title="CampusVoice.AI - Strategic Messaging Intelligence for Brand Teams"
        description="Plan, strategize, and execute brand-aligned communications at scale. Research-driven messaging intelligence for education, enterprise, nonprofit, and healthcare."
        keywords={['brand communications', 'strategic messaging', 'brand messaging AI', 'content governance', 'audience engagement']}
        jsonLd={landingPageSchemas}
      />

      {/* Hero Section — Warm stone ground, arctic signal */}
      <header
        className="relative overflow-hidden border-b border-border"
        style={{ background: 'linear-gradient(170deg, hsl(50 32% 97%) 0%, hsl(51 22% 94%) 60%, hsl(50 30% 96%) 100%)' }}
      >
        {/* Navigation */}
        <LandingNav tone="light" />

        {/* Precision grid */}
        <div
          className="absolute inset-0 opacity-[0.5] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, hsl(60 4% 10% / 0.06) 1px, transparent 1px), linear-gradient(to bottom, hsl(60 4% 10% / 0.06) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)',
          }}
        />
        {/* Single cold signal wash */}
        <div
          className="hidden sm:block absolute -top-24 right-[6%] w-[28rem] h-[28rem] rounded-full blur-[110px] pointer-events-none"
          style={{ background: 'hsl(216 100% 50% / 0.09)' }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">
            {/* Left: copy */}
            <div className="space-y-6">
              <div className="animate-fade-in">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <Sparkles className="w-3 h-3 text-[hsl(216_100%_45%)]" />
                  Strategic Messaging Intelligence
                </span>
              </div>

              <h1
                className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] tracking-[-0.03em] leading-[1.05] animate-fade-in"
                style={{ animationDelay: '0.1s' }}
              >
                <span className="text-foreground">AI copywriting that stays</span>{' '}
                <span className="text-[hsl(216_100%_45%)]">on your brand.</span>
              </h1>

              <p
                className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed animate-fade-in"
                style={{ animationDelay: '0.2s' }}
              >
                Upload your brand voice once. Generate emails, social posts, journeys, and campaigns that sound like{' '}
                <span className="text-foreground font-semibold">you</span> — across every channel.
              </p>

              <div
                className="flex flex-col sm:flex-row gap-3 pt-1 animate-fade-in"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="flex flex-col">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 px-7 rounded-lg bg-[hsl(216_100%_50%)] text-white font-semibold border-0 shadow-[0_10px_30px_-12px_hsl(216_100%_50%_/_0.5)] hover:bg-[hsl(216_100%_45%)] transition-colors"
                  >
                    <Link to="/try-copywriter">
                      Try It Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <span className="text-muted-foreground text-[10px] mt-1.5 font-medium tracking-wide">Free · No signup</span>
                </div>
                <div className="flex flex-col">
                  <Button
                    asChild
                    variant="ghost"
                    size="lg"
                    className="h-12 px-7 rounded-lg border border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Link to="/login?signup=1">Create Your Account</Link>
                  </Button>
                  <span className="text-muted-foreground text-[10px] mt-1.5 font-medium tracking-wide">
                    Instant access · Free beta
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <p className="text-muted-foreground text-sm">
                  For higher-ed, enterprise, nonprofit, and healthcare brand teams.
                </p>
                <Link to="/login" className="text-muted-foreground text-xs hover:text-foreground transition-colors underline decoration-border underline-offset-4">
                  Already have an account? Sign in
                </Link>
              </div>
            </div>

            {/* Right: layered signal panel */}
            <div className="relative animate-fade-in" style={{ animationDelay: '0.25s' }}>
              <div className="absolute inset-x-4 -bottom-3 h-full rounded-xl border border-border bg-muted/60" />
              <div className="relative rounded-xl border border-border bg-card shadow-[var(--shadow-lg)] overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Brand alignment
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(216_100%_50%)]" />
                    Live
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { label: 'Voice match', value: 'On brand' },
                    { label: 'Reading level', value: 'Grade 9' },
                    { label: 'Channel fit', value: 'Email · Social' },
                    { label: 'Governance', value: 'PII blocked' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between px-4 py-3.5">
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <span className="text-sm font-semibold text-foreground">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border bg-muted/50 px-4 py-3">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Every draft is checked against your brand voice, audience, and compliance rules before it ships.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero product proof — static, mobile-fast */}
      <HeroProductProof />

      {/* Social Proof Strip */}
      <SocialProofStrip />

      {/* AI Credibility — Position #2 */}
      <ScrollRevealSection>
        <AICredibilitySection />
      </ScrollRevealSection>

      {/* How It Works Section */}
      <ScrollRevealSection>
        <HowItWorksSection />
      </ScrollRevealSection>

      {/* Product Showcases Section — Top 2 inline + 3 tabbed */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
        <div className="absolute top-24 right-[8%] w-64 h-64 bg-[hsl(216_100%_50%_/_0.05)] rounded-full blur-[90px]" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-24 sm:space-y-32">
          <ScrollRevealSection>
            <div className="text-center">
              <Badge className="mb-4 rounded-full bg-[hsl(216_100%_50%_/_0.08)] text-[hsl(216_100%_38%)] border-[hsl(216_100%_50%_/_0.25)] uppercase tracking-[0.12em] text-[11px] font-semibold">
                <Sparkles className="w-3 h-3 mr-1" />
                Product Tour
              </Badge>
              <h2 className="font-display tracking-[-0.02em] text-2xl sm:text-3xl text-foreground mb-3">
                See it in action.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From AI-powered messaging to brand-perfect visuals — explore the tools that make CampusVoice different.
              </p>
            </div>
          </ScrollRevealSection>

          {/* Top 2 showcases inline (lazy) */}
          <Suspense fallback={<div className="h-64" />}>
            <ScrollRevealSection><MessageBuilderShowcase /></ScrollRevealSection>
            <ScrollRevealSection><JourneyBuilderShowcase /></ScrollRevealSection>

            {/* Remaining 3 in tabbed format */}
            <ScrollRevealSection><ProductTourTabs /></ScrollRevealSection>
          </Suspense>
        </div>
      </section>

      {/* Value Proposition Section - Fun Yellow Background */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(51_22%_93%)] relative overflow-hidden border-y border-border/70">
        <div className="absolute top-12 right-[10%] w-40 h-40 bg-[hsl(216_100%_50%_/_0.07)] rounded-full blur-[70px]" />
        
        {/* Wave transition at bottom */}
        <div className="absolute -bottom-px left-0 right-0">
          <svg 
            viewBox="0 0 1440 80" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto block"
            preserveAspectRatio="none"
          >
            <path 
              d="M0 80L48 70C96 60 192 40 288 35C384 30 480 40 576 45C672 50 768 50 864 45C960 40 1056 30 1152 30C1248 30 1344 40 1392 45L1440 50V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" 
              fill="hsl(200 24% 95%)"
            />
          </svg>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <ScrollRevealSection>
            <div className="text-center mb-12">
              <h2 className="font-display tracking-[-0.02em] text-2xl sm:text-3xl text-foreground mb-3">
                <span className="text-[hsl(216_100%_40%)]">Stop Reacting.</span> Start Planning.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Most comms are written on instinct. CampusVoice gives you the playbook to plan and execute with confidence.
              </p>
            </div>
          </ScrollRevealSection>

          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8" aria-label="Core value propositions">
            {valueProps.map((prop, index) => {
              const colors = [
                { bg: 'bg-[hsl(216_100%_50%_/_0.1)]', icon: 'text-[hsl(216_100%_40%)]' },
                { bg: 'bg-[hsl(60_4%_10%_/_0.08)]', icon: 'text-[hsl(60_4%_20%)]' },
                { bg: 'bg-[hsl(216_100%_50%_/_0.1)]', icon: 'text-[hsl(216_100%_40%)]' },
                { bg: 'bg-[hsl(60_4%_10%_/_0.08)]', icon: 'text-[hsl(60_4%_20%)]' },
              ];
              const color = colors[index % 4];
              return (
                <li key={prop.title} className="text-center list-none opacity-0 animate-reveal-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className={`w-12 h-12 rounded-xl ${color.bg} flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-105`}>
                    <CheckCircle2 className={`w-6 h-6 ${color.icon}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{prop.title}</h3>
                  <p className="text-sm text-muted-foreground">{prop.description}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Features Section - Fresh Mint Background */}
      <section className="pt-16 sm:pt-20 pb-32 sm:pb-36 px-4 sm:px-6 lg:px-8 bg-[hsl(200_24%_95%)] relative overflow-hidden border-t border-border/70">
        <div className="absolute top-16 left-[18%] w-48 h-48 bg-[hsl(216_100%_50%_/_0.07)] rounded-full blur-[80px]" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollRevealSection>
            <div className="text-center mb-12">
              <Badge className="mb-4 rounded-full bg-[hsl(60_4%_10%_/_0.06)] text-[hsl(60_4%_20%)] border-[hsl(60_4%_10%_/_0.15)] uppercase tracking-[0.12em] text-[11px] font-semibold">
                <Zap className="w-3 h-3 mr-1" />
                Core Capabilities
              </Badge>
              <h2 className="font-display tracking-[-0.02em] text-2xl sm:text-3xl text-foreground mb-3">
                Powered by <span className="text-[hsl(216_100%_40%)]">Communication Science</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every feature is designed around how people actually make decisions.
              </p>
            </div>
          </ScrollRevealSection>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5" aria-label="CampusVoice feature list">
            {features.map((feature, index) => {
              const cardColors = [
                { bg: 'bg-card', border: 'border-border', iconBg: 'bg-[hsl(216_100%_50%_/_0.1)]', iconColor: 'text-[hsl(216_100%_40%)]', hoverBorder: 'hover:border-[hsl(216_100%_50%_/_0.5)]' },
                { bg: 'bg-card', border: 'border-border', iconBg: 'bg-[hsl(60_4%_10%_/_0.07)]', iconColor: 'text-[hsl(60_4%_20%)]', hoverBorder: 'hover:border-[hsl(60_4%_10%_/_0.3)]' },
              ];
              const colors = cardColors[index % 2];
              return (
                <li key={feature.title} className="list-none opacity-0 animate-reveal-up" style={{ animationDelay: `${index * 80}ms` }}>
                  <Link 
                    to={feature.link}
                    className={`group ${colors.bg} ${colors.border} border rounded-xl p-6 ${colors.hoverBorder} hover:shadow-[var(--shadow-lg)] hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer block h-full`}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                  >
                    <div className={`p-2.5 rounded-lg ${colors.iconBg} w-fit mb-4 group-hover:scale-105 transition-transform`}>
                      <feature.icon className={`w-6 h-6 ${colors.iconColor}`} />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colors.iconColor.replace('text-[', '').replace(']', '') }}>
                      <span className={colors.iconColor}>Learn more</span>
                      <ArrowRight className={`w-4 h-4 ${colors.iconColor}`} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        
        {/* Wave transition to pricing section */}
        <div className="absolute -bottom-px left-0 right-0">
          <svg 
            viewBox="0 0 1440 80" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto block"
            preserveAspectRatio="none"
          >
            <path 
              d="M0 80L60 65C120 50 240 20 360 15C480 10 600 30 720 40C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" 
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* Pricing Signal */}
      <ScrollRevealSection>
        <PricingSignalSection />
      </ScrollRevealSection>

      {/* Fieldmark Enterprise Section */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: '#1a1a2e' }}>
        {/* Subtle glow accents */}
        <div className="absolute top-16 right-[10%] w-64 h-64 rounded-full blur-[100px] opacity-30" style={{ backgroundColor: '#0082cb' }} />
        <div className="absolute bottom-20 left-[8%] w-48 h-48 rounded-full blur-[80px] opacity-20" style={{ backgroundColor: '#0082cb' }} />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Fieldmark logo */}
          <div className="mb-8">
            <img
              src={fieldmarkLogoWhite}
              alt="Fieldmark"
              className="h-10 sm:h-12 w-auto"
            />
          </div>

          <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: '#0082cb' }}>
            Built for Enterprise. Ready for the Field.
          </p>

          <h2 className="font-display tracking-[-0.02em] text-3xl sm:text-4xl text-white mb-4 leading-tight">
            Introducing <span style={{ color: '#0082cb' }}>Fieldmark</span>
          </h2>

          <p className="text-lg text-white/70 mb-4 max-w-3xl">
            Brand governance built for manufacturers, franchise networks, and distributed reseller channels.
          </p>

          <p className="text-white/60 mb-8 max-w-3xl leading-relaxed">
            Enterprise brands with hundreds of locations face a unique challenge — keeping every franchisee, dealer, and field rep on-brand at scale. Fieldmark brings AI-powered brand compliance directly into the tools your teams already use, with real-time scoring, regional adaptation, and full audit visibility.
          </p>

          <ul className="space-y-3 mb-10 max-w-2xl">
            {[
              "Real-time brand scoring before content publishes",
              "Regional and cultural adaptation with locked brand core",
              "Full audit trail — who posted what, when, and at what score",
              "Embeds natively in Salesforce via Canvas App — zero adoption friction",
              "Built for 100+ location networks: franchises, dealers, resellers",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-white/80 text-sm">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#0082cb' }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Button
            asChild
            size="lg"
            className="rounded-full px-8 font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            style={{ backgroundColor: '#0082cb' }}
          >
            <Link to="/for-enterprise">
              Explore Fieldmark for Enterprise
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>


      {/* Secondary CTA Section - Vibrant Purple */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[hsl(51_22%_93%)] border-y border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 right-[12%] w-72 h-72 bg-[hsl(216_100%_50%_/_0.08)] rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="font-display tracking-[-0.02em] text-2xl sm:text-3xl text-foreground mb-4">
            Ready to become your institution's <span className="text-[hsl(216_100%_45%)]">digital brand enforcer</span>?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Small teams. Big brand protection. AI that keeps everyone on-brand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              size="lg"
              className="h-12 rounded-lg bg-[hsl(216_100%_50%)] text-white hover:bg-[hsl(216_100%_45%)] shadow-[0_10px_30px_-10px_hsl(216_100%_50%_/_0.65)] px-8 font-semibold transition-colors border-0"
            >
              <Link to="/login?signup=1">
                Create Your Account
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-12 px-8 text-foreground hover:text-foreground hover:bg-muted rounded-lg border border-border bg-card"
            >
              <Link to="/try-copywriter">
                Try It Free
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter variant="dark" />
    </div>
  );
}
