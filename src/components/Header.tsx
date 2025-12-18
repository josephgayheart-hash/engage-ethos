import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Library, FolderOpen, Settings, Home, LogOut, User, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { BetaBanner } from "@/components/BetaBanner";
import uplaybookLogo from "@/assets/persist-logo.png";

const MAX_LOGO_HEIGHT = 32;
const MAX_LOGO_WIDTH = 120;

export function Header() {
  const { user, profile, tenant, isAdmin, isSuperAdmin, isApprover, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get accent color from tenant or use default
  const accentColor = tenant?.accent_color || '#2C7A7B';

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src={uplaybookLogo} alt="UPlaybook.AI" className="h-10 w-auto" />
            <BetaBanner variant="badge" />
          </Link>
          {tenant && (
            <>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2">
                {tenant.logo_url && (
                  <img 
                    src={tenant.logo_url} 
                    alt={tenant.institution_name} 
                    className="object-contain"
                    style={{ 
                      maxHeight: `${MAX_LOGO_HEIGHT}px`, 
                      maxWidth: `${MAX_LOGO_WIDTH}px` 
                    }}
                  />
                )}
                <span className="text-lg font-semibold text-foreground">
                  {tenant.institution_name}
                </span>
              </div>
            </>
          )}
        </div>
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
          {isApprover && (
            <Link 
              to="/approvals" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden md:inline">Approvals</span>
            </Link>
          )}
          {isAdmin && (
            <Link 
              to={isSuperAdmin ? "/admin/panel" : "/admin/console"}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">{isSuperAdmin ? "Super Admin" : "Admin"}</span>
            </Link>
          )}
          <a 
            href="#about" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Research</span>
          </a>

          {/* User Menu */}
          {user && profile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 ml-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </div>
                  <span className="hidden md:inline text-sm font-medium">
                    {profile.first_name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{profile.first_name} {profile.last_name}</p>
                  <p className="text-xs text-muted-foreground">{profile.email}</p>
                  {tenant && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {tenant.institution_name}
                    </Badge>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
      {/* Accent color bar */}
      {tenant?.accent_color && (
        <div 
          className="h-1 w-full" 
          style={{ backgroundColor: accentColor }}
        />
      )}
    </header>
  );
}
