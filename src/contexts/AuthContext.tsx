import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import persistLogo from '@/assets/persist-logo.png';

const DEFAULT_PASSWORD = 'persist2024';
const PASSWORD_STORAGE_KEY = 'persist_app_password';
const AUTH_STORAGE_KEY = 'persist_app_authenticated';

export const getAppPassword = (): string => {
  return localStorage.getItem(PASSWORD_STORAGE_KEY) || DEFAULT_PASSWORD;
};

export const setAppPassword = (newPassword: string): void => {
  localStorage.setItem(PASSWORD_STORAGE_KEY, newPassword);
};

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handlePasswordSubmit = () => {
    if (passwordInput === getAppPassword()) {
      setIsAuthenticated(true);
      setPasswordError(false);
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } else {
      setPasswordError(true);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <img src={persistLogo} alt="PERSIST" className="h-16 w-auto mx-auto mb-4" />
            <p className="text-muted-foreground">
              AI-Powered Message Intelligence for Higher Education
            </p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-2">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="font-serif">Access Required</CardTitle>
              <CardDescription>
                Enter the application password to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-password">Password</Label>
                <Input
                  id="app-password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  placeholder="Enter password"
                  className={passwordError ? 'border-destructive' : ''}
                />
                {passwordError && (
                  <p className="text-sm text-destructive">Incorrect password. Please try again.</p>
                )}
              </div>
              <Button onClick={handlePasswordSubmit} className="w-full">
                Access PERSIST
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            © 2024 PERSIST. Research-grounded messaging intelligence.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
