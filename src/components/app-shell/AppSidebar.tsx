import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, PenTool, Route, ClipboardCheck, Wrench, FolderOpen, Library, FileEdit,
  Sparkles, ImageIcon, Palette, CheckCircle, Settings, Building2, Layers, BarChart3,
  Shield, Contact, LogOut, User, UserPlus, ChevronsUpDown, Search, Dna, Gift, Heart, Cpu,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useAgencyMode } from "@/hooks/useAgencyMode";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useIndustry } from "@/contexts/IndustryContext";
import { ReferColleagueDialog } from "@/components/ReferColleagueDialog";

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

/* ── Navigation Groups ── */

const createItems = [
  { title: "Message Builder", url: "/build", icon: PenTool },
  { title: "Journey Designer", url: "/strategy", icon: Route },
  { title: "Giving Day Planner", url: "/giving-day-planner", icon: Gift },
  { title: "Stewardship Report", url: "/stewardship-report", icon: Heart },
  { title: "AI Copywriter", url: "/playground", icon: Sparkles },
  { title: "Image Studio", url: "/image-generator", icon: ImageIcon },
  { title: "Brand Studio", url: "/brand-studio", icon: Palette },
  { title: "Evaluator", url: "/evaluate", icon: ClipboardCheck },
];

const manageItems = [
  { title: "My Library", url: "/library", icon: FolderOpen },
  { title: "Collections", url: "/shared-library", icon: Layers },
  { title: "My Drafts", url: "/dashboard#my-drafts", icon: FileEdit },
  { title: "Tools", url: "/tools", icon: Wrench },
];

const superAdminItems = [
  { title: "Super Admin Panel", url: "/admin/panel", icon: Shield },
  { title: "CRM", url: "/admin/crm", icon: Contact },
  { title: "AI Technology", url: "/admin/ai-technology", icon: Cpu },
];

export function AppSidebar() {
  const { profile, tenant, isAdmin, isSuperAdmin, isApprover, logout } = useAuth();
  const { isAgency, labels } = useAgencyMode();
  const { activeWorkspace, canSwitch } = useWorkspace();
  const { labels: industryLabels } = useIndustry();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const [referDialogOpen, setReferDialogOpen] = useState(false);
  const collapsed = state === "collapsed";

  // When a super admin switches to another workspace, hide platform-admin-only features
  const isViewingOwnWorkspace = !canSwitch || !activeWorkspace || activeWorkspace.id === tenant?.id;
  const showPlatformAdmin = isSuperAdmin && isViewingOwnWorkspace;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const libraryItems: typeof manageItems = [];

  const governItems = [
    { title: "Content DNA Studio", url: "/admin/content-dna", icon: Dna },
    { title: isAgency ? "Partner Institutions" : "Institution Settings", url: isAgency ? "/agency/clients" : "/university-settings", icon: Building2 },
    ...(isAdmin ? [{ title: "Admin Console", url: "/admin/console", icon: Settings }] : []),
    ...(isAgency && isViewingOwnWorkspace ? [{ title: "Analytics", url: "/agency/analytics", icon: BarChart3 }] : []),
  ];

  const initials = `${profile?.first_name?.[0] ?? ""}${profile?.last_name?.[0] ?? ""}`;

  const navLinkClasses = "hover:bg-sidebar-accent/50 h-9 text-[13px]";
  const activeClasses = "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-primary";

  return (
    <Sidebar collapsible="icon">
      {/* Logo Header */}
      {!collapsed && (
        <SidebarHeader className="border-b border-sidebar-border px-2 py-2">
          <div className="flex items-center justify-center gap-0">
            <NavLink to="/dashboard" className="flex items-center gap-0">
              <span className="font-semibold text-xs tracking-tight text-foreground">CampusVoice.ai</span>
              <span className="text-[6px] text-muted-foreground -mt-1.5 ml-px">®</span>
            </NavLink>
          </div>
        </SidebarHeader>
      )}

      <SidebarContent className="px-1">
        {/* Home */}
        <SidebarGroup className="py-1">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <NavLink to="/dashboard" end className={navLinkClasses} activeClassName={activeClasses}>
                    <Home className="shrink-0 !w-4 !h-4" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-0.5" />

        {/* Create */}
        <SidebarGroup className="py-1">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3 mb-0.5">Create</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {createItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className={navLinkClasses} activeClassName={activeClasses}>
                      <item.icon className="shrink-0 !w-4 !h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-0.5" />

        {/* Manage */}
        <SidebarGroup className="py-1">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3 mb-0.5">Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[...manageItems, ...libraryItems].map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className={navLinkClasses} activeClassName={activeClasses}>
                      <item.icon className="shrink-0 !w-4 !h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Approvals - hidden for agency users */}
        {isApprover && !isAgency && (
          <SidebarGroup className="py-0">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Approvals">
                    <NavLink to="/approvals" className={navLinkClasses} activeClassName={activeClasses}>
                      <CheckCircle className="shrink-0 !w-4 !h-4" />
                      <span>Approvals</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarSeparator className="my-0.5" />

        {/* Govern */}
        <SidebarGroup className="py-1">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3 mb-0.5">Govern</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {governItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className={navLinkClasses} activeClassName={activeClasses}>
                      <item.icon className="shrink-0 !w-4 !h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Super Admin */}
        {showPlatformAdmin && (
          <>
            <SidebarSeparator className="my-0.5" />
            <SidebarGroup className="py-1">
              <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3 mb-0.5">Platform Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {superAdminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink to={item.url} className={navLinkClasses} activeClassName={activeClasses}>
                          <item.icon className="shrink-0 !w-4 !h-4" />
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
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-10"
                  tooltip={profile ? `${profile.first_name} ${profile.last_name}` : "Account"}
                >
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium text-xs">
                      {profile?.first_name} {profile?.last_name}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {profile?.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-3.5 shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-52"
                side="top"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer text-xs">
                  <User className="mr-2 h-3.5 w-3.5" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer text-xs">
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setReferDialogOpen(true)} className="cursor-pointer text-xs">
                  <UserPlus className="mr-2 h-3.5 w-3.5" />
                  Invite a Colleague
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer text-xs">
                  <LogOut className="mr-2 h-3.5 w-3.5" />
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
