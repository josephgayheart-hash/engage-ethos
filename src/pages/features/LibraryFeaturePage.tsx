import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  ArrowRight,
  Library, 
  BookOpen,
  ShieldCheck,
  Users,
  Search,
  Filter,
  CheckCircle2,
  CheckCircle,
  Clock,
  Send,
  FileText,
  Building2,
  Copy,
  Download,
  Trash2,
  Lock,
  Sparkles,
  Eye,
  XCircle,
  ChevronRight,
  Layers,
  AlertTriangle,
  Mail,
  MessageSquare,
  Calendar,
  User
} from "lucide-react";
import uplaybookLogo from "@/assets/uplaybook-logo.png";
import { FeatureNavigation } from "@/components/FeatureNavigation";

const workflowSteps = [
  { step: 1, icon: FileText, title: "Save to Personal", description: "Save generated messages or evaluations to your private library", color: "bg-blue-500" },
  { step: 2, icon: Send, title: "Submit for Review", description: "Submit your best work to the University Library", color: "bg-amber-500" },
  { step: 3, icon: Eye, title: "Admin Review", description: "Approvers review content, guardrails, and brand alignment", color: "bg-purple-500" },
  { step: 4, icon: BookOpen, title: "Publish Institution-Wide", description: "Approved content available to all team members", color: "bg-emerald-500" },
];

const filterCategories = [
  { 
    label: "10 Channels", 
    items: ["Email", "SMS", "Portal", "Landing Page", "Social Media", "Direct Mail", "Phone Script", "Talking Points", "Search Ads", "Social Ads"],
  },
  { 
    label: "5 Audiences", 
    items: ["Prospective", "First-Year", "Continuing", "At-Risk", "Graduate"],
  },
  { 
    label: "6 Domains", 
    items: ["Academic", "Financial", "Wellbeing", "Engagement", "Behavioral", "Seasonal"],
  },
  { 
    label: "8 Moments", 
    items: ["Recruitment", "Orientation", "Registration", "Early Term", "Midterm", "Finals", "Re-engagement", "Seasonal"],
  },
];

export default function LibraryFeaturePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={uplaybookLogo} alt="CampusVoice" className="h-8" />
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
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-background to-emerald-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(140_60%_90%_/_0.3),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(160_60%_85%_/_0.25),_transparent_50%)]" />
        
        {/* Lens flares */}
        <div className="absolute top-20 right-[12%] w-32 h-32 bg-[hsl(140_60%_50%_/_0.18)] rounded-full blur-2xl" />
        <div className="absolute bottom-36 left-[8%] w-40 h-40 bg-[hsl(160_60%_55%_/_0.15)] rounded-full blur-3xl" />
        <div className="absolute top-44 left-[22%] w-24 h-24 bg-[hsl(270_70%_60%_/_0.1)] rounded-full blur-2xl" />
        <div className="absolute bottom-48 right-[25%] w-20 h-20 bg-[hsl(82_85%_55%_/_0.1)] rounded-full blur-2xl" />
        <div className="absolute top-32 right-[35%] w-16 h-16 bg-[hsl(200_100%_50%_/_0.12)] rounded-full blur-xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 animate-fade-in">
              <Library className="w-3 h-3 mr-1" />
              The Quiet Killer for CCOs & CMOs
            </Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Scale Your Brand Voice
              <span className="block text-primary">With Governance Built In</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Keep every team member on-brand with personal libraries that flow into university-wide governance—complete with submission, approval, and publishing workflows powered by AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link to="/request-access">
                <Button size="lg" className="gap-2">
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
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(140 50% 94%)"/>
          </svg>
        </div>
      </section>

      {/* Two Library System */}
      <section className="py-20 bg-[hsl(140_50%_94%)] relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-12 right-[10%] w-28 h-28 bg-[hsl(270_70%_60%_/_0.12)] rounded-full blur-2xl" />
        <div className="absolute bottom-28 left-[6%] w-36 h-36 bg-[hsl(82_85%_55%_/_0.12)] rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-[40%] w-20 h-20 bg-[hsl(200_100%_50%_/_0.1)] rounded-full blur-2xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Two Libraries, One Unified System
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Personal creativity meets institutional governance. Staff build and experiment in their own space, then submit their best work for university-wide approval.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Personal Library */}
            <Card className="border-2 hover:border-primary/50 transition-all">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                  <FileText className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                  Personal Message Library
                </h3>
                <p className="text-muted-foreground mb-6">
                  Your private workspace for saved messages and evaluations. Build, iterate, and perfect your content before sharing.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Search className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-sm">Search and filter by channel, audience, domain, and moment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Copy className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-sm">Duplicate messages to create variations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Download className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-sm">Export messages for external use</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Library className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-sm">Submit to University Library for approval</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Trash2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-sm">Full CRUD operations on your personal content</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* University Library */}
            <Card className="border-2 hover:border-primary/50 transition-all">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                  University Library
                </h3>
                <p className="text-muted-foreground mb-6">
                  Brand-governed content with approval workflows. Your institution's playbook of vetted, on-brand messaging.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Organize by playbooks (campaigns, initiatives, themes)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Status tracking: Draft → Submitted → Approved → Published</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Team-wide access to approved templates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Layers className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Profile hierarchy for sub-unit governance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Ethical guardrails review before publishing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="relative bg-[hsl(140_50%_94%)]">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0 80L48 70C96 60 192 40 288 35C384 30 480 40 576 45C672 50 768 50 864 45C960 40 1056 30 1152 30C1248 30 1344 40 1392 45L1440 50V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>

      {/* Approval Workflow */}
      <section className="py-20 relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-16 left-[18%] w-32 h-32 bg-[hsl(140_60%_50%_/_0.08)] rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-[15%] w-44 h-44 bg-[hsl(160_60%_55%_/_0.08)] rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                Admin Governance
              </Badge>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Approval Workflow for Brand Control
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Admins and approvers review submissions, provide feedback, and control what gets published institution-wide.
              </p>
            </div>

            {/* Workflow Steps */}
            <div className="grid md:grid-cols-4 gap-4 mb-12">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="relative">
                  <Card className="h-full">
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center mx-auto mb-4`}>
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                  {index < 3 && (
                    <ChevronRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-muted-foreground/30 -translate-y-1/2" />
                  )}
                </div>
              ))}
            </div>

            {/* Mock Approval Panel */}
            <Card className="border-2 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Pending Approvals</h3>
                  <Badge variant="secondary">3</Badge>
                </div>

                <div className="space-y-4">
                  {/* Mock submission */}
                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <h4 className="font-medium">Fall Registration Reminder</h4>
                            <Badge variant="secondary" className="text-xs">
                              <Send className="w-3 h-3 mr-1" />
                              Submitted
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Encourage students to complete their fall semester registration before the deadline.
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className="text-xs">Email</Badge>
                            <Badge variant="outline" className="text-xs">Continuing Students</Badge>
                            <Badge variant="outline" className="text-xs">Registration</Badge>
                            <Badge className="text-xs bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              Registrar's Office
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Sarah Chen
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              2 hours ago
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0 flex-wrap">
                          <Button size="sm" className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button variant="secondary" size="sm" className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            Review
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <XCircle className="w-4 h-4" />
                            Return
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ethical Guardrails */}
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm font-medium flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Ethical Guardrails Review
                    </p>
                    <ul className="text-xs space-y-1 text-muted-foreground ml-6">
                      <li>• Avoid urgency language that creates undue stress</li>
                      <li>• Do not imply financial consequences without context</li>
                      <li>• Maintain supportive, student-centered tone</li>
                    </ul>
                  </div>

                  {/* Ready to publish */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <h4 className="font-semibold text-sm">Ready to Publish</h4>
                      <Badge variant="outline">2</Badge>
                    </div>
                    <Card className="border-l-4 border-l-emerald-500">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <p className="font-medium text-sm">Welcome Week Schedule</p>
                            <p className="text-xs text-muted-foreground">Approved by Admin • Ready for institution-wide access</p>
                          </div>
                          <Button size="sm">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Publish
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Brand Layer Integration */}
      <section className="py-20 bg-[hsl(160_45%_93%)] relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-12 right-[10%] w-28 h-28 bg-[hsl(140_60%_50%_/_0.12)] rounded-full blur-2xl" />
        <div className="absolute bottom-28 left-[6%] w-36 h-36 bg-[hsl(82_85%_55%_/_0.1)] rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="secondary" className="mb-4">
                  <Layers className="w-3.5 h-3.5 mr-1.5" />
                  Content DNA Integration
                </Badge>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                  Connected to Your Brand Layer
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Every message is tagged with the institutional profile it was created for—from university-wide to specific colleges and departments. This ensures Content DNA evaluation stays accurate at every level.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Profile Hierarchy Display</p>
                      <p className="text-sm text-muted-foreground">See the full Brand Layer path for each message</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">AI-Powered Evaluation</p>
                      <p className="text-sm text-muted-foreground">Content DNA scores ensure brand voice adherence</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Ethical Guardrails</p>
                      <p className="text-sm text-muted-foreground">Review guardrails before approving content</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Mock Profile Badge */}
              <Card className="bg-card">
                <CardContent className="p-6">
                  <h4 className="font-medium mb-4 text-sm text-muted-foreground">Message with Profile Hierarchy</h4>
                  <div className="p-4 bg-muted/50 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Scholarship Deadline Reminder</span>
                      <Badge className="bg-green-600 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                        <Library className="w-3 h-3 mr-1" />
                        In University Library
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Don't miss out on financial aid opportunities for the upcoming semester...
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">Prospective Students</Badge>
                      <Badge variant="outline" className="text-xs">Financial Aid</Badge>
                      <Badge variant="outline" className="text-xs">Recruitment</Badge>
                    </div>
                    {/* Profile hierarchy badge */}
                    <div className="flex items-center gap-1 text-xs flex-wrap">
                      <Badge className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        University
                        <ChevronRight className="w-3 h-3" />
                        College of Arts
                        <ChevronRight className="w-3 h-3" />
                        Financial Aid Office
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Created by: Michael Torres
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Dec 15, 2024
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="relative bg-[hsl(160_45%_93%)]">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0 80L60 65C120 50 240 20 360 15C480 10 600 30 720 40C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>

      {/* Filter Capabilities */}
      <section className="py-20 relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-1/4 right-[8%] w-36 h-36 bg-[hsl(140_60%_50%_/_0.08)] rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-[12%] w-28 h-28 bg-[hsl(160_60%_55%_/_0.08)] rounded-full blur-2xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              Find Any Message Instantly
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful filtering across channels, audiences, domains, and student journey moments.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {filterCategories.map((filter) => (
              <Card key={filter.label} className="h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold text-sm">{filter.label}</h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {filter.items.slice(0, 4).map((item) => (
                      <Badge key={item} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                    {filter.items.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{filter.items.length - 4} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why CCOs Love It */}
      <section className="py-20 bg-[hsl(82_50%_94%)] relative overflow-hidden">
        {/* Lens flares */}
        <div className="absolute top-12 right-[10%] w-28 h-28 bg-[hsl(140_60%_50%_/_0.1)] rounded-full blur-2xl" />
        <div className="absolute bottom-16 left-[8%] w-32 h-32 bg-[hsl(270_70%_60%_/_0.08)] rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-primary-foreground">
              <h2 className="font-serif text-3xl font-bold mb-6 text-center">
                Why Communications Leaders Love This
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { icon: Lock, text: "Brand governance at scale—no more off-brand messaging" },
                  { icon: Users, text: "New hires get up to speed instantly with approved templates" },
                  { icon: Sparkles, text: "AI-generated content still goes through human review" },
                  { icon: Building2, text: "Different standards for different schools/departments" },
                  { icon: ShieldCheck, text: "Full audit trail of who created and approved what" },
                  { icon: Library, text: "Systematic scaling of your brand layer and strategy" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm opacity-90">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore More Features */}
      <FeatureNavigation currentFeatureId="library" />

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Ready to Scale Brand Governance?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join the beta and see how institutions are keeping hundreds of communicators on-brand with AI-powered governance.
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
          <img src={uplaybookLogo} alt="CampusVoice" className="h-6 mx-auto mb-4 opacity-60" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CampusVoice. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
