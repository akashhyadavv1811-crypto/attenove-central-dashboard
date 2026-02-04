import { Calendar, ArrowUpRight, Users, UserCheck, UserX, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  {
    icon: Users,
    value: "310",
    label: "Total Employees",
    change: "+3.72%",
    positive: true,
  },
  {
    icon: UserCheck,
    value: "1,244",
    label: "Present Today",
    change: "+5.02%",
    positive: true,
  },
  {
    icon: UserX,
    value: "1,298K",
    label: "New Employees",
    change: "-1.72%",
    positive: false,
  },
  {
    icon: Clock,
    value: "1,298K",
    label: "Resigned Employees",
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
    <section className="relative">
      {/* Green background section */}
      <div className="relative overflow-hidden bg-primary pb-20">
        {/* Curved overlay on the right */}
        <div 
          className="absolute right-0 top-0 h-full w-2/5 pointer-events-none"
          style={{
            background: 'linear-gradient(145deg, transparent 0%, rgba(140, 155, 145, 0.25) 40%, rgba(160, 175, 165, 0.4) 100%)',
            borderBottomLeftRadius: '50% 80%',
          }}
        />
        
        <div className="relative px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-primary-foreground/60 text-sm mb-0.5">{getGreeting()},</p>
              <h1 className="text-2xl font-semibold text-primary-foreground">Arun Kumar</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-accent/50 h-9 px-3"
              >
                <Calendar className="w-4 h-4 mr-2" />
                2024
              </Button>
              <Button 
                size="sm" 
                className="bg-card text-primary hover:bg-card/90 font-medium h-9 px-4"
              >
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards that overlap the green and white sections */}
      <div className="relative px-6 -mt-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-card rounded-2xl p-4 border border-border/40 shadow-sm group cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-primary-foreground" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</span>
                <span 
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    stat.positive 
                      ? "bg-success/15 text-success" 
                      : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}

          {/* Add Widget Card */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 border-2 border-dashed border-border/60 flex flex-col items-center justify-center cursor-pointer hover:bg-card transition-colors group min-h-[120px]">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5 text-primary-foreground" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">Add new widget</p>
          </div>
        </div>
      </div>
    </section>
  );
}
