import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, CheckCircle2, Loader2, ArrowLeft, Users, Sparkles, Shield, Brain, GraduationCap, ArrowRight } from 'lucide-react';
import uplaybookLogo from '@/assets/uplaybook-logo.png';

const REFERRAL_OPTIONS = [
  { value: 'colleague', label: 'Colleague or peer recommendation' },
  { value: 'conference', label: 'Conference or event' },
  { value: 'webinar', label: 'Webinar or presentation' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'google', label: 'Google search' },
  { value: 'industry_publication', label: 'Industry publication or article' },
  { value: 'email', label: 'Email newsletter' },
  { value: 'vendor', label: 'Vendor or partner referral' },
  { value: 'other', label: 'Other' },
];

const trustIndicators = [
  { icon: Shield, label: 'Brand Governance' },
  { icon: Brain, label: 'Research-Driven' },
  { icon: GraduationCap, label: 'Built for Higher Ed' },
];

export default function RequestAccessPage() {
  const [searchParams] = useSearchParams();
  
  // Check for referral parameters
  const refSource = searchParams.get('ref');
  const tenantId = searchParams.get('tenant');
  const institutionFromUrl = searchParams.get('institution');
  const isColleagueReferral = refSource === 'colleague';
  const isSameInstitution = isColleagueReferral && !!tenantId;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    institutionName: institutionFromUrl || '',
    department: '',
    title: '',
    referralSource: isColleagueReferral ? 'colleague' : '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill institution name from URL if provided
  useEffect(() => {
    if (institutionFromUrl && !formData.institutionName) {
      setFormData(prev => ({ ...prev, institutionName: institutionFromUrl }));
    }
    if (isColleagueReferral && !formData.referralSource) {
      setFormData(prev => ({ ...prev, referralSource: 'colleague' }));
    }
  }, [institutionFromUrl, isColleagueReferral]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('onboarding_requests')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          institution_name_input: formData.institutionName,
          department: formData.department || null,
          title: formData.title || null,
          referral_source: formData.referralSource || null,
          request_status: 'submitted',
          // Store tenant_id if this is a same-institution referral
          tenant_id: isSameInstitution ? tenantId : null,
        });

      if (insertError) {
        if (insertError.message.includes('duplicate')) {
          setError('An access request with this email already exists. Please contact your administrator.');
        } else {
          setError('Failed to submit request. Please try again.');
        }
        return;
      }

      // Send confirmation email (fire-and-forget - don't block on success)
      supabase.functions.invoke('send-request-confirmation', {
        body: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          institutionName: formData.institutionName,
        },
      }).catch((emailErr) => {
        console.error('Failed to send confirmation email:', emailErr);
      });

      setIsSubmitted(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Request access error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-zone-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(200_70%_90%_/_0.4),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(173_58%_85%_/_0.3),_transparent_50%)]" />
        
        {/* Lens flares */}
        <div className="absolute top-20 right-[15%] w-32 h-32 bg-[hsl(82_85%_55%_/_0.12)] rounded-full blur-2xl" />
        <div className="absolute bottom-32 left-[10%] w-40 h-40 bg-[hsl(270_70%_60%_/_0.1)] rounded-full blur-3xl" />
        
        <div className="relative flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md space-y-6 animate-fade-in">
            <div className="text-center">
              <img src={uplaybookLogo} alt="UPlaybook.AI" className="h-14 w-auto mx-auto mb-4" />
            </div>

            <Card className="border-border/60 shadow-lg bg-card/95 backdrop-blur-sm">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="mx-auto p-4 rounded-2xl bg-status-strong/10 w-fit animate-scale-in">
                  <CheckCircle2 className="w-12 h-12 text-status-strong" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  Request Submitted
                </h2>
                <p className="text-muted-foreground">
                  Thank you for your interest in UPlaybook. An administrator will review your request and activate your account.
                </p>
                <p className="text-sm text-muted-foreground">
                  You will receive your login credentials once approved.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="mt-4 border-border hover:bg-muted">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient background matching landing page */}
      <div className="absolute inset-0 bg-zone-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(200_70%_90%_/_0.4),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(173_58%_85%_/_0.3),_transparent_50%)]" />
      
      {/* Lens flares */}
      <div className="absolute top-20 right-[12%] w-32 h-32 bg-[hsl(270_70%_60%_/_0.12)] rounded-full blur-2xl" />
      <div className="absolute bottom-36 left-[8%] w-40 h-40 bg-[hsl(82_85%_55%_/_0.1)] rounded-full blur-3xl" />
      <div className="absolute top-44 left-[22%] w-24 h-24 bg-[hsl(200_100%_50%_/_0.1)] rounded-full blur-2xl" />
      <div className="absolute bottom-48 right-[25%] w-20 h-20 bg-[hsl(340_75%_55%_/_0.08)] rounded-full blur-2xl" />
      
      <div className="relative flex items-center justify-center min-h-screen p-4 py-12">
        <div className="w-full max-w-lg space-y-6 animate-fade-in">
          {/* Logo & Tagline */}
          <div className="text-center">
            <Badge 
              variant="secondary" 
              className="mb-4 bg-[hsl(200_100%_50%_/_0.15)] text-[hsl(200_100%_40%)] border-[hsl(200_100%_50%_/_0.3)] px-3 py-1"
            >
              <Sparkles className="w-3 h-3 mr-1.5" />
              Beta Access
            </Badge>
            <img src={uplaybookLogo} alt="UPlaybook.AI" className="h-12 w-auto mx-auto mb-4" />
            <h1 className="font-serif text-xl text-foreground mb-2">
              <span className="text-[hsl(82_85%_45%)]">Plan.</span>{' '}
              <span className="text-[hsl(270_70%_55%)]">Strategize.</span>{' '}
              <span className="text-[hsl(200_100%_45%)]">Execute.</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Strategic Messaging Intelligence for Higher Education
            </p>
          </div>

          {/* Request Card */}
          <Card className="border-border/60 shadow-lg bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              {isColleagueReferral ? (
                <>
                  <div className="mx-auto p-3 rounded-xl bg-[hsl(200_100%_50%_/_0.1)] w-fit mb-2">
                    <Users className="w-6 h-6 text-[hsl(200_100%_45%)]" />
                  </div>
                  <CardTitle className="font-serif text-foreground">
                    {isSameInstitution ? `Join ${institutionFromUrl || 'Your Team'}` : 'Complete Your Profile'}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {isSameInstitution 
                      ? "A colleague invited you to join their team on UPlaybook"
                      : "A colleague recommended UPlaybook for your institution"
                    }
                  </CardDescription>
                </>
              ) : (
                <>
                  <div className="mx-auto p-3 rounded-xl bg-accent/10 w-fit mb-2">
                    <UserPlus className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="font-serif text-foreground">Request Access</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Fill out the form below to request access to UPlaybook
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-foreground">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-foreground">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="border-border"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@institution.edu"
                    className="border-border"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    className="border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institutionName" className="text-foreground">Institution Name *</Label>
                  <Input
                    id="institutionName"
                    name="institutionName"
                    value={formData.institutionName}
                    onChange={handleChange}
                    placeholder="University Name"
                    className="border-border"
                    required
                    disabled={isSameInstitution && !!institutionFromUrl}
                  />
                  {isSameInstitution && institutionFromUrl && (
                    <p className="text-xs text-muted-foreground">
                      You'll be joining the existing {institutionFromUrl} team
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-foreground">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g., Enrollment"
                      className="border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Director"
                      className="border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralSource" className="text-foreground">How did you hear about us?</Label>
                  <Select
                    value={formData.referralSource}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, referralSource: value }))}
                  >
                    <SelectTrigger className="border-border">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {REFERRAL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[hsl(82_85%_55%)] to-[hsl(82_85%_45%)] text-primary hover:from-[hsl(82_85%_50%)] hover:to-[hsl(82_85%_40%)] shadow-md hover:shadow-lg transition-all duration-300 font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  Back to Login
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {trustIndicators.map((indicator, index) => {
              const colors = [
                'text-[hsl(82_85%_45%)]',
                'text-[hsl(270_70%_55%)]', 
                'text-[hsl(200_100%_45%)]'
              ];
              return (
                <div 
                  key={indicator.label}
                  className="flex items-center gap-2 text-xs"
                >
                  <indicator.icon className={`w-3.5 h-3.5 ${colors[index % 3]}`} />
                  <span className="text-muted-foreground">{indicator.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}