import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KeyRound, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import campusvoiceLogo from '@/assets/campusvoice-logo.png';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRequirements = [
    { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
    { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
    { test: (p: string) => /[a-z]/.test(p), label: 'One lowercase letter' },
    { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
  ];

  const isPasswordValid = passwordRequirements.every(req => req.test(newPassword));
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setError('Please meet all password requirements');
      return;
    }

    if (!doPasswordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Your session has expired. Please request a new password reset link from the sign-in page.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        if (updateError.message.toLowerCase().includes('session') || updateError.message.toLowerCase().includes('jwt')) {
          setError('Your session has expired. Please request a new password reset link from the sign-in page.');
        } else {
          setError(updateError.message);
        }
        return;
      }

      // Update profile to mark password as changed
      const userId = user?.id ?? session.user.id;
      await supabase
        .from('profiles')
        .update({ 
          password_reset_required: false,
          status: 'active',
          last_password_reset_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (user) {
        await refreshProfile();
      }

      navigate('/dashboard');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Password change error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <img src={campusvoiceLogo} alt="CampusVoice.AI" className="h-16 w-auto mx-auto mb-4" />
        </div>

        <Card className="border-[hsl(220,13%,88%)]">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 rounded-full bg-[hsl(45,93%,47%)]/10 w-fit mb-2">
              <KeyRound className="w-6 h-6 text-[hsl(45,93%,47%)]" />
            </div>
            <CardTitle className="font-serif text-[hsl(222,47%,11%)]">Set Your Password</CardTitle>
            <CardDescription className="text-[hsl(220,14%,46%)]">
              Please create a new password to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-[hsl(222,47%,11%)]">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10 border-[hsl(220,13%,88%)]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(220,14%,46%)] hover:text-[hsl(222,47%,11%)]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[hsl(222,47%,11%)]">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-[hsl(220,13%,88%)]"
                  required
                />
              </div>

              {/* Password Requirements */}
              <div className="space-y-2 p-3 bg-[hsl(210,20%,94%)] rounded-lg">
                <p className="text-xs font-medium text-[hsl(222,47%,11%)]">Password Requirements:</p>
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 
                      className={`h-3.5 w-3.5 ${
                        req.test(newPassword) 
                          ? 'text-[hsl(158,64%,42%)]' 
                          : 'text-[hsl(220,14%,46%)]'
                      }`} 
                    />
                    <span className={req.test(newPassword) ? 'text-[hsl(158,64%,42%)]' : 'text-[hsl(220,14%,46%)]'}>
                      {req.label}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-xs mt-2 pt-2 border-t border-[hsl(220,13%,88%)]">
                  <CheckCircle2 
                    className={`h-3.5 w-3.5 ${
                      doPasswordsMatch 
                        ? 'text-[hsl(158,64%,42%)]' 
                        : 'text-[hsl(220,14%,46%)]'
                    }`} 
                  />
                  <span className={doPasswordsMatch ? 'text-[hsl(158,64%,42%)]' : 'text-[hsl(220,14%,46%)]'}>
                    Passwords match
                  </span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[hsl(222,47%,14%)] hover:bg-[hsl(222,47%,20%)] text-white"
                disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Set Password & Continue'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}