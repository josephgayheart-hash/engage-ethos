import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Briefcase,
  CheckCircle,
  ArrowLeft,
  Send,
  Building2,
  Globe,
  Users,
} from "lucide-react";
import campusvoiceLogo from "@/assets/campusvoice-logo-new.png";
import { SEOHead } from "@/components/SEOHead";

const processSteps = [
  {
    step: 1,
    title: "Submit Application",
    description: "Tell us about your agency and clients",
  },
  {
    step: 2,
    title: "Partner Review",
    description: "Our team reviews your application",
  },
  {
    step: 3,
    title: "Agency Setup",
    description: "Get your agency dashboard access",
  },
];

export default function AgencyRequestAccessPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    agencyName: "",
    agencyWebsite: "",
    estimatedClientCount: "",
    notes: "",
    referralSource: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("onboarding_requests").insert({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        title: formData.title || null,
        institution_name_input: formData.agencyName,
        notes: formData.notes || null,
        referral_source: formData.referralSource || null,
        request_type: "agency",
        agency_name: formData.agencyName,
        agency_website: formData.agencyWebsite || null,
        estimated_client_count: formData.estimatedClientCount
          ? parseInt(formData.estimatedClientCount)
          : null,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Application Submitted",
        description:
          "Thank you for your interest in the Agency Partner Program!",
      });
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <SEOHead
          title="Application Submitted | CampusVoice.AI"
          description="Thank you for applying to the CampusVoice Agency Partner Program."
        />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">
                Application Submitted
              </h1>
              <p className="text-muted-foreground mb-6">
                Thank you for your interest in the CampusVoice Agency Partner
                Program. Our team will review your application and reach out
                within 48 hours.
              </p>
              <Link to="/for-agencies">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Agency Page
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Become a Partner | CampusVoice.AI"
        description="Apply to become a CampusVoice Agency Partner. Manage multiple university clients from one platform."
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="py-4 px-4 sm:px-6 lg:px-8 border-b">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link to="/for-agencies" className="flex items-center gap-2">
              <img
                src={campusvoiceLogo}
                alt="CampusVoice.AI"
                className="h-8 w-auto max-w-[160px]"
              />
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </header>

        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link
              to="/for-agencies"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Agency Page
            </Link>

            <div className="grid lg:grid-cols-5 gap-8">
              {/* Left Column - Form */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <Badge
                      variant="outline"
                      className="w-fit mb-2 border-primary/30"
                    >
                      <Briefcase className="h-3 w-3 mr-1.5" />
                      Agency Partner Program
                    </Badge>
                    <CardTitle className="text-2xl">
                      Partner with CampusVoice
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Apply to become a CampusVoice agency partner and manage
                      all your university clients from one platform.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Personal Info */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          Your Information
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                              id="firstName"
                              required
                              value={formData.firstName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  firstName: e.target.value,
                                })
                              }
                              placeholder="Jane"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                              id="lastName"
                              required
                              value={formData.lastName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  lastName: e.target.value,
                                })
                              }
                              placeholder="Smith"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Work Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            placeholder="jane@youragency.com"
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                              }
                              placeholder="(555) 123-4567"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="title">Your Role</Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                              }
                              placeholder="Founder, Account Director, etc."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Agency Info */}
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          Agency Information
                        </h3>
                        <div className="space-y-2">
                          <Label htmlFor="agencyName">Agency Name *</Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="agencyName"
                              required
                              className="pl-10"
                              value={formData.agencyName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  agencyName: e.target.value,
                                })
                              }
                              placeholder="Your Agency Name"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="agencyWebsite">Agency Website</Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="agencyWebsite"
                              type="url"
                              className="pl-10"
                              value={formData.agencyWebsite}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  agencyWebsite: e.target.value,
                                })
                              }
                              placeholder="https://youragency.com"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="estimatedClientCount">
                            Estimated # of University Clients
                          </Label>
                          <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Select
                              value={formData.estimatedClientCount}
                              onValueChange={(value) =>
                                setFormData({
                                  ...formData,
                                  estimatedClientCount: value,
                                })
                              }
                            >
                              <SelectTrigger className="pl-10">
                                <SelectValue placeholder="Select range" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1-3">1-3 clients</SelectItem>
                                <SelectItem value="4-10">4-10 clients</SelectItem>
                                <SelectItem value="11-25">11-25 clients</SelectItem>
                                <SelectItem value="26+">26+ clients</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-2">
                          <Label htmlFor="notes">
                            Tell us about your agency (optional)
                          </Label>
                          <Textarea
                            id="notes"
                            rows={3}
                            value={formData.notes}
                            onChange={(e) =>
                              setFormData({ ...formData, notes: e.target.value })
                            }
                            placeholder="What types of higher ed clients do you serve? What challenges are you looking to solve?"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="referralSource">
                            How did you hear about us?
                          </Label>
                          <Select
                            value={formData.referralSource}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                referralSource: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="university_client">
                                University client referral
                              </SelectItem>
                              <SelectItem value="colleague">
                                Colleague recommendation
                              </SelectItem>
                              <SelectItem value="conference">
                                Conference or event
                              </SelectItem>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="search">Web search</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full gap-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "Submitting..."
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Submit Application
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Process */}
              <div className="lg:col-span-2">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Application Process
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {processSteps.map((step, index) => (
                        <div key={step.step} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                              {step.step}
                            </div>
                            {index < processSteps.length - 1 && (
                              <div className="w-px h-full bg-border mt-2" />
                            )}
                          </div>
                          <div className="pb-6">
                            <h4 className="font-medium text-foreground">
                              {step.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <p className="text-sm text-muted-foreground">
                        Questions about the partner program?
                      </p>
                      <a
                        href="mailto:partners@campusvoice.ai"
                        className="text-sm text-primary hover:underline"
                      >
                        partners@campusvoice.ai
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
