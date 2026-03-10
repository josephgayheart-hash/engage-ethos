import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, Tenant } from '@/contexts/AuthContext';

const ACTIVE_WORKSPACE_KEY = 'campusvoice_active_workspace';

interface WorkspaceContextType {
  /** All workspaces the current user can access */
  workspaces: Tenant[];
  /** The currently-selected workspace id */
  activeWorkspaceId: string | null;
  /** The full Tenant object for the active workspace */
  activeWorkspace: Tenant | null;
  /** Whether workspaces are still loading */
  isLoading: boolean;
  /** Whether the user can switch workspaces (super_admin only) */
  canSwitch: boolean;
  /** Change the active workspace */
  setActiveWorkspaceId: (id: string) => void;
  /** Re-fetch workspace data (call after updating tenant branding etc.) */
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

/**
 * Full workspace context hook — use in components that need switching UI.
 * Throws if used outside WorkspaceProvider.
 */
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

/**
 * Returns the active workspace ID. Safe to use in any authenticated component.
 * Falls back to user's own tenant_id if WorkspaceProvider is not mounted.
 */
export function useActiveWorkspaceId(): string | null {
  const wsContext = useContext(WorkspaceContext);
  const { tenant } = useAuth();

  if (wsContext) {
    return wsContext.activeWorkspaceId;
  }
  // Fallback for components outside WorkspaceProvider
  return tenant?.id ?? null;
}

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { tenant, isSuperAdmin, user, isLoading: authLoading } = useAuth();
  const [workspaces, setWorkspaces] = useState<Tenant[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load workspaces after auth is ready
  useEffect(() => {
    if (authLoading || !user) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);

      if (isSuperAdmin) {
        // Super admins can see all tenants
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .order('institution_name');

        if (!error && data) {
          setWorkspaces(data as Tenant[]);
        }
      } else if (tenant) {
        // Regular users only see their own tenant
        setWorkspaces([tenant]);
      }

      setIsLoading(false);
    };

    load();
  }, [authLoading, user, isSuperAdmin, tenant]);

  // Resolve activeWorkspaceId once workspaces are loaded
  useEffect(() => {
    if (workspaces.length === 0) return;

    // Try to restore from localStorage
    const stored = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
    if (stored && workspaces.some(w => w.id === stored)) {
      setActiveWorkspaceIdState(stored);
    } else {
      // Default to user's own tenant, or first workspace
      const defaultId = tenant?.id || workspaces[0]?.id || null;
      setActiveWorkspaceIdState(defaultId);
      if (defaultId) {
        localStorage.setItem(ACTIVE_WORKSPACE_KEY, defaultId);
      }
    }
  }, [workspaces, tenant?.id]);

  const setActiveWorkspaceId = useCallback((id: string) => {
    setActiveWorkspaceIdState(id);
    localStorage.setItem(ACTIVE_WORKSPACE_KEY, id);
  }, []);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || null;
  const canSwitch = isSuperAdmin && workspaces.length > 1;

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      activeWorkspaceId,
      activeWorkspace,
      isLoading,
      canSwitch,
      setActiveWorkspaceId,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
