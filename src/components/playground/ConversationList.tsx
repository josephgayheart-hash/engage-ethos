import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';
import type { PlaygroundConversation } from '@/hooks/usePlaygroundConversations';

interface ConversationListProps {
  conversations: PlaygroundConversation[];
  currentConversation: PlaygroundConversation | null;
  onSelect: (conversation: PlaygroundConversation) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onDeleteAll?: () => void;
  onCollapse?: () => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  currentConversation,
  onSelect,
  onNew,
  onDelete,
  onDeleteAll,
  isLoading
}: ConversationListProps) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showClearAll, setShowClearAll] = useState(false);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
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
                  "grid grid-cols-[1fr,auto] items-center rounded-lg transition-colors cursor-pointer",
                  currentConversation?.id === conv.id
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                )}
              >
                <button
                  onClick={() => onSelect(conv)}
                  className="text-left px-3 py-2.5 overflow-hidden"
                >
                  <p className="text-sm truncate" title={conv.title}>
                    {conv.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                  </p>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 mr-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(conv.id);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Clear all button */}
      {conversations.length > 0 && onDeleteAll && (
        <div className="p-3 border-t border-border/40">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => setShowClearAll(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear all chats
          </Button>
        </div>
      )}

      {/* Delete single confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) onDelete(deleteTarget);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear all confirmation */}
      <AlertDialog open={showClearAll} onOpenChange={setShowClearAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all chats?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} and their messages. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onDeleteAll?.();
                setShowClearAll(false);
              }}
            >
              Clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
