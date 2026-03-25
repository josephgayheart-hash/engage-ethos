import { format } from "date-fns";
import { Calendar, Trash2, Send, Clock, CheckCircle, AlertCircle, FileEdit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SocialPost } from "@/hooks/useSocialPosts";

const statusConfig: Record<string, { label: string; icon: typeof Clock; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", icon: FileEdit, variant: "secondary" },
  scheduled: { label: "Scheduled", icon: Clock, variant: "outline" },
  published: { label: "Published", icon: CheckCircle, variant: "default" },
  failed: { label: "Failed", icon: AlertCircle, variant: "destructive" },
};

const platformLabels: Record<string, string> = {
  twitter: "X",
  x: "X",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
};

interface Props {
  posts: SocialPost[];
  selectedId?: string;
  onSelect: (post: SocialPost) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  isPublishing: boolean;
}

export function PostQueueList({ posts, selectedId, onSelect, onDelete, onPublish, isPublishing }: Props) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <Calendar className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-sm">No posts yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-14rem)]">
      <div className="space-y-2 pr-2">
        {posts.map((post) => {
          const sc = statusConfig[post.status] ?? statusConfig.draft;
          const Icon = sc.icon;
          const isSelected = post.id === selectedId;
          return (
            <Card
              key={post.id}
              className={`cursor-pointer transition-colors hover:border-primary/40 ${isSelected ? "border-primary ring-1 ring-primary/20" : ""}`}
              onClick={() => onSelect(post)}
            >
              <CardContent className="p-3 space-y-2">
                {post.image_url && (
                  <img src={post.image_url} alt="" className="w-full h-20 object-cover rounded" />
                )}
                <p className="text-xs line-clamp-2">{post.caption || "No caption"}</p>
                <div className="flex items-center gap-1 flex-wrap">
                  {post.platform.map((p) => (
                    <Badge key={p} variant="outline" className="text-[10px] px-1.5 py-0">
                      {platformLabels[p] ?? p}
                    </Badge>
                  ))}
                  <Badge variant={sc.variant} className="text-[10px] px-1.5 py-0 ml-auto gap-0.5">
                    <Icon className="h-2.5 w-2.5" />
                    {sc.label}
                  </Badge>
                </div>
                {post.scheduled_at && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {format(new Date(post.scheduled_at), "MMM d, h:mm a")}
                  </p>
                )}
                {post.publish_error && (
                  <p className="text-[10px] text-destructive line-clamp-1">{post.publish_error}</p>
                )}
                <div className="flex gap-1 pt-1">
                  {post.status !== "published" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px] px-2"
                      disabled={isPublishing || post.platform.length === 0}
                      onClick={(e) => { e.stopPropagation(); onPublish(post.id); }}
                    >
                      <Send className="h-3 w-3 mr-1" /> Publish
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] px-2 text-destructive hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
