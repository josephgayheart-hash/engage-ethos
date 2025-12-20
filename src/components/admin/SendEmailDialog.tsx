import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail, Send, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Tenant {
  id: string;
  institution_name: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  tenant_id: string;
  institution_name?: string;
}

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenants: Tenant[];
  users: User[];
  onEmailSent: () => void;
}

type EmailType = 'invite' | 'resend_invite' | 'custom';

export function SendEmailDialog({
  open,
  onOpenChange,
  tenants,
  users,
  onEmailSent
}: SendEmailDialogProps) {
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const [emailType, setEmailType] = useState<EmailType>('invite');
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  
  // For invite emails
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteRole, setInviteRole] = useState<'user' | 'admin' | 'approver'>('user');
  
  // For custom emails
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');

  const filteredUsers = selectedTenant 
    ? users.filter(u => u.tenant_id === selectedTenant)
    : users;

  const selectedTenantName = tenants.find(t => t.id === selectedTenant)?.institution_name || '';
  const selectedUserData = users.find(u => u.id === selectedUser);

  const resetForm = () => {
    setEmailType('invite');
    setSelectedTenant('');
    setSelectedUser('');
    setInviteEmail('');
    setInviteFirstName('');
    setInviteLastName('');
    setInviteRole('user');
    setCustomSubject('');
    setCustomBody('');
  };

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSendInviteEmail = async () => {
    if (!inviteEmail || !inviteFirstName || !inviteLastName || !selectedTenant) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      const temporaryPassword = generateTemporaryPassword();
      
      const { error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email: inviteEmail,
          firstName: inviteFirstName,
          lastName: inviteLastName,
          temporaryPassword,
          institutionName: selectedTenantName,
          role: inviteRole
        }
      });

      if (error) throw error;

      // Log the email in email_nudges
      await supabase.from('email_nudges').insert({
        tenant_id: selectedTenant,
        user_id: profile?.id || '',
        nudge_type: 'admin_invite',
        email_count: 1
      });

      toast({
        title: "Invite Email Sent",
        description: `Invitation sent to ${inviteEmail}`
      });
      
      resetForm();
      onOpenChange(false);
      onEmailSent();
    } catch (error: any) {
      console.error('Error sending invite email:', error);
      toast({
        title: "Failed to Send Email",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleResendInvite = async () => {
    if (!selectedUser) {
      toast({
        title: "Select a User",
        description: "Please select a user to resend the invite to",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('resend-invite', {
        body: { userId: selectedUser }
      });

      if (error) throw error;

      toast({
        title: "Invite Resent",
        description: `Invitation resent to ${selectedUserData?.email}`
      });
      
      resetForm();
      onOpenChange(false);
      onEmailSent();
    } catch (error: any) {
      console.error('Error resending invite:', error);
      toast({
        title: "Failed to Resend Invite",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendCustomEmail = async () => {
    if (!selectedUser || !customSubject || !customBody) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      // Call the engagement email function for custom emails
      const { error } = await supabase.functions.invoke('send-engagement-emails', {
        body: {
          singleUser: {
            id: selectedUser,
            email: selectedUserData?.email,
            firstName: selectedUserData?.first_name,
            lastName: selectedUserData?.last_name,
            institutionName: selectedUserData?.institution_name
          },
          customSubject,
          customBody
        }
      });

      if (error) throw error;

      // Log the email
      await supabase.from('email_nudges').insert({
        tenant_id: selectedUserData?.tenant_id || '',
        user_id: selectedUser,
        nudge_type: 'admin_custom',
        email_count: 1
      });

      toast({
        title: "Email Sent",
        description: `Custom email sent to ${selectedUserData?.email}`
      });
      
      resetForm();
      onOpenChange(false);
      onEmailSent();
    } catch (error: any) {
      console.error('Error sending custom email:', error);
      toast({
        title: "Failed to Send Email",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = () => {
    switch (emailType) {
      case 'invite':
        handleSendInviteEmail();
        break;
      case 'resend_invite':
        handleResendInvite();
        break;
      case 'custom':
        handleSendCustomEmail();
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Email
          </DialogTitle>
          <DialogDescription>
            Send system emails or custom messages to users
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Type Selector */}
          <div className="space-y-2">
            <Label>Email Type</Label>
            <Select value={emailType} onValueChange={(v) => setEmailType(v as EmailType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invite">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    New User Invite
                  </div>
                </SelectItem>
                <SelectItem value="resend_invite">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Resend Invite
                  </div>
                </SelectItem>
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Custom Message
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Institution Selector (always shown) */}
          <div className="space-y-2">
            <Label>Institution</Label>
            <Select value={selectedTenant} onValueChange={setSelectedTenant}>
              <SelectTrigger>
                <SelectValue placeholder="Select institution..." />
              </SelectTrigger>
              <SelectContent>
                {tenants.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.institution_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* New User Invite Form */}
          {emailType === 'invite' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    value={inviteFirstName}
                    onChange={(e) => setInviteFirstName(e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    value={inviteLastName}
                    onChange={(e) => setInviteLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="john.doe@university.edu"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'user' | 'admin' | 'approver')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="approver">Approver</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* User Selector for Resend/Custom */}
          {(emailType === 'resend_invite' || emailType === 'custom') && (
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      <div className="flex items-center gap-2">
                        <span>{u.first_name} {u.last_name}</span>
                        <span className="text-muted-foreground text-xs">({u.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUserData && (
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{selectedUserData.email}</Badge>
                  <Badge variant="secondary">{selectedUserData.institution_name}</Badge>
                </div>
              )}
            </div>
          )}

          {/* Custom Email Fields */}
          {emailType === 'custom' && (
            <>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Email subject..."
                />
              </div>
              <div className="space-y-2">
                <Label>Message *</Label>
                <Textarea
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  placeholder="Write your message here..."
                  rows={5}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}