import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  UserCheck,
  UserX,
  Clock,
  ExternalLink,
  TrendingUp,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import type { TenantHealthScore } from '@/hooks/useAdminAnalytics';

interface UniversityUsersPanelProps {
  tenantHealth?: TenantHealthScore;
  isLoading?: boolean;
}

interface UserData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  status: string;
  last_login_at: string | null;
  created_at: string;
}

export function UniversityUsersPanel({ tenantHealth, isLoading }: UniversityUsersPanelProps) {
  const { tenant } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!tenant?.id) return;
      
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, status, last_login_at, created_at')
        .eq('tenant_id', tenant.id)
        .order('last_login_at', { ascending: false, nullsFirst: false });

      if (!error && data) {
        setUsers(data);
      }
      setLoadingUsers(false);
    };

    fetchUsers();
  }, [tenant?.id]);

  if (isLoading || loadingUsers) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-40" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalUsers = tenantHealth?.total_users || users.length;
  const activeUsers = tenantHealth?.active_users_30d || 0;
  const adoptionRate = tenantHealth?.user_adoption_rate || 0;

  // Categorize users
  const now = new Date();
  const days7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const days30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentlyActive = users.filter(u => u.last_login_at && new Date(u.last_login_at) > days7Ago);
  const moderatelyActive = users.filter(u => 
    u.last_login_at && 
    new Date(u.last_login_at) <= days7Ago && 
    new Date(u.last_login_at) > days30Ago
  );
  const inactive = users.filter(u => 
    !u.last_login_at || new Date(u.last_login_at) <= days30Ago
  );

  const getStatusBadge = (user: UserData) => {
    if (!user.last_login_at) {
      return <Badge variant="outline" className="text-muted-foreground">Never logged in</Badge>;
    }
    const lastLogin = new Date(user.last_login_at);
    if (lastLogin > days7Ago) {
      return <Badge className="bg-green-100 text-green-700">Active</Badge>;
    }
    if (lastLogin > days30Ago) {
      return <Badge className="bg-amber-100 text-amber-700">Moderate</Badge>;
    }
    return <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recentlyActive.length}</p>
                <p className="text-xs text-muted-foreground">Active (7d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{moderatelyActive.length}</p>
                <p className="text-xs text-muted-foreground">Moderate (7-30d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <UserX className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inactive.length}</p>
                <p className="text-xs text-muted-foreground">Inactive (30d+)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Adoption Rate */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            User Adoption Rate
          </CardTitle>
          <CardDescription>
            Percentage of users who have logged in within the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{adoptionRate}%</span>
              <span className="text-sm text-muted-foreground">
                {activeUsers} of {totalUsers} users active
              </span>
            </div>
            <Progress value={adoptionRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {adoptionRate >= 70 ? 'Excellent adoption rate!' : 
               adoptionRate >= 40 ? 'Room for improvement' : 
               'Consider re-engagement campaigns'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              User Activity
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/users">
                View All
                <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {users.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {(user.first_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user.email || 'Unknown User'}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {user.last_login_at 
                          ? formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true })
                          : 'Never'}
                      </p>
                    </div>
                    {getStatusBadge(user)}
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
