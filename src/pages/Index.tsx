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
  MessageSquare,
  Megaphone,
  ArrowRight,
  Sparkles
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
      title: 'Build Message', 
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
            <div className="grid md:grid-cols-3 gap-4">
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
                        <div key={msg.id} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
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
                      <div key={template.id} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Quick Links */}
          <section className="flex flex-wrap justify-center gap-4">
            <Link to="/admin">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Admin Panel
              </Button>
            </Link>
          </section>

          {/* Research Foundation */}
          <ResearchFoundation />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              PERSIST — Persuasion Intelligence for Student Engagement
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link to="/admin" className="hover:text-foreground transition-colors">
                Admin Panel
              </Link>
              <span>•</span>
              <span>Research: Gayheart (2021), University of Kentucky</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
