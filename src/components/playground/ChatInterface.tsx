import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Send, 
  RefreshCw, 
  Bot, 
  User, 
  Lightbulb, 
  BookOpen, 
  Target, 
  Shield,
  Sparkles
} from 'lucide-react';
import type { PlaygroundMessage } from '@/hooks/usePlaygroundConversations';
import { MessageActions } from './MessageActions';
import { ModelSelector, type AIModel } from './ModelSelector';

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
}

const suggestedPrompts = [
  {
    icon: Target,
    text: "Help me draft a re-enrollment message for at-risk students",
    category: "Create"
  },
  {
    icon: Shield,
    text: "Review this message and suggest improvements based on our voice guidelines",
    category: "Review"
  },
  {
    icon: Lightbulb,
    text: "What messaging strategies work best for financial aid communications?",
    category: "Strategy"
  },
  {
    icon: BookOpen,
    text: "How can I apply social proof effectively without it backfiring?",
    category: "Research"
  }
];

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
  selectedModel,
  onModelChange
}: ChatInterfaceProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

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

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Context indicator */}
      <div className="px-4 py-2 border-b bg-muted/30 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {hasContext && (
            <>
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Context:</span>
              {profileName && (
                <Badge variant="secondary" className="text-xs">{profileName}</Badge>
              )}
              {hasDNA && (
                <Badge variant="outline" className="text-xs">Content DNA Active</Badge>
              )}
            </>
          )}
        </div>
        <ModelSelector 
          value={selectedModel} 
          onChange={onModelChange} 
          disabled={isLoading}
        />
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 && !streamingContent ? (
          <div className="space-y-6">
            <div className="text-center py-8">
              <Bot className="w-12 h-12 mx-auto text-primary/60 mb-4" />
              <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                I'm your copywriting assistant, informed by your institutional voice and Content DNA. 
                I can help you create, review, and strategize communications.
              </p>
            </div>
            
            {/* Suggested prompts */}
            <div className="max-w-xl mx-auto px-2">
              <p className="text-xs text-muted-foreground mb-2 text-center">Try asking:</p>
              <div className="grid grid-cols-1 gap-2">
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
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="text-xs mb-1">{prompt.category}</Badge>
                          <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                            {prompt.text}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 group",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className="flex flex-col max-w-[80%]">
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3",
                      message.role === 'user'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <div className={cn(
                      "text-sm prose prose-sm max-w-none",
                      message.role === 'assistant' ? "dark:prose-invert" : "prose-invert",
                      message.role === 'assistant' && "[&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-medium [&_code]:bg-background/20 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-background/20 [&_pre]:p-2 [&_pre]:rounded-lg [&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-3 [&_blockquote]:italic"
                    )}>
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    <span className="text-xs opacity-60 mt-1 block">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {message.role === 'assistant' && (
                    <MessageActions content={message.content} messageId={message.id} />
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Streaming response */}
            {streamingContent && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="max-w-[80%] bg-muted rounded-2xl px-4 py-3">
                  <div className="text-sm prose prose-sm dark:prose-invert max-w-none [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1">
                    <ReactMarkdown>{streamingContent}</ReactMarkdown>
                    <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-1" />
                  </div>
                </div>
              </div>
            )}
            
            {/* Loading indicator when sending but not yet streaming */}
            {isLoading && !streamingContent && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-3 sm:p-4">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about creating, reviewing, or strategizing..."
            className="min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] resize-none text-sm"
            disabled={isLoading}
          />
          <Button 
            onClick={onSend} 
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] shrink-0"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center hidden sm:block">
          Responses are shaped by your institutional voice and Content DNA settings.
        </p>
      </div>
    </div>
  );
}
