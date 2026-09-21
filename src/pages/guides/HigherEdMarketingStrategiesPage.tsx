import { Link } from '@/lib/router-compat';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Target,
  Users,
  Sparkles,
  FlaskConical,
  Bot,
  ListChecks,
  Quote,
} from 'lucide-react';
import campusvoiceLogo from '@/assets/campusvoice-logo.png';
import { SEOHead, getWebPageSchema } from '@/components/SEOHead';
import { FeatureBreadcrumbs } from '@/components/FeatureBreadcrumbs';
import { MobileNav } from '@/components/MobileNav';
import { LandingFooter } from '@/components/landing/LandingFooter';

const PAGE_URL = 'https://www.campusvoice.ai/higher-education-marketing-strategies';

const sections = [
  { id: 'why-messages-fail', label: 'Why most messages fail' },
  { id: 'audience-first', label: 'Start with the audience, not the calendar' },
  { id: 'persuasion', label: 'The persuasion principles that move students' },
  { id: 'voice-at-scale', label: 'Keeping one voice across every department' },
  { id: 'lifecycle', label: 'Lifecycle messaging for undergrad and graduate' },
  { id: 'testing', label: 'Testing without a dedicated analyst' },
  { id: 'ai-and-aeo', label: 'AI, AEO and GEO: what actually matters' },
  { id: 'choosing-tools', label: 'How to choose an AI enrollment tool' },
  { id: 'checklist', label: 'The 90-day checklist' },
];

const principles = [
  {
    icon: Users,
    title: 'Social proof beats superlatives',
    body: 'A named student saying "I found my people in week two" outperforms "a vibrant, welcoming community." Specific people are evidence; adjectives are noise.',
  },
  {
    icon: Target,
    title: 'Loss framing for deadlines',
    body: 'Deadline reminders that name what closes ("priority housing selection ends Friday") consistently outpull reminders that name the date alone.',
  },
  {
    icon: Sparkles,
    title: 'Identity over features',
    body: 'Prospective students are not buying a curriculum, they are trying on a version of themselves. Lead with who they become, support it with the program.',
  },
  {
    icon: ListChecks,
    title: 'One decision per message',
    body: 'Every additional ask reduces response to the primary ask. If a message has four links, it has no call to action.',
  },
];

const lifecycleStages = [
  {
    stage: 'Inquiry',
    undergrad: 'Confirm the fit they suspect they have. Answer one fear.',
    grad: 'Respect their time. Lead with outcome, cost and format in the first screen.',
  },
  {
    stage: 'Applicant',
    undergrad: 'Reduce friction. Name the exact next document and who to email.',
    grad: 'Show peer outcomes from their current career stage, not from age 18.',
  },
  {
    stage: 'Admitted',
    undergrad: 'Belonging, family reassurance, cost clarity. Repeat all three.',
    grad: 'Employer support, scheduling reality, return on the tuition line.',
  },
  {
    stage: 'Melt window',
    undergrad: 'Human contact beats collateral. A person, a name, a reply address.',
    grad: 'Remove the last logistical unknown before it becomes a reason to defer.',
  },
];

const toolCriteria = [
  {
    q: 'Does it learn your institution, or just write English?',
    a: 'A general writing tool produces competent copy about nothing in particular. Ask it to name your strongest differentiator. If it cannot, it will average you into every other institution.',
  },
  {
    q: 'Can it hold one voice across departments?',
    a: 'Admissions, advancement and athletics all write. The question is whether a shared voice profile governs the output, or whether every office negotiates tone by hand.',
  },
  {
    q: 'Does it explain its choices?',
    a: 'Output you cannot defend to a vice president is output you will rewrite. Ask whether the tool can say which persuasion principle a line is using and why.',
  },
  {
    q: 'Who sees your data, and does it stay yours?',
    a: 'Student records carry FERPA obligations. Confirm that nothing identifiable is required to get value, and that prompts are not training a shared model.',
  },
  {
    q: 'Can a non-technical person use it on a Tuesday?',
    a: 'Adoption dies in setup. If a communications coordinator cannot get a usable draft in one sitting without training, the license becomes shelfware.',
  },
];

const checklist = [
  'Write down your three real differentiators, in plain language, with evidence for each.',
  'Interview five current students and five admitted-but-enrolled-elsewhere students. Record their exact words.',
  'Pick your single highest-volume message sequence. Rewrite it around one decision per message.',
  'Build one voice profile and give every writing office access to it.',
  'Set up a single A/B test on subject lines. One variable, two weeks, enough volume to mean something.',
  'Audit your ten most-visited pages for a direct answer to the question that brought people there.',
  'Kill one channel you maintain out of habit. Reinvest the hours in the sequence that converts.',
  'Review at 90 days against one number you chose at the start, not against everything you could measure.',
];

const faqItems = [
  {
    question: 'What is the most effective higher education marketing strategy?',
    answer:
      'The most reliable strategy is narrowing to one audience-specific message per decision point and repeating it consistently, rather than broadening reach. Institutions that document three evidence-backed differentiators and apply them across every sequence outperform those running more channels with generic messaging.',
  },
  {
    question: 'How do universities improve enrollment marketing conversion?',
    answer:
      'Reduce the number of asks per message, name the specific next action, apply loss framing to deadlines, and replace superlatives with named student evidence. Then test one variable at a time on your highest-volume sequence.',
  },
  {
    question: 'What is AEO in higher education marketing?',
    answer:
      'AEO, or answer engine optimization, means structuring pages so an AI assistant can quote a direct answer to a prospective student question. In practice it means clear question-shaped headings, a concise factual answer near the top, and structured data instead of marketing preamble.',
  },
  {
    question: 'What is GEO in higher education marketing?',
    answer:
      'GEO, or generative engine optimization, is the broader practice of getting an institution represented accurately inside AI-generated answers. It depends on consistent facts across your own pages, third-party directories and news coverage, since generative systems synthesize rather than rank.',
  },
  {
    question: 'How should a university choose an AI-driven enrollment marketing solution?',
    answer:
      'Judge it on whether it learns your institution rather than writing generic prose, whether it holds one voice across departments, whether it can explain its persuasion choices, how it handles FERPA-sensitive data, and whether a non-technical staff member can produce usable work without training.',
  },
];

export default function HigherEdMarketingStrategiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Higher Education Marketing Strategies: A Practitioner's Guide | CampusVoice.AI"
        description="A working guide to higher education marketing strategies: audience-first messaging, persuasion principles that move students, lifecycle sequences, testing, AEO and GEO, and how to choose an AI enrollment tool."
        ogType="article"
        canonicalUrl={PAGE_URL}
        keywords={[
          'higher education marketing strategies',
          'higher ed marketing',
          'enrollment marketing',
          'university marketing',
          'AEO higher education',
          'GEO higher education',
        ]}
        faqItems={faqItems}
        jsonLd={[
          getWebPageSchema(
            'Higher Education Marketing Strategies',
            "A practitioner's guide to messaging strategy, persuasion, lifecycle sequences and AI tooling for university marketing teams.",
            PAGE_URL,
          ),
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: "Higher Education Marketing Strategies: A Practitioner's Guide",
            description:
              'Audience-first messaging, persuasion principles, lifecycle sequences, testing, AEO and GEO, and how to evaluate AI enrollment marketing tools.',
            mainEntityOfPage: PAGE_URL,
            author: { '@type': 'Organization', name: 'CampusVoice.AI' },
            publisher: {
              '@type': 'Organization',
              name: 'CampusVoice.AI',
              logo: {
                '@type': 'ImageObject',
                url: 'https://www.campusvoice.ai/campusvoice-logo.png',
              },
            },
          },
        ]}
      />

      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={campusvoiceLogo} alt="CampusVoice" className="h-8" />
            </Link>
            <div className="hidden md:block">
              <FeatureBreadcrumbs
                items={[{ label: 'Guides' }, { label: 'Higher Education Marketing Strategies' }]}
              />
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
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(82_85%_55%_/_0.07)] via-background to-[hsl(262_60%_55%_/_0.06)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-[hsl(82_85%_55%_/_0.12)] text-[hsl(82_60%_28%)] border-[hsl(82_85%_45%_/_0.3)]">
              <BookOpen className="w-3 h-3 mr-1" />
              Guide
            </Badge>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Higher Education Marketing Strategies That Actually Move Students
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Most university marketing advice is a list of channels. This is a guide to the
              decisions underneath them: who you are talking to, what persuades them, how to keep
              one voice across a dozen offices, and how to tell whether any of it worked.
            </p>
          </div>
        </div>
      </section>

      {/* Contents */}
      <section className="py-10 bg-muted/30 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              What this covers
            </h2>
            <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
              {sections.map((s, i) => (
                <li key={s.id} className="text-sm">
                  <a
                    href={`#${s.id}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="text-border mr-2 font-mono text-xs">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Body */}
      <article className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl space-y-16">
            {/* 1 */}
            <section id="why-messages-fail" className="scroll-mt-24">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-5">
                Why most higher ed messages fail
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p>
                  Almost no institution has a volume problem. Most send plenty. What they have is a
                  sameness problem: a homepage that could belong to four hundred other schools, an
                  admitted-student sequence assembled by committee, and a brand platform that lives
                  in a PDF nobody opens before writing an email.
                </p>
                <p>
                  Three failures account for most of it. The message describes the institution
                  instead of the reader. It carries several asks at once, so none of them land. And
                  it was approved by people who already chose your school, for an audience who has
                  not.
                </p>
                <p>
                  The fix is unglamorous and mostly editorial. Narrow the audience, narrow the ask,
                  and replace claims with evidence. Channel strategy matters far less than the
                  sentence a seventeen-year-old reads at 11pm on a phone.
                </p>
              </div>
            </section>

            {/* 2 */}
            <section id="audience-first" className="scroll-mt-24">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-5">
                Start with the audience, not the calendar
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p>
                  Most communication plans are organized around the institution's year: open house,
                  application deadline, decision release, orientation. That is a logistics schedule,
                  not a strategy. It guarantees you talk when it suits you rather than when the
                  reader is deciding.
                </p>
                <p>
                  Invert it. For each audience, write down the question they are actually holding at
                  that moment. A first-generation applicant in February is not asking about your
                  academic rigor; she is asking whether the money will work and whether she will be
                  alone. A thirty-four-year-old evaluating a graduate certificate is asking whether
                  it will survive a promotion cycle and a toddler.
                </p>
                <p>
                  Then do the part almost nobody does: interview real people and keep their exact
                  words. Five enrolled students and five who chose elsewhere will hand you better
                  copy than any brainstorm. The phrases they repeat are your messaging, already
                  tested.
                </p>
              </div>
            </section>

            {/* 3 */}
            <section id="persuasion" className="scroll-mt-24">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-5">
                The persuasion principles that move students
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Persuasion research is unusually well established, and higher education mostly
                ignores it. Four principles do most of the work.
              </p>
              <div className="grid sm:grid-cols-2 gap-5">
                {principles.map((p) => (
                  <div
                    key={p.title}
                    className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="p-2.5 rounded-lg bg-[hsl(82_85%_55%_/_0.12)] w-fit mb-4">
                      <p.icon className="w-5 h-5 text-[hsl(82_60%_32%)]" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 border-l-2 border-[hsl(82_85%_45%)] pl-5 py-1">
                <Quote className="w-4 h-4 text-[hsl(82_60%_35%)] mb-2" />
                <p className="text-muted-foreground italic leading-relaxed">
                  A useful test for any draft: could a competing institution send this exact message
                  by swapping the logo? If yes, it is not messaging, it is filler.
                </p>
              </div>
            </section>

            {/* 4 */}
            <section id="voice-at-scale" className="scroll-mt-24">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-5">
                Keeping one voice across every department
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p>
                  At most institutions, forty or fifty people write things that a prospective student
                  might read. Admissions, financial aid, advancement, athletics, each college, each
                  center, each dean with a newsletter. Central marketing reviews a fraction of it.
                </p>
                <p>
                  Style guides do not solve this, because a style guide answers questions people did
                  not know to ask. What works is making the voice available at the moment of writing:
                  a documented profile of how your institution sounds, what it never says, and which
                  proof points are approved, attached to the tool people actually draft in.
                </p>
                <p>
                  This is the problem we built CampusVoice around. Your voice, differentiators and
                  approved evidence are captured once as a{' '}
                  <Link to="/features/content-dna" className="underline">
                    Content DNA profile
                  </Link>
                  , then every draft any office produces is generated against it and scored on
                  whether it held.
                </p>
              </div>
            </section>

            {/* 5 */}
            <section id="lifecycle" className="scroll-mt-24">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-5">
                Lifecycle messaging for undergraduate and graduate admissions
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                The same funnel stage calls for different messages depending on who is in it.
                Graduate and adult audiences are the ones most often served warmed-over
                undergraduate copy.
              </p>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="text-left font-semibold text-foreground px-5 py-3">Stage</th>
                      <th className="text-left font-semibold text-foreground px-5 py-3">
                        Undergraduate
                      </th>
                      <th className="text-left font-semibold text-foreground px-5 py-3">
                        Graduate / adult
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lifecycleStages.map((row) => (
                      <tr key={row.stage} className="border-t border-border">
                        <td className="px-5 py-4 font-medium text-foreground align-top whitespace-nowrap">
                          {row.stage}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground align-top">
                          {row.undergrad}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground align-top">{row.grad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 6 */}
            <section id="testing" className="scroll-mt-24">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-5">
                Testing without a dedicated analyst
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p>
                  Most higher ed teams do not have someone whose job is A/B testing, which is why
                  testing programs collapse after two months. Scale the ambition down until it
                  survives.
                </p>
                <ul>
                  <li>
                    <strong>One variable.</strong> Subject line or send time or call to action. Not
                    a redesign.
                  </li>
                  <li>
                    <strong>One sequence.</strong> Your highest-volume one, so results arrive before
                    interest dies.
                  </li>
                  <li>
                    <strong>Enough people.</strong> Below a few thousand recipients, a five percent
                    difference is noise. Say so out loud rather than reporting it as a win.
                  </li>
                  <li>
                    <strong>One number.</strong> Chosen before you start. Applications, deposits,
                    completed FAFSA filings. Not opens.
                  </li>
                </ul>
                <p>
                  Write the losing variant down too. The internal record of what did not work is
                  worth more over three years than the one result you can cite this quarter.
                </p>
              </div>
            </section>

            {/* 7 */}
            <section id="ai-and-aeo" className="scroll-mt-24">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-5">
                AI, AEO and GEO: what actually matters
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p>
                  Prospective students increasingly ask an AI assistant before they ask your
                  admissions office. Two acronyms have grown up around this.
                </p>
                <p>
                  <strong>AEO, answer engine optimization,</strong> is about making a single page
                  answerable. Question-shaped headings, a direct factual answer in the first
                  paragraph, structured data, no marketing preamble before the fact. If the answer
                  to "how much is tuition" is in the fourth section behind a viewbook download, it
                  will not be quoted.
                </p>
                <p>
                  <strong>GEO, generative engine optimization,</strong> is about being represented
                  accurately when a model synthesizes rather than ranks. That depends on consistency
                  across sources you do not own: directories, rankings sites, news coverage, Wikipedia.
                  Contradictory numbers across those sources are how institutions end up misquoted.
                </p>
                <p>
                  Neither replaces the underlying work. A model summarizing generic copy produces a
                  generic summary. Distinctiveness is still the asset.
                </p>
              </div>
            </section>

            {/* 8 */}
            <section id="choosing-tools" className="scroll-mt-24">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-5">
                How to choose an AI-driven enrollment marketing tool
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Five questions, in the order that matters. We build in this category, so weigh the
                source accordingly; the questions are still the right ones to ask any vendor,
                including us.
              </p>
              <div className="space-y-4">
                {toolCriteria.map((c, i) => (
                  <div key={c.q} className="p-6 rounded-xl border border-border bg-card">
                    <div className="flex gap-4">
                      <span className="font-mono text-xs text-muted-foreground pt-1">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{c.q}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{c.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 9 */}
            <section id="checklist" className="scroll-mt-24">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-5">
                The 90-day checklist
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                If you do nothing else from this guide, do these eight things in order.
              </p>
              <ol className="space-y-3">
                {checklist.map((item, i) => (
                  <li key={item} className="flex gap-4 p-4 rounded-lg border border-border bg-card">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-[hsl(82_85%_55%_/_0.15)] text-[hsl(82_60%_28%)] text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm text-muted-foreground leading-relaxed pt-0.5">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            {/* FAQ */}
            <section className="scroll-mt-24">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-6">
                Common questions
              </h2>
              <div className="space-y-6">
                {faqItems.map((f) => (
                  <div key={f.question} className="border-b border-border pb-6 last:border-0">
                    <h3 className="font-semibold text-foreground mb-2">{f.question}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Related */}
            <section className="scroll-mt-24">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Related
              </h2>
              <div className="flex flex-wrap gap-3">
                <Link to="/features/content-dna">
                  <Button variant="outline" size="sm">
                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                    Content DNA
                  </Button>
                </Link>
                <Link to="/features/message-builder">
                  <Button variant="outline" size="sm">
                    <Bot className="w-3.5 h-3.5 mr-2" />
                    Message Builder
                  </Button>
                </Link>
                <Link to="/features/evaluate">
                  <Button variant="outline" size="sm">
                    <FlaskConical className="w-3.5 h-3.5 mr-2" />
                    Evaluate
                  </Button>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </article>

      {/* CTA */}
      <section className="py-16 bg-primary relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            See it write for your institution
          </h2>
          <p className="text-primary-foreground/70 text-lg mb-8 max-w-2xl mx-auto">
            Paste in who you are talking to and watch the difference between generic copy and copy
            grounded in your voice. No account needed.
          </p>
          <Link to="/try-copywriter">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[hsl(82_85%_55%)] to-[hsl(82_85%_45%)] text-primary hover:from-[hsl(82_85%_50%)] hover:to-[hsl(82_85%_40%)] font-bold px-8 rounded-full"
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
