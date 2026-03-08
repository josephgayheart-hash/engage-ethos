import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Mail, AlertCircle, Loader2, MailCheck, ArrowRight } from 'lucide-react';
import campusvoiceLogo from '@/assets/campusvoice-logo.png';

// Invite expiration time in hours
const INVITE_EXPIRATION_HOURS = 72;

const WELCOME_PHRASES = [
  { text: "Firms", color: "hsl(82 85% 55%)" },
  { text: "Brands", color: "hsl(270 70% 60%)" },
  { text: "Planners", color: "hsl(200 100% 50%)" },
  { text: "Writers", color: "hsl(82 85% 55%)" },
  { text: "Marketers", color: "hsl(270 70% 60%)" },
  { text: "Storytellers", color: "hsl(200 100% 50%)" },
  { text: "Designers", color: "hsl(82 85% 55%)" },
  { text: "Higher Education", color: "hsl(270 70% 60%)" },
  { text: "Strategists", color: "hsl(82 85% 55%)" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteResent, setInviteResent] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(() => Math.floor(Math.random() * WELCOME_PHRASES.length));
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setPhraseIndex(prev => (prev + 1) % WELCOME_PHRASES.length);
        setFadeIn(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentPhrase = WELCOME_PHRASES[phraseIndex];

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      setError("Google sign-in failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

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
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError(authError.message.includes('Invalid login credentials')
          ? 'Invalid email or password. Please try again.'
          : authError.message);
        return;
      }

      if (data.user) {
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

        const inviteTimestamp = profile.updated_at || profile.created_at;
        if (profile.status === 'invited' && isInviteExpired(inviteTimestamp)) {
          await supabase.auth.signOut();
          try {
            const { error: resendError } = await supabase.functions.invoke('resend-invite', {
              body: { userId: data.user.id }
            });
            if (resendError) {
              setError('Your invitation has expired. Please contact your administrator for a new invitation.');
              return;
            }
            setInviteResent(true);
            setPassword('');
            return;
          } catch {
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

        navigate(profile.password_reset_required ? '/change-password' : '/dashboard');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
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
      if (resetError) { setError(resetError.message); return; }
      toast({ title: 'Password reset email sent', description: 'Check your inbox for the reset link.' });
    } catch {
      setError('Unable to send reset email. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left branded panel — colorful orbs & rotating messages */}
      <div
        className="hidden lg:flex lg:w-[48%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: 'linear-gradient(145deg, hsl(222, 47%, 11%) 0%, hsl(222, 47%, 16%) 40%, hsl(222, 47%, 13%) 100%)',
        }}
      >
        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Animated floating orbs — CampusVoice color burst */}
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

        {/* Rotating motivational message */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl xl:text-5xl font-serif font-bold leading-tight tracking-tight">
            <span className="text-white">Built for</span>
            <br />
            <span
              className="inline-block transition-all duration-500"
              style={{
                opacity: fadeIn ? 1 : 0,
                transform: fadeIn ? 'translateY(0)' : 'translateY(12px)',
                color: currentPhrase.color,
              }}
            >
              {currentPhrase.text}.
            </span>
          </h1>
          <p className="text-white/50 text-lg max-w-md leading-relaxed font-sans">
            Strategic Messaging Intelligence — plan, build, and evaluate communications that resonate.
          </p>
        </div>

        {/* Bottom footer */}
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
        {/* Subtle orb accents on right panel too */}
        <div className="absolute w-64 h-64 rounded-full blur-[100px] opacity-[0.04]" style={{ background: 'hsl(82 85% 55%)', top: '-5%', right: '-5%' }} />
        <div className="absolute w-48 h-48 rounded-full blur-[80px] opacity-[0.04]" style={{ background: 'hsl(270 70% 60%)', bottom: '-5%', left: '-5%' }} />

        <div className="w-full max-w-md space-y-8 relative z-10">
          {/* Mobile logo + tagline */}
          <div className="lg:hidden text-center space-y-3">
            <img src={campusvoiceLogo} alt="CampusVoice.AI" className="h-12 w-auto mx-auto" />
            <p className="text-muted-foreground text-sm">Strategic Messaging Intelligence</p>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
              Welcome Back
            </h2>
            <p className="text-muted-foreground">
              Sign in to your CampusVoice account
            </p>
          </div>

          {/* Alerts */}
          {inviteResent ? (
            <Alert className="bg-[hsl(158_64%_42%_/_0.1)] border-[hsl(158_64%_42%_/_0.3)]">
              <MailCheck className="h-4 w-4" style={{ color: 'hsl(158, 64%, 42%)' }} />
              <AlertDescription className="text-foreground">
                <strong>New credentials sent!</strong> Your previous invitation expired. We've sent a fresh login email to <strong>{email}</strong>.
              </AlertDescription>
            </Alert>
          ) : error ? (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {/* Google Sign-In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border-border/60 hover:bg-muted/50 text-foreground font-medium"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">or sign in with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@institution.edu"
                  className="pl-10 h-12 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading || isResetting}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {isResetting ? 'Sending reset link…' : 'Forgot password?'}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold rounded-xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/request-access" className="font-medium text-accent hover:underline underline-offset-4">
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
