import { Header } from "@/components/dashboard/Header";
import { Download, Calendar, FileText, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const reportTypes = [
  { 
    title: "Daily Attendance Report", 
    description: "View daily check-in/check-out logs for all employees",
    icon: FileText,
    lastGenerated: "Today, 9:00 AM"
  },
  { 
    title: "Monthly Summary", 
    description: "Monthly attendance summary with present/absent statistics",
    icon: BarChart3,
    lastGenerated: "Jan 31, 2024"
  },
  { 
    title: "Late Arrival Report", 
    description: "Track employees who arrived late based on shift timings",
    icon: TrendingUp,
    lastGenerated: "Today, 8:30 AM"
  },
  { 
    title: "Leave Report", 
    description: "Overview of leave applications and approvals",
    icon: Calendar,
    lastGenerated: "Feb 1, 2024"
  },
  { 
    title: "Department-wise Report", 
    description: "Attendance breakdown by department and team",
    icon: PieChart,
    lastGenerated: "Jan 30, 2024"
  },
  { 
    title: "Overtime Report", 
    description: "Track overtime hours worked by employees",
    icon: TrendingUp,
    lastGenerated: "Jan 28, 2024"
  },
];

const Reports = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="px-6 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground">Generate and download attendance reports</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Select Date Range
            </Button>
          </div>
        </div>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reportTypes.map((report, index) => (
            <div key={index} className="widget-card hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <report.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              
              <h3 className="font-semibold text-foreground mb-2">{report.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{report.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  Last generated: {report.lastGenerated}
                </div>
                <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="widget-card text-center">
              <p className="text-3xl font-bold text-foreground">248</p>
              <p className="text-sm text-muted-foreground">Total Employees</p>
            </div>
            <div className="widget-card text-center">
              <p className="text-3xl font-bold text-success">86.7%</p>
              <p className="text-sm text-muted-foreground">Avg. Attendance</p>
            </div>
            <div className="widget-card text-center">
              <p className="text-3xl font-bold text-warning">12</p>
              <p className="text-sm text-muted-foreground">Late Today</p>
            </div>
            <div className="widget-card text-center">
              <p className="text-3xl font-bold text-foreground">6</p>
              <p className="text-sm text-muted-foreground">On Leave</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
