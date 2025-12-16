import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, Library, FolderOpen } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-foreground tracking-tight">
              PERSIST
            </h1>
            <p className="text-xs text-muted-foreground font-sans">
              Persuasion Intelligence for Student Engagement
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-2 md:gap-4">
          <Link 
            to="/library" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">My Library</span>
          </Link>
          <Link 
            to="/shared-library" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted"
          >
            <Library className="w-4 h-4" />
            <span className="hidden sm:inline">Shared Library</span>
          </Link>
          <a 
            href="#about" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Research</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
