import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Briefcase,
  Building2,
  ArrowRight,
  CheckCircle,
  Layers,
  Sparkles,
  Users,
  Palette,
} from "lucide-react";
import campusvoiceLogo from "@/assets/campusvoice-logo-new.png";
import { SEOHead } from "@/components/SEOHead";

type OnboardingStep = "welcome" | "add-client" | "complete";

export default function AgencyOnboardingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, tenant } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientData, setClientData] = useState({
    name: "",
    primaryColor: "#1F2A44",
  });

  const agencyName = tenant?.institution_name || "Your Agency";

  const handleAddClient = async () => {
    if (!clientData.name.trim()) {
      toast({
        title: "Client name required",
        description: "Please enter a name for your first client.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("institutional_profiles").insert({
        tenant_id: tenant?.id,
        created_by_user_id: profile?.id,
        name: clientData.name,
        profile_type: "university",
        client_status: "active",
        config: {
          primaryColor: clientData.primaryColor,
        },
      });

      if (error) throw error;

      setCurrentStep("complete");
    } catch (error: any) {
      console.error("Error creating client:", error);
      toast({
        title: "Error",
        description: "Failed to create client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate("/agency/dashboard");
  };

  return (
    <>
      <SEOHead
        title="Agency Setup | CampusVoice.AI"
        description="Set up your agency partner account and add your first partner institution."
      />

      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col">
        {/* Header */}
        <header className="py-4 px-4 sm:px-6 lg:px-8 border-b bg-background/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={campusvoiceLogo}
                alt="CampusVoice.AI"
                className="h-8 w-auto max-w-[160px]"
              />
              <Badge variant="outline" className="border-primary/30">
                <Briefcase className="h-3 w-3 mr-1.5" />
                Agency Partner
              </Badge>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-2xl">
            {/* Welcome Step */}
            {currentStep === "welcome" && (
              <Card className="border-2">
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl">
                    Welcome to CampusVoice, {agencyName}!
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Let's get you set up to manage your partner institutions.
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                      <Layers className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Client Switcher</h3>
                        <p className="text-sm text-muted-foreground">
                          Switch between university clients instantly from the
                          header.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Per-Client Content DNA</h3>
                        <p className="text-sm text-muted-foreground">
                          Each client gets their own voice profile and brand
                          configuration.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Client-Tagged Workflows</h3>
                        <p className="text-sm text-muted-foreground">
                          All messages and drafts are organized by client
                          automatically.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={() => setCurrentStep("add-client")}
                  >
                    Add Your First Client
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Add Client Step */}
            {currentStep === "add-client" && (
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      Step 2 of 2
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">
                    Add Your First Client
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Enter the details for your first university client. You can
                    add more clients later.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">University Name *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="clientName"
                          className="pl-10"
                          value={clientData.name}
                          onChange={(e) =>
                            setClientData({
                              ...clientData,
                              name: e.target.value,
                            })
                          }
                          placeholder="e.g., State University"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">
                        Primary Brand Color (optional)
                      </Label>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="primaryColor"
                            className="pl-10 w-32"
                            value={clientData.primaryColor}
                            onChange={(e) =>
                              setClientData({
                                ...clientData,
                                primaryColor: e.target.value,
                              })
                            }
                            placeholder="#1F2A44"
                          />
                        </div>
                        <div
                          className="w-10 h-10 rounded-md border"
                          style={{ backgroundColor: clientData.primaryColor }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        You can update this and add a logo later in client
                        settings.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep("welcome")}
                      >
                        Back
                      </Button>
                      <Button
                        className="flex-1 gap-2"
                        onClick={handleAddClient}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "Creating Client..."
                        ) : (
                          <>
                            Create Client
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Complete Step */}
            {currentStep === "complete" && (
              <Card className="border-2">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-3">
                    You're All Set!
                  </h1>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Your first client <strong>{clientData.name}</strong> has
                    been created. You can now start generating on-brand content
                    and add more clients anytime.
                  </p>

                  <div className="space-y-3 mb-8 text-left max-w-sm mx-auto">
                    <h3 className="font-medium text-center mb-4">
                      What's Next:
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Configure Content DNA for {clientData.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Build your first message</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Add more university clients</span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={handleGoToDashboard}
                  >
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
