import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Clock,
  Send,
  FileText,
  Building2,
  Copy,
  RefreshCw,
  Lock,
  Sparkles
} from "lucide-react";
import uplaybookLogo from "@/assets/uplaybook-logo.png";

const libraryTypes = [
  {
    icon: FileText,
    title: "Personal Library",
    description: "Your private workspace for drafts, experiments, and work-in-progress. Save generated content, evaluations, and journey maps.",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10"
  },
  {
    icon: BookOpen,
    title: "University Library",
    description: "Institution-wide approved content. Vetted playbooks, templates, and journeys that align with brand standards.",
    color: "text-purple-600",
    bgColor: "bg-purple-500/10"
  },
];

const workflowSteps = [
  { step: 1, title: "Create & Save", description: "Generate content using Message Builder or Journey Designer and save to your personal library" },
  { step: 2, title: "Submit for Review", description: "When ready, submit your work to the University Library for approval" },
  { step: 3, title: "Admin Review", description: "Approvers review content for brand alignment and compliance" },
  { step: 4, title: "Publish", description: "Approved content becomes available to all team members" },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Approval Workflows",
    description: "Built-in review process ensures only vetted, on-brand content reaches your team.",
  },
  {
    icon: Search,
    title: "Advanced Filtering",
    description: "Find content by audience, channel, moment, domain, or institutional profile.",
  },
  {
    icon: Building2,
    title: "Profile Hierarchy",
    description: "Organize content by school, department, or campaign with inherited settings.",
  },
  {
    icon: RefreshCw,
    title: "Remix & Iterate",
    description: "Start from approved templates and customize for your specific needs.",
  },
];

const contentTypes = [
  { label: "Message Kits", description: "Multi-channel content packages" },
  { label: "Strategy Journeys", description: "Complete campaign timelines" },
  { label: "Email Templates", description: "Ready-to-customize emails" },
  { label: "Call Scripts", description: "Phone conversation guides" },
  { label: "Talking Points", description: "Executive briefing materials" },
  { label: "Ad Copy", description: "Search and social ad content" },
];

export default function LibraryFeaturePage() {
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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-background to-indigo-500/5" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-purple-500/10 text-purple-600 border-purple-500/20">
              <Library className="w-3 h-3 mr-1" />
              Enterprise Content Governance
            </Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your Institution's
              <span className="block text-purple-600">Content Command Center</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Governed content libraries with approval workflows. Personal drafts for experimentation. University-wide playbooks for brand-compliant messaging at scale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/request-access">
                <Button size="lg" className="gap-2 bg-purple-600 hover:bg-purple-700">
                  Request Beta Access
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Two Library Types */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              Two Libraries, One Workflow
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experiment freely in your personal space. Share your best work with the institution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {libraryTypes.map((lib, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className={`w-16 h-16 rounded-2xl ${lib.bgColor} flex items-center justify-center mb-6`}>
                  <lib.icon className={`w-8 h-8 ${lib.color}`} />
                </div>
                <h3 className="font-serif text-2xl font-bold mb-3">{lib.title}</h3>
                <p className="text-muted-foreground">{lib.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approval Workflow */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                Built-In Approval Workflow
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From draft to published—a clear path for content governance.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
              <div className="grid md:grid-cols-4 gap-6">
                {workflowSteps.map((step, i) => (
                  <div key={i} className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg mb-4">
                        {step.step}
                      </div>
                      <h3 className="font-semibold mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    {i < workflowSteps.length - 1 && (
                      <ArrowRight className="hidden md:block absolute top-6 -right-3 w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>

              {/* Status Badges Demo */}
              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex flex-wrap justify-center gap-3">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Draft
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Send className="w-3 h-3" />
                    Submitted
                  </Badge>
                  <Badge className="flex items-center gap-1 bg-green-600">
                    <CheckCircle2 className="w-3 h-3" />
                    Approved
                  </Badge>
                  <Badge className="flex items-center gap-1 bg-purple-600">
                    <BookOpen className="w-3 h-3" />
                    Published
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Library Interface Mock */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                    <h3 className="font-serif text-xl font-bold">University Library</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      3 Pending Review
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <div className="pl-10 pr-4 py-2 bg-background rounded-lg border border-border text-sm text-muted-foreground">
                      Search playbooks...
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Filter className="w-4 h-4" />
                    Filters
                  </Button>
                </div>
              </div>

              {/* Content Grid */}
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: "First-Year Welcome Journey", type: "Strategy Journey", status: "Published", profile: "Undergraduate" },
                    { title: "Registration Deadline Kit", type: "Message Kit", status: "Approved", profile: "All Students" },
                    { title: "Financial Aid Reminder", type: "Email Template", status: "Published", profile: "Financial Services" },
                    { title: "Re-enrollment Campaign", type: "Strategy Journey", status: "Submitted", profile: "Graduate School" },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{item.title}</h4>
                        <Badge variant={item.status === 'Published' ? 'default' : item.status === 'Approved' ? 'secondary' : 'outline'} className={item.status === 'Published' ? 'bg-purple-600' : ''}>
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {item.profile}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              Enterprise-Grade Features
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Types */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-8">
              Store Any Content Type
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {contentTypes.map((type, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-4 text-left">
                  <h3 className="font-semibold text-sm mb-1">{type.label}</h3>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why CCOs Love It */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-white">
              <h2 className="font-serif text-3xl font-bold mb-6 text-center">
                Why Communications Leaders Love This
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { icon: Lock, text: "Brand governance at scale—no more off-brand messaging" },
                  { icon: Users, text: "New hires get up to speed instantly with approved templates" },
                  { icon: Sparkles, text: "AI-generated content still goes through human review" },
                  { icon: Building2, text: "Different standards for different schools/departments" },
                  { icon: RefreshCw, text: "Iterate on approved content without starting from scratch" },
                  { icon: ShieldCheck, text: "Full audit trail of who created and approved what" },
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

      {/* CTA Section */}
      <section className="py-20 bg-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Ready for Content Governance?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join the beta to bring enterprise-grade content management to your institution.
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
