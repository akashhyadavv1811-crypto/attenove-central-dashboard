import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const shifts = [
  {
    name: "Morning Shift",
    timing: "06:00 AM - 02:00 PM",
    employees: 85,
    color: "bg-chart-2",
  },
  {
    name: "General Shift",
    timing: "09:00 AM - 06:00 PM",
    employees: 120,
    color: "bg-chart-1",
  },
  {
    name: "Evening Shift",
    timing: "02:00 PM - 10:00 PM",
    employees: 43,
    color: "bg-chart-3",
  },
  {
    name: "Night Shift",
    timing: "10:00 PM - 06:00 AM",
    employees: 28,
    color: "bg-chart-4",
  },
];

export function ActiveShifts() {
  return (
    <div className="widget-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Active Shifts</h3>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">
            {shifts.length} <span className="text-sm font-normal text-muted-foreground">Shifts</span>
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="w-8 h-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="w-8 h-8">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {shifts.map((shift, index) => (
          <div 
            key={index} 
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-lg ${shift.color} flex items-center justify-center`}>
              <span className="text-xs font-bold text-primary-foreground">
                {shift.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">{shift.name}</p>
              <p className="text-xs text-muted-foreground">{shift.timing}</p>
            </div>
            <span className="text-sm font-medium text-muted-foreground">{shift.employees} emp</span>
          </div>
        ))}
      </div>
    </div>
  );
}
