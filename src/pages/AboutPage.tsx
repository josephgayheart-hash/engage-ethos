import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap, BookOpen, Brain, BarChart3, Linkedin, ExternalLink, Heart, Target, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import campusvoiceLogo from '@/assets/campusvoice-logo-new.png';

const values = [
  {
    icon: BookOpen,
    title: 'Research-Grounded',
    description: 'Every evaluation and recommendation is rooted in peer-reviewed persuasion and communication science — not marketing hunches.',
  },
  {
    icon: Heart,
    title: 'Human-First AI',
    description: 'AI amplifies your voice — it never replaces it. CampusVoice keeps humans in control of the message and the mission.',
  },
  {
    icon: GraduationCap,
    title: 'Built for Higher Ed',
    description: 'Not adapted from corporate software. Purpose-built for the unique audiences, rhythms, and stakes of colleges and universities.',
  },
  {
    icon: Shield,
    title: 'Ethical Persuasion',
    description: 'Communication that influences while preserving autonomy. We help you be more effective — never manipulative.',
  },
];

const expertiseAreas = [
  { icon: Brain, label: 'Persuasion & Communication Science' },
  { icon: BarChart3, label: 'Psychometric Scale Development' },
  { icon: GraduationCap, label: 'Higher Education Strategy' },
  { icon: BookOpen, label: 'Digital Transformation & EdTech' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About — CampusVoice.AI"
        description="Why CampusVoice.AI exists: our mission, vision, values, and the research-grounded story behind the platform built for higher education communicators."
        keywords={['about', 'mission', 'vision', 'values', 'higher education', 'communication science', 'Tyler Gayheart']}
      />

      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={campusvoiceLogo} alt="CampusVoice.AI" className="h-7 w-auto" />
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* ── Emotional Opening ── */}
        <section className="mb-16">
          <Badge variant="secondary" className="mb-4 text-xs font-medium">Why CampusVoice Exists</Badge>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground leading-tight mb-6">
            Every message a university sends has the power to change a student's trajectory.
          </h1>
          <div className="space-y-4 text-foreground/85 text-[15px] leading-relaxed max-w-2xl">
            <p>
              A single email can be the difference between a prospective student choosing your institution or scrolling past it. A well-timed text can pull an at-risk student back from the edge of dropping out. A donor letter can reignite someone's connection to their alma mater — or end up in the recycling bin.
            </p>
            <p>
              Yet the people writing these messages — enrollment marketers, advancement officers, student success teams — are stretched impossibly thin. They're asked to do more with less, move faster, and somehow maintain a consistent brand voice across dozens of channels and audiences.
            </p>
            <p>
              <strong>CampusVoice.AI was built because words matter — especially in higher education.</strong> It was built by someone who spent years studying <em>why</em> certain messages persuade and others fall flat, and who believed that science shouldn't stay locked in dissertations — it should be in the hands of the people doing the work every day.
            </p>
          </div>
        </section>

        {/* ── Mission & Vision ── */}
        <section className="mb-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Our Mission</h2>
            </div>
            <p className="text-foreground/80 text-[15px] leading-relaxed">
              To give every higher education communicator access to research-grounded messaging intelligence — so the words they send are as intentional, persuasive, and on-brand as the institutions they represent.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Our Vision</h2>
            </div>
            <p className="text-foreground/80 text-[15px] leading-relaxed">
              A future where no university message goes out without being evaluated for clarity, brand alignment, and persuasive impact — and where AI serves as a tireless co-writer that respects every institution's unique voice.
            </p>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-foreground mb-5">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-lg border bg-card p-5 shadow-sm space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10">
                    <v.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-[15px]">{v.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── The Story Behind It ── */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-foreground mb-6">The Story Behind CampusVoice</h2>

          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start mb-8">
            {/* Photo placeholder */}
            <div className="shrink-0">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-muted border-2 border-primary/10 overflow-hidden shadow-md">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                  <GraduationCap className="w-12 h-12 text-primary/40" />
                </div>
              </div>
              <a
                href="https://www.linkedin.com/in/tylergayheart"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-3">
              <div>
                <Badge variant="secondary" className="mb-2 text-xs font-medium">Founder & Creator</Badge>
                <h3 className="text-2xl font-serif font-bold text-foreground">Dr. Tyler Gayheart</h3>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Ph.D. in Communication &bull; University of Kentucky
                </p>
              </div>
              <p className="text-foreground/85 text-[15px] leading-relaxed max-w-xl">
                Tyler spent over 15 years working across higher education administration, enrollment marketing, and digital transformation — watching brilliant communicators struggle with tools that were never designed for their world. His doctoral research at the University of Kentucky's College of Communication &amp; Information gave him the framework to do something about it.
              </p>
            </div>
          </div>

          {/* Dissertation */}
          <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground text-[15px] leading-snug">
                  Integrating Persuasive Messaging Strategies into Higher Education Early Alert Interventions to Improve Student Academic Behaviors
                </h4>
                <p className="text-xs text-muted-foreground">
                  Doctoral Dissertation &bull; University of Kentucky, 2021 &bull; DOI:&nbsp;
                  <a
                    href="https://doi.org/10.13023/etd.2021.103"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    10.13023/etd.2021.103
                  </a>
                </p>
              </div>
            </div>
            <p className="text-foreground/80 text-[15px] leading-relaxed">
              Tyler's research investigated how Cialdini's persuasion principles — specifically <em>authority</em> and <em>consensus</em> — along with Kaptein's susceptibility-to-persuasion construct, can improve student academic behaviors. Using a 2×2×2 factorial design with 622 undergraduates, the study revealed significant main effects that proved <strong>how</strong> a message is framed matters just as much as <strong>what</strong> it says.
            </p>
            <p className="text-foreground/80 text-[15px] leading-relaxed">
              This research is the scientific foundation of CampusVoice.AI — the conviction that evidence-based persuasion can meaningfully improve outcomes across every type of higher education communication.
            </p>
          </div>

          {/* Expertise grid */}
          <h4 className="text-sm font-semibold text-foreground mb-3">Areas of Expertise</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {expertiseAreas.map((area) => (
              <div key={area.label} className="flex items-center gap-3 rounded-lg border bg-card p-3.5 shadow-sm">
                <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10">
                  <area.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{area.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="rounded-xl border bg-primary/5 p-6 sm:p-8 text-center space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Interested in CampusVoice.AI?</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            See how research-grounded messaging intelligence can transform your institution's communication strategy.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/request-access">
              <Button size="sm" className="rounded-full px-6">Request Early Access</Button>
            </Link>
            <a href="mailto:sales@campusvoice.ai">
              <Button variant="outline" size="sm" className="rounded-full px-6">Contact Tyler</Button>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
