import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  Sparkles,
  ClipboardCheck,
  BarChart3,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Target,
  Brain,
  ArrowLeft,
  Zap,
  TrendingUp
} from 'lucide-react';
import uplaybookLogo from '@/assets/uplaybook-logo.png';

const scoringCriteria = [
  { name: 'Brand Alignment', score: 92, color: 'hsl(82_85%_55%)' },
  { name: 'Voice Consistency', score: 87, color: 'hsl(270_70%_60%)' },
  { name: 'Persuasion Principles', score: 78, color: 'hsl(200_100%_50%)' },
  { name: 'Accessibility', score: 94, color: 'hsl(173_58%_39%)' },
  { name: 'Emotional Resonance', score: 85, color: 'hsl(340_75%_55%)' },
];

const features = [
  {
    icon: BarChart3,
    title: 'Multi-Dimensional Scoring',
    description: 'Evaluate across brand alignment, voice, persuasion science, and accessibility—all in one analysis.',
  },
  {
    icon: Shield,
    title: 'Brand Platform Matching',
    description: 'See exactly how your message maps to your brand pillars, promise, and positioning.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Suggestions',
    description: 'Get specific, actionable recommendations to improve each area of your message.',
  },
  {
    icon: Target,
    title: 'Before & After Comparison',
    description: 'Track improvements as you refine. See your score climb in real-time.',
  },
];

export default function EvaluateFeaturePage() {
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(340_75%_90%_/_0.4),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(173_58%_85%_/_0.3),_transparent_50%)]" />
        
        {/* Lens flares */}
        <div className="absolute top-24 right-[16%] w-44 h-44 bg-[hsl(340_75%_55%_/_0.2)] rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute bottom-28 left-[12%] w-52 h-52 bg-[hsl(82_85%_55%_/_0.15)] rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-[40%] w-36 h-36 bg-[hsl(200_100%_50%_/_0.18)] rounded-full blur-2xl" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="text-center space-y-8">
            <Badge 
              variant="secondary" 
              className="bg-[hsl(340_75%_55%_/_0.15)] text-[hsl(340_75%_45%)] border-[hsl(340_75%_55%_/_0.3)] px-4 py-1.5 text-sm font-semibold animate-fade-in"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              AI Evaluation Engine
            </Badge>

            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[hsl(340_75%_55%)] to-[hsl(340_75%_40%)] mb-6 shadow-2xl">
                <ClipboardCheck className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 
              className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground tracking-tight animate-fade-in max-w-4xl mx-auto"
              style={{ animationDelay: '0.2s' }}
            >
              <span className="text-[hsl(340_75%_50%)]">Evaluate.</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl mt-3 text-muted-foreground font-sans font-normal">
                Score messages against your brand.
              </span>
            </h1>

            <p 
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              Paste any message—existing content or new drafts. Get instant scoring across brand alignment, voice consistency, and persuasion effectiveness.
            </p>

            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-[hsl(340_75%_55%)] to-[hsl(340_75%_40%)] text-white hover:from-[hsl(340_75%_50%)] hover:to-[hsl(340_75%_35%)] shadow-[0_0_30px_hsl(340_75%_55%_/_0.3)] hover:shadow-[0_0_40px_hsl(340_75%_55%_/_0.5)] transition-all duration-300 text-base px-8 py-6 font-bold border-0"
              >
                <Link to="/request-access">
                  Start Evaluating Content
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(340 40% 96%)" />
          </svg>
        </div>
      </header>

      {/* Mock Scoring Interface */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(340_40%_96%)] relative overflow-hidden">
        <div className="absolute top-12 right-[10%] w-40 h-40 bg-[hsl(340_75%_55%_/_0.12)] rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-[8%] w-48 h-48 bg-[hsl(82_85%_55%_/_0.1)] rounded-full blur-3xl" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="bg-white rounded-3xl shadow-2xl border border-[hsl(340_75%_55%_/_0.2)] overflow-hidden">
            {/* Mock Header */}
            <div className="bg-gradient-to-r from-[hsl(340_75%_55%)] to-[hsl(340_75%_40%)] px-6 py-4 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white/30" />
                <div className="w-3 h-3 rounded-full bg-white/30" />
                <div className="w-3 h-3 rounded-full bg-white/30" />
              </div>
              <span className="text-white/80 text-sm font-medium ml-4">Message Evaluator</span>
            </div>
            
            <div className="p-8 grid lg:grid-cols-2 gap-8">
              {/* Left: Message Input */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardCheck className="w-5 h-5 text-[hsl(340_75%_50%)]" />
                  <span className="font-semibold text-foreground">Your Message</span>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50 min-h-[200px]">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Dear Prospective Student,
                    <br /><br />
                    We are pleased to inform you that your application has been received. Our admissions committee will carefully review your materials...
                  </p>
                </div>
                
                {/* Quick Feedback */}
                <div className="mt-4 p-4 bg-[hsl(45_93%_95%)] rounded-xl border border-[hsl(45_93%_80%)]">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[hsl(45_93%_35%)] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Suggestion:</span> Opening feels formal and distant. Consider a warmer, more personal approach.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Right: Scoring Results */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[hsl(340_75%_50%)]" />
                    <span className="font-semibold text-foreground">Brand Score</span>
                  </div>
                  <div className="text-3xl font-bold text-[hsl(340_75%_50%)]">87<span className="text-lg text-muted-foreground">/100</span></div>
                </div>
                
                <div className="space-y-4">
                  {scoringCriteria.map((criteria) => (
                    <div key={criteria.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{criteria.name}</span>
                        <span className="font-semibold" style={{ color: criteria.color }}>{criteria.score}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${criteria.score}%`,
                            backgroundColor: criteria.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-[hsl(82_85%_55%_/_0.1)] rounded-xl border border-[hsl(82_85%_55%_/_0.2)]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[hsl(82_85%_45%)]" />
                    <span className="text-sm font-semibold text-foreground">Strongest: Accessibility</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reading level and structure are well-optimized for broad audiences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
        <div className="absolute top-16 left-[18%] w-44 h-44 bg-[hsl(340_75%_55%_/_0.1)] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-[15%] w-52 h-52 bg-[hsl(82_85%_55%_/_0.1)] rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[hsl(340_75%_55%_/_0.2)] text-[hsl(340_75%_45%)] border-[hsl(340_75%_55%_/_0.4)]">
              <Zap className="w-3 h-3 mr-1" />
              Deep Analysis
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">
              More than a <span className="text-[hsl(340_75%_50%)]">spell checker</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="group bg-card border-2 border-[hsl(340_75%_55%_/_0.2)] rounded-2xl p-8 hover:border-[hsl(340_75%_55%)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-4 rounded-2xl bg-[hsl(340_75%_55%_/_0.12)] w-fit mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-[hsl(340_75%_45%)]" />
                </div>
                <h3 className="font-semibold text-xl text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(173_40%_95%)] relative overflow-hidden">
        <div className="absolute top-12 right-[10%] w-40 h-40 bg-[hsl(173_58%_39%_/_0.15)] rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-[8%] w-48 h-48 bg-[hsl(340_75%_55%_/_0.1)] rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[hsl(173_58%_39%_/_0.2)] text-[hsl(173_58%_30%)] border-[hsl(173_58%_39%_/_0.4)]">
              <TrendingUp className="w-3 h-3 mr-1" />
              Track Improvement
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">
              Watch your <span className="text-[hsl(173_58%_35%)]">score climb</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="bg-white rounded-2xl p-6 border-2 border-[hsl(340_75%_55%_/_0.3)] shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-muted-foreground">BEFORE</span>
                <span className="text-2xl font-bold text-[hsl(340_75%_55%)]">67</span>
              </div>
              <p className="text-sm text-muted-foreground italic">
                "Dear Sir/Madam, We wish to inform you regarding your inquiry about admissions procedures..."
              </p>
            </div>
            
            {/* After */}
            <div className="bg-white rounded-2xl p-6 border-2 border-[hsl(82_85%_55%_/_0.4)] shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-muted-foreground">AFTER</span>
                <span className="text-2xl font-bold text-[hsl(82_85%_45%)]">94</span>
              </div>
              <p className="text-sm text-muted-foreground italic">
                "Hi Sarah! Great question about our application process—let me walk you through what to expect..."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(340_65%_50%)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-12 right-[12%] w-48 h-48 bg-[hsl(82_85%_55%_/_0.2)] rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-[8%] w-56 h-56 bg-[hsl(200_100%_50%_/_0.15)] rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="font-serif text-3xl sm:text-4xl text-white mb-4">
            Stop guessing. Start <span className="text-[hsl(82_85%_65%)]">measuring.</span>
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Every message is an opportunity to strengthen your brand. Know exactly where you stand.
          </p>
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
