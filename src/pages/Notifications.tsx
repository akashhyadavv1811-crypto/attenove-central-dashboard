import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  type ApiNotification,
  type NotificationDisplayType,
} from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const PAGE_SIZE = 15;

const ICON_MAP: Record<NotificationDisplayType, { Icon: typeof Info; bg: string; color: string }> = {
  info: { Icon: Info, bg: "bg-blue-100 dark:bg-blue-500/20", color: "text-blue-600 dark:text-blue-300" },
  success: { Icon: CheckCircle2, bg: "bg-emerald-100 dark:bg-emerald-500/20", color: "text-emerald-600 dark:text-emerald-300" },
  warning: { Icon: AlertCircle, bg: "bg-amber-100 dark:bg-amber-500/20", color: "text-amber-600 dark:text-amber-300" },
};

function formatTime(createdAt: string | null): string {
  if (!createdAt) return "";
  try {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  } catch {
    return "";
  }
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterRead, setFilterRead] = useState<boolean | "all">("all");
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params: { page: number; page_size: number; is_read?: boolean } = {
        page,
        page_size: PAGE_SIZE,
      };
      if (filterRead !== "all") params.is_read = filterRead;
      const res = await fetchNotifications(params);
      setNotifications(res.notifications);
      setTotal(res.total);
    } catch {
      setNotifications([]);
      setTotal(0);
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [page, filterRead]);

  const loadUnreadCount = useCallback(async () => {
    const count = await fetchUnreadNotificationCount();
    setUnreadCount(count);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleMarkRead = async (n: ApiNotification) => {
    if (n.is_read) return;
    try {
      await markNotificationRead(n.id);
      loadNotifications();
      loadUnreadCount();
    } catch {
      toast.error("Failed to mark as read.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const updated = await markAllNotificationsRead();
      if (updated > 0) {
        loadNotifications();
        loadUnreadCount();
        toast.success(`Marked ${updated} notification(s) as read.`);
      }
    } catch {
      toast.error("Failed to mark all as read.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              View and manage your notifications
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        <div className="widget-card mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Select
              value={filterRead === "all" ? "all" : filterRead ? "read" : "unread"}
              onValueChange={(v) => {
                setFilterRead(v === "all" ? "all" : v === "read");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="widget-card">
          <div className="divide-y divide-border">
            {loading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => {
                const iconKey = (n.display_type ?? "info") as NotificationDisplayType;
                const { Icon, bg, color } = ICON_MAP[iconKey] ?? ICON_MAP.info;
                return (
                  <button
                    key={n.id}
                    type="button"
                    className={cn(
                      "w-full text-left flex gap-4 px-4 py-4 transition-colors hover:bg-muted/50 focus:outline-none focus:bg-muted/50",
                      !n.is_read && "bg-primary/5"
                    )}
                    onClick={() => handleMarkRead(n)}
                  >
                    <div className={cn("flex-shrink-0 p-2 rounded-lg", bg)}>
                      <Icon className={cn("w-5 h-5", color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-medium text-foreground", !n.is_read && "font-semibold")}>
                        {n.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                      <p className="text-xs text-muted-foreground/80 mt-2">{formatTime(n.created_at)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages} · {total} total
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;
