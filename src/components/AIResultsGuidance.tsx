import { Link } from "react-router-dom";
import { Lightbulb, Settings, Dna, ArrowRight } from "lucide-react";
import { useContentDNAForGeneration } from "@/hooks/useContentDNAForGeneration";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";
import { useIndustry } from "@/contexts/IndustryContext";

interface AIResultsGuidanceProps {
  className?: string;
  /** Lighter variant for less prominent placements */
  variant?: "default" | "subtle";
}

export function AIResultsGuidance({ className = "", variant = "default" }: AIResultsGuidanceProps) {
  const { contentDNA } = useContentDNAForGeneration();
  const { profiles } = useInstitutionalProfiles();
  const { labels } = useIndustry();

  const profileLabel = labels.organizationProfile;
  const hasDNA = !!contentDNA;
  const hasProfile = (profiles?.length ?? 0) > 0;
  const bothConfigured = hasDNA && hasProfile;

  const heading = bothConfigured
    ? "Refine your results even further"
    : "Not getting the results you want?";

  const description = bothConfigured
    ? `Fine-tune your Content DNA or update your ${profileLabel.toLowerCase()} for even more precise, on-brand output.`
    : `AI-generated content improves dramatically when your voice and brand are configured. Set up your ${profileLabel.toLowerCase()} and Content DNA to unlock better results.`;

  if (variant === "subtle") {
    return (
      <div className={`flex items-center gap-2 text-xs text-muted-foreground py-2 ${className}`}>
        <Lightbulb className="w-3.5 h-3.5 shrink-0" />
        <span>
          Results improve with your{" "}
          <Link to="/settings" className="text-primary hover:underline">{profileLabel.toLowerCase()}</Link>
          {" & "}
          <Link to="/admin/content-dna" className="text-primary hover:underline">Content DNA</Link>.
        </span>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-border/50 bg-muted/20 p-4 space-y-2 ${className}`}>
      <div className="flex items-start gap-2.5">
        <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <div className="space-y-1.5 min-w-0">
          <p className="text-sm font-medium text-foreground">{heading}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {!hasProfile && (
              <Link
                to="/settings"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Set Up {profileLabel}
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            {hasProfile && (
              <Link
                to="/settings"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Update Profile
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            {!hasDNA && (
              <Link
                to="/admin/content-dna"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Dna className="w-3.5 h-3.5" />
                Configure Content DNA
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            {hasDNA && (
              <Link
                to="/admin/content-dna"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Dna className="w-3.5 h-3.5" />
                Refine DNA
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
