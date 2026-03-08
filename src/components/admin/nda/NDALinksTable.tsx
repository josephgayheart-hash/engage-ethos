import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Ban, MoreHorizontal, ExternalLink, Pencil } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { NDALinkData } from "./CreateNDALinkDialog";
interface NDALink {
  id: string;
  slug: string;
  label: string;
  recipient_name: string | null;
  recipient_email: string | null;
  organization: string | null;
  redirect_url: string | null;
  expires_at: string | null;
  is_active: boolean;
  is_one_time: boolean;
  agreement_version: string;
  notes: string | null;
  created_at: string;
  status: string;
}

const statusColor: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  signed: "bg-blue-500/10 text-blue-700 border-blue-200",
  revoked: "bg-red-500/10 text-red-700 border-red-200",
  expired: "bg-amber-500/10 text-amber-700 border-amber-200",
};

export function NDALinksTable({ refreshKey, onRefresh, onEdit }: { refreshKey: number; onRefresh: () => void; onEdit: (link: NDALinkData) => void }) {
  const [links, setLinks] = useState<NDALink[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<NDALink | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("nda_links").select("*").order("created_at", { ascending: false });
      setLinks((data as unknown as NDALink[]) || []);
      setLoading(false);
    })();
  }, [refreshKey]);

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/nda/sign/${slug}`);
    toast({ title: "Link copied!" });
  };

  const revokeLink = async (id: string) => {
    await supabase.from("nda_links").update({ status: "revoked", is_active: false }).eq("id", id);
    toast({ title: "Link revoked" });
    onRefresh();
  };

  const deleteLink = async (link: NDALink) => {
    // Delete associated responses first
    await supabase.from("nda_responses").delete().eq("nda_link_id", link.id);
    const { error } = await supabase.from("nda_links").delete().eq("id", link.id);
    if (error) toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    else { toast({ title: "Link deleted" }); onRefresh(); }
    setDeleteTarget(null);
  };

  const duplicateLink = async (link: NDALink) => {
    const slug = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    await supabase.from("nda_links").insert({
      slug,
      label: `${link.label} (copy)`,
      recipient_name: link.recipient_name,
      recipient_email: link.recipient_email,
      organization: link.organization,
      redirect_url: link.redirect_url,
      expires_at: link.expires_at,
      is_one_time: link.is_one_time,
      notes: link.notes,
      created_by: (await supabase.auth.getUser()).data.user?.id || null,
    });
    toast({ title: "Link duplicated" });
    onRefresh();
  };

  if (loading) return <div className="py-8 text-center text-muted-foreground">Loading…</div>;

  if (!links.length) return (
    <div className="py-12 text-center text-muted-foreground">
      <p>No NDA links yet. Create one to get started.</p>
    </div>
  );

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Label</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map((link) => (
            <TableRow key={link.id}>
              <TableCell className="font-medium">{link.label}</TableCell>
              <TableCell>
                <div className="text-sm">
                  {link.recipient_name && <div>{link.recipient_name}</div>}
                  {link.recipient_email && <div className="text-muted-foreground text-xs">{link.recipient_email}</div>}
                  {!link.recipient_name && !link.recipient_email && <span className="text-muted-foreground">—</span>}
                </div>
              </TableCell>
              <TableCell>{link.organization || "—"}</TableCell>
              <TableCell>
                <Badge variant="outline" className={statusColor[link.status] || ""}>
                  {link.status}
                </Badge>
                {!link.is_one_time && <Badge variant="outline" className="ml-1 text-xs">reusable</Badge>}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{format(new Date(link.created_at), "MMM d, yyyy")}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {link.expires_at ? format(new Date(link.expires_at), "MMM d, yyyy") : "—"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyLink(link.slug)} title="Copy link">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(link)}>
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyLink(link.slug)}>
                        <Copy className="h-4 w-4 mr-2" /> Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(`/nda/sign/${link.slug}`, "_blank")}>
                        <ExternalLink className="h-4 w-4 mr-2" /> Open Signing Page
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateLink(link)}>
                        <Copy className="h-4 w-4 mr-2" /> Duplicate
                      </DropdownMenuItem>
                      {link.status === "active" && (
                        <DropdownMenuItem onClick={() => revokeLink(link.id)} className="text-destructive">
                          <Ban className="h-4 w-4 mr-2" /> Revoke
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => setDeleteTarget(link)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete NDA Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<span className="font-medium">{deleteTarget?.label}</span>"? This will also permanently remove all signed responses associated with this link. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteLink(deleteTarget)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
