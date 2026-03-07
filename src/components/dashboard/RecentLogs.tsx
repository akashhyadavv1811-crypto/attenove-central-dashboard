import { useTheme } from "@/contexts/ThemeContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Maximize2 } from "lucide-react";

const logs = [
  { name: "Priya Sharma",  role: "SOFTWARE ENGINEER", time: "09:05:21", type: "LOG IN", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
  { name: "Rahul Verma",   role: "DEVOPS LEAD",       time: "09:12:45", type: "LOG IN", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
  { name: "Sneha Patel",   role: "UX STRATEGIST",     time: "09:18:03", type: "LOG IN", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
  { name: "Amit Singh",    role: "DIRECTOR",           time: "09:22:18", type: "LATE",   avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
];

export function RecentLogs() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cardBg    = isDark ? "rgba(255,255,255,0.04)"  : "rgba(0,0,0,0.03)";
  const cardBorder= isDark ? "rgba(255,255,255,0.08)"  : "rgba(0,0,0,0.08)";

  return (
    <div className="widget-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground tracking-wide">Real-time Biometric Activity</h3>
            <span className="live-dot" />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
            Processing 42 events per minute
          </p>
        </div>
        <Link to="/reports">
          <Maximize2 className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
        </Link>
      </div>

      {/* 2 × 2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {logs.map((log, i) => (
          <div
            key={i}
            className="rounded-xl p-3 flex items-center gap-3 transition-colors hover:brightness-110 cursor-pointer"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <Avatar className="w-10 h-10 flex-shrink-0 rounded-lg">
              <AvatarImage src={log.avatar} className="rounded-lg object-cover" />
              <AvatarFallback className="rounded-lg text-xs font-bold"
                style={{ background: isDark ? "rgba(59,158,255,0.2)" : "rgba(42,91,181,0.12)", color: isDark ? "hsl(213 90% 70%)" : "hsl(220 60% 35%)" }}>
                {log.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">{log.name}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide truncate mt-0.5">{log.role}</p>
              <div className="flex items-center justify-between mt-1.5">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{
                    background: log.type === "LATE"
                      ? (isDark ? "rgba(239,68,68,0.2)"  : "rgba(220,38,38,0.1)")
                      : (isDark ? "rgba(20,214,160,0.2)" : "rgba(16,185,129,0.1)"),
                    color: log.type === "LATE"
                      ? (isDark ? "#f87171" : "#dc2626")
                      : (isDark ? "#10dfa0" : "#059669"),
                  }}
                >
                  {log.type}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">{log.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
