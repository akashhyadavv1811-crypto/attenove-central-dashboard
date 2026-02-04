import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

// Generate mock heatmap data
const generateHeatmapData = () => {
  const weeks = 12;
  const days = 7;
  const data: number[][] = [];
  
  for (let w = 0; w < weeks; w++) {
    const week: number[] = [];
    for (let d = 0; d < days; d++) {
      // Weekend (0 = Sunday, 6 = Saturday) - lower attendance
      if (d === 0 || d === 6) {
        week.push(Math.random() > 0.7 ? Math.floor(Math.random() * 2) : 0);
      } else {
        week.push(Math.floor(Math.random() * 5) + 1);
      }
    }
    data.push(week);
  }
  return data;
};

const heatmapData = generateHeatmapData();
const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function AttendanceHeatmap() {
  const getLevelClass = (level: number) => {
    switch (level) {
      case 0: return 'heatmap-level-0';
      case 1: return 'heatmap-level-1';
      case 2: return 'heatmap-level-2';
      case 3: return 'heatmap-level-3';
      case 4: return 'heatmap-level-4';
      default: return 'heatmap-level-5';
    }
  };

  return (
    <div className="widget-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Attendance Overview</h3>
        <Button variant="ghost" size="icon" className="w-6 h-6">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pt-0.5">
          {dayLabels.map((day, index) => (
            <div key={index} className="h-3 text-xs text-muted-foreground flex items-center">
              {index % 2 === 1 ? day : ''}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1 overflow-x-auto">
          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((level, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`heatmap-cell ${getLevelClass(level)}`}
                  title={`Week ${weekIndex + 1}, ${dayLabels[dayIndex]}: Level ${level}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-4">
        <span className="text-xs text-muted-foreground mr-2">Less</span>
        {[0, 1, 2, 3, 4, 5].map((level) => (
          <div key={level} className={`heatmap-cell ${getLevelClass(level)}`} />
        ))}
        <span className="text-xs text-muted-foreground ml-2">More</span>
      </div>
    </div>
  );
}
