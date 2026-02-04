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
      
      <main className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <ActiveShifts />
          </div>

          {/* Middle column */}
          <div className="space-y-6">
            <RecentLogs />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <EmploymentStatus />
          </div>
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <AttendanceKPI />
          <AttendanceHeatmap />
        </div>
      </main>
    </div>
  );
};

export default Index;
