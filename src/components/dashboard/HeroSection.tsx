import { Calendar, ArrowUpRight, Users, UserCheck, UserX, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  {
    icon: Users,
    value: "248",
    label: "Total Employees",
    change: "+3.72%",
    positive: true,
  },
  {
    icon: UserCheck,
    value: "215",
    label: "Present Today",
    change: "+5.02%",
    positive: true,
  },
  {
    icon: UserX,
    value: "18",
    label: "Absent Today",
    change: "-1.72%",
    positive: false,
  },
  {
    icon: Clock,
    value: "15",
    label: "Late Arrivals",
    change: "-3.72%",
    positive: false,
  },
];

export function HeroSection() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <section className="hero-section px-6 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-primary-foreground/70 text-sm mb-1">{getGreeting()},</p>
          <h1 className="text-3xl font-semibold text-primary-foreground">Arun Kumar</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-accent/50"
          >
            <Calendar className="w-4 h-4 mr-2" />
            2024
          </Button>
          <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="hero-stat-card group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-primary-foreground/50 group-hover:text-primary-foreground transition-colors" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary-foreground">{stat.value}</span>
              <span 
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  stat.positive 
                    ? "bg-success/20 text-success" 
                    : "bg-destructive/20 text-destructive"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <p className="text-sm text-primary-foreground/60 mt-1">{stat.label}</p>
          </div>
        ))}

        {/* Add Widget Card */}
        <div className="hero-stat-card flex flex-col items-center justify-center cursor-pointer opacity-60 hover:opacity-100 transition-opacity border-dashed">
          <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center mb-2">
            <span className="text-2xl text-primary-foreground">+</span>
          </div>
          <p className="text-sm text-primary-foreground/70">Add new widget</p>
        </div>
      </div>
    </section>
  );
}
