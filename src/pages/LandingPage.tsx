import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
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
  Calendar,
  Image,
  Palette,
  Bot,
  PenTool,
  BarChart
} from 'lucide-react';
import campusvoiceLogo from '@/assets/campusvoice-logo-new.png';
import HowItWorksSection from '@/components/landing/HowItWorksSection';

import PricingSignalSection from '@/components/landing/PricingSignalSection';
import AICredibilitySection from '@/components/landing/AICredibilitySection';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SEOHead, getOrganizationSchema, getSoftwareApplicationSchema } from '@/components/SEOHead';
import { RequestDemoDialog } from '@/components/landing/RequestDemoDialog';
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
    url: 'https://engage-ethos.lovable.app',
    description: 'Strategic Messaging Intelligence for Brand Teams',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://engage-ethos.lovable.app/search?q={search_term_string}',
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
    icon: Image,
    title: 'AI Image Studio',
    description: 'Generate on-brand photography and graphics across 19 formats.',
    link: '/features/image-studio',
  },
  {
    icon: Palette,
    title: 'Brand It Studio',
    description: 'Layer logos, headlines, and brand patterns onto any image with AI copy.',
    link: '/features/brand-studio',
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
    icon: PenTool,
    title: 'Message Evaluator',
    description: 'Score content against your brand platform and voice profile.',
    link: '/features/evaluate',
  },
  {
    icon: Globe,
    title: 'WebCrawl Intelligence',
    description: 'Extract brand voice from your website automatically.',
    link: '/features/webcrawl',
  },
  {
    icon: BookOpen,
    title: 'Content Library',
    description: 'Governed content with approval workflows and shared collections.',
    link: '/features/library',
  },
  {
    icon: BarChart,
    title: 'Brand Audit & Scoring',
    description: 'Audit touchpoints and track brand consistency over time.',
    link: '/features/brand-audit',
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

      {/* Hero Section — Dark & Moody */}
      <header className="relative overflow-hidden" style={{ background: 'linear-gradient(145deg, hsl(222, 47%, 18%) 0%, hsl(222, 40%, 24%) 40%, hsl(222, 35%, 20%) 100%)' }}>
        {/* Navigation */}
        <LandingNav />

        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Animated floating orbs */}
        <div className="hidden sm:block absolute w-72 h-72 rounded-full blur-[80px] animate-float-slow" style={{ background: 'hsl(82 85% 55% / 0.18)', top: '5%', right: '10%' }} />
        <div className="hidden sm:block absolute w-56 h-56 rounded-full blur-[70px] animate-float-medium" style={{ background: 'hsl(270 70% 60% / 0.2)', bottom: '10%', left: '5%', animationDelay: '1s' }} />
        <div className="hidden sm:block absolute w-40 h-40 rounded-full blur-[60px] animate-float-fast" style={{ background: 'hsl(200 100% 50% / 0.2)', top: '40%', left: '25%', animationDelay: '0.5s' }} />
        <div className="hidden sm:block absolute w-32 h-32 rounded-full blur-[50px] animate-float-medium" style={{ background: 'hsl(340 75% 55% / 0.12)', bottom: '25%', right: '20%', animationDelay: '2s' }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center space-y-7">
            {/* Strategic Messaging Intelligence badge — primary */}
            <div className="animate-fade-in">
                <Badge 
                variant="secondary" 
                className="bg-[hsl(270_70%_60%_/_0.15)] hover:bg-[hsl(270_70%_60%_/_0.25)] text-[hsl(270_70%_70%)] border-[hsl(270_70%_60%_/_0.3)] px-4 py-1.5 text-sm font-semibold backdrop-blur-sm"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Strategic Messaging Intelligence
              </Badge>
            </div>

            {/* Primary headline — concrete, scannable */}
            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight animate-fade-in max-w-4xl mx-auto leading-tight"
              style={{ animationDelay: '0.15s' }}
            >
              <span className="text-white">AI copywriting that stays</span>{' '}
              <span
                className="font-semibold bg-gradient-to-r from-[hsl(82_85%_55%)] to-[hsl(82_85%_65%)] bg-clip-text text-transparent"
              >
                on your brand.
              </span>
            </h1>

            {/* Sub-header */}
            <p
              className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.25s' }}
            >
              Upload your brand voice once. Generate emails, social posts, journeys, and campaigns that sound like <span className="text-white font-semibold">you</span> — across every channel.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center sm:items-start pt-2 animate-fade-in"
              style={{ animationDelay: '0.35s' }}
            >
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-[hsl(82_85%_55%)] to-[hsl(82_85%_45%)] text-primary hover:from-[hsl(82_85%_50%)] hover:to-[hsl(82_85%_40%)] shadow-[0_0_30px_hsl(82_85%_55%_/_0.3)] hover:shadow-[0_0_40px_hsl(82_85%_55%_/_0.5)] transition-all duration-300 text-base px-8 py-6 font-bold border-0"
              >
                <Link to="/request-access">
                  Get Early Access
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <div className="flex flex-col items-center">
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="border-2 border-[hsl(82_85%_55%_/_0.4)] text-white bg-white/5 hover:bg-[hsl(82_85%_55%_/_0.15)] hover:border-[hsl(82_85%_55%_/_0.6)] text-base px-8 py-6 backdrop-blur-sm"
                >
                  <Link to="/evaluate">
                    Try the Evaluator
                  </Link>
                </Button>
                <span className="text-[hsl(82_85%_65%)] text-[10px] mt-1 font-medium">
                  Free · No signup
                </span>
              </div>
            </div>

            {/* Audience tag */}
            <p
              className="text-white/50 text-sm animate-fade-in pt-1"
              style={{ animationDelay: '0.45s' }}
            >
              For higher-ed, enterprise, nonprofit, and healthcare brand teams.
            </p>

            {/* Sign in — small tertiary */}
            <div className="animate-fade-in pt-1" style={{ animationDelay: '0.5s' }}>
              <Link to="/login" className="text-white/40 text-xs hover:text-white/70 transition-colors">
                Already have an account? Sign in
              </Link>
            </div>

          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute -bottom-px left-0 right-0">
          <svg 
            viewBox="0 0 1440 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto block"
            preserveAspectRatio="none"
          >
            <path 
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="hsl(222 47% 11%)"
            />
          </svg>
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
        <div className="absolute top-20 right-[8%] w-48 h-48 bg-[hsl(82_85%_55%_/_0.06)] rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-[5%] w-40 h-40 bg-[hsl(270_70%_60%_/_0.06)] rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-24 sm:space-y-32">
          <ScrollRevealSection>
            <div className="text-center">
              <Badge className="mb-4 bg-[hsl(270_70%_60%_/_0.15)] text-[hsl(270_70%_55%)] border-[hsl(270_70%_60%_/_0.3)]">
                <Sparkles className="w-3 h-3 mr-1" />
                Product Tour
              </Badge>
              <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-3">
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
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(48_100%_90%)] relative overflow-hidden">
        <div className="absolute top-12 right-[10%] w-28 h-28 bg-[hsl(270_70%_60%_/_0.2)] rounded-full blur-2xl" />
        <div className="absolute bottom-28 left-[6%] w-36 h-36 bg-[hsl(82_85%_55%_/_0.18)] rounded-full blur-3xl" />
        
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
              fill="hsl(173 40% 92%)"
            />
          </svg>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <ScrollRevealSection>
            <div className="text-center mb-12">
              <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-3">
                <span className="text-[hsl(270_70%_55%)]">Stop Reacting.</span> Start Planning.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Most comms are written on instinct. CampusVoice gives you the playbook to plan and execute with confidence.
              </p>
            </div>
          </ScrollRevealSection>

          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8" aria-label="Core value propositions">
            {valueProps.map((prop, index) => {
              const colors = [
                { bg: 'bg-[hsl(82_85%_55%_/_0.2)]', icon: 'text-[hsl(82_70%_40%)]' },
                { bg: 'bg-[hsl(270_70%_60%_/_0.2)]', icon: 'text-[hsl(270_70%_55%)]' },
                { bg: 'bg-[hsl(200_100%_50%_/_0.2)]', icon: 'text-[hsl(200_100%_45%)]' },
                { bg: 'bg-[hsl(340_75%_55%_/_0.2)]', icon: 'text-[hsl(340_75%_50%)]' },
              ];
              const color = colors[index % 4];
              return (
                <li key={prop.title} className="text-center list-none opacity-0 animate-reveal-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className={`w-12 h-12 rounded-2xl ${color.bg} flex items-center justify-center mx-auto mb-4 rotate-3 hover:rotate-0 transition-transform`}>
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
      <section className="pt-16 sm:pt-20 pb-32 sm:pb-36 px-4 sm:px-6 lg:px-8 bg-[hsl(173_40%_92%)] relative overflow-hidden">
        <div className="absolute top-16 left-[18%] w-32 h-32 bg-[hsl(200_100%_50%_/_0.18)] rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-[15%] w-44 h-44 bg-[hsl(270_70%_60%_/_0.12)] rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollRevealSection>
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-[hsl(82_85%_55%_/_0.2)] text-[hsl(82_70%_35%)] border-[hsl(82_85%_55%_/_0.4)]">
                <Zap className="w-3 h-3 mr-1" />
                Core Capabilities
              </Badge>
              <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-3">
                Powered by <span className="text-[hsl(200_100%_45%)]">Communication Science</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every feature is designed around how people actually make decisions.
              </p>
            </div>
          </ScrollRevealSection>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5" aria-label="CampusVoice feature list">
            {features.map((feature, index) => {
              const cardColors = [
                { bg: 'bg-white', border: 'border-[hsl(82_85%_55%_/_0.4)]', iconBg: 'bg-[hsl(82_85%_55%_/_0.2)]', iconColor: 'text-[hsl(82_70%_35%)]', hoverBorder: 'hover:border-[hsl(82_85%_55%)]' },
                { bg: 'bg-white', border: 'border-[hsl(270_70%_60%_/_0.4)]', iconBg: 'bg-[hsl(270_70%_60%_/_0.2)]', iconColor: 'text-[hsl(270_70%_50%)]', hoverBorder: 'hover:border-[hsl(270_70%_60%)]' },
                { bg: 'bg-white', border: 'border-[hsl(200_100%_50%_/_0.4)]', iconBg: 'bg-[hsl(200_100%_50%_/_0.2)]', iconColor: 'text-[hsl(200_100%_40%)]', hoverBorder: 'hover:border-[hsl(200_100%_50%)]' },
                { bg: 'bg-white', border: 'border-[hsl(340_75%_55%_/_0.4)]', iconBg: 'bg-[hsl(340_75%_55%_/_0.2)]', iconColor: 'text-[hsl(340_75%_45%)]', hoverBorder: 'hover:border-[hsl(340_75%_55%)]' },
              ];
              const colors = cardColors[index % 4];
              return (
                <li key={feature.title} className="list-none opacity-0 animate-reveal-up" style={{ animationDelay: `${index * 80}ms` }}>
                  <Link 
                    to={feature.link}
                    className={`group ${colors.bg} ${colors.border} border-2 rounded-2xl p-6 ${colors.hoverBorder} hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.02] transition-all duration-500 ease-out cursor-pointer block h-full`}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                  >
                    <div className={`p-3 rounded-xl ${colors.iconBg} w-fit mb-4 group-hover:scale-110 transition-transform`}>
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
          {/* Fieldmark wordmark */}
          <div className="mb-8">
            <span className="text-2xl font-bold tracking-tight text-white">Fieldmark</span>
          </div>

          <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: '#0082cb' }}>
            Built for Enterprise. Ready for the Field.
          </p>

          <h2 className="font-serif text-3xl sm:text-4xl text-white mb-4 leading-tight">
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
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(270_60%_50%)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-12 right-[12%] w-40 h-40 bg-[hsl(82_85%_55%_/_0.2)] rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-[8%] w-48 h-48 bg-[hsl(200_100%_50%_/_0.15)] rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="font-serif text-2xl sm:text-3xl text-white mb-4">
            Ready to become your institution's <span className="text-[hsl(82_85%_65%)]">digital brand enforcer</span>?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Small teams. Big brand protection. AI that keeps everyone on-brand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              size="lg"
              className="bg-[hsl(82_85%_55%)] text-primary hover:bg-[hsl(82_85%_50%)] shadow-xl hover:shadow-2xl hover:scale-105 px-8 font-bold transition-all duration-300 rounded-full"
            >
              <Link to="/request-access">
                Get Early Access
              </Link>
            </Button>
            <RequestDemoDialog
              trigger={
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:text-white hover:bg-white/20 rounded-full border-2 border-white/30"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
              }
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter variant="dark" />
    </div>
  );
}
