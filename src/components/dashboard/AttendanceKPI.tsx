import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AttendanceKPI() {
  const percentage = 86.7;
  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="widget-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Average Attendance KPI</h3>
        <Button variant="ghost" size="icon" className="w-6 h-6">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-chart-2 transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-foreground">{percentage}%</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-chart-2" />
          <span className="text-muted-foreground">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-muted" />
          <span className="text-muted-foreground">Absent</span>
        </div>
      </div>
    </div>
  );
}
