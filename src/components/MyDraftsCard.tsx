import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserDrafts, UserDraft } from "@/hooks/useUserDrafts";
import { useAuth } from "@/contexts/AuthContext";
import { format, formatDistanceToNow } from "date-fns";
import { 
  FileEdit, 
  PenTool, 
  Map, 
  Trash2, 
  ArrowRight,
  Clock,
  User,
  Calendar,
  Mail,
  MessageSquare,
  Share2,
  Layout,
  FileText,
  Phone,
  Search,
  Users,
  Megaphone,
  Newspaper,
  Heart,
  ChevronDown,
  LayoutGrid,
  List,
  ImageIcon,
} from "lucide-react";
import type { Channel } from "@/types/campusvoice";

const channelLabels: Record<string, string> = {
  'email': 'Email',
  'sms': 'SMS',
  'social-media': 'Social',
  'portal': 'Portal',
  'landing-page': 'Landing Page',
  'direct-mail': 'Direct Mail',
  'phone-call': 'Phone',
  'digital-ad-search': 'Search Ads',
  'digital-ad-social': 'Social Ads',
  'talking-points': 'Talking Points',
  'news-article': 'News',
  'case-for-care': 'Case for Support',
};

const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'email': Mail,
  'sms': MessageSquare,
  'social-media': Share2,
  'portal': Layout,
  'landing-page': FileText,
  'direct-mail': FileText,
  'phone-call': Phone,
  'digital-ad-search': Search,
  'digital-ad-social': Users,
  'talking-points': Megaphone,
  'news-article': Newspaper,
  'case-for-care': Heart,
};

export function MyDraftsCard() {
  const { drafts, loading, deleteDraft } = useUserDrafts();
  const { profile } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [compact, setCompact] = useState(() => {
    try { return localStorage.getItem('campusvoice_drafts_compact') === 'true'; } catch { return false; }
  });

  const toggleCompact = () => {
    const next = !compact;
    setCompact(next);
    try { localStorage.setItem('campusvoice_drafts_compact', String(next)); } catch {}
  };

  const messageDrafts = drafts.filter(d => d.draft_type === 'message');
  const journeyDrafts = drafts.filter(d => d.draft_type === 'journey');
  const analysisDrafts = drafts.filter(d => d.draft_type === 'analysis');
  const imageDrafts = drafts.filter(d => d.draft_type === 'image');
  
  const INITIAL_DISPLAY_COUNT = 5;
  const displayedDrafts = showAll ? drafts : drafts.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = drafts.length > INITIAL_DISPLAY_COUNT;

  const handleDelete = async (e: React.MouseEvent, draftId: string) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteDraft(draftId);
  };

  const getDraftLink = (draft: UserDraft) => {
    if (draft.draft_type === 'message') return '/build';
    if (draft.draft_type === 'journey') return '/strategy';
    if (draft.draft_type === 'analysis') return '/web-analyzer';
    if (draft.draft_type === 'image') return '/image-generator';
    return '/build';
  };

  const getDraftIcon = (type: string) => {
    if (type === 'message') return PenTool;
    if (type === 'journey') return Map;
    if (type === 'analysis') return Search;
    if (type === 'image') return ImageIcon;
    return PenTool;
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
            No drafts yet. Start building a message, journey, or image and it will auto-save here.
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
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
            <Button variant="outline" size="sm" asChild>
              <Link to="/image-generator">
                <ImageIcon className="w-4 h-4 mr-1" />
                Image
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
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileEdit className="w-5 h-5 text-primary" />
              My Drafts
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Pick up where you left off</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {messageDrafts.length > 0 && (
                <Badge variant="secondary" className="text-xs bg-accent/10 text-accent">
                  <PenTool className="w-3 h-3 mr-1" />
                  {messageDrafts.length}
                </Badge>
              )}
              {journeyDrafts.length > 0 && (
                <Badge variant="secondary" className="text-xs bg-secondary/10 text-secondary-foreground">
                  <Map className="w-3 h-3 mr-1" />
                  {journeyDrafts.length}
                </Badge>
              )}
              {analysisDrafts.length > 0 && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  <Search className="w-3 h-3 mr-1" />
                  {analysisDrafts.length}
                </Badge>
              )}
              {imageDrafts.length > 0 && (
                <Badge variant="secondary" className="text-xs bg-violet-500/10 text-violet-600">
                  <ImageIcon className="w-3 h-3 mr-1" />
                  {imageDrafts.length}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCompact}
              className="text-xs text-muted-foreground hover:text-foreground gap-1 h-7"
            >
              {compact ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
              {compact ? "Detailed" : "Compact"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {compact ? (
          /* Compact view: dense single-line rows */
          <div className="space-y-0.5">
            {displayedDrafts.map((draft) => {
              const Icon = getDraftIcon(draft.draft_type);
              return (
                <Link
                  key={draft.id}
                  to={getDraftLink(draft)}
                  state={{ resumeDraftId: draft.id }}
                  className="block"
                >
                  <div className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-muted/50 transition-colors group">
                    <Icon className={cn("w-3.5 h-3.5 shrink-0",
                      draft.draft_type === 'message' ? 'text-accent' :
                      draft.draft_type === 'journey' ? 'text-secondary' : 'text-primary'
                    )} />
                    <span className="text-sm truncate flex-1">
                      {draft.title || `Untitled ${draft.draft_type}`}
                    </span>
                    <Badge variant="outline" className="text-[10px] shrink-0">{draft.draft_type}</Badge>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(draft.updated_at), { addSuffix: true })}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => handleDelete(e, draft.id)}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Detailed view: existing rich cards */
          <div className="space-y-2">
        {displayedDrafts.map((draft) => {
          const Icon = getDraftIcon(draft.draft_type);
          const draftData = draft.draft_data as Record<string, unknown>;
          const contextInfo = draftData?.context as Record<string, unknown> | undefined;
          const selectedChannels = (draftData?.selectedChannels as Channel[]) || [];
          const selectedMode = draftData?.mode as string | undefined;
          const selectedProfileName = draftData?.profileName as string | undefined;
          const selectedMoment = contextInfo?.moment as string | undefined;
          const selectedAudience = contextInfo?.audience as string | undefined;
          const selectedGoal = contextInfo?.goal as string | undefined;
          
          // Analysis-specific metadata
          const analysisStatus = draftData?.status as string | undefined;
          const analysisSourceUrl = draftData?.sourceUrl as string | undefined;
          const analysisScore = (draftData?.analysisResult as Record<string, unknown>)?.overallScore as number | undefined;
          
          // Extract hostname from source URL for analysis drafts
          let analysisHostname: string | undefined;
          if (draft.draft_type === 'analysis' && analysisSourceUrl) {
            try {
              analysisHostname = new URL(analysisSourceUrl).hostname;
            } catch {
              analysisHostname = analysisSourceUrl.substring(0, 30);
            }
          }
          
          return (
            <Link 
              key={draft.id} 
              to={getDraftLink(draft)}
              state={{ resumeDraftId: draft.id }}
              className="block"
            >
              <div className="p-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/30 transition-all group overflow-hidden">
                {/* Top row: Icon + optional thumbnail, Title, Type badge, Delete button */}
                <div className="flex items-start gap-2.5">
                  <div className={`icon-container icon-container-sm shrink-0 mt-0.5 ${
                    draft.draft_type === 'message' 
                      ? 'bg-pillar-cognitive/10' 
                      : draft.draft_type === 'journey'
                      ? 'bg-pillar-consensus/10'
                      : draft.draft_type === 'image'
                      ? 'bg-violet-500/10'
                      : 'bg-cyan-500/10'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      draft.draft_type === 'message' 
                        ? 'text-pillar-cognitive' 
                        : draft.draft_type === 'journey'
                        ? 'text-pillar-consensus'
                        : draft.draft_type === 'image'
                        ? 'text-violet-600'
                        : 'text-cyan-600'
                    }`} />
                  </div>
                  {draft.cover_image_url && (
                    <div className="w-9 h-9 rounded-md overflow-hidden bg-muted shrink-0 mt-0.5">
                      <img
                        src={draft.cover_image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-sm truncate">
                          {draft.title || `Untitled ${draft.draft_type}`}
                        </span>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {draft.draft_type}
                        </Badge>
                        {/* Analysis status badge */}
                        {draft.draft_type === 'analysis' && analysisStatus && (
                          <Badge 
                            variant="secondary" 
                            className={`text-[10px] shrink-0 ${
                              analysisStatus === 'complete' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : analysisStatus === 'failed'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : analysisStatus === 'analyzing'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {analysisStatus === 'complete' ? 'Done' : 
                             analysisStatus === 'failed' ? 'Failed' :
                             analysisStatus === 'analyzing' ? 'In Progress' : 'Draft'}
                          </Badge>
                        )}
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
                    
                    {/* Channel badges for message drafts */}
                    {draft.draft_type === 'message' && selectedChannels.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        {selectedChannels.slice(0, 3).map((channel) => {
                          const ChannelIcon = channelIcons[channel] || FileText;
                          return (
                            <Badge 
                              key={channel} 
                              variant="secondary" 
                              className="text-[10px] px-1.5 py-0 h-5 bg-primary/5 text-primary/80"
                            >
                              <ChannelIcon className="w-3 h-3 mr-1" />
                              {channelLabels[channel] || channel}
                            </Badge>
                          );
                        })}
                        {selectedChannels.length > 3 && (
                          <Badge 
                            variant="secondary" 
                            className="text-[10px] px-1.5 py-0 h-5 bg-muted text-muted-foreground"
                          >
                            +{selectedChannels.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Analysis-specific metadata */}
                    {draft.draft_type === 'analysis' && (analysisHostname || typeof analysisScore === 'number') && (
                      <div className="flex items-center gap-2 mt-1.5 text-xs">
                        {analysisHostname && (
                          <span className="text-muted-foreground truncate max-w-[150px]">
                            {analysisHostname}
                          </span>
                        )}
                        {typeof analysisScore === 'number' && (
                          <Badge 
                            variant="secondary" 
                            className={`text-[10px] px-1.5 py-0 h-5 ${
                              analysisScore >= 70 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : analysisScore >= 40
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            Score: {analysisScore}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Image draft metadata */}
                    {draft.draft_type === 'image' && (
                      <div className="mt-1.5 space-y-1">
                        {(draftData?.contentDescription as string) && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {draftData.contentDescription as string}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(draftData?.channel as string) && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-violet-500/10 text-violet-600">
                              {channelLabels[draftData.channel as string] || draftData.channel as string}
                            </Badge>
                          )}
                          {(draftData?.style as string) && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 capitalize">
                              {draftData.style as string}
                            </Badge>
                          )}
                          {(draftData?.audience as string) && (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {draftData.audience as string}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Metadata row - spread left and right */}
                    <div className="flex items-center justify-between gap-4 mt-2 text-xs text-muted-foreground">
                      {/* Left side: Audience, Moment, Goal */}
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        {selectedAudience && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[100px]">{selectedAudience}</span>
                          </div>
                        )}
                        {selectedMoment && (
                          <>
                            <span className="text-border">•</span>
                            <span className="truncate max-w-[80px] capitalize">{selectedMoment.replace(/-/g, ' ')}</span>
                          </>
                        )}
                        {selectedGoal && (
                          <>
                            <span className="text-border">•</span>
                            <span className="truncate max-w-[80px] capitalize">{String(selectedGoal).replace(/-/g, ' ')}</span>
                          </>
                        )}
                      </div>
                      
                      {/* Right side: Mode, Profile, Time */}
                      <div className="flex items-center gap-2 shrink-0">
                        {selectedMode && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 capitalize">
                            {selectedMode}
                          </Badge>
                        )}
                        {selectedProfileName && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-accent/50 max-w-[80px] truncate">
                            {selectedProfileName}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-muted-foreground/70">
                          <Clock className="w-3 h-3" />
                          <span className="whitespace-nowrap">{formatDistanceToNow(new Date(draft.updated_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
          </div>
        )}
        
        {hasMore && !showAll && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={() => setShowAll(true)}
          >
            View {drafts.length - INITIAL_DISPLAY_COUNT} more
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        )}
        
        {showAll && hasMore && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={() => setShowAll(false)}
          >
            Show less
          </Button>
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
