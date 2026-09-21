// Route guards — ported verbatim from the pre-migration src/App.tsx so every
// protected route keeps exactly the same gating behaviour.
import { Navigate } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useIndustry } from "@/contexts/IndustryContext";
import { BrandedLoader } from "@/components/BrandedLoader";

// Protected route wrapper
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading, profile } = useAuth();
  if (isLoading) return <BrandedLoader />;
  if (!user) return <Navigate to="/login" replace />;
  // Avoid false logout redirects while profile is still hydrating.
  if (!profile) return <BrandedLoader />;
  if (profile.password_reset_required) return <Navigate to="/change-password" replace />;
  if (profile.status !== "active" && profile.status !== "invited")
    return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Wraps the main app shell. Tool-only users get bounced to Compass.
export function RequireFullApp({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  if (profile?.tool_only) return <Navigate to="/compass" replace />;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth();
  if (isLoading) return <BrandedLoader />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin, isLoading, tenant } = useAuth();
  const { activeWorkspace, canSwitch } = useWorkspace();
  if (isLoading) return <BrandedLoader />;
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;
  // Block platform-admin routes when viewing another workspace
  const isViewingOwnWorkspace = !canSwitch || !activeWorkspace || activeWorkspace.id === tenant?.id;
  if (!isViewingOwnWorkspace) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function RequireApprover({ children }: { children: React.ReactNode }) {
  const { isApprover, isLoading } = useAuth();
  if (isLoading) return <BrandedLoader />;
  if (!isApprover) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function RequireHigherEd({ children }: { children: React.ReactNode }) {
  const { isHigherEd } = useIndustry();
  if (!isHigherEd) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, profile } = useAuth();
  if (isLoading) return <BrandedLoader />;
  if (user && !profile) return <BrandedLoader />;
  if (user && profile?.status === "active" && !profile.password_reset_required) {
    if (profile.tool_only) return <Navigate to="/compass" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
