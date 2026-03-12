import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles, ChevronDown, ChevronUp, X, Mail, MessageSquare,
  Map, Search, Lightbulb, Clipboard, ArrowRight, Loader2,
  PenTool, FileText, MessageCircle, Globe, Dna, Building2,
  Users, Target, Radio, Clock, Palette, Image, Paintbrush,
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

// Safely extract plain text from React children (avoids [object Object])
function extractText(node: React.ReactNode): string {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number' || typeof node === 'boolean') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object' && 'props' in node) {
    return extractText((node as React.ReactElement).props.children);
  }
  return '';
}

// Icon mapping from classify response
const iconMap: Record<string, React.ElementType> = {
  mail: Mail,
  "message-square": MessageSquare,
  map: Map,
  search: Search,
  lightbulb: Lightbulb,
  clipboard: Clipboard,
  sparkles: Sparkles,
  image: Image,
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
  "image-studio": { path: "/image-generator", label: "Image Studio", color: "bg-accent text-accent-foreground", icon: Image },
  "brand-studio": { path: "/brand-studio", label: "Brand It Studio", color: "bg-primary text-primary-foreground", icon: Paintbrush },
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
  const [isExpanded, setIsExpanded] = useState(false); // always start collapsed
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

  // Don't auto-expand — keep it cozy and collapsed by default

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
      <div className={cn(
        "relative rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-300",
        isExpanded
          ? "shadow-lg hover:shadow-xl hover:border-primary/20"
          : "shadow-sm hover:shadow-md hover:border-primary/15"
      )}>
        {/* Subtle top accent line */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/60 via-accent/40 to-secondary/60" />

        <div className={cn(isExpanded ? "p-5 pt-5" : "px-4 py-2.5 pt-3")}>
          {/* Header row */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors",
                isExpanded ? "text-sm mb-3" : "text-xs"
              )}
            >
              <div className={cn(
                "rounded-lg bg-primary/10 flex items-center justify-center",
                isExpanded ? "h-6 w-6" : "h-5 w-5"
              )}>
                <Sparkles className={cn("text-primary", isExpanded ? "h-3.5 w-3.5" : "h-3 w-3")} />
              </div>
              <span>Quick Brief</span>
              {rawText.length > 0 && !isExpanded && (
                <span className="text-[10px] font-normal text-muted-foreground ml-1">— draft saved</span>
              )}
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
            </button>

            {rawText.length > 0 && isExpanded && (
              <button
                onClick={handleClear}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>

          {/* Expanded: textarea with inline send */}
          {isExpanded && (
            <div className="animate-in fade-in-0 slide-in-from-top-1 duration-200">
              <div className="relative rounded-xl bg-muted/30 border border-border/40 focus-within:border-primary/40 focus-within:bg-muted/20 transition-all">
                <Textarea
                  value={rawText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (rawText.trim().length >= 10 && !isOrganizing) handleOrganize();
                    }
                  }}
                  placeholder="Drop your notes, talking points, or rough ideas here... e.g. 'Need to reach admitted students who haven't enrolled. Dean wants a 3-touch sequence by next week.'"
                  className="min-h-[100px] max-h-[200px] resize-none border-0 bg-transparent text-base leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0 pb-14 px-4 py-3"
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
          <div className="animate-in fade-in-0 slide-in-from-bottom-3 duration-500 pt-5 pl-4 pr-2 space-y-0">
            <div className="max-w-none text-foreground space-y-1.5">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <div className="mb-5 mt-1">
                      <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
                        <div className="h-7 w-1 rounded-full bg-primary" />
                        {children}
                      </h1>
                      <div className="h-px bg-gradient-to-r from-primary/30 via-border/50 to-transparent mt-3" />
                    </div>
                  ),
                  h2: ({ children }) => (
                    <div className="mt-7 first:mt-0">
                      <div className="h-px bg-border/40 mb-5" />
                      <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                        {children}
                      </h2>
                    </div>
                  ),
                  h3: ({ children }) => {
                    const text = extractText(children).toLowerCase();
                    for (const [key, route] of Object.entries(toolRoutes)) {
                      if (text.includes(key) || text.includes(route.label.toLowerCase())) {
                        const ToolIcon = route.icon;
                        return (
                          <h3 className="flex items-center gap-2.5 text-sm font-semibold text-foreground/90 mt-4 mb-2 pl-1.5 border-l-2 border-accent/40 ml-0.5">
                            <div className="h-5 w-5 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                              <ToolIcon className="h-3 w-3 text-accent" />
                            </div>
                            {children}
                          </h3>
                        );
                      }
                    }
                    return (
                      <h3 className="flex items-center gap-2.5 text-sm font-semibold text-foreground/90 mt-4 mb-2 pl-1.5 border-l-2 border-accent/40 ml-0.5">
                        <ArrowRight className="h-3 w-3 text-accent flex-shrink-0" />
                        {children}
                      </h3>
                    );
                  },
                  strong: ({ children }) => {
                    const text = extractText(children).trim();
                    const lower = text.toLowerCase().replace(/[:\s]+$/, "");

                    // Match tool names — exact key, label, or common variations
                    for (const [key, route] of Object.entries(toolRoutes)) {
                      const labelLower = route.label.toLowerCase();
                      if (lower === key || lower === labelLower || lower.includes(key) || lower.includes(labelLower) || labelLower.includes(lower)) {
                        const ToolIcon = route.icon;
                        return (
                          <Link to={route.path} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 hover:shadow-sm transition-all align-middle border border-primary/15">
                            <ToolIcon className="h-3 w-3" />
                            {route.label}
                          </Link>
                        );
                      }
                    }

                    // "Why:" label
                    if (/^Why$/i.test(lower)) {
                      return <span className="text-accent font-semibold text-xs uppercase tracking-wide">{children}</span>;
                    }
                    // Hide standalone "Tool" / "Recommended Tool" bold labels (handled in pill rendering)
                    if (/^(Recommended\s+)?Tool$/i.test(lower)) {
                      return null;
                    }

                    // Field labels like "Audience:", "Goal:", etc.
                    for (const field of Object.keys(fieldIcons)) {
                      if (lower === field) {
                        return <strong className="font-bold text-foreground">{children}</strong>;
                      }
                    }

                    return <strong className="font-semibold text-foreground">{children}</strong>;
                  },
                  li: ({ children }) => {
                    const text = extractText(children);
                    for (const [field, IconComp] of Object.entries(fieldIcons)) {
                      const regex = new RegExp(`^${field}:`, "i");
                      if (regex.test(text.trim())) {
                        return (
                          <li className="flex items-start gap-3 text-[15px] text-foreground/90 list-none py-1.5 pl-1">
                            <div className="h-5 w-5 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <IconComp className="h-3 w-3 text-accent" />
                            </div>
                            <span className="leading-relaxed">{children}</span>
                          </li>
                        );
                      }
                    }
                    return (
                      <li className="text-[15px] text-foreground/85 py-1.5 ml-1 flex items-start gap-2.5 list-none">
                        <span className="mt-2.5 h-1 w-1 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                        <span className="leading-relaxed">{children}</span>
                      </li>
                    );
                  },
                  ul: ({ children }) => <ul className="my-3 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="my-3 space-y-1 list-decimal list-inside">{children}</ol>,
                  p: ({ children }) => {
                    const text = extractText(children);
                    // Tool recommendation card
                    const exactToolMatch = text.match(/^(?:Tool|Recommended Tool):\s*(builder|evaluator|journey|copywriter|analyzer|content-dna|profiles|image-studio|brand-studio)$/i);
                    if (exactToolMatch) {
                      const toolKey = exactToolMatch[1].toLowerCase();
                      const route = toolRoutes[toolKey];
                      if (route) {
                        const ToolIcon = route.icon;
                        return (
                          <div className="my-3 rounded-lg border border-primary/15 bg-primary/5 p-4 flex items-center gap-3">
                            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 flex-shrink-0">
                              <ToolIcon className="h-4.5 w-4.5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Recommended Tool</span>
                              <p className="text-[15px] font-bold text-foreground leading-tight">{route.label}</p>
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
                    // Inline tool mention
                    const inlineToolMatch = text.match(/(?:Tool|Recommended Tool):\s*(builder|evaluator|journey|copywriter|analyzer|content-dna|profiles)\b/i);
                    if (inlineToolMatch) {
                      const toolKey = inlineToolMatch[1].toLowerCase();
                      const route = toolRoutes[toolKey];
                      if (route) {
                        const ToolIcon = route.icon;
                        const before = text.slice(0, inlineToolMatch.index);
                        const after = text.slice((inlineToolMatch.index || 0) + inlineToolMatch[0].length);
                        const whyMatch = after.match(/^\s*Why:\s*(.*)/i);
                        return (
                          <div className="text-sm leading-relaxed text-foreground/85 my-2 flex items-center flex-wrap gap-1.5">
                            {before && <span>{before}</span>}
                            <Link to={route.path} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 hover:shadow-sm transition-all border border-primary/15">
                              <ToolIcon className="h-3 w-3" />
                              {route.label}
                            </Link>
                            {whyMatch ? (
                              <span className="block w-full mt-1 text-accent text-xs italic pl-0.5">{whyMatch[1]}</span>
                            ) : after.trim() ? (
                              <span>{after}</span>
                            ) : null}
                          </div>
                        );
                      }
                    }
                    // Auto-detect and hyperlink tool names in plain paragraph text
                    const parts: React.ReactNode[] = [];
                    const plainText = text;
                    // Build a regex that matches any tool label or key
                    const toolEntries = Object.entries(toolRoutes);
                    const toolPatterns = toolEntries.flatMap(([key, route]) => [route.label, key]).sort((a, b) => b.length - a.length);
                    const toolRegex = new RegExp(`\\b(${toolPatterns.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
                    let lastIndex = 0;
                    let match: RegExpExecArray | null;
                    let hasToolMatch = false;
                    while ((match = toolRegex.exec(plainText)) !== null) {
                      hasToolMatch = true;
                      if (match.index > lastIndex) {
                        parts.push(plainText.slice(lastIndex, match.index));
                      }
                      const matchedLower = match[1].toLowerCase();
                      const foundEntry = toolEntries.find(([key, route]) => key === matchedLower || route.label.toLowerCase() === matchedLower);
                      if (foundEntry) {
                        const [, route] = foundEntry;
                        const ToolIcon = route.icon;
                        parts.push(
                          <Link key={match.index} to={route.path} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 hover:shadow-sm transition-all align-middle border border-primary/15 mx-0.5">
                            <ToolIcon className="h-3 w-3" />
                            {route.label}
                          </Link>
                        );
                      } else {
                        parts.push(match[1]);
                      }
                      lastIndex = match.index + match[0].length;
                    }
                    if (hasToolMatch) {
                      if (lastIndex < plainText.length) {
                        parts.push(plainText.slice(lastIndex));
                      }
                      return <p className="text-sm leading-relaxed text-foreground/85 my-2">{parts}</p>;
                    }
                    return <p className="text-sm leading-relaxed text-foreground/85 my-2">{children}</p>;
                  },
                  hr: () => <div className="h-px bg-border/50 my-5" />,
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
