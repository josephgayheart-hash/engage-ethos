import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";

interface NDAResponse {
  id: string;
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

interface Props {
  response: NDAResponse | null;
  onClose: () => void;
}

export function NDAResponseDetailDrawer({ response, onClose }: Props) {
  if (!response) return null;

  const r = response;

  return (
    <Sheet open={!!response} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Signed NDA Response</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-4">
          {/* Signer info */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Signer</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{r.signer_name}</span></div>
              <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{r.signer_email}</span></div>
              <div><span className="text-muted-foreground">Org:</span> {r.signer_organization || "—"}</div>
              <div><span className="text-muted-foreground">Title:</span> {r.signer_title || "—"}</div>
            </div>
          </div>

          {/* Signature */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Signature</h3>
            <div className="border rounded-md p-3 bg-muted/30">
              <p className="font-serif text-lg italic">{r.typed_signature}</p>
            </div>
            {r.drawn_signature_url && (
              <div className="border rounded-md p-3 bg-background">
                <img src={r.drawn_signature_url} alt="Drawn signature" className="max-h-24 mx-auto" />
              </div>
            )}
          </div>

          {/* Agreement */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Agreement Text</h3>
              {r.agreement_version && <Badge variant="outline" className="text-xs">v{r.agreement_version}</Badge>}
            </div>
            <div className="max-h-48 overflow-y-auto text-xs leading-relaxed text-muted-foreground border rounded-md p-3 whitespace-pre-line">
              {r.agreement_text}
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Metadata</h3>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div><span className="font-medium text-foreground">Signed:</span> {format(new Date(r.submitted_at), "PPpp")}</div>
              <div><span className="font-medium text-foreground">Timezone:</span> {r.timezone || "—"}</div>
              <div><span className="font-medium text-foreground">Slug:</span> {r.public_slug || "—"}</div>
              <div><span className="font-medium text-foreground">Redirect URL:</span> {r.redirect_url || "—"}</div>
              <div><span className="font-medium text-foreground">User Agent:</span> <span className="break-all">{r.user_agent || "—"}</span></div>
              <div><span className="font-medium text-foreground">Status:</span> <Badge variant="outline" className="text-xs">{r.status}</Badge></div>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print Response
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
