import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Copy, Check, RefreshCw, Compass } from "lucide-react";

interface ToolUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  last_login_at: string | null;
  created_at: string;
}

export default function ToolOnlyUsersPage() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<ToolUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [resultPwd, setResultPwd] = useState<string | null>(null);
  const [resultEmail, setResultEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,first_name,last_name,last_login_at,created_at")
      .eq("tool_only", true)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Couldn't load users", description: error.message, variant: "destructive" });
    } else {
      setUsers((data ?? []) as ToolUser[]);
    }
    setLoading(false);
  };

  useEffect(() => { document.title = "Compass users"; load(); }, []);

  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;

  const handleInvite = async () => {
    if (!email.trim() || !first.trim()) {
      toast({ title: "Email and first name required", variant: "destructive" });
      return;
    }
    setInviting(true);
    setResultPwd(null);
    try {
      const { data, error } = await supabase.functions.invoke("invite-tool-only-user", {
        body: { email: email.trim(), firstName: first.trim(), lastName: last.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResultPwd(data.temporaryPassword);
      setResultEmail(data.email ?? email.trim());
      toast({ title: "Compass user created", description: "Share the temporary password securely." });
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invite failed";
      toast({ title: "Invite failed", description: msg, variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  const resetForm = () => {
    setEmail(""); setFirst(""); setLast(""); setResultPwd(null); setResultEmail(null); setCopied(false);
  };

  const resetSetup = async (userId: string) => {
    if (!confirm("Reset this user's setup? They'll be asked to redo onboarding on next login.")) return;
    const { error } = await supabase
      .from("personal_ai_profile")
      .update({ setup_completed_at: null })
      .eq("user_id", userId);
    if (error) {
      toast({ title: "Couldn't reset", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Setup reset" });
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Compass className="h-5 w-5" /> Compass users
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Users with access only to Compass. They can't see anything else in the app.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setOpen(true); }}>
          <UserPlus className="h-4 w-4 mr-1.5" /> Invite user
        </Button>
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5">Name</th>
              <th className="text-left px-4 py-2.5">Email</th>
              <th className="text-left px-4 py-2.5">Last login</th>
              <th className="text-left px-4 py-2.5">Created</th>
              <th className="text-right px-4 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin inline mr-1.5" /> Loading…
              </td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                No Compass users yet. Invite your first one.
              </td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="border-t border-border/60 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{u.first_name} {u.last_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : <Badge variant="secondary">Never</Badge>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => resetSetup(u.id)}>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reset setup
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a Compass user</DialogTitle>
            <DialogDescription>
              They'll only see Compass when they sign in — nothing else in the app.
            </DialogDescription>
          </DialogHeader>

          {!resultPwd ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="i-email">Email</Label>
                <Input id="i-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="person@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="i-first">First name</Label>
                  <Input id="i-first" value={first} onChange={(e) => setFirst(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="i-last">Last name</Label>
                  <Input id="i-last" value={last} onChange={(e) => setLast(e.target.value)} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-sm space-y-2">
                <div className="text-xs text-muted-foreground">User created — share these credentials with them</div>
                <div><span className="text-muted-foreground">Email:</span> <span className="font-mono">{resultEmail}</span></div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Temp password:</span>
                  <code className="bg-background px-2 py-1 rounded border border-border/60 font-mono text-xs">{resultPwd}</code>
                  <Button size="sm" variant="ghost" onClick={() => {
                    navigator.clipboard.writeText(`Email: ${resultEmail}\nPassword: ${resultPwd}\nSign in at: ${window.location.origin}/login`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}>
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Sign-in URL: <code>{window.location.origin}/login</code>
              </p>
            </div>
          )}

          <DialogFooter>
            {!resultPwd ? (
              <>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleInvite} disabled={inviting}>
                  {inviting ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Creating…</> : "Create user"}
                </Button>
              </>
            ) : (
              <Button onClick={() => { setOpen(false); resetForm(); }}>Done</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
