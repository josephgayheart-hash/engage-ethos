import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'user' | 'approver' | 'super_admin' | 'agency_admin' | 'agency_user';
export type UserStatus = 'invited' | 'pending' | 'active' | 'locked' | 'disabled';

export interface UserProfile {
  id: string;
  tenant_id: string;
  status: UserStatus;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  department: string | null;
  title: string | null;
  password_reset_required: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface Tenant {
  id: string;
  institution_name: string;
  status: 'active' | 'inactive';
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  tenant_type: 'university' | 'agency' | 'enterprise' | 'franchise' | 'nonprofit' | 'healthcare' | 'financial';
  client_limit: number | null;
  agency_website: string | null;
  agency_contact_email: string | null;
  industry_vertical?: string | null;
  industry_config?: Record<string, unknown> | null;
}

interface ImpersonationState {
  isImpersonating: boolean;
  impersonatedUserEmail: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  tenant: Tenant | null;
  role: UserRole | null;
  roles: UserRole[];
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isAgencyAdmin: boolean;
  isAgencyMember: boolean;
  isApprover: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  // Impersonation
  isImpersonating: boolean;
  impersonatedUserEmail: string | null;
  startImpersonation: (targetUserId: string) => Promise<void>;
  exitImpersonation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IMPERSONATION_STORAGE_KEY = 'campusvoice_impersonation';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [impersonation, setImpersonation] = useState<ImpersonationState>({
    isImpersonating: false,
    impersonatedUserEmail: null,
  });

  const clearAuthState = () => {
    setUser(null);
    setSession(null);
    setProfile(null);
    setTenant(null);
    setRoles([]);
  };

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return;
      }

      setProfile(profileData as UserProfile);

      // Fetch tenant
      if (profileData.tenant_id) {
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', profileData.tenant_id)
          .single();

        if (tenantError) {
          console.error('Tenant fetch error:', tenantError);
        } else if (tenantData) {
          setTenant(tenantData as Tenant);
        }
      }

      // Fetch all roles for this user
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesData && rolesData.length > 0) {
        const userRoles = rolesData.map(r => r.role as UserRole);
        setRoles(userRoles);
      } else {
        setRoles([]);
      }

      // Update last login (skip if impersonating)
      const storedImpersonation = sessionStorage.getItem(IMPERSONATION_STORAGE_KEY);
      if (!storedImpersonation) {
        await supabase
          .from('profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', userId);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Check for stored impersonation state on mount (sessionStorage clears on tab close)
    const storedImpersonation = sessionStorage.getItem(IMPERSONATION_STORAGE_KEY);
    if (storedImpersonation) {
      try {
        const parsed = JSON.parse(storedImpersonation);
        if (isMounted) {
          setImpersonation({
            isImpersonating: true,
            impersonatedUserEmail: parsed.impersonatedUserEmail ?? null,
          });
        }
      } catch (e) {
        sessionStorage.removeItem(IMPERSONATION_STORAGE_KEY);
      }
    }

    // Set up auth state listener for subsequent auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!isMounted) return;

        // Ignore INITIAL_SESSION; we hydrate from getSession() first.
        if (event === 'INITIAL_SESSION') return;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);

          // Defer backend reads to avoid blocking auth event processing
          setTimeout(() => {
            if (!isMounted) return;
            void fetchUserData(currentSession.user.id);
          }, 0);
          return;
        }

        // Guard against transient null sessions by re-checking storage-backed session first
        setTimeout(() => {
          void (async () => {
            if (!isMounted) return;
            try {
              const { data: { session: recoveredSession } } = await supabase.auth.getSession();
              if (!isMounted) return;

              if (recoveredSession?.user) {
                setSession(recoveredSession);
                setUser(recoveredSession.user);
                void fetchUserData(recoveredSession.user.id);
                return;
              }
            } catch (sessionError) {
              console.error('Session recovery failed:', sessionError);
            }

            if (!isMounted) return;
            clearAuthState();
          })();
        }, 0);
      }
    );

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (!isMounted) return;
        if (error) throw error;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchUserData(currentSession.user.id);
        } else {
          clearAuthState();
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    // Clear impersonation state if exists
    sessionStorage.removeItem(IMPERSONATION_STORAGE_KEY);
    setImpersonation({
      isImpersonating: false,
      impersonatedUserEmail: null,
    });

    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setTenant(null);
    setRoles([]);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  const startImpersonation = async (targetUserId: string) => {
    if (!session) {
      toast.error('No active session');
      return;
    }

    try {
      // Call edge function to get impersonation token
      const { data, error } = await supabase.functions.invoke('impersonate-user', {
        body: { targetUserId }
      });

      if (error) {
        console.error('Impersonation error:', error);
        toast.error('Failed to start impersonation');
        return;
      }

      // Store only the impersonated email flag in sessionStorage (clears on tab close).
      // We intentionally do NOT persist the super-admin's tokens — on exit, the admin
      // is required to sign in again. This avoids exposing long-lived tokens to XSS.
      const impersonationData = {
        impersonatedUserEmail: data.targetUser.email,
      };
      sessionStorage.setItem(IMPERSONATION_STORAGE_KEY, JSON.stringify(impersonationData));

      // Verify the OTP token to get a session
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: data.token,
        type: 'magiclink',
      });

      if (verifyError) {
        console.error('Token verification error:', verifyError);
        sessionStorage.removeItem(IMPERSONATION_STORAGE_KEY);
        toast.error('Failed to verify impersonation token');
        return;
      }

      setImpersonation({
        isImpersonating: true,
        impersonatedUserEmail: data.targetUser.email,
      });

      toast.success(`Now viewing as ${data.targetUser.email}`);

      // Reload to ensure fresh state
      window.location.href = '/dashboard';

    } catch (error) {
      console.error('Impersonation error:', error);
      toast.error('Failed to start impersonation');
    }
  };

  const exitImpersonation = async () => {
    try {
      sessionStorage.removeItem(IMPERSONATION_STORAGE_KEY);
      setImpersonation({
        isImpersonating: false,
        impersonatedUserEmail: null,
      });

      // Sign the impersonated session out and force the super admin to re-authenticate.
      // This avoids the previous pattern of stashing the original refresh token in
      // browser storage where XSS could read it.
      await supabase.auth.signOut();
      toast.success('Exited impersonation. Please sign in again.');
      window.location.href = '/login';
    } catch (error) {
      console.error('Exit impersonation error:', error);
      toast.error('Failed to exit impersonation');
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
  };

  const isSuperAdmin = roles.includes('super_admin');
  const isAgencyAdmin = roles.includes('agency_admin');
  const isAgencyMember = isAgencyAdmin || roles.includes('agency_user');
  const isAdmin = roles.includes('admin') || isAgencyAdmin || isSuperAdmin;
  const isApprover = roles.includes('approver') || roles.includes('admin') || isAgencyAdmin || isSuperAdmin;
  const role = roles.length > 0 ? roles[0] : null;

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      tenant, 
      role,
      roles,
      isLoading, 
      isAdmin,
      isSuperAdmin,
      isAgencyAdmin,
      isAgencyMember,
      isApprover,
      logout,
      refreshProfile,
      isImpersonating: impersonation.isImpersonating,
      impersonatedUserEmail: impersonation.impersonatedUserEmail,
      startImpersonation,
      exitImpersonation,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
