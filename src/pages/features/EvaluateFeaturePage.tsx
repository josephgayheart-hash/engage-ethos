import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight,
  FileText, 
  Target,
  Shield,
  Heart,
  Lightbulb,
  Users,
  CheckCircle2,
  BarChart3,
  Sparkles,
  AlertTriangle,
  ThumbsUp
} from "lucide-react";
import campusvoiceLogo from "@/assets/campusvoice-logo.png";
import { FeatureNavigation } from "@/components/FeatureNavigation";
import { SEOHead, getSoftwareApplicationSchema, getWebPageSchema } from "@/components/SEOHead";
import { FeatureBreadcrumbs } from "@/components/FeatureBreadcrumbs";
import { MobileNav } from "@/components/MobileNav";

const pillars = [
  { 
    icon: Shield, 
    name: "Authority", 
    description: "Does your message establish credibility and institutional expertise?",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10"
  },
  { 
    icon: Target, 
    name: "Relevance", 
    description: "Is the content tailored to your audience's specific needs and stage?",
    color: "text-green-600",
    bgColor: "bg-green-500/10"
  },
  { 
    icon: Heart, 
    name: "Emotional Appeal", 
    description: "Does it connect on a human level and inspire action?",
    color: "text-red-600",
    bgColor: "bg-red-500/10"
  },
  { 
    icon: Lightbulb, 
    name: "Clarity", 
    description: "Is the message clear, concise, and easy to understand?",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10"
  },
  { 
    icon: Users, 
    name: "Social Proof", 
    description: "Are there elements that build trust through community validation?",
    color: "text-purple-600",
    bgColor: "bg-purple-500/10"
  },
];

const scoreExamples = [
  { pillar: "Authority", score: 85, feedback: "Strong use of institutional voice and credentials" },
  { pillar: "Relevance", score: 72, feedback: "Could better address first-gen student concerns" },
  { pillar: "Emotional Appeal", score: 90, feedback: "Excellent warmth and connection" },
  { pillar: "Clarity", score: 65, feedback: "Some jargon may confuse recipients" },
  { pillar: "Social Proof", score: 78, feedback: "Good peer testimonials included" },
];

const features = [
  {
    icon: BarChart3,
    title: "Pillar-by-Pillar Scoring",
    description: "Get detailed scores for each of the five persuasion pillars with specific feedback.",
  },
  {
    icon: Target,
    title: "Audience-Aware Analysis",
    description: "Evaluation considers your specific audience type and journey moment for relevance.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Suggestions",
    description: "Receive concrete recommendations to strengthen weak areas in your messaging.",
  },
  {
    icon: CheckCircle2,
    title: "Brand Alignment Check",
    description: "See how well your message aligns with your institutional brand platform.",
  },
];

export default function EvaluateFeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Message Evaluator - Five-Pillar Analysis | CampusVoice.AI"
        description="Score your messages against five persuasion pillars: Authority, Relevance, Emotional Appeal, Clarity, and Social Proof. AI-powered feedback for higher education."
        keywords={['message evaluation', 'persuasion scoring', 'content analysis', 'higher education copywriting', 'brand alignment']}
        jsonLd={[
          getWebPageSchema(
            'Message Evaluator',
            'Five-pillar persuasion analysis for higher education communications',
            'https://engage-ethos.lovable.app/features/evaluate'
          ),
          getSoftwareApplicationSchema(
            'Message Evaluator',
            'AI-powered scoring against five persuasion pillars: Authority, Relevance, Emotional Appeal, Clarity, and Social Proof.',
            ['Authority Scoring', 'Relevance Analysis', 'Emotional Appeal Metrics', 'Clarity Assessment', 'Social Proof Detection']
          )
        ]}
        faqItems={[
          { question: 'What are the five persuasion pillars?', answer: 'The five pillars are Authority (credibility), Relevance (audience fit), Emotional Appeal (connection), Clarity (readability), and Social Proof (validation through others).' },
          { question: 'How is my message scored?', answer: 'Each pillar receives a score from 0-100 based on AI analysis, with specific feedback on how to improve each dimension.' },
          { question: 'Can I evaluate any type of content?', answer: 'Yes, the evaluator works with emails, landing pages, social posts, speeches, and any text-based communication.' }
        ]}
      />
      
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={campusvoiceLogo} alt="CampusVoice" className="h-8" />
            </Link>
            <div className="hidden md:block">
              <FeatureBreadcrumbs items={[
                { label: 'Features', href: '/features/message-builder' },
                { label: 'Message Evaluator' }
              ]} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden md:inline-flex">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link to="/login" className="hidden md:inline-flex">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/request-access" className="hidden md:inline-flex">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Join Beta
              </Button>
            </Link>
            <MobileNav />
          </div>
        </div>
      </nav>


      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-background to-amber-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(30_80%_90%_/_0.3),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(45_90%_85%_/_0.25),_transparent_50%)]" />
        
        {/* Lens flares */}
        <div className="absolute top-20 right-[12%] w-32 h-32 bg-[hsl(30_80%_55%_/_0.18)] rounded-full blur-2xl" />
        <div className="absolute bottom-36 left-[8%] w-40 h-40 bg-[hsl(45_90%_55%_/_0.15)] rounded-full blur-3xl" />
        <div className="absolute top-44 left-[22%] w-24 h-24 bg-[hsl(270_70%_60%_/_0.1)] rounded-full blur-2xl" />
        <div className="absolute bottom-48 right-[25%] w-20 h-20 bg-[hsl(82_85%_55%_/_0.1)] rounded-full blur-2xl" />
        <div className="absolute top-32 right-[35%] w-16 h-16 bg-[hsl(200_100%_50%_/_0.12)] rounded-full blur-xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-orange-500/10 text-orange-600 border-orange-500/20 animate-fade-in">
              <FileText className="w-3 h-3 mr-1" />
              AI Message Analysis
            </Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Score Your Messages
              <span className="block text-orange-600">Against Five Pillars</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Paste any message and get detailed feedback based on the five-pillar persuasion framework—Authority, Relevance, Emotional Appeal, Clarity, and Social Proof.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link to="/request-access">
                <Button size="lg" className="gap-2 bg-orange-600 hover:bg-orange-700">
                  Request Beta Access
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(30 80% 95%)"/>
          </svg>
        </div>
      </section>

      {/* Five Pillars */}
      <section className="py-16 bg-[hsl(30_80%_95%)] relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-12 right-[10%] w-28 h-28 bg-[hsl(270_70%_60%_/_0.12)] rounded-full blur-2xl" />
        <div className="absolute bottom-28 left-[6%] w-36 h-36 bg-[hsl(82_85%_55%_/_0.12)] rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-[40%] w-20 h-20 bg-[hsl(200_100%_50%_/_0.1)] rounded-full blur-2xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              The Five-Pillar Framework
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every message is evaluated against five research-backed dimensions of effective communication.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {pillars.map((pillar, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5 text-center hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${pillar.bgColor} flex items-center justify-center mx-auto mb-3`}>
                  <pillar.icon className={`w-6 h-6 ${pillar.color}`} />
                </div>
                <h3 className="font-semibold mb-2">{pillar.name}</h3>
                <p className="text-xs text-muted-foreground">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="relative bg-[hsl(30_80%_95%)]">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0 80L48 70C96 60 192 40 288 35C384 30 480 40 576 45C672 50 768 50 864 45C960 40 1056 30 1152 30C1248 30 1344 40 1392 45L1440 50V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>

      {/* Evaluation Demo */}
      <section className="py-20 relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-16 left-[18%] w-32 h-32 bg-[hsl(30_80%_55%_/_0.08)] rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-[15%] w-44 h-44 bg-[hsl(45_90%_55%_/_0.08)] rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* Input Mock */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  Message Input
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Audience Context</label>
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                      <span className="text-sm">First-Year Students</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Journey Moment</label>
                    <div className="p-3 bg-muted rounded-lg border border-border">
                      <span className="text-sm">Early Term</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Message</label>
                    <div className="p-4 bg-muted/50 rounded-lg border border-border min-h-[120px]">
                      <p className="text-sm text-muted-foreground italic">
                        "Dear Student, We hope you're settling in well. Remember that advising appointments are available through the student portal. Best regards, Student Services"
                      </p>
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-6 gap-2 bg-orange-600 hover:bg-orange-700">
                  <Sparkles className="w-4 h-4" />
                  Evaluate Message
                </Button>
              </div>

              {/* Results Mock */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-orange-500" />
                    Evaluation Results
                  </h3>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                    Overall: 78/100
                  </Badge>
                </div>

                <div className="space-y-3">
                  {scoreExamples.map((item, i) => (
                    <div key={i} className="p-3 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{item.pillar}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                item.score >= 80 ? 'bg-green-500' :
                                item.score >= 70 ? 'bg-amber-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{item.score}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-start gap-1">
                        {item.score >= 80 ? (
                          <ThumbsUp className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                        )}
                        {item.feedback}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-200 dark:border-orange-800">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-orange-600" />
                    Top Suggestion
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Consider adding a personal touch by using the student's first name and referencing specific resources available to first-generation students.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-[hsl(45_90%_92%)] relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-12 right-[10%] w-28 h-28 bg-[hsl(30_80%_55%_/_0.12)] rounded-full blur-2xl" />
        <div className="absolute bottom-16 left-[8%] w-32 h-32 bg-[hsl(270_70%_60%_/_0.1)] rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              Intelligent Analysis Features
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="relative bg-[hsl(45_90%_92%)]">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0 80L60 65C120 50 240 20 360 15C480 10 600 30 720 40C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>

      {/* Use Cases */}
      <section className="py-20 relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-1/4 right-[8%] w-36 h-36 bg-[hsl(30_80%_55%_/_0.08)] rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-[12%] w-28 h-28 bg-[hsl(45_90%_55%_/_0.08)] rounded-full blur-2xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-8 text-center">
              Perfect For
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "Reviewing Drafts", description: "Get feedback before sending that important email" },
                { title: "Training New Staff", description: "Show team members what makes messages effective" },
                { title: "A/B Testing Ideas", description: "Compare message variations before deployment" },
              ].map((item, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Explore More Features */}
      <FeatureNavigation currentFeatureId="evaluate" />

      {/* CTA Section */}
      <section className="py-20 bg-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Ready to Improve Your Messages?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join the beta to start evaluating and improving your communications.
          </p>
          <Link to="/request-access">
            <Button size="lg" variant="secondary" className="gap-2">
              Request Beta Access
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <img src={campusvoiceLogo} alt="CampusVoice" className="h-6 mx-auto mb-4 opacity-60" />
          <p className="text-sm text-muted-foreground mb-2">
            © {new Date().getFullYear()} CampusVoice. All rights reserved.
          </p>
          <a 
            href="mailto:sales@campusvoice.ai" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            sales@campusvoice.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
