import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, Eye } from "lucide-react";
import { format } from "date-fns";
import { NDAResponseDetailDrawer } from "./NDAResponseDetailDrawer";

interface NDAResponse {
  id: string;
  nda_link_id: string;
  signer_name: string;
  signer_email: string;
  signer_organization: string | null;
  signer_title: string | null;
  typed_signature: string;
  drawn_signature_url: string | null;
  agreement_text: string;
  agreement_version: string | null;
  submitted_at: string;
  user_agent: string | null;
  timezone: string | null;
  redirect_url: string | null;
  public_slug: string | null;
  status: string;
}

export function NDAResponsesTable() {
  const [responses, setResponses] = useState<NDAResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<NDAResponse | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("nda_responses").select("*").order("submitted_at", { ascending: false });
      setResponses((data as unknown as NDAResponse[]) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = responses.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.signer_name.toLowerCase().includes(q) || r.signer_email.toLowerCase().includes(q) || (r.signer_organization || "").toLowerCase().includes(q);
  });

  const exportCSV = () => {
    const headers = ["Name", "Email", "Organization", "Title", "Signed At", "Agreement Version", "Slug"];
    const rows = filtered.map((r) => [
      r.signer_name, r.signer_email, r.signer_organization || "", r.signer_title || "",
      r.submitted_at, r.agreement_version || "", r.public_slug || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `nda-responses-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <div className="py-8 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, org…" className="pl-9" />
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={!filtered.length}>
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
      </div>

      {!filtered.length ? (
        <div className="py-12 text-center text-muted-foreground">
          {responses.length ? "No matching responses." : "No signed responses yet."}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Signer</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Signed At</TableHead>
                <TableHead>Version</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(r)}>
                  <TableCell>
                    <div className="font-medium">{r.signer_name}</div>
                    <div className="text-xs text-muted-foreground">{r.signer_email}</div>
                  </TableCell>
                  <TableCell>{r.signer_organization || "—"}</TableCell>
                  <TableCell>{r.signer_title || "—"}</TableCell>
                  <TableCell className="text-sm">{format(new Date(r.submitted_at), "MMM d, yyyy h:mm a")}</TableCell>
                  <TableCell>{r.agreement_version || "—"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <NDAResponseDetailDrawer response={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
