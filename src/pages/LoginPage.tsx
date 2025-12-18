import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { BetaBanner } from '@/components/BetaBanner';
import uplaybookLogo from '@/assets/persist-logo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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
        // Check user status
        const { data: profile } = await supabase
          .from('profiles')
          .select('status, password_reset_required')
          .eq('id', data.user.id)
          .single();

        if (!profile) {
          setError('Your account is not properly configured. Please contact your administrator.');
          await supabase.auth.signOut();
          return;
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
          navigate('/');
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
              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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
          © 2024 UPlaybook.AI. Research-grounded messaging intelligence.
        </p>
      </div>
      </div>
    </div>
  );
}