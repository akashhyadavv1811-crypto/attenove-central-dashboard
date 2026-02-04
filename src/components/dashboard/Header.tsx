import { Bell, Settings, LayoutDashboard, Users, Building2, Clock, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Employees", icon: Users, path: "/employees" },
  { label: "Organizations", icon: Building2, path: "/organizations" },
  { label: "Shifts", icon: Clock, path: "/shifts" },
  { label: "Reports", icon: FileText, path: "/reports" },
];

export function Header() {
  const location = useLocation();
  
  return (
    <header className="px-6 py-2.5 bg-primary">
      <div className="flex items-center justify-between">
        {/* Logo and Nav */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-base">Attenove</span>
          </div>

          <nav className="flex items-center gap-0.5">
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
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white/70 hover:text-white hover:bg-accent/50 h-8 w-8"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white/70 hover:text-white hover:bg-accent/50 h-8 w-8"
          >
            <Bell className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2.5 pl-3 border-l border-accent">
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>
            <div className="text-right">
              <p className="text-sm font-medium text-white leading-tight">Arun Kumar</p>
              <p className="text-[11px] text-white/60">HR Manager</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
