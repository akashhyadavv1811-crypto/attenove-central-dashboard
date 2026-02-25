import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Header } from "@/components/dashboard/Header";
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  FileDown,
  Pencil,
  Trash2,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddEmployeeModal } from "@/components/modals/AddEmployeeModal";
import { AddManagerOrSupervisorModal } from "@/components/modals/AddManagerOrSupervisorModal";
import { EditEmployeeModal, type Employee } from "@/components/modals/EditEmployeeModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { format } from "date-fns";
import {
  fetchEmployees,
  fetchOrganizations,
  fetchOffices,
  deleteEmployee,
  getProfilePicUrl,
  exportEmployeesBlob,
  importEmployees,
} from "@/lib/api";
import type { ApiEmployee } from "@/lib/api";
import { toast } from "sonner";
import { useTableSort, useStatusFilter } from "@/hooks";

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
    governmentIdType: api.government_id_type ?? undefined,
    governmentIdValue: api.government_id_value ?? undefined,
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
  const [isManagerSupervisorModalOpen, setIsManagerSupervisorModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState<number | "all">("all");
  const [officeFilter, setOfficeFilter] = useState<number | "all">("all");
  const { sortField, sortDirection, handleSort, getSortDirection } = useTableSort<SortField>();
  const { statusFilters, setStatusFilters, toggleStatusFilter } = useStatusFilter([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importOrgId, setImportOrgId] = useState<number | "">("");
  const [importOfficeId, setImportOfficeId] = useState<number | "">("");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const [bulkDeleteIds, setBulkDeleteIds] = useState<number[] | null>(null);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(0);
  const [goToPageInput, setGoToPageInput] = useState("");

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

  const getSortIcon = (field: SortField) => {
    const dir = getSortDirection(field);
    if (dir === null) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    if (dir === "asc") return <ChevronUp className="w-4 h-4 ml-1" />;
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

  const totalRows = filteredAndSortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const pageSafe = Math.min(page, totalPages - 1);
  const start = pageSafe * pageSize;
  const end = Math.min(start + pageSize, totalRows);
  const paginatedData = useMemo(
    () => filteredAndSortedData.slice(start, end),
    [filteredAndSortedData, start, end]
  );

  const allFilteredIds = useMemo(
    () => new Set(filteredAndSortedData.map((e) => e.id)),
    [filteredAndSortedData]
  );
  const allVisibleSelected =
    filteredAndSortedData.length > 0 &&
    filteredAndSortedData.every((e) => selectedIds.has(e.id));
  const someVisibleSelected = filteredAndSortedData.some((e) => selectedIds.has(e.id));

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    const value = checked === true;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      allFilteredIds.forEach((id) => (value ? next.add(id) : next.delete(id)));
      return next;
    });
  };

  const handleSelectOne = (id: number, checked: boolean | "indeterminate") => {
    const value = checked === true;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.size === 0) return;
    setBulkDeleteIds([...selectedIds]);
  };

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteIds?.length) return;
    try {
      for (const id of bulkDeleteIds) {
        await deleteEmployee(id);
      }
      toast.success(`${bulkDeleteIds.length} employee(s) deleted.`);
      setSelectedIds(new Set());
      setBulkDeleteIds(null);
      loadEmployees();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete some employees.");
    }
    setBulkDeleteIds(null);
  };

  const goToPage = () => {
    const raw = goToPageInput.trim();
    const num = parseInt(raw, 10);
    if (raw === "") return;
    if (Number.isNaN(num) || num < 1 || num > totalPages) {
      toast.error(
        totalPages <= 1
          ? "There is only 1 page."
          : `Page must be between 1 and ${totalPages}. You are not allowed to go to that page.`
      );
      return;
    }
    setPage(num - 1);
    setGoToPageInput("");
  };

  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(0);
    }
  }, [totalPages, page]);

  useEffect(() => {
    setGoToPageInput("");
  }, [pageSafe]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const orgId = organizationFilter === "all" ? undefined : organizationFilter;
      const offId = officeFilter === "all" ? undefined : officeFilter;
      const blob = await exportEmployeesBlob(orgId, offId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Employees_${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Export downloaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSample = () => {
    const headers = [
      "emp_code",
      "name",
      "designation",
      "gender",
      "date_of_birth",
      "email",
      "phone_number",
      "government_id_type",
      "government_id_value",
    ];
    const exampleRow = [
      "EMP001",
      "John Doe",
      "EMPLOYEE",
      "M",
      "1990-01-15",
      "john@example.com",
      "+91 9876543210",
      "PanCard",
      "ABCDE1234F",
    ];
    const csv = [headers.join(","), exampleRow.join(",")].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "employees_import_sample.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Sample file downloaded.");
  };

  const handleImportSubmit = async () => {
    if (!importFile || importOrgId === "" || importOfficeId === "") {
      toast.error("Select organization, office, and a file.");
      return;
    }
    setIsImporting(true);
    try {
      const result = await importEmployees(importFile, Number(importOrgId), Number(importOfficeId));
      toast.success(result.message);
      if (result.errors?.length) {
        result.errors.slice(0, 5).forEach((e) => toast.warning(e));
      }
      loadEmployees();
      setIsImportModalOpen(false);
      setImportFile(null);
      setImportOfficeId("");
      if (importFileInputRef.current) importFileInputRef.current.value = "";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setIsImporting(false);
    }
  };

  const importOfficesForOrg =
    importOrgId === ""
      ? []
      : offices.filter((o) => o.organizationId === Number(importOrgId));

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
      <main className={`px-6 py-6 ${selectedIds.size > 0 ? "pb-20" : ""}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Employees</h1>
            <p className="text-sm text-muted-foreground">Manage your organization's employees</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary hover:opacity-100"
              onClick={() => setIsManagerSupervisorModalOpen(true)}
            >
              Create Manager/Supervisor
            </Button>
            <Button className="bg-primary text-primary-foreground" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        <div className="widget-card mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-sm min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-9 border-b-0 focus-visible:border-b-0"
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
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground border-0 hover:bg-primary hover:opacity-100"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                  {hasActiveFilters && (
                    <span className="ml-1 bg-primary-foreground/20 text-primary-foreground text-xs rounded-full px-1.5">
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
            <Button
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              className="bg-emerald-600 text-white border-0 hover:bg-emerald-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              className="bg-sky-600 text-white border-0 hover:bg-sky-600 disabled:opacity-60"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
            <Button
              size="sm"
              onClick={handleDownloadSample}
              className="bg-amber-500 text-white border-0 hover:bg-amber-500"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Download Sample
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
                  <TableHead className="text-primary-foreground w-12 px-4">
                    <Checkbox
                      checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                      className="border-primary-foreground/50 data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary"
                    />
                  </TableHead>
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
                {paginatedData.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-muted/50">
                    <TableCell className="w-12 px-4">
                      <Checkbox
                        checked={selectedIds.has(employee.id)}
                        onCheckedChange={(checked) => handleSelectOne(employee.id, checked)}
                        aria-label={`Select ${employee.name}`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
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
        {filteredAndSortedData.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Rows per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-[72px]">
                  <SelectValue placeholder="Rows" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                {totalRows === 0 ? "0 rows" : `${start + 1}–${end} of ${totalRows}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={pageSafe <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Page {pageSafe + 1} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Go to</span>
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  className="h-8 w-12 px-2 text-center text-sm"
                  placeholder={String(pageSafe + 1)}
                  value={goToPageInput}
                  onChange={(e) => setGoToPageInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), goToPage())}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  onClick={goToPage}
                >
                  Go
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={pageSafe >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        </div>

        <AddEmployeeModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          organizations={organizations}
          offices={offices}
          onSuccess={handleAddSuccess}
        />
        <AddManagerOrSupervisorModal
          open={isManagerSupervisorModalOpen}
          onOpenChange={setIsManagerSupervisorModalOpen}
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
        <DeleteConfirmationModal
          open={bulkDeleteIds !== null && bulkDeleteIds.length > 0}
          onOpenChange={(open) => !open && setBulkDeleteIds(null)}
          title="Delete employees"
          description={`Are you sure you want to delete ${bulkDeleteIds?.length ?? 0} employee(s)? This action cannot be undone.`}
          onConfirm={handleConfirmBulkDelete}
        />

        {selectedIds.size > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[min(50vw,28rem)] bg-primary text-primary-foreground py-3 px-6 shadow-lg rounded-lg border border-primary/80">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">
                {selectedIds.size} selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
                  onClick={() => setSelectedIds(new Set())}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-destructive/90 text-destructive-foreground hover:bg-destructive"
                  onClick={handleBulkDeleteClick}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
          <DialogContent className="sm:max-w-lg w-[95vw]">
            <DialogHeader>
              <DialogTitle>Import Employees</DialogTitle>
              <DialogDescription>
                Upload a CSV or Excel (.xlsx) file. First row must be headers: emp_code, name, and optionally designation (only Staff or Support Staff), gender, date_of_birth, email, phone_number, government_id_type, government_id_value. All rows will be created under the selected organization and office.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Organization</Label>
                <Select
                  value={importOrgId === "" ? "none" : String(importOrgId)}
                  onValueChange={(v) => {
                    setImportOrgId(v === "none" ? "" : Number(v));
                    setImportOfficeId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={String(org.id)}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Office</Label>
                <Select
                  value={importOfficeId === "" ? "" : String(importOfficeId)}
                  onValueChange={(v) => setImportOfficeId(v ? Number(v) : "")}
                  disabled={importOfficesForOrg.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={importOfficesForOrg.length === 0 ? "Select organization first" : "Select office"} />
                  </SelectTrigger>
                  <SelectContent>
                    {importOfficesForOrg.map((off) => (
                      <SelectItem key={off.id} value={String(off.id)}>
                        {off.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>File (CSV or .xlsx)</Label>
                <input
                  ref={importFileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => importFileInputRef.current?.click()}
                >
                  {importFile ? importFile.name : "Choose file"}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsImportModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImportSubmit} disabled={isImporting || !importFile || importOrgId === "" || importOfficeId === ""}>
                {isImporting ? "Importing..." : "Import"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Employees;
