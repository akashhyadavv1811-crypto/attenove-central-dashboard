import { Bell, Settings, LayoutDashboard, Users, Building2, Clock, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Employees", icon: Users, active: false },
  { label: "Organizations", icon: Building2, active: false },
  { label: "Shifts", icon: Clock, active: false },
  { label: "Reports", icon: FileText, active: false },
];

export function Header() {
  return (
    <header className="bg-primary px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo and Nav */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-primary-foreground font-semibold text-lg">Attenove</span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all
                  ${item.active 
                    ? "bg-accent text-accent-foreground" 
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-accent/50"
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-accent/50"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-accent/50"
          >
            <Bell className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3 pl-4 border-l border-accent">
            <Avatar className="w-9 h-9">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>
            <div className="text-right">
              <p className="text-sm font-medium text-primary-foreground">Arun Kumar</p>
              <p className="text-xs text-primary-foreground/60">HR Manager</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
