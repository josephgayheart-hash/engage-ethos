import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Route, 
  ClipboardCheck, 
  Library,
  ChevronRight,
  FileEdit,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUserDrafts } from '@/hooks/useUserDrafts';

interface AppNavigationProps {
  className?: string;
}

const mainNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/build', label: 'Message Builder', icon: MessageSquare },
  { path: '/strategy', label: 'Journey Designer', icon: Route },
  { path: '/evaluate', label: 'Evaluator', icon: ClipboardCheck },
  { path: '/library', label: 'My Library', icon: Library },
];

export function AppNavigation({ className }: AppNavigationProps) {
  const location = useLocation();
  const { drafts } = useUserDrafts();
  
  const messageDrafts = drafts.filter(d => d.draft_type === 'message').length;
  const journeyDrafts = drafts.filter(d => d.draft_type === 'journey').length;

  const getDraftCount = (path: string) => {
    if (path === '/build') return messageDrafts;
    if (path === '/strategy') return journeyDrafts;
    return 0;
  };

  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {mainNavItems.map((item) => {
        const isActive = location.pathname === item.path || 
                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
        const Icon = item.icon;
        const draftCount = getDraftCount(item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden md:inline">{item.label}</span>
            {draftCount > 0 && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "h-5 min-w-[20px] px-1.5 text-xs",
                  isActive 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : "bg-accent/20 text-accent"
                )}
              >
                {draftCount}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface AppBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function AppBreadcrumbs({ items, className }: AppBreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center gap-1 text-sm", className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          {item.path ? (
            <Link
              to={item.path}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

interface DraftIndicatorProps {
  draftType: 'message' | 'journey';
  onResume?: () => void;
  onDiscard?: () => void;
  className?: string;
}

export function DraftIndicator({ draftType, onResume, onDiscard, className }: DraftIndicatorProps) {
  const { getMostRecentDraft } = useUserDrafts(draftType);
  const draft = getMostRecentDraft(draftType);

  if (!draft) return null;

  const typeLabel = draftType === 'message' ? 'message' : 'journey';
  const timeSince = getTimeSince(new Date(draft.updated_at));

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border bg-accent/5 border-accent/20",
      className
    )}>
      <div className="flex items-center gap-2 text-accent">
        <FileEdit className="w-4 h-4" />
        <Sparkles className="w-3 h-3" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          Unsaved {typeLabel} draft
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {draft.title || 'Untitled'} • Updated {timeSince}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {onDiscard && (
          <button
            onClick={onDiscard}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Discard
          </button>
        )}
        {onResume && (
          <button
            onClick={onResume}
            className="text-xs font-medium text-accent hover:text-accent/80 transition-colors"
          >
            Resume
          </button>
        )}
      </div>
    </div>
  );
}

function getTimeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
