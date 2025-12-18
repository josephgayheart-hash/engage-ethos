import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Megaphone, 
  Users, 
  FileText, 
  MessageSquare, 
  Heart, 
  UserPlus, 
  HeartHandshake, 
  GraduationCap,
  Briefcase,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import uplaybookLogo from "@/assets/uplaybook-logo.png";
import type { Department, DepartmentInfo } from "@/types/uplaybook";

const departments: DepartmentInfo[] = [
  {
    id: 'central-marketing',
    name: 'Central Marketing',
    description: 'Brand strategy, campaigns, and institutional messaging across all channels',
    primaryTools: ['builder', 'mapper'],
    typicalAudiences: ['prospective', 'alumni', 'parents', 'donors'],
    typicalMoments: ['recruitment', 'seasonal', 'giving-campaign'],
  },
  {
    id: 'executive-comms',
    name: 'Executive Communications',
    description: 'Presidential, provost, and leadership communications',
    primaryTools: ['evaluator', 'builder'],
    typicalAudiences: ['continuing', 'alumni', 'donors'],
    typicalMoments: ['seasonal', 'graduation'],
  },
  {
    id: 'enrollment-management',
    name: 'Enrollment Management',
    description: 'Admissions, yield, and enrollment communications',
    primaryTools: ['builder', 'mapper'],
    typicalAudiences: ['prospective', 'first-year'],
    typicalMoments: ['recruitment', 'yield', 'summer-melt', 'orientation'],
  },
  {
    id: 'registrar',
    name: 'Registrar',
    description: 'Registration, records, and academic calendar communications',
    primaryTools: ['evaluator', 'builder'],
    typicalAudiences: ['continuing', 'first-year', 'graduate'],
    typicalMoments: ['registration', 'midterm', 'finals'],
  },
  {
    id: 'college-communications',
    name: 'College Communications',
    description: 'Dean\'s office and college-specific messaging',
    primaryTools: ['builder', 'evaluator'],
    typicalAudiences: ['continuing', 'graduate'],
    typicalMoments: ['early-term', 'midterm', 'graduation'],
  },
  {
    id: 'student-success',
    name: 'Student Success',
    description: 'Advising, tutoring, and retention support communications',
    primaryTools: ['evaluator', 'mapper'],
    typicalAudiences: ['first-year', 'at-risk', 'continuing'],
    typicalMoments: ['early-term', 'midterm', 're-engagement'],
  },
  {
    id: 'recruitment',
    name: 'Recruitment',
    description: 'Prospective student outreach and inquiry management',
    primaryTools: ['builder', 'mapper'],
    typicalAudiences: ['prospective'],
    typicalMoments: ['recruitment', 'yield'],
  },
  {
    id: 'health-wellbeing',
    name: 'Health & Well-being',
    description: 'Counseling, health services, and wellness communications',
    primaryTools: ['evaluator', 'builder'],
    typicalAudiences: ['continuing', 'first-year', 'at-risk'],
    typicalMoments: ['early-term', 'midterm', 'finals'],
  },
  {
    id: 'advancement-alumni',
    name: 'Advancement & Alumni',
    description: 'Fundraising, donor relations, and alumni engagement',
    primaryTools: ['builder', 'mapper'],
    typicalAudiences: ['alumni', 'donors', 'parents'],
    typicalMoments: ['giving-campaign', 'seasonal', 'graduation'],
  },
  {
    id: 'human-resources',
    name: 'Human Resources (HR)',
    description: 'Benefits, policy updates, onboarding, and employee engagement communications',
    primaryTools: ['builder', 'evaluator'],
    typicalAudiences: ['employee'],
    typicalMoments: ['open-enrollment', 'onboarding', 'policy-update', 'campus-event'],
  },
];

const departmentIcons: Record<Department, React.ReactNode> = {
  'central-marketing': <Megaphone className="w-6 h-6" />,
  'executive-comms': <Building2 className="w-6 h-6" />,
  'enrollment-management': <Users className="w-6 h-6" />,
  'registrar': <FileText className="w-6 h-6" />,
  'college-communications': <MessageSquare className="w-6 h-6" />,
  'student-success': <GraduationCap className="w-6 h-6" />,
  'recruitment': <UserPlus className="w-6 h-6" />,
  'health-wellbeing': <Heart className="w-6 h-6" />,
  'advancement-alumni': <HeartHandshake className="w-6 h-6" />,
  'human-resources': <Briefcase className="w-6 h-6" />,
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

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
            <img src={uplaybookLogo} alt="UPlaybook.AI" className="h-16 mx-auto" />
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Welcome to UPlaybook
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Let's personalize your experience. Select your department to get tools and recommendations tailored to your communication needs.
            </p>
          </div>

          {/* Department Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
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
                      {departmentIcons[dept.id]}
                    </div>
                    {selectedDepartment === dept.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <CardTitle className="text-lg font-medium mt-2">{dept.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {dept.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Department Details */}
          {selectedInfo && (
            <Card className="animate-fade-in border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                    {departmentIcons[selectedInfo.id]}
                  </div>
                  {selectedInfo.name}
                </CardTitle>
                <CardDescription>{selectedInfo.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Recommended Tools</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedInfo.primaryTools.map(tool => (
                      <Badge key={tool} variant="secondary" className="capitalize">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Typical Audiences</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedInfo.typicalAudiences.map(audience => (
                      <Badge key={audience} variant="outline" className="capitalize">
                        {audience.replace('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Common Communication Moments</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedInfo.typicalMoments.map(moment => (
                      <Badge key={moment} variant="outline" className="capitalize">
                        {moment.replace('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
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
