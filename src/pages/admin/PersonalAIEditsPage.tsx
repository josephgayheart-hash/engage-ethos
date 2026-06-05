import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { LogEditDialog } from "@/components/admin/LogEditDialog";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Plus, GitCompare, Sparkles, TrendingDown, TrendingUp,
  FileText, Loader2, Trash2, Download,
} from "lucide-react";

interface EditRow {
  id: string;
  original_text: string;
  final_text: string;
  source: string;
  source_message_id: string | null;
  prompt_context: string | null;
  model: string | null;
  word_count_original: number;
  word_count_final: number;
  words_removed: string[];
  words_added: string[];
  notes: string | null;
  created_at: string;
}

export default function PersonalAIEditsPage() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [edits, setEdits] = useState<EditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [logOpen, setLogOpen] = useState(false);
  const [selected, setSelected] = useState<EditRow | null>(null);

  useEffect(() => { document.title = "Edit Tracker — Personal AI"; }, []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("personal_ai_edits")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      toast({ title: "Failed to load edits", description: error.message, variant: "destructive" });
    } else {
      setEdits((data ?? []) as EditRow[]);
    }
    setLoading(false);
  };

  useEffect(() => { if (isSuperAdmin) load(); }, [isSuperAdmin]);

  const stats = useMemo(() => {
    const total = edits.length;
    if (!total) return { total: 0, avgReduction: 0, topRemoved: [] as [string, number][], topAdded: [] as [string, number][], totalRemoved: 0, totalAdded: 0 };
    const removed = new Map<string, number>();
    const added = new Map<string, number>();
    let pctSum = 0;
    let totalRemoved = 0, totalAdded = 0;
    for (const e of edits) {
      e.words_removed.forEach(w => { removed.set(w, (removed.get(w) ?? 0) + 1); totalRemoved++; });
      e.words_added.forEach(w => { added.set(w, (added.get(w) ?? 0) + 1); totalAdded++; });
      if (e.word_count_original > 0) {
        pctSum += (e.word_count_original - e.word_count_final) / e.word_count_original;
      }
    }
    const sortDesc = (m: Map<string, number>): [string, number][] =>
      Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20);
    return {
      total,
      avgReduction: Math.round((pctSum / total) * 100),
      topRemoved: sortDesc(removed),
      topAdded: sortDesc(added),
      totalRemoved,
      totalAdded,
    };
  }, [edits]);

  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;

  const remove = async (id: string) => {
    if (!confirm("Delete this edit?")) return;
    const { error } = await (supabase as any).from("personal_ai_edits").delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    setEdits(prev => prev.filter(e => e.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(edits, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tyler-edits-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-6 max-w-[1600px]">
        <header className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/personal-ai" className="gap-1"><ArrowLeft className="h-4 w-4" /> Workbench</Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <GitCompare className="h-6 w-6 text-primary" /> Tyler Edit Tracker
              </h1>
              <p className="text-sm text-muted-foreground">
                Your before/after dataset. After ~100–200 edits, this is more valuable than any static prompt.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportJson} disabled={!edits.length} className="gap-1">
              <Download className="h-4 w-4" /> Export JSON
            </Button>
            <Button size="sm" onClick={() => setLogOpen(true)} className="gap-1">
              <Plus className="h-4 w-4" /> Log an edit
            </Button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard label="Edits logged" value={stats.total} icon={FileText} />
          <StatCard label="Avg. length cut" value={`${stats.avgReduction}%`} icon={TrendingDown} hint="Original → final" />
          <StatCard label="Words removed" value={stats.totalRemoved} icon={TrendingDown} />
          <StatCard label="Words added" value={stats.totalAdded} icon={TrendingUp} />
        </div>

        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-260px)]">
          {/* Edits list */}
          <Card className="col-span-12 lg:col-span-5 flex flex-col min-h-0">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Recent edits</CardTitle>
            </CardHeader>
            <Separator />
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {loading && (
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                )}
                {!loading && edits.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No edits yet. Click "Log an edit" or use the inline button on any chat response.
                  </div>
                )}
                {edits.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setSelected(e)}
                    className={`w-full text-left rounded-md px-3 py-2 text-sm transition ${
                      selected?.id === e.id ? "bg-accent" : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(e.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </span>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px]">{e.source}</Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {e.word_count_original}→{e.word_count_final}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs text-foreground/80">
                      {e.final_text.slice(0, 160)}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Right rail: detail OR patterns */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-3 min-h-0">
            {selected ? (
              <Card className="flex-1 flex flex-col min-h-0">
                <CardHeader className="py-3 flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-sm">Edit detail</CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(selected.created_at).toLocaleString()} · {selected.model ?? "—"}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => remove(selected.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <Separator />
                <ScrollArea className="flex-1">
                  <CardContent className="p-4 space-y-4 text-sm">
                    <Section label={`Original (${selected.word_count_original} words)`} text={selected.original_text} muted />
                    <Section label={`Final (${selected.word_count_final} words)`} text={selected.final_text} />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Removed ({selected.words_removed.length})</div>
                        <div className="flex flex-wrap gap-1">
                          {selected.words_removed.slice(0, 60).map((w, i) => (
                            <Badge key={i} variant="destructive" className="text-[10px] font-mono">−{w}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Added ({selected.words_added.length})</div>
                        <div className="flex flex-wrap gap-1">
                          {selected.words_added.slice(0, 60).map((w, i) => (
                            <Badge key={i} className="text-[10px] font-mono bg-emerald-600 hover:bg-emerald-600">+{w}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    {selected.notes && (
                      <div className="p-3 bg-muted/40 rounded-md text-xs">
                        <div className="font-medium mb-1">Notes</div>
                        {selected.notes}
                      </div>
                    )}
                    {selected.prompt_context && (
                      <div className="p-3 bg-muted/40 rounded-md text-xs">
                        <div className="font-medium mb-1">Prompt context</div>
                        <div className="whitespace-pre-wrap line-clamp-6">{selected.prompt_context}</div>
                      </div>
                    )}
                  </CardContent>
                </ScrollArea>
              </Card>
            ) : (
              <>
                <PatternsCard title="Words you consistently REMOVE" items={stats.topRemoved} kind="removed" />
                <PatternsCard title="Words you consistently ADD" items={stats.topAdded} kind="added" />
              </>
            )}
          </div>
        </div>
      </div>

      <LogEditDialog
        open={logOpen}
        onOpenChange={setLogOpen}
        source="manual"
        onSaved={load}
      />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, hint }: { label: string; value: any; icon: any; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold mt-1">{value}</div>
        {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function Section({ label, text, muted }: { label: string; text: string; muted?: boolean }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      <div className={`whitespace-pre-wrap text-sm leading-relaxed p-3 rounded-md ${muted ? "bg-muted/40" : "bg-card border"}`}>
        {text}
      </div>
    </div>
  );
}

function PatternsCard({ title, items, kind }: { title: string; items: [string, number][]; kind: "removed" | "added" }) {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription className="text-xs">Top 20 across all edits.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {items.length === 0 ? (
          <div className="text-xs text-muted-foreground py-2">Log a few edits to see patterns emerge.</div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {items.map(([w, n]) => (
              <Badge
                key={w}
                className={`text-xs font-mono ${
                  kind === "removed"
                    ? "bg-destructive/10 text-destructive hover:bg-destructive/15 border border-destructive/30"
                    : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 border border-emerald-500/30"
                }`}
                variant="outline"
              >
                {kind === "removed" ? "−" : "+"}{w} <span className="opacity-60 ml-1">×{n}</span>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
