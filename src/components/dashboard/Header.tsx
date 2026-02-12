import { Bell, Settings, LayoutDashboard, Users, Building2, Building, FileText, Menu, Shield, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import attenovaLogo from "@/assets/attenova-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { Clock } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Employees", icon: Users, path: "/employees" },
  { label: "Organizations", icon: Building2, path: "/organizations" },
  { label: "Offices", icon: Building, path: "/offices" },
  { label: "Shifts", icon: Clock, path: "/shifts" },
  { label: "Reports", icon: FileText, path: "/reports" },
  { label: "Access Control", icon: Shield, path: "/access-control" },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
    setOpen(false);
  };

  const displayName = user?.name ?? "User";
  const initials = displayName.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U";
  const roleLabel = user?.role ?? "User";

  return (
    <header className="px-4 md:px-6 py-2.5 bg-primary">
      <div className="flex items-center justify-between">
        {/* Logo and Nav */}
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <img src={attenovaLogo} alt="Attenova" className="w-16 h-16 object-contain -my-2" />
            <span className="text-white font-semibold text-[1.3rem]">Attenova</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.label} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`
                      flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all h-8
                      ${isActive 
                        ? "bg-accent text-white" 
                        : "text-white/70 hover:text-white hover:bg-accent/50"
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden xl:flex text-white/70 hover:text-white hover:bg-accent/50 h-8 w-8"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden xl:flex text-white/70 hover:text-white hover:bg-accent/50 h-8 w-8"
          >
            <Bell className="w-4 h-4" />
          </Button>
          <div className="hidden xl:flex items-center gap-2.5 pl-3 border-l border-accent">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-accent text-white text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-right">
              <p className="text-sm font-medium text-white leading-tight">{displayName}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-accent/50 h-8 ml-1"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-1" />
              Log out
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="xl:hidden text-white hover:bg-accent/50 h-8 w-8"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="bg-primary border-accent p-0">
              <div className="flex flex-col h-full">
                {/* User Info */}
                <div className="p-4 border-b border-accent">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-accent text-white">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white">{displayName}</p>
                      <p className="text-xs text-white/60">{roleLabel}</p>
                    </div>
                  </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 p-4 space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link 
                        key={item.label} 
                        to={item.path}
                        onClick={() => setOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className={`
                            w-full justify-start gap-3 px-3 py-2 text-sm font-medium transition-all
                            ${isActive 
                              ? "bg-accent text-white" 
                              : "text-white/70 hover:text-white hover:bg-accent/50"
                            }
                          `}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-accent space-y-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-accent/50"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-accent/50"
                  >
                    <Bell className="w-4 h-4" />
                    Notifications
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
