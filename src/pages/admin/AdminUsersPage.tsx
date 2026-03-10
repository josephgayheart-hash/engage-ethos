import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserProfile, UserStatus } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
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
  Home,
  Mail,
  Trash2,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

type RoleType = 'admin' | 'user' | 'approver' | 'super_admin' | 'agency_admin' | 'agency_user';

interface TenantInfo {
  id: string;
  institution_name: string;
}

interface UserWithRole extends UserProfile {
  roles: RoleType[];
  tenant_name?: string;
}

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const { tenant, isSuperAdmin, startImpersonation, user: currentUser } = useAuth();
  const { activeWorkspace, canSwitch } = useWorkspace();
  const { toast } = useToast();

  // When super admin is switching workspaces, scope to that workspace
  const effectiveTenant = canSwitch ? activeWorkspace : tenant;
  const effectiveTenantId = effectiveTenant?.id ?? null;
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Create user dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [sendInviteEmail, setSendInviteEmail] = useState(true);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    title: '',
    role: 'user' as 'user' | 'user_approver' | 'admin' | 'super_admin' | 'agency_admin' | 'agency_user',
  });

  // Credentials dialog
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  // Reset password dialog
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);

  // Resend invite dialog
  const [showResendDialog, setShowResendDialog] = useState(false);
  const [resendUser, setResendUser] = useState<UserWithRole | null>(null);
  const [isResending, setIsResending] = useState(false);

  // Invite sent confirmation dialog
  const [showInviteSentDialog, setShowInviteSentDialog] = useState(false);
  const [inviteSentEmail, setInviteSentEmail] = useState('');

  // Delete user dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserWithRole | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImpersonatingUser, setIsImpersonatingUser] = useState<string | null>(null);

  // Orphan cleanup dialog
  const [showOrphanCleanupDialog, setShowOrphanCleanupDialog] = useState(false);
  const [orphanEmail, setOrphanEmail] = useState('');
  const [isCleaningOrphan, setIsCleaningOrphan] = useState(false);

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

      // Fetch all tenants for institution names
      const { data: tenants } = await supabase
        .from('tenants')
        .select('id, institution_name');

      // Create a map of tenant_id to institution_name
      const tenantMap: Record<string, string> = {};
      tenants?.forEach(t => {
        tenantMap[t.id] = t.institution_name;
      });

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
        tenant_name: tenantMap[profile.tenant_id] || 'Unknown',
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
          sendInvite: sendInviteEmail,
          tenantId: effectiveTenantId, // Target the active workspace
        },
      });

      // Handle edge function errors without throwing (prevents blank-screen error overlays)
      if (error) {
        const errorMessage = error.message || 'Failed to create user';

        if (errorMessage.includes('already exists')) {
          setShowCreateDialog(false);
          setOrphanEmail(newUser.email);
          setShowOrphanCleanupDialog(true);
        }

        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }

      if (data?.error) {
        const errorMessage = String(data.error);

        if (errorMessage.includes('already exists')) {
          setShowCreateDialog(false);
          setOrphanEmail(newUser.email);
          setShowOrphanCleanupDialog(true);
        }

        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }

      setShowCreateDialog(false);
      setCredentials({ email: newUser.email, password: tempPassword });
      setShowCredentialsDialog(true);
      
      // Show appropriate toast message
      if (data?.emailSent) {
        toast({
          title: 'User Created',
          description: `Invitation email sent to ${newUser.email}`,
        });
      } else if (sendInviteEmail) {
        toast({
          title: 'User Created',
          description: 'User created but email could not be sent. Please share credentials manually.',
          variant: 'default',
        });
      }
      
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        title: '',
        role: 'user',
      });
      setSendInviteEmail(true);

      fetchUsers();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create user';
      
      // Check if this is a duplicate email error
      if (errorMessage.includes('already exists')) {
        setOrphanEmail(newUser.email);
        setShowOrphanCleanupDialog(true);
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
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
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password',
        variant: 'destructive',
      });
    }
  };

  const handleResendInvite = async () => {
    if (!resendUser) return;

    setIsResending(true);
    const newPassword = generatePassword();

    try {
      // First reset the password
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'reset_password',
          userId: resendUser.id,
          newPassword,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Then send the invite email
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', currentUser?.id)
        .single();

      const inviterName = currentProfile 
        ? `${currentProfile.first_name} ${currentProfile.last_name}` 
        : undefined;

      const { error: emailError } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email: resendUser.email,
          firstName: resendUser.first_name,
          lastName: resendUser.last_name,
          temporaryPassword: newPassword,
          institutionName: tenant?.institution_name || 'Your Institution',
          role: resendUser.roles[0] || 'user',
          inviterName,
        },
      });

      if (emailError) throw emailError;

      setShowResendDialog(false);
      setResendUser(null);
      setInviteSentEmail(resendUser.email);
      setShowInviteSentDialog(true);

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resend invite',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
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

  const handleDeleteUser = async () => {
    if (!deleteUser) return;

    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'delete_user',
          userId: deleteUser.id,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'User Deleted',
        description: `${deleteUser.first_name} ${deleteUser.last_name} has been permanently deleted`,
      });

      setShowDeleteDialog(false);
      setDeleteUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCleanupOrphan = async () => {
    if (!orphanEmail) return;

    setIsCleaningOrphan(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'cleanup_orphan_auth',
          email: orphanEmail,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Orphan User Cleaned Up',
        description: `Auth record for ${orphanEmail} has been removed. You can now create a new user with this email.`,
      });

      setShowOrphanCleanupDialog(false);
      setOrphanEmail('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to clean up orphan user',
        variant: 'destructive',
      });
    } finally {
      setIsCleaningOrphan(false);
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
    // When super admin has a workspace selected, filter to that workspace
    const matchesTenant = effectiveTenantId ? user.tenant_id === effectiveTenantId : true;

    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.department?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesTenant && matchesSearch && matchesStatus;
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
                <Link to="/dashboard" className="hover:text-[hsl(222,47%,11%)]">
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
                {isSuperAdmin 
                  ? `Managing users for ${effectiveTenant?.institution_name || 'all institutions'}` 
                  : 'View users in your institution (read-only)'}
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
                    {isSuperAdmin && <TableHead>Institution</TableHead>}
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    {isSuperAdmin && <TableHead className="w-12"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow 
                      key={user.id} 
                      className={isSuperAdmin ? "cursor-pointer hover:bg-muted/50" : ""}
                      onClick={isSuperAdmin ? () => navigate(`/admin/user/${user.id}`) : undefined}
                    >
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                        {user.title && (
                          <span className="block text-xs text-[hsl(220,14%,46%)]">{user.title}</span>
                        )}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          <Link 
                            to={`/admin/institution/${user.tenant_id}`}
                            className="text-sm text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {user.tenant_name}
                          </Link>
                        </TableCell>
                      )}
                      <TableCell>{user.department || '—'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.roles.includes('super_admin') ? (
                            <Badge className="bg-[hsl(280,60%,45%)] text-white">CampusVoice Super Admin</Badge>
                          ) : user.roles.includes('agency_admin') ? (
                            <Badge className="bg-amber-600 text-white">Agency Admin</Badge>
                          ) : user.roles.includes('agency_user') ? (
                            <Badge className="bg-amber-500 text-white">Agency User</Badge>
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
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {/* Show Resend Invite for users who haven't logged in */}
                              {!user.last_login_at && (
                                <>
                                  <DropdownMenuItem onClick={() => {
                                    setResendUser(user);
                                    setShowResendDialog(true);
                                  }}>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Resend Invite
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              {/* View as User option */}
                              {currentUser?.id !== user.id && user.status === 'active' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={async () => {
                                      setIsImpersonatingUser(user.id);
                                      try {
                                        await startImpersonation(user.id);
                                      } catch (error) {
                                        toast({ title: 'Impersonation failed', variant: 'destructive' });
                                      } finally {
                                        setIsImpersonatingUser(null);
                                      }
                                    }}
                                    disabled={isImpersonatingUser === user.id}
                                  >
                                    {isImpersonatingUser === user.id ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <Eye className="w-4 h-4 mr-2" />
                                    )}
                                    View as User
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
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
                              {user.status !== 'disabled' ? (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(user.id, 'disabled')}
                                  className="text-amber-600"
                                >
                                  <UserX className="w-4 h-4 mr-2" />
                                  Disable Account
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(user.id, 'active')}
                                >
                                  <Unlock className="w-4 h-4 mr-2" />
                                  Re-enable Account
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setDeleteUser(user);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={isSuperAdmin ? 8 : 6} className="text-center py-8 text-[hsl(220,14%,46%)]">
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
                onValueChange={(value: 'user' | 'user_approver' | 'admin' | 'super_admin' | 'agency_admin' | 'agency_user') => setNewUser(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">University User</SelectItem>
                  <SelectItem value="user_approver">University User + Approver</SelectItem>
                  <SelectItem value="admin">University Admin</SelectItem>
                  {isSuperAdmin && (
                    <>
                      <SelectItem value="agency_admin">Agency Admin</SelectItem>
                      <SelectItem value="agency_user">Agency User</SelectItem>
                      <SelectItem value="super_admin">CampusVoice Super Admin</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {newUser.role === 'super_admin' 
                  ? 'Full access to all institutions and system settings.'
                  : newUser.role === 'agency_admin'
                  ? 'Full admin access to their agency account including client management and team members.'
                  : newUser.role === 'agency_user'
                  ? 'Agency team member who can manage client content and messaging.'
                  : newUser.role === 'admin'
                  ? 'Full admin access to their institution including user management and Content DNA.'
                  : 'University Users can create and evaluate messages. Approvers can also review library submissions.'}
              </p>
            </div>
            
            {/* Send Email Invite Checkbox */}
            <div className="flex items-center space-x-3 pt-2 border-t border-[hsl(220,13%,88%)]">
              <Checkbox
                id="sendInvite"
                checked={sendInviteEmail}
                onCheckedChange={(checked) => setSendInviteEmail(checked as boolean)}
              />
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[hsl(220,14%,46%)]" />
                <Label htmlFor="sendInvite" className="font-normal cursor-pointer">
                  Send email invitation with login credentials
                </Label>
              </div>
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

      {/* Resend Invite Dialog */}
      <Dialog open={showResendDialog} onOpenChange={setShowResendDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Resend Invitation</DialogTitle>
            <DialogDescription>
              This will generate a new temporary password and send a fresh invitation email to <strong>{resendUser?.email}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResendDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleResendInvite} 
              disabled={isResending}
              className="bg-[hsl(222,47%,14%)] hover:bg-[hsl(222,47%,20%)]"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Invite
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Sent Confirmation Dialog */}
      <Dialog open={showInviteSentDialog} onOpenChange={setShowInviteSentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-[hsl(158,64%,42%)]/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-[hsl(158,64%,42%)]" />
            </div>
            <DialogTitle className="font-serif text-center">Invitation Sent!</DialogTitle>
            <DialogDescription className="text-center">
              A new invitation email with login credentials has been sent to <strong>{inviteSentEmail}</strong>. The user's password has been reset.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setShowInviteSentDialog(false)} className="bg-[hsl(222,47%,14%)] hover:bg-[hsl(222,47%,20%)]">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto bg-red-100 rounded-full p-3 mb-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="font-serif text-center">Delete User</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to permanently delete <strong>{deleteUser?.first_name} {deleteUser?.last_name}</strong> ({deleteUser?.email})?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action cannot be undone. All user data, including their messages, settings, and history will be permanently removed.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteUser(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Orphan Cleanup Dialog - Super Admin Only */}
      {isSuperAdmin && (
        <Dialog open={showOrphanCleanupDialog} onOpenChange={setShowOrphanCleanupDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="mx-auto bg-amber-100 rounded-full p-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <DialogTitle className="font-serif text-center">Orphan Auth Record Detected</DialogTitle>
              <DialogDescription className="text-center">
                An auth record exists for <strong>{orphanEmail}</strong> but there's no corresponding user profile. This can happen after a partial deletion.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
              <p className="text-sm text-amber-800">
                <strong>Would you like to clean up this orphan record?</strong> This will remove the auth-only record so you can create a fresh user with this email.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowOrphanCleanupDialog(false);
                  setOrphanEmail('');
                }}
                disabled={isCleaningOrphan}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCleanupOrphan}
                disabled={isCleaningOrphan}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isCleaningOrphan ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cleaning...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clean Up & Retry
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}