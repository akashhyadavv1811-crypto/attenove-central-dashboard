import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Settings,
  LogOut,
  LayoutDashboard,
  Users,
  Building2,
  Building,
  BarChart3,
  Shield,
  Clock,
  ChevronDown,
  Menu,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AttenovaLogo from "@/assets/Attenova-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// ─── Nav structure ──────────────────────────────────────────────────────────

type SubItem = {
  label: string;
  description: string;
  path: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
};

type NavGroup = {
  label: string;
  icon: React.ElementType;
  path?: string;           // direct link (no dropdown)
  items?: SubItem[];       // dropdown items
};

const navGroups: NavGroup[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    label: "Organization",
    icon: Building2,
    items: [
      {
        label: "Organizations",
        description: "Manage companies & clients",
        icon: Building2,
        path: "/organizations",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        label: "Offices",
        description: "Offices, locations & devices",
        icon: Building,
        path: "/offices",
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
      },
    ],
  },
  {
    label: "Workforce",
    icon: Users,
    items: [
      {
        label: "Employees",
        description: "Profiles, records & attendance",
        icon: Users,
        path: "/employees",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
      },
      {
        label: "Shifts",
        description: "Shift schedules & timings",
        icon: Clock,
        path: "/shifts",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
      },
    ],
  },
  {
    label: "Reports",
    icon: BarChart3,
    path: "/reports",
  },
  {
    label: "Admin",
    icon: Shield,
    items: [
      {
        label: "Access Control",
        description: "Roles, permissions & users",
        icon: Shield,
        path: "/access-control",
        iconBg: "bg-rose-100",
        iconColor: "text-rose-600",
      },
    ],
  },
];

function isGroupActive(group: NavGroup, pathname: string): boolean {
  if (group.path) return pathname === group.path;
  return group.items?.some((item) => pathname === item.path) ?? false;
}

// ─── Notifications (placeholder – wire to API later) ────────────────────────

type NotificationItem = {
  id: string;
  type: "info" | "success" | "warning";
  title: string;
  message: string;
  time: string;
  unread?: boolean;
};

const NOTIFICATION_ICON = {
  info: { Icon: Info, bg: "bg-blue-100", color: "text-blue-600" },
  success: { Icon: CheckCircle2, bg: "bg-emerald-100", color: "text-emerald-600" },
  warning: { Icon: AlertCircle, bg: "bg-amber-100", color: "text-amber-600" },
};

// Placeholder list – replace with API/context when backend is ready
const placeholderNotifications: NotificationItem[] = [
  {
    id: "1",
    type: "success",
    title: "Report ready",
    message: "Monthly attendance report for January is ready to download.",
    time: "2 min ago",
    unread: true,
  },
  {
    id: "2",
    type: "info",
    title: "System update",
    message: "Attenova was updated. No action required.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: "3",
    type: "warning",
    title: "Shift reminder",
    message: "Evening shift starts in 30 minutes.",
    time: "Yesterday",
    unread: false,
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpandedGroups, setMobileExpandedGroups] = useState<Set<string>>(new Set());

  const displayName = user?.name ?? "User";
  const initials = displayName.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U";
  const roleLabel = (user?.role ?? "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
    setMobileOpen(false);
  };

  const toggleMobileGroup = (label: string) => {
    setMobileExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-lg">
      {/* subtle inner highlight line */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />

      <div className="px-4 md:px-6 flex items-center justify-between h-14">

        {/* ── Left: Logo + Desktop Nav ── */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 select-none flex-shrink-0">
            <img src={AttenovaLogo} alt="Attenova" className="w-9 h-9 object-contain" />
            <span className="text-white font-bold text-lg tracking-tight hidden sm:block">
              Attenova
            </span>
          </Link>

          {/* Divider */}
          <div className="hidden lg:block w-px h-5 bg-white/15" />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navGroups.map((group) => {
              const active = isGroupActive(group, location.pathname);

              /* — Direct link — */
              if (group.path) {
                return (
                  <Link key={group.label} to={group.path}>
                    <button
                      className={cn(
                        "group relative flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-150 outline-none select-none",
                        active
                          ? "text-white bg-white/15"
                          : "text-white/65 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <group.icon className="w-4 h-4 flex-shrink-0" />
                      {group.label}
                    </button>
                  </Link>
                );
              }

              /* — Dropdown group — */
              return (
                <DropdownMenu key={group.label}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "group relative flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-150 outline-none select-none",
                        active
                          ? "text-white bg-white/15"
                          : "text-white/65 hover:text-white hover:bg-white/10",
                        "data-[state=open]:text-white data-[state=open]:bg-white/15"
                      )}
                    >
                      <group.icon className="w-4 h-4 flex-shrink-0" />
                      {group.label}
                      <ChevronDown className="w-3 h-3 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="start"
                    sideOffset={10}
                    className="w-60 p-1.5 rounded-xl border-0 shadow-2xl bg-white ring-1 ring-slate-900/8"
                  >
                    {/* Dropdown header label */}
                    

                    {group.items?.map((item) => {
                      const itemActive = location.pathname === item.path;
                      return (
                        <DropdownMenuItem
                          key={item.path}
                          asChild
                          className="p-0 focus:bg-transparent rounded-lg"
                        >
                          <Link
                            to={item.path}
                            className={cn(
                              "flex items-start gap-3 px-2.5 py-2.5 rounded-lg cursor-pointer transition-colors",
                              itemActive
                                ? "bg-primary/8 hover:bg-primary/12"
                                : "hover:bg-slate-50"
                            )}
                          >
                            <div className={cn("mt-0.5 p-1.5 rounded-lg flex-shrink-0", item.iconBg)}>
                              <item.icon className={cn("w-4 h-4", item.iconColor)} />
                            </div>
                            <div className="min-w-0">
                              <p className={cn(
                                "text-sm font-medium leading-tight",
                                itemActive ? "text-primary" : "text-slate-800"
                              )}>
                                {item.label}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </nav>
        </div>

        {/* ── Right: Actions + User ── */}
        <div className="flex items-center gap-1">

          {/* Notification bell – opens dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex relative text-white/60 hover:text-white hover:bg-white/10 h-9 w-9 rounded-lg"
              >
                <Bell className="w-4 h-4" />
                {placeholderNotifications.some((n) => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-primary" aria-hidden />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-80 p-0 rounded-xl border-0 shadow-2xl bg-white ring-1 ring-slate-900/8 overflow-hidden"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
                <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                {placeholderNotifications.some((n) => n.unread) && (
                  <span className="text-xs font-medium text-slate-500">
                    {placeholderNotifications.filter((n) => n.unread).length} new
                  </span>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {placeholderNotifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    No notifications yet.
                  </div>
                ) : (
                  placeholderNotifications.map((n) => {
                    const { Icon, bg, color } = NOTIFICATION_ICON[n.type];
                    return (
                      <div
                        key={n.id}
                        className={cn(
                          "flex gap-3 px-4 py-3 border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/80",
                          n.unread && "bg-primary/[0.03]"
                        )}
                      >
                        <div className={cn("flex-shrink-0 p-1.5 rounded-lg", bg)}>
                          <Icon className={cn("w-4 h-4", color)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn("text-sm font-medium text-slate-800", n.unread && "font-semibold")}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[11px] text-slate-400 mt-1">{n.time}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  className="w-full py-2 text-center text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  View all notifications
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Vertical divider */}
          <div className="hidden md:block w-px h-5 bg-white/15 mx-1" />

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex items-center gap-2.5 pl-1 pr-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors outline-none">
                <Avatar className="w-8 h-8 ring-2 ring-white/20 flex-shrink-0">
                  <AvatarFallback className="bg-white/20 text-white text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden xl:block text-left leading-tight">
                  <p className="text-sm font-semibold text-white">{displayName}</p>
                  <p className="text-[11px] text-white/50">{roleLabel}</p>
                </div>
                <ChevronDown className="hidden xl:block w-3.5 h-3.5 text-white/40 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-56 p-1.5 rounded-xl border-0 shadow-2xl bg-white ring-1 ring-slate-900/8"
            >
              {/* Profile header */}
              <div className="flex items-center gap-3 px-3 py-2.5 mb-1 bg-slate-50 rounded-lg">
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{roleLabel}</p>
                </div>
              </div>

              <DropdownMenuItem className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer text-slate-700 hover:bg-slate-50 hover:text-slate-800 focus:bg-slate-50 focus:text-slate-800 transition-colors">
                <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-focus:text-slate-600 flex-shrink-0" />
                <span className="text-sm">Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-slate-100" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white hover:bg-white/10 h-9 w-9 rounded-lg ml-0.5"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-72 p-0 flex flex-col bg-white border-r border-slate-200">
              {/* Mobile sheet header */}
              <div className="flex items-center gap-2.5 px-5 h-14 flex-shrink-0 bg-primary">
                <img src={AttenovaLogo} alt="Attenova" className="w-8 h-8 object-contain" />
                <span className="text-white font-bold text-lg tracking-tight">Attenova</span>
              </div>

              {/* User info */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                <Avatar className="w-10 h-10 ring-2 ring-primary/15 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{roleLabel}</p>
                </div>
              </div>

              {/* Nav items */}
              <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
                {navGroups.map((group) => {
                  const active = isGroupActive(group, location.pathname);
                  const isExpanded = mobileExpandedGroups.has(group.label);

                  if (group.path) {
                    return (
                      <Link
                        key={group.label}
                        to={group.path}
                        onClick={() => setMobileOpen(false)}
                      >
                        <div className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                          active
                            ? "bg-primary text-white shadow-sm shadow-primary/20"
                            : "text-slate-700 hover:bg-slate-100"
                        )}>
                          <group.icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-white" : "text-slate-500")} />
                          {group.label}
                        </div>
                      </Link>
                    );
                  }

                  return (
                    <div key={group.label}>
                      <button
                        onClick={() => toggleMobileGroup(group.label)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                          active
                            ? "text-primary bg-primary/8"
                            : "text-slate-700 hover:bg-slate-100"
                        )}
                      >
                        <group.icon className={cn(
                          "w-4 h-4 flex-shrink-0",
                          active ? "text-primary" : "text-slate-400"
                        )} />
                        <span className="flex-1 text-left">{group.label}</span>
                        <ChevronDown className={cn(
                          "w-4 h-4 transition-transform duration-200 flex-shrink-0",
                          active ? "text-primary" : "text-slate-400",
                          isExpanded && "rotate-180"
                        )} />
                      </button>

                      {isExpanded && (
                        <div className="mt-0.5 ml-3 pl-4 border-l-2 border-slate-100 space-y-0.5 pb-1">
                          {group.items?.map((item) => {
                            const itemActive = location.pathname === item.path;
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                              >
                                <div className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer",
                                  itemActive
                                    ? "bg-primary text-white font-medium shadow-sm shadow-primary/20"
                                    : "text-slate-600 hover:bg-slate-100"
                                )}>
                                  <div className={cn("p-1 rounded-md flex-shrink-0", item.iconBg)}>
                                    <item.icon className={cn("w-3.5 h-3.5", itemActive ? "text-white" : item.iconColor)} />
                                  </div>
                                  {item.label}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Bottom actions */}
              <div className="flex-shrink-0 px-3 pb-5 pt-3 border-t border-slate-100 space-y-0.5">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                  <Bell className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  Notifications
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                  <Settings className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  Log out
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
