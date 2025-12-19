import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageCircle, Plus, Trash2 } from 'lucide-react';
import type { PlaygroundConversation } from '@/hooks/usePlaygroundConversations';

interface ConversationListProps {
  conversations: PlaygroundConversation[];
  currentConversation: PlaygroundConversation | null;
  onSelect: (conversation: PlaygroundConversation) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  currentConversation,
  onSelect,
  onNew,
  onDelete,
  isLoading
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full border-r bg-muted/30">
      <div className="p-3 border-b">
        <Button onClick={onNew} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Conversation
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group relative rounded-lg transition-colors",
                  currentConversation?.id === conv.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted"
                )}
              >
                <button
                  onClick={() => onSelect(conv)}
                  className="w-full text-left px-3 py-2"
                >
                  <div className="flex items-start gap-2">
                    <MessageCircle className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {conv.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
