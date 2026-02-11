import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAgencyMode } from "@/hooks/useAgencyMode";
import { Building2, ArrowRight, Users, Settings } from "lucide-react";

interface InstitutionStatus {
  profileCount: number;
  subUnitCount: number;
  primaryName: string | null;
}

export function InstitutionManagementCard() {
  const { tenant, isAdmin } = useAuth();
  const { isAgency, labels } = useAgencyMode();
  const [status, setStatus] = useState<InstitutionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant?.id) {
      setLoading(false);
      return;
    }

    const fetchProfiles = async () => {
      const { data } = await supabase
        .from("institutional_profiles")
        .select("id, name, profile_type, parent_profile_id")
        .eq("tenant_id", tenant.id);

      if (data) {
        const primary = data.find((p) => !p.parent_profile_id);
        const subUnits = data.filter((p) => p.parent_profile_id);
        setStatus({
          profileCount: data.length,
          subUnitCount: subUnits.length,
          primaryName: primary?.name || tenant.institution_name || null,
        });
      }
      setLoading(false);
    };

    fetchProfiles();
  }, [tenant?.id]);

  const settingsHref = isAgency ? "/agency/clients" : "/university-settings";
  const entityLabel = isAgency ? labels.profileTerm : "Institution";

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-primary" />
            {entityLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-primary" />
            {entityLabel}
          </CardTitle>
          {status && status.profileCount > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {status.profileCount} profile{status.profileCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!status || status.profileCount === 0 ? (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground mb-2">
              No institutional profile set up yet.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to={settingsHref}>
                Set Up Profile <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {status.primaryName && (
              <p className="text-sm font-medium truncate">{status.primaryName}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 rounded-md bg-muted/50">
                <p className="text-2xl font-bold font-serif">{status.subUnitCount}</p>
                <p className="text-xs text-muted-foreground">Sub-Units</p>
              </div>
              <div className="text-center p-2 rounded-md bg-muted/50">
                <p className="text-2xl font-bold font-serif">{status.profileCount}</p>
                <p className="text-xs text-muted-foreground">Total Profiles</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild className="flex-1 text-xs">
                <Link to={settingsHref}>
                  <Settings className="w-3.5 h-3.5 mr-1" />
                  Manage
                </Link>
              </Button>
              {isAdmin && (
                <Button variant="ghost" size="sm" asChild className="flex-1 text-xs">
                  <Link to="/university-dashboard">
                    <Users className="w-3.5 h-3.5 mr-1" />
                    Team
                  </Link>
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
