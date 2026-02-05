import { Header } from "@/components/dashboard/Header";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { ActiveShifts } from "@/components/dashboard/ActiveShifts";
import { RecentLogs } from "@/components/dashboard/RecentLogs";
import { EmploymentStatus } from "@/components/dashboard/EmploymentStatus";
import { AttendanceKPI } from "@/components/dashboard/AttendanceKPI";
import { AttendanceHeatmap } from "@/components/dashboard/AttendanceHeatmap";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      <main className="px-6 py-6 pt-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column */}
          <div className="space-y-5">
            <ActiveShifts />
          </div>

          {/* Middle column */}
          <div className="space-y-5">
            <RecentLogs />
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <EmploymentStatus />
          </div>
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
          <AttendanceKPI />
          <AttendanceHeatmap />
        </div>
      </main>
    </div>
  );
};

export default Index;
