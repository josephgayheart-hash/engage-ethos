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
import uplaybookLogo from '@/assets/uplaybook-logo.png';

const features = [
  {
    icon: MessageSquare,
    title: 'Build Messages',
    description: 'Generate research-backed communications tailored to your audience, moment, and goal.',
  },
  {
    icon: BarChart3,
    title: 'Evaluate Content',
    description: 'Score existing messages against Cialdini\'s persuasion framework and cognitive load principles.',
  },
  {
    icon: Target,
    title: 'Design Journeys',
    description: 'Map multi-channel communication strategies for any initiative, campaign, or audience.',
  },
  {
    icon: BookOpen,
    title: 'Library & Governance',
    description: 'Personal and shared libraries with approval workflows—build your institution\'s playbook of vetted messages.',
  },
];

const valueProps = [
  {
    title: 'From meeting to message in minutes',
    description: 'Turn leadership directives into structured communication plans instantly—not days.',
  },
  {
    title: 'Speak with one institutional voice',
    description: 'Define your Content DNA once, and every AI-generated message reflects your brand.',
  },
  {
    title: 'Strategy first, execution second',
    description: 'Not a CRM—the organized pre-work that makes your marketing tools actually effective.',
  },
  {
    title: 'Institutional message governance',
    description: 'Personal libraries for drafts, shared libraries for approved plays—your whole institution on the same page.',
  },
];

const trustIndicators = [
  { icon: Shield, label: 'Research-Grounded' },
  { icon: Brain, label: 'Behavioral Science' },
  { icon: GraduationCap, label: 'Built for Higher Ed' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-stone-100 to-slate-100" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="text-center space-y-6">
            {/* Beta Badge */}
            <div className="animate-fade-in">
              <Badge 
                variant="secondary" 
                className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Beta Access
              </Badge>
            </div>

            {/* Logo */}
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <img 
                src={uplaybookLogo} 
                alt="UPlaybook.AI" 
                className="h-10 sm:h-12 w-auto max-w-[200px] sm:max-w-[260px] mx-auto"
              />
            </div>

            {/* Primary Slogan */}
            <h1 
              className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight animate-fade-in max-w-4xl mx-auto leading-tight"
              style={{ animationDelay: '0.2s' }}
            >
              Plan. Strategize. Execute.
              <span className="block text-primary text-2xl sm:text-3xl lg:text-4xl mt-2">Your Playbook for Higher Ed Communications</span>
            </h1>

            {/* Secondary Tagline */}
            <p 
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              The strategy and planning layer for university communications. From boardroom to inbox—organize your thinking before you hit send.
            </p>

            {/* CTA Buttons */}
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <Button 
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 text-base px-8 py-6 font-semibold"
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
              {trustIndicators.map((indicator) => (
                <div 
                  key={indicator.label}
                  className="flex items-center gap-2 text-muted-foreground text-sm"
                >
                  <indicator.icon className="w-4 h-4" />
                  <span>{indicator.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg 
            viewBox="0 0 1440 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path 
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="hsl(210 20% 98%)"
            />
          </svg>
        </div>
      </header>

      {/* Value Proposition Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-3">
              Stop Reacting. Start Planning.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Most institutional communications are written on instinct. UPlaybook gives you 
              the research-backed playbook to plan, organize, and execute with confidence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {valueProps.map((prop, index) => (
              <div key={prop.title} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{prop.title}</h3>
                <p className="text-sm text-muted-foreground">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Zap className="w-3 h-3 mr-1" />
              Core Capabilities
            </Badge>
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-3">
              Powered by Persuasion Science
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every feature is designed around how people actually make decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group bg-card border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary CTA Section - Navy Blue */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#1e3a5f] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="font-serif text-2xl sm:text-3xl text-white mb-4">
            Ready to transform how your institution plans communications?
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            Join forward-thinking institutions using UPlaybook to organize and execute strategic messaging.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              size="lg"
              className="bg-white text-[#1e3a5f] hover:bg-white/90 px-8 font-semibold"
            >
              <Link to="/request-access">
                Request Beta Access
              </Link>
            </Button>
            <Button 
              asChild
              variant="ghost"
              size="lg"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <Link to="/login">
                Already have an account? Sign in
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img 
              src={uplaybookLogo} 
              alt="UPlaybook.AI" 
              className="h-6 w-auto max-w-[140px] opacity-70"
            />
            <span className="text-sm text-muted-foreground">
              © 2025 UPlaybook.AI
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Research-grounded messaging intelligence for higher education.
          </p>
        </div>
      </footer>
    </div>
  );
}
