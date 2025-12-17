import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building2, 
  Mail, 
  Phone,
  Briefcase,
  Save,
  Loader2,
  Home,
  ChevronLeft
} from 'lucide-react';

export default function ProfilePage() {
  const { profile, tenant, role, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone: profile?.phone || '',
    department: profile?.department || '',
    title: profile?.title || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          phone: formData.phone || null,
          department: formData.department || null,
          title: formData.title || null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      setIsEditing(false);
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[hsl(210,20%,98%)] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[hsl(220,14%,46%)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]">
      {/* Header */}
      <div className="border-b border-[hsl(220,13%,88%)] bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-[hsl(220,14%,46%)] hover:text-[hsl(222,47%,11%)]">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-sm text-[hsl(220,14%,46%)]">
                <Link to="/" className="hover:text-[hsl(222,47%,11%)]">
                  <Home className="w-4 h-4" />
                </Link>
                <span>/</span>
                <span className="text-[hsl(222,47%,11%)]">Profile</span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-[hsl(222,47%,11%)]">My Profile</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Profile Header Card */}
        <Card className="mb-6 border-[hsl(220,13%,88%)]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[hsl(222,47%,14%)] flex items-center justify-center text-white text-xl font-bold">
                {profile.first_name[0]}{profile.last_name[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[hsl(222,47%,11%)]">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-[hsl(220,14%,46%)]">{profile.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {tenant?.institution_name}
                  </Badge>
                  <Badge className={role === 'admin' ? 'bg-[hsl(222,47%,14%)]' : 'bg-[hsl(173,58%,39%)]'}>
                    {role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="border-[hsl(220,13%,88%)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-[hsl(222,47%,11%)]">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-[hsl(220,14%,46%)]">
                Update your contact and professional details
              </CardDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Read-only fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[hsl(220,14%,46%)]">First Name</Label>
                <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(210,20%,94%)] rounded-md">
                  <User className="w-4 h-4 text-[hsl(220,14%,46%)]" />
                  <span className="text-[hsl(222,47%,11%)]">{profile.first_name}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[hsl(220,14%,46%)]">Last Name</Label>
                <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(210,20%,94%)] rounded-md">
                  <User className="w-4 h-4 text-[hsl(220,14%,46%)]" />
                  <span className="text-[hsl(222,47%,11%)]">{profile.last_name}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[hsl(220,14%,46%)]">Email</Label>
              <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(210,20%,94%)] rounded-md">
                <Mail className="w-4 h-4 text-[hsl(220,14%,46%)]" />
                <span className="text-[hsl(222,47%,11%)]">{profile.email}</span>
              </div>
              <p className="text-xs text-[hsl(220,14%,46%)]">Contact your administrator to change your email</p>
            </div>

            {/* Editable fields */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[hsl(222,47%,11%)]">Phone</Label>
              {isEditing ? (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(220,14%,46%)]" />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    className="pl-10 border-[hsl(220,13%,88%)]"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(210,20%,94%)] rounded-md">
                  <Phone className="w-4 h-4 text-[hsl(220,14%,46%)]" />
                  <span className="text-[hsl(222,47%,11%)]">{profile.phone || '—'}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department" className="text-[hsl(222,47%,11%)]">Department</Label>
                {isEditing ? (
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g., Enrollment"
                    className="border-[hsl(220,13%,88%)]"
                  />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(210,20%,94%)] rounded-md">
                    <Briefcase className="w-4 h-4 text-[hsl(220,14%,46%)]" />
                    <span className="text-[hsl(222,47%,11%)]">{profile.department || '—'}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[hsl(222,47%,11%)]">Title</Label>
                {isEditing ? (
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Director"
                    className="border-[hsl(220,13%,88%)]"
                  />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(210,20%,94%)] rounded-md">
                    <Briefcase className="w-4 h-4 text-[hsl(220,14%,46%)]" />
                    <span className="text-[hsl(222,47%,11%)]">{profile.title || '—'}</span>
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3 pt-4 border-t border-[hsl(220,13%,88%)]">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      phone: profile.phone || '',
                      department: profile.department || '',
                      title: profile.title || '',
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[hsl(222,47%,14%)] hover:bg-[hsl(222,47%,20%)]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}