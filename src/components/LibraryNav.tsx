import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FolderOpen, Library, ChevronRight } from "lucide-react";

interface LibraryNavProps {
  mode: 'messages' | 'journeys' | 'all';
}

export function LibraryNav({ mode }: LibraryNavProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
      <span className="text-sm text-muted-foreground">Quick Access:</span>
      <Link to="/library">
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          <FolderOpen className="w-3 h-3 mr-1" />
          {mode === 'journeys' ? 'My Journeys' : mode === 'messages' ? 'My Messages' : 'My Library'}
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </Link>
      <Link to="/shared-library">
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          <Library className="w-3 h-3 mr-1" />
          {mode === 'journeys' ? 'Journey Playbooks' : mode === 'messages' ? 'Message Templates' : 'Shared Library'}
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </Link>
    </div>
  );
}
