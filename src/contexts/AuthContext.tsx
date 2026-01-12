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
  tenant_type: 'university' | 'agency';
  client_limit: number | null;
  agency_website: string | null;
  agency_contact_email: string | null;
}

interface ImpersonationState {
  isImpersonating: boolean;
  originalAccessToken: string | null;
  originalRefreshToken: string | null;
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
    originalAccessToken: null,
    originalRefreshToken: null,
    impersonatedUserEmail: null,
  });

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
      const storedImpersonation = localStorage.getItem(IMPERSONATION_STORAGE_KEY);
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
    // Check for stored impersonation state on mount
    const storedImpersonation = localStorage.getItem(IMPERSONATION_STORAGE_KEY);
    if (storedImpersonation) {
      try {
        const parsed = JSON.parse(storedImpersonation);
        setImpersonation({
          isImpersonating: true,
          originalAccessToken: parsed.originalAccessToken,
          originalRefreshToken: parsed.originalRefreshToken,
          impersonatedUserEmail: parsed.impersonatedUserEmail,
        });
      } catch (e) {
        localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
      }
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(() => {
            fetchUserData(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setTenant(null);
          setRoles([]);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserData(currentSession.user.id).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    // Clear impersonation state if exists
    localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
    setImpersonation({
      isImpersonating: false,
      originalAccessToken: null,
      originalRefreshToken: null,
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
      // Store current session before impersonating
      const currentAccessToken = session.access_token;
      const currentRefreshToken = session.refresh_token;

      // Call edge function to get impersonation token
      const { data, error } = await supabase.functions.invoke('impersonate-user', {
        body: { targetUserId }
      });

      if (error) {
        console.error('Impersonation error:', error);
        toast.error('Failed to start impersonation');
        return;
      }

      // Store original session in localStorage
      const impersonationData = {
        originalAccessToken: currentAccessToken,
        originalRefreshToken: currentRefreshToken,
        impersonatedUserEmail: data.targetUser.email,
      };
      localStorage.setItem(IMPERSONATION_STORAGE_KEY, JSON.stringify(impersonationData));

      // Verify the OTP token to get a session
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: data.token,
        type: 'magiclink',
      });

      if (verifyError) {
        console.error('Token verification error:', verifyError);
        localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
        toast.error('Failed to verify impersonation token');
        return;
      }

      setImpersonation({
        isImpersonating: true,
        originalAccessToken: currentAccessToken,
        originalRefreshToken: currentRefreshToken,
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
    const storedImpersonation = localStorage.getItem(IMPERSONATION_STORAGE_KEY);
    if (!storedImpersonation) {
      toast.error('No impersonation session found');
      return;
    }

    try {
      const { originalAccessToken, originalRefreshToken } = JSON.parse(storedImpersonation);

      // Clear impersonation state first
      localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
      setImpersonation({
        isImpersonating: false,
        originalAccessToken: null,
        originalRefreshToken: null,
        impersonatedUserEmail: null,
      });

      // Restore original session
      const { error } = await supabase.auth.setSession({
        access_token: originalAccessToken,
        refresh_token: originalRefreshToken,
      });

      if (error) {
        console.error('Session restore error:', error);
        toast.error('Failed to restore session. Please log in again.');
        await supabase.auth.signOut();
        window.location.href = '/login';
        return;
      }

      toast.success('Exited impersonation mode');
      window.location.href = '/admin/panel';

    } catch (error) {
      console.error('Exit impersonation error:', error);
      toast.error('Failed to exit impersonation');
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
  };

  const isSuperAdmin = roles.includes('super_admin');
  const isAgencyAdmin = roles.includes('agency_admin');
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
