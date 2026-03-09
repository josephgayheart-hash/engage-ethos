import { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, CheckCircle2, Dna, MessageSquare, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useShouldLoop() {
  const [shouldLoop, setShouldLoop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)');
    const update = () => setShouldLoop(!mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return shouldLoop;
}

function BrowserChrome({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl shadow-2xl border border-border/60 overflow-hidden">
      <div className="px-5 py-3 flex items-center gap-3" style={{ background: 'hsl(222, 47%, 14%)' }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-amber-400/80" />
          <div className="w-3 h-3 rounded-full bg-green-400/80" />
        </div>
        <span className="text-white/50 text-xs ml-2">{title}</span>
      </div>
      {children}
    </div>
  );
}

const messages = [
  {
    type: 'user' as const,
    text: 'Write a welcome email for admitted students that highlights our research opportunities',
  },
  {
    type: 'ai' as const,
    subject: 'Your Research Journey Starts Now',
    body: 'Congratulations on your admission! As you begin this next chapter, we want you to know that undergraduate research isn\'t just an opportunity here — it\'s a tradition. From day one, you\'ll have access to faculty mentors, state-of-the-art labs, and funded research positions…',
  },
  {
    type: 'user' as const,
    text: 'Now make it warmer and add a student success story',
  },
  {
    type: 'ai' as const,
    subject: 'Something Incredible Is Waiting for You',
    body: 'Welcome to your next chapter! We can\'t wait to see what you discover. Take Maya — she arrived as a first-year biology major and within a semester was co-authoring research on marine ecosystems. Your path might look different, but the support will be the same…',
  },
];

export default function AICopywriterShowcaseDemo() {
  const { ref, visible } = useInView(0.1);
  const [step, setStep] = useState(0);
  const shouldLoop = useShouldLoop();

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timers.push(setTimeout(() => setStep(1), 800));    // User msg 1
      timers.push(setTimeout(() => setStep(2), 2000));   // Typing indicator
      timers.push(setTimeout(() => setStep(3), 3600));   // AI response 1
      timers.push(setTimeout(() => setStep(4), 5800));   // User msg 2
      timers.push(setTimeout(() => setStep(5), 7000));   // Typing indicator 2
      timers.push(setTimeout(() => setStep(6), 8600));   // AI response 2
      timers.push(setTimeout(() => setStep(7), 10500));  // Brand score
      if (shouldLoop) timers.push(setTimeout(() => { setStep(0); run(); }, 13500));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [visible, shouldLoop]);

  const renderTypingIndicator = () => (
    <div className="flex items-start gap-2 transition-all duration-300">
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-teal-500/15">
        <Bot className="w-3.5 h-3.5 text-teal-500" />
      </div>
      <div className="flex gap-1 pt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );

  return (
    <div ref={ref} className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <BrowserChrome title="CampusVoice — AI Copywriter">
        {/* Header bar */}
        <div className="border-b px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-teal-500" />
            <span className="font-semibold text-xs text-foreground">AI Copywriter</span>
            <Badge variant="outline" className="text-[9px] h-5">Lakewood State · Admissions</Badge>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[9px] text-muted-foreground">Content DNA Active</span>
          </div>
        </div>

        {/* Chat area */}
        <div className="p-5 space-y-4" style={{ minHeight: '360px' }}>
          {/* Message 1: User */}
          {step >= 1 && (
            <div className="flex justify-end transition-all duration-500" style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? 'translateY(0)' : 'translateY(8px)' }}>
              <div className="rounded-2xl rounded-br-md px-4 py-2.5 max-w-[75%] text-xs bg-teal-600 text-white">
                {messages[0].text}
              </div>
            </div>
          )}

          {/* Typing 1 */}
          {step === 2 && renderTypingIndicator()}

          {/* AI Response 1 */}
          {step >= 3 && (
            <div className="flex items-start gap-2 transition-all duration-500" style={{ opacity: step >= 3 ? 1 : 0 }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-teal-500/15">
                <Bot className="w-3.5 h-3.5 text-teal-500" />
              </div>
              <div className="flex-1 text-xs text-foreground leading-relaxed">
                <p className="font-semibold mb-1">Subject: {(messages[1] as any).subject}</p>
                <p className="text-muted-foreground">{(messages[1] as any).body}</p>
              </div>
            </div>
          )}

          {/* Message 2: User */}
          {step >= 4 && (
            <div className="flex justify-end transition-all duration-500" style={{ opacity: step >= 4 ? 1 : 0, transform: step >= 4 ? 'translateY(0)' : 'translateY(8px)' }}>
              <div className="rounded-2xl rounded-br-md px-4 py-2.5 max-w-[75%] text-xs bg-teal-600 text-white">
                {messages[2].text}
              </div>
            </div>
          )}

          {/* Typing 2 */}
          {step === 5 && renderTypingIndicator()}

          {/* AI Response 2 */}
          {step >= 6 && (
            <div className="flex items-start gap-2 transition-all duration-500" style={{ opacity: step >= 6 ? 1 : 0 }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-teal-500/15">
                <Bot className="w-3.5 h-3.5 text-teal-500" />
              </div>
              <div className="flex-1 text-xs text-foreground leading-relaxed">
                <p className="font-semibold mb-1">Subject: {(messages[3] as any).subject}</p>
                <p className="text-muted-foreground">{(messages[3] as any).body}</p>
                {step >= 7 && (
                  <div className="mt-3 flex items-center gap-2 transition-all duration-500">
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> On-brand
                    </span>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-500">
                      Brand Score: 96
                    </span>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 flex items-center gap-1">
                      <Dna className="w-3 h-3" /> Story Bank used
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="border-t px-4 py-3 bg-background">
          <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-4 py-2.5">
            <span className="text-sm text-muted-foreground flex-1">Ask me to write anything…</span>
            <Sparkles className="w-4 h-4 text-teal-500" />
          </div>
        </div>
      </BrowserChrome>
    </div>
  );
}
