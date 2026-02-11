import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sparkles,
  ArrowRight,
  FileText,
  Layers,
  SlidersHorizontal,
  CheckCircle2,
} from "lucide-react";

interface DNARecord {
  id: string;
  last_analyzed_at: string | null;
  voice_analysis: Record<string, unknown> | null;
  brand_platform: Record<string, unknown> | null;
  sample_count: number;
  custom_instructions: string | null;
  profile_id: string | null;
}

interface DNAStatus {
  totalProfiles: number;
  activeProfiles: number;
  lastAnalyzedAt: string | null;
  totalSamples: number;
  overallTone: string | null;
  pillarCount: number;
  hasCustomInstructions: boolean;
  profileNames: string[];
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

    const fetchData = async () => {
      // Fetch DNA analysis records
      const { data } = await supabase
        .from("content_dna_analysis")
        .select(
          "id, last_analyzed_at, voice_analysis, brand_platform, sample_count, custom_instructions, profile_id"
        )
        .eq("tenant_id", tenant.id);

      if (!data || data.length === 0) {
        setStatus(null);
        setLoading(false);
        return;
      }

      const records = data as unknown as DNARecord[];
      const active = records.filter((d) => d.last_analyzed_at !== null);
      const mostRecent = active.sort(
        (a, b) =>
          new Date(b.last_analyzed_at!).getTime() -
          new Date(a.last_analyzed_at!).getTime()
      )[0];

      // Extract tone from the most recent active analysis
      let overallTone: string | null = null;
      if (mostRecent?.voice_analysis) {
        const va = mostRecent.voice_analysis as Record<string, unknown>;
        overallTone =
          (va.overallTone as string) ||
          (va.overall_tone as string) ||
          null;
      }

      // Count brand pillars from the most recent
      let pillarCount = 0;
      if (mostRecent?.brand_platform) {
        const bp = mostRecent.brand_platform as Record<string, unknown>;
        const pillars = (bp.pillars as unknown[]) || (bp.brandPillars as unknown[]);
        if (Array.isArray(pillars)) pillarCount = pillars.length;
      }

      // Total samples across all records
      const totalSamples = records.reduce((sum, r) => sum + (r.sample_count || 0), 0);

      // Custom instructions present on any record
      const hasCustomInstructions = records.some(
        (r) => r.custom_instructions && r.custom_instructions.trim().length > 0
      );

      // Fetch profile names for records that have profile_id
      const profileIds = records
        .map((r) => r.profile_id)
        .filter((id): id is string => id !== null);

      let profileNames: string[] = [];
      if (profileIds.length > 0) {
        const { data: profiles } = await supabase
          .from("institutional_profiles")
          .select("id, name")
          .in("id", profileIds);
        if (profiles) {
          profileNames = profiles.map((p) => p.name);
        }
      }

      setStatus({
        totalProfiles: records.length,
        activeProfiles: active.length,
        lastAnalyzedAt: mostRecent?.last_analyzed_at || null,
        totalSamples,
        overallTone,
        pillarCount,
        hasCustomInstructions,
        profileNames,
      });

      setLoading(false);
    };

    fetchData();
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
          <Skeleton className="h-28 w-full" />
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
          <div className="flex items-center gap-1.5">
            {status?.hasCustomInstructions && (
              <Badge variant="outline" className="text-[10px] gap-0.5">
                <SlidersHorizontal className="w-2.5 h-2.5" />
                Custom
              </Badge>
            )}
            {hasActiveDNA && (
              <Badge className="bg-[hsl(82_85%_45%)] text-[hsl(82_100%_10%)] text-[10px]">
                Active
              </Badge>
            )}
          </div>
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
            {/* Voice tone summary */}
            {status.overallTone && (
              <p className="text-xs text-muted-foreground italic leading-snug">
                Tone: {status.overallTone}
              </p>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 rounded-md bg-muted/50">
                <p className="text-2xl font-bold font-serif">
                  {status.activeProfiles}
                </p>
                <p className="text-xs text-muted-foreground">Active Profiles</p>
              </div>
              <div className="text-center p-2 rounded-md bg-muted/50">
                <p className="text-2xl font-bold font-serif">
                  {status.totalProfiles}
                </p>
                <p className="text-xs text-muted-foreground">Total Profiles</p>
              </div>
            </div>

            {/* Metadata details */}
            <div className="space-y-1.5">
              {status.totalSamples > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="w-3 h-3" />
                  <span>{status.totalSamples} content sample{status.totalSamples !== 1 ? "s" : ""} analyzed</span>
                </div>
              )}
              {status.pillarCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Layers className="w-3 h-3" />
                  <span>{status.pillarCount} Brand Pillar{status.pillarCount !== 1 ? "s" : ""} defined</span>
                </div>
              )}
            </div>

            {/* Profile names with DNA */}
            {(status.profileNames?.length ?? 0) > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Profiles with DNA
                </p>
                <div className="flex flex-wrap gap-1">
                  {status.profileNames.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-0.5 text-[11px] bg-muted/60 px-1.5 py-0.5 rounded"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 text-[hsl(82_85%_45%)]" />
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
