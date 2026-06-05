import { useEffect, useRef, useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ArrowUp, Copy, Trash2, Plus, Square, Loader2, Paperclip, Image as ImageIcon,
  Globe, Wand2, FileText, X, Download, Code as CodeIcon, Eye, Sparkles,
  MessageSquarePlus, Check, RefreshCw,
} from "lucide-react";

type Role = "user" | "assistant";
interface Attachment { name: string; kind: "image" | "doc"; dataUrl?: string; text?: string }
interface Msg {
  role: Role;
  content: string;
  ts: number;
  attachments?: Attachment[];
  imageUrl?: string;            // generated image (assistant)
  searchSources?: { title: string; url: string }[];
}
interface Thread { id: string; title: string; updatedAt: number; messages: Msg[]; systemPrompt: string; model: string }

const STORAGE_KEY = "personal-ai-threads-v1";
const ACTIVE_KEY = "personal-ai-active-v1";

const MODELS = [
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (preview)" },
  { id: "google/gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash Lite (preview)" },
  { id: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro (preview)" },
  { id: "google/gemini-3.5-flash", label: "Gemini 3.5 Flash" },
  { id: "openai/gpt-5", label: "GPT-5" },
  { id: "openai/gpt-5-mini", label: "GPT-5 Mini" },
  { id: "openai/gpt-5-nano", label: "GPT-5 Nano" },
  { id: "openai/gpt-5.2", label: "GPT-5.2" },
  { id: "openai/gpt-5.4", label: "GPT-5.4" },
  { id: "openai/gpt-5.4-mini", label: "GPT-5.4 Mini" },
  { id: "openai/gpt-5.4-pro", label: "GPT-5.4 Pro" },
  { id: "openai/gpt-5.5", label: "GPT-5.5" },
  { id: "openai/gpt-5.5-pro", label: "GPT-5.5 Pro" },
];

const DEFAULT_SYSTEM_PROMPT = `You are Tyler's personal communications copilot for his professional work at Valvoline Global Operations (VGO).

Help him write, edit, review, and improve executive communications while preserving his authentic voice. Be conversational and direct.

Tone: professional but approachable, executive but conversational, confident but not arrogant.

Never use: "leverage", "synergy", "circle back", "best-in-class", "world-class", "game-changing", "revolutionary", "transformative".
Avoid corporate clichés. Do not use em dashes unless requested.

Email: objective up front, short paragraphs, clear ask, next steps at end.
Meeting summaries: Key Decisions · Key Takeaways · Risks/Concerns · Next Steps · Owners.

When rewriting, default output order: (1) Recommended version, (2) Key improvements (3–6 short bullets), (3) Optional stronger version only if it adds value.
Otherwise, answer directly. Prioritize usefulness over creativity.

When asked to produce HTML, web pages, dashboards, or visual prototypes, return a complete, self-contained \`\`\`html code block (full document with inline CSS) so it can be previewed as an artifact.`;

const RECIPES: { id: string; label: string; prompt: string }[] = [
  { id: "rewrite", label: "Rewrite in my voice", prompt: "Rewrite the following in my voice. Executive, clear, direct, no buzzwords. Then list key improvements.\n\n---\n\n" },
  { id: "email", label: "Polish executive email", prompt: "Polish this email in my voice. Subject line + body + a short list of key improvements.\n\n---\n\n" },
  { id: "summary", label: "Meeting summary", prompt: "Turn this into a concise meeting summary: Key Decisions, Key Takeaways, Risks/Concerns, Next Steps, Owners.\n\n---\n\n" },
  { id: "tighten", label: "Tighten / shorten", prompt: "Tighten this without losing meaning. Cut filler. Return only the revision.\n\n---\n\n" },
  { id: "exec-brief", label: "Executive brief from notes", prompt: "Turn these notes into a one-page executive brief: Situation, Implications, Recommendation, Next Steps.\n\n---\n\n" },
  { id: "translate", label: "Plain English translation", prompt: "Translate this into plain, direct English an executive can act on in under 30 seconds.\n\n---\n\n" },
  { id: "html-mock", label: "Build an HTML mock", prompt: "Build a self-contained HTML page (single file, inline CSS, polished) for the following. Return only the html code block.\n\n---\n\n" },
];

function loadThreads(): Thread[] {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function saveThreads(t: Thread[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); }
function newThread(model = MODELS[0].id, systemPrompt = DEFAULT_SYSTEM_PROMPT): Thread {
  return { id: crypto.randomUUID(), title: "New chat", updatedAt: Date.now(), messages: [], systemPrompt, model };
}

// Extract last ```html ... ``` block from text
function extractHtmlArtifact(text: string): string | null {
  const m = text.match(/```html\s*\n([\s\S]*?)```/i);
  return m ? m[1].trim() : null;
}

async function parsePdfToText(file: File): Promise<string> {
  const pdfjs: any = await import("pdfjs-dist");
  // @ts-ignore
  await import("pdfjs-dist/build/pdf.worker.min.mjs?url").then((m: any) => {
    pdfjs.GlobalWorkerOptions.workerSrc = m.default;
  }).catch(() => {});
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  let out = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const txt = await page.getTextContent();
    out += txt.items.map((it: any) => it.str).join(" ") + "\n\n";
  }
  return out;
}
async function parseDocxToText(file: File): Promise<string> {
  const mammoth: any = await import("mammoth");
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value || "";
}
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export default function PersonalAIPage() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<Thread[]>(() => {
    const existing = loadThreads();
    return existing.length ? existing : [newThread()];
  });
  const [activeId, setActiveId] = useState<string>(() => {
    const stored = localStorage.getItem(ACTIVE_KEY);
    const existing = loadThreads();
    if (stored && existing.some(t => t.id === stored)) return stored;
    return (existing[0]?.id) ?? threads[0].id;
  });
  const [input, setInput] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [imageMode, setImageMode] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [streamImage, setStreamImage] = useState<string | null>(null);
  const [streamImageFinal, setStreamImageFinal] = useState(false);
  const [artifactOpen, setArtifactOpen] = useState(false);
  const [artifactTab, setArtifactTab] = useState<"preview" | "code">("preview");
  const [artifactHtml, setArtifactHtml] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const active = useMemo(() => threads.find(t => t.id === activeId) ?? threads[0], [threads, activeId]);

  useEffect(() => { document.title = "Personal AI"; }, []);
  useEffect(() => { saveThreads(threads); }, [threads]);
  useEffect(() => { localStorage.setItem(ACTIVE_KEY, activeId); }, [activeId]);
  useEffect(() => { inputRef.current?.focus(); }, [activeId]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, streamText, streamImage]);

  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;

  const updateActive = (patch: Partial<Thread>) => {
    setThreads(prev => prev.map(t => t.id === activeId ? { ...t, ...patch, updatedAt: Date.now() } : t));
  };
  const createThread = () => {
    const t = newThread(active?.model, active?.systemPrompt);
    setThreads(prev => [t, ...prev]);
    setActiveId(t.id);
  };
  const deleteThread = (id: string) => {
    setThreads(prev => {
      const next = prev.filter(t => t.id !== id);
      if (next.length === 0) { const f = newThread(); setActiveId(f.id); return [f]; }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  const handleFiles = async (files: FileList | null, asImage = false) => {
    if (!files?.length) return;
    const next: Attachment[] = [];
    for (const f of Array.from(files)) {
      try {
        if (asImage || f.type.startsWith("image/")) {
          const dataUrl = await fileToDataUrl(f);
          next.push({ name: f.name, kind: "image", dataUrl });
        } else if (f.name.toLowerCase().endsWith(".pdf") || f.type === "application/pdf") {
          const text = await parsePdfToText(f);
          next.push({ name: f.name, kind: "doc", text });
        } else if (f.name.toLowerCase().endsWith(".docx")) {
          const text = await parseDocxToText(f);
          next.push({ name: f.name, kind: "doc", text });
        } else {
          // treat as text
          const text = await f.text();
          next.push({ name: f.name, kind: "doc", text });
        }
      } catch (e: any) {
        toast({ title: `Couldn't read ${f.name}`, description: e.message, variant: "destructive" });
      }
    }
    setPendingAttachments(prev => [...prev, ...next]);
  };

  // Run web search via firecrawl-search, return condensed context + sources
  const runWebSearch = async (q: string): Promise<{ context: string; sources: { title: string; url: string }[] }> => {
    const { data, error } = await supabase.functions.invoke("firecrawl-search", {
      body: { query: q, options: { limit: 5 } },
    });
    if (error || !data?.success) throw new Error(error?.message || data?.error || "Search failed");
    const results = (data.data || []).slice(0, 5);
    const sources = results.map((r: any) => ({ title: r.title || r.url, url: r.url }));
    const context = results.map((r: any, i: number) =>
      `[${i + 1}] ${r.title}\n${r.url}\n${(r.markdown || r.description || "").slice(0, 1500)}`
    ).join("\n\n");
    return { context, sources };
  };

  const generateImage = async (prompt: string) => {
    setStreaming(true);
    setStreamImage(null);
    setStreamImageFinal(false);
    const userMsg: Msg = { role: "user", content: prompt, ts: Date.now() };
    const newMessages = [...(active?.messages ?? []), userMsg];
    const titleUpdate = active?.messages.length === 0 ? { title: prompt.slice(0, 60) } : {};
    updateActive({ messages: newMessages, ...titleUpdate });
    setInput("");

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/personal-ai-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });
      if (!resp.ok || !resp.body) {
        const t = await resp.text().catch(() => "");
        throw new Error(t || `Image gen failed (${resp.status})`);
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let finalUrl = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") continue;
          try {
            const ev = JSON.parse(json);
            if (ev.type === "image_generation.partial_image" || ev.type === "image_generation.completed") {
              const url = `data:image/png;base64,${ev.b64_json}`;
              setStreamImage(url);
              if (ev.type === "image_generation.completed") { setStreamImageFinal(true); finalUrl = url; }
            } else if (ev.error) {
              throw new Error(ev.error.message || JSON.stringify(ev.error));
            }
          } catch (e) { /* ignore partial frames */ }
        }
      }
      if (!finalUrl && streamImage) finalUrl = streamImage;
      const finalMsg: Msg = { role: "assistant", content: "", imageUrl: finalUrl || undefined, ts: Date.now() };
      setThreads(prev => prev.map(t =>
        t.id === activeId ? { ...t, messages: [...newMessages, finalMsg], updatedAt: Date.now() } : t
      ));
      setStreamImage(null);
    } catch (err: any) {
      if (err.name !== "AbortError") toast({ title: "Image generation failed", description: err.message, variant: "destructive" });
    } finally {
      setStreaming(false);
      abortRef.current = null;
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && pendingAttachments.length === 0) || streaming || !active) return;

    if (imageMode) {
      if (!text) { toast({ title: "Enter an image prompt" }); return; }
      await generateImage(text);
      return;
    }

    const attachments = pendingAttachments;
    const userMsg: Msg = { role: "user", content: text, ts: Date.now(), attachments: attachments.length ? attachments : undefined };
    const newMessages = [...active.messages, userMsg];
    const titleUpdate = active.messages.length === 0
      ? { title: (text || attachments[0]?.name || "New chat").slice(0, 60) }
      : {};
    updateActive({ messages: newMessages, ...titleUpdate });
    setInput("");
    setPendingAttachments([]);
    setStreaming(true);
    setStreamText("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let searchContext = "";
      let searchSources: { title: string; url: string }[] = [];
      if (webSearch && text) {
        try {
          const r = await runWebSearch(text);
          searchContext = r.context;
          searchSources = r.sources;
        } catch (e: any) {
          toast({ title: "Web search failed", description: e.message, variant: "destructive" });
        }
      }

      const images = attachments.filter(a => a.kind === "image").map(a => ({ name: a.name, dataUrl: a.dataUrl! }));
      const files = attachments.filter(a => a.kind === "doc").map(a => ({ name: a.name, text: a.text! }));

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/personal-ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          history: active.messages.map(m => ({ role: m.role, content: m.content })),
          model: active.model,
          systemPrompt: active.systemPrompt,
          images,
          files,
          searchContext,
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) throw new Error("Rate limit exceeded.");
        if (resp.status === 402) throw new Error("AI credits exhausted.");
        const t = await resp.text().catch(() => "");
        throw new Error(t || `Request failed (${resp.status})`);
      }
      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      let done = false;
      while (!done) {
        const { done: rDone, value } = await reader.read();
        if (rDone) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) { acc += delta; setStreamText(acc); }
          } catch { buf = line + "\n" + buf; break; }
        }
      }

      const finalMsg: Msg = {
        role: "assistant",
        content: acc,
        ts: Date.now(),
        searchSources: searchSources.length ? searchSources : undefined,
      };
      setThreads(prev => prev.map(t =>
        t.id === activeId ? { ...t, messages: [...newMessages, finalMsg], updatedAt: Date.now() } : t
      ));
      setStreamText("");

      // Auto-open artifact if HTML detected
      const html = extractHtmlArtifact(acc);
      if (html) {
        setArtifactHtml(html);
        setArtifactTab("preview");
        setArtifactOpen(true);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast({ title: "Generation failed", description: err.message ?? "Unknown error", variant: "destructive" });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const stop = () => abortRef.current?.abort();
  const copyMsg = async (content: string) => { await navigator.clipboard.writeText(content); toast({ title: "Copied" }); };
  const downloadMd = (m: Msg) => {
    const blob = new Blob([m.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `response-${m.ts}.md`; a.click(); URL.revokeObjectURL(url);
  };
  const downloadImage = (url: string) => {
    const a = document.createElement("a"); a.href = url; a.download = `image-${Date.now()}.png`; a.click();
  };
  const openHtmlArtifact = (text: string) => {
    const html = extractHtmlArtifact(text);
    if (html) { setArtifactHtml(html); setArtifactTab("preview"); setArtifactOpen(true); }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r flex flex-col bg-muted/30">
        <div className="p-3">
          <Button onClick={createThread} variant="outline" className="w-full justify-start gap-2 h-9">
            <Plus className="h-4 w-4" /> New chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="px-2 pb-2 space-y-0.5">
            {threads.sort((a,b) => b.updatedAt - a.updatedAt).map(t => (
              <div
                key={t.id}
                className={`group flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer text-sm transition ${
                  t.id === activeId ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                }`}
                onClick={() => setActiveId(t.id)}
              >
                <span className="flex-1 truncate">{t.title}</span>
                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                  onClick={(e) => { e.stopPropagation(); deleteThread(t.id); }}
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b flex items-center justify-between px-3 shrink-0 gap-2">
          <Select value={active?.model} onValueChange={(v) => updateActive({ model: v })}>
            <SelectTrigger className="h-8 w-[220px] text-sm border-0 shadow-none focus:ring-0 px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map(m => (<SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                  <Sparkles className="h-3.5 w-3.5" /> Recipes
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs">Quick prompts</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {RECIPES.map(r => (
                  <DropdownMenuItem key={r.id} onClick={() => { setInput(r.prompt + input); inputRef.current?.focus(); }}>
                    {r.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          {/* Chat column */}
          <div className="flex-1 flex flex-col min-w-0">
            <ScrollArea className="flex-1">
              <div ref={scrollRef} className="max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
                {active?.messages.map((m, i) => (
                  <div key={i} className="group">
                    {m.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] space-y-2">
                          {m.attachments?.length ? (
                            <div className="flex flex-wrap gap-2 justify-end">
                              {m.attachments.map((a, j) => (
                                <Badge key={j} variant="secondary" className="gap-1 text-xs">
                                  {a.kind === "image" ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                  {a.name}
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                          {m.content && (
                            <div className="rounded-2xl px-4 py-2.5 text-sm bg-primary text-primary-foreground whitespace-pre-wrap">
                              {m.content}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm space-y-2">
                        {m.imageUrl ? (
                          <div className="space-y-2">
                            <img src={m.imageUrl} alt="Generated" className="rounded-lg border max-w-full" />
                            <button onClick={() => downloadImage(m.imageUrl!)} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                              <Download className="h-3 w-3" /> Download
                            </button>
                          </div>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-pre:my-2">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                          </div>
                        )}
                        {m.searchSources?.length ? (
                          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                            <div className="font-medium flex items-center gap-1"><Globe className="h-3 w-3" /> Sources</div>
                            {m.searchSources.map((s, j) => (
                              <a key={j} href={s.url} target="_blank" rel="noopener noreferrer" className="block truncate hover:text-foreground">
                                [{j + 1}] {s.title}
                              </a>
                            ))}
                          </div>
                        ) : null}
                        {m.content && (
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-3 text-xs text-muted-foreground transition">
                            <button onClick={() => copyMsg(m.content)} className="inline-flex items-center gap-1 hover:text-foreground"><Copy className="h-3 w-3" /> Copy</button>
                            <button onClick={() => downloadMd(m)} className="inline-flex items-center gap-1 hover:text-foreground"><Download className="h-3 w-3" /> .md</button>
                            {extractHtmlArtifact(m.content) && (
                              <button onClick={() => openHtmlArtifact(m.content)} className="inline-flex items-center gap-1 hover:text-foreground"><Eye className="h-3 w-3" /> Open artifact</button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {streamText && (
                  <div className="text-sm">
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-pre:my-2">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamText}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {streamImage && (
                  <img src={streamImage} alt="Generating…" className={`rounded-lg border max-w-full transition-[filter] ${streamImageFinal ? "blur-0" : "blur-2xl"}`} />
                )}

                {streaming && !streamText && !streamImage && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> {imageMode ? "Generating image…" : webSearch ? "Searching the web…" : "Thinking…"}
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t bg-background">
              <div className="max-w-3xl mx-auto w-full px-4 py-3 space-y-2">
                {pendingAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {pendingAttachments.map((a, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 pr-1">
                        {a.kind === "image" ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                        <span className="truncate max-w-[180px]">{a.name}</span>
                        <button onClick={() => setPendingAttachments(prev => prev.filter((_, j) => j !== i))} className="ml-1 hover:bg-muted rounded">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="relative rounded-2xl border bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                    }}
                    placeholder={imageMode ? "Describe an image…" : "Message…"}
                    className="min-h-[60px] max-h-[300px] resize-none border-0 bg-transparent focus-visible:ring-0 pl-3 pr-12 pt-3 pb-10"
                    disabled={streaming}
                  />
                  <div className="absolute left-2 bottom-2 flex items-center gap-0.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={streaming}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => imageRef.current?.click()}>
                          <ImageIcon className="h-4 w-4 mr-2" /> Attach image
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => fileRef.current?.click()}>
                          <Paperclip className="h-4 w-4 mr-2" /> Attach file (PDF, DOCX, TXT)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <input ref={imageRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files, true); e.target.value = ""; }} />
                    <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md,.csv,.json" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files, false); e.target.value = ""; }} />

                    <Toggle pressed={webSearch} onPressedChange={setWebSearch} size="sm" className="h-8 gap-1 text-xs data-[state=on]:bg-primary/10 data-[state=on]:text-primary" aria-label="Web search">
                      <Globe className="h-3.5 w-3.5" /> Web
                    </Toggle>
                    <Toggle pressed={imageMode} onPressedChange={setImageMode} size="sm" className="h-8 gap-1 text-xs data-[state=on]:bg-primary/10 data-[state=on]:text-primary" aria-label="Image mode">
                      <Wand2 className="h-3.5 w-3.5" /> Image
                    </Toggle>
                  </div>
                  <div className="absolute right-2 bottom-2">
                    {streaming ? (
                      <Button onClick={stop} size="icon" variant="ghost" className="h-8 w-8"><Square className="h-4 w-4" /></Button>
                    ) : (
                      <Button onClick={handleSend} disabled={!input.trim() && pendingAttachments.length === 0} size="icon" className="h-8 w-8">
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground text-center">
                  Enter to send · Shift+Enter for newline · + to attach · Web/Image toggles · Recipes top-right
                </p>
              </div>
            </div>
          </div>

          {/* Artifact panel */}
          {artifactOpen && (
            <aside className="w-[45%] min-w-[420px] border-l flex flex-col bg-muted/20">
              <div className="h-12 border-b flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1"><CodeIcon className="h-3 w-3" /> HTML artifact</Badge>
                  <div className="flex rounded-md border bg-background overflow-hidden">
                    <button onClick={() => setArtifactTab("preview")} className={`px-2 py-1 text-xs inline-flex items-center gap-1 ${artifactTab === "preview" ? "bg-accent" : ""}`}>
                      <Eye className="h-3 w-3" /> Preview
                    </button>
                    <button onClick={() => setArtifactTab("code")} className={`px-2 py-1 text-xs inline-flex items-center gap-1 ${artifactTab === "code" ? "bg-accent" : ""}`}>
                      <CodeIcon className="h-3 w-3" /> Code
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => {
                    const blob = new Blob([artifactHtml], { type: "text/html" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = `artifact-${Date.now()}.html`; a.click(); URL.revokeObjectURL(url);
                  }}><Download className="h-3 w-3" /> .html</Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setArtifactOpen(false)}><X className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                {artifactTab === "preview" ? (
                  <iframe title="Artifact preview" srcDoc={artifactHtml} sandbox="allow-scripts" className="w-full h-full bg-white" />
                ) : (
                  <ScrollArea className="h-full">
                    <pre className="text-xs p-3 whitespace-pre-wrap font-mono">{artifactHtml}</pre>
                  </ScrollArea>
                )}
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
