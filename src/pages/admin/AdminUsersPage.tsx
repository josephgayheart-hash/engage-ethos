import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserProfile, UserStatus } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical, 
  KeyRound, 
  Lock, 
  Unlock,
  UserX,
  Loader2,
  Copy,
  ChevronLeft,
  Home
} from 'lucide-react';

type RoleType = 'admin' | 'user' | 'approver' | 'super_admin';

interface UserWithRole extends UserProfile {
  roles: RoleType[];
}

export default function AdminUsersPage() {
  const { tenant, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Create user dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    title: '',
    role: 'user' as 'user' | 'user_approver' | 'super_admin',
  });

  // Credentials dialog
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  // Reset password dialog
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) throw profileError;

      // Fetch all roles for users
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Group roles by user_id
      const rolesByUser: Record<string, RoleType[]> = {};
      roles?.forEach(r => {
        if (!rolesByUser[r.user_id]) {
          rolesByUser[r.user_id] = [];
        }
        rolesByUser[r.user_id].push(r.role as RoleType);
      });

      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => ({
        ...profile,
        roles: rolesByUser[profile.id] || ['user'],
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCreateUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    const tempPassword = generatePassword();

    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'create_user',
          email: newUser.email,
          password: tempPassword,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phone: newUser.phone || null,
          department: newUser.department || null,
          title: newUser.title || null,
          role: newUser.role,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setShowCreateDialog(false);
      setCredentials({ email: newUser.email, password: tempPassword });
      setShowCredentialsDialog(true);
      
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        title: '',
        role: 'user',
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetUserId) return;

    const newPassword = generatePassword();

    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'reset_password',
          userId: resetUserId,
          newPassword,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const user = users.find(u => u.id === resetUserId);
      setShowResetDialog(false);
      setResetUserId(null);
      
      setCredentials({ email: user?.email || '', password: newPassword });
      setShowCredentialsDialog(true);

      toast({
        title: 'Password Reset',
        description: 'New temporary password generated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (userId: string, status: UserStatus) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'update_user_status',
          userId,
          status,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Status Updated',
        description: `User status changed to ${status}`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  const getStatusBadge = (status: UserStatus) => {
    const variants: Record<UserStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      active: { variant: 'default', className: 'bg-[hsl(158,64%,42%)] text-white' },
      invited: { variant: 'secondary', className: 'bg-[hsl(45,93%,47%)] text-[hsl(222,47%,11%)]' },
      pending: { variant: 'outline', className: 'border-[hsl(220,13%,88%)]' },
      locked: { variant: 'destructive', className: '' },
      disabled: { variant: 'secondary', className: 'bg-[hsl(220,14%,46%)] text-white' },
    };
    return <Badge className={variants[status].className}>{status}</Badge>;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.department?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]">
      {/* Header */}
      <div className="border-b border-[hsl(220,13%,88%)] bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              to={isSuperAdmin ? "/admin/panel" : "/admin/console"} 
              className="text-[hsl(220,14%,46%)] hover:text-[hsl(222,47%,11%)]"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-sm text-[hsl(220,14%,46%)]">
                <Link to="/" className="hover:text-[hsl(222,47%,11%)]">
                  <Home className="w-4 h-4" />
                </Link>
                <span>/</span>
                <Link 
                  to={isSuperAdmin ? "/admin/panel" : "/admin/console"} 
                  className="hover:text-[hsl(222,47%,11%)]"
                >
                  {isSuperAdmin ? "Super Admin" : "Admin"}
                </Link>
                <span>/</span>
                <span className="text-[hsl(222,47%,11%)]">Users</span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-[hsl(222,47%,11%)]">User Management</h1>
              <p className="text-sm text-[hsl(220,14%,46%)]">
                {isSuperAdmin ? 'Manage all user accounts across institutions' : 'View users in your institution (read-only)'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card className="border-[hsl(220,13%,88%)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[hsl(222,47%,11%)]">
              <Users className="w-5 h-5" />
              Users
              {tenant && (
                <Badge variant="outline" className="ml-2 font-normal">
                  {tenant.institution_name}
                </Badge>
              )}
            </CardTitle>
            {isSuperAdmin && (
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-[hsl(222,47%,14%)] hover:bg-[hsl(222,47%,20%)]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(220,14%,46%)]" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-[hsl(220,13%,88%)]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-[hsl(220,13%,88%)]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[hsl(220,14%,46%)]" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    {isSuperAdmin && <TableHead className="w-12"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                        {user.title && (
                          <span className="block text-xs text-[hsl(220,14%,46%)]">{user.title}</span>
                        )}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.department || '—'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.roles.includes('super_admin') ? (
                            <Badge className="bg-[hsl(280,60%,45%)] text-white">Persist Super Admin</Badge>
                          ) : user.roles.includes('admin') ? (
                            <Badge className="bg-[hsl(222,47%,14%)] text-white">University Admin</Badge>
                          ) : user.roles.includes('approver') ? (
                            <Badge className="bg-[hsl(173,58%,39%)] text-white">University User + Approver</Badge>
                          ) : (
                            <Badge variant="outline">University User</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.last_login_at 
                          ? new Date(user.last_login_at).toLocaleDateString() + ' ' + new Date(user.last_login_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                          : 'Never'}
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setResetUserId(user.id);
                                setShowResetDialog(true);
                              }}>
                                <KeyRound className="w-4 h-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.status !== 'locked' ? (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(user.id, 'locked')}>
                                  <Lock className="w-4 h-4 mr-2" />
                                  Lock Account
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(user.id, 'active')}>
                                  <Unlock className="w-4 h-4 mr-2" />
                                  Unlock Account
                                </DropdownMenuItem>
                              )}
                              {user.status !== 'disabled' && (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(user.id, 'disabled')}
                                  className="text-red-600"
                                >
                                  <UserX className="w-4 h-4 mr-2" />
                                  Disable Account
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={isSuperAdmin ? 7 : 6} className="text-center py-8 text-[hsl(220,14%,46%)]">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to {tenant?.institution_name}. They will receive temporary credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newUser.phone}
                onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={newUser.department}
                  onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newUser.title}
                  onChange={(e) => setNewUser(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={newUser.role} 
                onValueChange={(value: 'user' | 'user_approver' | 'super_admin') => setNewUser(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">University User</SelectItem>
                  <SelectItem value="user_approver">University User + Approver</SelectItem>
                  {isSuperAdmin && (
                    <SelectItem value="super_admin">Persist Super Admin</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {newUser.role === 'super_admin' 
                  ? 'Full access to all institutions and system settings.'
                  : 'University Users can create and evaluate messages. Approvers can also review library submissions.'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser} 
              disabled={isCreating}
              className="bg-[hsl(222,47%,14%)] hover:bg-[hsl(222,47%,20%)]"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">User Credentials</DialogTitle>
            <DialogDescription>
              Share these credentials with the user. They will be required to change their password on first login.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex gap-2">
                <Input value={credentials.email} readOnly className="bg-[hsl(210,20%,94%)]" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(credentials.email)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Temporary Password</Label>
              <div className="flex gap-2">
                <Input value={credentials.password} readOnly className="bg-[hsl(210,20%,94%)] font-mono" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(credentials.password)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-[hsl(220,14%,46%)]">
              Copy and share these credentials securely. The user will be prompted to set a new password on first login.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCredentialsDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Reset Password</DialogTitle>
            <DialogDescription>
              Generate a new temporary password for this user. They will be required to change it on their next login.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} className="bg-[hsl(222,47%,14%)] hover:bg-[hsl(222,47%,20%)]">
              Generate New Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}