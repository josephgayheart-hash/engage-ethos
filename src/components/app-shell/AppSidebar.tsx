import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  PenTool,
  Route,
  ClipboardCheck,
  Wrench,
  FolderOpen,
  Library,
  FileEdit,
  Sparkles,
  ImageIcon,
  Palette,
  CheckCircle,
  Settings,
  Building2,
  Layers,
  BarChart3,
  Shield,
  Users,
  Bug,
  Database,
  Lock,
  LogOut,
  User,
  UserPlus,
  ChevronsUpDown,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useAgencyMode } from "@/hooks/useAgencyMode";
import { ReferColleagueDialog } from "@/components/ReferColleagueDialog";
import campusvoiceLogo from "@/assets/campusvoice-logo-new.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Message Builder", url: "/build", icon: PenTool },
  { title: "Journey Designer", url: "/strategy", icon: Route },
  { title: "Evaluator", url: "/evaluate", icon: ClipboardCheck },
  { title: "Tools", url: "/tools", icon: Wrench },
];

const createItems = [
  { title: "AI Copywriter", url: "/playground", icon: Sparkles },
  { title: "Image Studio", url: "/image-generator", icon: ImageIcon },
  { title: "Brand Studio", url: "/brand-studio", icon: Palette },
];

const superAdminItems = [
  { title: "Super Admin Panel", url: "/admin/panel", icon: Shield },
  { title: "Admin Users", url: "/admin/users", icon: Users },
  { title: "QA Diagnostics", url: "/admin/qa", icon: Bug },
  { title: "Seed Data", url: "/admin/seed", icon: Database },
  { title: "Security Events", url: "/admin/security-events", icon: Lock },
];

export function AppSidebar() {
  const { profile, isAdmin, isSuperAdmin, isApprover, logout } = useAuth();
  const { isAgency, labels } = useAgencyMode();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const [referDialogOpen, setReferDialogOpen] = useState(false);
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const libraryItems = [
    { title: "My Library", url: "/library", icon: FolderOpen },
    { title: isAgency ? "Templates" : "University Library", url: "/shared-library", icon: Library },
    { title: "My Drafts", url: "/dashboard#my-drafts", icon: FileEdit },
  ];

  const adminItems = [
    { title: "Admin Console", url: "/admin/console", icon: Settings },
    { title: "Content DNA Studio", url: "/admin/content-dna", icon: Sparkles },
    { title: isAgency ? "Client Settings" : "University Settings", url: isAgency ? "/agency/clients" : "/university-settings", icon: Building2 },
    { title: "Brand Audit", url: "/brand-audit", icon: Layers },
    ...(isAgency ? [{ title: "Analytics", url: "/agency/analytics", icon: BarChart3 }] : []),
  ];

  const initials = `${profile?.first_name?.[0] ?? ""}${profile?.last_name?.[0] ?? ""}`;

  return (
    <Sidebar collapsible="icon">
      {/* Logo Header */}
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="CampusVoice">
              <NavLink to="/dashboard">
                <img
                  src={campusvoiceLogo}
                  alt="CampusVoice"
                  className="h-6 w-6 object-contain shrink-0"
                />
                <span className="font-semibold text-sm truncate">CampusVoice.AI</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Libraries */}
        <SidebarGroup>
          <SidebarGroupLabel>Libraries</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {libraryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Create */}
        <SidebarGroup>
          <SidebarGroupLabel>Create</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {createItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Approvals */}
        {isApprover && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Approvals">
                      <NavLink
                        to="/approvals"
                        className="hover:bg-sidebar-accent/50"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <CheckCircle className="shrink-0" />
                        <span>Approvals</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Admin */}
        {isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink
                          to={item.url}
                          className="hover:bg-sidebar-accent/50"
                          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        >
                          <item.icon className="shrink-0" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Super Admin */}
        {isSuperAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Super Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {superAdminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink
                          to={item.url}
                          className="hover:bg-sidebar-accent/50"
                          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        >
                          <item.icon className="shrink-0" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Footer: User dropdown */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  tooltip={profile ? `${profile.first_name} ${profile.last_name}` : "Account"}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {profile?.first_name} {profile?.last_name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {profile?.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side="top"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setReferDialogOpen(true)} className="cursor-pointer">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite a Colleague
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <ReferColleagueDialog open={referDialogOpen} onOpenChange={setReferDialogOpen} />
    </Sidebar>
  );
}
