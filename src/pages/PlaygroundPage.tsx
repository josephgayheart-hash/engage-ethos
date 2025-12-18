import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIBadge } from "@/components/ui/ai-indicator";
import { useToast } from "@/hooks/use-toast";
import { useInstitutionalConfig } from "@/hooks/useInstitutionalConfig";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  MessageCircle, 
  Send,
  RefreshCw,
  Sparkles,
  User,
  Bot,
  Lightbulb,
  BookOpen,
  Target,
  Shield
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedPrompts = [
  {
    icon: Target,
    text: "How can I improve a re-enrollment message for at-risk students?",
    category: "Strategy"
  },
  {
    icon: Shield,
    text: "What are best practices for authority cues in academic communications?",
    category: "Research"
  },
  {
    icon: Lightbulb,
    text: "Review my financial aid reminder: 'Your FAFSA is due soon. Complete it now.'",
    category: "Evaluate"
  },
  {
    icon: BookOpen,
    text: "Explain how cognitive load affects message effectiveness",
    category: "Learn"
  }
];

const PlaygroundPage = () => {
  const { toast } = useToast();
  const { config: institutionalConfig } = useInstitutionalConfig();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to the UPlaybook Playground! 👋

I'm your AI assistant grounded in peer-reviewed persuasion research and the UPlaybook methodology. I can help you:

• **Brainstorm** messaging strategies for specific student populations
• **Review** draft messages and provide research-backed feedback
• **Explain** persuasion principles and how to apply them
• **Suggest** improvements based on the five-pillar framework

What would you like to explore today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('playground-chat', {
        body: {
          message: userMessage.content,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          institutionalConfig
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const handleClearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Welcome back! I'm ready to help you with messaging strategy, research questions, or content review. What would you like to explore?`,
      timestamp: new Date()
    }]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-4xl">
        {/* Breadcrumb & Header */}
        <div className="space-y-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Playground</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <MessageCircle className="w-7 h-7 text-pillar-susceptibility" />
                UPlaybook Playground
              </h1>
              <p className="text-muted-foreground mt-1">
                Chat with AI grounded in persuasion research and UPlaybook methodology
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleClearChat}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Chat
              </Button>
              <AIBadge />
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === 'user'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <div className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                      {message.content.split('\n').map((line, i) => {
                        // Handle bold text
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <p key={i} className={i > 0 ? "mt-2" : ""}>
                            {parts.map((part, j) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={j}>{part.slice(2, -2)}</strong>;
                              }
                              return part;
                            })}
                          </p>
                        );
                      })}
                    </div>
                    <span className="text-xs opacity-60 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggested Prompts - only show if few messages */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedPrompts.map((prompt, i) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSuggestedPrompt(prompt.text)}
                      className="text-left p-3 rounded-lg border bg-card hover:bg-muted/50 hover:border-primary/30 transition-colors group"
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <Badge variant="outline" className="text-xs mb-1">{prompt.category}</Badge>
                          <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                            {prompt.text}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input Area */}
          <CardContent className="border-t pt-4">
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about messaging strategy, review content, or explore persuasion research..."
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[60px] w-[60px] shrink-0"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Responses are grounded in UPlaybook's five-pillar framework and peer-reviewed research.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PlaygroundPage;
