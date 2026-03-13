import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap, BookOpen, Brain, BarChart3, Linkedin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import campusvoiceLogo from '@/assets/campusvoice-logo-new.png';

const expertiseAreas = [
  { icon: Brain, label: 'Persuasion & Communication Science' },
  { icon: BarChart3, label: 'Psychometric Scale Development' },
  { icon: GraduationCap, label: 'Higher Education Strategy' },
  { icon: BookOpen, label: 'Digital Transformation & EdTech' },
];

const credentials = [
  'Ph.D., Communication — University of Kentucky',
  'College of Communication & Information',
  'Dissertation Committee: Dr. Derek Lane, Dr. Anthony Limperos',
  '15+ years in higher education & technology',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About — CampusVoice.AI"
        description="Meet Dr. Tyler Gayheart, the founder of CampusVoice.AI. PhD in Communication Science with expertise in persuasion, psychometrics, and higher education marketing."
        keywords={['about', 'founder', 'Tyler Gayheart', 'PhD', 'communication science', 'higher education', 'persuasion']}
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
        {/* Hero section */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start mb-16">
          {/* Photo */}
          <div className="shrink-0">
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-muted border-2 border-primary/10 overflow-hidden shadow-lg">
              {/* Placeholder — swap with real headshot */}
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                <GraduationCap className="w-16 h-16 text-primary/40" />
              </div>
            </div>
            <a
              href="https://www.linkedin.com/in/tylergayheart"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn Profile
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Intro */}
          <div className="space-y-4">
            <div>
              <Badge variant="secondary" className="mb-3 text-xs font-medium">Founder & Creator</Badge>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground">
                Dr. Tyler Gayheart
              </h1>
              <p className="text-muted-foreground mt-1 text-lg">
                Ph.D. in Communication &bull; University of Kentucky
              </p>
            </div>
            <p className="text-foreground/85 text-[15px] leading-relaxed max-w-xl">
              Dr. Tyler Gayheart is the founder and creator of CampusVoice.AI — an AI-powered messaging intelligence platform purpose-built for higher education. With deep training in communication science, persuasion theory, and psychometric scale development, Tyler bridges the gap between rigorous research and practical marketing technology for colleges and universities.
            </p>
          </div>
        </div>

        {/* Expertise grid */}
        <section className="mb-14">
          <h2 className="text-xl font-semibold text-foreground mb-5">Areas of Expertise</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {expertiseAreas.map((area) => (
              <div
                key={area.label}
                className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
                  <area.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{area.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Dissertation / Research */}
        <section className="mb-14 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">The Research Behind CampusVoice</h2>
          <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground text-[15px] leading-snug">
                  Integrating Persuasive Messaging Strategies into Higher Education Early Alert Interventions to Improve Student Academic Behaviors
                </h3>
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
              Tyler's doctoral research investigated how Cialdini's persuasion principles — specifically <em>authority</em> and <em>consensus</em> — along with Kaptein's susceptibility-to-persuasion construct, can be integrated into higher education early-alert systems to improve student academic behaviors. The study used a 2×2×2 factorial design with 622 undergraduate participants and revealed significant main effects for both susceptibility to persuasion and message authority on students' intentions to engage in positive academic behaviors.
            </p>
            <p className="text-foreground/80 text-[15px] leading-relaxed">
              This research forms the scientific foundation of CampusVoice.AI — the understanding that <strong>how</strong> a message is framed matters just as much as <strong>what</strong> it says, and that evidence-based persuasion strategies can meaningfully improve outcomes in higher education communication.
            </p>
          </div>
        </section>

        {/* Background & credentials */}
        <section className="mb-14 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Background & Credentials</h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground/85 text-[15px] leading-relaxed space-y-4">
            <ul className="space-y-2">
              {credentials.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              Tyler's career spans higher education administration, enrollment marketing, communication strategy, and digital transformation consulting. He combines deep expertise in communication theory with hands-on experience building technology solutions that help institutions connect with students, donors, alumni, and communities more effectively.
            </p>
            <p>
              His training in psychometric measurement and persuasion science underpins every aspect of CampusVoice.AI — from the Content DNA voice-analysis engine to the brand-adherence scoring algorithms that evaluate messaging fidelity across channels.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-lg border bg-primary/5 p-6 sm:p-8 text-center space-y-3">
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
