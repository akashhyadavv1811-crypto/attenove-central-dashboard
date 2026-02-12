import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard/Header";
import {
  Search,
  Plus,
  Building,
  MapPin,
  LayoutGrid,
  List,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Filter,
  Download,
  X,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { OfficeModal, type Office } from "@/components/modals/OfficeModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { format } from "date-fns";
import {
  fetchOffices,
  fetchOrganizations,
  deleteOffice,
} from "@/lib/api";
import type { ApiOffice } from "@/lib/api";
import { toast } from "sonner";

function apiToOffice(api: ApiOffice, orgName?: string): Office {
  return {
    id: api.id,
    name: api.name,
    organizationId: api.organization_id,
    organizationName: orgName,
    location: api.location ?? "",
    fullAddress: api.full_address ?? "",
    numBiometricDevices: api.num_biometric_devices ?? 0,
    status: api.is_active !== false ? "Active" : "Inactive",
  };
}

type SortField = "name" | "location" | "organizationName" | "numBiometricDevices" | "status";
type SortDirection = "asc" | "desc" | null;

const Offices = () => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [organizations, setOrganizations] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState<number | "all">("all");
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
    setIsLoading(true);
    try {
      const orgId = organizationFilter === "all" ? undefined : organizationFilter;
      const list = await fetchOffices(orgId);
      const orgMap = new Map(organizations.map((o) => [o.id, o.name]));
      setOffices(
        list.map((o) => apiToOffice(o, orgMap.get(o.organization_id)))
      );
    } catch {
      setOffices([]);
      toast.error("Failed to load offices.");
    } finally {
      setIsLoading(false);
    }
  }, [organizationFilter, organizations]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  useEffect(() => {
    loadOffices();
  }, [loadOffices]);

  const allStatuses = Array.from(new Set(offices.map((o) => o.status)));

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

  const handleEdit = (office: Office) => {
    setSelectedOffice(office);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDelete = (office: Office) => {
    setSelectedOffice(office);
    setIsDeleteModalOpen(true);
  };

  const handleAddSuccess = (created: ApiOffice) => {
    const orgName = organizations.find((o) => o.id === created.organization_id)?.name;
    setOffices((prev) => [...prev, apiToOffice(created, orgName)]);
  };

  const handleEditSave = (updated: Office) => {
    setOffices((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    );
  };

  const handleConfirmDelete = async () => {
    if (!selectedOffice) return;
    try {
      await deleteOffice(selectedOffice.id);
      setOffices((prev) => prev.filter((o) => o.id !== selectedOffice.id));
      toast.success("Office deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete.");
    }
    setIsDeleteModalOpen(false);
    setSelectedOffice(null);
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const clearFilters = () => setStatusFilters([]);
  const hasActiveFilters = statusFilters.length > 0;

  const filteredAndSortedData = offices
    .filter((o) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          o.name.toLowerCase().includes(q) ||
          (o.location && o.location.toLowerCase().includes(q)) ||
          (o.organizationName && o.organizationName.toLowerCase().includes(q)) ||
          o.status.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (statusFilters.length > 0 && !statusFilters.includes(o.status)) return false;
      return true;
    })
    .sort((a, b) => {
      if (!sortField || !sortDirection) return 0;
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDirection === "asc" ? cmp : -cmp;
    });

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Organization", "Location", "Devices", "Status"];
    const rows = filteredAndSortedData.map((o) =>
      [
        o.id,
        o.name,
        `"${o.organizationName ?? ""}"`,
        `"${o.location}"`,
        o.numBiometricDevices,
        o.status,
      ].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Offices_${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading && offices.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="px-6 py-6 flex items-center justify-center min-h-[40vh]">
          <p className="text-muted-foreground text-sm">Loading offices...</p>
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
            <h1 className="text-2xl font-semibold text-foreground">Offices</h1>
            <p className="text-sm text-muted-foreground">
              Manage offices and biometric devices by organization
            </p>
          </div>
          <Button
            className="bg-primary text-primary-foreground"
            onClick={() => {
              setModalMode("add");
              setSelectedOffice(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Office
          </Button>
        </div>

        <div className="widget-card mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 flex-1 flex-wrap">
              <div className="relative max-w-sm flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search offices..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-[200px]">
                <Select
                  value={organizationFilter === "all" ? "all" : String(organizationFilter)}
                  onValueChange={(v) =>
                    setOrganizationFilter(v === "all" ? "all" : Number(v))
                  }
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
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={hasActiveFilters ? "border-primary text-primary" : ""}
                  >
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="h-auto p-0 text-xs"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    {allStatuses.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`office-status-${status}`}
                          checked={statusFilters.includes(status)}
                          onCheckedChange={() => toggleStatusFilter(status)}
                        />
                        <label
                          htmlFor={`office-status-${status}`}
                          className="text-sm cursor-pointer"
                        >
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
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <Button
                variant={viewMode === "card" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("card")}
                className="gap-1.5"
              >
                <LayoutGrid className="w-4 h-4" />
                Card
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="gap-1.5"
              >
                <List className="w-4 h-4" />
                Table
              </Button>
            </div>
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
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => toggleStatusFilter(status)}
                  />
                </span>
              ))}
            </div>
          )}
        </div>

        {viewMode === "card" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSortedData.map((office) => (
              <div
                key={office.id}
                className="widget-card hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        office.status === "Active" ? "badge-success" : "badge-danger"
                      }`}
                    >
                      {office.status}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-primary hover:text-primary hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(office);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(office);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{office.name}</h3>
                {office.organizationName && (
                  <p className="text-sm text-muted-foreground mb-1">{office.organizationName}</p>
                )}
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  {office.location || "—"}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{office.numBiometricDevices}</span>
                    <span className="text-muted-foreground">devices</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "table" && (
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
                        Office Name
                        {getSortIcon("name")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSort("organizationName")}
                    >
                      <div className="flex items-center">
                        Organization
                        {getSortIcon("organizationName")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSort("location")}
                    >
                      <div className="flex items-center">
                        Location
                        {getSortIcon("location")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSort("numBiometricDevices")}
                    >
                      <div className="flex items-center">
                        Devices
                        {getSortIcon("numBiometricDevices")}
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
                  {filteredAndSortedData.map((office) => (
                    <TableRow key={office.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building className="w-4 h-4 text-primary" />
                          </div>
                          {office.name}
                        </div>
                      </TableCell>
                      <TableCell>{office.organizationName ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          {office.location || "—"}
                        </div>
                      </TableCell>
                      <TableCell>{office.numBiometricDevices}</TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            office.status === "Active" ? "badge-success" : "badge-danger"
                          }`}
                        >
                          {office.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleEdit(office)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(office)}
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
        )}

        <OfficeModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          mode={modalMode}
          office={selectedOffice}
          organizations={organizations}
          onAddSuccess={handleAddSuccess}
          onEditSave={handleEditSave}
        />
        <DeleteConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          title="Delete Office"
          description={`Are you sure you want to delete "${selectedOffice?.name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
        />
      </main>
    </div>
  );
};

export default Offices;
