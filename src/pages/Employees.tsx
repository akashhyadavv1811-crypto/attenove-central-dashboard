import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Search, Plus, Filter, Download, Pencil, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddEmployeeModal } from "@/components/modals/AddEmployeeModal";
import { EditEmployeeModal } from "@/components/modals/EditEmployeeModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: string;
  avatar: string;
}

const initialEmployees: Employee[] = [
  { id: "EMP001", name: "Priya Sharma", email: "priya.sharma@company.com", department: "Engineering", role: "Software Engineer", status: "Active", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
  { id: "EMP002", name: "Rahul Verma", email: "rahul.verma@company.com", department: "Engineering", role: "DevOps Engineer", status: "Active", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
  { id: "EMP003", name: "Sneha Patel", email: "sneha.patel@company.com", department: "Design", role: "UI/UX Designer", status: "Active", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" },
  { id: "EMP004", name: "Amit Singh", email: "amit.singh@company.com", department: "Management", role: "Project Manager", status: "On Leave", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
  { id: "EMP005", name: "Kavita Reddy", email: "kavita.reddy@company.com", department: "HR", role: "HR Executive", status: "Active", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
  { id: "EMP006", name: "Vikram Joshi", email: "vikram.joshi@company.com", department: "Engineering", role: "Tech Lead", status: "Active", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100" },
  { id: "EMP007", name: "Anita Desai", email: "anita.desai@company.com", department: "Finance", role: "Accountant", status: "Active", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" },
  { id: "EMP008", name: "Suresh Kumar", email: "suresh.kumar@company.com", department: "Engineering", role: "Backend Developer", status: "Inactive", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" },
];

type SortField = "name" | "id" | "department" | "role" | "status";
type SortDirection = "asc" | "desc" | null;

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
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

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = (updatedEmployee: Employee) => {
    setEmployees(employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
  };

  const handleConfirmDelete = () => {
    if (selectedEmployee) {
      setEmployees(employees.filter(e => e.id !== selectedEmployee.id));
    }
    setIsDeleteModalOpen(false);
    setSelectedEmployee(null);
  };

  const filteredAndSortedData = employees
    .filter((emp) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        emp.name.toLowerCase().includes(query) ||
        emp.id.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query) ||
        emp.role.toLowerCase().includes(query) ||
        emp.status.toLowerCase().includes(query)
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
            <h1 className="text-2xl font-semibold text-foreground">Employees</h1>
            <p className="text-sm text-muted-foreground">Manage your organization's employees</p>
          </div>
          <Button className="bg-primary text-primary-foreground" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>

        {/* Filters Bar */}
        <div className="widget-card mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search employees..." 
                className="pl-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Employees Table */}
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
                      Employee
                      {getSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-primary-foreground cursor-pointer select-none"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center">
                      ID
                      {getSortIcon("id")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-primary-foreground cursor-pointer select-none"
                    onClick={() => handleSort("department")}
                  >
                    <div className="flex items-center">
                      Department
                      {getSortIcon("department")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-primary-foreground cursor-pointer select-none"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center">
                      Role
                      {getSortIcon("role")}
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
                {filteredAndSortedData.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">{employee.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{employee.id}</TableCell>
                    <TableCell className="text-muted-foreground">{employee.department}</TableCell>
                    <TableCell className="text-muted-foreground">{employee.role}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        employee.status === 'Active' ? 'badge-success' :
                        employee.status === 'On Leave' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {employee.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => handleEdit(employee)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(employee)}
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

      <AddEmployeeModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      <EditEmployeeModal 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen} 
        employee={selectedEmployee}
        onSave={handleSaveEdit}
      />
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Employee"
        description={`Are you sure you want to delete "${selectedEmployee?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Employees;
