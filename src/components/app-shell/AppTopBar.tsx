import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Dna, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAgencyMode } from "@/hooks/useAgencyMode";
import { useIndustry } from "@/contexts/IndustryContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { BetaBanner } from "@/components/BetaBanner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceSelector } from "./WorkspaceSelector";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";

const MAX_LOGO_HEIGHT = 22;
const MAX_LOGO_WIDTH = 80;

export function AppTopBar() {
  const { tenant } = useAuth();
  const { isAgency } = useAgencyMode();
  const { labels: industryLabels } = useIndustry();
  const { canSwitch, activeWorkspace } = useWorkspace();
  const [cmdOpen, setCmdOpen] = useState(false);
  const navigate = useNavigate();

  const displayTenant = canSwitch ? activeWorkspace : tenant;

  const quickNav = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Message Builder", href: "/build" },
    { label: "Journey Designer", href: "/strategy" },
    { label: "Evaluator", href: "/evaluate" },
    { label: "My Library", href: "/library" },
    { label: "Content DNA", href: "/admin/content-dna" },
    { label: industryLabels.organizationSettings, href: "/university-settings" },
    { label: "Image Studio", href: "/image-generator" },
    { label: "AI Copywriter", href: "/playground" },
    { label: "Brand Studio", href: "/brand-studio" },
    { label: "Tools", href: "/tools" },
    { label: "Profile", href: "/profile" },
    { label: "Settings", href: "/settings" },
  ];

  // Cmd+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback((href: string) => {
    setCmdOpen(false);
    navigate(href);
  }, [navigate]);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-11 shrink-0 items-center gap-2 border-b border-border bg-background px-3">
        <SidebarTrigger className="-ml-1 h-7 w-7" />
        <Separator orientation="vertical" className="h-4" />

        {/* Workspace selector for super admins */}
        {canSwitch && <WorkspaceSelector />}

        {/* Tenant indicator */}
        {!canSwitch && displayTenant && (
          <div className="flex items-center gap-1.5">
            {displayTenant.logo_url && (
              <img
                src={displayTenant.logo_url}
                alt={displayTenant.institution_name}
                className="object-contain"
                style={{ maxHeight: MAX_LOGO_HEIGHT, maxWidth: MAX_LOGO_WIDTH }}
              />
            )}
            <span className="text-xs font-medium text-foreground truncate max-w-[160px]">
              {displayTenant.institution_name}
            </span>
            {isAgency && (
              <Badge variant="outline" className="h-4 text-[9px] px-1 border-amber-500/30 text-amber-600">
                Agency Partner
              </Badge>
            )}
          </div>
        )}


        {/* Spacer */}
        <div className="flex-1" />

        {/* Search trigger */}
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 sm:w-auto sm:px-2.5 sm:gap-1.5 text-muted-foreground"
          onClick={() => setCmdOpen(true)}
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs">Search</span>
          <kbd className="hidden md:inline-flex h-4 items-center rounded border border-border bg-muted px-1 text-[10px] text-muted-foreground ml-1">
            ⌘K
          </kbd>
        </Button>

        <BetaBanner variant="badge" />
      </header>

      {/* Command Palette */}
      <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <CommandInput placeholder="Search pages, tools, or actions..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {quickNav.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => handleSelect(item.href)}
                className="text-sm"
              >
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
