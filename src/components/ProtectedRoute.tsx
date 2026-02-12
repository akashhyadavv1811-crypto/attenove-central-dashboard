import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

/**
 * Renders children only when the user is authenticated.
 * - While session is restoring (token exists but user not yet fetched), shows a loading state.
 * - If no token or /api/auth/me/ returned 401, redirects to /login with return URL in state.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, user, isLoading, isRestored } = useAuth();
  const location = useLocation();

  if (!isRestored || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  const isAuthenticated = Boolean(token && user);
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
