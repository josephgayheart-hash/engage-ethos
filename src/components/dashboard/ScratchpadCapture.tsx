import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles, ChevronDown, ChevronUp, X, Mail, MessageSquare,
  Map, Search, Lightbulb, Clipboard, ArrowRight, Loader2,
  PenTool, FileText, MessageCircle, Globe, Dna, Building2,
  Users, Target, Radio, Clock, Palette,
} from "lucide-react";
import { Link } from "react-router-dom";
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
const toolRoutes: Record<string, { path: string; label: string; color: string; icon: React.ElementType }> = {
  builder: { path: "/build", label: "Message Builder", color: "bg-primary text-primary-foreground", icon: PenTool },
  evaluator: { path: "/evaluate", label: "Evaluator", color: "bg-accent text-accent-foreground", icon: FileText },
  journey: { path: "/strategy", label: "Journey Designer", color: "bg-secondary text-secondary-foreground", icon: Map },
  copywriter: { path: "/playground", label: "AI Copywriter", color: "bg-primary text-primary-foreground", icon: MessageCircle },
  analyzer: { path: "/web-content-analyzer", label: "Content Analyzer", color: "bg-accent text-accent-foreground", icon: Globe },
  "content-dna": { path: "/admin/content-dna", label: "Content DNA Studio", color: "bg-accent text-accent-foreground", icon: Dna },
  profiles: { path: "/settings", label: "Institutional Profiles", color: "bg-primary text-primary-foreground", icon: Building2 },
};

// Icons for extracted field labels
const fieldIcons: Record<string, React.ElementType> = {
  audience: Users,
  goal: Target,
  channel: Radio,
  timing: Clock,
  tone: Palette,
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
    <div className="space-y-3">
      {/* Prompt box — modern floating AI input style */}
      <div className="relative rounded-2xl border border-border/60 bg-card shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/20">
        {/* Subtle top accent line */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/60 via-accent/40 to-secondary/60" />

        <div className="p-3 pt-3.5">
          {/* Header row */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
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

          {/* Collapsed: clickable placeholder */}
          {!isExpanded && (
            <div
              className="cursor-text rounded-xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground hover:bg-muted/60 transition-colors"
              onClick={() => setIsExpanded(true)}
            >
              {rawText || "Drop your notes, talking points, or rough ideas here..."}
            </div>
          )}

          {/* Expanded: textarea with inline send */}
          {isExpanded && (
            <div className="animate-in fade-in-0 slide-in-from-top-1 duration-200">
              <div className="relative rounded-xl bg-muted/30 border border-border/40 focus-within:border-primary/40 focus-within:bg-muted/20 transition-all">
                <Textarea
                  value={rawText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Drop your notes, talking points, or rough ideas here... e.g. 'Need to reach admitted students who haven't enrolled. Dean wants a 3-touch sequence by next week.'"
                  className="min-h-[80px] max-h-[160px] resize-none border-0 bg-transparent text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0 pb-12"
                  autoFocus
                />
                {/* Bottom bar inside the textarea container */}
                <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-3 py-2">
                  {/* Live intent hint */}
                  <div className="flex-1 min-w-0">
                    {isClassifying ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Reading...</span>
                      </div>
                    ) : classifyResult ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                        <HintIcon className="h-3 w-3 text-accent flex-shrink-0" />
                        <span className="italic truncate">{classifyResult.hint_text}</span>
                      </div>
                    ) : null}
                  </div>
                  {/* Send button */}
                  <Button
                    onClick={handleOrganize}
                    disabled={isOrganizing || rawText.trim().length < 10}
                    size="sm"
                    className={cn(
                      "h-8 rounded-lg gap-1.5 transition-all",
                      rawText.trim().length >= 10
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isOrganizing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ArrowRight className="h-3.5 w-3.5" />
                    )}
                    <span className="hidden sm:inline text-xs">Organize</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

        {/* Results panel */}
        {showResults && organizedText && (
          <div className="animate-in fade-in-0 slide-in-from-bottom-3 duration-500 pt-3 pl-3 space-y-0">
            <div className="max-w-none text-foreground">
              <ReactMarkdown
                components={{
                  // H1 — top-level output title (rarely used but just in case)
                  h1: ({ children }) => (
                    <h1 className="text-base font-bold text-foreground mb-3 mt-1">{children}</h1>
                  ),
                  // H2 — major section titles: "Summary", "Extracted Fields", "Recommendations"
                  h2: ({ children }) => (
                    <div className="mt-1 first:mt-0">
                      <div className="h-px bg-border/40 my-4" />
                      <h2 className="text-base font-bold text-foreground mb-2">
                        {children}
                      </h2>
                    </div>
                  ),
                  // H3 — sub-items under a section (individual recommendations, etc.)
                  h3: ({ children }) => {
                    const text = String(children).toLowerCase();
                    for (const [key, route] of Object.entries(toolRoutes)) {
                      if (text.includes(key) || text.includes(route.label.toLowerCase())) {
                        const ToolIcon = route.icon;
                        return (
                          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mt-3 mb-1">
                            <ToolIcon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            {children}
                          </h3>
                        );
                      }
                    }
                    return (
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mt-3 mb-1">
                        <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        {children}
                      </h3>
                    );
                  },
                  // Bold labels
                  strong: ({ children }) => {
                    const text = String(children).trim();
                    const lower = text.toLowerCase();

                    // Standalone tool name match
                    for (const [key, route] of Object.entries(toolRoutes)) {
                      if (lower === key || lower === route.label.toLowerCase()) {
                        const ToolIcon = route.icon;
                        return (
                          <Link to={route.path} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold text-xs hover:bg-primary/20 transition-colors align-middle">
                            <ToolIcon className="h-3 w-3" />
                            {route.label}
                          </Link>
                        );
                      }
                    }

                    // Pattern: "Tool: <toolname> Why: ..." or "Recommended Tool: <toolname> Why: ..."
                    const compoundMatch = text.match(/^(?:Recommended\s+)?Tool:\s*(\S+)(?:\s+Why:\s*(.*))?$/i);
                    if (compoundMatch) {
                      const toolKey = compoundMatch[1].toLowerCase();
                      const whyText = compoundMatch[2] || "";
                      const route = toolRoutes[toolKey];
                      if (route) {
                        const ToolIcon = route.icon;
                        return (
                          <span className="inline-flex items-center gap-1.5 flex-wrap">
                            <span className="text-primary font-bold">Tool:</span>
                            <Link to={route.path} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold text-xs hover:bg-primary/20 transition-colors align-middle">
                              <ToolIcon className="h-3 w-3" />
                              {route.label}
                            </Link>
                            {whyText && (
                              <>
                                <span className="text-accent font-bold">Why:</span>
                                <span className="font-semibold">{whyText}</span>
                              </>
                            )}
                          </span>
                        );
                      }
                    }

                    // "Tool:" / "Recommended Tool:" label alone
                    if (/^(Recommended\s+)?Tool:$/i.test(text)) {
                      return <strong className="text-primary font-bold">{children}</strong>;
                    }
                    if (/^Why:$/i.test(text)) {
                      return <strong className="text-accent font-bold">{children}</strong>;
                    }
                    return <strong className="font-semibold">{children}</strong>;
                  },
                  // List items with field icons
                  li: ({ children }) => {
                    const text = String(children);
                    for (const [field, IconComp] of Object.entries(fieldIcons)) {
                      const regex = new RegExp(`^${field}:`, "i");
                      if (regex.test(text.trim())) {
                        return (
                          <li className="flex items-start gap-2 text-sm text-foreground/90 list-none ml-2 py-0.5">
                            <IconComp className="h-3.5 w-3.5 mt-0.5 text-accent flex-shrink-0" />
                            <span>{children}</span>
                          </li>
                        );
                      }
                    }
                    return <li className="text-sm text-foreground/90 py-0.5 ml-0">{children}</li>;
                  },
                  ul: ({ children }) => <ul className="my-1.5 pl-2 space-y-0.5 list-none">{children}</ul>,
                  ol: ({ children }) => <ol className="my-1.5 pl-2 space-y-0.5 list-decimal list-inside">{children}</ol>,
                  // Tool recommendation cards + inline tool mentions
                  p: ({ children }) => {
                    const text = String(children);
                    // Exact standalone: "Tool: copywriter"
                    const exactToolMatch = text.match(/^(?:Tool|Recommended Tool):\s*(builder|evaluator|journey|copywriter|analyzer|content-dna|profiles)$/i);
                    if (exactToolMatch) {
                      const toolKey = exactToolMatch[1].toLowerCase();
                      const route = toolRoutes[toolKey];
                      if (route) {
                        const ToolIcon = route.icon;
                        return (
                          <div className="my-2 rounded-lg border border-primary/15 bg-primary/5 p-2.5 flex items-center gap-3">
                            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 flex-shrink-0">
                              <ToolIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Recommended Tool</span>
                              <p className="text-sm font-semibold text-foreground leading-tight">{route.label}</p>
                            </div>
                            <Link to={route.path}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-xs border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all flex-shrink-0"
                              >
                                Open
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        );
                      }
                    }
                    // Inline pattern: "Tool: copywriter Why: ..." within a paragraph
                    const inlineToolMatch = text.match(/(?:Tool|Recommended Tool):\s*(builder|evaluator|journey|copywriter|analyzer|content-dna|profiles)\b/i);
                    if (inlineToolMatch) {
                      const toolKey = inlineToolMatch[1].toLowerCase();
                      const route = toolRoutes[toolKey];
                      if (route) {
                        const ToolIcon = route.icon;
                        const before = text.slice(0, inlineToolMatch.index);
                        const after = text.slice((inlineToolMatch.index || 0) + inlineToolMatch[0].length);
                        // Split "Why: ..." from the remainder
                        const whyMatch = after.match(/^\s*Why:\s*(.*)/i);
                        return (
                          <p className="text-sm leading-relaxed text-foreground/80 my-1.5 flex items-center flex-wrap gap-1">
                            {before && <span>{before}</span>}
                            <span className="text-primary font-bold">Tool:</span>
                            <Link to={route.path} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold text-xs hover:bg-primary/20 transition-colors">
                              <ToolIcon className="h-3 w-3" />
                              {route.label}
                            </Link>
                            {whyMatch ? (
                              <>
                                <span className="text-accent font-bold">Why:</span>
                                <span>{whyMatch[1]}</span>
                              </>
                            ) : after.trim() ? (
                              <span>{after}</span>
                            ) : null}
                          </p>
                        );
                      }
                    }
                    return <p className="text-sm leading-relaxed text-foreground/80 my-1.5">{children}</p>;
                  },
                  hr: () => <div className="h-px bg-border/40 my-4" />,
                }}
              >
                {organizedText}
              </ReactMarkdown>
            </div>

            {/* Quick action buttons extracted from recommendations */}
            {!isOrganizing && organizedText.includes("**Tool:**") && (
              <div className="mt-4 pt-3 border-t border-border/30 animate-in fade-in-0 duration-500 delay-300">
                <p className="text-xs font-medium text-muted-foreground mb-2">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(toolRoutes).map(([key, route]) => {
                    if (organizedText.toLowerCase().includes(`tool:** ${key}`) || organizedText.toLowerCase().includes(`tool: ${key}`)) {
                      const ToolIcon = route.icon;
                      return (
                        <Link key={key} to={route.path}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                            <ToolIcon className="h-3.5 w-3.5" />
                            {route.label}
                          </Button>
                        </Link>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
