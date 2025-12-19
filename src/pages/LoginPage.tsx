import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Mail, AlertCircle, Loader2, MailCheck } from 'lucide-react';
import { BetaBanner } from '@/components/BetaBanner';
import uplaybookLogo from '@/assets/uplaybook-logo.png';

// Invite expiration time in hours
const INVITE_EXPIRATION_HOURS = 72;

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
      setError('Enter your email, then click “Forgot password?”.');
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
    <div className="min-h-screen bg-[hsl(210,20%,98%)] flex flex-col">
      {/* Beta Banner at top */}
      <BetaBanner variant="compact" />
      
      <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <img src={uplaybookLogo} alt="UPlaybook.AI" className="h-16 w-auto mx-auto mb-4" />
          <p className="text-[hsl(220,14%,46%)]">
            Strategic Messaging Intelligence for Higher Education
          </p>
        </div>

        <Card className="border-[hsl(220,13%,88%)]">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 rounded-full bg-[hsl(222,47%,14%)]/10 w-fit mb-2">
              <Lock className="w-6 h-6 text-[hsl(222,47%,14%)]" />
            </div>
            <CardTitle className="font-serif text-[hsl(222,47%,11%)]">Sign In</CardTitle>
            <CardDescription className="text-[hsl(220,14%,46%)]">
              Enter your credentials to access UPlaybook
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
            {inviteResent ? (
              <Alert className="bg-emerald-50 border-emerald-200">
                <MailCheck className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800">
                  <strong>New credentials sent!</strong> Your previous invitation expired for security reasons. 
                  We've sent a fresh login email to <strong>{email}</strong>. Please check your inbox and use the new temporary password.
                </AlertDescription>
              </Alert>
            ) : error ? (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[hsl(222,47%,11%)]">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(220,14%,46%)]" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@institution.edu"
                    className="pl-10 border-[hsl(220,13%,88%)]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[hsl(222,47%,11%)]">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(220,14%,46%)]" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 border-[hsl(220,13%,88%)]"
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
                    className="px-0"
                  >
                    {isResetting ? 'Sending reset link…' : 'Forgot password?'}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[hsl(222,47%,14%)] hover:bg-[hsl(222,47%,20%)] text-white"
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
              <p className="text-sm text-[hsl(220,14%,46%)]">
                Don't have an account?{' '}
                <Link to="/request-access" className="text-[hsl(173,58%,39%)] hover:underline font-medium">
                  Request Access
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[hsl(220,14%,46%)]">
          © 2025 UPlaybook.AI. Research-grounded messaging intelligence.
        </p>
      </div>
      </div>
    </div>
  );
}