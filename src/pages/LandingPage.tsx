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
  Users,
  Target,
  Brain,
  Zap,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import campusvoiceLogo from '@/assets/campusvoice-logo-new.png';
import HowItWorksSection from '@/components/landing/HowItWorksSection';

const features = [
  {
    icon: MessageSquare,
    title: 'Brand-Aligned Messaging',
    description: 'Generate content grounded in your brand promise, pillars, and positioning. Not just voice.',
    link: '/features/message-builder',
  },
  {
    icon: BarChart3,
    title: 'Content DNA Scoring',
    description: 'Score messages against your institutional brand platform, not just generic persuasion principles.',
    link: '/features/content-dna',
  },
  {
    icon: Target,
    title: 'Journey Flow Builder',
    description: 'Map multi-channel strategies with duration, intensity, and ramp-up controls. The differentiator for comms leaders.',
    link: '/features/journey-designer',
  },
  {
    icon: BookOpen,
    title: 'University Library',
    description: 'Governed content with approval workflows. Personal drafts for experimentation. Shared libraries for approved, on-brand plays.',
    link: '/features/library',
  },
];

const valueProps = [
  {
    title: 'Brand protection at scale',
    description: '"Finally, a way to protect our brand across every college without being in every meeting." — A CMO\'s perspective',
  },
  {
    title: 'University-to-subunit governance',
    description: 'Build your institution profile once. Subunits inherit or customize brand elements with clear hierarchy and control.',
  },
  {
    title: 'Audience-first, brand-aligned',
    description: 'Start with your audience. Align to brand pillars. Then craft messages that resonate.',
  },
  {
    title: 'Journey planning that solves real problems',
    description: 'Map multi-week communication flows with intensity controls, ramp-up patterns, and visual timelines your team will actually use.',
  },
];

const trustIndicators = [
  { icon: Shield, label: 'Brand Governance' },
  { icon: Brain, label: 'Brand Platform-Driven' },
  { icon: GraduationCap, label: 'Built for Higher Ed' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* AI-Inspired Gradient Background */}
        <div className="absolute inset-0 gradient-hero-landing" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(200_70%_90%_/_0.4),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(173_58%_85%_/_0.3),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        
        {/* Lens flares - blurred and varied */}
        <div className="absolute top-20 right-[12%] w-32 h-32 bg-[hsl(270_70%_60%_/_0.18)] rounded-full blur-2xl" />
        <div className="absolute bottom-36 left-[8%] w-40 h-40 bg-[hsl(82_85%_55%_/_0.15)] rounded-full blur-3xl" />
        <div className="absolute top-44 left-[22%] w-24 h-24 bg-[hsl(200_100%_50%_/_0.15)] rounded-full blur-2xl" />
        <div className="absolute bottom-48 right-[25%] w-20 h-20 bg-[hsl(340_75%_55%_/_0.12)] rounded-full blur-2xl" />
        <div className="absolute top-32 right-[35%] w-16 h-16 bg-[hsl(82_85%_55%_/_0.2)] rounded-full blur-xl" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="text-center space-y-6">
            {/* Beta Badge */}
            <div className="animate-fade-in">
              <Badge 
                variant="secondary" 
                className="bg-[hsl(200_100%_50%_/_0.15)] text-[hsl(200_100%_50%)] border-[hsl(200_100%_50%_/_0.3)] px-4 py-1.5 text-sm font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Beta Access
              </Badge>
            </div>

            {/* Logo */}
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <img 
                src={campusvoiceLogo} 
                alt="CampusVoice.AI" 
                className="h-14 sm:h-16 lg:h-20 w-auto max-w-[280px] sm:max-w-[340px] lg:max-w-[400px] mx-auto"
              />
            </div>

            {/* Primary Slogan */}
            <h1 
              className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight animate-fade-in max-w-4xl mx-auto leading-tight"
              style={{ animationDelay: '0.2s' }}
            >
              <span className="text-[hsl(82_85%_55%)]">Plan.</span> <span className="text-[hsl(270_70%_60%)]">Strategize.</span> <span className="text-[hsl(200_100%_50%)]">Execute.</span>
              <span className="block text-foreground text-2xl sm:text-3xl lg:text-4xl mt-2">Your Digital Playbook for Higher Ed Communications</span>
            </h1>

            {/* Secondary Tagline */}
            <p 
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              Craft meaningful, research-driven, brand-informed messaging at scale. From the boardroom to every inbox.
            </p>

            {/* CTA Buttons */}
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-[hsl(82_85%_55%)] to-[hsl(82_85%_45%)] text-primary hover:from-[hsl(82_85%_50%)] hover:to-[hsl(82_85%_40%)] shadow-[0_0_30px_hsl(82_85%_55%_/_0.3)] hover:shadow-[0_0_40px_hsl(82_85%_55%_/_0.5)] transition-all duration-300 text-base px-8 py-6 font-bold border-0"
              >
                <Link to="/request-access">
                  Join the Beta
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 text-base px-8 py-6"
              >
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div 
              className="flex flex-wrap justify-center gap-6 pt-6 animate-fade-in"
              style={{ animationDelay: '0.5s' }}
            >
              {trustIndicators.map((indicator, index) => {
                const colors = [
                  'text-[hsl(82_85%_55%)]',
                  'text-[hsl(270_70%_60%)]', 
                  'text-[hsl(200_100%_50%)]'
                ];
                return (
                  <div 
                    key={indicator.label}
                    className="flex items-center gap-2 text-sm"
                  >
                    <indicator.icon className={`w-4 h-4 ${colors[index % 3]}`} />
                    <span className="text-muted-foreground">{indicator.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Wave Divider to How It Works (dark navy) */}
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

      {/* How It Works Section - Position #2 */}
      <HowItWorksSection />

      {/* Value Proposition Section - Fun Yellow Background */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(48_100%_90%)] relative overflow-hidden">
        {/* Lens flares - blurred and varied */}
        <div className="absolute top-12 right-[10%] w-28 h-28 bg-[hsl(270_70%_60%_/_0.2)] rounded-full blur-2xl" />
        <div className="absolute bottom-28 left-[6%] w-36 h-36 bg-[hsl(82_85%_55%_/_0.18)] rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-[40%] w-20 h-20 bg-[hsl(200_100%_50%_/_0.15)] rounded-full blur-2xl" />
        <div className="absolute bottom-1/3 right-[20%] w-16 h-16 bg-[hsl(340_75%_55%_/_0.15)] rounded-full blur-xl" />
        
        {/* Wave transition at bottom to mint section */}
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
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-3">
              <span className="text-[hsl(270_70%_55%)]">Stop Reacting.</span> Start Planning.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Most institutional communications are written on instinct. CampusVoice gives you 
              the research-backed playbook to plan, organize, and execute with confidence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {valueProps.map((prop, index) => {
              const colors = [
                { bg: 'bg-[hsl(82_85%_55%_/_0.2)]', icon: 'text-[hsl(82_70%_40%)]' },
                { bg: 'bg-[hsl(270_70%_60%_/_0.2)]', icon: 'text-[hsl(270_70%_55%)]' },
                { bg: 'bg-[hsl(200_100%_50%_/_0.2)]', icon: 'text-[hsl(200_100%_45%)]' },
                { bg: 'bg-[hsl(340_75%_55%_/_0.2)]', icon: 'text-[hsl(340_75%_50%)]' },
              ];
              const color = colors[index % 4];
              return (
                <div key={prop.title} className="text-center">
                  <div className={`w-12 h-12 rounded-2xl ${color.bg} flex items-center justify-center mx-auto mb-4 rotate-3 hover:rotate-0 transition-transform`}>
                    <CheckCircle2 className={`w-6 h-6 ${color.icon}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{prop.title}</h3>
                  <p className="text-sm text-muted-foreground">{prop.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section - Fresh Mint Background */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(173_40%_92%)] relative overflow-hidden">
        {/* Lens flares - blurred and varied */}
        <div className="absolute top-16 left-[18%] w-32 h-32 bg-[hsl(200_100%_50%_/_0.18)] rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-[15%] w-44 h-44 bg-[hsl(270_70%_60%_/_0.12)] rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-[8%] w-24 h-24 bg-[hsl(82_85%_55%_/_0.2)] rounded-full blur-2xl" />
        <div className="absolute bottom-1/3 left-[5%] w-20 h-20 bg-[hsl(340_75%_55%_/_0.12)] rounded-full blur-xl" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[hsl(82_85%_55%_/_0.2)] text-[hsl(82_70%_35%)] border-[hsl(82_85%_55%_/_0.4)]">
              <Zap className="w-3 h-3 mr-1" />
              Core Capabilities
            </Badge>
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-3">
              Powered by <span className="text-[hsl(200_100%_45%)]">Persuasion Science</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every feature is designed around how people actually make decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const cardColors = [
                { bg: 'bg-white', border: 'border-[hsl(82_85%_55%_/_0.4)]', iconBg: 'bg-[hsl(82_85%_55%_/_0.2)]', iconColor: 'text-[hsl(82_70%_35%)]', hoverBorder: 'hover:border-[hsl(82_85%_55%)]' },
                { bg: 'bg-white', border: 'border-[hsl(270_70%_60%_/_0.4)]', iconBg: 'bg-[hsl(270_70%_60%_/_0.2)]', iconColor: 'text-[hsl(270_70%_50%)]', hoverBorder: 'hover:border-[hsl(270_70%_60%)]' },
                { bg: 'bg-white', border: 'border-[hsl(200_100%_50%_/_0.4)]', iconBg: 'bg-[hsl(200_100%_50%_/_0.2)]', iconColor: 'text-[hsl(200_100%_40%)]', hoverBorder: 'hover:border-[hsl(200_100%_50%)]' },
                { bg: 'bg-white', border: 'border-[hsl(340_75%_55%_/_0.4)]', iconBg: 'bg-[hsl(340_75%_55%_/_0.2)]', iconColor: 'text-[hsl(340_75%_45%)]', hoverBorder: 'hover:border-[hsl(340_75%_55%)]' },
              ];
              const colors = cardColors[index % 4];
              return (
                <Link 
                  to={feature.link}
                  key={feature.title}
                  className={`group ${colors.bg} ${colors.border} border-2 rounded-2xl p-6 ${colors.hoverBorder} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer block`}
                >
                  <div className={`p-3 rounded-xl ${colors.iconBg} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${colors.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colors.iconColor.replace('text-[', '').replace(']', '') }}>
                    <span className={colors.iconColor}>Learn more</span>
                    <ArrowRight className={`w-4 h-4 ${colors.iconColor}`} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Wave transition to CTA section */}
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
              fill="hsl(270 60% 50%)"
            />
          </svg>
        </div>
      </section>

      {/* Secondary CTA Section - Vibrant Purple */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(270_60%_50%)] relative overflow-hidden">
        {/* Lens flares - blurred and varied */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-12 right-[12%] w-40 h-40 bg-[hsl(82_85%_55%_/_0.2)] rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-[8%] w-48 h-48 bg-[hsl(200_100%_50%_/_0.15)] rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-[25%] w-28 h-28 bg-[hsl(340_75%_60%_/_0.18)] rounded-full blur-2xl" />
          <div className="absolute bottom-1/3 right-[35%] w-20 h-20 bg-[hsl(82_85%_60%_/_0.15)] rounded-full blur-xl" />
        </div>
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="font-serif text-2xl sm:text-3xl text-white mb-4">
            Ready to become your institution's <span className="text-[hsl(82_85%_65%)]">digital brand enforcer</span>?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Small comms teams. Big brand protection. AI that keeps everyone on-brand while still allowing human edits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              size="lg"
              className="bg-[hsl(82_85%_55%)] text-primary hover:bg-[hsl(82_85%_50%)] shadow-xl hover:shadow-2xl hover:scale-105 px-8 font-bold transition-all duration-300 rounded-full"
            >
              <Link to="/request-access">
                Request Beta Access
              </Link>
            </Button>
            <Button 
              asChild
              variant="ghost"
              size="lg"
              className="text-white hover:text-white hover:bg-white/20 rounded-full border-2 border-white/30"
            >
              <Link to="/login">
                Already have an account? Sign in
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Playful but professional */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={campusvoiceLogo} 
              alt="CampusVoice.AI" 
              className="h-7 w-auto max-w-[140px] brightness-0 invert opacity-90"
            />
            <span className="text-sm text-primary-foreground/70">
              © 2025 CampusVoice.AI
            </span>
          </div>
          <p className="text-sm text-primary-foreground/60">
            Research-grounded messaging intelligence for higher education.
          </p>
        </div>
      </footer>
    </div>
  );
}
