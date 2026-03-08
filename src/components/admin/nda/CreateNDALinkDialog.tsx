import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface NDALinkData {
  id: string;
  slug: string;
  label: string;
  recipient_name: string | null;
  recipient_email: string | null;
  organization: string | null;
  redirect_url: string | null;
  expires_at: string | null;
  is_one_time: boolean;
  notes: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  editingLink?: NDALinkData | null;
}

export function CreateNDALinkDialog({ open, onOpenChange, onCreated, editingLink }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const [isOneTime, setIsOneTime] = useState(true);
  const [notes, setNotes] = useState("");

  const isEditing = !!editingLink;

  useEffect(() => {
    if (editingLink) {
      setLabel(editingLink.label);
      setRecipientName(editingLink.recipient_name || "");
      setRecipientEmail(editingLink.recipient_email || "");
      setOrganization(editingLink.organization || "");
      setRedirectUrl(editingLink.redirect_url || "");
      setExpiresAt(editingLink.expires_at ? new Date(editingLink.expires_at) : undefined);
      setIsOneTime(editingLink.is_one_time);
      setNotes(editingLink.notes || "");
    } else {
      setLabel(""); setRecipientName(""); setRecipientEmail("");
      setOrganization(""); setRedirectUrl(""); setExpiresAt(undefined);
      setIsOneTime(true); setNotes("");
    }
  }, [editingLink, open]);

  const handleSave = async () => {
    if (!label.trim()) {
      toast({ title: "Label required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (isEditing) {
        const { error } = await supabase.from("nda_links").update({
          label: label.trim(),
          recipient_name: recipientName.trim() || null,
          recipient_email: recipientEmail.trim() || null,
          organization: organization.trim() || null,
          redirect_url: redirectUrl.trim() || null,
          expires_at: expiresAt?.toISOString() || null,
          is_one_time: isOneTime,
          notes: notes.trim() || null,
        }).eq("id", editingLink!.id);
        if (error) throw error;
        toast({ title: "NDA link updated" });
      } else {
        const slug = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
        const { error } = await supabase.from("nda_links").insert({
          slug,
          label: label.trim(),
          recipient_name: recipientName.trim() || null,
          recipient_email: recipientEmail.trim() || null,
          organization: organization.trim() || null,
          redirect_url: redirectUrl.trim() || null,
          expires_at: expiresAt?.toISOString() || null,
          is_one_time: isOneTime,
          notes: notes.trim() || null,
          created_by: user?.id || null,
        });
        if (error) throw error;
        toast({ title: "NDA link created" });
      }
      onCreated();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit NDA Link" : "Create NDA Link"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Link Label <span className="text-destructive">*</span></Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Demo for Acme University" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Recipient Name</Label>
              <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Jane Smith" />
            </div>
            <div className="space-y-1.5">
              <Label>Recipient Email</Label>
              <Input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="jane@acme.edu" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Organization</Label>
            <Input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Acme University" />
          </div>
          <div className="space-y-1.5">
            <Label>Redirect URL After Signing</Label>
            <Input value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} placeholder="https://meet.google.com/..." />
          </div>
          <div className="space-y-1.5">
            <Label>Expiration Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !expiresAt && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiresAt ? format(expiresAt, "PPP") : "No expiration"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={expiresAt} onSelect={setExpiresAt} initialFocus className="p-3 pointer-events-auto" disabled={(d) => d < new Date()} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>One-Time Use</Label>
              <p className="text-xs text-muted-foreground">Link can only be signed once</p>
            </div>
            <Switch checked={isOneTime} onCheckedChange={setIsOneTime} />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes about this link..." rows={2} />
          </div>
          <Button onClick={handleSave} disabled={loading || !label.trim()} className="w-full">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {isEditing ? "Saving…" : "Creating…"}</> : isEditing ? "Save Changes" : "Create Link"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
