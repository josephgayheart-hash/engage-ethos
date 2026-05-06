import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SEOHead } from "@/components/SEOHead";
import { ArrowRight, Sparkles, Send, Loader2, Lock, Wand2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SUGGESTED_PROMPTS = [
  "Write a welcome email to admitted students.",
  "Draft 3 Instagram captions for our move-in day.",
  "Plan a 4-week email series for accepted students who haven't deposited.",
  "Rewrite this in our voice: 'Apply now for fall.'",
];

const STORAGE_KEY = "try_copywriter_history_v1";

export default function TryCopywriterPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [institutionName, setInstitutionName] = useState("Southern Gateway University");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore history (sessionStorage so demo isn't sticky forever)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch { /* noop */ }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || loading) return;
    setError(null);
    setInput("");
    const nextHistory: ChatMessage[] = [...messages, { role: "user", content: message }];
    setMessages(nextHistory);
    setLoading(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("public-copywriter-demo", {
        body: {
          message,
          history: nextHistory.slice(0, -1),
        },
      });
      if (fnErr) throw fnErr;
      if (data?.error) throw new Error(data.error);
      if (data?.institutionName) setInstitutionName(data.institutionName);
      setMessages([...nextHistory, { role: "assistant", content: data?.reply || "" }]);
    } catch (e: any) {
      const msg = e?.message || "Something went wrong. Please try again.";
      setError(msg);
      setMessages(nextHistory); // keep user message, drop the failed assistant reply
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Try the AI Copywriter — Free, No Signup | CampusVoice.AI"
        description="Try our brand-aware AI Copywriter live. Drafts emails, social posts, and campaigns in a real institution's voice. No signup required."
        keywords={["AI copywriter demo", "brand voice AI", "free AI writing tool"]}
      />
      <LandingNav />

      {/* Header strip */}
      <section
        className="relative overflow-hidden border-b border-border/40"
        style={{ background: "linear-gradient(145deg, hsl(222 47% 16%) 0%, hsl(222 40% 22%) 100%)" }}
      >
        <div className="hidden sm:block absolute w-72 h-72 rounded-full blur-[80px]" style={{ background: "hsl(82 85% 55% / 0.15)", top: "-10%", right: "5%" }} />
        <div className="hidden sm:block absolute w-56 h-56 rounded-full blur-[70px]" style={{ background: "hsl(270 70% 60% / 0.18)", bottom: "-20%", left: "10%" }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <Badge
            variant="secondary"
            className="bg-[hsl(82_85%_55%_/_0.15)] text-[hsl(82_85%_70%)] border-[hsl(82_85%_55%_/_0.3)] mb-3"
          >
            <Sparkles className="w-3 h-3 mr-1.5" />
            Free demo · No signup
          </Badge>
          <h1 className="font-serif text-3xl sm:text-4xl text-white tracking-tight mb-3">
            Try the AI Copywriter live.
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl">
            You're chatting with our brand-aware AI using{" "}
            <span className="text-[hsl(82_85%_65%)] font-semibold">{institutionName}</span>'s
            Content DNA — a real, fictional sample brand. Ask it to write, expand, plan, or
            rewrite anything. It will sound like {institutionName}.
          </p>
        </div>
      </section>

      {/* Chat area */}
      <section className="flex-1 bg-background py-6 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1fr_280px] gap-6">
          {/* Conversation */}
          <div className="flex flex-col min-h-[520px]">
            <Card className="flex-1 flex flex-col overflow-hidden border-border/60">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-h-[60vh]">
                {messages.length === 0 && (
                  <div className="text-center py-10 space-y-5">
                    <div className="w-12 h-12 rounded-2xl mx-auto bg-[hsl(82_85%_55%_/_0.15)] flex items-center justify-center">
                      <Wand2 className="w-6 h-6 text-[hsl(82_85%_45%)]" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">
                        Ask me to write something for {institutionName}.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Try one of these to see the brand voice in action:
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                      {SUGGESTED_PROMPTS.map((p) => (
                        <button
                          key={p}
                          onClick={() => send(p)}
                          className="text-left text-sm px-3 py-2.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-[hsl(82_85%_55%_/_0.4)] transition-colors text-foreground"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col gap-1",
                      m.role === "user" ? "items-end" : "items-start",
                    )}
                  >
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      {m.role === "user" ? "You" : "AI Copywriter"}
                    </div>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        m.role === "user"
                          ? "bg-foreground text-background whitespace-pre-wrap"
                          : "bg-muted/50 text-foreground border border-border/40",
                      )}
                    >
                      {m.role === "user" ? (
                        m.content
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:mt-3 prose-headings:mb-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-strong:text-foreground prose-headings:text-foreground prose-a:text-[hsl(82_85%_45%)]">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Drafting in {institutionName}'s voice…
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm p-3">
                    {error}
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="border-t border-border/60 p-3 sm:p-4 bg-background">
                <div className="flex items-end gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Ask the AI Copywriter to draft something for ${institutionName}…`}
                    rows={2}
                    maxLength={2000}
                    disabled={loading}
                    className="resize-none text-sm"
                  />
                  <Button
                    onClick={() => send()}
                    disabled={loading || !input.trim()}
                    className="h-10 px-4 bg-gradient-to-r from-[hsl(82_85%_55%)] to-[hsl(82_85%_45%)] text-primary hover:from-[hsl(82_85%_50%)] hover:to-[hsl(82_85%_40%)] font-bold"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                  <span>Enter to send · Shift+Enter for newline</span>
                  {messages.length > 0 && (
                    <button
                      onClick={reset}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset chat
                    </button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar — context + upgrade nudge */}
          <aside className="space-y-4">
            <Card className="p-4 border-border/60">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[hsl(270_70%_60%_/_0.15)] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[hsl(270_70%_55%)]" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Active brand voice
                  </div>
                  <div className="font-semibold text-sm text-foreground">{institutionName}</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Authoritative, purposeful, and dignified. Uses metaphors like{" "}
                <span className="font-medium">"Gateway"</span> and{" "}
                <span className="font-medium">"Sentinel"</span>. Clear, direct sentences with high
                formality in institutional contexts.
              </p>
            </Card>

            <Card className="p-4 border-[hsl(82_85%_55%_/_0.4)] bg-gradient-to-br from-background to-[hsl(82_85%_55%_/_0.04)]">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-[hsl(82_85%_45%)]" />
                <div className="font-semibold text-sm text-foreground">Use your own voice</div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Sign up to plug in your institution's brand. Upload samples or scrape your site —
                we extract your Content DNA in minutes.
              </p>
              <Button
                asChild
                size="sm"
                className="w-full bg-gradient-to-r from-[hsl(82_85%_55%)] to-[hsl(82_85%_45%)] text-primary hover:from-[hsl(82_85%_50%)] hover:to-[hsl(82_85%_40%)] font-bold"
              >
                <Link to="/request-access">
                  Get Early Access
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </Card>

            <p className="text-[11px] text-muted-foreground text-center px-2">
              Demo limited to 10 messages per 5 minutes. Conversations are not saved.
            </p>
          </aside>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
