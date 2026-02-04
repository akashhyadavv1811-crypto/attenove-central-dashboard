import { MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const logs = [
  {
    name: "Priya Sharma",
    role: "Software Engineer",
    time: "Today, 09:05 AM",
    type: "Check In",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Rahul Verma",
    role: "DevOps Engineer",
    time: "Today, 09:12 AM",
    type: "Check In",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Sneha Patel",
    role: "UI/UX Designer",
    time: "Today, 09:18 AM",
    type: "Check In",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Amit Singh",
    role: "Project Manager",
    time: "Today, 09:22 AM",
    type: "Late",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
];

export function RecentLogs() {
  return (
    <div className="widget-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Recent Biometric Logs</h3>
            <Button variant="ghost" size="icon" className="w-6 h-6">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">
            42 <span className="text-sm font-normal text-muted-foreground">Logs today</span>
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
        {logs.map((log, index) => (
          <div 
            key={index} 
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={log.avatar} />
              <AvatarFallback>{log.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">{log.name}</p>
              <p className="text-xs text-muted-foreground">{log.role}</p>
            </div>
            <div className="text-right">
              <span 
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  log.type === "Late" ? "badge-warning" : "badge-success"
                }`}
              >
                {log.type}
              </span>
              <p className="text-xs text-muted-foreground mt-1">{log.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
