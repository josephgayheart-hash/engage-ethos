import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, FileSignature } from "lucide-react";
import { CreateNDALinkDialog } from "@/components/admin/nda/CreateNDALinkDialog";
import { NDALinksTable } from "@/components/admin/nda/NDALinksTable";
import { NDAResponsesTable } from "@/components/admin/nda/NDAResponsesTable";

export default function NDALinksPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileSignature className="h-6 w-6" /> NDA Links
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create and manage confidentiality agreement links for demos
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Create NDA Link
        </Button>
      </div>

      <Tabs defaultValue="links">
        <TabsList>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="responses">Signed Responses</TabsTrigger>
        </TabsList>
        <TabsContent value="links">
          <NDALinksTable refreshKey={refreshKey} onRefresh={() => setRefreshKey((k) => k + 1)} />
        </TabsContent>
        <TabsContent value="responses">
          <NDAResponsesTable />
        </TabsContent>
      </Tabs>

      <CreateNDALinkDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => { setCreateOpen(false); setRefreshKey((k) => k + 1); }}
      />
    </div>
  );
}
