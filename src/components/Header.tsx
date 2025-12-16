import { BookOpen, GraduationCap } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
        </div>
        <nav className="flex items-center gap-4">
          <a 
            href="#about" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Research Foundation</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
