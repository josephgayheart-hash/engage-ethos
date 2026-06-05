import { useEffect, useRef, useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Send, Copy, Trash2, Plus, Square, Loader2 } from "lucide-react";

type Role = "user" | "assistant" | "system";
interface Msg { role: Role; content: string; ts: number }
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

Help him write, edit, review, and improve executive communications while preserving his authentic voice.

Writing principles: clarity, brevity, credibility, business impact, actionability. Every sentence earns its place. Do not sound promotional, academic, or AI-generated.

Tone: professional but approachable, executive but conversational, confident but not arrogant, direct but not blunt.

Never use: "leverage", "synergy", "circle back", "best-in-class", "world-class", "game-changing", "revolutionary", "transformative".
Avoid corporate clichés and excessive exclamation. Do not use em dashes unless requested.

Email: objective up front, short paragraphs, clear ask, next steps at end.
Meeting summaries: Key Decisions · Key Takeaways · Risks/Concerns · Next Steps · Owners.
Editing: preserve intent and voice, remove filler, improve executive readability.

Default output order when rewriting: (1) Recommended version, (2) Key improvements (3–6 short bullets), (3) Optional stronger version only if it adds value.

Otherwise, answer the question directly. Prioritize usefulness over creativity.`;

function loadThreads(): Thread[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}
function saveThreads(t: Thread[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
}

function newThread(model = MODELS[0].id, systemPrompt = DEFAULT_SYSTEM_PROMPT): Thread {
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    updatedAt: Date.now(),
    messages: [],
    systemPrompt,
    model,
  };
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
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const active = useMemo(() => threads.find(t => t.id === activeId) ?? threads[0], [threads, activeId]);

  useEffect(() => { document.title = "Personal AI"; }, []);
  useEffect(() => { saveThreads(threads); }, [threads]);
  useEffect(() => { localStorage.setItem(ACTIVE_KEY, activeId); }, [activeId]);
  useEffect(() => { inputRef.current?.focus(); }, [activeId]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, streamText]);

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
      if (next.length === 0) {
        const fresh = newThread();
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || streaming || !active) return;

    const userMsg: Msg = { role: "user", content: text, ts: Date.now() };
    const newMessages = [...active.messages, userMsg];
    const titleUpdate = active.messages.length === 0
      ? { title: text.slice(0, 60) + (text.length > 60 ? "…" : "") }
      : {};
    updateActive({ messages: newMessages, ...titleUpdate });
    setInput("");
    setStreaming(true);
    setStreamText("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/playground-chat`, {
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
          institutionalConfig: null,
          contentDNA: null,
          profileConfig: null,
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) throw new Error("Rate limit exceeded. Try again in a moment.");
        if (resp.status === 402) throw new Error("AI credits exhausted.");
        throw new Error(`Request failed (${resp.status})`);
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
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }

      const finalMsg: Msg = { role: "assistant", content: acc, ts: Date.now() };
      setThreads(prev => prev.map(t =>
        t.id === activeId ? { ...t, messages: [...newMessages, finalMsg], updatedAt: Date.now() } : t
      ));
      setStreamText("");
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

  const copyMsg = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast({ title: "Copied" });
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
        <header className="h-12 border-b flex items-center justify-between px-4 shrink-0">
          <Select value={active?.model} onValueChange={(v) => updateActive({ model: v })}>
            <SelectTrigger className="h-8 w-[220px] text-sm border-0 shadow-none focus:ring-0 px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </header>

        <ScrollArea className="flex-1">
          <div ref={scrollRef} className="max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
            {active?.messages.map((m, i) => (
              <div key={i} className="group">
                {m.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm bg-primary text-primary-foreground whitespace-pre-wrap">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm">
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-pre:my-2">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>
                    <button
                      onClick={() => copyMsg(m.content)}
                      className="opacity-0 group-hover:opacity-100 mt-1 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
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

            {streaming && !streamText && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t bg-background">
          <div className="max-w-3xl mx-auto w-full px-4 py-4">
            <div className="relative rounded-2xl border bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message…"
                className="min-h-[52px] max-h-[300px] resize-none border-0 bg-transparent focus-visible:ring-0 pr-12 py-3.5"
                disabled={streaming}
              />
              <div className="absolute right-2 bottom-2">
                {streaming ? (
                  <Button onClick={stop} size="icon" variant="ghost" className="h-8 w-8">
                    <Square className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSend} disabled={!input.trim()} size="icon" className="h-8 w-8">
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-2">Enter to send · Shift+Enter for newline</p>
          </div>
        </div>
      </main>
    </div>
  );
}
