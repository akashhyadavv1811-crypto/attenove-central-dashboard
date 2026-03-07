import { useTheme } from "@/contexts/ThemeContext";

const statuses = [
  { label: "Permanent",  count: 180, light: "#2a5bb5", dark: "hsl(213 90% 62%)" },
  { label: "Contract",   count: 35,  light: "#18a974", dark: "hsl(162 72% 48%)" },
  { label: "Temporary",  count: 18,  light: "#7c4fd4", dark: "hsl(262 78% 68%)" },
  { label: "Interns",    count: 15,  light: "#e08a10", dark: "hsl(38 98% 58%)"  },
];

const total = statuses.reduce((a, s) => a + s.count, 0);

export function EmploymentStatus() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // SVG donut
  const cx = 60, cy = 60, r = 48;
  const circumference = 2 * Math.PI * r;
  let cumulativePct = 0;
  const segments = statuses.map((s) => {
    const pct = s.count / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const offset = circumference - cumulativePct * circumference;
    cumulativePct += pct;
    return { ...s, dash, gap, offset };
  });

  return (
    <div className="widget-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground text-sm">Staff Mix</h3>
        <span className="text-xs text-muted-foreground">Total: <strong className="text-foreground">{total}</strong></span>
      </div>

      <div className="flex items-center gap-5">
        {/* Donut chart */}
        <div className="relative flex-shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* Track */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"} strokeWidth="16" />
            {/* Segments */}
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={isDark ? seg.dark : seg.light}
                strokeWidth="16"
                strokeDasharray={`${seg.dash} ${seg.gap}`}
                strokeDashoffset={seg.offset}
                strokeLinecap="butt"
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
            ))}
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-foreground">{total}</span>
            <span className="text-[10px] text-muted-foreground">total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {statuses.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: isDark ? s.dark : s.light }} />
                <span className="text-xs text-foreground">{s.label}</span>
              </div>
              <span className="text-xs font-semibold text-foreground">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
