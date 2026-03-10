import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Briefcase,
  Plus,
  Users,
  MessageSquare,
  Sparkles,
  Building2,
  ArrowRight,
  Clock,
  CheckCircle,
  PauseCircle,
  Archive,
} from "lucide-react";
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

interface AgencyStats {
  totalClients: number;
  activeClients: number;
  pausedClients: number;
  totalMessages: number;
  dnaConfigurations: number;
}

export default function AgencyDashboardPage() {
  const { tenant, profile } = useAuth();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [stats, setStats] = useState<AgencyStats>({
    totalClients: 0,
    activeClients: 0,
    pausedClients: 0,
    totalMessages: 0,
    dnaConfigurations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tenant?.id) {
      fetchDashboardData();
    }
  }, [tenant?.id]);

  const fetchDashboardData = async () => {
    try {
      // Fetch clients (institutional profiles)
      const { data: profilesData, error: profilesError } = await supabase
        .from("institutional_profiles")
        .select("*")
        .eq("tenant_id", tenant?.id)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch message counts per client
      const { data: messagesData } = await supabase
        .from("personal_messages")
        .select("institutional_profile_id")
        .eq("tenant_id", tenant?.id);

      // Fetch DNA configurations
      const { data: dnaData } = await supabase
        .from("content_dna_analysis")
        .select("profile_id")
        .eq("tenant_id", tenant?.id);

      // Calculate counts per client
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
      setStats({
        totalClients: enrichedClients.length,
        activeClients: enrichedClients.filter((c) => c.client_status === "active").length,
        pausedClients: enrichedClients.filter((c) => c.client_status === "paused").length,
        totalMessages: messagesData?.length || 0,
        dnaConfigurations: dnaProfiles.size,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "paused":
        return <PauseCircle className="h-4 w-4 text-yellow-500" />;
      case "archived":
        return <Archive className="h-4 w-4 text-muted-foreground" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>;
      case "paused":
        return <Badge variant="outline" className="border-yellow-500/30 text-yellow-600">Paused</Badge>;
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="default">Active</Badge>;
    }
  };

  const agencyName = tenant?.institution_name || "Your Firm";

  return (
    <>
      <SEOHead
        title={`${agencyName} | CampusVoice.AI`}
        description="Manage your partner institutions from the agency partner dashboard."
      />

      <div className="bg-background">

        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-primary/30">
                    <Briefcase className="h-3 w-3 mr-1.5" />
                    Agency Partner
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  {agencyName} Partner Hub
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your partner institutions and their content
                </p>
              </div>
              <Link to="/agency/clients">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Institution
                </Button>
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Active Institutions
                      </p>
                      <p className="text-3xl font-bold">{stats.activeClients}</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Messages
                      </p>
                      <p className="text-3xl font-bold">{stats.totalMessages}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        DNA Configs
                      </p>
                      <p className="text-3xl font-bold">
                        {stats.dnaConfigurations}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Paused Institutions
                      </p>
                      <p className="text-3xl font-bold">{stats.pausedClients}</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                      <PauseCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Clients Grid */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Partner Institutions</CardTitle>
                <Link to="/agency/clients">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading clients...
                  </div>
                ) : clients.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-2">
                      No clients yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Add your first university client to get started.
                    </p>
                    <Link to="/agency/clients">
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add First Client
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clients.slice(0, 6).map((client) => (
                      <Link
                        key={client.id}
                        to={`/agency/clients?selected=${client.id}`}
                        className="block"
                      >
                        <Card className="hover:border-primary/30 transition-colors cursor-pointer h-full">
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                  backgroundColor:
                                    client.config?.primaryColor || "#1F2A44",
                                }}
                              >
                                {client.config?.logoUrl ? (
                                  <img
                                    src={client.config.logoUrl}
                                    alt={client.name}
                                    className="w-8 h-8 object-contain"
                                  />
                                ) : (
                                  <Building2 className="h-6 w-6 text-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-foreground truncate">
                                    {client.name}
                                  </h3>
                                  {getStatusIcon(client.client_status)}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{client.messageCount} messages</span>
                                  {client.hasDNA && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Sparkles className="h-3 w-3" />
                                        DNA
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              <Link to="/build">
                <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Build Message</h3>
                      <p className="text-sm text-muted-foreground">
                        Create on-brand content
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/library/personal">
                <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Recent Messages</h3>
                      <p className="text-sm text-muted-foreground">
                        View your message library
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/agency/clients">
                <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <Plus className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Manage Clients</h3>
                      <p className="text-sm text-muted-foreground">
                        Add or edit clients
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
