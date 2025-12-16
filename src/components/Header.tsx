import { Link } from "react-router-dom";
import { BookOpen, Library, FolderOpen, Settings, Home } from "lucide-react";
import persistLogo from "@/assets/persist-logo.png";

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <img src={persistLogo} alt="PERSIST" className="h-10 w-auto" />
        </Link>
        <nav className="flex items-center gap-2 md:gap-4">
          <Link
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
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
          <Link 
            to="/admin" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Admin</span>
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
