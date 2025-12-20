import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  Sparkles,
  Route,
  Calendar,
  Zap,
  CheckCircle2,
  Mail,
  MessageSquare,
  Phone,
  Clock,
  TrendingUp,
  ArrowLeft,
  Layers,
  Target
} from 'lucide-react';
import uplaybookLogo from '@/assets/uplaybook-logo.png';

const journeySteps = [
  { day: 'Day 1', type: 'Email', title: 'Welcome & Introduction', intensity: 'high' },
  { day: 'Day 3', type: 'SMS', title: 'Quick check-in', intensity: 'low' },
  { day: 'Day 7', type: 'Email', title: 'Resource overview', intensity: 'medium' },
  { day: 'Day 10', type: 'Call', title: 'Personal outreach', intensity: 'high' },
  { day: 'Day 14', type: 'Email', title: 'Event invitation', intensity: 'medium' },
];

const features = [
  {
    icon: Calendar,
    title: 'Visual Timeline Builder',
    description: 'Drag and drop to create communication flows. See your entire journey at a glance.',
  },
  {
    icon: TrendingUp,
    title: 'Intensity Controls',
    description: 'Set ramp-up patterns that feel natural. Start soft, build engagement, avoid fatigue.',
  },
  {
    icon: Target,
    title: 'Goal-Based Planning',
    description: 'Define the outcome first. The AI suggests optimal timing and channel mix.',
  },
  {
    icon: Layers,
    title: 'Template Integration',
    description: 'Connect journey touchpoints to your approved message templates instantly.',
  },
];

const benefits = [
  'Replace spreadsheet chaos with visual planning',
  'Coordinate across email, SMS, and phone channels',
  'Set automatic intensity ramp-ups and cool-downs',
  'Export to your CRM or marketing platform',
  'Never lose track of where contacts are in their journey',
];

export default function JourneyDesignerFeaturePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            <img src={uplaybookLogo} alt="UPlaybook.AI" className="h-8 w-auto" />
          </Link>
          <div className="flex gap-3">
            <Button asChild variant="outline" size="sm">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-to-r from-[hsl(82_85%_55%)] to-[hsl(82_85%_45%)] text-primary hover:from-[hsl(82_85%_50%)] hover:to-[hsl(82_85%_40%)]">
              <Link to="/request-access">Join Beta</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero-landing" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(200_100%_90%_/_0.4),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(82_85%_85%_/_0.3),_transparent_50%)]" />
        
        {/* Lens flares */}
        <div className="absolute top-20 right-[20%] w-44 h-44 bg-[hsl(200_100%_50%_/_0.2)] rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute bottom-32 left-[15%] w-52 h-52 bg-[hsl(82_85%_55%_/_0.15)] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-[40%] w-36 h-36 bg-[hsl(270_70%_60%_/_0.18)] rounded-full blur-2xl" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="text-center space-y-8">
            <Badge 
              variant="secondary" 
              className="bg-[hsl(200_100%_50%_/_0.15)] text-[hsl(200_100%_40%)] border-[hsl(200_100%_50%_/_0.3)] px-4 py-1.5 text-sm font-semibold animate-fade-in"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Visual Journey Planning
            </Badge>

            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[hsl(200_100%_50%)] to-[hsl(200_100%_40%)] mb-6 shadow-2xl">
                <Route className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 
              className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground tracking-tight animate-fade-in max-w-4xl mx-auto"
              style={{ animationDelay: '0.2s' }}
            >
              <span className="text-[hsl(200_100%_45%)]">Journey Designer.</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl mt-3 text-muted-foreground font-sans font-normal">
                Multi-week campaigns, visualized.
              </span>
            </h1>

            <p 
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              Map communication journeys that actually get used. Visual timelines, intensity controls, and seamless message integration.
            </p>

            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-[hsl(200_100%_50%)] to-[hsl(200_100%_40%)] text-white hover:from-[hsl(200_100%_45%)] hover:to-[hsl(200_100%_35%)] shadow-[0_0_30px_hsl(200_100%_50%_/_0.3)] hover:shadow-[0_0_40px_hsl(200_100%_50%_/_0.5)] transition-all duration-300 text-base px-8 py-6 font-bold border-0"
              >
                <Link to="/request-access">
                  Start Designing Journeys
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(200 40% 96%)" />
          </svg>
        </div>
      </header>

      {/* Visual Journey Demo */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(200_40%_96%)] relative overflow-hidden">
        <div className="absolute top-12 right-[10%] w-40 h-40 bg-[hsl(200_100%_50%_/_0.15)] rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-[8%] w-48 h-48 bg-[hsl(82_85%_55%_/_0.1)] rounded-full blur-3xl" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-4">
              See your <span className="text-[hsl(200_100%_45%)]">entire journey</span> at a glance
            </h2>
          </div>
          
          {/* Mock Timeline */}
          <div className="bg-white rounded-3xl shadow-2xl border border-[hsl(200_100%_50%_/_0.2)] overflow-hidden">
            <div className="bg-gradient-to-r from-[hsl(200_100%_50%)] to-[hsl(200_100%_40%)] px-6 py-4 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white/30" />
                <div className="w-3 h-3 rounded-full bg-white/30" />
                <div className="w-3 h-3 rounded-full bg-white/30" />
              </div>
              <span className="text-white/80 text-sm font-medium ml-4">Fall Welcome Journey</span>
            </div>
            
            <div className="p-8">
              {/* Timeline Container */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(200_100%_50%_/_0.3)] via-[hsl(82_85%_55%_/_0.5)] to-[hsl(270_70%_60%_/_0.3)] rounded-full" />
                
                {/* Timeline Steps */}
                <div className="relative flex justify-between">
                  {journeySteps.map((step, i) => {
                    const icons = { 'Email': Mail, 'SMS': MessageSquare, 'Call': Phone };
                    const Icon = icons[step.type as keyof typeof icons] || Mail;
                    const intensityColors = {
                      'high': 'bg-[hsl(340_75%_55%)] shadow-[0_0_10px_hsl(340_75%_55%_/_0.4)]',
                      'medium': 'bg-[hsl(82_85%_55%)] shadow-[0_0_10px_hsl(82_85%_55%_/_0.4)]',
                      'low': 'bg-[hsl(200_100%_50%)] shadow-[0_0_10px_hsl(200_100%_50%_/_0.4)]',
                    };
                    
                    return (
                      <div key={i} className="flex flex-col items-center group">
                        <div className={`w-16 h-16 rounded-2xl ${intensityColors[step.intensity as keyof typeof intensityColors]} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-xs font-bold text-[hsl(200_100%_45%)]">{step.day}</span>
                        <span className="text-xs text-muted-foreground mt-1 text-center max-w-20">{step.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Intensity Legend */}
              <div className="flex justify-center gap-6 mt-8 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(340_75%_55%)]" />
                  <span className="text-xs text-muted-foreground">High Intensity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(82_85%_55%)]" />
                  <span className="text-xs text-muted-foreground">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(200_100%_50%)]" />
                  <span className="text-xs text-muted-foreground">Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
        <div className="absolute top-16 left-[18%] w-44 h-44 bg-[hsl(200_100%_50%_/_0.1)] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-[15%] w-52 h-52 bg-[hsl(270_70%_60%_/_0.1)] rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[hsl(200_100%_50%_/_0.2)] text-[hsl(200_100%_40%)] border-[hsl(200_100%_50%_/_0.4)]">
              <Zap className="w-3 h-3 mr-1" />
              Powerful Features
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">
              Planning that <span className="text-[hsl(200_100%_45%)]">makes sense</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="group bg-card border-2 border-[hsl(200_100%_50%_/_0.2)] rounded-2xl p-8 hover:border-[hsl(200_100%_50%)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-4 rounded-2xl bg-[hsl(200_100%_50%_/_0.12)] w-fit mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-[hsl(200_100%_40%)]" />
                </div>
                <h3 className="font-semibold text-xl text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(200_90%_45%)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-12 right-[12%] w-48 h-48 bg-[hsl(82_85%_55%_/_0.2)] rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-[8%] w-56 h-56 bg-[hsl(270_70%_60%_/_0.15)] rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-white/20 text-white border-white/30">
            <Clock className="w-3 h-3 mr-1" />
            Save Hours Every Week
          </Badge>
          <h2 className="font-serif text-3xl sm:text-4xl text-white mb-8">
            Why comms teams <span className="text-[hsl(82_85%_65%)]">love it</span>
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <CheckCircle2 className="w-5 h-5 text-[hsl(82_85%_55%)] flex-shrink-0 mt-0.5" />
                <span className="text-white/90 text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Button 
              asChild
              size="lg"
              className="bg-[hsl(82_85%_55%)] text-primary hover:bg-[hsl(82_85%_50%)] shadow-xl hover:shadow-2xl hover:scale-105 px-8 font-bold transition-all duration-300 rounded-full"
            >
              <Link to="/request-access">
                Request Beta Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={uplaybookLogo} alt="UPlaybook.AI" className="h-7 w-auto max-w-[140px] brightness-0 invert opacity-90" />
          </div>
          <p className="text-primary-foreground/60 text-sm">
            © 2025 UPlaybook.AI. Built for Higher Education.
          </p>
        </div>
      </footer>
    </div>
  );
}
