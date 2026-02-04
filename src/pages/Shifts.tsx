import { Header } from "@/components/dashboard/Header";
import { Search, Plus, Clock, Users, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const shifts = [
  { id: 1, name: "Morning Shift", startTime: "06:00 AM", endTime: "02:00 PM", breakTime: "30 min", employees: 85, status: "Active" },
  { id: 2, name: "General Shift", startTime: "09:00 AM", endTime: "06:00 PM", breakTime: "60 min", employees: 120, status: "Active" },
  { id: 3, name: "Evening Shift", startTime: "02:00 PM", endTime: "10:00 PM", breakTime: "30 min", employees: 43, status: "Active" },
  { id: 4, name: "Night Shift", startTime: "10:00 PM", endTime: "06:00 AM", breakTime: "45 min", employees: 28, status: "Active" },
  { id: 5, name: "Flexi Shift", startTime: "Flexible", endTime: "Flexible", breakTime: "60 min", employees: 15, status: "Active" },
  { id: 6, name: "Weekend Shift", startTime: "10:00 AM", endTime: "06:00 PM", breakTime: "30 min", employees: 12, status: "Inactive" },
];

const Shifts = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="px-6 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Shifts</h1>
            <p className="text-sm text-muted-foreground">Configure shift timings and rules</p>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Create Shift
          </Button>
        </div>

        {/* Search */}
        <div className="widget-card mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search shifts..." className="pl-9" />
          </div>
        </div>

        {/* Shifts Table */}
        <div className="widget-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shift Name</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Break</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{shift.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{shift.startTime}</TableCell>
                  <TableCell className="text-muted-foreground">{shift.endTime}</TableCell>
                  <TableCell className="text-muted-foreground">{shift.breakTime}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{shift.employees}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      shift.status === 'Active' ? 'badge-success' : 'badge-danger'
                    }`}>
                      {shift.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="w-8 h-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default Shifts;
