import { Calendar, ArrowUpRight, Users, UserCheck, UserPlus, UserMinus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const stats = [
  { icon: Users,     value: "1,310", label: "Total Workforce",  change: "+3.7%", positive: true  },
  { icon: UserCheck, value: "1,244", label: "Active Today",     change: "+5.0%", positive: true  },
  { icon: UserPlus,  value: "48",    label: "New Hires",        change: "-1.7%", positive: false },
  { icon: UserMinus, value: "12",    label: "Resignations",     change: "-1.2%", positive: false },
];

export function HeroSection() {
  const { user } = useAuth();
  const { theme } = useTheme();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const displayName = user?.name?.split(" ")[0] ?? "User";
  const isDark = theme === "dark";

  return (
    <section className="relative">
      {/* ── Hero banner ── */}
      <div
        className="relative overflow-hidden pb-20"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #0a0f1e 0%, #0d1530 50%, #0a1628 100%)"
            : "linear-gradient(135deg, hsl(220 60% 25%) 0%, hsl(210 55% 30%) 100%)",
        }}
      >
        {/* Decorative radial blobs */}
        <div className="absolute pointer-events-none" style={{ top: "-40%", right: "-5%", width: "60%", height: "200%", background: isDark ? "radial-gradient(ellipse, rgba(59,158,255,0.12) 0%, transparent 65%)" : "radial-gradient(ellipse, rgba(100,160,220,0.3) 0%, transparent 65%)", transform: "rotate(-15deg)" }} />
        <div className="absolute pointer-events-none" style={{ top: "10%", right: "20%", width: "30%", height: "120%", background: isDark ? "radial-gradient(ellipse, rgba(24,223,162,0.07) 0%, transparent 60%)" : "radial-gradient(ellipse, rgba(140,190,240,0.2) 0%, transparent 60%)" }} />

        <div className="relative px-6 py-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            {/* Left: greeting + status */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Workspace Overview
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">
                {getGreeting()}, {displayName} 👋
              </h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="live-dot" />
                <span className="text-xs" style={{ color: isDark ? "rgba(24,223,162,0.9)" : "rgba(255,255,255,0.65)" }}>
                  System Status: Optimal
                </span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>·</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>
                  Last update: 2 mins ago
                </span>
              </div>
            </div>

            {/* Right: controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-white/20 text-white/75 hover:text-white hover:bg-white/10 h-9 px-3 text-xs"
              >
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                FY 2024
              </Button>
              <Button
                size="sm"
                className="h-9 px-4 text-xs font-semibold"
                style={{
                  background: isDark ? "rgba(59,158,255,0.9)" : "rgba(255,255,255,0.95)",
                  color: isDark ? "#fff" : "hsl(220 60% 25%)",
                }}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards overlapping the hero ── */}
      <div className="relative px-6 -mt-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="group cursor-pointer rounded-2xl p-4 border transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: isDark ? "rgba(15,21,37,0.95)" : "#fff",
                borderColor: isDark ? "rgba(59,158,255,0.15)" : "rgba(220,225,235,0.8)",
                boxShadow: isDark
                  ? "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,158,255,0.08)"
                  : "0 2px 12px rgba(30,60,120,0.08)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: isDark ? "rgba(59,158,255,0.15)" : "hsl(220 60% 25% / 0.1)",
                  }}
                >
                  <stat.icon className="w-4 h-4" style={{ color: isDark ? "hsl(213 90% 62%)" : "hsl(220 60% 25%)" }} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</span>
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: stat.positive
                      ? (isDark ? "rgba(24,223,162,0.15)" : "rgba(52,168,100,0.12)")
                      : (isDark ? "rgba(255,80,80,0.15)" : "rgba(220,40,40,0.1)"),
                    color: stat.positive
                      ? (isDark ? "hsl(162 72% 55%)" : "hsl(152 55% 38%)")
                      : (isDark ? "hsl(0 65% 60%)" : "hsl(0 72% 51%)"),
                  }}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
