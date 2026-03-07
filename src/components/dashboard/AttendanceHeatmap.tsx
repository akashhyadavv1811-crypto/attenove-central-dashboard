import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

// 5 rows = Mon–Fri, 24 columns = hours or 30 columns = days of month
const DAYS  = ["MO", "TU", "WE", "TH", "FR"] as const;
const COLS  = 28;

function seededRand(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

const rand = seededRand(42);
const data: number[][] = DAYS.map((_, di) =>
  Array.from({ length: COLS }, (_, ci) => {
    if (di === 5 || di === 6) return rand() > 0.7 ? 1 : 0; // weekend sparse
    const v = rand();
    if (v < 0.12) return 0;
    if (v < 0.30) return 1;
    if (v < 0.52) return 2;
    if (v < 0.72) return 3;
    if (v < 0.88) return 4;
    return 5;
  })
);

export function AttendanceHeatmap({ className }: { className?: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [tab, setTab] = useState<"daily" | "weekly">("daily");

  const cellColor = (level: number): React.CSSProperties => {
    if (level === 0) return { background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)" };
    const stops = isDark
      ? ["rgba(0,224,192,0.18)", "rgba(0,224,192,0.38)", "rgba(0,200,180,0.58)", "rgba(0,200,180,0.78)", "rgba(0,224,192,1)"]
      : ["rgba(14,165,233,0.18)", "rgba(14,165,233,0.38)", "rgba(14,165,233,0.58)", "rgba(14,165,233,0.78)", "rgba(14,165,233,1)"];
    return {
      background: stops[level - 1],
      boxShadow: isDark && level >= 4 ? `0 0 4px rgba(0,224,192,${(level - 3) * 0.3})` : undefined,
    };
  };

  return (
    <div className={`widget-card flex flex-col${className ? ` ${className}` : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest">Attendance Heatmap</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">System engagement & check-ins</p>
        </div>
        {/* Daily / Weekly tab */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted">
          {(["daily", "weekly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all capitalize"
              style={{
                background: tab === t
                  ? (isDark ? "hsl(213 90% 62%)" : "hsl(220 60% 25%)")
                  : "transparent",
                color: tab === t ? "#fff" : "hsl(var(--muted-foreground))",
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid — grows to fill available card height */}
      <div className="overflow-x-auto flex-1 flex flex-col justify-center">
        <div className="flex flex-col gap-2.5 min-w-max">
          {data.map((row, di) => (
            <div key={di} className="flex items-center gap-2">
              {/* Day label */}
              <span className="text-[10px] font-semibold text-muted-foreground w-6 flex-shrink-0 text-right">
                {DAYS[di]}
              </span>
              {/* Cells */}
              <div className="flex gap-1">
                {row.map((level, ci) => (
                  <div
                    key={ci}
                    className="w-4 h-4 rounded-sm transition-all hover:scale-110 cursor-pointer flex-shrink-0"
                    style={cellColor(level)}
                    title={`${DAYS[di]} – col ${ci + 1}: ${["None", "Low", "Moderate", "Good", "High", "Peak"][level]}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-4 pt-3 border-t border-border">
        <span className="text-[10px] text-muted-foreground mr-0.5">Low</span>
        {[0, 1, 2, 3, 4, 5].map((l) => (
          <div key={l} className="w-3.5 h-3.5 rounded-sm" style={cellColor(l)} />
        ))}
        <span className="text-[10px] text-muted-foreground ml-0.5">Peak</span>
      </div>
    </div>
  );
}
