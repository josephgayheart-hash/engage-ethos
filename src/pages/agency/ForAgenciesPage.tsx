import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Users,
  Layers,
  Library,
  Tag,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import campusvoiceLogo from "@/assets/campusvoice-logo-new.png";
import { RequestDemoDialog } from "@/components/landing/RequestDemoDialog";
import { useState } from "react";
import { SEOHead } from "@/components/SEOHead";

const agencyValueProps = [
  {
    icon: Layers,
    title: "Multi-Brand Management",
    description:
      "Switch between university clients instantly. Each client gets their own workspace, content DNA, and messaging history.",
  },
  {
    icon: Sparkles,
    title: "Per-Client Content DNA",
    description:
      "Every university client has a unique voice profile. Generate on-brand content that matches each institution's personality.",
  },
  {
    icon: Library,
    title: "Unified Template Library",
    description:
      "Build proven templates once, deploy across clients. Share your best-performing messages while keeping client branding distinct.",
  },
  {
    icon: Tag,
    title: "Client-Tagged Workflows",
    description:
      "All drafts, messages, and analytics organized by client. Never lose context when switching between university accounts.",
  },
];

const agencyBenefits = [
  "Manage unlimited university clients from one dashboard",
  "Dedicated Content DNA per client institution",
  "Client-specific message libraries and templates",
  "Team collaboration with role-based access",
  "Per-client analytics and reporting",
  "White-label ready for agency branding",
];

const agencyTestimonial = {
  quote:
    "CampusVoice lets me manage multiple university clients without context-switching chaos. Each school gets their own voice profile, and I can switch between them in seconds.",
  author: "Agency Partner",
  role: "Higher Ed Marketing Agency",
};

export default function ForAgenciesPage() {
  const [showDemoDialog, setShowDemoDialog] = useState(false);

  return (
    <>
      <SEOHead
        title="For Agencies | CampusVoice.AI"
        description="Manage multiple university clients from one platform. Per-client Content DNA, unified templates, and client-tagged workflows for higher ed marketing agencies."
        path="/for-agencies"
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="py-4 px-4 sm:px-6 lg:px-8 border-b">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={campusvoiceLogo}
                alt="CampusVoice.AI"
                className="h-8 w-auto max-w-[160px]"
              />
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/agency/request-access">
                <Button size="sm" className="gap-2">
                  <Briefcase className="h-4 w-4" />
                  Become a Partner
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-4xl mx-auto text-center">
            <Badge
              variant="outline"
              className="mb-6 px-4 py-1.5 text-sm font-medium border-primary/30"
            >
              <Briefcase className="h-3.5 w-3.5 mr-2" />
              Agency Partner Program
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              One Platform.
              <br />
              <span className="text-primary">Multiple University Brands.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Manage content DNA, messaging, and brand voice for all your higher
              ed clients from a single dashboard. Built for agencies that serve
              multiple universities.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/agency/request-access">
                <Button size="lg" className="gap-2 text-base px-8">
                  Become a Partner
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 text-base px-8"
                onClick={() => setShowDemoDialog(true)}
              >
                Schedule a Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Multi-Client Support</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Per-Client Branding</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Agency Dashboard</span>
              </div>
            </div>
          </div>
        </section>

        {/* Value Props Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Built for Agency Workflows
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to manage multiple university clients
                efficiently, without the context-switching overhead.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {agencyValueProps.map((prop) => (
                <Card
                  key={prop.title}
                  className="border-2 hover:border-primary/30 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <prop.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          {prop.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {prop.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Why Agencies Choose CampusVoice
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {agencyBenefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-8 text-center">
                <blockquote className="text-xl italic text-foreground mb-6">
                  "{agencyTestimonial.quote}"
                </blockquote>
                <div>
                  <p className="font-semibold text-foreground">
                    {agencyTestimonial.author}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {agencyTestimonial.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Ready to streamline your agency workflow?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join the CampusVoice Agency Partner Program and manage all your
              university clients from one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/agency/request-access">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 text-base px-8"
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setShowDemoDialog(true)}
              >
                Schedule a Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 px-4 sm:px-6 lg:px-8 border-t">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={campusvoiceLogo}
                alt="CampusVoice.AI"
                className="h-7 w-auto max-w-[140px] opacity-70"
              />
              <span className="text-sm text-muted-foreground">
                © 2026 CampusVoice.AI
              </span>
            </div>
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              For Universities →
            </Link>
          </div>
        </footer>

        <RequestDemoDialog
          open={showDemoDialog}
          onOpenChange={setShowDemoDialog}
        />
      </div>
    </>
  );
}
