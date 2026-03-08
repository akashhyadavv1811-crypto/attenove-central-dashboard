import { useState, useEffect, useCallback } from "react";
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
  Sun,
  Moon,
  Fingerprint,
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
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationRead,
  type ApiNotification,
} from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

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
      {
        label: "Biometric Devices",
        description: "Manage biometric devices per office",
        icon: Fingerprint,
        path: "/biometric-devices",
        iconBg: "bg-violet-100",
        iconColor: "text-violet-600",
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

// ─── Notifications (dynamic from API – display_type comes from backend) ───────

type IconType = "info" | "success" | "warning";

const NOTIFICATION_ICON: Record<IconType, { Icon: typeof Info; bg: string; color: string }> = {
  info: { Icon: Info, bg: "bg-blue-100 dark:bg-blue-500/20", color: "text-blue-600 dark:text-blue-300" },
  success: { Icon: CheckCircle2, bg: "bg-emerald-100 dark:bg-emerald-500/20", color: "text-emerald-600 dark:text-emerald-300" },
  warning: { Icon: AlertCircle, bg: "bg-amber-100 dark:bg-amber-500/20", color: "text-amber-600 dark:text-amber-300" },
};

function formatNotificationTime(createdAt: string | null): string {
  if (!createdAt) return "";
  try {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  } catch {
    return "";
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpandedGroups, setMobileExpandedGroups] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const loadUnreadCount = useCallback(async () => {
    const count = await fetchUnreadNotificationCount();
    setUnreadCount(count);
  }, []);

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const res = await fetchNotifications({ page_size: 20, is_read: false });
      setNotifications(res.notifications);
    } catch {
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadUnreadCount();
  }, [user, loadUnreadCount]);

  useEffect(() => {
    if (notificationOpen && user) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [notificationOpen, user, loadNotifications, loadUnreadCount]);

  const handleMarkReadAndRemove = async (e: React.MouseEvent, n: ApiNotification) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await markNotificationRead(n.id);
      setNotifications((prev) => prev.filter((x) => x.id !== n.id));
      if (!n.is_read) setUnreadCount((c) => Math.max(0, c - 1));
      toast.success("Marked as read");
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const displayName = user?.name ?? "User";
  const initials = displayName.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U";
  const roleLabel = (user?.role ?? "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  const isDark = theme === "dark";

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
    <header
      className={cn(
        "sticky top-0 z-50 shadow-lg",
        isDark
          ? "bg-card border-b border-border"
          : "bg-primary"
      )}
    >
      {/* subtle inner highlight line */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px",
          isDark ? "bg-white/5" : "bg-white/10"
        )}
      />

      <div className="px-4 md:px-6 flex items-center justify-between h-14">

        {/* ── Left: Logo + Desktop Nav ── */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 select-none flex-shrink-0">
            <img src={AttenovaLogo} alt="Attenova" className="w-9 h-9 object-contain" />
            <span className="flex items-baseline gap-0.5 hidden sm:flex">
              <span
                className={cn(
                  "font-bold text-lg tracking-tight",
                  isDark ? "text-foreground" : "text-white"
                )}
              >
                Atten
              </span>
              <span className="font-bold text-lg tracking-tight text-[hsl(199,89%,48%)]">ova</span>
            </span>
          </Link>

          {/* Divider */}
          <div
            className={cn(
              "hidden lg:block w-px h-5",
              isDark ? "bg-border" : "bg-white/15"
            )}
          />

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
                          ? isDark
                            ? "text-primary bg-primary/20"
                            : "text-white bg-white/15"
                          : isDark
                            ? "text-muted-foreground hover:text-foreground hover:bg-muted"
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
                          ? isDark
                            ? "text-primary bg-primary/20"
                            : "text-white bg-white/15"
                          : isDark
                            ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                            : "text-white/65 hover:text-white hover:bg-white/10",
                        isDark
                          ? "data-[state=open]:text-primary data-[state=open]:bg-primary/20"
                          : "data-[state=open]:text-white data-[state=open]:bg-white/15"
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
                    className="w-60 p-1.5 rounded-xl border border-border shadow-2xl bg-popover text-popover-foreground"
                  >
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
                                ? "bg-primary/10 hover:bg-primary/15"
                                : "hover:bg-muted"
                            )}
                          >
                            <div className={cn("mt-0.5 p-1.5 rounded-lg flex-shrink-0", item.iconBg)}>
                              <item.icon className={cn("w-4 h-4", item.iconColor)} />
                            </div>
                            <div className="min-w-0">
                              <p className={cn(
                                "text-sm font-medium leading-tight",
                                itemActive ? "text-primary" : "text-foreground"
                              )}>
                                {item.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
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

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={cn(
              "hidden md:flex h-9 w-9 rounded-lg",
              isDark
                ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Notification bell – opens dropdown, fetches from API */}
          <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "hidden md:flex relative h-9 w-9 rounded-lg",
                  isDark
                    ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className={cn("absolute top-1.5 right-1.5 min-w-[8px] h-4 px-1 flex items-center justify-center text-[10px] font-bold bg-rose-500 text-white rounded-full ring-2", isDark ? "ring-card" : "ring-primary")} aria-hidden>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-80 p-0 rounded-xl border border-border shadow-2xl bg-popover text-popover-foreground overflow-hidden"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto scrollbar-modal">
                {notificationsLoading ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Loading…
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const iconKey = (n.display_type ?? "info") as IconType;
                    const { Icon, bg, color } = NOTIFICATION_ICON[iconKey] ?? NOTIFICATION_ICON.info;
                    return (
                      <div
                        key={n.id}
                        className={cn(
                          "w-full text-left flex gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors hover:bg-muted/50",
                          !n.is_read && "bg-primary/5"
                        )}
                      >
                        <div className={cn("flex-shrink-0 p-1.5 rounded-lg", bg)}>
                          <Icon className={cn("w-4 h-4", color)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn("text-sm font-medium text-foreground", !n.is_read && "font-semibold")}>
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[11px] text-muted-foreground/80 mt-1">{formatNotificationTime(n.created_at)}</p>
                          <button
                            type="button"
                            onClick={(e) => handleMarkReadAndRemove(e, n)}
                            className="text-xs font-medium text-primary hover:text-primary/80 hover:underline mt-1.5 focus:outline-none"
                          >
                            Mark read
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="px-4 py-2 border-t border-border bg-muted/30">
                <Link
                  to="/notifications"
                  className="block w-full py-2 text-center text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  onClick={() => setNotificationOpen(false)}
                >
                  View all notifications
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Vertical divider */}
          <div className={cn("hidden md:block w-px h-5 mx-1", isDark ? "bg-border" : "bg-white/15")} />

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "group flex items-center gap-2.5 pl-1 pr-2.5 py-1.5 rounded-lg transition-colors outline-none",
                  isDark ? "hover:bg-muted" : "hover:bg-white/10"
                )}
              >
                <Avatar className={cn("w-8 h-8 ring-2 flex-shrink-0", isDark ? "ring-border" : "ring-white/20")}>
                  <AvatarFallback
                    className={cn(
                      "text-xs font-semibold",
                      isDark ? "bg-primary/20 text-primary" : "bg-white/20 text-white"
                    )}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden xl:block text-left leading-tight">
                  <p className={cn("text-sm font-semibold", isDark ? "text-foreground" : "text-white")}>{displayName}</p>
                  <p className={cn("text-[11px]", isDark ? "text-muted-foreground" : "text-white/50")}>{roleLabel}</p>
                </div>
                <ChevronDown className={cn("hidden xl:block w-3.5 h-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180", isDark ? "text-muted-foreground" : "text-white/40")} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-56 p-1.5 rounded-xl border border-border shadow-2xl bg-popover text-popover-foreground"
            >
              {/* Profile header */}
              <div className="flex items-center gap-3 px-3 py-2.5 mb-1 bg-muted/50 rounded-lg">
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>
                </div>
              </div>

              <DropdownMenuItem className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer text-foreground hover:bg-muted focus:bg-muted transition-colors">
                <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-focus:text-foreground flex-shrink-0" />
                <span className="text-sm">Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-border" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive hover:bg-destructive/10 transition-colors"
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
                className={cn(
                  "lg:hidden h-9 w-9 rounded-lg ml-0.5",
                  isDark
                    ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                    : "text-white hover:bg-white/10"
                )}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="top"
              className={cn(
                "inset-x-0 border-b p-0 flex flex-col max-h-[80vh] rounded-b-3xl backdrop-blur-xl",
                isDark
                  ? "border-border bg-card text-foreground shadow-[0_24px_60px_rgba(15,23,42,0.9)]"
                  : "border-slate-200 bg-background text-slate-900 shadow-[0_24px_60px_rgba(0,0,0,0.12)]"
              )}
            >
              {/* Mobile sheet header */}
              <div
                className={cn(
                  "flex items-center justify-between gap-3 px-5 h-14 flex-shrink-0",
                  isDark ? "bg-card" : "bg-primary"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <img src={AttenovaLogo} alt="Attenova" className="w-8 h-8 object-contain drop-shadow" />
                  <div className="leading-tight">
                    <span className="flex items-baseline gap-0.5">
                      <span className="font-bold text-lg tracking-tight text-white">Atten</span>
                      <span className="font-bold text-lg tracking-tight text-[hsl(199,89%,48%)]">ova</span>
                    </span>
                    <span className="block text-[11px] text-white/70">
                      Workspace Navigator
                    </span>
                  </div>
                </div>
              </div>

              {/* Nav items */}
              <nav
                className={cn(
                  "flex-1 overflow-y-auto px-3 py-3 space-y-1",
                  isDark ? "bg-background" : "bg-slate-50/80"
                )}
              >
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
                        <div
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors cursor-pointer border border-transparent",
                            active
                              ? isDark
                                ? "bg-muted text-foreground border-border shadow-sm"
                                : "bg-white text-primary shadow-sm border-primary/40"
                              : isDark
                                ? "text-slate-200/90 hover:text-white hover:bg-slate-800/80 hover:border-slate-700/70"
                                : "text-slate-700 hover:text-slate-900 hover:bg-white hover:border-slate-200 hover:shadow-sm"
                          )}
                        >
                          <group.icon
                          className={cn(
                            "w-4 h-4 flex-shrink-0",
                            active ? (isDark ? "text-primary" : "text-primary") : isDark ? "text-slate-400" : "text-slate-500"
                          )}
                          />
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
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors border border-transparent",
                          active
                            ? isDark
                              ? "bg-muted text-foreground border-border"
                              : "bg-primary/5 text-primary border-primary/40"
                            : isDark
                              ? "text-slate-200/90 hover:text-white hover:bg-slate-800/80 hover:border-slate-700/70"
                              : "text-slate-700 hover:text-slate-900 hover:bg-white hover:border-slate-200 hover:shadow-sm"
                        )}
                      >
                        <group.icon
                          className={cn(
                            "w-4 h-4 flex-shrink-0",
                            active ? "text-primary" : isDark ? "text-slate-400" : "text-slate-500"
                          )}
                        />
                        <span className="flex-1 text-left">{group.label}</span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform duration-200 flex-shrink-0",
                            active ? "text-primary" : isDark ? "text-slate-400" : "text-slate-500",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>

                      {isExpanded && (
                        <div className={cn("mt-0.5 ml-3 pl-4 border-l space-y-0.5 pb-1", isDark ? "border-slate-700/70" : "border-slate-200")}>
                          {group.items?.map((item) => {
                            const itemActive = location.pathname === item.path;
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                              >
                                <div
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-colors cursor-pointer",
                                    itemActive
                                      ? isDark
                                        ? "bg-muted text-foreground border border-border font-medium"
                                        : "bg-white text-primary font-medium border border-primary/40 shadow-sm"
                                      : isDark
                                        ? "text-slate-300 hover:text-white hover:bg-slate-800/80"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-sm"
                                  )}
                                >
                                  <div className={cn("p-1 rounded-md flex-shrink-0", item.iconBg)}>
                                    <item.icon
                                      className={cn(
                                        "w-3.5 h-3.5",
                                        itemActive ? "text-white" : item.iconColor
                                      )}
                                    />
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
              <div
                className={cn(
                  "flex-shrink-0 px-3 pb-5 pt-3 border-t space-y-0.5",
                  isDark ? "border-slate-800/80 bg-slate-950/95" : "border-slate-100 bg-white"
                )}
              >
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors",
                    isDark ? "text-slate-200 hover:text-white hover:bg-slate-800/80" : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <Bell className={cn("w-4 h-4 flex-shrink-0", isDark ? "text-slate-400" : "text-slate-500")} />
                  Notifications
                </button>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors",
                    isDark ? "text-slate-200 hover:text-white hover:bg-slate-800/80" : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <Settings className={cn("w-4 h-4 text-slate-400 flex-shrink-0", !isDark && "text-slate-500")} />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors",
                    isDark ? "text-rose-400 hover:text-rose-100 hover:bg-rose-900/40" : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  )}
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
