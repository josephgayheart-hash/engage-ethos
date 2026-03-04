import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Loader2, ArrowLeft, ArrowRight, Zap, BarChart3, Palette, MessageSquareText } from 'lucide-react';
import campusvoiceLogo from '@/assets/campusvoice-logo.png';
import { SEOHead } from '@/components/SEOHead';

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

const VALUE_PROPS = [
  { icon: MessageSquareText, text: "AI-powered message generation tuned to your brand voice", color: "hsl(82 85% 55%)" },
  { icon: BarChart3, text: "Research-backed evaluation that scores every message", color: "hsl(270 70% 60%)" },
  { icon: Palette, text: "Brand governance tools that keep your team on-brand", color: "hsl(200 100% 50%)" },
  { icon: Zap, text: "From strategy to send in minutes, not weeks", color: "hsl(82 85% 55%)" },
];

const ROTATING_PHRASES = [
  { text: "Smarter Messaging.", color: "hsl(82 85% 55%)" },
  { text: "Brand Consistency.", color: "hsl(270 70% 60%)" },
  { text: "Strategic Impact.", color: "hsl(200 100% 50%)" },
  { text: "Faster Campaigns.", color: "hsl(82 85% 55%)" },
  { text: "Authentic Voice.", color: "hsl(270 70% 60%)" },
  { text: "Real Results.", color: "hsl(200 100% 50%)" },
];

export default function RequestAccessPage() {
  const [searchParams] = useSearchParams();
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
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    if (institutionFromUrl && !formData.institutionName) {
      setFormData(prev => ({ ...prev, institutionName: institutionFromUrl }));
    }
    if (isColleagueReferral && !formData.referralSource) {
      setFormData(prev => ({ ...prev, referralSource: 'colleague' }));
    }
  }, [institutionFromUrl, isColleagueReferral]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setPhraseIndex(prev => (prev + 1) % ROTATING_PHRASES.length);
        setFadeIn(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentPhrase = ROTATING_PHRASES[phraseIndex];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <SEOHead 
        title="Request Beta Access - CampusVoice.AI"
        description="Join the CampusVoice.AI beta program. Get early access to AI-powered strategic messaging intelligence built for higher education."
        keywords={['CampusVoice beta', 'higher education AI', 'enrollment marketing', 'request access']}
      />

      {/* Left branded panel — matches login */}
      <div
        className="hidden lg:flex lg:w-[48%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: 'linear-gradient(145deg, hsl(222, 47%, 11%) 0%, hsl(222, 47%, 16%) 40%, hsl(222, 47%, 13%) 100%)',
        }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Floating orbs */}
        <div className="absolute w-72 h-72 rounded-full blur-[80px] animate-float-slow" style={{ background: 'hsl(82 85% 55% / 0.25)', top: '8%', right: '10%' }} />
        <div className="absolute w-56 h-56 rounded-full blur-[70px] animate-float-medium" style={{ background: 'hsl(270 70% 60% / 0.3)', bottom: '15%', left: '5%', animationDelay: '1s' }} />
        <div className="absolute w-40 h-40 rounded-full blur-[60px] animate-float-fast" style={{ background: 'hsl(200 100% 50% / 0.3)', top: '45%', left: '30%', animationDelay: '0.5s' }} />
        <div className="absolute w-32 h-32 rounded-full blur-[50px] animate-float-medium" style={{ background: 'hsl(340 75% 55% / 0.2)', bottom: '30%', right: '20%', animationDelay: '2s' }} />
        <div className="absolute w-24 h-24 rounded-full blur-[40px] animate-float-slow" style={{ background: 'hsl(45 93% 55% / 0.2)', top: '25%', left: '15%', animationDelay: '1.5s' }} />
        <div className="absolute w-48 h-48 rounded-full blur-[60px] animate-float-fast" style={{ background: 'hsl(173 58% 45% / 0.2)', bottom: '5%', right: '5%', animationDelay: '3s' }} />

        {/* Logo */}
        <div className="relative z-10">
          <img src={campusvoiceLogo} alt="CampusVoice.AI" className="h-10 w-auto brightness-0 invert" />
        </div>

        {/* Motivating content */}
        <div className="relative z-10 space-y-8">
          <h1 className="text-4xl xl:text-5xl font-serif font-bold leading-tight tracking-tight">
            <span className="text-white">Get Ready for</span>
            <br />
            <span
              className="inline-block relative transition-all duration-500"
              style={{
                opacity: fadeIn ? 1 : 0,
                transform: fadeIn ? 'translateY(0)' : 'translateY(12px)',
                color: currentPhrase.color,
              }}
            >
              {currentPhrase.text}
              <span
                className="absolute left-0 bottom-0 h-[3px] rounded-full transition-all duration-500"
                style={{
                  width: fadeIn ? '100%' : '0%',
                  background: `linear-gradient(90deg, ${currentPhrase.color}, ${currentPhrase.color}00)`,
                }}
              />
            </span>
          </h1>

          <div className="space-y-4">
            {VALUE_PROPS.map((prop) => (
              <div key={prop.text} className="flex items-start gap-3">
                <div
                  className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${prop.color}20` }}
                >
                  <prop.icon className="w-4 h-4" style={{ color: prop.color }} />
                </div>
                <p className="text-white/70 text-sm leading-relaxed font-sans">{prop.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between">
          <p className="text-white/25 text-sm font-sans">
            © {new Date().getFullYear()} CampusVoice.AI
          </p>
          <div className="flex gap-3">
            {['Plan', 'Strategize', 'Execute'].map((word, i) => {
              const colors = ['hsl(82 85% 55%)', 'hsl(270 70% 60%)', 'hsl(200 100% 50%)'];
              return (
                <span
                  key={word}
                  className="text-xs font-sans font-medium px-2.5 py-1 rounded-full border"
                  style={{
                    color: colors[i],
                    borderColor: `${colors[i]}40`,
                    background: `${colors[i]}10`,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background relative overflow-hidden">
        {/* Subtle orb accents */}
        <div className="absolute w-64 h-64 rounded-full blur-[100px] opacity-[0.04]" style={{ background: 'hsl(82 85% 55%)', top: '-5%', right: '-5%' }} />
        <div className="absolute w-48 h-48 rounded-full blur-[80px] opacity-[0.04]" style={{ background: 'hsl(270 70% 60%)', bottom: '-5%', left: '-5%' }} />

        <div className="w-full max-w-md space-y-8 relative z-10 overflow-y-auto max-h-[calc(100vh-3rem)]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center space-y-3">
            <img src={campusvoiceLogo} alt="CampusVoice.AI" className="h-12 w-auto mx-auto" />
            <p className="text-muted-foreground text-sm">Strategic Messaging Intelligence</p>
          </div>

          {isSubmitted ? (
            <div className="py-8 space-y-6 text-center animate-fade-in">
              <div className="mx-auto p-4 rounded-2xl bg-[hsl(82_85%_55%_/_0.1)] w-fit">
                <CheckCircle2 className="w-12 h-12 text-[hsl(82_70%_40%)]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
                  You're In the Queue
                </h2>
                <p className="text-muted-foreground">
                  We'll review your request and send login credentials to <strong className="text-foreground">{formData.email}</strong> within 24–48 hours.
                </p>
              </div>
              <Link to="/login">
                <Button variant="outline" className="mt-4 border-border/60 hover:bg-muted/50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
                  {isColleagueReferral
                    ? isSameInstitution
                      ? `Join ${institutionFromUrl || 'Your Team'}`
                      : 'Welcome Aboard'
                    : 'Start Your Journey'
                  }
                </h2>
                <p className="text-muted-foreground">
                  {isColleagueReferral
                    ? 'A colleague invited you — fill in the details below.'
                    : 'Tell us about yourself and we\'ll get you set up with CampusVoice.'
                  }
                </p>
              </div>

              {/* Error */}
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="h-12 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="h-12 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@institution.edu"
                    className="h-12 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    className="h-12 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institutionName" className="text-sm font-medium text-foreground">Institution / Company *</Label>
                  <Input
                    id="institutionName"
                    name="institutionName"
                    value={formData.institutionName}
                    onChange={handleChange}
                    placeholder="University Name"
                    className="h-12 bg-muted/30 border-border/60 focus:bg-background transition-colors"
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
                    <Label htmlFor="department" className="text-sm font-medium text-foreground">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g., Enrollment"
                      className="h-12 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-foreground">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Director"
                      className="h-12 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralSource" className="text-sm font-medium text-foreground">How did you hear about us?</Label>
                  <Select
                    value={formData.referralSource}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, referralSource: value }))}
                  >
                    <SelectTrigger className="h-12 bg-muted/30 border-border/60 focus:bg-background transition-colors">
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
                  className="w-full h-12 text-base font-semibold rounded-xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Request Access
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-accent hover:underline underline-offset-4">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
