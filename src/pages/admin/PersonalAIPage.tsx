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
  MessageSquarePlus, Check, RefreshCw, Brain, PanelLeftClose, PanelLeftOpen, ExternalLink, Inbox,
  Monitor, Tablet, Smartphone, Maximize2, Minimize2,
} from "lucide-react";
import { MemoryDialog } from "@/components/personal-ai/MemoryDialog";
import { ArtifactPreviewFrame } from "@/components/personal-ai/ArtifactPreviewFrame";
import { RichMarkdown } from "@/components/personal-ai/RichMarkdown";
import { PRESETS, type Preset } from "@/components/personal-ai/PresetChips";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
export type FileArtifact = { filename: string; url: string; downloadUrl: string; kind: "pdf" | "image" | "html" | "svg" | "docx" | "pptx" | "xlsx" | "other" };
function kindFromName(name: string): FileArtifact["kind"] {
  const ext = name.toLowerCase().split(".").pop() || "";
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return "image";
  if (ext === "html" || ext === "htm") return "html";
  if (ext === "svg") return "svg";
  if (ext === "docx") return "docx";
  if (ext === "pptx") return "pptx";
  if (ext === "xlsx" || ext === "xls" || ext === "csv") return "xlsx";
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
  return text
    .replace(/<!--artifact:\{[\s\S]*?\}-->\n?/g, "")
    // Drop the transient "Building your file…" progress line once streaming has settled.
    .replace(/\n?_Building your file…_\n?/g, "")
    .trim();
}

// Icon + label helpers for the artifact pill rendered in the chat transcript.
function artifactBadge(kind: FileArtifact["kind"]): { label: string; emoji: string } {
  switch (kind) {
    case "pdf": return { label: "PDF", emoji: "📕" };
    case "image": return { label: "Image", emoji: "🖼️" };
    case "html": return { label: "HTML", emoji: "🌐" };
    case "svg": return { label: "SVG", emoji: "🎨" };
    case "docx": return { label: "Word", emoji: "📄" };
    case "pptx": return { label: "Slides", emoji: "📊" };
    case "xlsx": return { label: "Sheet", emoji: "📈" };
    default: return { label: "File", emoji: "📎" };
  }
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
  const { isSuperAdmin, isToolOnly, profile, user } = useAuth();
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
  const [activePreset, setActivePreset] = useState<Preset | null>(null);
  const [imageAspect, setImageAspect] = useState<string>("1:1");
  const [imageStyle, setImageStyle] = useState<string>("auto");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [streamImage, setStreamImage] = useState<string | null>(null);
  const [streamImageFinal, setStreamImageFinal] = useState(false);
  const [artifactOpen, setArtifactOpen] = useState(false);
  const [artifactTab, setArtifactTab] = useState<"preview" | "code">("preview");
  const [artifactHtml, setArtifactHtml] = useState<string>("");
  const [fileArtifact, setFileArtifact] = useState<FileArtifact | null>(null);
  const [artifactBlobUrl, setArtifactBlobUrl] = useState<string>("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewNonce, setPreviewNonce] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Thread | null>(null);
  const [artifactFullscreen, setArtifactFullscreen] = useState(false);
  const deviceWidthFor = (d: "desktop" | "tablet" | "mobile") =>
    d === "mobile" ? 414 : d === "tablet" ? 834 : 1280;



  // Fetch the artifact as a blob and create a same-origin object URL so the
  // iframe preview and "Open" actions aren't blocked by Chrome's cross-origin
  // download / sandboxing rules on Supabase storage signed URLs.
  useEffect(() => {
    let cancelled = false;
    let createdUrl = "";
    if (!fileArtifact) { setArtifactBlobUrl(""); return; }
    (async () => {
      try {
        const res = await fetch(fileArtifact.url);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const blob = await res.blob();
        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setArtifactBlobUrl(createdUrl);
      } catch {
        if (!cancelled) setArtifactBlobUrl("");
      }
    })();
    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [fileArtifact?.url]);
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

  // ─── Cloud sync: load threads from Supabase on mount, push changes back ───
  const cloudHydratedRef = useRef(false);
  const dirtyThreadsRef = useRef<Set<string>>(new Set());
  const flushTimerRef = useRef<number | null>(null);

  // Initial hydration from cloud (merges with local cache so nothing is lost)
  useEffect(() => {
    if (!user?.id || cloudHydratedRef.current) return;
    cloudHydratedRef.current = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("personal_ai_threads")
          .select("id,title,model,system_prompt,messages,updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(100);
        if (error) throw error;

        const cloudThreads: Thread[] = (data ?? []).map((r: any) => ({
          id: r.id,
          title: r.title || "New chat",
          model: r.model || MODELS[0].id,
          systemPrompt: r.system_prompt || DEFAULT_SYSTEM_PROMPT,
          messages: Array.isArray(r.messages) ? r.messages : [],
          updatedAt: r.updated_at ? new Date(r.updated_at).getTime() : Date.now(),
        }));

        if (cloudThreads.length === 0) {
          // First time on cloud — push any meaningful local threads up
          const localToPush = threads.filter(t => t.messages.length > 0);
          if (localToPush.length) {
            await supabase.from("personal_ai_threads").upsert(
              localToPush.map(t => ({
                id: t.id,
                user_id: user.id,
                title: t.title,
                model: t.model,
                system_prompt: t.systemPrompt,
                messages: t.messages as any,
                updated_at: new Date(t.updatedAt).toISOString(),
              })),
            );
          }
          return;
        }

        // Merge: cloud wins for overlapping ids; keep local-only unsaved drafts
        const cloudIds = new Set(cloudThreads.map(t => t.id));
        const localOnly = threads.filter(t => !cloudIds.has(t.id) && t.messages.length > 0);
        const merged = [...cloudThreads, ...localOnly].sort((a, b) => b.updatedAt - a.updatedAt);
        setThreads(merged.length ? merged : [newThread()]);

        // Restore last-active if it exists in the merged set; otherwise pick newest
        const storedActive = localStorage.getItem(ACTIVE_KEY);
        if (storedActive && merged.some(t => t.id === storedActive)) {
          setActiveId(storedActive);
        } else {
          setActiveId(merged[0]?.id ?? activeId);
        }
      } catch (e) {
        console.warn("[compass] cloud thread hydration failed:", e);
      }
    })();
  }, [user?.id]);

  // Mark threads dirty whenever they change locally, then debounce-upsert to cloud
  useEffect(() => {
    if (!user?.id || !cloudHydratedRef.current) return;
    for (const t of threads) dirtyThreadsRef.current.add(t.id);
    if (flushTimerRef.current) window.clearTimeout(flushTimerRef.current);
    flushTimerRef.current = window.setTimeout(async () => {
      const ids = Array.from(dirtyThreadsRef.current);
      dirtyThreadsRef.current.clear();
      const rows = threads
        .filter(t => ids.includes(t.id))
        .map(t => ({
          id: t.id,
          user_id: user.id,
          title: t.title || "New chat",
          model: t.model,
          system_prompt: t.systemPrompt,
          messages: t.messages as any,
          updated_at: new Date(t.updatedAt).toISOString(),
        }));
      if (!rows.length) return;
      try {
        const { error } = await supabase
          .from("personal_ai_threads")
          .upsert(rows, { onConflict: "id" });
        if (error) throw error;
      } catch (e) {
        console.warn("[compass] cloud thread save failed:", e);
      }
    }, 800);
    return () => {
      if (flushTimerRef.current) window.clearTimeout(flushTimerRef.current);
    };
  }, [threads, user?.id]);

  // Auto-grow the composer textarea so long text doesn't overflow or scroll prematurely.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = 480; // generous max before internal scroll kicks in
    el.style.height = Math.min(el.scrollHeight, max) + "px";
  }, [input]);
  useEffect(() => {
    const inner = scrollRef.current;
    if (!inner) return;
    // Radix ScrollArea: the real scroller is the viewport ancestor, not the inner content div.
    const viewport = inner.closest('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    const el = viewport ?? inner;
    // Use instant scroll while streaming so the view follows generated content without lag.
    el.scrollTo({ top: el.scrollHeight, behavior: streaming ? "auto" : "smooth" });
  }, [active?.messages.length, streamText, streamImage, streaming]);

  // While streaming, continuously follow the bottom (covers cases where text grows
  // between React re-renders, e.g. long code blocks rendered incrementally).
  useEffect(() => {
    if (!streaming) return;
    const inner = scrollRef.current;
    if (!inner) return;
    const viewport = (inner.closest('[data-radix-scroll-area-viewport]') as HTMLElement | null) ?? inner;
    let raf = 0;
    const tick = () => {
      viewport.scrollTop = viewport.scrollHeight;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [streaming]);

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
    // Best-effort cloud delete (RLS ensures it's only the user's row)
    if (user?.id) {
      supabase.from("personal_ai_threads").delete().eq("id", id).then(({ error }) => {
        if (error) console.warn("[compass] cloud thread delete failed:", error);
      });
    }
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

  // Detect intent from natural language so users don't have to click toggles.
  // Returns per-turn overrides; explicit toggles still win.
  const detectIntent = (raw: string) => {
    const t = raw.toLowerCase().trim();
    const image = /^(?:please\s+)?(?:can you |could you |pls |plz )?(?:generate|create|make|draw|render|design|paint|illustrate|produce|give me|show me)\s+(?:an?\s+|me\s+an?\s+)?(?:image|picture|photo|illustration|logo|icon|graphic|artwork|painting|drawing|render|mockup|wallpaper|poster|banner|sketch)\b/i.test(raw)
      || /\b(image of|picture of|photo of|illustration of|drawing of|render of)\b/i.test(raw);
    const research = /\b(deep research|research (?:on|into|about)|do (?:some |a )?research|investigate|comprehensive (?:analysis|report)|in[- ]?depth (?:look|analysis|report)|literature review)\b/i.test(raw);
    const search = !research && /\b(search (?:the )?web|google|look(?: this)? up|find online|latest (?:news|info|update)|what'?s (?:new|happening)|current (?:news|events|price|status)|today'?s)\b/i.test(raw);
    const think = /\b(think (?:hard|deeply|carefully|step by step)|reason (?:through|carefully)|extended thinking|take your time|work this out)\b/i.test(raw);
    return { image, research, search, think };
  };

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && pendingAttachments.length === 0) || streaming || !active) return;

    const intent = text ? detectIntent(text) : { image: false, research: false, search: false, think: false };
    const useImage = imageMode || intent.image;
    const useResearch = deepResearch || intent.research;
    const useSearch = !useResearch && (webSearch || intent.search);
    const useThink = extendedThinking || intent.think;

    if (useImage) {
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
    const usedPreset = activePreset;
    setActivePreset(null);
    setStreaming(true);
    setStreamText("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let searchContext = "";
      let searchSources: { title: string; url: string }[] = [];
      if ((useSearch || useResearch) && text) {
        try {
          const r = await runWebSearch(text, useResearch);
          searchContext = r.context;
          searchSources = r.sources;
        } catch (e: any) {
          toast({ title: "Web search failed", description: e.message, variant: "destructive" });
        }
      }

      const images = attachments.filter(a => a.kind === "image").map(a => ({ name: a.name, dataUrl: a.dataUrl! }));
      const files = attachments.filter(a => a.kind === "doc").map(a => ({ name: a.name, text: a.text! }));

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const accessToken = currentSession?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/personal-ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          history: active.messages.map(m => ({ role: m.role, content: m.content })),
          model: active.model,
          systemPrompt: active.systemPrompt
            + (usedPreset ? `\n\n# Build preset: ${usedPreset.label}\n${usedPreset.instruction}\n\nWhen you produce a diagram, ALWAYS emit it as a fenced \`\`\`mermaid block. When you produce a custom vector graphic (not a diagram), emit a fenced \`\`\`svg block containing valid <svg>...</svg> markup. These are rendered inline as interactive artifacts — never describe the diagram in prose instead of drawing it.` : "")
            + (useResearch ? "\n\nDeep research mode: synthesize across the provided sources, cite [n] inline, surface conflicting evidence, and end with a short \"What I checked\" list." : ""),
          images,
          files,
          searchContext,
          deepResearch: useResearch,
          extendedThinking: useThink,
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
      {activePreset && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5 pl-2 pr-1 py-1 rounded-lg font-normal">
            <activePreset.icon className="h-3 w-3" />
            <span>Build: {activePreset.label}</span>
            <button
              onClick={() => setActivePreset(null)}
              className="ml-0.5 p-0.5 hover:bg-background/60 rounded"
              aria-label="Clear preset"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}
      {imageMode && (
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-muted-foreground/70 uppercase tracking-wider font-medium">Image</span>
          <Select value={imageAspect} onValueChange={setImageAspect}>
            <SelectTrigger className="h-7 w-auto gap-1 rounded-full px-2.5 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1:1">Square (1:1)</SelectItem>
              <SelectItem value="3:2">Landscape (3:2)</SelectItem>
              <SelectItem value="2:3">Portrait (2:3)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={imageStyle} onValueChange={setImageStyle}>
            <SelectTrigger className="h-7 w-auto gap-1 rounded-full px-2.5 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto style</SelectItem>
              <SelectItem value="photo">Photorealistic</SelectItem>
              <SelectItem value="illustration">Illustration</SelectItem>
              <SelectItem value="3d">3D render</SelectItem>
              <SelectItem value="line">Line art</SelectItem>
              <SelectItem value="flat">Flat / vector</SelectItem>
              <SelectItem value="watercolor">Watercolor</SelectItem>
              <SelectItem value="cinematic">Cinematic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
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
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuItem onClick={() => fileRef.current?.click()}>
                <Paperclip className="h-4 w-4 mr-2" /> Upload from computer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => imageRef.current?.click()}>
                <ImageIcon className="h-4 w-4 mr-2" /> Add photos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                Build
              </DropdownMenuLabel>
              {PRESETS.map((p) => {
                const Icon = p.icon;
                const isActive = activePreset?.id === p.id;
                return (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => setActivePreset(isActive ? null : p)}
                    className={cn(isActive && "bg-primary/10 text-primary focus:bg-primary/15 focus:text-primary")}
                  >
                    <Icon className="h-4 w-4 mr-2" /> {p.label}
                    {isActive && <Check className="h-3.5 w-3.5 ml-auto" />}
                  </DropdownMenuItem>
                );
              })}
              {activePreset && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActivePreset(null)} className="text-muted-foreground">
                    <X className="h-4 w-4 mr-2" /> Clear build preset
                  </DropdownMenuItem>
                </>
              )}
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
                          "group grid grid-cols-[minmax(0,1fr)_2rem] items-center gap-1 rounded-lg pl-3 pr-1.5 py-1.5 cursor-pointer text-sm transition",
                          t.id === activeId
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground/80 hover:bg-muted hover:text-foreground"
                        )}
                        onClick={() => setActiveId(t.id)}
                        title={t.title}
                      >
                        <span className="min-w-0 truncate leading-6">
                          {t.title || "New chat"}
                        </span>
                        <button
                          type="button"
                          className={cn(
                            "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded transition",
                            "text-muted-foreground/60 hover:text-destructive hover:bg-background/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                            t.id === activeId
                              ? "opacity-80 hover:opacity-100"
                              : "opacity-0 group-hover:opacity-60 hover:!opacity-100 focus:opacity-100"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(t);
                          }}
                          aria-label="Delete chat"
                          title="Delete chat"
                        >
                          <X className="h-3 w-3" strokeWidth={2.25} />
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
              onClick={() => navigate("/compass/locker")}
              className="h-9 gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              title="Compass Locker — pass text & files between devices"
            >
              <Inbox className="h-4 w-4" /> Locker
            </Button>
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
                                <>
                                  {stripArtifactMarkers(m.content) && (
                                    <RichMarkdown>{stripArtifactMarkers(m.content)}</RichMarkdown>
                                  )}
                                  {(() => {
                                    const html = extractHtmlArtifact(m.content);
                                    if (!html) return null;
                                    return (
                                      <div className="pt-1">
                                        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                                          <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-muted/40">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                              <CodeIcon className="h-3.5 w-3.5" />
                                              <span className="font-medium text-foreground">HTML preview</span>
                                            </div>
                                            <button
                                              onClick={() => openHtmlArtifact(m.content)}
                                              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                                            >
                                              <Eye className="h-3.5 w-3.5" /> Open full preview
                                            </button>
                                          </div>
                                          <ArtifactPreviewFrame
                                            title="Inline HTML preview"
                                            srcDoc={html}
                                            sandbox="allow-scripts"
                                            deviceWidth={1280}
                                            height={420}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })()}
                                  {(() => {
                                    const files = extractFileArtifacts(m.content);
                                    if (!files.length) return null;
                                    return (
                                      <div className="flex flex-wrap gap-2 pt-1">
                                        {files.map((f, i) => {
                                          const b = artifactBadge(f.kind);
                                          const isActive = fileArtifact?.url === f.url && artifactOpen;
                                          const isImage = f.kind === "image";
                                          const isPdf = f.kind === "pdf";
                                          return (
                                            <button
                                              key={i}
                                              onClick={() => { setFileArtifact(f); setArtifactOpen(true); }}
                                              className={cn(
                                                "group flex flex-col rounded-xl border bg-card hover:bg-accent/30 transition overflow-hidden text-left",
                                                isActive ? "border-primary/60 ring-1 ring-primary/30" : "border-border/60"
                                              )}
                                              title={`Open ${f.filename} in preview`}
                                            >
                                              {isImage ? (
                                                <div className="w-[280px] h-[180px] bg-muted/40 flex items-center justify-center">
                                                  <img src={f.url} alt={f.filename} className="max-w-full max-h-full object-contain" />
                                                </div>
                                              ) : isPdf ? (
                                                <div className="w-[280px] h-[180px] bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/20 flex flex-col items-center justify-center gap-1.5">
                                                  <FileText className="h-10 w-10 text-rose-500/80" />
                                                  <span className="text-[10px] font-semibold tracking-widest text-rose-600/80 dark:text-rose-400/80">PDF</span>
                                                </div>
                                              ) : (
                                                <div className="w-[280px] h-[140px] bg-gradient-to-br from-muted to-muted/40 flex items-center justify-center text-5xl">{b.emoji}</div>
                                              )}
                                              <div className="flex items-center gap-2 px-3 py-2 border-t border-border/60 w-[280px]">
                                                <span className="min-w-0 flex flex-col flex-1">
                                                  <span className="text-sm font-medium truncate">{f.filename}</span>
                                                  <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{b.label} · Click to preview</span>
                                                </span>
                                                <Eye className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    );
                                  })()}

                                </>
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
                          <RichMarkdown>{stripArtifactMarkers(streamText) + "▍"}</RichMarkdown>
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
                      <div className="flex gap-3 items-center animate-fade-in">
                        <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground shadow-sm">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-muted/70 border border-border/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1s" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: "150ms", animationDuration: "1s" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: "300ms", animationDuration: "1s" }} />
                          </div>
                          <span
                            className="text-xs font-medium bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-[length:200%_100%] bg-clip-text text-transparent animate-[shimmer_2.4s_linear_infinite]"
                          >
                            {imageMode ? "Rendering image" : webSearch ? "Searching the web" : `${currentModelLabel} is thinking`}
                          </span>
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
            <aside
              className={cn(
                "border-l border-border/60 flex flex-col bg-muted/10 transition-all duration-200",
                artifactFullscreen
                  ? "fixed inset-0 z-50 w-full border-l-0 bg-background"
                  : "w-[52%] min-w-[480px] max-w-[920px]"
              )}
            >
              {/* Unified toolbar — works for both HTML artifacts and file artifacts */}
              <div className="h-14 border-b border-border/60 flex items-center justify-between px-3 shrink-0 bg-background/80 backdrop-blur gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {fileArtifact ? (
                    <>
                      <Badge variant="outline" className="gap-1 font-normal shrink-0 uppercase text-[10px]">{fileArtifact.kind}</Badge>
                      <span className="text-sm font-medium truncate" title={fileArtifact.filename}>{fileArtifact.filename}</span>
                    </>
                  ) : (
                    <>
                      <Badge variant="outline" className="gap-1 font-normal shrink-0"><CodeIcon className="h-3 w-3" /> HTML artifact</Badge>
                      <div className="flex rounded-lg border border-border/60 bg-background overflow-hidden">
                        <button onClick={() => setArtifactTab("preview")} className={cn("px-2.5 py-1 text-xs inline-flex items-center gap-1", artifactTab === "preview" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")}>
                          <Eye className="h-3 w-3" /> Preview
                        </button>
                        <button onClick={() => setArtifactTab("code")} className={cn("px-2.5 py-1 text-xs inline-flex items-center gap-1 border-l border-border/60", artifactTab === "code" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")}>
                          <CodeIcon className="h-3 w-3" /> Code
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Device-width toggle — only meaningful for HTML/web previews */}
                  {(!fileArtifact || fileArtifact.kind === "html") && (!fileArtifact || artifactTab === "preview") && (
                    <div className="hidden sm:flex rounded-lg border border-border/60 bg-background overflow-hidden mr-1">
                      {([
                        { id: "desktop" as const, Icon: Monitor, label: "Desktop" },
                        { id: "tablet" as const, Icon: Tablet, label: "Tablet" },
                        { id: "mobile" as const, Icon: Smartphone, label: "Mobile" },
                      ]).map(({ id, Icon, label }) => (
                        <button
                          key={id}
                          onClick={() => setPreviewDevice(id)}
                          title={label}
                          aria-label={label}
                          className={cn(
                            "px-2 py-1 inline-flex items-center justify-center",
                            previewDevice === id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>
                  )}

                  {fileArtifact ? (
                    <>
                      <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" asChild>
                        <a href={fileArtifact.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" /> Open</a>
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" asChild>
                        <a href={fileArtifact.downloadUrl}><Download className="h-3 w-3" /> Download</a>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" onClick={() => {
                        const blob = new Blob([artifactHtml], { type: "text/html" });
                        const url = URL.createObjectURL(blob);
                        const w = window.open(url, "_blank", "noopener,noreferrer");
                        if (!w) { toast({ title: "Popup blocked", description: "Allow popups to open the artifact in a new tab.", variant: "destructive" }); }
                        setTimeout(() => URL.revokeObjectURL(url), 60_000);
                      }}>
                        <ExternalLink className="h-3 w-3" /> Open
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" onClick={() => copyMsg(artifactHtml)}>
                        <Copy className="h-3 w-3" /> Copy
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" onClick={() => {
                        const blob = new Blob([artifactHtml], { type: "text/html" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a"); a.href = url; a.download = `artifact-${Date.now()}.html`; a.click(); URL.revokeObjectURL(url);
                      }}><Download className="h-3 w-3" /> .html</Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => setPreviewNonce(n => n + 1)}
                    title="Refresh preview"
                    aria-label="Refresh preview"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => setArtifactFullscreen(v => !v)}
                    title={artifactFullscreen ? "Exit fullscreen" : "Fullscreen"}
                    aria-label={artifactFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  >
                    {artifactFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setArtifactOpen(false); setFileArtifact(null); setArtifactFullscreen(false); }} aria-label="Close artifact"><X className="h-4 w-4" /></Button>
                </div>
              </div>

              {/* Preview surface */}
              <div key={previewNonce} className="flex-1 min-h-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border))_1px,transparent_0)] [background-size:20px_20px] bg-muted/20 p-4 overflow-auto">
                {fileArtifact ? (
                  !artifactBlobUrl ? (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Loading preview…</div>
                  ) : fileArtifact.kind === "image" || fileArtifact.kind === "svg" ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <img src={artifactBlobUrl} alt={fileArtifact.filename} className="max-w-full max-h-full object-contain rounded-lg shadow-lg bg-white" />
                    </div>
                  ) : fileArtifact.kind === "pdf" ? (
                    <div className="mx-auto h-full rounded-lg shadow-lg overflow-hidden bg-white" style={{ maxWidth: 900 }}>
                      <iframe title={fileArtifact.filename} src={artifactBlobUrl} className="w-full h-full bg-white" />
                    </div>
                  ) : fileArtifact.kind === "html" ? (
                    <div
                      className="mx-auto h-full rounded-lg shadow-lg overflow-hidden bg-white ring-1 ring-border/60"
                      style={{ maxWidth: deviceWidthFor(previewDevice) }}
                    >
                      <ArtifactPreviewFrame
                        title={fileArtifact.filename}
                        src={artifactBlobUrl}
                        deviceWidth={deviceWidthFor(previewDevice)}
                        className="h-full"
                      />
                    </div>
                  ) : (fileArtifact.kind === "pptx" || fileArtifact.kind === "docx" || fileArtifact.kind === "xlsx") ? (
                    <div className="mx-auto h-full rounded-lg shadow-lg overflow-hidden bg-white ring-1 ring-border/60" style={{ maxWidth: 1100 }}>
                      <iframe
                        title={fileArtifact.filename}
                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileArtifact.url)}`}
                        className="w-full h-full bg-white"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground/60" />
                      <div className="text-sm font-medium">{fileArtifact.filename}</div>
                      <div className="text-xs text-muted-foreground">Inline preview isn't available for this file type.</div>
                      <Button size="sm" asChild><a href={fileArtifact.downloadUrl}><Download className="h-3 w-3 mr-1" /> Download to view</a></Button>
                    </div>
                  )
                ) : artifactTab === "preview" ? (
                  <div
                    className="mx-auto h-full rounded-lg shadow-lg overflow-hidden bg-white ring-1 ring-border/60"
                    style={{ maxWidth: deviceWidthFor(previewDevice) }}
                  >
                    <ArtifactPreviewFrame
                      title="Artifact preview"
                      srcDoc={artifactHtml}
                      sandbox="allow-scripts"
                      deviceWidth={deviceWidthFor(previewDevice)}
                      className="h-full"
                    />
                  </div>
                ) : (
                  <ScrollArea className="h-full rounded-lg bg-background ring-1 ring-border/60">
                    <pre className="text-xs p-4 whitespace-pre-wrap font-mono leading-relaxed">{artifactHtml}</pre>
                  </ScrollArea>
                )}
              </div>
            </aside>
          )}
        </div>
      </main>
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title || "New chat"}" will be permanently removed from all your devices. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteThread(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

