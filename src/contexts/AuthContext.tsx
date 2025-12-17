import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'user' | 'approver' | 'super_admin';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profileData.tenant_id)
        .single();

      if (tenantData) {
        setTenant(tenantData as Tenant);
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

      // Update last login
      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
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

  const isSuperAdmin = roles.includes('super_admin');
  const isAdmin = roles.includes('admin') || isSuperAdmin;
  const isApprover = roles.includes('approver') || roles.includes('admin') || isSuperAdmin;
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
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}
