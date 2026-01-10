import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  Building2,
  MoreHorizontal,
  Pencil,
  Trash2,
  PauseCircle,
  PlayCircle,
  Archive,
  Sparkles,
  MessageSquare,
  Search,
  CheckCircle,
  Palette,
} from "lucide-react";
import { Header } from "@/components/Header";
import { SEOHead } from "@/components/SEOHead";

interface ClientProfile {
  id: string;
  name: string;
  profile_type: string;
  client_status: string;
  config: {
    primaryColor?: string;
    logoUrl?: string;
  };
  created_at: string;
  updated_at: string;
  messageCount?: number;
  hasDNA?: boolean;
}

export default function AgencyClientsPage() {
  const { tenant, profile } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    primaryColor: "#1F2A44",
  });

  useEffect(() => {
    if (tenant?.id) {
      fetchClients();
    }
  }, [tenant?.id]);

  useEffect(() => {
    let result = clients;

    if (searchQuery) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((c) => c.client_status === statusFilter);
    }

    setFilteredClients(result);
  }, [clients, searchQuery, statusFilter]);

  const fetchClients = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("institutional_profiles")
        .select("*")
        .eq("tenant_id", tenant?.id)
        .order("name", { ascending: true });

      if (profilesError) throw profilesError;

      // Fetch message counts
      const { data: messagesData } = await supabase
        .from("personal_messages")
        .select("institutional_profile_id")
        .eq("tenant_id", tenant?.id);

      // Fetch DNA configurations
      const { data: dnaData } = await supabase
        .from("content_dna_analysis")
        .select("profile_id")
        .eq("tenant_id", tenant?.id);

      const messageCounts: Record<string, number> = {};
      const dnaProfiles = new Set<string>();

      messagesData?.forEach((msg) => {
        if (msg.institutional_profile_id) {
          messageCounts[msg.institutional_profile_id] =
            (messageCounts[msg.institutional_profile_id] || 0) + 1;
        }
      });

      dnaData?.forEach((dna) => {
        if (dna.profile_id) {
          dnaProfiles.add(dna.profile_id);
        }
      });

      const enrichedClients: ClientProfile[] = (profilesData || []).map((p) => ({
        id: p.id,
        name: p.name,
        profile_type: p.profile_type,
        client_status: p.client_status || "active",
        config: p.config as ClientProfile["config"],
        created_at: p.created_at,
        updated_at: p.updated_at,
        messageCount: messageCounts[p.id] || 0,
        hasDNA: dnaProfiles.has(p.id),
      }));

      setClients(enrichedClients);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClient = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a client name.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("institutional_profiles").insert({
        tenant_id: tenant?.id,
        created_by_user_id: profile?.id,
        name: formData.name,
        profile_type: "university",
        client_status: "active",
        config: {
          primaryColor: formData.primaryColor,
        },
      });

      if (error) throw error;

      toast({
        title: "Client added",
        description: `${formData.name} has been added to your clients.`,
      });

      setShowAddDialog(false);
      setFormData({ name: "", primaryColor: "#1F2A44" });
      fetchClients();
    } catch (error: any) {
      console.error("Error adding client:", error);
      toast({
        title: "Error",
        description: "Failed to add client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClient = async () => {
    if (!selectedClient || !formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("institutional_profiles")
        .update({
          name: formData.name,
          config: {
            ...selectedClient.config,
            primaryColor: formData.primaryColor,
          },
        })
        .eq("id", selectedClient.id);

      if (error) throw error;

      toast({
        title: "Client updated",
        description: `${formData.name} has been updated.`,
      });

      setShowEditDialog(false);
      setSelectedClient(null);
      setFormData({ name: "", primaryColor: "#1F2A44" });
      fetchClients();
    } catch (error: any) {
      console.error("Error updating client:", error);
      toast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (
    clientId: string,
    newStatus: string,
    clientName: string
  ) => {
    try {
      const { error } = await supabase
        .from("institutional_profiles")
        .update({ client_status: newStatus })
        .eq("id", clientId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `${clientName} is now ${newStatus}.`,
      });

      fetchClients();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${clientName}? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("institutional_profiles")
        .delete()
        .eq("id", clientId);

      if (error) throw error;

      toast({
        title: "Client deleted",
        description: `${clientName} has been removed.`,
      });

      fetchClients();
    } catch (error: any) {
      console.error("Error deleting client:", error);
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (client: ClientProfile) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      primaryColor: client.config?.primaryColor || "#1F2A44",
    });
    setShowEditDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "paused":
        return (
          <Badge variant="outline" className="border-yellow-500/30 text-yellow-600">
            <PauseCircle className="h-3 w-3 mr-1" />
            Paused
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="secondary">
            <Archive className="h-3 w-3 mr-1" />
            Archived
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <SEOHead
        title="Clients | CampusVoice.AI"
        description="Manage your university clients."
      />

      <div className="min-h-screen bg-background">
        <Header />

        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Clients</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your university clients and their content
                </p>
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">University Name *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          className="pl-10"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="e.g., State University"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Primary Brand Color</Label>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="color"
                            className="pl-10 w-32"
                            value={formData.primaryColor}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                primaryColor: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div
                          className="w-10 h-10 rounded-md border"
                          style={{ backgroundColor: formData.primaryColor }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddClient} disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Client"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      placeholder="Search clients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Clients Grid */}
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading clients...
              </div>
            ) : filteredClients.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-medium text-foreground mb-2">
                    {searchQuery || statusFilter !== "all"
                      ? "No matching clients"
                      : "No clients yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your filters."
                      : "Add your first university client to get started."}
                  </p>
                  {!searchQuery && statusFilter === "all" && (
                    <Button
                      onClick={() => setShowAddDialog(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Client
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map((client) => (
                  <Card
                    key={client.id}
                    className="hover:border-primary/30 transition-colors"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor:
                                client.config?.primaryColor || "#1F2A44",
                            }}
                          >
                            <Building2 className="h-6 w-6 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-foreground truncate">
                              {client.name}
                            </h3>
                            <div className="mt-1">
                              {getStatusBadge(client.client_status)}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(client)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {client.client_status !== "active" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(
                                    client.id,
                                    "active",
                                    client.name
                                  )
                                }
                              >
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Set Active
                              </DropdownMenuItem>
                            )}
                            {client.client_status !== "paused" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(
                                    client.id,
                                    "paused",
                                    client.name
                                  )
                                }
                              >
                                <PauseCircle className="h-4 w-4 mr-2" />
                                Pause
                              </DropdownMenuItem>
                            )}
                            {client.client_status !== "archived" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(
                                    client.id,
                                    "archived",
                                    client.name
                                  )
                                }
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                handleDeleteClient(client.id, client.name)
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {client.messageCount} messages
                        </span>
                        {client.hasDNA && (
                          <span className="flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5" />
                            DNA
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">University Name *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="edit-name"
                    className="pl-10"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Primary Brand Color</Label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="edit-color"
                      className="pl-10 w-32"
                      value={formData.primaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primaryColor: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div
                    className="w-10 h-10 rounded-md border"
                    style={{ backgroundColor: formData.primaryColor }}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditClient} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
