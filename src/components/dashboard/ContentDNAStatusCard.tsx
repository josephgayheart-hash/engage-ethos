import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, ArrowRight } from "lucide-react";

interface DNAStatus {
  totalProfiles: number;
  activeProfiles: number;
  lastAnalyzedAt: string | null;
}

export function ContentDNAStatusCard() {
  const { tenant } = useAuth();
  const [status, setStatus] = useState<DNAStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant?.id) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      const { data } = await supabase
        .from("content_dna_analysis")
        .select("id, last_analyzed_at, voice_analysis, brand_platform")
        .eq("tenant_id", tenant.id);

      if (data) {
        const active = data.filter((d) => d.last_analyzed_at !== null);
        const mostRecent = active.sort(
          (a, b) =>
            new Date(b.last_analyzed_at!).getTime() -
            new Date(a.last_analyzed_at!).getTime()
        )[0];

        setStatus({
          totalProfiles: data.length,
          activeProfiles: active.length,
          lastAnalyzedAt: mostRecent?.last_analyzed_at || null,
        });
      }

      setLoading(false);
    };

    fetch();
  }, [tenant?.id]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-[hsl(270_70%_55%)]" />
            Content DNA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasActiveDNA = status && status.activeProfiles > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-[hsl(270_70%_55%)]" />
            Content DNA
          </CardTitle>
          {hasActiveDNA && (
            <Badge className="bg-[hsl(82_85%_45%)] text-[hsl(82_100%_10%)] text-[10px]">
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!status || status.totalProfiles === 0 ? (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground mb-2">
              No Content DNA configured yet.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/content-dna">
                Set Up DNA <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 rounded-md bg-muted/50">
                <p className="text-2xl font-bold font-serif">{status.activeProfiles}</p>
                <p className="text-xs text-muted-foreground">Active Profiles</p>
              </div>
              <div className="text-center p-2 rounded-md bg-muted/50">
                <p className="text-2xl font-bold font-serif">{status.totalProfiles}</p>
                <p className="text-xs text-muted-foreground">Total Profiles</p>
              </div>
            </div>
            {status.lastAnalyzedAt && (
              <p className="text-xs text-muted-foreground">
                Last analyzed:{" "}
                {new Date(status.lastAnalyzedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
            <Button variant="ghost" size="sm" asChild className="w-full text-xs">
              <Link to="/admin/content-dna">
                Manage DNA Studio <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
