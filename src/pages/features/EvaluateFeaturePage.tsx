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
import uplaybookLogo from "@/assets/uplaybook-logo.png";

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
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={uplaybookLogo} alt="μPlaybook" className="h-8" />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/request-access">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Join Beta
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-background to-amber-500/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-orange-500/10 text-orange-600 border-orange-500/20">
              <FileText className="w-3 h-3 mr-1" />
              AI Message Analysis
            </Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Score Your Messages
              <span className="block text-orange-600">Against Five Pillars</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Paste any message and get detailed feedback based on the five-pillar persuasion framework—Authority, Relevance, Emotional Appeal, Clarity, and Social Proof.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/request-access">
                <Button size="lg" className="gap-2 bg-orange-600 hover:bg-orange-700">
                  Request Beta Access
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Five Pillars */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
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

      {/* Evaluation Demo */}
      <section className="py-20">
        <div className="container mx-auto px-4">
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
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
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

      {/* Use Cases */}
      <section className="py-20">
        <div className="container mx-auto px-4">
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
          <img src={uplaybookLogo} alt="μPlaybook" className="h-6 mx-auto mb-4 opacity-60" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} μPlaybook. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
