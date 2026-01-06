import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Library, FolderOpen, Settings, Home, LogOut, User, CheckCircle, UserPlus, Building2, PenTool, Route, ChevronDown, Sparkles, FileEdit } from "lucide-react";
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
import { ReferColleagueDialog } from "@/components/ReferColleagueDialog";
import campusvoiceLogo from "@/assets/campusvoice-logo-new.png";

const MAX_LOGO_HEIGHT = 32;
const MAX_LOGO_WIDTH = 120;

export function Header() {
  const { user, profile, tenant, isAdmin, isSuperAdmin, isApprover, logout } = useAuth();
  const navigate = useNavigate();
  const [referDialogOpen, setReferDialogOpen] = useState(false);

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
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src={campusvoiceLogo} alt="CampusVoice.AI" className="h-8 sm:h-10 w-auto max-w-[180px] sm:max-w-[220px] object-contain" />
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
        <nav className="flex items-center gap-1 md:gap-2">
          {/* Home - All users */}
          <Link
            to="/dashboard" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          {/* Super Admin: Keep original navigation unchanged */}
          {isSuperAdmin ? (
            <>
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
                <span className="hidden sm:inline">University Library</span>
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
              <Link 
                to="/admin/panel"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden md:inline">Super Admin</span>
              </Link>
            </>
          ) : (
            <>
              {/* Non-Super Admin Navigation */}
              {/* Build - Message Builder */}
              <Link
                to="/build" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted"
              >
                <PenTool className="w-4 h-4" />
                <span className="hidden sm:inline">Build</span>
              </Link>

              {/* Strategy - Journey Designer */}
              <Link
                to="/strategy" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted"
              >
                <Route className="w-4 h-4" />
                <span className="hidden sm:inline">Strategy</span>
              </Link>

              {/* Libraries Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1.5">
                    <Library className="w-4 h-4" />
                    <span className="hidden sm:inline">Libraries</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/library" className="flex items-center gap-2 cursor-pointer">
                      <FolderOpen className="w-4 h-4" />
                      My Library
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/shared-library" className="flex items-center gap-2 cursor-pointer">
                      <Library className="w-4 h-4" />
                      University Library
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard#drafts" className="flex items-center gap-2 cursor-pointer">
                      <FileEdit className="w-4 h-4" />
                      My Drafts
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Approvals - Approvers only */}
              {isApprover && (
                <Link 
                  to="/approvals" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden md:inline">Approvals</span>
                </Link>
              )}

              {/* Admin Dropdown - Tenant Admins only */}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1.5">
                      <Settings className="w-4 h-4" />
                      <span className="hidden md:inline">Admin</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52">
                    <DropdownMenuItem asChild>
                      <Link to="/admin/console" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="w-4 h-4" />
                        Admin Console
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/university-settings" className="flex items-center gap-2 cursor-pointer">
                        <Building2 className="w-4 h-4" />
                        University Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/content-dna" className="flex items-center gap-2 cursor-pointer">
                        <Sparkles className="w-4 h-4" />
                        Content DNA Studio
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}

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
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/university-settings" className="flex items-center gap-2 cursor-pointer">
                        <Building2 className="w-4 h-4" />
                        University Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={isSuperAdmin ? "/admin/panel" : "/admin/console"} className="flex items-center gap-2 cursor-pointer">
                        <Settings className="w-4 h-4" />
                        {isSuperAdmin ? "Super Admin Panel" : "Admin Console"}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={() => setReferDialogOpen(true)} className="cursor-pointer">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite a Colleague
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
      
      {/* Refer Colleague Dialog */}
      <ReferColleagueDialog open={referDialogOpen} onOpenChange={setReferDialogOpen} />
    </header>
  );
}
