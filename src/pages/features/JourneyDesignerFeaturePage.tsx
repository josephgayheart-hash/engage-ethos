import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight,
  Map, 
  Calendar,
  Clock,
  TrendingUp,
  FileDown,
  Layers,
  Mail,
  MessageSquare,
  Phone,
  Target,
  Sparkles,
  CheckCircle2,
  GitBranch,
  Zap
} from "lucide-react";
import uplaybookLogo from "@/assets/uplaybook-logo.png";

const journeyPhases = [
  { week: "Week 1-2", label: "Awareness", intensity: "Low", channels: ["Email", "Social"] },
  { week: "Week 3-4", label: "Engagement", intensity: "Medium", channels: ["Email", "SMS", "Portal"] },
  { week: "Week 5-8", label: "Nurturing", intensity: "High", channels: ["Email", "SMS", "Phone"] },
  { week: "Week 9-12", label: "Conversion", intensity: "Peak", channels: ["All Channels"] },
];

const cadenceOptions = [
  { label: "Daily", description: "High-intensity campaigns" },
  { label: "Twice Weekly", description: "Active engagement" },
  { label: "Weekly", description: "Steady touchpoints" },
  { label: "Bi-Weekly", description: "Light touch" },
  { label: "Monthly", description: "Check-ins only" },
];

const escalationPatterns = [
  { label: "Linear", description: "Steady pace throughout" },
  { label: "Front-Loaded", description: "Heavy start, taper off" },
  { label: "Back-Loaded", description: "Build momentum toward deadline" },
  { label: "Bell Curve", description: "Ramp up, peak, wind down" },
];

const features = [
  {
    icon: Calendar,
    title: "Date-Aware Planning",
    description: "Set start and end dates, and the AI maps touchpoints to real calendar dates with deadline awareness.",
  },
  {
    icon: TrendingUp,
    title: "Escalation Patterns",
    description: "Choose how intensity builds—front-loaded, back-loaded, linear, or bell curve progression.",
  },
  {
    icon: Layers,
    title: "Multi-Channel Orchestration",
    description: "Coordinate email, SMS, phone, social, and more across a unified timeline.",
  },
  {
    icon: FileDown,
    title: "PDF Export",
    description: "Download polished journey maps for stakeholder presentations and team alignment.",
  },
];

export default function JourneyDesignerFeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={uplaybookLogo} alt="µPlaybook" className="h-8" />
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
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-background to-emerald-500/5" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-teal-500/10 text-teal-600 border-teal-500/20">
              <Map className="w-3 h-3 mr-1" />
              AI Journey Mapping
            </Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Design Complete
              <span className="block text-teal-600">Communication Journeys</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Map multi-week campaigns with cadence controls, escalation patterns, and channel orchestration—then export polished PDFs for your team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/request-access">
                <Button size="lg" className="gap-2 bg-teal-600 hover:bg-teal-700">
                  Request Beta Access
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Timeline Demo */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-semibold text-lg">First-Year Enrollment Journey</h3>
                  <p className="text-sm text-muted-foreground">12 weeks • 24 touchpoints • 4 channels</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-teal-300">
                    <Calendar className="w-3 h-3 mr-1" />
                    Aug 1 - Oct 24
                  </Badge>
                  <Badge className="bg-teal-600">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Generated
                  </Badge>
                </div>
              </div>

              {/* Timeline visualization */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500 via-emerald-500 to-green-500" />
                
                <div className="space-y-6">
                  {journeyPhases.map((phase, i) => (
                    <div key={i} className="relative pl-12">
                      <div className={`absolute left-2 w-5 h-5 rounded-full border-2 border-background ${
                        i === 0 ? 'bg-teal-500' : 
                        i === 1 ? 'bg-teal-400' : 
                        i === 2 ? 'bg-emerald-500' : 'bg-green-500'
                      }`} />
                      
                      <div className="bg-muted/50 rounded-xl p-4 border border-border hover:border-teal-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">{phase.week}</span>
                            <span className="font-semibold">{phase.label}</span>
                          </div>
                          <Badge variant={
                            phase.intensity === 'Low' ? 'secondary' :
                            phase.intensity === 'Medium' ? 'outline' :
                            phase.intensity === 'High' ? 'default' : 'default'
                          } className={phase.intensity === 'Peak' ? 'bg-teal-600' : ''}>
                            {phase.intensity} Intensity
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          {phase.channels.map((ch, j) => (
                            <Badge key={j} variant="secondary" className="text-xs">
                              {ch}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Controls Demo */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                Precise Cadence Controls
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Fine-tune how often you reach out and how intensity builds over time.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Cadence Options */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold">Cadence Frequency</h3>
                </div>
                <div className="space-y-3">
                  {cadenceOptions.map((option, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${i === 2 ? 'border-teal-300 bg-teal-50 dark:bg-teal-950/20' : 'border-border bg-muted/30'}`}>
                      <div className="flex items-center gap-2">
                        {i === 2 && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                        <span className="font-medium text-sm">{option.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Escalation Patterns */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold">Escalation Pattern</h3>
                </div>
                <div className="space-y-3">
                  {escalationPatterns.map((pattern, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${i === 2 ? 'border-teal-300 bg-teal-50 dark:bg-teal-950/20' : 'border-border bg-muted/30'}`}>
                      <div className="flex items-center gap-2">
                        {i === 2 && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                        <span className="font-medium text-sm">{pattern.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{pattern.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flow Diagram Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              Visual Flow Diagrams
            </h2>
            <p className="text-muted-foreground mb-8">
              See your entire journey as an interactive flow diagram with channel-coded touchpoints.
            </p>
            
            <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Interactive ReactFlow diagrams show channel types, timing, and message summaries
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Ready to Map Your Journeys?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join the beta to start designing complete communication campaigns.
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
          <img src={uplaybookLogo} alt="µPlaybook" className="h-6 mx-auto mb-4 opacity-60" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} µPlaybook. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
