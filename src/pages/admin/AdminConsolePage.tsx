import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Shield,
  Home,
  ChevronRight,
  Building2,
  Activity,
  Clock,
  Library,
  TrendingUp,
  Loader2,
  Save,
  Pencil,
  X
} from 'lucide-react';

interface UserStats {
  total: number;
  active: number;
  pending: number;
  recentLogins: number;
}

interface OnboardingStats {
  pending: number;
  approved: number;
  rejected: number;
}

export default function AdminConsolePage() {
  const { tenant, profile, isSuperAdmin, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [userStats, setUserStats] = useState<UserStats>({ total: 0, active: 0, pending: 0, recentLogins: 0 });
  const [onboardingStats, setOnboardingStats] = useState<OnboardingStats>({ pending: 0, approved: 0, rejected: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Institution editing state
  const [isEditingInstitution, setIsEditingInstitution] = useState(false);
  const [institutionName, setInstitutionName] = useState('');
  const [isSavingInstitution, setIsSavingInstitution] = useState(false);

  useEffect(() => {
    if (tenant?.institution_name) {
      setInstitutionName(tenant.institution_name);
    }
  }, [tenant?.institution_name]);

  const handleSaveInstitution = async () => {
    if (!tenant?.id || !institutionName.trim()) return;
    
    setIsSavingInstitution(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ institution_name: institutionName.trim() })
        .eq('id', tenant.id);

      if (error) throw error;

      await refreshProfile();
      setIsEditingInstitution(false);
      
      toast({
        title: 'Institution Updated',
        description: 'Your institution name has been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update institution name',
        variant: 'destructive',
      });
    } finally {
      setIsSavingInstitution(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!tenant?.id) return;
      
      try {
        // Fetch users in tenant
        const { data: users } = await supabase
          .from('profiles')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('last_login_at', { ascending: false });

        if (users) {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          
          setUserStats({
            total: users.length,
            active: users.filter(u => u.status === 'active').length,
            pending: users.filter(u => u.status === 'pending' || u.status === 'invited').length,
            recentLogins: users.filter(u => u.last_login_at && new Date(u.last_login_at) > weekAgo).length
          });
          setRecentUsers(users.slice(0, 5));
        }

        // Fetch onboarding requests (only for super admins)
        if (isSuperAdmin) {
          const { data: requests } = await supabase
            .from('onboarding_requests')
            .select('request_status');

          if (requests) {
            setOnboardingStats({
              pending: requests.filter(r => r.request_status === 'submitted').length,
              approved: requests.filter(r => r.request_status === 'approved').length,
              rejected: requests.filter(r => r.request_status === 'rejected').length
            });
          }
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [tenant?.id, isSuperAdmin]);

  const formatLastLogin = (date: string | null) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const adminLinks = [
    {
      title: 'User Management',
      description: isSuperAdmin ? 'Create, edit, and manage user accounts' : 'View users in your institution',
      icon: Users,
      href: '/admin/users',
      color: 'bg-[hsl(222,47%,14%)]',
      stat: `${userStats.total} users`
    },
    // Only show onboarding requests to super admins
    ...(isSuperAdmin ? [{
      title: 'Onboarding Requests',
      description: 'Review and approve access requests',
      icon: UserPlus,
      href: '/admin/onboarding',
      color: 'bg-[hsl(173,58%,39%)]',
      stat: onboardingStats.pending > 0 ? `${onboardingStats.pending} pending` : 'No pending'
    }] : []),
    {
      title: 'Library Approvals',
      description: 'Review submitted templates and playbooks',
      icon: Library,
      href: '/approvals',
      color: 'bg-[hsl(45,93%,47%)]',
      stat: 'Review queue'
    },
    {
      title: 'Institution Settings',
      description: 'Configure voice, lexicon, and branding',
      icon: Settings,
      href: '/settings',
      color: 'bg-[hsl(262,52%,47%)]',
      stat: 'Configuration'
    },
  ];

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]">
      {/* Header */}
      <div className="border-b border-[hsl(220,13%,88%)] bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-[hsl(220,14%,46%)] mb-2">
            <Link to="/" className="hover:text-[hsl(222,47%,11%)]">
              <Home className="w-4 h-4" />
            </Link>
            <span>/</span>
            <span className="text-[hsl(222,47%,11%)]">Institution Admin</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-[hsl(222,47%,11%)]">Institution Admin</h1>
              <p className="text-[hsl(220,14%,46%)]">Manage your institution's PERSIST settings</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {tenant?.institution_name || 'Loading...'}
              </Badge>
              <Badge className="bg-[hsl(222,47%,14%)]">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Card */}
        <Card className="mb-6 border-[hsl(220,13%,88%)] bg-gradient-to-r from-[hsl(222,47%,14%)] to-[hsl(222,47%,20%)] text-white">
          <CardContent className="py-6">
            <h2 className="font-serif text-xl font-bold mb-2">
              Welcome, {profile?.first_name}
            </h2>
            <p className="text-white/80">
              As an administrator for {tenant?.institution_name || 'your institution'}, you can manage users, 
              review access requests, and configure institutional settings.
            </p>
          </CardContent>
        </Card>

        {/* Institution Branding */}
        <Card className="mb-6 border-[hsl(220,13%,88%)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-[hsl(222,47%,11%)]">
                  <Building2 className="w-5 h-5" />
                  Institution Branding
                </CardTitle>
                <CardDescription>Manage your institution's name and identity</CardDescription>
              </div>
              {!isEditingInstitution && (
                <Button variant="outline" size="sm" onClick={() => setIsEditingInstitution(true)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditingInstitution ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="institutionName">Institution Name</Label>
                  <Input
                    id="institutionName"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="Enter institution name"
                    className="max-w-md"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveInstitution} 
                    disabled={isSavingInstitution || !institutionName.trim()}
                    className="bg-[hsl(222,47%,14%)] hover:bg-[hsl(222,47%,20%)]"
                  >
                    {isSavingInstitution ? (
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
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditingInstitution(false);
                      setInstitutionName(tenant?.institution_name || '');
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[hsl(222,47%,14%)]/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-[hsl(222,47%,14%)]" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-[hsl(222,47%,11%)]">
                    {tenant?.institution_name || 'Loading...'}
                  </p>
                  <p className="text-sm text-[hsl(220,14%,46%)]">Your institution's display name</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className={`grid grid-cols-2 ${isSuperAdmin ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4 mb-6`}>
          <Card className="border-[hsl(220,13%,88%)]">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[hsl(222,47%,14%)]/10">
                  <Users className="w-5 h-5 text-[hsl(222,47%,14%)]" />
                </div>
                <div>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[hsl(220,14%,46%)]" />
                  ) : (
                    <p className="text-2xl font-bold text-[hsl(222,47%,11%)]">{userStats.total}</p>
                  )}
                  <p className="text-xs text-[hsl(220,14%,46%)]">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[hsl(220,13%,88%)]">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[hsl(158,64%,42%)]/10">
                  <Activity className="w-5 h-5 text-[hsl(158,64%,42%)]" />
                </div>
                <div>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[hsl(220,14%,46%)]" />
                  ) : (
                    <p className="text-2xl font-bold text-[hsl(222,47%,11%)]">{userStats.active}</p>
                  )}
                  <p className="text-xs text-[hsl(220,14%,46%)]">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {isSuperAdmin && (
            <Card className="border-[hsl(220,13%,88%)]">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[hsl(173,58%,39%)]/10">
                    <UserPlus className="w-5 h-5 text-[hsl(173,58%,39%)]" />
                  </div>
                  <div>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[hsl(220,14%,46%)]" />
                    ) : (
                      <p className="text-2xl font-bold text-[hsl(222,47%,11%)]">{onboardingStats.pending}</p>
                    )}
                    <p className="text-xs text-[hsl(220,14%,46%)]">Pending Requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="border-[hsl(220,13%,88%)]">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[hsl(45,93%,47%)]/10">
                  <TrendingUp className="w-5 h-5 text-[hsl(45,93%,47%)]" />
                </div>
                <div>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[hsl(220,14%,46%)]" />
                  ) : (
                    <p className="text-2xl font-bold text-[hsl(222,47%,11%)]">{userStats.recentLogins}</p>
                  )}
                  <p className="text-xs text-[hsl(220,14%,46%)]">Active This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Admin Links */}
          <div className="md:col-span-2">
            <h2 className="font-serif text-lg font-semibold text-[hsl(222,47%,11%)] mb-4">Administration</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {adminLinks.map((link) => (
                <Link key={link.href} to={link.href}>
                  <Card className="h-full border-[hsl(220,13%,88%)] hover:shadow-md transition-shadow cursor-pointer group">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className={`p-2.5 rounded-lg ${link.color} text-white`}>
                          <link.icon className="w-5 h-5" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-[hsl(220,14%,46%)] group-hover:text-[hsl(222,47%,11%)] transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardTitle className="text-base mb-1 text-[hsl(222,47%,11%)]">{link.title}</CardTitle>
                      <CardDescription className="text-xs text-[hsl(220,14%,46%)] mb-2">{link.description}</CardDescription>
                      <Badge variant="secondary" className="text-xs">{link.stat}</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="font-serif text-lg font-semibold text-[hsl(222,47%,11%)] mb-4">Recent Users</h2>
            <Card className="border-[hsl(220,13%,88%)]">
              <CardContent className="pt-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[hsl(220,14%,46%)]" />
                  </div>
                ) : recentUsers.length === 0 ? (
                  <div className="text-center py-8 text-[hsl(220,14%,46%)]">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No users yet</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[280px]">
                    <div className="space-y-3">
                      {recentUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[hsl(210,20%,94%)] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[hsl(222,47%,14%)] flex items-center justify-center text-white text-xs font-medium">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[hsl(222,47%,11%)]">
                                {user.first_name} {user.last_name}
                              </p>
                              <p className="text-xs text-[hsl(220,14%,46%)]">{user.department || 'No department'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={user.status === 'active' ? 'default' : 'secondary'}
                              className={`text-xs ${user.status === 'active' ? 'bg-[hsl(158,64%,42%)]' : ''}`}
                            >
                              {user.status}
                            </Badge>
                            <p className="text-xs text-[hsl(220,14%,46%)] mt-1 flex items-center gap-1 justify-end">
                              <Clock className="w-3 h-3" />
                              {formatLastLogin(user.last_login_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
