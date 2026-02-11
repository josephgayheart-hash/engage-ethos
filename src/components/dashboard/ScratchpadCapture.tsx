import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles, ChevronDown, ChevronUp, X, Mail, MessageSquare,
  Map, Search, Lightbulb, Clipboard, ArrowRight, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useContentDNA } from "@/hooks/useContentDNA";
import { useUserDrafts } from "@/hooks/useUserDrafts";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const STORAGE_KEY = "campusvoice_scratchpad_draft";

// Icon mapping from classify response
const iconMap: Record<string, React.ElementType> = {
  mail: Mail,
  "message-square": MessageSquare,
  map: Map,
  search: Search,
  lightbulb: Lightbulb,
  clipboard: Clipboard,
  sparkles: Sparkles,
};

// Tool routing
const toolRoutes: Record<string, { path: string; label: string; color: string }> = {
  builder: { path: "/build", label: "Message Builder", color: "bg-primary text-primary-foreground" },
  evaluator: { path: "/evaluate", label: "Evaluator", color: "bg-accent text-accent-foreground" },
  journey: { path: "/strategy", label: "Journey Designer", color: "bg-secondary text-secondary-foreground" },
  copywriter: { path: "/playground", label: "AI Copywriter", color: "bg-primary text-primary-foreground" },
  analyzer: { path: "/web-content-analyzer", label: "Content Analyzer", color: "bg-accent text-accent-foreground" },
  "content-dna": { path: "/admin/content-dna", label: "Content DNA Studio", color: "bg-accent text-accent-foreground" },
  profiles: { path: "/settings", label: "Institutional Profiles", color: "bg-primary text-primary-foreground" },
};

interface ClassifyResult {
  intent: string;
  hint_text: string;
  icon: string;
}

export function ScratchpadCapture() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { analysis } = useContentDNA();
  const { drafts } = useUserDrafts();
  const { profiles } = useInstitutionalProfiles();

  const [rawText, setRawText] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || ""; } catch { return ""; }
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [classifyResult, setClassifyResult] = useState<ClassifyResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [organizedText, setOrganizedText] = useState("");
  const [showResults, setShowResults] = useState(false);

  const classifyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Persist to localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, rawText); } catch {}
  }, [rawText]);

  // Auto-expand if there's saved text
  useEffect(() => {
    if (rawText.length > 0) setIsExpanded(true);
  }, []);

  // Debounced classify
  const classifyNotes = useCallback(async (text: string) => {
    if (text.trim().length < 30) {
      setClassifyResult(null);
      return;
    }
    setIsClassifying(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/organize-scratchpad`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ stage: "classify", rawText: text }),
        }
      );
      if (!resp.ok) {
        setClassifyResult(null);
        return;
      }
      const data = await resp.json();
      setClassifyResult(data);
    } catch {
      setClassifyResult(null);
    } finally {
      setIsClassifying(false);
    }
  }, []);

  const handleTextChange = (val: string) => {
    setRawText(val);
    setShowResults(false);
    setOrganizedText("");
    if (classifyTimer.current) clearTimeout(classifyTimer.current);
    classifyTimer.current = setTimeout(() => classifyNotes(val), 1500);
  };

  // Build context for organize call
  const buildContext = () => {
    let contentDNASummary = "";
    if (analysis?.voice_analysis) {
      const va = analysis.voice_analysis;
      const parts: string[] = [];
      if (va.summary) parts.push(va.summary);
      if (va.overallTone) parts.push(`Tone: ${va.overallTone}`);
      if (va.sentenceStyle) parts.push(`Style: ${va.sentenceStyle}`);
      contentDNASummary = parts.join(". ");
    }
    const recentDraftTitles = drafts
      .slice(0, 5)
      .map((d) => d.title || `Untitled ${d.draft_type}`)
      .filter(Boolean);
    const primaryProfile = profiles.find(p => p.profileType === "university") || profiles[0];
    const institutionalProfileName = primaryProfile?.name || "";
    return { contentDNASummary, recentDraftTitles, institutionalProfileName };
  };

  // Organize with streaming
  const handleOrganize = async () => {
    if (rawText.trim().length < 10) return;
    setIsOrganizing(true);
    setOrganizedText("");
    setShowResults(true);

    abortRef.current = new AbortController();
    const { contentDNASummary, recentDraftTitles, institutionalProfileName } = buildContext();

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/organize-scratchpad`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            stage: "organize",
            rawText,
            contentDNASummary: contentDNASummary || undefined,
            recentDraftTitles: recentDraftTitles.length ? recentDraftTitles : undefined,
            institutionalProfileName: institutionalProfileName || undefined,
          }),
          signal: abortRef.current.signal,
        }
      );

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Failed to organize" }));
        setOrganizedText(`⚠️ ${err.error || "Something went wrong."}`);
        setIsOrganizing(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setOrganizedText(accumulated);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Flush remaining
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setOrganizedText(accumulated);
            }
          } catch {}
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setOrganizedText("⚠️ Something went wrong. Please try again.");
      }
    } finally {
      setIsOrganizing(false);
    }
  };

  const handleClear = () => {
    setRawText("");
    setClassifyResult(null);
    setOrganizedText("");
    setShowResults(false);
    if (abortRef.current) abortRef.current.abort();
  };

  const handleToolClick = (tool: string) => {
    const route = toolRoutes[tool];
    if (route) navigate(route.path);
  };

  const HintIcon = classifyResult?.icon ? iconMap[classifyResult.icon] || Sparkles : Sparkles;

  if (!profile) return null;

  return (
    <Card className="relative overflow-hidden border-border/60 bg-card shadow-md transition-all duration-300">
      {/* Subtle top accent gradient */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary opacity-80" />

      <CardContent className="p-4 pt-5 space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            <Sparkles className="h-4 w-4 text-secondary" />
            <span>Quick Brief</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>

          {rawText.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        {/* Collapsed: single-line input */}
        {!isExpanded && (
          <div
            className="cursor-text rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-muted-foreground hover:border-primary/40 transition-colors"
            onClick={() => setIsExpanded(true)}
          >
            {rawText || "Drop your meeting notes, talking points, or rough ideas here..."}
          </div>
        )}

        {/* Expanded: textarea + actions */}
        {isExpanded && (
          <div className="space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <Textarea
              value={rawText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Drop your meeting notes, talking points, or rough ideas here... e.g. 'Need to reach admitted students who haven't enrolled. Dean wants a 3-touch sequence by next week. Financial aid angle might work.'"
              className="min-h-[100px] resize-none border-border/60 bg-background/50 text-sm leading-relaxed focus:border-primary/50 transition-colors"
              autoFocus
            />

            {/* Live intent hint */}
            {(classifyResult || isClassifying) && (
              <div className="flex items-center gap-2 animate-in fade-in-0 duration-300">
                {isClassifying ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Reading your notes...</span>
                  </div>
                ) : classifyResult ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <HintIcon className="h-3.5 w-3.5 text-accent" />
                    <span className="italic">{classifyResult.hint_text}</span>
                  </div>
                ) : null}
              </div>
            )}

            {/* Action row */}
            <div className="flex items-center justify-end gap-2">
              <Button
                onClick={handleOrganize}
                disabled={isOrganizing || rawText.trim().length < 10}
                size="sm"
                className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isOrganizing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Organize My Thoughts
              </Button>
            </div>
          </div>
        )}

        {/* Results panel */}
        {showResults && organizedText && (
          <div className="animate-in fade-in-0 slide-in-from-bottom-3 duration-500 pt-2 border-t border-border/40">
            <div className="prose prose-sm max-w-none text-foreground
              prose-headings:text-foreground prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
              prose-h3:text-sm prose-h3:text-primary
              prose-p:text-sm prose-p:leading-relaxed prose-p:text-foreground/90
              prose-strong:text-foreground prose-strong:font-semibold
              prose-li:text-sm prose-li:text-foreground/90
              prose-ul:my-1 prose-ol:my-1
            ">
              <ReactMarkdown
                components={{
                  // Render tool badges inline
                  strong: ({ children }) => {
                    const text = String(children);
                    // Check if this is a "Tool:" line
                    if (text === "Tool:") {
                      return <strong className="text-accent">{children}</strong>;
                    }
                    if (text === "Why:") {
                      return <strong className="text-muted-foreground">{children}</strong>;
                    }
                    return <strong>{children}</strong>;
                  },
                  // Make h3 recommendation headers clickable-looking
                  h3: ({ children }) => {
                    return (
                      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-primary mt-4 mb-1">
                        <ArrowRight className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                        {children}
                      </h3>
                    );
                  },
                  p: ({ children }) => {
                    const text = String(children);
                    // Parse "**Tool:** builder" lines into action buttons
                    const toolMatch = text.match(/^Tool:\s*(builder|evaluator|journey|copywriter|analyzer)$/i);
                    if (toolMatch) {
                      const toolKey = toolMatch[1].toLowerCase();
                      const route = toolRoutes[toolKey];
                      if (route) {
                        return (
                          <div className="my-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToolClick(toolKey)}
                              className="gap-1.5 text-xs border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                            >
                              <ArrowRight className="h-3 w-3" />
                              Open in {route.label}
                            </Button>
                          </div>
                        );
                      }
                    }
                    return <p className="text-sm leading-relaxed text-foreground/90">{children}</p>;
                  },
                }}
              >
                {organizedText}
              </ReactMarkdown>
            </div>

            {/* Quick action buttons extracted from recommendations */}
            {!isOrganizing && organizedText.includes("**Tool:**") && (
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border/30 animate-in fade-in-0 duration-500 delay-300">
                {Object.entries(toolRoutes).map(([key, route]) => {
                  if (organizedText.toLowerCase().includes(`tool:** ${key}`) || organizedText.toLowerCase().includes(`tool: ${key}`)) {
                    return (
                      <Button
                        key={key}
                        size="sm"
                        variant="outline"
                        onClick={() => handleToolClick(key)}
                        className="gap-1.5 text-xs border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <ArrowRight className="h-3 w-3" />
                        {route.label}
                      </Button>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
