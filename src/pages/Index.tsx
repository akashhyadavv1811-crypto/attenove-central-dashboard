import { Header } from "@/components/dashboard/Header";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { ActiveShifts } from "@/components/dashboard/ActiveShifts";
import { RecentLogs } from "@/components/dashboard/RecentLogs";
import { AttendanceKPI } from "@/components/dashboard/AttendanceKPI";
import { AttendanceHeatmap } from "@/components/dashboard/AttendanceHeatmap";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />

      <main className="px-6 py-6 pt-5">
        {/* Main 2-column layout — columns share equal height, bottom widgets stretch */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:items-stretch">

          {/* Left (wider): Biometric Activity + Heatmap */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <RecentLogs />
            <AttendanceHeatmap className="flex-1" />
          </div>

          {/* Right (narrower): KPI gauge + Shift Load Distribution */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <AttendanceKPI />
            <ActiveShifts />
          </div>
        </div>

      </main>
    </div>
  );
};

export default Index;
