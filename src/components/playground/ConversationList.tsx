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
  onCollapse?: () => void;
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
    <div className="flex flex-col h-full">
      {/* New chat button */}
      <div className="p-3">
        <Button onClick={onNew} variant="outline" className="w-full justify-start gap-2 h-9 text-sm rounded-lg border-dashed" size="sm">
          <Plus className="w-4 h-4" />
          New chat
        </Button>
      </div>
      
      {/* Conversation list */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 pb-2">
          {isLoading ? (
            <div className="px-3 py-8 text-xs text-muted-foreground text-center">
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-3 py-8 text-xs text-muted-foreground text-center">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group relative rounded-lg transition-colors cursor-pointer",
                  currentConversation?.id === conv.id
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                )}
              >
                <button
                  onClick={() => onSelect(conv)}
                  className="w-full text-left px-3 py-2.5"
                >
                  <p className="text-sm truncate pr-6" title={conv.title}>
                    {conv.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                  </p>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
