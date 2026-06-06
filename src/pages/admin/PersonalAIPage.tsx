import { useEffect, useRef, useState, useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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
  MessageSquarePlus, Check, RefreshCw, Brain, PanelLeftClose, PanelLeftOpen, ExternalLink,
} from "lucide-react";
import { MemoryDialog } from "@/components/personal-ai/MemoryDialog";

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
  { id: "anthropic/claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
  { id: "anthropic/claude-opus-4-5", label: "Claude Opus 4.5" },
  { id: "anthropic/claude-haiku-4-5", label: "Claude Haiku 4.5" },
  { id: "google/gemini-3-pro-preview", label: "Gemini 3 Pro (preview)" },
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (preview)" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "openai/gpt-5", label: "GPT-5" },
  { id: "openai/gpt-5-mini", label: "GPT-5 Mini" },
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
function sanitizeForStorage(threads: Thread[]): Thread[] {
  // Strip heavy payloads (image dataURLs, long file text, generated images) so we don't blow the ~5MB localStorage quota.
  const MAX_DOC_TEXT = 4000;
  return threads.map(t => ({
    ...t,
    messages: t.messages.map(m => ({
      ...m,
      imageUrl: undefined,
      attachments: m.attachments?.map(a => ({
        name: a.name,
        kind: a.kind,
        dataUrl: undefined,
        text: a.text && a.text.length > MAX_DOC_TEXT ? a.text.slice(0, MAX_DOC_TEXT) + `\n\n…[truncated for storage]` : a.text,
      })),
    })),
  }));
}
function saveThreads(t: Thread[]) {
  const tryWrite = (data: Thread[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  let data = sanitizeForStorage(t);
  // Cap total threads to last 50 to bound size
  if (data.length > 50) data = data.slice(0, 50);
  try { tryWrite(data); return; } catch {}
  // Drop oldest threads until it fits
  while (data.length > 1) {
    data = data.slice(0, Math.max(1, Math.floor(data.length * 0.7)));
    try { tryWrite(data); return; } catch {}
  }
  // Last resort: keep only most recent thread with empty messages
  try { tryWrite([{ ...data[0], messages: data[0].messages.slice(-20) }]); } catch {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }
}
function newThread(model = MODELS[0].id, systemPrompt = DEFAULT_SYSTEM_PROMPT): Thread {
  return { id: crypto.randomUUID(), title: "New chat", updatedAt: Date.now(), messages: [], systemPrompt, model };
}

// Extract last ```html ... ``` block from text
function extractHtmlArtifact(text: string): string | null {
  const m = text.match(/```html\s*\n([\s\S]*?)```/i);
  return m ? m[1].trim() : null;
}

// File artifacts emitted by Claude tools (pptx/docx/pdf/html/svg/image).
// Marker format: <!--artifact:{"filename":..,"url":..,"downloadUrl":..}-->
export type FileArtifact = { filename: string; url: string; downloadUrl: string; kind: "pdf" | "image" | "html" | "svg" | "docx" | "pptx" | "other" };
function kindFromName(name: string): FileArtifact["kind"] {
  const ext = name.toLowerCase().split(".").pop() || "";
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return "image";
  if (ext === "html" || ext === "htm") return "html";
  if (ext === "svg") return "svg";
  if (ext === "docx") return "docx";
  if (ext === "pptx") return "pptx";
  return "other";
}
function extractFileArtifacts(text: string): FileArtifact[] {
  const out: FileArtifact[] = [];
  const re = /<!--artifact:(\{[\s\S]*?\})-->/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    try {
      const j = JSON.parse(m[1]);
      if (j?.url && j?.filename) {
        out.push({ filename: j.filename, url: j.url, downloadUrl: j.downloadUrl || j.url, kind: kindFromName(j.filename) });
      }
    } catch { /* ignore */ }
  }
  return out;
}
function stripArtifactMarkers(text: string): string {
  return text.replace(/<!--artifact:\{[\s\S]*?\}-->\n?/g, "");
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
  const { isSuperAdmin, isToolOnly, profile } = useAuth();
  const navigate = useNavigate();
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
  const [deepResearch, setDeepResearch] = useState(false);
  const [extendedThinking, setExtendedThinking] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [streamImage, setStreamImage] = useState<string | null>(null);
  const [streamImageFinal, setStreamImageFinal] = useState(false);
  const [artifactOpen, setArtifactOpen] = useState(false);
  const [artifactTab, setArtifactTab] = useState<"preview" | "code">("preview");
  const [artifactHtml, setArtifactHtml] = useState<string>("");
  const [fileArtifact, setFileArtifact] = useState<FileArtifact | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [copiedTs, setCopiedTs] = useState<number | null>(null);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const dragDepth = useRef(0);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const v = localStorage.getItem("personal-ai-sidebar-open");
    return v === null ? true : v === "1";
  });
  useEffect(() => { localStorage.setItem("personal-ai-sidebar-open", sidebarOpen ? "1" : "0"); }, [sidebarOpen]);
  const [savedProfilePrompt, setSavedProfilePrompt] = useState<string | null>(null);

  // Load saved system-prompt profile once so new threads use it as default
  useEffect(() => {
    if (!isSuperAdmin) return;
    (async () => {
      const { data } = await supabase.from("personal_ai_profile").select("system_prompt").maybeSingle();
      if (data?.system_prompt?.trim()) setSavedProfilePrompt(data.system_prompt);
    })();
  }, [isSuperAdmin]);

  const active = useMemo(() => threads.find(t => t.id === activeId) ?? threads[0], [threads, activeId]);

  useEffect(() => { document.title = "Compass"; }, []);
  useEffect(() => { saveThreads(threads); }, [threads]);
  useEffect(() => { localStorage.setItem(ACTIVE_KEY, activeId); }, [activeId]);
  useEffect(() => { inputRef.current?.focus(); }, [activeId]);

  // Auto-grow the composer textarea so long text doesn't overflow or scroll prematurely.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = 480; // generous max before internal scroll kicks in
    el.style.height = Math.min(el.scrollHeight, max) + "px";
  }, [input]);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Use instant scroll while streaming to avoid stacking smooth-scroll animations
    el.scrollTo({ top: el.scrollHeight, behavior: streaming ? "auto" : "smooth" });
  }, [active?.messages.length, streamText, streamImage, streaming]);

  // Migrate any persisted thread using a model ID no longer in MODELS
  useEffect(() => {
    const valid = new Set(MODELS.map(m => m.id));
    const needsFix = threads.some(t => !valid.has(t.model));
    if (needsFix) {
      setThreads(prev => prev.map(t => valid.has(t.model) ? t : { ...t, model: MODELS[0].id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isSuperAdmin && !isToolOnly) return <Navigate to="/dashboard" replace />;

  const updateActive = (patch: Partial<Thread>) => {
    setThreads(prev => prev.map(t => t.id === activeId ? { ...t, ...patch, updatedAt: Date.now() } : t));
  };
  const createThread = () => {
    const sys = savedProfilePrompt ?? active?.systemPrompt ?? DEFAULT_SYSTEM_PROMPT;
    const t = newThread(active?.model, sys);
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

  const TEXTY_EXT = /\.(txt|md|markdown|csv|tsv|json|jsonl|ya?ml|xml|html?|css|scss|less|js|jsx|ts|tsx|py|rb|go|rs|java|kt|swift|c|h|cpp|hpp|cs|php|sh|bash|zsh|sql|env|ini|toml|conf|log|srt|vtt)$/i;
  const isProbablyText = (s: string) => {
    if (!s) return true;
    const sample = s.slice(0, 2000);
    let bad = 0;
    for (let i = 0; i < sample.length; i++) {
      const c = sample.charCodeAt(i);
      if (c === 0) return false;
      if ((c < 9 || (c > 13 && c < 32)) && c !== 27) bad++;
    }
    return bad / sample.length < 0.05;
  };

  const handleFiles = async (files: FileList | File[] | null, asImage = false) => {
    if (!files || (files as FileList).length === 0 && (files as File[]).length === 0) return;
    const list = Array.from(files as ArrayLike<File>);
    const next: Attachment[] = [];
    for (const f of list) {
      try {
        const lower = f.name.toLowerCase();
        if (asImage || f.type.startsWith("image/")) {
          const dataUrl = await fileToDataUrl(f);
          next.push({ name: f.name, kind: "image", dataUrl });
        } else if (lower.endsWith(".pdf") || f.type === "application/pdf") {
          const text = await parsePdfToText(f);
          next.push({ name: f.name, kind: "doc", text });
        } else if (lower.endsWith(".docx")) {
          const text = await parseDocxToText(f);
          next.push({ name: f.name, kind: "doc", text });
        } else if (TEXTY_EXT.test(lower) || f.type.startsWith("text/") || f.type.includes("json") || f.type.includes("xml")) {
          const text = await f.text();
          next.push({ name: f.name, kind: "doc", text });
        } else {
          // Try reading as text; if it's binary, attach as a stub doc with metadata
          const text = await f.text().catch(() => "");
          if (text && isProbablyText(text)) {
            next.push({ name: f.name, kind: "doc", text });
          } else {
            const sizeKb = Math.max(1, Math.round(f.size / 1024));
            const stub = `[Binary file attached: ${f.name} · ${f.type || "unknown type"} · ${sizeKb} KB]\n\nThe file's raw contents can't be inspected as text. Describe what you'd like me to do with it (e.g. summarize the filename, draft an email referencing it, etc.).`;
            next.push({ name: f.name, kind: "doc", text: stub });
            toast({ title: `${f.name} attached as reference`, description: "Binary file — I can see the name and type, not the contents." });
          }
        }
      } catch (e: any) {
        toast({ title: `Couldn't read ${f.name}`, description: e.message, variant: "destructive" });
      }
    }
    setPendingAttachments(prev => [...prev, ...next]);
  };

  // Run web search via firecrawl-search, return condensed context + sources
  const runWebSearch = async (q: string, deep = false): Promise<{ context: string; sources: { title: string; url: string }[] }> => {
    const limit = deep ? 12 : 5;
    const snippetLen = deep ? 3000 : 1500;
    const { data, error } = await supabase.functions.invoke("firecrawl-search", {
      body: { query: q, options: { limit } },
    });
    if (error || !data?.success) throw new Error(error?.message || data?.error || "Search failed");
    const results = (data.data || []).slice(0, limit);
    const sources = results.map((r: any) => ({ title: r.title || r.url, url: r.url }));
    const context = results.map((r: any, i: number) =>
      `[${i + 1}] ${r.title}\n${r.url}\n${(r.markdown || r.description || "").slice(0, snippetLen)}`
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
      if ((webSearch || deepResearch) && text) {
        try {
          const r = await runWebSearch(text, deepResearch);
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
          systemPrompt: active.systemPrompt + (deepResearch ? "\n\nDeep research mode: synthesize across the provided sources, cite [n] inline, surface conflicting evidence, and end with a short \"What I checked\" list." : ""),
          images,
          files,
          searchContext,
          deepResearch,
          extendedThinking,
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
      let rafPending = false;
      const flush = () => { rafPending = false; setStreamText(acc); };
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
            if (delta) {
              acc += delta;
              if (!rafPending) { rafPending = true; requestAnimationFrame(flush); }
            }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
      setStreamText(acc);

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

      // Fire-and-forget: extract durable facts from this turn
      supabase.functions.invoke("personal-ai-extract-memory", {
        body: { userMessage: text, assistantMessage: acc, threadId: activeId },
      }).catch(() => {});

      // Auto-open artifact if HTML detected
      const html = extractHtmlArtifact(acc);
      if (html) {
        setArtifactHtml(html);
        setArtifactTab("preview");
        setArtifactOpen(true);
      }
      // Auto-open the most recent generated file artifact (PDF/image/HTML/SVG/etc.)
      const artifactFiles = extractFileArtifacts(acc);
      if (artifactFiles.length) {
        setFileArtifact(artifactFiles[artifactFiles.length - 1]);
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
  const copyMsg = async (content: string, ts?: number) => {
    await navigator.clipboard.writeText(content);
    if (ts) { setCopiedTs(ts); setTimeout(() => setCopiedTs(c => c === ts ? null : c), 1500); }
    else toast({ title: "Copied" });
  };
  const downloadAs = async (m: Msg, format: "md" | "docx" | "pptx" | "pdf") => {
    try {
      const { exportResponse } = await import("@/lib/exportResponse");
      await exportResponse(format, m.content, active?.title);
    } catch (e) {
      console.error("export failed:", e);
      toast({ title: "Export failed", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
    }
  };
  const downloadImage = (url: string) => {
    const a = document.createElement("a"); a.href = url; a.download = `image-${Date.now()}.png`; a.click();
  };
  const openHtmlArtifact = (text: string) => {
    const html = extractHtmlArtifact(text);
    if (html) { setArtifactHtml(html); setArtifactTab("preview"); setArtifactOpen(true); }
  };

  // Group threads by recency for sidebar
  const groupedThreads = useMemo(() => {
    const sorted = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const groups: { label: string; items: Thread[] }[] = [
      { label: "Today", items: [] },
      { label: "Yesterday", items: [] },
      { label: "Previous 7 days", items: [] },
      { label: "Older", items: [] },
    ];
    for (const t of sorted) {
      const age = now - t.updatedAt;
      if (age < day) groups[0].items.push(t);
      else if (age < 2 * day) groups[1].items.push(t);
      else if (age < 7 * day) groups[2].items.push(t);
      else groups[3].items.push(t);
    }
    return groups.filter(g => g.items.length);
  }, [threads]);

  const currentModelLabel = MODELS.find(m => m.id === active?.model)?.label ?? "Model";
  const isEmpty = (active?.messages.length ?? 0) === 0 && !streaming;

  const firstName = (profile?.first_name?.trim().split(/\s+/)[0]) || "there";
  const greeting = `Good to have you back, ${firstName}.`;

  const Composer = (
    <div className="space-y-2">
      {pendingAttachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {pendingAttachments.map((a, i) => (
            <Badge key={i} variant="secondary" className="gap-1.5 pl-2 pr-1 py-1 rounded-lg font-normal">
              {a.kind === "image" ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
              <span className="truncate max-w-[200px]">{a.name}</span>
              <button
                onClick={() => setPendingAttachments(prev => prev.filter((_, j) => j !== i))}
                className="ml-0.5 p-0.5 hover:bg-background/60 rounded"
                aria-label="Remove attachment"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div
        className={cn(
          "relative rounded-3xl border border-border/60 bg-card shadow-[0_2px_24px_-12px_rgba(0,0,0,0.15)] focus-within:border-border focus-within:shadow-[0_2px_30px_-10px_rgba(0,0,0,0.2)] transition-shadow",
          dragOver && "border-primary ring-2 ring-primary/30 bg-primary/[0.03]"
        )}
        onDragEnter={(e) => {
          if (!e.dataTransfer?.types?.includes("Files")) return;
          e.preventDefault();
          dragDepth.current += 1;
          setDragOver(true);
        }}
        onDragOver={(e) => {
          if (!e.dataTransfer?.types?.includes("Files")) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDragLeave={(e) => {
          if (!e.dataTransfer?.types?.includes("Files")) return;
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setDragOver(false);
        }}
        onDrop={(e) => {
          if (!e.dataTransfer?.files?.length) return;
          e.preventDefault();
          dragDepth.current = 0;
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          onPaste={(e) => {
            // Files (images, etc.) pasted from clipboard
            const files = Array.from(e.clipboardData.files || []);
            if (files.length) {
              e.preventDefault();
              handleFiles(files);
              return;
            }
            const pasted = e.clipboardData.getData("text");
            // Large paste → convert to a doc attachment so the composer stays usable
            if (pasted && pasted.length > 2000) {
              e.preventDefault();
              const lineCount = pasted.split("\n").length;
              const name = `Pasted text (${pasted.length.toLocaleString()} chars · ${lineCount} lines).txt`;
              setPendingAttachments(prev => [...prev, { name, kind: "doc", text: pasted }]);
              toast({ title: "Long paste attached", description: "Added as a file so the message box stays clean." });
            }
          }}
          placeholder={imageMode ? "Describe an image to generate…" : "Message Personal AI…  (paste long text and it'll attach as a file)"}
          className="min-h-[56px] max-h-[480px] resize-none overflow-y-auto border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-5 pt-4 pb-12 text-[15px] leading-relaxed placeholder:text-muted-foreground/60"
          disabled={streaming}
        />
        <div className="absolute left-2 bottom-2 flex items-center gap-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground" disabled={streaming} aria-label="Attach">
                <Plus className="h-[18px] w-[18px]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuItem onClick={() => fileRef.current?.click()}>
                <Paperclip className="h-4 w-4 mr-2" /> Upload from computer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => imageRef.current?.click()}>
                <ImageIcon className="h-4 w-4 mr-2" /> Add photos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input ref={imageRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files, true); e.target.value = ""; }} />
          <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files, false); e.target.value = ""; }} />

          <Toggle pressed={webSearch && !deepResearch} onPressedChange={(v) => { setWebSearch(v); if (v) setDeepResearch(false); }} size="sm"
            className="h-8 px-2.5 gap-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:border data-[state=on]:border-primary/20"
            aria-label="Web search">
            <Globe className="h-3.5 w-3.5" /> Search
          </Toggle>
          <Toggle pressed={deepResearch} onPressedChange={(v) => { setDeepResearch(v); if (v) setWebSearch(false); }} size="sm"
            className="h-8 px-2.5 gap-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:border data-[state=on]:border-primary/20"
            aria-label="Deep research">
            <Sparkles className="h-3.5 w-3.5" /> Research
          </Toggle>
          <Toggle pressed={extendedThinking} onPressedChange={setExtendedThinking} size="sm"
            className="h-8 px-2.5 gap-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:border data-[state=on]:border-primary/20"
            aria-label="Extended thinking"
            title="Extended thinking (Claude)">
            <Brain className="h-3.5 w-3.5" /> Think
          </Toggle>
          <Toggle pressed={imageMode} onPressedChange={setImageMode} size="sm"
            className="h-8 px-2.5 gap-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:border data-[state=on]:border-primary/20"
            aria-label="Image mode">
            <Wand2 className="h-3.5 w-3.5" /> Image
          </Toggle>
        </div>
        <div className="absolute right-2 bottom-2">
          {streaming ? (
            <Button onClick={stop} size="icon" variant="default" className="h-9 w-9 rounded-full" aria-label="Stop">
              <Square className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={!input.trim() && pendingAttachments.length === 0}
              size="icon"
              className="h-9 w-9 rounded-full disabled:bg-muted disabled:text-muted-foreground"
              aria-label="Send"
            >
              <ArrowUp className="h-[18px] w-[18px]" />
            </Button>
          )}
        </div>
        {dragOver && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl flex items-center justify-center bg-primary/5 backdrop-blur-[2px]">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Paperclip className="h-4 w-4" /> Drop files to attach
            </div>
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground/70 text-center">
        Personal AI can make mistakes. Verify important info.
      </p>
    </div>
  );

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-64 shrink-0 border-r border-border/60 flex flex-col bg-muted/20">
          <div className="p-3 flex items-center gap-2">
            <Button
              onClick={createThread}
              variant="outline"
              className="flex-1 justify-start gap-2 h-9 rounded-lg border-border/60 bg-background hover:bg-accent"
            >
              <MessageSquarePlus className="h-4 w-4" /> New chat
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="px-2 pb-3 space-y-3">
              {groupedThreads.map(g => (
                <div key={g.label}>
                  <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                    {g.label}
                  </div>
                  <div className="space-y-0.5">
                    {g.items.map(t => (
                      <div
                        key={t.id}
                        className={cn(
                          "group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer text-sm transition",
                          t.id === activeId
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground/80 hover:bg-muted hover:text-foreground"
                        )}
                        onClick={() => setActiveId(t.id)}
                      >
                        <span className="flex-1 truncate">{t.title}</span>
                        <button
                          type="button"
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition p-0.5 rounded"
                          onClick={(e) => { e.stopPropagation(); deleteThread(t.id); }}
                          aria-label="Delete chat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border/60 flex items-center justify-between px-4 shrink-0 gap-2 bg-background/80 backdrop-blur">
          <div className="flex items-center gap-1">
            {!sidebarOpen && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  onClick={createThread}
                  aria-label="New chat"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                </Button>
              </>
            )}
            <Select value={active?.model} onValueChange={(v) => updateActive({ model: v })}>
            <SelectTrigger className="h-9 w-auto min-w-[180px] text-sm border-0 shadow-none focus:ring-0 px-2.5 gap-1.5 font-medium hover:bg-muted rounded-lg">
              <SelectValue placeholder={currentModelLabel} />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map(m => (<SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>))}
            </SelectContent>
          </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/compass/setup")}
              className="h-9 gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-4 w-4" /> Setup
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMemoryOpen(true)}
              className="h-9 gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <Brain className="h-4 w-4" /> Memory
            </Button>
          </div>
        </header>
        <MemoryDialog
          open={memoryOpen}
          onOpenChange={setMemoryOpen}
          defaultPrompt={DEFAULT_SYSTEM_PROMPT}
          onProfileSaved={(p) => setSavedProfilePrompt(p)}
        />

        <div className="flex-1 flex min-h-0">
          {/* Chat column */}
          <div className="flex-1 flex flex-col min-w-0">
            {isEmpty ? (
              <div className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="w-full max-w-2xl space-y-8">
                  <div className="text-center space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight">{greeting}</h1>
                    <p className="text-sm text-muted-foreground">
                      What are we working on?
                    </p>
                  </div>
                  {Composer}
                </div>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1">
                  <div ref={scrollRef} className="max-w-3xl mx-auto w-full px-4 py-8 space-y-8">
                    {active?.messages.map((m, i) => (
                      <div key={i} className="group">
                        {m.role === "user" ? (
                          <div className="flex justify-end">
                            <div className="max-w-[85%] space-y-2">
                              {m.attachments?.length ? (
                                <div className="flex flex-wrap gap-1.5 justify-end">
                                  {m.attachments.map((a, j) => (
                                    <Badge key={j} variant="secondary" className="gap-1 text-xs font-normal">
                                      {a.kind === "image" ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                      {a.name}
                                    </Badge>
                                  ))}
                                </div>
                              ) : null}
                              {m.content && (
                                <div className="rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed bg-muted text-foreground whitespace-pre-wrap">
                                  {m.content}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground shadow-sm">
                              <Sparkles className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-3 pt-0.5">
                              {m.imageUrl ? (
                                <div className="space-y-2">
                                  <img src={m.imageUrl} alt="Generated" className="rounded-xl border max-w-full" />
                                  <button onClick={() => downloadImage(m.imageUrl!)} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                                    <Download className="h-3 w-3" /> Download
                                  </button>
                                </div>
                              ) : (
                                <div className="prose prose-sm dark:prose-invert max-w-none text-[15px] leading-relaxed prose-p:my-3 prose-headings:mt-5 prose-headings:mb-2 prose-pre:my-3 prose-pre:rounded-xl prose-pre:bg-muted prose-pre:text-foreground prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-li:my-1 prose-ul:my-3 prose-ol:my-3">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                                </div>
                              )}
                              {m.searchSources?.length ? (
                                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/40">
                                  <div className="font-medium flex items-center gap-1 text-foreground/70"><Globe className="h-3 w-3" /> Sources</div>
                                  {m.searchSources.map((s, j) => (
                                    <a key={j} href={s.url} target="_blank" rel="noopener noreferrer" className="block truncate hover:text-foreground">
                                      [{j + 1}] {s.title}
                                    </a>
                                  ))}
                                </div>
                              ) : null}
                              {m.content && (
                                <div className="flex items-center gap-1 -ml-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
                                  <button onClick={() => copyMsg(m.content, m.ts)} className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Copy">
                                    {copiedTs === m.ts ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                  </button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Download">
                                        <Download className="h-3.5 w-3.5" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-44">
                                      <DropdownMenuLabel className="text-xs">Download as</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => downloadAs(m, "docx")}>Word (.docx)</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => downloadAs(m, "pptx")}>PowerPoint (.pptx)</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => downloadAs(m, "pdf")}>PDF</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => downloadAs(m, "md")}>Markdown (.md)</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  {extractHtmlArtifact(m.content) && (
                                    <button onClick={() => openHtmlArtifact(m.content)} className="h-7 px-2 inline-flex items-center gap-1 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Open artifact">
                                      <Eye className="h-3.5 w-3.5" /> Artifact
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {streamText && (
                      <div className="flex gap-3">
                        <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground shadow-sm">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="prose prose-sm dark:prose-invert max-w-none text-[15px] leading-relaxed prose-p:my-3 prose-headings:mt-5 prose-headings:mb-2 prose-pre:my-3 prose-pre:rounded-xl prose-pre:bg-muted prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-li:my-1">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamText + "▍"}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}

                    {streamImage && (
                      <div className="flex gap-3">
                        <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground shadow-sm">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <img src={streamImage} alt="Generating…" className={cn("rounded-xl border max-w-full transition-[filter] duration-500", streamImageFinal ? "blur-0" : "blur-2xl")} />
                      </div>
                    )}

                    {streaming && !streamText && !streamImage && (
                      <div className="flex gap-3 items-center">
                        <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground shadow-sm">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          {imageMode ? "Generating image…" : webSearch ? "Searching the web…" : "Thinking…"}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="bg-gradient-to-t from-background via-background to-transparent pt-4">
                  <div className="max-w-3xl mx-auto w-full px-4 pb-4">
                    {Composer}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Artifact panel */}
          {artifactOpen && (
            <aside className="w-[45%] min-w-[420px] border-l border-border/60 flex flex-col bg-muted/10">
              <div className="h-14 border-b border-border/60 flex items-center justify-between px-3 shrink-0 bg-background/60">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1 font-normal"><CodeIcon className="h-3 w-3" /> HTML artifact</Badge>
                  <div className="flex rounded-lg border border-border/60 bg-background overflow-hidden">
                    <button onClick={() => setArtifactTab("preview")} className={cn("px-2.5 py-1 text-xs inline-flex items-center gap-1", artifactTab === "preview" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")}>
                      <Eye className="h-3 w-3" /> Preview
                    </button>
                    <button onClick={() => setArtifactTab("code")} className={cn("px-2.5 py-1 text-xs inline-flex items-center gap-1 border-l border-border/60", artifactTab === "code" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")}>
                      <CodeIcon className="h-3 w-3" /> Code
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" onClick={() => {
                    const blob = new Blob([artifactHtml], { type: "text/html" });
                    const url = URL.createObjectURL(blob);
                    const w = window.open(url, "_blank", "noopener,noreferrer");
                    if (!w) { toast({ title: "Popup blocked", description: "Allow popups to open the artifact in a new tab.", variant: "destructive" }); }
                    setTimeout(() => URL.revokeObjectURL(url), 60_000);
                  }}>
                    <ExternalLink className="h-3 w-3" /> Open in browser
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" onClick={() => copyMsg(artifactHtml)}>
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" onClick={() => {
                    const blob = new Blob([artifactHtml], { type: "text/html" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = `artifact-${Date.now()}.html`; a.click(); URL.revokeObjectURL(url);
                  }}><Download className="h-3 w-3" /> .html</Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setArtifactOpen(false)} aria-label="Close artifact"><X className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                {artifactTab === "preview" ? (
                  <iframe title="Artifact preview" srcDoc={artifactHtml} sandbox="allow-scripts" className="w-full h-full bg-white" />
                ) : (
                  <ScrollArea className="h-full">
                    <pre className="text-xs p-4 whitespace-pre-wrap font-mono leading-relaxed">{artifactHtml}</pre>
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
