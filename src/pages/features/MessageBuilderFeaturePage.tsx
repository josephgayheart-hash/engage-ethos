import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  Sparkles,
  MessageSquare,
  Wand2,
  Target,
  CheckCircle2,
  Zap,
  Users,
  Mail,
  Phone,
  Globe,
  ArrowLeft,
  Layers
} from 'lucide-react';
import uplaybookLogo from '@/assets/uplaybook-logo.png';

const channels = [
  { icon: Mail, name: 'Email', color: 'hsl(200_100%_50%)' },
  { icon: MessageSquare, name: 'SMS', color: 'hsl(82_85%_55%)' },
  { icon: Phone, name: 'Call Script', color: 'hsl(270_70%_60%)' },
  { icon: Globe, name: 'Web Copy', color: 'hsl(340_75%_55%)' },
];

const features = [
  {
    icon: Target,
    title: 'Audience-First Approach',
    description: 'Start with who you\'re speaking to. The AI tailors tone, complexity, and messaging based on your audience segment.',
  },
  {
    icon: Wand2,
    title: 'Brand-Aligned Generation',
    description: 'Every message is generated using your Content DNA, ensuring authentic voice and brand compliance.',
  },
  {
    icon: Users,
    title: 'Multi-Channel Output',
    description: 'One brief, multiple formats. Generate email, SMS, call scripts, and web copy simultaneously.',
  },
  {
    icon: Layers,
    title: 'Refinement Workflow',
    description: 'Iterate with AI assistance. Request variations, adjust tone, or tweak length with natural language.',
  },
];

export default function MessageBuilderFeaturePage() {
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(82_85%_90%_/_0.4),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(270_70%_85%_/_0.3),_transparent_50%)]" />
        
        {/* Lens flares */}
        <div className="absolute top-24 right-[18%] w-44 h-44 bg-[hsl(82_85%_55%_/_0.2)] rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute bottom-28 left-[12%] w-52 h-52 bg-[hsl(270_70%_60%_/_0.15)] rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-[35%] w-36 h-36 bg-[hsl(200_100%_50%_/_0.18)] rounded-full blur-2xl" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="text-center space-y-8">
            <Badge 
              variant="secondary" 
              className="bg-[hsl(82_85%_55%_/_0.15)] text-[hsl(82_70%_35%)] border-[hsl(82_85%_55%_/_0.3)] px-4 py-1.5 text-sm font-semibold animate-fade-in"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              AI Message Builder
            </Badge>

            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[hsl(82_85%_55%)] to-[hsl(82_85%_40%)] mb-6 shadow-2xl">
                <MessageSquare className="w-10 h-10 text-primary" />
              </div>
            </div>

            <h1 
              className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground tracking-tight animate-fade-in max-w-4xl mx-auto"
              style={{ animationDelay: '0.2s' }}
            >
              <span className="text-[hsl(82_85%_45%)]">Build Messages.</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl mt-3 text-muted-foreground font-sans font-normal">
                On-brand, on-point, in seconds.
              </span>
            </h1>

            <p 
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              Tell the AI your audience and goal. Get perfectly crafted messages that match your institutional voice—ready for email, SMS, or any channel.
            </p>

            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-[hsl(82_85%_55%)] to-[hsl(82_85%_40%)] text-primary hover:from-[hsl(82_85%_50%)] hover:to-[hsl(82_85%_35%)] shadow-[0_0_30px_hsl(82_85%_55%_/_0.3)] hover:shadow-[0_0_40px_hsl(82_85%_55%_/_0.5)] transition-all duration-300 text-base px-8 py-6 font-bold border-0"
              >
                <Link to="/request-access">
                  Start Building Messages
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(82 50% 96%)" />
          </svg>
        </div>
      </header>

      {/* Channel Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[hsl(82_50%_96%)] relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-4">
              One input. <span className="text-[hsl(82_85%_45%)]">Every channel.</span>
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            {channels.map((channel, i) => (
              <div 
                key={channel.name}
                className="group flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-[hsl(82_85%_55%)]"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${channel.color.replace(')', ' / 0.15)')}` }}
                >
                  <channel.icon className="w-6 h-6" style={{ color: channel.color.replace(')', ')') }} />
                </div>
                <span className="font-semibold text-foreground">{channel.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mock Interface */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
        <div className="absolute top-12 left-[10%] w-40 h-40 bg-[hsl(82_85%_55%_/_0.12)] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-[8%] w-48 h-48 bg-[hsl(270_70%_60%_/_0.1)] rounded-full blur-3xl" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="bg-white rounded-3xl shadow-2xl border border-[hsl(82_85%_55%_/_0.2)] overflow-hidden">
            {/* Mock Header */}
            <div className="bg-gradient-to-r from-[hsl(82_85%_55%)] to-[hsl(82_85%_40%)] px-6 py-4 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/30" />
                <div className="w-3 h-3 rounded-full bg-primary/30" />
                <div className="w-3 h-3 rounded-full bg-primary/30" />
              </div>
              <span className="text-primary/80 text-sm font-medium ml-4">Message Builder</span>
            </div>
            
            {/* Mock Content */}
            <div className="p-8">
              {/* Input Area */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-[hsl(82_85%_45%)]" />
                  <span className="font-semibold text-foreground">What do you want to say?</span>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <p className="text-muted-foreground">
                    "Write a warm welcome email for incoming transfer students, emphasizing our support services and campus community..."
                  </p>
                </div>
              </div>
              
              {/* Generated Output */}
              <div className="bg-gradient-to-br from-[hsl(82_85%_55%_/_0.08)] to-[hsl(82_85%_55%_/_0.03)] rounded-2xl p-6 border border-[hsl(82_85%_55%_/_0.2)]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(82_85%_55%_/_0.2)] flex items-center justify-center">
                    <Wand2 className="w-4 h-4 text-[hsl(82_85%_45%)]" />
                  </div>
                  <span className="font-semibold text-foreground">AI-Generated Message</span>
                  <Badge className="ml-auto bg-[hsl(82_85%_55%_/_0.2)] text-[hsl(82_70%_35%)] border-0">Email</Badge>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground mb-3"><strong>Subject:</strong> Welcome Home – Your Transfer Journey Starts Here</p>
                  <p className="text-muted-foreground mb-3">Dear [First Name],</p>
                  <p className="text-muted-foreground mb-3">
                    We're thrilled to welcome you to our community! As a transfer student, you bring unique experiences and perspectives that enrich our campus. We know that transitioning to a new institution can feel overwhelming...
                  </p>
                  <p className="text-muted-foreground/60 text-xs">[Preview continues...]</p>
                </div>
                
                <div className="flex gap-2 mt-4 pt-4 border-t border-[hsl(82_85%_55%_/_0.2)]">
                  <Button size="sm" variant="outline" className="text-xs">Make it shorter</Button>
                  <Button size="sm" variant="outline" className="text-xs">More formal</Button>
                  <Button size="sm" variant="outline" className="text-xs">Add CTA</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(173_40%_95%)] relative overflow-hidden">
        <div className="absolute top-16 right-[18%] w-44 h-44 bg-[hsl(82_85%_55%_/_0.15)] rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-[15%] w-52 h-52 bg-[hsl(270_70%_60%_/_0.1)] rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[hsl(173_58%_39%_/_0.2)] text-[hsl(173_58%_30%)] border-[hsl(173_58%_39%_/_0.4)]">
              <Zap className="w-3 h-3 mr-1" />
              Smart Features
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">
              Built for <span className="text-[hsl(173_58%_35%)]">communication professionals</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group bg-white border-2 border-[hsl(82_85%_55%_/_0.2)] rounded-2xl p-8 hover:border-[hsl(82_85%_55%)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-4 rounded-2xl bg-[hsl(82_85%_55%_/_0.12)] w-fit mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-[hsl(82_85%_40%)]" />
                </div>
                <h3 className="font-semibold text-xl text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(82_70%_45%)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-12 right-[12%] w-48 h-48 bg-[hsl(270_70%_60%_/_0.2)] rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-[8%] w-56 h-56 bg-[hsl(200_100%_50%_/_0.15)] rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="font-serif text-3xl sm:text-4xl text-primary mb-4">
            Stop starting from scratch.
          </h2>
          <p className="text-primary/80 mb-8 text-lg">
            Let AI handle the first draft while you focus on strategy and connection.
          </p>
          <Button 
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl hover:shadow-2xl hover:scale-105 px-8 font-bold transition-all duration-300 rounded-full"
          >
            <Link to="/request-access">
              Request Beta Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
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
