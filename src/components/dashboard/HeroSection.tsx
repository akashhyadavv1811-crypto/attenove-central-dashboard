import { Calendar, ArrowUpRight, Users, UserCheck, UserX, Clock, Plus } from "lucide-react";
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
    <section className="relative overflow-hidden">
      {/* Background with gradient and curved effect */}
      <div className="absolute inset-0 bg-primary">
        {/* Curved overlay on the right */}
        <div 
          className="absolute right-0 top-0 h-full w-1/3"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, rgba(156, 163, 156, 0.3) 50%, rgba(180, 190, 180, 0.4) 100%)',
            borderBottomLeftRadius: '100% 100%',
          }}
        />
      </div>

      <div className="relative px-6 py-8">
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
            <Button className="bg-card text-primary hover:bg-card/90 font-medium">
              Export Data
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-card rounded-xl p-5 border border-border/50 shadow-sm group cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                <span 
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    stat.positive 
                      ? "bg-success/15 text-success" 
                      : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}

          {/* Add Widget Card */}
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-5 border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-card/80 transition-colors group">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Plus className="w-6 h-6 text-primary-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Add new widget</p>
          </div>
        </div>
      </div>
    </section>
  );
}
