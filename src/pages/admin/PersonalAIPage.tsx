import { useEffect, useRef, useState, useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { LogEditDialog } from "@/components/admin/LogEditDialog";
import {
  Sparkles, Send, Copy, Trash2, Plus, MessageSquare, Wand2, FileText,
  Mail, ScrollText, Loader2, Settings2, BrainCircuit, RefreshCw, GitCompare,
} from "lucide-react";

type Role = "user" | "assistant" | "system";
interface Msg { role: Role; content: string; ts: number }
interface Thread { id: string; title: string; updatedAt: number; messages: Msg[]; systemPrompt: string; model: string }

const STORAGE_KEY = "personal-ai-threads-v1";
const ACTIVE_KEY = "personal-ai-active-v1";

const MODELS = [
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", hint: "Best for nuanced writing & long context" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", hint: "Fast, balanced — great default" },
  { id: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", hint: "Fastest / cheapest" },
  { id: "openai/gpt-5-mini", label: "GPT-5 Mini", hint: "OpenAI reasoning, faster" },
];

const DEFAULT_SYSTEM_PROMPT = `You are Tyler's personal communications copilot for his professional work at Valvoline Global Operations (VGO).

Your primary responsibility is to help him write, edit, review, and improve executive communications while preserving his authentic voice.

## About Tyler
- Senior digital, customer experience, and technology leader at VGO.
- Communicates with executives, business stakeholders, technology teams, agency partners, vendors, and global colleagues.
- Values clarity, credibility, precision, and impact over corporate jargon.
- Should sound like an experienced executive operator — not a consultant, marketer, or AI assistant.

## Writing Principles
Always optimize for: Clarity. Brevity. Credibility. Business impact. Actionability.
- Every sentence should earn its place. Reduce unnecessary words.
- Do NOT sound overly enthusiastic, promotional, or sales-oriented.
- Do NOT sound academic (even though he holds a PhD), like a management consultant, or like AI-generated content.

## Preferred Tone
Professional but approachable. Executive but conversational. Confident but not arrogant. Direct but not blunt. Strategic but practical. Warm when appropriate. Human at all times.

## Words & Patterns to AVOID
Never use: "leverage", "synergy", "circle back", "best-in-class", "world-class", "game-changing", "revolutionary", "transformative" (unless truly warranted).
Avoid: excessive exclamation points, corporate clichés, marketing language, long introductions, repeating the same point multiple times.
Do NOT use em dashes unless specifically requested. Prefer simple punctuation.

## Email Preferences
Executive emails:
- Get to the point quickly. State the objective early.
- Short paragraphs. Clear asks. Recommendations when appropriate. End with next steps.

Difficult conversations: Be transparent and professional. Avoid defensiveness. Focus on facts and outcomes.

## Leadership Communication
When writing for leaders, focus on outcomes, business value, customer impact, organizational alignment, and risk/opportunity. Do not over-explain. Assume an intelligent audience.

## Meeting Summaries
Always use this structure (concise):
**Key Decisions** · **Key Takeaways** · **Risks / Concerns** · **Next Steps** · **Owners**

## Slide Writing
One idea per slide. Headlines should communicate insight (no title-only slides). Reduce text. Prioritize executive readability.

## Editing Rules
When editing his content: preserve his intent and voice. Remove unnecessary words. Improve flow and executive readability. Flag ambiguity. Suggest stronger alternatives when helpful. Never rewrite solely for the sake of rewriting.

## Output Format
Default response order:
1. **Recommended version** (the work, ready to use)
2. **Key improvements made** (3–6 short bullets — only meaningful changes)
3. **Optional stronger executive version** (only if it adds real value)

When confidence is high, provide a single recommendation. When confidence is low, provide alternatives.

Prioritize usefulness over creativity. The goal is not beautiful writing — the goal is effective communication.`;

const PRESETS: { id: string; label: string; icon: any; prompt: string }[] = [
  {
    id: "rewrite",
    label: "Rewrite in my voice",
    icon: Wand2,
    prompt: "Rewrite the following in my voice. Executive, clear, direct, no buzzwords, no em dashes. Then list the key improvements made.\n\n---\n\n",
  },
  {
    id: "email",
    label: "Polish executive email",
    icon: Mail,
    prompt: "Polish this email in my voice. Objective up front, short paragraphs, clear ask, next steps at the end. Return: Subject line + body, then a short list of key improvements made.\n\n---\n\n",
  },
  {
    id: "summary",
    label: "Meeting summary",
    icon: ScrollText,
    prompt: "Turn the following into a concise meeting summary using this structure: Key Decisions, Key Takeaways, Risks / Concerns, Next Steps, Owners.\n\n---\n\n",
  },
  {
    id: "tighten",
    label: "Tighten / shorten",
    icon: FileText,
    prompt: "Tighten this without losing meaning. Cut filler, strengthen verbs, preserve my intent and voice. Return only the revision.\n\n---\n\n",
  },
];

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
    title: "New conversation",
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
  const [editDialog, setEditDialog] = useState<{ open: boolean; original: string; sourceMessageId?: string; promptContext?: string }>({ open: false, original: "" });

  const active = useMemo(() => threads.find(t => t.id === activeId) ?? threads[0], [threads, activeId]);

  useEffect(() => { document.title = "Personal AI — CampusVoice"; }, []);
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

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
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
          // Explicitly omit profile/DNA — personal mode
          institutionalConfig: null,
          contentDNA: null,
          profileConfig: null,
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) throw new Error("Rate limit exceeded. Try again in a moment.");
        if (resp.status === 402) throw new Error("AI credits exhausted. Add credits to continue.");
        throw new Error(`Stream failed (${resp.status})`);
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
            if (delta) {
              acc += delta;
              setStreamText(acc);
            }
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
    toast({ title: "Copied to clipboard" });
  };

  const applyPreset = (prompt: string) => {
    setInput(prompt + (input ? input : ""));
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-6 max-w-[1600px]">
        <header className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-primary" />
              Personal AI Workbench
            </h1>
            <p className="text-sm text-muted-foreground">
              Your private, model-agnostic writing & thinking copilot. No profile, no DNA — just you and the model.
            </p>
          </div>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" /> Super Admin only · stored locally in this browser
          </Badge>
        </header>

        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-180px)]">
          {/* Sidebar — threads */}
          <aside className="col-span-12 lg:col-span-3 flex flex-col gap-3 min-h-0">
            <Button onClick={createThread} className="w-full gap-2">
              <Plus className="h-4 w-4" /> New conversation
            </Button>
            <Card className="flex-1 min-h-0">
              <CardHeader className="py-3">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="h-3 w-3" /> Conversations
                </CardTitle>
              </CardHeader>
              <Separator />
              <ScrollArea className="h-[calc(100%-56px)]">
                <div className="p-2 space-y-1">
                  {threads.sort((a,b) => b.updatedAt - a.updatedAt).map(t => (
                    <div
                      key={t.id}
                      className={`group flex items-center gap-2 rounded-md px-2 py-2 cursor-pointer text-sm transition ${
                        t.id === activeId ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                      }`}
                      onClick={() => setActiveId(t.id)}
                    >
                      <span className="flex-1 truncate">{t.title}</span>
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                        onClick={(e) => { e.stopPropagation(); deleteThread(t.id); }}
                        aria-label="Delete conversation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </aside>

          {/* Main chat */}
          <section className="col-span-12 lg:col-span-6 flex flex-col gap-3 min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="py-3 flex-row items-center justify-between gap-2 space-y-0">
                <div className="flex items-center gap-2 min-w-0">
                  <CardTitle className="text-sm truncate">{active?.title || "New conversation"}</CardTitle>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select value={active?.model} onValueChange={(v) => updateActive({ model: v })}>
                    <SelectTrigger className="h-8 w-[200px] text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MODELS.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          <div className="flex flex-col">
                            <span className="text-sm">{m.label}</span>
                            <span className="text-[10px] text-muted-foreground">{m.hint}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <Separator />

              <ScrollArea className="flex-1">
                <div ref={scrollRef} className="p-4 space-y-4">
                  {active?.messages.length === 0 && !streamText && (
                    <div className="text-center py-12">
                      <BrainCircuit className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Paste something to rewrite, summarize, or chat directly with the model.
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {PRESETS.map(p => (
                          <Button key={p.id} variant="outline" size="sm" onClick={() => applyPreset(p.prompt)} className="gap-1">
                            <p.icon className="h-3.5 w-3.5" /> {p.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {active?.messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`group relative max-w-[85%] rounded-lg px-4 py-3 text-sm ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}>
                        {m.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">{m.content}</div>
                        )}
                        <button
                          onClick={() => copyMsg(m.content)}
                          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-background border rounded-md p-1 shadow-sm transition"
                          aria-label="Copy"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {streamText && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-lg px-4 py-3 text-sm bg-muted">
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamText}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}

                  {streaming && !streamText && (
                    <div className="flex justify-start">
                      <div className="rounded-lg px-4 py-3 bg-muted flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <Separator />
              <div className="p-3 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map(p => (
                    <Button key={p.id} variant="ghost" size="sm" onClick={() => applyPreset(p.prompt)} className="h-7 text-xs gap-1">
                      <p.icon className="h-3 w-3" /> {p.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2 items-end">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Paste an email, a draft, a question, or ask the model anything… (⌘/Ctrl + Enter to send)"
                    className="min-h-[80px] resize-y"
                    disabled={streaming}
                  />
                  {streaming ? (
                    <Button onClick={stop} variant="destructive" className="h-10 gap-2">
                      <RefreshCw className="h-4 w-4" /> Stop
                    </Button>
                  ) : (
                    <Button onClick={() => handleSend()} disabled={!input.trim()} className="h-10 gap-2">
                      <Send className="h-4 w-4" /> Send
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </section>

          {/* Right rail — settings */}
          <aside className="col-span-12 lg:col-span-3 min-h-0">
            <Tabs defaultValue="voice" className="h-full flex flex-col">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="voice" className="text-xs gap-1"><Settings2 className="h-3 w-3" />Voice</TabsTrigger>
                <TabsTrigger value="tips" className="text-xs gap-1"><Sparkles className="h-3 w-3" />Tips</TabsTrigger>
              </TabsList>
              <TabsContent value="voice" className="flex-1 mt-2">
                <Card className="h-full flex flex-col">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">System prompt</CardTitle>
                    <CardDescription className="text-xs">
                      Tunes how the model writes. Saved with this conversation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-2 pt-0">
                    <Textarea
                      value={active?.systemPrompt ?? ""}
                      onChange={(e) => updateActive({ systemPrompt: e.target.value })}
                      className="flex-1 min-h-[300px] text-xs font-mono resize-none"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateActive({ systemPrompt: DEFAULT_SYSTEM_PROMPT })}
                      className="gap-1 text-xs"
                    >
                      <RefreshCw className="h-3 w-3" /> Reset to default voice
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tips" className="flex-1 mt-2">
                <Card className="h-full">
                  <CardContent className="pt-4 text-xs space-y-3 text-muted-foreground">
                    <div>
                      <div className="font-medium text-foreground mb-1">Keyboard</div>
                      ⌘/Ctrl + Enter to send. Click a preset to prefill the prompt.
                    </div>
                    <div>
                      <div className="font-medium text-foreground mb-1">Models</div>
                      Switch per-conversation. Gemini Pro for nuanced rewriting; Flash for speed; GPT-5 Mini when you want a second voice.
                    </div>
                    <div>
                      <div className="font-medium text-foreground mb-1">Privacy</div>
                      Conversations stay in this browser (localStorage). Nothing is saved to the database.
                    </div>
                    <div>
                      <div className="font-medium text-foreground mb-1">Custom voice</div>
                      Edit the system prompt on the Voice tab — useful for board memos, fundraising notes, or speaker drafts.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </aside>
        </div>
      </div>
    </div>
  );
}
