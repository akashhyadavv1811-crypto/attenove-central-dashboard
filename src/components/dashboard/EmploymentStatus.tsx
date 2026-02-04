import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const statuses = [
  { label: "Permanent Employees", count: 180, color: "bg-chart-1" },
  { label: "Contract Employees", count: 35, color: "bg-chart-2" },
  { label: "Temporary Employees", count: 18, color: "bg-chart-3" },
  { label: "Probation", count: 12, color: "bg-chart-4" },
  { label: "Interns", count: 3, color: "bg-chart-5" },
];

const total = statuses.reduce((acc, s) => acc + s.count, 0);

export function EmploymentStatus() {
  return (
    <div className="widget-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Employment Status</h3>
        <Button variant="ghost" size="icon" className="w-6 h-6">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">Total Employees</span>
        <span className="text-xl font-bold text-foreground">{total}</span>
      </div>

      {/* Progress bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-6 gap-0.5">
        {statuses.map((status, index) => (
          <div
            key={index}
            className={`${status.color} first:rounded-l-full last:rounded-r-full`}
            style={{ width: `${(status.count / total) * 100}%` }}
          />
        ))}
      </div>

      <div className="space-y-3">
        {statuses.map((status, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${status.color}`} />
              <span className="text-sm text-foreground">{status.label}</span>
            </div>
            <span className="text-sm font-medium text-foreground">{status.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
