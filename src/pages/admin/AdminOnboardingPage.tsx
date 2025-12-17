import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  UserPlus, 
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  ChevronLeft,
  Home,
  Clock,
  Building2
} from 'lucide-react';
import { format } from 'date-fns';

interface OnboardingRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  department: string | null;
  title: string | null;
  institution_name_input: string | null;
  request_status: 'submitted' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at: string | null;
  notes: string | null;
}

interface Tenant {
  id: string;
  institution_name: string;
}

export default function AdminOnboardingPage() {
  const { tenant } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<OnboardingRequest[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Action dialogs
  const [selectedRequest, setSelectedRequest] = useState<OnboardingRequest | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Credentials dialog
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('onboarding_requests')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load onboarding requests',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, institution_name')
        .neq('institution_name', 'PERSIST System')
        .order('institution_name');

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchTenants();
  }, []);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    // Super admins must select a tenant
    if (!selectedTenantId) {
      toast({
        title: 'Select Institution',
        description: 'Please select which institution to assign this user to.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    const tempPassword = generatePassword();

    try {
      // Verify session is still valid before calling
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Session Expired',
          description: 'Your session has expired. Please log in again.',
          variant: 'destructive',
        });
        setShowApproveDialog(false);
        setIsProcessing(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'approve_onboarding',
          requestId: selectedRequest.id,
          password: tempPassword,
          tenantId: selectedTenantId,
        },
      });

      if (error) {
        // Check for auth errors specifically
        if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
          throw new Error('Session expired. Please log out and log back in.');
        }
        throw error;
      }
      if (data?.error) {
        if (data.error === 'Unauthorized') {
          throw new Error('Session expired. Please log out and log back in.');
        }
        throw new Error(data.error);
      }

      setShowApproveDialog(false);
      setCredentials({ email: selectedRequest.email, password: tempPassword });
      setShowCredentialsDialog(true);
      
      toast({
        title: 'Request Approved',
        description: `User account created for ${selectedRequest.email}`,
      });

      fetchRequests();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve request',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setSelectedRequest(null);
      setSelectedTenantId('');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'reject_onboarding',
          requestId: selectedRequest.id,
          notes: rejectNotes || null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setShowRejectDialog(false);
      setRejectNotes('');
      
      toast({
        title: 'Request Rejected',
        description: `Request from ${selectedRequest.email} has been rejected`,
      });

      fetchRequests();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject request',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setSelectedRequest(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  const pendingRequests = requests.filter(r => r.request_status === 'submitted');
  const processedRequests = requests.filter(r => r.request_status !== 'submitted');

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]">
      {/* Header */}
      <div className="border-b border-[hsl(220,13%,88%)] bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/panel" className="text-[hsl(220,14%,46%)] hover:text-[hsl(222,47%,11%)]">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-sm text-[hsl(220,14%,46%)]">
                <Link to="/" className="hover:text-[hsl(222,47%,11%)]">
                  <Home className="w-4 h-4" />
                </Link>
                <span>/</span>
                <Link to="/admin/panel" className="hover:text-[hsl(222,47%,11%)]">Super Admin</Link>
                <span>/</span>
                <span className="text-[hsl(222,47%,11%)]">Onboarding Requests</span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-[hsl(222,47%,11%)]">Onboarding Requests</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card className="border-[hsl(220,13%,88%)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[hsl(222,47%,11%)]">
              <UserPlus className="w-5 h-5" />
              Access Requests
              {pendingRequests.length > 0 && (
                <Badge className="ml-2 bg-[hsl(45,93%,47%)] text-[hsl(222,47%,11%)]">
                  {pendingRequests.length} pending
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pending ({pendingRequests.length})
                </TabsTrigger>
                <TabsTrigger value="processed">
                  Processed ({processedRequests.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[hsl(220,14%,46%)]" />
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-12 text-[hsl(220,14%,46%)]">
                    <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending requests</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Institution</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.first_name} {request.last_name}
                            {request.title && (
                              <span className="block text-xs text-[hsl(220,14%,46%)]">{request.title}</span>
                            )}
                          </TableCell>
                          <TableCell>{request.email}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {request.institution_name_input || '—'}
                            </span>
                          </TableCell>
                          <TableCell>{request.department || '—'}</TableCell>
                          <TableCell className="text-sm text-[hsl(220,14%,46%)]">
                            {format(new Date(request.submitted_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRejectDialog(true);
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                className="bg-[hsl(158,64%,42%)] hover:bg-[hsl(158,64%,38%)]"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowApproveDialog(true);
                                }}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="processed">
                {processedRequests.length === 0 ? (
                  <div className="text-center py-12 text-[hsl(220,14%,46%)]">
                    <p>No processed requests</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Institution</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Processed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.first_name} {request.last_name}
                          </TableCell>
                          <TableCell>{request.email}</TableCell>
                          <TableCell>{request.institution_name_input || '—'}</TableCell>
                          <TableCell>
                            {request.request_status === 'approved' ? (
                              <Badge className="bg-[hsl(158,64%,42%)] text-white">Approved</Badge>
                            ) : (
                              <Badge variant="destructive">Rejected</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-[hsl(220,14%,46%)]">
                            {request.reviewed_at 
                              ? format(new Date(request.reviewed_at), 'MMM d, yyyy')
                              : '—'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={(open) => {
        setShowApproveDialog(open);
        if (!open) setSelectedTenantId('');
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Approve Request</DialogTitle>
            <DialogDescription>
              Create a user account for {selectedRequest?.first_name} {selectedRequest?.last_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> {selectedRequest?.email}</p>
              <p><strong>Department:</strong> {selectedRequest?.department || 'Not specified'}</p>
              <p><strong>Title:</strong> {selectedRequest?.title || 'Not specified'}</p>
              {selectedRequest?.institution_name_input && (
                <p><strong>Requested Institution:</strong> {selectedRequest.institution_name_input}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign to Institution *</label>
              <select
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="w-full px-3 py-2 border border-[hsl(220,13%,88%)] rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(222,47%,31%)]"
              >
                <option value="">Select an institution...</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.institution_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApprove} 
              disabled={isProcessing || !selectedTenantId}
              className="bg-[hsl(158,64%,42%)] hover:bg-[hsl(158,64%,38%)]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve & Create Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Reject Request</DialogTitle>
            <DialogDescription>
              Reject the access request from {selectedRequest?.first_name} {selectedRequest?.last_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason (optional)</label>
              <Textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Enter a reason for rejection..."
                className="border-[hsl(220,13%,88%)]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleReject} 
              disabled={isProcessing}
              variant="destructive"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Request
                </>
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
              <label className="text-sm font-medium">Email</label>
              <div className="flex gap-2">
                <input 
                  value={credentials.email} 
                  readOnly 
                  className="flex-1 px-3 py-2 bg-[hsl(210,20%,94%)] rounded-md text-sm border border-[hsl(220,13%,88%)]" 
                />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(credentials.email)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Temporary Password</label>
              <div className="flex gap-2">
                <input 
                  value={credentials.password} 
                  readOnly 
                  className="flex-1 px-3 py-2 bg-[hsl(210,20%,94%)] rounded-md text-sm font-mono border border-[hsl(220,13%,88%)]" 
                />
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
    </div>
  );
}