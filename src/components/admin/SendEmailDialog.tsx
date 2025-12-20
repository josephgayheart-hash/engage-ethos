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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Mail, Send, UserPlus, HelpCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
  last_login_at?: string | null;
  status?: string;
}

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenants: Tenant[];
  users: User[];
  onEmailSent: () => void;
}

type EmailType = 'invite' | 'resend_invite' | 'where_have_you_been' | 'custom';

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

  const formatLastLogin = (date: string | null | undefined) => {
    if (!date) return 'Never logged in';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString();
  };

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

  const handleSendWhereHaveYouBeen = async () => {
    if (!selectedUser) {
      toast({
        title: "Select a User",
        description: "Please select a user to send the re-engagement email to",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-reengagement-email', {
        body: {
          userId: selectedUser,
          email: selectedUserData?.email,
          firstName: selectedUserData?.first_name,
          lastName: selectedUserData?.last_name,
          institutionName: selectedUserData?.institution_name,
          lastLoginAt: selectedUserData?.last_login_at
        }
      });

      if (error) throw error;

      // Log the email
      await supabase.from('email_nudges').insert({
        tenant_id: selectedUserData?.tenant_id || '',
        user_id: selectedUser,
        nudge_type: 'where_have_you_been',
        email_count: 1
      });

      toast({
        title: "Re-engagement Email Sent",
        description: `Email sent to ${selectedUserData?.email}`
      });
      
      resetForm();
      onOpenChange(false);
      onEmailSent();
    } catch (error: any) {
      console.error('Error sending re-engagement email:', error);
      toast({
        title: "Failed to Send Email",
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
      case 'where_have_you_been':
        handleSendWhereHaveYouBeen();
        break;
      case 'custom':
        handleSendCustomEmail();
        break;
    }
  };

  // Email Template Previews
  const getTemplatePreview = () => {
    const firstName = selectedUserData?.first_name || inviteFirstName || '[First Name]';
    const lastName = selectedUserData?.last_name || inviteLastName || '[Last Name]';
    const institution = selectedUserData?.institution_name || selectedTenantName || '[Institution]';
    const email = selectedUserData?.email || inviteEmail || '[email@example.com]';
    const appUrl = 'https://uplaybook.ai';
    
    switch (emailType) {
      case 'invite':
        return (
          <div className="p-4 bg-muted/50 rounded-lg border text-sm space-y-3">
            <div className="flex items-center gap-2 text-primary font-medium">
              <span className="text-lg">🎉</span>
              <span>Welcome to UPlaybook.AI</span>
            </div>
            <p className="text-muted-foreground">
              <strong>Subject:</strong> Welcome to UPlaybook.AI - {institution}
            </p>
            <div className="border-t pt-3 space-y-2 text-muted-foreground">
              <p>Welcome, <strong>{firstName}</strong>!</p>
              <p>You've been invited to join UPlaybook.AI as a <strong>{inviteRole}</strong> for <strong>{institution}</strong>.</p>
              <div className="bg-background p-3 rounded text-xs space-y-1 border">
                <p className="font-medium mb-2">Your Login Credentials:</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Temporary Password:</strong> [auto-generated 12-char]</p>
              </div>
              <div className="bg-primary/10 p-3 rounded text-center">
                <a href={appUrl} className="text-primary font-medium underline hover:no-underline">
                  🔗 Login to UPlaybook.AI →
                </a>
                <p className="text-xs mt-1 text-muted-foreground">{appUrl}/login</p>
              </div>
              <p className="text-xs italic text-amber-600">⚠️ You will be prompted to change your password on first login.</p>
            </div>
          </div>
        );
      
      case 'resend_invite':
        return (
          <div className="p-4 bg-muted/50 rounded-lg border text-sm space-y-3">
            <div className="flex items-center gap-2 text-primary font-medium">
              <span className="text-lg">📬</span>
              <span>Your Account is Waiting!</span>
            </div>
            <p className="text-muted-foreground">
              <strong>Subject:</strong> Your UPlaybook.AI account is waiting!
            </p>
            <div className="border-t pt-3 space-y-2 text-muted-foreground">
              <p>Hi <strong>{firstName}</strong>,</p>
              <p>Your UPlaybook.AI account was created recently, but we haven't seen you log in yet! <strong>{institution}</strong> has given you access to powerful AI-powered communication tools.</p>
              <div className="bg-green-50 dark:bg-green-950 p-3 rounded text-xs border-l-2 border-green-500">
                <p className="font-medium text-green-700 dark:text-green-300 mb-1">Here's what you can do:</p>
                <ul className="list-disc pl-4 text-green-600 dark:text-green-400 space-y-1">
                  <li>Build AI-powered messages in seconds</li>
                  <li>Score your content for effectiveness</li>
                  <li>Access your institution's template library</li>
                </ul>
              </div>
              <div className="bg-primary/10 p-3 rounded text-center">
                <a href={appUrl} className="text-primary font-medium underline hover:no-underline">
                  🔗 Get Started Now →
                </a>
                <p className="text-xs mt-1 text-muted-foreground">{appUrl}/login</p>
              </div>
              <p className="text-xs text-muted-foreground">If you need your login credentials, please contact your administrator.</p>
            </div>
          </div>
        );
      
      case 'where_have_you_been':
        const lastLogin = selectedUserData?.last_login_at;
        const daysSince = lastLogin 
          ? Math.floor((new Date().getTime() - new Date(lastLogin).getTime()) / 86400000)
          : null;
        
        return (
          <div className="p-4 bg-muted/50 rounded-lg border text-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-600 font-medium">
              <span className="text-lg">🤔</span>
              <span>Where Have You Been?</span>
            </div>
            <p className="text-muted-foreground">
              <strong>Subject:</strong> We haven't seen you in a while, {firstName}! 🤔
            </p>
            <div className="border-t pt-3 space-y-2 text-muted-foreground">
              <p>Hi <strong>{firstName}</strong>,</p>
              <p>
                {daysSince && daysSince > 0 
                  ? `It's been ${daysSince} days since you last visited UPlaybook.AI.`
                  : lastLogin === null
                    ? `You were invited to UPlaybook.AI but haven't logged in yet.`
                    : `It's been a while since you last visited UPlaybook.AI.`
                }
              </p>
              <p>We miss having you around and wanted to check in!</p>
              <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded text-xs border-l-2 border-amber-500">
                <p className="font-medium text-amber-700 dark:text-amber-300 mb-1">A few things you might have missed:</p>
                <ul className="list-disc pl-4 text-amber-600 dark:text-amber-400 space-y-1">
                  <li>New features and improvements</li>
                  <li>Updated templates from your team</li>
                  <li>AI improvements for better content</li>
                </ul>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded text-center">
                <a href={appUrl} className="text-amber-700 dark:text-amber-300 font-medium underline hover:no-underline">
                  🔗 Come Back and Explore →
                </a>
                <p className="text-xs mt-1 text-amber-600 dark:text-amber-400">{appUrl}/login</p>
              </div>
              <p className="text-xs">We'd love to help you create great content for <strong>{institution}</strong>!</p>
            </div>
          </div>
        );
      
      case 'custom':
        return (
          <div className="p-4 bg-muted/50 rounded-lg border text-sm space-y-3">
            <div className="flex items-center gap-2 text-primary font-medium">
              <span className="text-lg">✉️</span>
              <span>Custom Message</span>
            </div>
            <p className="text-muted-foreground">
              <strong>To:</strong> {firstName} {lastName} ({email})
            </p>
            <p className="text-muted-foreground">
              <strong>Subject:</strong> {customSubject || '[Your subject line]'}
            </p>
            <div className="border-t pt-3 space-y-2 text-muted-foreground">
              <p>Hi <strong>{firstName}</strong>,</p>
              <p className="whitespace-pre-wrap">{customBody || '[Your message will appear here...]'}</p>
              <div className="border-t pt-3 mt-3">
                <p className="text-xs text-muted-foreground">— The UPlaybook.AI Team</p>
                <p className="text-xs text-primary mt-1">
                  <a href={appUrl} className="underline">{appUrl}</a>
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Email
          </DialogTitle>
          <DialogDescription>
            Send system emails or custom messages to users
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="grid md:grid-cols-2 gap-6 py-4 pr-4">
            {/* Left Column: Form */}
            <div className="space-y-4">
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
                    <SelectItem value="where_have_you_been">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Where Have You Been?
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

              {/* Institution Selector (only for invite and resend) */}
              {(emailType === 'invite' || emailType === 'resend_invite') && (
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
              )}

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

              {/* User Selector for Resend/Where Have You Been/Custom */}
              {(emailType === 'resend_invite' || emailType === 'where_have_you_been' || emailType === 'custom') && (
                <div className="space-y-2">
                  <Label>Select User</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(emailType === 'custom' ? users : filteredUsers).map(u => (
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
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">{selectedUserData.email}</Badge>
                      <Badge variant="secondary">{selectedUserData.institution_name}</Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatLastLogin(selectedUserData.last_login_at)}
                      </Badge>
                      {selectedUserData.status && (
                        <Badge variant={selectedUserData.status === 'active' ? 'default' : 'secondary'}>
                          {selectedUserData.status}
                        </Badge>
                      )}
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

            {/* Right Column: Preview */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email Preview</Label>
              {getTemplatePreview()}
            </div>
          </div>
        </ScrollArea>

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