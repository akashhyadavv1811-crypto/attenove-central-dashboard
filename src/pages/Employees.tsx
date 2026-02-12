import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard/Header";
import {
  Search,
  Plus,
  Filter,
  Download,
  Pencil,
  Trash2,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddEmployeeModal } from "@/components/modals/AddEmployeeModal";
import { EditEmployeeModal, type Employee } from "@/components/modals/EditEmployeeModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { format } from "date-fns";
import {
  fetchEmployees,
  fetchOrganizations,
  fetchOffices,
  deleteEmployee,
  getProfilePicUrl,
} from "@/lib/api";
import type { ApiEmployee } from "@/lib/api";
import { toast } from "sonner";

function apiToEmployee(
  api: ApiEmployee,
  orgName?: string,
  officeName?: string
): Employee {
  return {
    id: api.id,
    organizationId: api.organization_id,
    officeId: api.office_id,
    empCode: api.emp_code,
    name: api.name,
    designation: api.designation ?? "",
    gender: api.gender ?? "",
    dateOfBirth: api.date_of_birth ?? "",
    email: api.email ?? "",
    phoneNumber: api.phone_number ?? "",
    profilePic: api.profile_pic ?? null,
    status: api.is_active ? "Active" : "Inactive",
    organizationName: orgName,
    officeName,
  };
}

type SortField = "name" | "empCode" | "designation" | "status";
type SortDirection = "asc" | "desc" | null;

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [organizations, setOrganizations] = useState<{ id: number; name: string }[]>([]);
  const [offices, setOffices] = useState<{ id: number; name: string; organizationId: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState<number | "all">("all");
  const [officeFilter, setOfficeFilter] = useState<number | "all">("all");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const loadOrganizations = useCallback(async () => {
    try {
      const list = await fetchOrganizations();
      setOrganizations(list.map((o) => ({ id: o.id, name: o.name })));
    } catch {
      setOrganizations([]);
    }
  }, []);

  const loadOffices = useCallback(async () => {
    try {
      const list = await fetchOffices();
      setOffices(
        list.map((o) => ({
          id: o.id,
          name: o.name,
          organizationId: o.organization_id,
        }))
      );
    } catch {
      setOffices([]);
    }
  }, []);

  const loadEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const orgId = organizationFilter === "all" ? undefined : organizationFilter;
      const offId = officeFilter === "all" ? undefined : officeFilter;
      const list = await fetchEmployees(orgId, offId);
      const orgMap = new Map(organizations.map((o) => [o.id, o.name]));
      const offMap = new Map(offices.map((o) => [o.id, o.name]));
      setEmployees(
        list.map((e) =>
          apiToEmployee(
            e,
            orgMap.get(e.organization_id),
            offMap.get(e.office_id)
          )
        )
      );
    } catch {
      setEmployees([]);
      toast.error("Failed to load employees.");
    } finally {
      setIsLoading(false);
    }
  }, [organizationFilter, officeFilter, organizations, offices]);

  useEffect(() => {
    loadOrganizations();
    loadOffices();
  }, [loadOrganizations, loadOffices]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const allStatuses = Array.from(new Set(employees.map((e) => e.status)));

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    if (sortDirection === "asc") return <ChevronUp className="w-4 h-4 ml-1" />;
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

  const handleAddSuccess = (created: ApiEmployee) => {
    const orgName = organizations.find((o) => o.id === created.organization_id)?.name;
    const officeName = offices.find((o) => o.id === created.office_id)?.name;
    setEmployees((prev) => [...prev, apiToEmployee(created, orgName, officeName)]);
  };

  const handleSaveEdit = (updated: Employee) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e))
    );
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmployee) return;
    try {
      await deleteEmployee(selectedEmployee.id);
      setEmployees((prev) => prev.filter((e) => e.id !== selectedEmployee.id));
      toast.success("Employee deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete.");
    }
    setIsDeleteModalOpen(false);
    setSelectedEmployee(null);
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const clearFilters = () => setStatusFilters([]);
  const hasActiveFilters = statusFilters.length > 0;

  const filteredAndSortedData = employees
    .filter((emp) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          emp.name.toLowerCase().includes(q) ||
          emp.empCode.toLowerCase().includes(q) ||
          (emp.designation && emp.designation.toLowerCase().includes(q)) ||
          (emp.email && emp.email.toLowerCase().includes(q)) ||
          emp.status.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (statusFilters.length > 0 && !statusFilters.includes(emp.status)) return false;
      return true;
    })
    .sort((a, b) => {
      if (!sortField || !sortDirection) return 0;
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDirection === "asc" ? cmp : -cmp;
    });

  const exportToCSV = () => {
    const headers = ["ID", "Emp Code", "Name", "Designation", "Email", "Office", "Status"];
    const rows = filteredAndSortedData.map((emp) =>
      [
        emp.id,
        emp.empCode,
        `"${emp.name}"`,
        `"${emp.designation}"`,
        `"${emp.email}"`,
        `"${emp.officeName ?? ""}"`,
        emp.status,
      ].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Employees_${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const officesForFilter =
    organizationFilter === "all"
      ? offices
      : offices.filter((o) => o.organizationId === organizationFilter);

  if (isLoading && employees.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="px-6 py-6 flex items-center justify-center min-h-[40vh]">
          <p className="text-muted-foreground text-sm">Loading employees...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-6 py-6">
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

        <div className="widget-card mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-sm min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-[180px]">
              <Select
                value={organizationFilter === "all" ? "all" : String(organizationFilter)}
                onValueChange={(v) => {
                  setOrganizationFilter(v === "all" ? "all" : Number(v));
                  setOfficeFilter("all");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All organizations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All organizations</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={String(org.id)}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[180px]">
              <Select
                value={officeFilter === "all" ? "all" : String(officeFilter)}
                onValueChange={(v) => setOfficeFilter(v === "all" ? "all" : Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All offices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All offices</SelectItem>
                  {officesForFilter.map((off) => (
                    <SelectItem key={off.id} value={String(off.id)}>
                      {off.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={hasActiveFilters ? "border-primary text-primary" : ""}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                  {hasActiveFilters && (
                    <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5">
                      {statusFilters.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Status</h4>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-xs">
                        Clear
                      </Button>
                    )}
                  </div>
                  {allStatuses.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={statusFilters.includes(status)}
                        onCheckedChange={() => toggleStatusFilter(status)}
                      />
                      <label htmlFor={`status-${status}`} className="text-sm cursor-pointer">
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {statusFilters.map((status) => (
                <span
                  key={status}
                  className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                >
                  {status}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleStatusFilter(status)} />
                </span>
              ))}
            </div>
          )}
        </div>

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
                    onClick={() => handleSort("empCode")}
                  >
                    <div className="flex items-center">
                      Emp Code
                      {getSortIcon("empCode")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-primary-foreground cursor-pointer select-none"
                    onClick={() => handleSort("designation")}
                  >
                    <div className="flex items-center">
                      Designation
                      {getSortIcon("designation")}
                    </div>
                  </TableHead>
                  <TableHead className="text-primary-foreground">Email</TableHead>
                  <TableHead className="text-primary-foreground">Office</TableHead>
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
                          <AvatarImage src={getProfilePicUrl(employee.profilePic) ?? undefined} />
                          <AvatarFallback>
                            {employee.name
                              .split(/\s+/)
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{employee.name}</p>
                          {employee.email && (
                            <p className="text-xs text-muted-foreground">{employee.email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{employee.empCode}</TableCell>
                    <TableCell className="text-muted-foreground">{employee.designation || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{employee.email || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{employee.officeName ?? "—"}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          employee.status === "Active" ? "badge-success" : "badge-danger"
                        }`}
                      >
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

        <AddEmployeeModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          organizations={organizations}
          offices={offices}
          onSuccess={handleAddSuccess}
        />
        <EditEmployeeModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          employee={selectedEmployee}
          offices={offices}
          onSave={handleSaveEdit}
        />
        <DeleteConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          title="Delete Employee"
          description={`Are you sure you want to delete "${selectedEmployee?.name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
        />
      </main>
    </div>
  );
};

export default Employees;
