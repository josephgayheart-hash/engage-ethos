import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Activity, ExternalLink, BarChart3, Globe, Video, MousePointerClick, Users, Save, Trash2,
} from "lucide-react";

const POSTHOG_BASE = "https://us.posthog.com";
const STORAGE_KEY = "platform_posthog_embed_url";

const QUICK_LINKS: { key: string; label: string; href: string; icon: typeof Activity; desc: string }[] = [
  { key: "web", label: "Web Analytics", href: `${POSTHOG_BASE}/web`, icon: Globe, desc: "Visitors, sources, pages, devices, geos" },
  { key: "dash", label: "Dashboards", href: `${POSTHOG_BASE}/dashboard`, icon: BarChart3, desc: "Custom KPI dashboards" },
  { key: "replays", label: "Session Replays", href: `${POSTHOG_BASE}/replay/home`, icon: Video, desc: "Watch real user sessions" },
  { key: "events", label: "Events Explorer", href: `${POSTHOG_BASE}/events`, icon: MousePointerClick, desc: "Live event stream & autocapture" },
  { key: "people", label: "Persons", href: `${POSTHOG_BASE}/persons`, icon: Users, desc: "Identified users by tenant & role" },
];

function normalizeEmbed(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  // If full iframe HTML pasted, extract src
  const m = trimmed.match(/src="([^"]+)"/i);
  return m ? m[1] : trimmed;
}

export function PostHogAnalyticsPanel() {
  const [embedUrl, setEmbedUrl] = useState("");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || "";
    setEmbedUrl(saved);
    setDraft(saved);
  }, []);

  const save = () => {
    const v = normalizeEmbed(draft);
    localStorage.setItem(STORAGE_KEY, v);
    setEmbedUrl(v);
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDraft("");
    setEmbedUrl("");
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3 flex-row items-start justify-between space-y-0 gap-4">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" /> PostHog Analytics
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Live tracking is on for every page. Jump into PostHog or embed a shared dashboard below.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={POSTHOG_BASE} target="_blank" rel="noreferrer">
            Open PostHog <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </a>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick-launch tabs */}
        <Tabs defaultValue="web" className="w-full">
          <TabsList className="grid grid-cols-5 w-full h-9">
            {QUICK_LINKS.map((l) => (
              <TabsTrigger key={l.key} value={l.key} className="text-xs gap-1.5">
                <l.icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{l.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {QUICK_LINKS.map((l) => (
            <TabsContent key={l.key} value={l.key} className="mt-3">
              <div className="rounded-lg border bg-muted/30 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-background border p-2">
                    <l.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{l.label}</p>
                    <p className="text-xs text-muted-foreground">{l.desc}</p>
                  </div>
                </div>
                <Button size="sm" asChild>
                  <a href={l.href} target="_blank" rel="noreferrer">
                    Open in PostHog <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </a>
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Embed slot */}
        <div className="rounded-lg border">
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b bg-muted/30">
            <p className="text-xs font-medium">Embedded dashboard</p>
            <div className="flex items-center gap-1.5">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Paste PostHog embed URL or <iframe src=...>"
                className="h-8 text-xs w-[360px] max-w-[50vw]"
              />
              <Button size="sm" variant="outline" className="h-8" onClick={save}>
                <Save className="w-3.5 h-3.5 mr-1" /> Save
              </Button>
              {embedUrl && (
                <Button size="sm" variant="ghost" className="h-8" onClick={clear}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="PostHog dashboard"
              className="w-full h-[640px] border-0 rounded-b-lg bg-background"
              allow="clipboard-write"
            />
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">No dashboard embedded yet</p>
              <p>
                In PostHog, open any dashboard or insight → <span className="font-medium">Share → Embed</span> → copy
                the iframe URL and paste it above. It only works for dashboards/insights set to{" "}
                <span className="font-medium">Public</span>.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
