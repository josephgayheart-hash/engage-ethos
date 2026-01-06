import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserDrafts, UserDraft } from "@/hooks/useUserDrafts";
import { formatDistanceToNow } from "date-fns";
import { 
  FileEdit, 
  PenTool, 
  Map, 
  Trash2, 
  ArrowRight,
  Clock
} from "lucide-react";

export function MyDraftsCard() {
  const { drafts, loading, deleteDraft } = useUserDrafts();

  const messageDrafts = drafts.filter(d => d.draft_type === 'message');
  const journeyDrafts = drafts.filter(d => d.draft_type === 'journey');

  const handleDelete = async (e: React.MouseEvent, draftId: string) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteDraft(draftId);
  };

  const getDraftLink = (draft: UserDraft) => {
    return draft.draft_type === 'message' ? '/build' : '/strategy';
  };

  const getDraftIcon = (type: string) => {
    return type === 'message' ? PenTool : Map;
  };

  if (loading) {
    return (
      <Card className="card-interactive">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileEdit className="w-5 h-5 text-primary" />
            My Drafts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (drafts.length === 0) {
    return (
      <Card className="card-interactive">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileEdit className="w-5 h-5 text-muted-foreground" />
            My Drafts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No drafts yet. Start building a message or journey and it will auto-save here.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" asChild>
              <Link to="/build">
                <PenTool className="w-4 h-4 mr-1" />
                Message
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/strategy">
                <Map className="w-4 h-4 mr-1" />
                Journey
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-interactive relative overflow-hidden">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 to-pillar-consensus/60" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileEdit className="w-5 h-5 text-primary" />
            My Drafts
          </CardTitle>
          <div className="flex gap-1.5">
            {messageDrafts.length > 0 && (
              <Badge variant="secondary" className="text-xs bg-pillar-cognitive/10 text-pillar-cognitive">
                <PenTool className="w-3 h-3 mr-1" />
                {messageDrafts.length}
              </Badge>
            )}
            {journeyDrafts.length > 0 && (
              <Badge variant="secondary" className="text-xs bg-pillar-consensus/10 text-pillar-consensus">
                <Map className="w-3 h-3 mr-1" />
                {journeyDrafts.length}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {drafts.slice(0, 4).map((draft) => {
          const Icon = getDraftIcon(draft.draft_type);
          const draftData = draft.draft_data as Record<string, unknown>;
          const contextInfo = draftData?.context as Record<string, unknown> | undefined;
          
          return (
            <Link 
              key={draft.id} 
              to={getDraftLink(draft)}
              state={{ resumeDraftId: draft.id }}
              className="block"
            >
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-accent/30 transition-all group">
                <div className={`icon-container icon-container-sm shrink-0 ${
                  draft.draft_type === 'message' 
                    ? 'bg-pillar-cognitive/10' 
                    : 'bg-pillar-consensus/10'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    draft.draft_type === 'message' 
                      ? 'text-pillar-cognitive' 
                      : 'text-pillar-consensus'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {draft.title || `Untitled ${draft.draft_type}`}
                    </span>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {draft.draft_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(draft.updated_at), { addSuffix: true })}
                    {contextInfo?.audience && (
                      <>
                        <span>•</span>
                        <span className="truncate">{String(contextInfo.audience)}</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => handleDelete(e, draft.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            </Link>
          );
        })}
        
        {drafts.length > 4 && (
          <div className="text-center pt-2">
            <Badge variant="outline" className="text-xs">
              +{drafts.length - 4} more drafts
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact badge for header/nav
export function DraftCountBadge() {
  const { drafts } = useUserDrafts();
  
  if (drafts.length === 0) return null;
  
  return (
    <Badge 
      variant="secondary" 
      className="h-5 min-w-5 px-1.5 text-xs bg-primary/10 text-primary"
    >
      {drafts.length}
    </Badge>
  );
}
