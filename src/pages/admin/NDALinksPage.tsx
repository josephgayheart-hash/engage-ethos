import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, FileSignature } from "lucide-react";
import { CreateNDALinkDialog, type NDALinkData } from "@/components/admin/nda/CreateNDALinkDialog";
import { NDALinksTable } from "@/components/admin/nda/NDALinksTable";
import { NDAResponsesTable } from "@/components/admin/nda/NDAResponsesTable";

export default function NDALinksPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<NDALinkData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (link: NDALinkData) => {
    setEditingLink(link);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingLink(null);
    setDialogOpen(true);
  };

  const handleSaved = () => {
    setDialogOpen(false);
    setEditingLink(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileSignature className="h-6 w-6" /> NDA Links
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create and manage confidentiality agreement links for demos
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" /> Create NDA Link
        </Button>
      </div>

      <Tabs defaultValue="links">
        <TabsList>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="responses">Signed Responses</TabsTrigger>
        </TabsList>
        <TabsContent value="links">
          <NDALinksTable refreshKey={refreshKey} onRefresh={() => setRefreshKey((k) => k + 1)} onEdit={handleEdit} />
        </TabsContent>
        <TabsContent value="responses">
          <NDAResponsesTable />
        </TabsContent>
      </Tabs>

      <CreateNDALinkDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditingLink(null); }}
        onCreated={handleSaved}
        editingLink={editingLink}
      />
    </div>
  );
}
