import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  Sparkles,
  Dna,
  Brain,
  Target,
  CheckCircle2,
  Zap,
  BarChart3,
  FileText,
  Layers,
  Wand2,
  ArrowLeft
} from 'lucide-react';
import uplaybookLogo from '@/assets/uplaybook-logo.png';

const capabilities = [
  {
    icon: FileText,
    title: 'Upload Your Best Work',
    description: 'Drop in emails, newsletters, speeches, or web copy that exemplifies your voice. The AI learns from real examples.',
  },
  {
    icon: Brain,
    title: 'AI Voice Analysis',
    description: 'Our AI deconstructs your writing patterns, identifying tone, vocabulary preferences, sentence structure, and emotional resonance.',
  },
  {
    icon: Target,
    title: 'Brand Platform Integration',
    description: 'Connect your brand pillars, promise, and positioning. Every piece of content is scored against your institutional identity.',
  },
  {
    icon: Wand2,
    title: 'Custom Instructions',
    description: 'Add specific guidance like "always use Oxford comma" or "avoid jargon." Your rules, your voice.',
  },
];

const aiFeatures = [
  'Automatically extracts voice characteristics from your samples',
  'Identifies writing patterns unique to your institution',
  'Scores new content against your established DNA',
  'Learns and improves with every sample you add',
  'Works across all message types and channels',
];

export default function ContentDNAFeaturePage() {
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(270_70%_90%_/_0.4),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(200_100%_85%_/_0.3),_transparent_50%)]" />
        
        {/* Lens flares */}
        <div className="absolute top-20 right-[15%] w-40 h-40 bg-[hsl(270_70%_60%_/_0.2)] rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute bottom-32 left-[10%] w-48 h-48 bg-[hsl(200_100%_50%_/_0.15)] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-[30%] w-32 h-32 bg-[hsl(82_85%_55%_/_0.2)] rounded-full blur-2xl" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="text-center space-y-8">
            <Badge 
              variant="secondary" 
              className="bg-[hsl(270_70%_60%_/_0.15)] text-[hsl(270_70%_50%)] border-[hsl(270_70%_60%_/_0.3)] px-4 py-1.5 text-sm font-semibold animate-fade-in"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              AI-Powered
            </Badge>

            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[hsl(270_70%_60%)] to-[hsl(270_70%_45%)] mb-6 shadow-2xl">
                <Dna className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 
              className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground tracking-tight animate-fade-in max-w-4xl mx-auto"
              style={{ animationDelay: '0.2s' }}
            >
              <span className="text-[hsl(270_70%_55%)]">Content DNA.</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl mt-3 text-muted-foreground font-sans font-normal">
                Your voice, captured. Your brand, protected.
              </span>
            </h1>

            <p 
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              Upload your best content. Let AI learn your unique voice. Generate new messages that sound authentically you—every single time.
            </p>

            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-[hsl(270_70%_55%)] to-[hsl(270_70%_45%)] text-white hover:from-[hsl(270_70%_50%)] hover:to-[hsl(270_70%_40%)] shadow-[0_0_30px_hsl(270_70%_55%_/_0.3)] hover:shadow-[0_0_40px_hsl(270_70%_55%_/_0.5)] transition-all duration-300 text-base px-8 py-6 font-bold border-0"
              >
                <Link to="/request-access">
                  Start Building Your DNA
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(270 50% 96%)" />
          </svg>
        </div>
      </header>

      {/* Mock Interface Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(270_50%_96%)] relative overflow-hidden">
        <div className="absolute top-12 right-[10%] w-36 h-36 bg-[hsl(270_70%_60%_/_0.15)] rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-[8%] w-44 h-44 bg-[hsl(200_100%_50%_/_0.1)] rounded-full blur-3xl" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="bg-white rounded-3xl shadow-2xl border border-[hsl(270_70%_60%_/_0.2)] overflow-hidden">
            {/* Mock Header Bar */}
            <div className="bg-gradient-to-r from-[hsl(270_70%_55%)] to-[hsl(270_70%_45%)] px-6 py-4 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white/30" />
                <div className="w-3 h-3 rounded-full bg-white/30" />
                <div className="w-3 h-3 rounded-full bg-white/30" />
              </div>
              <span className="text-white/80 text-sm font-medium ml-4">Content DNA Analysis</span>
            </div>
            
            {/* Mock Content */}
            <div className="p-8 grid md:grid-cols-2 gap-8">
              {/* Left: Sample Upload Area */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[hsl(270_70%_55%)]" />
                  Content Samples
                </h3>
                <div className="space-y-3">
                  {['Welcome Email - Fall 2024', 'President\'s Letter Draft', 'Donor Thank You Template'].map((sample, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50">
                      <div className="w-8 h-8 rounded-lg bg-[hsl(270_70%_60%_/_0.2)] flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[hsl(270_70%_55%)]" />
                      </div>
                      <span className="text-sm text-foreground">{sample}</span>
                      <CheckCircle2 className="w-4 h-4 text-[hsl(82_85%_45%)] ml-auto" />
                    </div>
                  ))}
                </div>
                <div className="border-2 border-dashed border-[hsl(270_70%_60%_/_0.3)] rounded-xl p-6 text-center hover:border-[hsl(270_70%_55%)] transition-colors cursor-pointer">
                  <Zap className="w-6 h-6 text-[hsl(270_70%_55%)] mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Drop files here or click to upload</p>
                </div>
              </div>
              
              {/* Right: Voice Analysis Results */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[hsl(270_70%_55%)]" />
                  Voice Analysis
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Warmth & Approachability', value: 87 },
                    { label: 'Academic Authority', value: 92 },
                    { label: 'Brand Consistency', value: 78 },
                  ].map((metric, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{metric.label}</span>
                        <span className="font-semibold text-[hsl(270_70%_55%)]">{metric.value}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[hsl(270_70%_55%)] to-[hsl(270_70%_45%)] rounded-full transition-all duration-1000"
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-[hsl(82_85%_55%_/_0.1)] rounded-xl p-4 border border-[hsl(82_85%_55%_/_0.2)]">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">AI Insight:</span> Your voice balances warmth with authority effectively. Consider increasing consistency in opening phrases.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
        <div className="absolute top-16 left-[18%] w-40 h-40 bg-[hsl(270_70%_60%_/_0.1)] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-[15%] w-48 h-48 bg-[hsl(82_85%_55%_/_0.1)] rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[hsl(82_85%_55%_/_0.2)] text-[hsl(82_70%_35%)] border-[hsl(82_85%_55%_/_0.4)]">
              <Layers className="w-3 h-3 mr-1" />
              How It Works
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">
              Four steps to <span className="text-[hsl(270_70%_55%)]">capture your voice</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {capabilities.map((cap, index) => (
              <div 
                key={cap.title}
                className="group relative bg-card border-2 border-[hsl(270_70%_60%_/_0.2)] rounded-2xl p-6 hover:border-[hsl(270_70%_55%)] hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(270_70%_55%)] to-[hsl(270_70%_45%)] text-white font-bold flex items-center justify-center text-sm shadow-lg">
                  {index + 1}
                </div>
                <div className="p-3 rounded-xl bg-[hsl(270_70%_60%_/_0.15)] w-fit mb-4 group-hover:scale-110 transition-transform">
                  <cap.icon className="w-6 h-6 text-[hsl(270_70%_50%)]" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{cap.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(270_60%_50%)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-12 right-[12%] w-48 h-48 bg-[hsl(82_85%_55%_/_0.2)] rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-[8%] w-56 h-56 bg-[hsl(200_100%_50%_/_0.15)] rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-white/20 text-white border-white/30">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by AI
          </Badge>
          <h2 className="font-serif text-3xl sm:text-4xl text-white mb-8">
            AI that <span className="text-[hsl(82_85%_65%)]">learns</span> your institution
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            {aiFeatures.map((feature, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <CheckCircle2 className="w-5 h-5 text-[hsl(82_85%_55%)] flex-shrink-0 mt-0.5" />
                <span className="text-white/90 text-sm">{feature}</span>
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
