import { useState, useMemo } from "react";
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
import { Loader2, Mail, Send, UserPlus, HelpCircle, Clock, Filter, Users, CheckSquare, PartyPopper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

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

type EmailType = 'invite' | 'resend_invite' | 'where_have_you_been' | 'beta_feedback' | 'custom';
type RetentionFilter = 'all' | 'never_logged_in' | 'inactive_30_days' | 'inactive_90_days' | 'referred_never_logged';

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
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [retentionFilter, setRetentionFilter] = useState<RetentionFilter>('all');
  
  // For invite emails
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteRole, setInviteRole] = useState<'user' | 'admin' | 'approver'>('user');
  
  // For custom emails
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');

  // Apply retention filters
  const filteredUsers = useMemo(() => {
    let filtered = selectedTenant 
      ? users.filter(u => u.tenant_id === selectedTenant)
      : users;
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    switch (retentionFilter) {
      case 'never_logged_in':
        filtered = filtered.filter(u => !u.last_login_at);
        break;
      case 'inactive_30_days':
        filtered = filtered.filter(u => {
          if (!u.last_login_at) return true;
          return new Date(u.last_login_at) < thirtyDaysAgo;
        });
        break;
      case 'inactive_90_days':
        filtered = filtered.filter(u => {
          if (!u.last_login_at) return true;
          return new Date(u.last_login_at) < ninetyDaysAgo;
        });
        break;
      case 'referred_never_logged':
        filtered = filtered.filter(u => !u.last_login_at && u.status === 'invited');
        break;
    }
    
    return filtered;
  }, [users, selectedTenant, retentionFilter]);

  const selectedTenantName = tenants.find(t => t.id === selectedTenant)?.institution_name || '';
  const selectedUserData = selectedUsers.length === 1 ? users.find(u => u.id === selectedUsers[0]) : null;

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

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const resetForm = () => {
    setEmailType('invite');
    setSelectedTenant('');
    setSelectedUsers([]);
    setRetentionFilter('all');
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
          role: inviteRole,
          tenantId: selectedTenant,
          userId: profile?.id || ''
        }
      });

      if (error) throw error;

      // Logging is now done server-side

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
    if (selectedUsers.length === 0) {
      toast({
        title: "Select Users",
        description: "Please select at least one user to resend the invite to",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      let successCount = 0;
      for (const userId of selectedUsers) {
        const userData = users.find(u => u.id === userId);
        const { error } = await supabase.functions.invoke('resend-invite', {
          body: { userId }
        });
        if (!error) successCount++;
      }

      toast({
        title: "Invites Resent",
        description: `Successfully resent ${successCount} of ${selectedUsers.length} invitations`
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
    if (selectedUsers.length === 0) {
      toast({
        title: "Select Users",
        description: "Please select at least one user to send the re-engagement email to",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      let successCount = 0;
      for (const userId of selectedUsers) {
        const userData = users.find(u => u.id === userId);
        if (!userData) continue;

        const { error } = await supabase.functions.invoke('send-reengagement-email', {
          body: {
            userId,
            email: userData.email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            institutionName: userData.institution_name,
            lastLoginAt: userData.last_login_at
          }
        });

        if (!error) {
          successCount++;
          // Logging is now done server-side
        }
      }

      toast({
        title: "Re-engagement Emails Sent",
        description: `Successfully sent ${successCount} of ${selectedUsers.length} emails`
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
    if (selectedUsers.length === 0 || !customSubject || !customBody) {
      toast({
        title: "Missing Information",
        description: "Please select users and fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      let successCount = 0;
      for (const userId of selectedUsers) {
        const userData = users.find(u => u.id === userId);
        if (!userData) continue;

        const { error } = await supabase.functions.invoke('send-engagement-emails', {
          body: {
            singleUser: {
              id: userId,
              email: userData.email,
              firstName: userData.first_name,
              lastName: userData.last_name,
              institutionName: userData.institution_name
            },
            customSubject,
            customBody
          }
        });

        if (!error) {
          successCount++;
          // Log the email with full details
          await supabase.from('email_nudges').insert({
            tenant_id: userData.tenant_id || '',
            user_id: userId,
            nudge_type: 'admin_custom',
            email_count: 1,
            recipient_email: userData.email,
            recipient_name: `${userData.first_name} ${userData.last_name}`,
            subject: customSubject,
            email_type: 'custom',
            status: 'sent',
            metadata: { body_preview: customBody.substring(0, 100), institution: userData.institution_name }
          });
        }
      }

      toast({
        title: "Emails Sent",
        description: `Successfully sent ${successCount} of ${selectedUsers.length} custom emails`
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

  const handleSendBetaFeedback = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Select Users",
        description: "Please select at least one user to send the beta feedback email to",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      let successCount = 0;
      for (const userId of selectedUsers) {
        const userData = users.find(u => u.id === userId);
        if (!userData) continue;

        const { error } = await supabase.functions.invoke('send-beta-feedback-email', {
          body: {
            userId,
            email: userData.email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            institutionName: userData.institution_name
          }
        });

        if (!error) {
          successCount++;
          // Logging is now done server-side
        }
      }

      toast({
        title: "Beta Feedback Emails Sent",
        description: `Successfully sent ${successCount} of ${selectedUsers.length} emails`
      });
      
      resetForm();
      onOpenChange(false);
      onEmailSent();
    } catch (error: any) {
      console.error('Error sending beta feedback email:', error);
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
      case 'beta_feedback':
        handleSendBetaFeedback();
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
    const brandName = 'CampusVoice.AI';
    const appUrl = 'https://campusvoice.ai';

    switch (emailType) {
      case 'invite':
        return (
          <div className="p-4 bg-muted/50 rounded-lg border text-sm space-y-3">
            <div className="flex items-center gap-2 text-primary font-medium">
              <span className="text-lg">🎉</span>
              <span>Welcome to {brandName}</span>
            </div>
            <p className="text-muted-foreground">
              <strong>Subject:</strong> Welcome to {brandName} - {institution}
            </p>
            <div className="border-t pt-3 space-y-2 text-muted-foreground">
              <p>
                Welcome, <strong>{firstName}</strong>!
              </p>
              <p>
                You've been invited to join {brandName} as a <strong>{inviteRole}</strong> for{' '}
                <strong>{institution}</strong>.
              </p>
              <div className="bg-background p-3 rounded text-xs space-y-1 border">
                <p className="font-medium mb-2">Your Login Credentials:</p>
                <p>
                  <strong>Email:</strong> {email}
                </p>
                <p>
                  <strong>Temporary Password:</strong> [auto-generated 12-char]
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded text-center">
                <a href={appUrl} className="text-primary font-medium underline hover:no-underline">
                  🔗 Login to {brandName} →
                </a>
                <p className="text-xs mt-1 text-muted-foreground">{appUrl}/login</p>
              </div>
              <p className="text-xs italic text-amber-600">
                ⚠️ You will be prompted to change your password on first login.
              </p>
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
              <strong>Subject:</strong> Your {brandName} account is waiting!
            </p>
            <div className="border-t pt-3 space-y-2 text-muted-foreground">
              <p>
                Hi <strong>{firstName}</strong>,
              </p>
              <p>
                Your {brandName} account was created recently, but we haven't seen you log in yet!{' '}
                <strong>{institution}</strong> has given you access to powerful AI-powered communication tools.
              </p>
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

      case 'where_have_you_been': {
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
              <p>
                Hi <strong>{firstName}</strong>,
              </p>
              <p>
                {daysSince && daysSince > 0
                  ? `It's been ${daysSince} days since you last visited ${brandName}.`
                  : lastLogin === null
                    ? `You were invited to ${brandName} but haven't logged in yet.`
                    : `It's been a while since you last visited ${brandName}.`}
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
              <p className="text-xs">
                We'd love to help you create great content for <strong>{institution}</strong>!
              </p>
            </div>
          </div>
        );
      }

      case 'beta_feedback':
        return (
          <div className="p-4 bg-muted/50 rounded-lg border text-sm space-y-3">
            <div className="flex items-center gap-2 font-medium" style={{ color: '#7C3AED' }}>
              <span className="text-lg">🎉</span>
              <span>Beta Thank You & Feedback Request</span>
            </div>
            <p className="text-muted-foreground">
              <strong>Subject:</strong> 🎉 Thank You for Joining {brandName} Beta!
            </p>
            <div className="border-t pt-3 space-y-2 text-muted-foreground">
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 p-3 rounded-lg text-center">
                <p className="font-semibold text-indigo-700 dark:text-indigo-300">🎉 Thank You!</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">We're thrilled to have you as part of our beta community</p>
              </div>
              <p>
                Hi <strong>{firstName}</strong>,
              </p>
              <p>
                We noticed you've been exploring {brandName}, and we couldn't be more grateful! As a beta user,{' '}
                <strong>your experience matters deeply to us</strong>.
              </p>
              <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded text-xs border-l-4 border-amber-500">
                <p className="font-semibold text-amber-700 dark:text-amber-300">💡 Your feedback shapes our product</p>
                <p className="text-amber-600 dark:text-amber-400 mt-1">
                  Every suggestion, bug report, and idea helps us build the best possible tool for higher education communicators like you.
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded text-center">
                <a href={appUrl} className="text-primary font-medium underline hover:no-underline">
                  🔗 Share Your Feedback →
                </a>
              </div>
              <p className="text-xs text-center">It only takes a few minutes, and it means the world to us. 💜</p>
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
              <p>
                Hi <strong>{firstName}</strong>,
              </p>
              <p className="whitespace-pre-wrap">{customBody || '[Your message will appear here...]'}</p>
              <div className="border-t pt-3 mt-3">
                <p className="text-xs text-muted-foreground">— The {brandName} Team</p>
                <p className="text-xs text-primary mt-1">
                  <a href={appUrl} className="underline">
                    {appUrl}
                  </a>
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
      <DialogContent className="sm:max-w-[900px] max-h-[95vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Email
          </DialogTitle>
          <DialogDescription>
            Send system emails or custom messages to users
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          <div className="grid md:grid-cols-2 gap-8 py-4 pr-4">
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
                    <SelectItem value="beta_feedback">
                      <div className="flex items-center gap-2">
                        <PartyPopper className="w-4 h-4" />
                        Beta Thank You & Feedback
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

              {/* User Selector with Filters for Resend/Where Have You Been/Beta Feedback/Custom */}
              {(emailType === 'resend_invite' || emailType === 'where_have_you_been' || emailType === 'beta_feedback' || emailType === 'custom') && (
                <div className="space-y-3">
                  {/* Retention Filter */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filter Users (Retention)
                    </Label>
                    <Select value={retentionFilter} onValueChange={(v) => { setRetentionFilter(v as RetentionFilter); setSelectedUsers([]); }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="never_logged_in">Never Logged In</SelectItem>
                        <SelectItem value="inactive_30_days">Inactive 30+ Days</SelectItem>
                        <SelectItem value="inactive_90_days">Inactive 90+ Days</SelectItem>
                        <SelectItem value="referred_never_logged">Invited but Never Logged In</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* User List with Checkboxes */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Select Users ({selectedUsers.length} of {filteredUsers.length})
                      </Label>
                      {filteredUsers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleSelectAll}
                          className="text-xs h-7"
                        >
                          <CheckSquare className="w-3 h-3 mr-1" />
                          {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                        </Button>
                      )}
                    </div>
                    
                    <ScrollArea className="h-[180px] border rounded-md p-2">
                      {filteredUsers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No users match this filter
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {filteredUsers.map(u => (
                            <div
                              key={u.id}
                              className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer ${
                                selectedUsers.includes(u.id) ? 'bg-muted' : ''
                              }`}
                              onClick={() => toggleUserSelection(u.id)}
                            >
                              <Checkbox
                                checked={selectedUsers.includes(u.id)}
                                onCheckedChange={() => toggleUserSelection(u.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {u.first_name} {u.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                              </div>
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                {formatLastLogin(u.last_login_at)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>

                  {/* Selected Users Summary */}
                  {selectedUsers.length > 0 && (
                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      {selectedUsers.length === 1 && selectedUserData ? (
                        <span>
                          Sending to: <strong>{selectedUserData.first_name} {selectedUserData.last_name}</strong> ({selectedUserData.email})
                        </span>
                      ) : (
                        <span>
                          Sending to <strong>{selectedUsers.length} users</strong> from the filtered list
                        </span>
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