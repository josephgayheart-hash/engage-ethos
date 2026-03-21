import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import campusvoiceLogo from "@/assets/campusvoice-logo.png";
import { useIndustry } from "@/contexts/IndustryContext";
import { resolveIcon } from "@/lib/iconResolver";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { departments, labels } = useIndustry();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedDepartment) {
      localStorage.setItem('uplaybook_department', selectedDepartment);
      localStorage.setItem('uplaybook_onboarding_complete', 'true');
      navigate('/');
    }
  };

  const selectedInfo = departments.find(d => d.id === selectedDepartment);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Logo and Header */}
          <div className="text-center space-y-4">
            <img src={campusvoiceLogo} alt="CampusVoice.AI" className="h-16 mx-auto" />
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Welcome to CampusVoice
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Let's personalize your experience. Select your department to get tools and recommendations tailored to your communication needs.
            </p>
          </div>

          {/* Department Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const IconComponent = resolveIcon(dept.icon);
              return (
                <Card 
                  key={dept.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedDepartment === dept.id 
                      ? 'ring-2 ring-primary border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedDepartment(dept.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${
                        selectedDepartment === dept.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      {selectedDepartment === dept.id && (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <CardTitle className="text-lg font-medium mt-2">{dept.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {dept.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Selected Department Details */}
          {selectedInfo && (
            <Card className="animate-fade-in border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                    {(() => { const Icon = resolveIcon(selectedInfo.icon); return <Icon className="w-6 h-6" />; })()}
                  </div>
                  {selectedInfo.label}
                </CardTitle>
                <CardDescription>{selectedInfo.description}</CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Continue Button */}
          <div className="flex justify-center pt-4">
            <Button 
              size="lg" 
              onClick={handleContinue}
              disabled={!selectedDepartment}
              className="min-w-[200px]"
            >
              Continue to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
