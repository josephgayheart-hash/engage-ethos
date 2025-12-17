import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { ResearchFoundation } from "@/components/ResearchFoundation";
import { 
  Shield, 
  Brain, 
  Target,
  FileText,
  PenTool,
  Map,
  Settings,
  FolderOpen,
  Library,
  ChevronRight,
  Clock,
  Mail,
  Upload,
  MessageSquare,
  Megaphone,
  ArrowRight,
  Sparkles,
  Phone,
  MessageCircle,
  BarChart3,
  Calendar,
  Type,
  Eye,
  Mic,
  Monitor,
  TrendingUp,
  Languages,
  Wrench
} from "lucide-react";

const Index = () => {
  const { messages } = useMessageLibrary();
  const { templates } = useSharedLibrary();

  const recentMessages = messages.slice(0, 3);
  const publishedTemplates = templates.filter(t => t.status === 'published').slice(0, 3);

  const modeCards = [
    { 
      id: 'evaluate', 
      title: 'Evaluate Message', 
      description: 'Analyze existing messages using the five-pillar persuasion framework',
      icon: FileText,
      color: 'text-pillar-authority',
      bgColor: 'bg-pillar-authority/10',
      href: '/evaluate'
    },
    { 
      id: 'build', 
      title: 'Message Builder', 
      description: 'Generate new AI-powered messages based on context and audience',
      icon: PenTool,
      color: 'text-pillar-cognitive',
      bgColor: 'bg-pillar-cognitive/10',
      href: '/build'
    },
    { 
      id: 'strategy', 
      title: 'Plan Strategy', 
      description: 'Map messaging strategy across goals, domains, and timing',
      icon: Map,
      color: 'text-pillar-consensus',
      bgColor: 'bg-pillar-consensus/10',
      href: '/strategy'
    },
    { 
      id: 'call-script', 
      title: 'Call Scripts', 
      description: 'Generate research-informed phone scripts for student outreach calls',
      icon: Phone,
      color: 'text-pillar-ethics',
      bgColor: 'bg-pillar-ethics/10',
      href: '/call-script'
    },
    { 
      id: 'playground', 
      title: 'Playground', 
      description: 'Chat with AI to brainstorm strategies, review ideas, and explore research',
      icon: MessageCircle,
      color: 'text-pillar-susceptibility',
      bgColor: 'bg-pillar-susceptibility/10',
      href: '/playground'
    },
    { 
      id: 'byoc', 
      title: 'Import & Evaluate', 
      description: 'Bring your own comm: upload, evaluate, tag, and share existing content',
      icon: Upload,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      href: '/byoc'
    },
    { 
      id: 'settings', 
      title: 'Institutional Settings', 
      description: 'Configure your institution\'s Content DNA, names, branding, and terminology',
      icon: Settings,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      href: '/settings'
    },
    { 
      id: 'admin', 
      title: 'Admin Panel', 
      description: 'Create, approve, and distribute playbooks across your institution',
      icon: Settings,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      href: '/admin'
    },
  ];

  const utilityTools = [
    {
      id: 'campaign-dashboard',
      title: 'Campaign Dashboard',
      description: 'Track campaign performance with analytics and metrics',
      icon: BarChart3,
      href: '/campaign-dashboard'
    },
    {
      id: 'calendar',
      title: 'Communication Calendar',
      description: 'Visualize and plan messaging across the academic year',
      icon: Calendar,
      href: '/calendar'
    },
    {
      id: 'subject-optimizer',
      title: 'Subject Line Optimizer',
      description: 'Test and optimize email subject lines for engagement',
      icon: Type,
      href: '/subject-optimizer'
    },
    {
      id: 'accessibility',
      title: 'Accessibility Checker',
      description: 'Ensure messages meet accessibility standards',
      icon: Eye,
      href: '/accessibility'
    },
    {
      id: 'brand-voice',
      title: 'Content DNA Scorer',
      description: 'Verify messaging aligns with institutional Content DNA',
      icon: Mic,
      href: '/brand-voice'
    },
    {
      id: 'email-preview',
      title: 'Email Preview',
      description: 'Preview emails across devices and clients',
      icon: Monitor,
      href: '/email-preview'
    },
    {
      id: 'benchmarks',
      title: 'Performance Benchmarks',
      description: 'Compare metrics against higher ed industry benchmarks',
      icon: TrendingUp,
      href: '/benchmarks'
    },
    {
      id: 'translate',
      title: 'Translation Tool',
      description: 'Translate messages for multilingual audiences',
      icon: Languages,
      href: '/translate'
    },
  ];

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      default: return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="gradient-hero py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-3 animate-fade-in">
              Messaging Intelligence for Higher Education
            </h1>
            <p className="text-base md:text-lg text-primary-foreground/80 mb-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
              Design, evaluate, and distribute student-facing communication using peer-reviewed research.
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <Shield className="w-4 h-4" />
                <span>Evidence-Based</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <Brain className="w-4 h-4" />
                <span>Cognitively Informed</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <Target className="w-4 h-4" />
                <span>Student-Centered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketing Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Sparkles className="w-3 h-3 mr-1" />
                Why PERSIST?
              </Badge>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
                Stop Guessing. Start Connecting.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Most student communications are written on instinct. PERSIST transforms your messaging 
                with research-backed intelligence that actually moves students to action.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-none shadow-md bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-pillar-authority/10 flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-6 h-6 text-pillar-authority" />
                  </div>
                  <h3 className="font-semibold mb-2">Research-Grounded</h3>
                  <p className="text-sm text-muted-foreground">
                    Powered by Cialdini, ELM, and Kaptein's persuasion research.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-md bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-pillar-cognitive/10 flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-pillar-cognitive" />
                  </div>
                  <h3 className="font-semibold mb-2">Student-Centered</h3>
                  <p className="text-sm text-muted-foreground">
                    Built for university communicators and marketing teams.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-md bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-pillar-consensus/10 flex items-center justify-center mx-auto mb-4">
                    <Library className="w-6 h-6 text-pillar-consensus" />
                  </div>
                  <h3 className="font-semibold mb-2">Shared Libraries</h3>
                  <p className="text-sm text-muted-foreground">
                    Save, share, and reuse institution-approved playbooks.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-md bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-pillar-ethics/10 flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-6 h-6 text-pillar-ethics" />
                  </div>
                  <h3 className="font-semibold mb-2">Your Content DNA</h3>
                  <p className="text-sm text-muted-foreground">
                    Customize terminology, naming, and brand tone.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Tools Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-semibold">AI-Powered Tools</h2>
              <Badge variant="outline" className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Powered by AI
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modeCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link key={card.id} to={card.href}>
                    <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group">
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-6 h-6 ${card.color}`} />
                        </div>
                        <h3 className="font-serif font-semibold text-lg mb-2">{card.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                        <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                          Get Started
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Utility Tools Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-semibold">Utility Tools</h2>
              <Badge variant="outline" className="flex items-center gap-1">
                <Wrench className="w-3 h-3" />
                Optimize & Analyze
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {utilityTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.id} to={tool.href}>
                    <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group">
                      <CardContent className="p-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                          <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="font-medium text-sm mb-1">{tool.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{tool.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Libraries Section */}
          <section className="grid md:grid-cols-2 gap-6">
            {/* My Library */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-secondary" />
                    <CardTitle className="font-serif text-lg">My Library</CardTitle>
                  </div>
                  <Link to="/library">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View All <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
                <CardDescription className="text-xs">Your saved messages and drafts</CardDescription>
              </CardHeader>
              <CardContent>
                {recentMessages.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No messages saved yet</p>
                    <p className="text-xs mt-1">Start by evaluating or building a message</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentMessages.map((msg) => {
                      const ChannelIcon = getChannelIcon(msg.channel);
                      return (
                        <Link key={msg.id} to="/library" className="block">
                          <div className="p-3 rounded-lg border bg-card hover:bg-muted/50 hover:border-primary/30 transition-colors cursor-pointer">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium truncate">{msg.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                                    <ChannelIcon className="w-3 h-3 mr-1" />
                                    {msg.channel}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(msg.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Badge variant={msg.mode === 'generated' ? 'default' : 'secondary'} className="text-xs shrink-0">
                                {msg.mode}
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shared Library */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Library className="w-5 h-5 text-primary" />
                    <CardTitle className="font-serif text-lg">Shared Library</CardTitle>
                  </div>
                  <Link to="/shared-library">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Browse All <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
                <CardDescription className="text-xs">Institutional playbooks and templates</CardDescription>
              </CardHeader>
              <CardContent>
                {publishedTemplates.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No published playbooks yet</p>
                    <p className="text-xs mt-1">Visit the Admin panel to create and distribute</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {publishedTemplates.map((template) => (
                      <Link key={template.id} to="/shared-library" className="block">
                        <div className="p-3 rounded-lg border bg-card hover:bg-muted/50 hover:border-primary/30 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium truncate">{template.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                {template.playbook && (
                                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                                    {template.playbook}
                                  </Badge>
                                )}
                                {template.collegeName && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {template.collegeName}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge variant="default" className="text-xs shrink-0 flex items-center gap-1">
                              <Megaphone className="w-3 h-3" />
                              published
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>


          {/* Research Foundation */}
          <ResearchFoundation />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Tools */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Tools</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/evaluate" className="hover:text-foreground transition-colors">Evaluate Message</Link></li>
                <li><Link to="/build" className="hover:text-foreground transition-colors">Build Message</Link></li>
                <li><Link to="/strategy" className="hover:text-foreground transition-colors">Plan Strategy</Link></li>
                <li><Link to="/call-script" className="hover:text-foreground transition-colors">Call Scripts</Link></li>
                <li><Link to="/playground" className="hover:text-foreground transition-colors">Playground</Link></li>
                <li><Link to="/byoc" className="hover:text-foreground transition-colors">Import & Evaluate</Link></li>
              </ul>
            </div>
            {/* Utilities */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Utilities</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/campaign-dashboard" className="hover:text-foreground transition-colors">Campaign Dashboard</Link></li>
                <li><Link to="/calendar" className="hover:text-foreground transition-colors">Communication Calendar</Link></li>
                <li><Link to="/subject-optimizer" className="hover:text-foreground transition-colors">Subject Line Optimizer</Link></li>
                <li><Link to="/accessibility" className="hover:text-foreground transition-colors">Accessibility Checker</Link></li>
                <li><Link to="/brand-voice" className="hover:text-foreground transition-colors">Brand Voice Scorer</Link></li>
                <li><Link to="/email-preview" className="hover:text-foreground transition-colors">Email Preview</Link></li>
                <li><Link to="/benchmarks" className="hover:text-foreground transition-colors">Benchmarks</Link></li>
                <li><Link to="/translate" className="hover:text-foreground transition-colors">Translation Tool</Link></li>
              </ul>
            </div>
            {/* Libraries */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Libraries</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/library" className="hover:text-foreground transition-colors">My Library</Link></li>
                <li><Link to="/shared-library" className="hover:text-foreground transition-colors">Shared Library</Link></li>
              </ul>
            </div>
            {/* Admin & Research */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Admin & Research</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/admin" className="hover:text-foreground transition-colors">Admin Panel</Link></li>
                <li><a href="#about" className="hover:text-foreground transition-colors">Research Foundation</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              PERSIST — Persuasion Intelligence for Student Engagement
            </p>
            <p className="text-xs text-muted-foreground">
              Evidence-based messaging for higher education
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
