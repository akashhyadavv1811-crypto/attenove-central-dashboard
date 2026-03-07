import { useTheme } from "@/contexts/ThemeContext";

const KPI_VALUE = 87;
const ACTIVE_SHIFTS = 4;
const PEAK_UTILIZATION = 94;

export function AttendanceKPI() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Conic-gradient approach: gives a true colour sweep around the arc
  const deg = KPI_VALUE * 3.6; // 87% → 313.2deg

  const gradientLight = `conic-gradient(
    from -90deg,
    #0ea5e9 0deg,
    #6366f1 ${deg * 0.6}deg,
    #a855f7 ${deg}deg,
    rgba(0,0,0,0.07) ${deg}deg
  )`;
  const gradientDark = `conic-gradient(
    from -90deg,
    #00e0c0 0deg,
    #3b9eff ${deg * 0.5}deg,
    #a855f7 ${deg}deg,
    rgba(255,255,255,0.06) ${deg}deg
  )`;

  const ringGlow = isDark
    ? "drop-shadow(0 0 10px rgba(0,224,192,0.45)) drop-shadow(0 0 20px rgba(59,158,255,0.3))"
    : "drop-shadow(0 0 6px rgba(14,165,233,0.35))";

  return (
    <div className="widget-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground tracking-wide">Efficiency KPI</h3>
        {/* three-dot placeholder */}
        <div className="flex gap-0.5">
          {[0,1,2].map(i => <span key={i} className="w-1 h-1 rounded-full bg-muted-foreground/60" />)}
        </div>
      </div>

      {/* Conic-gradient ring */}
      <div className="flex flex-col items-center py-4">
        <div className="relative" style={{ width: 160, height: 160 }}>
          {/* Ring via CSS conic + mask */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: isDark ? gradientDark : gradientLight,
              WebkitMaskImage: "radial-gradient(circle at center, transparent 55%, black 56%)",
              maskImage:        "radial-gradient(circle at center, transparent 55%, black 56%)",
              filter: ringGlow,
            }}
          />
          {/* Dark inner fill */}
          <div
            className="absolute rounded-full"
            style={{
              inset: "14px",
              background: isDark ? "hsl(222 32% 11%)" : "white",
            }}
          />
          {/* Centre text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-4xl font-bold leading-none"
              style={{ color: isDark ? "#00e0c0" : "#0ea5e9" }}
            >
              {KPI_VALUE}%
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 font-semibold">
              Average Rate
            </span>
          </div>
        </div>
      </div>

      {/* Bottom stat cards */}
      <div className="grid grid-cols-2 gap-3 mt-1">
        {[
          { label: "Active Shifts",     value: `0${ACTIVE_SHIFTS}` },
          { label: "Peak Utilization",  value: `${PEAK_UTILIZATION}%` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl px-3 py-3 text-center"
            style={{
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
            }}
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-medium">{label}</p>
            <p
              className="text-2xl font-bold"
              style={{ color: isDark ? "#3b9eff" : "hsl(220 60% 25%)" }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
