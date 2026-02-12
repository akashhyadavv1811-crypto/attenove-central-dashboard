import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearToken,
  getCurrentUser,
  getToken,
  login as apiLogin,
  setToken,
  setUnauthorizedHandler,
  type ApiUser,
} from "@/lib/api";

type AuthState = {
  user: ApiUser | null;
  token: string | null;
  isLoading: boolean;
  isRestored: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState(true);
  const [isRestored, setIsRestored] = useState(false);

  const clearAuth = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearAuth);
    return () => setUnauthorizedHandler(null);
  }, [clearAuth]);

  useEffect(() => {
    const stored = getToken();
    if (!stored) {
      setIsLoading(false);
      setIsRestored(true);
      return;
    }
    setTokenState(stored);
    getCurrentUser()
      .then((u) => {
        setUser(u ?? null);
        if (!u) {
          clearAuth();
        }
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setIsLoading(false);
        setIsRestored(true);
      });
  }, [clearAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const { token: newToken, user: newUser } = await apiLogin(email, password);
    setToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isRestored,
      login,
      logout,
      isAuthenticated: Boolean(token && user),
    }),
    [user, token, isLoading, isRestored, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx == null) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
