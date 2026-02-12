import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import attenovaLogo from "@/assets/attenova-logo.png";
import loginBg from "@/assets/login-bg.jpg";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isRestored } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  if (isRestored && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your email and password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding with Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <img 
          src={loginBg} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
        
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6 z-10">
          <div className="flex items-center gap-3">
            <img src={attenovaLogo} alt="Attenova" className="w-14 h-14 object-contain" />
            <span className="font-brand text-white font-semibold text-2xl tracking-tight">Attenova</span>
          </div>
          <Link 
            to="/" 
            className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors"
          >
            ← Back to Website
          </Link>
        </div>
        
        {/* Content - positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-12 pb-16 z-10">
          {/* Main heading */}
          <h2 className="text-white text-3xl xl:text-4xl font-semibold tracking-tight leading-tight mb-4">
            Track Smarter. Manage Easier.<br />
            Stay in Control.
          </h2>
          
          {/* Subtitle */}
          <p className="text-white/70 text-base max-w-lg leading-relaxed">
            From clock-in to reports, Attenova helps you manage attendance, shifts, 
            and workforce—all in one place, on any device.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-8 py-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <img src={attenovaLogo} alt="Attenova" className="w-10 h-10 object-contain" />
            <span className="text-foreground font-semibold text-lg">Attenova</span>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back!</h2>
            <p className="text-muted-foreground text-sm">
              Log in to start managing attendance with ease.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-background border-border text-sm"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-background border-border text-sm"
                required
              />
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="h-4 w-4"
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm text-muted-foreground cursor-pointer font-normal"
                >
                  Remember Me
                </Label>
              </div>
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              className="w-full h-11 text-sm font-semibold mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default Login;
