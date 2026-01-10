import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { useSharedLibrary } from "@/hooks/useSharedLibrary";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ResearchFoundation } from "@/components/ResearchFoundation";
import { MyDraftsCard } from "@/components/MyDraftsCard";
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
  Wrench,
  CheckCircle2,
  CircleDot,
  Building2,
  User,
  Search,
  Globe
} from "lucide-react";

const Index = () => {
  const { messages } = useMessageLibrary();
  const { templates } = useSharedLibrary();
  const { profiles: institutionalProfiles } = useInstitutionalProfiles();
  const { isAdmin, isSuperAdmin, profile, tenant } = useAuth();

  const recentMessages = messages.slice(0, 3);
  const publishedTemplates = templates.filter(t => t.status === 'published').slice(0, 3);

  // Check if user has completed setup (has used the settings page)
  const hasProfile = !!profile;
  
  // Check if institutional profiles exist
  const hasInstitutionalProfiles = institutionalProfiles.length > 0;

  // Check if Content DNA is active for ANY profile in the tenant
  const [hasActiveContentDNA, setHasActiveContentDNA] = useState(false);
  
  useEffect(() => {
    const checkContentDNA = async () => {
      if (!tenant?.id) return;
      
      const { data } = await supabase
        .from('content_dna_analysis')
        .select('id, last_analyzed_at')
        .eq('tenant_id', tenant.id)
        .not('last_analyzed_at', 'is', null)
        .limit(1);
      
      setHasActiveContentDNA(data && data.length > 0);
    };
    
    checkContentDNA();
  }, [tenant?.id]);

  const utilityTools = [
    {
      id: 'campaign-dashboard',
      title: 'Campaign Dashboard',
      description: 'Track campaign performance',
      icon: BarChart3,
      href: '/campaign-dashboard'
    },
    {
      id: 'calendar',
      title: 'Communication Calendar',
      description: 'Plan messaging timelines',
      icon: Calendar,
      href: '/calendar'
    },
    {
      id: 'subject-optimizer',
      title: 'Subject Line Optimizer',
      description: 'Optimize email subjects',
      icon: Type,
      href: '/subject-optimizer'
    },
    {
      id: 'accessibility',
      title: 'Accessibility Checker',
      description: 'Verify accessibility compliance',
      icon: Eye,
      href: '/accessibility'
    },
    {
      id: 'brand-voice',
      title: 'Content DNA Scorer',
      description: 'Check brand alignment',
      icon: Mic,
      href: '/brand-voice'
    },
    {
      id: 'email-preview',
      title: 'Email Preview',
      description: 'Preview across devices',
      icon: Monitor,
      href: '/email-preview'
    },
    {
      id: 'benchmarks',
      title: 'Performance Benchmarks',
      description: 'Compare to industry metrics',
      icon: TrendingUp,
      href: '/benchmarks'
    },
    {
      id: 'translate',
      title: 'Translation Tool',
      description: 'Multilingual messaging',
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
      
      {/* Hero Section - Matching Landing Page Aesthetic */}
      <section className="relative overflow-hidden">
        {/* Soft gradient background like landing page */}
        <div className="absolute inset-0 bg-zone-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(200_70%_90%_/_0.3),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(173_58%_85%_/_0.2),_transparent_50%)]" />
        
        {/* Subtle lens flares */}
        <div className="absolute top-12 right-[15%] w-24 h-24 bg-[hsl(270_70%_60%_/_0.1)] rounded-full blur-2xl" />
        <div className="absolute bottom-8 left-[10%] w-32 h-32 bg-[hsl(82_85%_55%_/_0.08)] rounded-full blur-3xl" />
        
        <div className="relative py-10 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-3 animate-fade-in">
                <Badge className="bg-[hsl(200_100%_50%_/_0.15)] text-[hsl(200_100%_40%)] border-[hsl(200_100%_50%_/_0.3)] hover:bg-[hsl(200_100%_50%_/_0.2)]">
                  Beta Release — We welcome your feedback
                </Badge>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2 animate-fade-in">
                <span className="text-[hsl(82_85%_45%)]">Plan.</span>{' '}
                <span className="text-[hsl(270_70%_55%)]">Strategize.</span>{' '}
                <span className="text-[hsl(200_100%_45%)]">Execute.</span>
              </h1>
              <p className="text-base text-muted-foreground animate-fade-in" style={{ animationDelay: '100ms' }}>
                Your digital playbook for higher ed. Craft meaningful, research-driven, brand-informed messaging at scale.
              </p>
            </div>
          </div>
        </div>
        
        {/* Subtle wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg 
            viewBox="0 0 1440 60" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path 
              d="M0 60L60 52C120 44 240 28 360 24C480 20 600 28 720 32C840 36 960 36 1080 32C1200 28 1320 20 1380 16L1440 12V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" 
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Getting Started Workflow */}
          <section className="relative">
            {/* Subtle background zone */}
            <div className="absolute inset-0 -mx-4 px-4 bg-zone-warm rounded-2xl -z-10 opacity-50" />
            
            <div className="mb-6 pt-4">
              <h2 className="section-header mb-1">Your Workflow</h2>
              <p className="section-subheader">Everything you need to create, analyze, and strategize</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4 pb-4">
              {/* Step 1: Setup/Manage Institution */}
              <Link to="/university-settings">
                <Card className="h-full cursor-pointer card-workflow card-workflow-primary group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        1
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {hasInstitutionalProfiles ? 'Manage' : 'Configure'}
                      </Badge>
                    </div>
                    <div className="icon-container icon-container-lg bg-primary/10 mb-4">
                      {hasInstitutionalProfiles ? (
                        <Building2 className="w-6 h-6 text-primary" />
                      ) : (
                        <Settings className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <h3 className="font-serif font-semibold text-lg mb-2">
                      {hasInstitutionalProfiles 
                        ? `Manage My Institution${institutionalProfiles.length > 1 ? 's' : ''}`
                        : 'Setup Your Institution'
                      }
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {hasInstitutionalProfiles
                        ? 'View and edit your institutional profiles, brand settings, and Content DNA.'
                        : 'Build your institution profile. Subunits inherit brand elements with clear hierarchy and control.'
                      }
                    </p>
                    {/* Profile tags */}
                    {hasInstitutionalProfiles && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {institutionalProfiles.slice(0, 3).map((p) => (
                          <Badge 
                            key={p.id} 
                            variant="secondary" 
                            className="text-[10px] px-1.5 py-0"
                          >
                            {p.name}
                          </Badge>
                        ))}
                        {institutionalProfiles.length > 3 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            +{institutionalProfiles.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                      {hasInstitutionalProfiles ? 'Manage Profiles' : 'Configure Settings'}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Step 2: Create */}
              <div className="grid grid-rows-3 gap-3 h-full">
                <Link to="/build" className="block">
                  <Card className="h-full cursor-pointer card-workflow card-workflow-cognitive group">
                    <CardContent className="p-4 h-full flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-7 h-7 rounded-full bg-pillar-cognitive/10 flex items-center justify-center text-xs font-bold text-pillar-cognitive">
                          2a
                        </div>
                        <Badge variant="outline" className="text-xs bg-pillar-cognitive/5">Create</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="icon-container icon-container-md bg-pillar-cognitive/10 shrink-0">
                          <PenTool className="w-5 h-5 text-pillar-cognitive" />
                        </div>
                        <div>
                          <h3 className="font-serif font-semibold text-sm mb-0.5">Message Builder</h3>
                          <p className="text-xs text-muted-foreground">Generate AI-powered messages</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/byoc" className="block">
                  <Card className="h-full cursor-pointer card-workflow group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-secondary/40 group-hover:bg-secondary/70 transition-colors" />
                    <CardContent className="p-4 h-full flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary">
                          2b
                        </div>
                        <Badge variant="outline" className="text-xs bg-secondary/5">Import</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="icon-container icon-container-md bg-secondary/10 shrink-0">
                          <Upload className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <h3 className="font-serif font-semibold text-sm mb-0.5">Bring Your Own Comm</h3>
                          <p className="text-xs text-muted-foreground">Import docs, PDFs & emails</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/evaluate" className="block">
                  <Card className="h-full cursor-pointer card-workflow card-workflow-authority group">
                    <CardContent className="p-4 h-full flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-7 h-7 rounded-full bg-pillar-authority/10 flex items-center justify-center text-xs font-bold text-pillar-authority">
                          2c
                        </div>
                        <Badge variant="outline" className="text-xs bg-pillar-authority/5">Evaluate</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="icon-container icon-container-md bg-pillar-authority/10 shrink-0">
                          <FileText className="w-5 h-5 text-pillar-authority" />
                        </div>
                        <div>
                          <h3 className="font-serif font-semibold text-sm mb-0.5">Evaluate Message</h3>
                          <p className="text-xs text-muted-foreground">Score against persuasion framework</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              {/* Step 3: Strategize */}
              <div className="grid grid-rows-2 gap-3 h-full">
                <Link to="/web-analyzer" className="block">
                  <Card className="h-full cursor-pointer card-workflow card-workflow-consensus group">
                    <CardContent className="p-4 h-full flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-7 h-7 rounded-full bg-pillar-consensus/10 flex items-center justify-center text-xs font-bold text-pillar-consensus">
                          3a
                        </div>
                        <Badge variant="outline" className="text-xs bg-pillar-consensus/5">Analyze</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="icon-container icon-container-md bg-pillar-consensus/10 shrink-0">
                          <Globe className="w-5 h-5 text-pillar-consensus" />
                        </div>
                        <div>
                          <h3 className="font-serif font-semibold text-sm mb-0.5">Web Content Analyzer</h3>
                          <p className="text-xs text-muted-foreground">Audit web pages for voice & structure</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/strategy" className="block">
                  <Card className="h-full cursor-pointer card-workflow card-workflow-consensus group">
                    <CardContent className="p-4 h-full flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-7 h-7 rounded-full bg-pillar-consensus/10 flex items-center justify-center text-xs font-bold text-pillar-consensus">
                          3b
                        </div>
                        <Badge variant="outline" className="text-xs bg-pillar-consensus/5">Strategize</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="icon-container icon-container-md bg-pillar-consensus/10 shrink-0">
                          <Map className="w-6 h-6 text-pillar-consensus" />
                        </div>
                        <div>
                          <h3 className="font-serif font-semibold text-sm mb-0.5">Design Journeys</h3>
                          <p className="text-xs text-muted-foreground">Map multi-channel campaigns</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              {/* Step 4: Content DNA Studio */}
              <Link to="/content-dna">
                <Card className="h-full cursor-pointer card-workflow group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[hsl(270_70%_60%_/_0.4)] group-hover:bg-[hsl(270_70%_60%_/_0.7)] transition-colors" />
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-[hsl(270_70%_60%_/_0.1)] flex items-center justify-center text-sm font-bold text-[hsl(270_70%_55%)]">
                        4
                      </div>
                      <Badge variant="outline" className="text-xs bg-[hsl(270_70%_60%_/_0.05)] text-[hsl(270_70%_55%)] border-[hsl(270_70%_60%_/_0.3)]">
                        {hasActiveContentDNA ? 'Manage' : 'Studio'}
                      </Badge>
                      {hasActiveContentDNA && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-[hsl(82_85%_45%)] animate-pulse" />
                          <span className="text-[10px] text-[hsl(82_70%_35%)] font-medium">Active</span>
                        </div>
                      )}
                    </div>
                    <div className="icon-container icon-container-lg bg-[hsl(270_70%_60%_/_0.1)] mb-4">
                      <Sparkles className="w-6 h-6 text-[hsl(270_70%_55%)]" />
                    </div>
                    <h3 className="font-serif font-semibold text-lg mb-2">
                      {hasActiveContentDNA ? 'Manage My Content DNA' : 'Content DNA Studio'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {hasActiveContentDNA 
                        ? 'View and refine your voice analysis, brand pillars, and AI foundation settings.'
                        : 'Upload samples or scrape content from your website, tune voice dimensions, and manage your content library. Build the AI foundation for on-brand messaging.'
                      }
                    </p>
                    <div className="flex items-center text-sm text-[hsl(270_70%_55%)] font-medium group-hover:gap-2 transition-all">
                      {hasActiveContentDNA ? 'Manage DNA' : 'Open Studio'}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>

          {/* My Drafts Section */}
          <section>
            <MyDraftsCard />
          </section>

          {/* Libraries Section - Moved after My Drafts */}
          <section className="grid md:grid-cols-2 gap-6">
            {/* My Library */}
            <Card className="border-border/60 hover:shadow-md transition-shadow">
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
                    <p className="text-xs mt-1">Start by building or evaluating a message</p>
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
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                                    <ChannelIcon className="w-3 h-3 mr-1" />
                                    {msg.channel}
                                  </Badge>
                                  {msg.createdByName && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {msg.createdByName}
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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

            {/* University Library */}
            <Card className="border-border/60 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Library className="w-5 h-5 text-primary" />
                    <CardTitle className="font-serif text-lg">University Library</CardTitle>
                  </div>
                  <Link to="/shared-library">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Browse All <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
                <CardDescription className="text-xs">Brand-governed playbooks with approval workflows</CardDescription>
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
                      <Link key={template.id} to={`/shared-library/${template.id}`} className="block">
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
                                {template.owner && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {template.owner}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(template.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
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

          {/* More Tools Section */}
          <section className="relative">
            <div className="absolute inset-0 -mx-4 px-4 bg-zone-mint rounded-2xl -z-10 opacity-40" />
            
            <div className="flex items-center justify-between mb-4 pt-4">
              <h2 className="section-header">More Tools</h2>
              <Badge variant="outline" className="flex items-center gap-1 bg-[hsl(82_85%_55%_/_0.1)] text-[hsl(82_70%_35%)] border-[hsl(82_85%_55%_/_0.3)]">
                <Sparkles className="w-3 h-3" />
                AI-Powered
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-4">
              {/* Web Content Analyzer - Prominent placement */}
              <Link to="/web-analyzer">
                <Card className="h-full cursor-pointer card-interactive group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[hsl(200_100%_50%_/_0.5)]" />
                  <CardContent className="p-4">
                    <div className="icon-container icon-container-md bg-[hsl(200_100%_50%_/_0.1)] mb-3">
                      <Search className="w-5 h-5 text-[hsl(200_100%_45%)]" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">Web Content Analyzer</h3>
                    <p className="text-xs text-muted-foreground">Scan & score brand alignment</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/call-script">
                <Card className="h-full cursor-pointer card-interactive group">
                  <CardContent className="p-4">
                    <div className="icon-container icon-container-md bg-pillar-ethics/10 mb-3">
                      <Phone className="w-5 h-5 text-pillar-ethics" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">Call Scripts</h3>
                    <p className="text-xs text-muted-foreground">Phone outreach scripts</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/playground">
                <Card className="h-full cursor-pointer card-interactive group">
                  <CardContent className="p-4">
                    <div className="icon-container icon-container-md bg-pillar-susceptibility/10 mb-3">
                      <PenTool className="w-5 h-5 text-pillar-susceptibility" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">Copywriter</h3>
                    <p className="text-xs text-muted-foreground">AI-powered messaging</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/byoc">
                <Card className="h-full cursor-pointer card-interactive group">
                  <CardContent className="p-4">
                    <div className="icon-container icon-container-md bg-secondary/10 mb-3">
                      <Upload className="w-5 h-5 text-secondary" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">BYOC</h3>
                    <p className="text-xs text-muted-foreground">Import your own comms</p>
                  </CardContent>
                </Card>
              </Link>
              {isAdmin && (
                <Link to={isSuperAdmin ? "/admin/panel" : "/admin/console"}>
                  <Card className="h-full cursor-pointer card-interactive group">
                    <CardContent className="p-4">
                      <div className="icon-container icon-container-md bg-muted mb-3">
                        <Settings className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-sm mb-1">{isSuperAdmin ? 'System Admin' : 'Admin Console'}</h3>
                      <p className="text-xs text-muted-foreground">Manage users & settings</p>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </section>

          {/* Utility Tools Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-header">Utility Tools</h2>
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
                    <Card className="h-full cursor-pointer card-interactive group">
                      <CardContent className="p-4">
                        <div className="icon-container icon-container-md bg-muted mb-3 group-hover:bg-primary/10 transition-colors">
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

          {/* Research Foundation */}
          <ResearchFoundation />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Core Tools */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Core Tools</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/settings" className="hover:text-foreground transition-colors">Institutional Settings</Link></li>
                <li><Link to="/build" className="hover:text-foreground transition-colors">Build Message</Link></li>
                <li><Link to="/evaluate" className="hover:text-foreground transition-colors">Evaluate Message</Link></li>
                <li><Link to="/strategy" className="hover:text-foreground transition-colors">Journey Designer</Link></li>
              </ul>
            </div>
            {/* More Tools */}
            <div>
              <h4 className="font-semibold text-sm mb-3">More Tools</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/call-script" className="hover:text-foreground transition-colors">Call Scripts</Link></li>
                <li><Link to="/playground" className="hover:text-foreground transition-colors">Playground</Link></li>
                <li><Link to="/byoc" className="hover:text-foreground transition-colors">Import & Evaluate</Link></li>
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
            {/* Utilities */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Utilities</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/campaign-dashboard" className="hover:text-foreground transition-colors">Campaign Dashboard</Link></li>
                <li><Link to="/calendar" className="hover:text-foreground transition-colors">Communication Calendar</Link></li>
                <li><Link to="/subject-optimizer" className="hover:text-foreground transition-colors">Subject Optimizer</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              CampusVoice — Your Voice for Student Success
            </p>
            <p className="text-xs text-muted-foreground">
              Research-grounded messaging intelligence for higher education
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
