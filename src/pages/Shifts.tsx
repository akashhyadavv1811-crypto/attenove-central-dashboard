import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Search, Plus, Clock, Users, Pencil, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
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
import { CreateShiftModal } from "@/components/modals/CreateShiftModal";
import { EditShiftModal } from "@/components/modals/EditShiftModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  breakTime: string;
  employees: number;
  status: string;
}

const initialShifts: Shift[] = [
  { id: 1, name: "Morning Shift", startTime: "06:00 AM", endTime: "02:00 PM", breakTime: "30 min", employees: 85, status: "Active" },
  { id: 2, name: "General Shift", startTime: "09:00 AM", endTime: "06:00 PM", breakTime: "60 min", employees: 120, status: "Active" },
  { id: 3, name: "Evening Shift", startTime: "02:00 PM", endTime: "10:00 PM", breakTime: "30 min", employees: 43, status: "Active" },
  { id: 4, name: "Night Shift", startTime: "10:00 PM", endTime: "06:00 AM", breakTime: "45 min", employees: 28, status: "Active" },
  { id: 5, name: "Flexi Shift", startTime: "Flexible", endTime: "Flexible", breakTime: "60 min", employees: 15, status: "Active" },
  { id: 6, name: "Weekend Shift", startTime: "10:00 AM", endTime: "06:00 PM", breakTime: "30 min", employees: 12, status: "Inactive" },
];

type SortField = "name" | "startTime" | "endTime" | "breakTime" | "employees" | "status";
type SortDirection = "asc" | "desc" | null;

const Shifts = () => {
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    if (sortDirection === "asc") {
      return <ChevronUp className="w-4 h-4 ml-1" />;
    }
    return <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift);
    setIsEditModalOpen(true);
  };

  const handleDelete = (shift: Shift) => {
    setSelectedShift(shift);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = (updatedShift: Shift) => {
    setShifts(shifts.map(s => s.id === updatedShift.id ? updatedShift : s));
  };

  const handleConfirmDelete = () => {
    if (selectedShift) {
      setShifts(shifts.filter(s => s.id !== selectedShift.id));
    }
    setIsDeleteModalOpen(false);
    setSelectedShift(null);
  };

  const filteredAndSortedData = shifts
    .filter((shift) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        shift.name.toLowerCase().includes(query) ||
        shift.startTime.toLowerCase().includes(query) ||
        shift.endTime.toLowerCase().includes(query) ||
        shift.status.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (!sortField || !sortDirection) return 0;
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });

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
          <Button className="bg-primary text-primary-foreground" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Shift
          </Button>
        </div>

        {/* Search */}
        <div className="widget-card mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search shifts..." 
              className="pl-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Shifts Table */}
        <div className="widget-card">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead 
                    className="text-primary-foreground cursor-pointer select-none"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Shift Name
                      {getSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-primary-foreground cursor-pointer select-none"
                    onClick={() => handleSort("startTime")}
                  >
                    <div className="flex items-center">
                      Start Time
                      {getSortIcon("startTime")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-primary-foreground cursor-pointer select-none"
                    onClick={() => handleSort("endTime")}
                  >
                    <div className="flex items-center">
                      End Time
                      {getSortIcon("endTime")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-primary-foreground cursor-pointer select-none"
                    onClick={() => handleSort("breakTime")}
                  >
                    <div className="flex items-center">
                      Break
                      {getSortIcon("breakTime")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-primary-foreground cursor-pointer select-none"
                    onClick={() => handleSort("employees")}
                  >
                    <div className="flex items-center">
                      Employees
                      {getSortIcon("employees")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-primary-foreground cursor-pointer select-none"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      {getSortIcon("status")}
                    </div>
                  </TableHead>
                  <TableHead className="text-primary-foreground w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.map((shift) => (
                  <TableRow key={shift.id} className="hover:bg-muted/50">
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
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => handleEdit(shift)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(shift)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <CreateShiftModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
      <EditShiftModal 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen} 
        shift={selectedShift}
        onSave={handleSaveEdit}
      />
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Shift"
        description={`Are you sure you want to delete "${selectedShift?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Shifts;
