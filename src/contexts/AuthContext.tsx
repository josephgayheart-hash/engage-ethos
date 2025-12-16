import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Lock, ArrowRight, CheckCircle2, Megaphone, Building2, Users, FileText, MessageSquare, GraduationCap, UserPlus, Heart, HeartHandshake } from 'lucide-react';
import persistLogo from '@/assets/persist-logo.png';
import type { Department, DepartmentInfo } from '@/types/persist';

const DEFAULT_PASSWORD = 'persist2024';
const PASSWORD_STORAGE_KEY = 'persist_app_password';
const AUTH_STORAGE_KEY = 'persist_app_authenticated';
const ONBOARDING_COMPLETE_KEY = 'persist_onboarding_complete';
const DEPARTMENT_KEY = 'persist_department';

export const getAppPassword = (): string => {
  return localStorage.getItem(PASSWORD_STORAGE_KEY) || DEFAULT_PASSWORD;
};

export const setAppPassword = (newPassword: string): void => {
  localStorage.setItem(PASSWORD_STORAGE_KEY, newPassword);
};

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

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
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handlePasswordSubmit = () => {
    if (passwordInput === getAppPassword()) {
      const onboardingComplete = localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
      if (onboardingComplete) {
        setIsAuthenticated(true);
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      } else {
        setNeedsOnboarding(true);
      }
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleOnboardingComplete = () => {
    if (selectedDepartment) {
      localStorage.setItem(DEPARTMENT_KEY, selectedDepartment);
      localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setNeedsOnboarding(false);
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // Show onboarding after successful password entry
  if (needsOnboarding) {
    const selectedInfo = departments.find(d => d.id === selectedDepartment);
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Logo and Header */}
            <div className="text-center space-y-4">
              <img src={persistLogo} alt="PERSIST" className="h-16 mx-auto" />
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Welcome to PERSIST
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
                onClick={handleOnboardingComplete}
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
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <img src={persistLogo} alt="PERSIST" className="h-16 w-auto mx-auto mb-4" />
            <p className="text-muted-foreground">
              AI-Powered Message Intelligence for Higher Education
            </p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-2">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="font-serif">Access Required</CardTitle>
              <CardDescription>
                Enter the application password to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-password">Password</Label>
                <Input
                  id="app-password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  placeholder="Enter password"
                  className={passwordError ? 'border-destructive' : ''}
                />
                {passwordError && (
                  <p className="text-sm text-destructive">Incorrect password. Please try again.</p>
                )}
              </div>
              <Button onClick={handlePasswordSubmit} className="w-full">
                Access PERSIST
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            © 2024 PERSIST. Research-grounded messaging intelligence.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
