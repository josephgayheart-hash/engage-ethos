import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Save, Brain } from "lucide-react";

interface Fact { id: string; fact: string; category: string | null; created_at: string }

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultPrompt: string;
  onProfileSaved?: (systemPrompt: string) => void;
}

export function MemoryDialog({ open, onOpenChange, defaultPrompt, onProfileSaved }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [facts, setFacts] = useState<Fact[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const [{ data: prof }, { data: f }] = await Promise.all([
          supabase.from("personal_ai_profile").select("system_prompt,memory_enabled").maybeSingle(),
          supabase.from("personal_ai_facts").select("id,fact,category,created_at").order("created_at", { ascending: false }),
        ]);
        setSystemPrompt(prof?.system_prompt ?? defaultPrompt);
        setMemoryEnabled(prof?.memory_enabled ?? true);
        setFacts((f as Fact[]) ?? []);
      } catch (e: any) {
        toast({ title: "Failed to load memory", description: e.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [open, defaultPrompt, toast]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) throw new Error("Not signed in");
      const { error } = await supabase.from("personal_ai_profile").upsert({
        user_id: uid,
        system_prompt: systemPrompt,
        memory_enabled: memoryEnabled,
      });
      if (error) throw error;
      toast({ title: "Profile saved", description: "Applied to all new chats." });
      onProfileSaved?.(systemPrompt);
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteFact = async (id: string) => {
    const prev = facts;
    setFacts(facts.filter(f => f.id !== id));
    const { error } = await supabase.from("personal_ai_facts").delete().eq("id", id);
    if (error) { setFacts(prev); toast({ title: "Delete failed", description: error.message, variant: "destructive" }); }
  };

  const clearAll = async () => {
    if (!confirm(`Delete all ${facts.length} learned facts?`)) return;
    const ids = facts.map(f => f.id);
    setFacts([]);
    const { error } = await supabase.from("personal_ai_facts").delete().in("id", ids);
    if (error) toast({ title: "Clear failed", description: error.message, variant: "destructive" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Brain className="h-5 w-5" /> Memory</DialogTitle>
          <DialogDescription>
            Editable "about you" profile + facts the assistant has learned across chats. Both are private to your account and injected into every new conversation.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="facts">Learned facts ({facts.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-3 mt-4">
              <p className="text-xs text-muted-foreground">
                Always-on context. Voice rules, role, banned words, defaults. Closest thing to ChatGPT's Custom Instructions.
              </p>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[260px] font-mono text-xs leading-relaxed"
              />
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={memoryEnabled} onCheckedChange={setMemoryEnabled} />
                  Use learned facts in chats
                </label>
                <Button onClick={saveProfile} disabled={saving} size="sm">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="facts" className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Durable facts auto-extracted after each chat. Delete anything wrong or sensitive.
                </p>
                {facts.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive">
                    Clear all
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[320px] rounded-md border">
                {facts.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No facts yet. Have a few chats and the assistant will remember durable things about you (role, preferences, projects, people).
                  </div>
                ) : (
                  <ul className="divide-y">
                    {facts.map(f => (
                      <li key={f.id} className="flex items-start gap-3 p-3 group">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{f.fact}</p>
                          {f.category && <Badge variant="secondary" className="mt-1 text-[10px] font-normal">{f.category}</Badge>}
                        </div>
                        <button
                          onClick={() => deleteFact(f.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                          aria-label="Delete fact"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
