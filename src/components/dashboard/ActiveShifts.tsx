import { useTheme } from "@/contexts/ThemeContext";

const shifts = [
  { name: "General Shift",  percent: 80, employees: 120, capacity: 150, colorDark: "#00e0c0", colorLight: "#0ea5e9" },
  { name: "Morning Shift",  percent: 72, employees: 85,  capacity: 118, colorDark: "#3b9eff", colorLight: "#6366f1" },
  { name: "Evening Shift",  percent: 45, employees: 43,  capacity: 96,  colorDark: "#a855f7", colorLight: "#a855f7" },
  { name: "Night Shift",    percent: 18, employees: 28,  capacity: 156, colorDark: "#f59e0b", colorLight: "#f59e0b" },
];

export function ActiveShifts({ className }: { className?: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const trackBg   = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const rowBg     = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)";
  const rowBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <div className={`widget-card${className ? ` ${className}` : ""}`}>
      <div className="mb-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Shift Load Distribution
        </h3>
      </div>

      <div className="space-y-2">
        {shifts.map((s, i) => {
          const color = isDark ? s.colorDark : s.colorLight;
          const glow  = isDark ? `0 0 8px ${s.colorDark}60` : "none";
          return (
            <div
              key={i}
              className="rounded-xl px-3 py-1.5"
              style={{ background: rowBg, border: `1px solid ${rowBorder}` }}
            >
              {/* Name + percent */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {s.name}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color, textShadow: isDark ? glow : "none" }}
                >
                  {s.percent}%
                </span>
              </div>
              {/* Progress bar */}
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: trackBg }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${s.percent}%`,
                    background: color,
                    boxShadow: isDark ? glow : "none",
                  }}
                />
              </div>
              {/* Staff count */}
              <p className="text-[10px] text-muted-foreground mt-1 text-right">
                {s.employees} / {s.capacity} staff
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
