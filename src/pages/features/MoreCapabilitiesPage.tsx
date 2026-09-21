import { Link } from '@/lib/router-compat';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Palette,
  BarChart3,
  Globe,
  BarChart,
  Layers,
} from 'lucide-react';
import campusvoiceLogo from '@/assets/campusvoice-logo.png';
import { SEOHead, getWebPageSchema } from '@/components/SEOHead';
import { FeatureBreadcrumbs } from '@/components/FeatureBreadcrumbs';
import { MobileNav } from '@/components/MobileNav';
import { LandingFooter } from '@/components/landing/LandingFooter';

const PAGE_URL = 'https://www.campusvoice.ai/features';

const capabilities = [
  {
    id: 'image-studio',
    icon: ImageIcon,
    title: 'AI Image Studio',
    tagline: 'On-brand photography and graphics, without a stock-photo subscription.',
    accent: 'text-pink-600',
    accentBg: 'bg-pink-500/10',
    points: [
      'Photography and graphic-design modes across 19 communication formats.',
      'Your exact brand palette is locked in, so nothing comes back off-color.',
      'In-context mockups show the asset where it will actually appear.',
      'Never renders institutional text or logos onto clothing or signage.',
    ],
  },
  {
    id: 'brand-studio',
    icon: Palette,
    title: 'AI Brand Studio',
    tagline: 'Layer your identity onto any image, precisely.',
    accent: 'text-blue-600',
    accentBg: 'bg-blue-600/10',
    points: [
      'Drop logos, headlines, calls to action and brand patterns onto any photo.',
      'Smart Layer masking keeps type legible over busy imagery.',
      'AI headline generation grounded in your voice profile, not generic taglines.',
      'Exact positioning ruler for people who care about a two-pixel difference.',
    ],
  },
  {
    id: 'evaluate',
    icon: BarChart3,
    title: 'Message Evaluator',
    tagline: 'Score a draft before it goes out, against evidence rather than opinion.',
    accent: 'text-orange-600',
    accentBg: 'bg-orange-500/10',
    points: [
      'Scores existing copy against established persuasion principles.',
      'Checks alignment with your brand platform and voice profile.',
      'Names what to change and why, so the edit survives review.',
      'Works on anything you paste in, including copy written elsewhere.',
    ],
  },
  {
    id: 'webcrawl',
    icon: Globe,
    title: 'WebCrawl Intelligence',
    tagline: 'Extract your voice from the site you already have.',
    accent: 'text-sky-600',
    accentBg: 'bg-sky-500/10',
    points: [
      'Point it at your institutional site and it reads how you already sound.',
      'Pulls facts, program detail and proof points into a structured profile.',
      'Turns a 40-page website into a voice foundation in one sitting.',
      'Cuts setup from a workshop series to an afternoon.',
    ],
  },
  {
    id: 'brand-audit',
    icon: BarChart,
    title: 'Brand Audit & Scoring',
    tagline: 'Know where your brand actually stands across every department.',
    accent: 'text-amber-600',
    accentBg: 'bg-amber-500/10',
    points: [
      'Catalog every touchpoint: web pages, email, print, social.',
      'Scores voice consistency, platform alignment and terminology compliance.',
      'Surfaces violations automatically instead of waiting for someone to notice.',
      'Tracks remediation progress, so improvement is provable, not asserted.',
    ],
  },
];

const coreFeatures = [
  { label: 'Message Builder', to: '/features/message-builder' },
  { label: 'Content DNA Studio', to: '/features/content-dna' },
  { label: 'AI Copywriter', to: '/features/ai-copywriter' },
  { label: 'Journey Designer', to: '/features/journey-designer' },
  { label: 'Content Library', to: '/features/library' },
];

export default function MoreCapabilitiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="More Capabilities: Image Studio, Brand Studio, Evaluator, WebCrawl & Brand Audit | CampusVoice.AI"
        description="The rest of the CampusVoice toolkit: AI Image Studio, AI Brand Studio, Message Evaluator, WebCrawl Intelligence and Brand Audit & Scoring for higher education communications."
        canonicalUrl={PAGE_URL}
        keywords={[
          'higher education brand audit',
          'AI image generation university',
          'message evaluation',
          'brand voice extraction',
        ]}
        jsonLd={getWebPageSchema(
          'More CampusVoice Capabilities',
          'Image Studio, Brand Studio, Message Evaluator, WebCrawl Intelligence and Brand Audit for higher education teams.',
          PAGE_URL,
        )}
      />

      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={campusvoiceLogo} alt="CampusVoice" className="h-8" />
            </Link>
            <div className="hidden md:block">
              <FeatureBreadcrumbs items={[{ label: 'Features' }, { label: 'More Capabilities' }]} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden md:inline-flex">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link to="/try-copywriter" className="hidden md:inline-flex">
              <Button size="sm">Try It Free</Button>
            </Link>
            <MobileNav />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(216_100%_50%_/_0.07)] via-background to-[hsl(262_60%_55%_/_0.06)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-[hsl(216_100%_50%_/_0.12)] text-[hsl(82_60%_28%)] border-[hsl(82_85%_45%_/_0.3)]">
              <Layers className="w-3 h-3 mr-1" />
              More Capabilities
            </Badge>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Everything Else in the Toolkit
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Five more capabilities that support the writing: visuals, evaluation, voice extraction
              and brand governance. All of them run off the same voice profile.
            </p>
          </div>
        </div>
      </section>

      {/* Jump links */}
      <section className="py-8 bg-muted/30 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2">
            {capabilities.map((c) => (
              <a key={c.id} href={`#${c.id}`}>
                <Button variant="outline" size="sm">
                  <c.icon className={`w-3.5 h-3.5 mr-2 ${c.accent}`} />
                  {c.title}
                </Button>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl space-y-14">
            {capabilities.map((c) => (
              <div key={c.id} id={c.id} className="scroll-mt-24">
                <div className={`p-2.5 rounded-lg ${c.accentBg} w-fit mb-4`}>
                  <c.icon className={`w-6 h-6 ${c.accent}`} />
                </div>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-3">{c.title}</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{c.tagline}</p>
                <ul className="space-y-3">
                  {c.points.map((p) => (
                    <li key={p} className="flex gap-3">
                      <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${c.accentBg}`}>
                        <span className={`block w-1.5 h-1.5 rounded-full ${c.accent} bg-current`} />
                      </span>
                      <span className="text-muted-foreground leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core features */}
      <section className="py-14 bg-muted/30 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
              The core workflow
            </h2>
            <p className="text-muted-foreground mb-6">
              These five have pages of their own, with interactive demos.
            </p>
            <div className="flex flex-wrap gap-3">
              {coreFeatures.map((f) => (
                <Link key={f.to} to={f.to}>
                  <Button variant="outline" size="sm">
                    {f.label}
                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            See it write for your institution
          </h2>
          <p className="text-primary-foreground/70 text-lg mb-8 max-w-2xl mx-auto">
            No account needed. Paste in your audience and watch the difference.
          </p>
          <Link to="/try-copywriter">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[hsl(216_100%_50%)] to-[hsl(82_85%_45%)] text-primary hover:from-[hsl(82_85%_50%)] hover:to-[hsl(82_85%_40%)] font-bold px-8 rounded-full"
            >
              Try It Free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <LandingFooter variant="dark" />
    </div>
  );
}
