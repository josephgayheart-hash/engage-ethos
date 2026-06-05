import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { diffWords, wordCount } from "@/lib/wordDiff";
import { Loader2, Save, GitCompare } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialOriginal?: string;
  initialFinal?: string;
  source?: "chat" | "manual";
  sourceMessageId?: string;
  promptContext?: string;
  model?: string;
  onSaved?: () => void;
}

export function LogEditDialog({
  open, onOpenChange, initialOriginal = "", initialFinal = "",
  source = "manual", sourceMessageId, promptContext, model, onSaved,
}: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [original, setOriginal] = useState(initialOriginal);
  const [final, setFinal] = useState(initialFinal);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setOriginal(initialOriginal);
      setFinal(initialFinal || initialOriginal);
      setNotes("");
    }
  }, [open, initialOriginal, initialFinal]);

  const diff = diffWords(original, final);
  const wcOrig = wordCount(original);
  const wcFinal = wordCount(final);

  const save = async () => {
    if (!user) return;
    if (!original.trim() || !final.trim()) {
      toast({ title: "Both versions required", description: "Paste the original and your final version.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("personal_ai_edits").insert({
      user_id: user.id,
      original_text: original,
      final_text: final,
      source,
      source_message_id: sourceMessageId ?? null,
      prompt_context: promptContext ?? null,
      model: model ?? null,
      word_count_original: wcOrig,
      word_count_final: wcFinal,
      words_removed: diff.removed,
      words_added: diff.added,
      notes: notes.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Edit logged", description: `${diff.removed.length} removed · ${diff.added.length} added` });
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" /> Log an edit
          </DialogTitle>
          <DialogDescription>
            Paste the AI's original draft and your final version. The system stores word-level deltas to learn your editing patterns.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Original (AI draft)</span>
              <Badge variant="outline" className="text-xs">{wcOrig} words</Badge>
            </Label>
            <Textarea
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              className="min-h-[280px] font-mono text-xs"
              placeholder="Paste the AI's original draft…"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Your final version</span>
              <Badge variant="outline" className="text-xs">{wcFinal} words</Badge>
            </Label>
            <Textarea
              value={final}
              onChange={(e) => setFinal(e.target.value)}
              className="min-h-[280px] font-mono text-xs"
              placeholder="Paste or type your final, shipped version…"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="font-medium mb-1 text-muted-foreground">Words removed ({diff.removed.length})</div>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 border rounded-md bg-muted/30 min-h-[40px]">
              {diff.removed.slice(0, 80).map((w, i) => (
                <Badge key={i} variant="destructive" className="text-[10px] font-mono">−{w}</Badge>
              ))}
              {diff.removed.length === 0 && <span className="text-muted-foreground">None</span>}
            </div>
          </div>
          <div>
            <div className="font-medium mb-1 text-muted-foreground">Words added ({diff.added.length})</div>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 border rounded-md bg-muted/30 min-h-[40px]">
              {diff.added.slice(0, 80).map((w, i) => (
                <Badge key={i} className="text-[10px] font-mono bg-emerald-600 hover:bg-emerald-600">+{w}</Badge>
              ))}
              {diff.added.length === 0 && <span className="text-muted-foreground">None</span>}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Notes (optional — what kind of edit, why?)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[60px] text-sm"
            placeholder="e.g. cut consultant-speak, tightened opening, restructured ask…"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
