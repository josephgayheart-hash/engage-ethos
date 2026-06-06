import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, PenTool, Route, ClipboardCheck, Wrench, FolderOpen, Library, FileEdit,
  Sparkles, ImageIcon, Palette, CheckCircle, Settings, Building2, Layers, BarChart3,
  Shield, Contact, LogOut, User, UserPlus, ChevronsUpDown, Search, Dna, Gift, Heart, Cpu, Activity,
  ClipboardList, Swords, Globe2, MapPin, Share2, Mic,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useAgencyMode } from "@/hooks/useAgencyMode";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useIndustry } from "@/contexts/IndustryContext";
import { useBrandMode } from "@/contexts/BrandModeContext";
import { ReferColleagueDialog } from "@/components/ReferColleagueDialog";
import fieldmarkLogo from "@/assets/fieldmark-logo.png";

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

// Higher-ed specific routes hidden for non-higher-ed tenants
const HIGHER_ED_ONLY_URLS = new Set(['/giving-day-planner', '/stewardship-report']);

import { brandConfig } from "@/config/brandConfig";

type NavItems = Record<string, string>;

const createItemsDef = (nav: NavItems) => [
  { title: nav.messageBuilder, url: "/build", icon: PenTool },
  { title: "Journey Designer", url: "/strategy", icon: Route },
  { title: "Giving Day Planner", url: "/giving-day-planner", icon: Gift },
  { title: "Stewardship Report", url: "/stewardship-report", icon: Heart },
  { title: nav.playground, url: "/playground", icon: Sparkles },
  { title: "Image Studio", url: "/image-generator", icon: ImageIcon },
  { title: "Brand Studio", url: "/brand-studio", icon: Palette },
  { title: "Evaluator", url: "/evaluate", icon: ClipboardCheck },
];

const fieldOpsItemsDef = (nav: NavItems) => [
  { title: nav.campaignBrief, url: "/campaign-brief", icon: ClipboardList },
  { title: "Competitive Analyzer", url: "/competitive-analyzer", icon: Swords },
  { title: nav.regionAdapter, url: "/region-adapter", icon: Globe2 },
  { title: nav.regionalPlaybook, url: "/regional-playbook", icon: MapPin },
  { title: nav.socialPosts ?? "Social Posts", url: "/social-posts", icon: Share2 },
];

const manageItems = [
  { title: "My Library", url: "/library", icon: FolderOpen },
  { title: "Collections", url: "/shared-library", icon: Layers },
  { title: "My Drafts", url: "/dashboard#my-drafts", icon: FileEdit },
  { title: "Tools", url: "/tools", icon: Wrench },
];

const superAdminItems = [
  { title: "Platform Ops", url: "/platform", icon: Activity },
  { title: "Super Admin Panel", url: "/admin/panel", icon: Shield },
  { title: "Personal AI", url: "/admin/personal-ai", icon: Sparkles },
  { title: "CRM", url: "/admin/crm", icon: Contact },
  { title: "AI Technology", url: "/admin/ai-technology", icon: Cpu },
];

export function AppSidebar() {
  const { profile, tenant, isAdmin, isSuperAdmin, isApprover, logout } = useAuth();
  const { isAgency, labels } = useAgencyMode();
  const { activeWorkspace, canSwitch } = useWorkspace();
  const { labels: industryLabels, isHigherEd, isEnterprise } = useIndustry();
  const { brand } = useBrandMode();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const [referDialogOpen, setReferDialogOpen] = useState(false);
  const collapsed = state === "collapsed";

  // When a super admin switches to another workspace, hide platform-admin-only features
  const isViewingOwnWorkspace = !canSwitch || !activeWorkspace || activeWorkspace.id === tenant?.id;
  const showPlatformAdmin = isSuperAdmin && isViewingOwnWorkspace;

  const createItems = useMemo(() => createItemsDef(brand.navItems), [brand.navItems]);
  const fieldOpsItems = useMemo(() => fieldOpsItemsDef(brand.navItems), [brand.navItems]);

  // Filter higher-ed-only items for non-higher-ed tenants
  const filteredCreateItems = isHigherEd
    ? createItems
    : createItems.filter(item => !HIGHER_ED_ONLY_URLS.has(item.url));

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const libraryItems: typeof manageItems = [];

  const governItems = [
    { title: "Content DNA Studio", url: "/admin/content-dna", icon: Dna },
    { title: isAgency ? "Partner Institutions" : industryLabels.organizationSettings, url: isAgency ? "/agency/clients" : "/organization-settings", icon: Building2 },
    ...(isAdmin ? [{ title: "Admin Console", url: "/admin/console", icon: Settings }] : []),
    ...(isAgency && isViewingOwnWorkspace ? [{ title: "Analytics", url: "/agency/analytics", icon: BarChart3 }] : []),
  ];

  const initials = `${profile?.first_name?.[0] ?? ""}${profile?.last_name?.[0] ?? ""}`;

  const navLinkClasses = "hover:bg-sidebar-accent/50 h-9 text-[13px] transition-all duration-200 hover:translate-x-0.5";
  const activeClasses = "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-primary shadow-sm";

  return (
    <Sidebar collapsible="icon">
      {/* Logo Header */}
      {!collapsed && (
        <SidebarHeader className="border-b border-sidebar-border px-2 py-2">
          <div className="flex flex-col items-center justify-center gap-0">
            <NavLink to="/dashboard" className="flex items-center gap-1.5">
              {brand.name === "Fieldmark" ? (
                <img src={fieldmarkLogo} alt="Fieldmark" className="h-5 w-auto" />
              ) : (
                <>
                  <span className="font-semibold text-xs tracking-tight text-foreground">{brand.wordmark}</span>
                  {brand.registeredMark && <span className="text-[6px] text-muted-foreground -mt-1.5 ml-px">®</span>}
                </>
              )}
            </NavLink>
            <span className="text-[8px] text-muted-foreground/60 leading-tight mt-0.5 text-center max-w-[10rem]">{brand.tagline}</span>
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
              {filteredCreateItems.map((item) => (
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

        {/* Field Ops — enterprise/franchise only */}
        {isEnterprise && (
          <SidebarGroup className="py-1">
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3 mb-0.5">Field Ops</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {fieldOpsItems.map((item) => (
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
        )}

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