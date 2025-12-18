import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import uplaybookLogo from '@/assets/persist-logo.png';

export default function RequestAccessPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    institutionName: '',
    department: '',
    title: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          request_status: 'submitted',
        });

      if (insertError) {
        if (insertError.message.includes('duplicate')) {
          setError('An access request with this email already exists. Please contact your administrator.');
        } else {
          setError('Failed to submit request. Please try again.');
        }
        return;
      }

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
      <div className="min-h-screen bg-[hsl(210,20%,98%)] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <img src={uplaybookLogo} alt="UPlaybook.AI" className="h-16 w-auto mx-auto mb-4" />
          </div>

          <Card className="border-[hsl(220,13%,88%)]">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className="mx-auto p-4 rounded-full bg-[hsl(158,64%,42%)]/10 w-fit">
                <CheckCircle2 className="w-12 h-12 text-[hsl(158,64%,42%)]" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[hsl(222,47%,11%)]">
                Request Submitted
              </h2>
              <p className="text-[hsl(220,14%,46%)]">
                Thank you for your interest in PERSIST. An administrator will review your request and activate your account.
              </p>
              <p className="text-sm text-[hsl(220,14%,46%)]">
                You will receive your login credentials once approved.
              </p>
              <Link to="/login">
                <Button variant="outline" className="mt-4 border-[hsl(220,13%,88%)]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <img src={uplaybookLogo} alt="UPlaybook.AI" className="h-16 w-auto mx-auto mb-4" />
          <p className="text-[hsl(220,14%,46%)]">
            Strategic Messaging Intelligence for Higher Education
          </p>
        </div>

        <Card className="border-[hsl(220,13%,88%)]">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 rounded-full bg-[hsl(173,58%,39%)]/10 w-fit mb-2">
              <UserPlus className="w-6 h-6 text-[hsl(173,58%,39%)]" />
            </div>
            <CardTitle className="font-serif text-[hsl(222,47%,11%)]">Request Access</CardTitle>
            <CardDescription className="text-[hsl(220,14%,46%)]">
              Fill out the form below to request access to PERSIST
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[hsl(222,47%,11%)]">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="border-[hsl(220,13%,88%)]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[hsl(222,47%,11%)]">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="border-[hsl(220,13%,88%)]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[hsl(222,47%,11%)]">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@institution.edu"
                  className="border-[hsl(220,13%,88%)]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[hsl(222,47%,11%)]">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className="border-[hsl(220,13%,88%)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institutionName" className="text-[hsl(222,47%,11%)]">Institution Name *</Label>
                <Input
                  id="institutionName"
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={handleChange}
                  placeholder="University Name"
                  className="border-[hsl(220,13%,88%)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-[hsl(222,47%,11%)]">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g., Enrollment"
                    className="border-[hsl(220,13%,88%)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[hsl(222,47%,11%)]">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Director"
                    className="border-[hsl(220,13%,88%)]"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[hsl(173,58%,39%)] hover:bg-[hsl(173,58%,35%)] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-[hsl(220,14%,46%)] hover:text-[hsl(173,58%,39%)]">
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}