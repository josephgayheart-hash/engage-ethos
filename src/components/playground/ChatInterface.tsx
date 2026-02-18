import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Send, 
  RefreshCw, 
  Sparkles, 
  Target, 
  Lightbulb, 
  BookOpen, 
  Shield,
  ArrowUp
} from 'lucide-react';
import type { PlaygroundMessage } from '@/hooks/usePlaygroundConversations';
import { MessageActions } from './MessageActions';
import type { AIModel } from './ModelSelector';

interface ChatInterfaceProps {
  messages: PlaygroundMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  isLoadingMessages: boolean;
  hasContext: boolean;
  profileName?: string;
  hasDNA?: boolean;
  streamingContent?: string;
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  campusPhotoCount?: number;
}

const suggestedPrompts = [
  {
    icon: Target,
    text: "Draft a re-enrollment message for at-risk students",
  },
  {
    icon: Shield,
    text: "Review this message against our voice guidelines",
  },
  {
    icon: Lightbulb,
    text: "Best strategies for financial aid communications?",
  },
  {
    icon: BookOpen,
    text: "How to use social proof effectively?",
  }
];

const proseClasses = [
  "[&_p]:my-2.5 [&_p]:leading-relaxed",
  "[&_ul]:my-2.5 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1",
  "[&_ul_ul]:mt-1 [&_ul_ul]:list-[circle]",
  "[&_ol]:my-2.5 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1",
  "[&_ol_ol]:mt-1 [&_ol_ol]:list-[lower-alpha]",
  "[&_li]:leading-relaxed [&_li]:pl-0.5",
  "[&_li_p]:my-0.5",
  "[&_strong]:font-semibold [&_strong]:text-foreground",
  "[&_h1]:text-lg [&_h1]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2",
  "[&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1.5",
  "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1",
  "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono",
  "[&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:my-3 [&_pre]:overflow-x-auto",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-3 [&_blockquote]:text-muted-foreground"
].join(' ');

export function ChatInterface({
  messages,
  input,
  onInputChange,
  onSend,
  isLoading,
  isLoadingMessages,
  hasContext,
  profileName,
  hasDNA,
  streamingContent,
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    onInputChange(prompt);
    textareaRef.current?.focus();
  };

  const isEmpty = messages.length === 0 && !streamingContent;

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
      >
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : isEmpty ? (
          /* Empty state — centered greeting */
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="max-w-lg w-full text-center space-y-6">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  {profileName ? `Writing for ${profileName}` : "How can I help you today?"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {hasDNA 
                    ? "Your Content DNA is active — I'll write in your institutional voice."
                    : "I can help create, review, and strategize your communications."
                  }
                </p>
              </div>
              
              {/* Suggestion chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedPrompts.map((prompt, i) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSuggestedPrompt(prompt.text)}
                      className="text-left px-4 py-3 rounded-xl border border-border/60 bg-background 
                                 hover:border-primary/30 hover:bg-muted/50 transition-all duration-150
                                 group cursor-pointer"
                    >
                      <div className="flex items-start gap-2.5">
                        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary mt-0.5 shrink-0 transition-colors" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-snug">
                          {prompt.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="group">
                {message.role === 'user' ? (
                  /* User message — right-aligned bubble */
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  /* Assistant message — clean left-aligned text */
                  <div className="space-y-1">
                    <div className={cn(
                      "text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none",
                      proseClasses
                    )}>
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    <MessageActions content={message.content} messageId={message.id} />
                  </div>
                )}
              </div>
            ))}
            
            {/* Streaming response */}
            {streamingContent && (
              <div className="space-y-1">
                <div className={cn(
                  "text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none",
                  proseClasses
                )}>
                  <ReactMarkdown>{streamingContent}</ReactMarkdown>
                  <span className="inline-block w-1.5 h-4 bg-primary/60 rounded-sm animate-pulse ml-0.5 align-middle" />
                </div>
              </div>
            )}
            
            {/* Typing indicator */}
            {isLoading && !streamingContent && (
              <div className="flex items-center gap-1.5 py-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area — floating at bottom */}
      <div className="p-3 sm:p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end bg-muted/50 border border-border/60 rounded-2xl 
                          focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 
                          transition-all duration-150 shadow-sm">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={profileName ? `Message Copywriter about ${profileName}...` : "Message Copywriter..."}
              className="flex-1 bg-transparent border-0 resize-none px-4 py-3 text-sm 
                         placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0
                         min-h-[44px] max-h-[200px]"
              disabled={isLoading}
              rows={1}
            />
            <div className="p-1.5 pr-2">
              <Button 
                onClick={onSend} 
                disabled={!input.trim() || isLoading}
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-xl shrink-0 transition-all",
                  input.trim() 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "bg-muted-foreground/20 text-muted-foreground"
                )}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/50 mt-1.5 text-center hidden sm:block">
            {hasContext 
              ? "Responses shaped by your institutional voice & Content DNA" 
              : "Select a profile above for voice-matched responses"
            }
          </p>
        </div>
      </div>
    </div>
  );
}
