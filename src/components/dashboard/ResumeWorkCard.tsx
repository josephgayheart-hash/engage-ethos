import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PenTool, FileText, Map, ArrowRight, Sparkles } from "lucide-react";

interface LastAction {
  tool_name: string;
  action: string;
  metadata: Record<string, any>;
  created_at: string;
}

const toolConfig: Record<string, {
  icon: typeof PenTool;
  label: string;
  pastTense: string;
  nextSteps: { label: string; href: string }[];
}> = {
  builder: {
    icon: PenTool,
    label: "Message Builder",
    pastTense: "built a message",
    nextSteps: [
      { label: "Evaluate It", href: "/evaluate" },
      { label: "View Library", href: "/library" },
      { label: "Build Another", href: "/build" },
    ],
  },
  evaluator: {
    icon: FileText,
    label: "Evaluator",
    pastTense: "evaluated a message",
    nextSteps: [
      { label: "Build a New Message", href: "/build" },
      { label: "View Library", href: "/library" },
      { label: "Evaluate Another", href: "/evaluate" },
    ],
  },
  mapper: {
    icon: Map,
    label: "Journey Designer",
    pastTense: "designed a journey",
    nextSteps: [
      { label: "Build a Message", href: "/build" },
      { label: "View Library", href: "/library" },
      { label: "Design Another", href: "/strategy" },
    ],
  },
};

export function ResumeWorkCard() {
  const { profile } = useAuth();
  const [lastAction, setLastAction] = useState<LastAction | null>(null);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchLastAction = async () => {
      const { data } = await supabase
        .from("tool_usage_events")
        .select("tool_name, action, metadata, created_at")
        .eq("user_id", profile.id)
        .in("tool_name", ["builder", "evaluator", "mapper"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setLastAction(data[0] as LastAction);
      }
    };

    fetchLastAction();
  }, [profile?.id]);

  if (!lastAction) return null;

  const config = toolConfig[lastAction.tool_name];
  if (!config) return null;

  // Only show if the action was within the last 24 hours
  const actionAge = Date.now() - new Date(lastAction.created_at).getTime();
  if (actionAge > 24 * 60 * 60 * 1000) return null;

  const Icon = config.icon;
  const audience = lastAction.metadata?.audience || lastAction.metadata?.profileName;
  const contextLabel = audience ? ` for ${audience}` : "";

  return (
    <Card className="border-secondary/30 bg-secondary/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
            <Icon className="w-4.5 h-4.5 text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              <p className="text-sm font-medium text-foreground">
                Welcome back! You recently {config.pastTense}{contextLabel}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {config.nextSteps.map((step) => (
                <Button key={step.label} variant="outline" size="sm" asChild className="gap-1 text-xs h-7">
                  <Link to={step.href}>
                    {step.label}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ResumeWorkCard;
