import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Lock, Mail, AlertCircle, Loader2, MailCheck, Sparkles, Shield, Brain, GraduationCap } from 'lucide-react';
import { BetaBanner } from '@/components/BetaBanner';
import uplaybookLogo from '@/assets/uplaybook-logo.png';

// Invite expiration time in hours
const INVITE_EXPIRATION_HOURS = 72;

const trustIndicators = [
  { icon: Shield, label: 'Brand Governance' },
  { icon: Brain, label: 'Research-Driven' },
  { icon: GraduationCap, label: 'Built for Higher Ed' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteResent, setInviteResent] = useState(false);

  // Check if invite has expired (created more than 72 hours ago)
  const isInviteExpired = (createdAt: string): boolean => {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursSinceCreated = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return hoursSinceCreated > INVITE_EXPIRATION_HOURS;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setInviteResent(false);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data.user) {
        // Check user status and created_at
        const { data: profile } = await supabase
          .from('profiles')
          .select('status, password_reset_required, created_at, updated_at')
          .eq('id', data.user.id)
          .single();

        if (!profile) {
          setError('Your account is not properly configured. Please contact your administrator.');
          await supabase.auth.signOut();
          return;
        }

        // Check for expired invite - use updated_at if available (reset when invite is resent), otherwise created_at
        const inviteTimestamp = profile.updated_at || profile.created_at;
        if (profile.status === 'invited' && isInviteExpired(inviteTimestamp)) {
          console.log('Invite expired, resending...');
          
          // Sign out first
          await supabase.auth.signOut();
          
          // Call edge function to resend invite
          try {
            const { data: resendData, error: resendError } = await supabase.functions.invoke('resend-invite', {
              body: { userId: data.user.id }
            });

            if (resendError) {
              console.error('Resend invite error:', resendError);
              setError('Your invitation has expired. Please contact your administrator for a new invitation.');
              return;
            }

            // Show success state
            setInviteResent(true);
            setPassword(''); // Clear the old password
            return;
          } catch (resendErr) {
            console.error('Resend invite error:', resendErr);
            setError('Your invitation has expired. Please contact your administrator for a new invitation.');
            return;
          }
        }

        if (profile.status === 'locked') {
          setError('Your account has been locked. Please contact your administrator.');
          await supabase.auth.signOut();
          return;
        }

        if (profile.status === 'disabled') {
          setError('Your account has been disabled. Please contact your administrator.');
          await supabase.auth.signOut();
          return;
        }

        if (profile.status === 'pending') {
          setError('Your account is pending approval. Please wait for an administrator to activate your account.');
          await supabase.auth.signOut();
          return;
        }

        // Redirect based on password reset requirement
        if (profile.password_reset_required) {
          navigate('/change-password');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email, then click "Forgot password?".');
      return;
    }

    setIsResetting(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/change-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      toast({
        title: 'Password reset email sent',
        description: 'Check your inbox for the reset link.',
      });
    } catch (err) {
      setError('Unable to send reset email. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Beta Banner at top */}
      <BetaBanner variant="compact" />
      
      {/* Main Content with Landing Page Style Background */}
      <div className="flex-1 relative overflow-hidden">
        {/* Gradient background matching landing page */}
        <div className="absolute inset-0 bg-zone-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(200_70%_90%_/_0.4),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(173_58%_85%_/_0.3),_transparent_50%)]" />
        
        {/* Lens flares */}
        <div className="absolute top-20 right-[12%] w-32 h-32 bg-[hsl(270_70%_60%_/_0.12)] rounded-full blur-2xl" />
        <div className="absolute bottom-36 left-[8%] w-40 h-40 bg-[hsl(82_85%_55%_/_0.1)] rounded-full blur-3xl" />
        <div className="absolute top-44 left-[22%] w-24 h-24 bg-[hsl(200_100%_50%_/_0.1)] rounded-full blur-2xl" />
        
        <div className="relative flex items-center justify-center min-h-full p-4 py-12">
          <div className="w-full max-w-md space-y-6 animate-fade-in">
            {/* Logo & Tagline */}
            <div className="text-center">
              <img src={uplaybookLogo} alt="CampusVoice.AI" className="h-14 w-auto mx-auto mb-4" />
              <h1 className="font-serif text-xl text-foreground mb-2">
                <span className="text-[hsl(82_85%_45%)]">Plan.</span>{' '}
                <span className="text-[hsl(270_70%_55%)]">Strategize.</span>{' '}
                <span className="text-[hsl(200_100%_45%)]">Execute.</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Strategic Messaging Intelligence for Higher Education
              </p>
            </div>

            {/* Login Card */}
            <Card className="border-border/60 shadow-lg bg-card/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto p-3 rounded-xl bg-primary/10 w-fit mb-2">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-serif text-foreground">Sign In</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Enter your credentials to access CampusVoice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  {inviteResent ? (
                    <Alert className="bg-status-strong/10 border-status-strong/30">
                      <MailCheck className="h-4 w-4 text-status-strong" />
                      <AlertDescription className="text-foreground">
                        <strong>New credentials sent!</strong> Your previous invitation expired for security reasons. 
                        We've sent a fresh login email to <strong>{email}</strong>. Please check your inbox and use the new temporary password.
                      </AlertDescription>
                    </Alert>
                  ) : error ? (
                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@institution.edu"
                        className="pl-10 border-border"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10 border-border"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={handleForgotPassword}
                        disabled={isLoading || isResetting}
                        className="px-0 text-muted-foreground hover:text-primary"
                      >
                        {isResetting ? 'Sending reset link…' : 'Forgot password?'}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link to="/request-access" className="text-accent hover:underline font-medium">
                      Request Access
                    </Link>
                  </p>
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

            <p className="text-center text-xs text-muted-foreground">
              © 2025 CampusVoice.AI. Research-grounded messaging intelligence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}