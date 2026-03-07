import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard/Header";
import { Search, Plus, Building, MapPin, Users, LayoutGrid, List, ArrowUpDown, ChevronUp, ChevronDown, Pencil, Trash2, Filter, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  OrganizationModal,
  type CreatedOrgFormData,
  type Organization,
} from "@/components/modals/OrganizationModal";
import type { CreateOrganizationResponse } from "@/lib/api";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fetchOrganizations, deleteOrganization } from "@/lib/api";
import type { ApiOrganization } from "@/lib/api";
import { toast } from "sonner";
import { useTableSort, useStatusFilter } from "@/hooks";

function apiToOrg(api: ApiOrganization): Organization {
  return {
    id: api.id,
    name: api.name,
    location: api.city ? [api.city, api.state, api.country].filter(Boolean).join(", ") || "-" : "-",
    employees: 0,
    devices: 0,
    status: api.is_active !== false ? "Active" : "Inactive",
    address: api.address,
    city: api.city,
    state: api.state,
    country: api.country,
    pincode: api.pincode,
    phone_number: api.phone_number,
    email: api.email,
    owner: api.owner,
  };
}

function buildOrgFromCreate(response: CreateOrganizationResponse, form: CreatedOrgFormData): Organization {
  const location = [form.orgCity, form.orgState, form.orgCountry].filter(Boolean).join(", ") || "-";
  return {
    id: response.organization_id,
    name: form.orgName.trim(),
    location,
    employees: 0,
    devices: 0,
    status: "Active",
    address: form.orgAddress.trim() || undefined,
    city: form.orgCity.trim() || undefined,
    state: form.orgState.trim() || undefined,
    country: form.orgCountry.trim() || undefined,
    pincode: form.orgPincode.trim() || undefined,
    phone_number: form.orgPhone.trim() || undefined,
    email: form.orgEmail.trim() || undefined,
  };
}

type SortField = "name" | "location" | "employees" | "devices" | "status";
type SortDirection = "asc" | "desc" | null;

const Organizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [searchQuery, setSearchQuery] = useState("");
  const { sortField, sortDirection, handleSort, getSortDirection } = useTableSort<SortField>();
  const { statusFilters, setStatusFilters, toggleStatusFilter } = useStatusFilter([]);
  const [locationFilters, setLocationFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const loadOrganizations = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await fetchOrganizations();
      setOrganizations(list.map(apiToOrg));
    } catch {
      setOrganizations([]);
      toast.error("Failed to load organizations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const allStatuses = Array.from(new Set(organizations.map(o => o.status)));
  const allLocations = Array.from(new Set(organizations.map(o => o.location)));

  const getSortIcon = (field: SortField) => {
    const dir = getSortDirection(field);
    if (dir === null) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    if (dir === "asc") return <ChevronUp className="w-4 h-4 ml-1" />;
    return <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const handleEdit = (org: Organization) => {
    setSelectedOrganization(org);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDelete = (org: Organization) => {
    setSelectedOrganization(org);
    setIsDeleteModalOpen(true);
  };

  const handleEditSave = (updatedOrg: Organization) => {
    setOrganizations(organizations.map((o) => (o.id === updatedOrg.id ? updatedOrg : o)));
  };

  const handleConfirmDelete = async () => {
    if (!selectedOrganization) return;
    try {
      await deleteOrganization(selectedOrganization.id);
      setOrganizations(organizations.filter(o => o.id !== selectedOrganization.id));
      toast.success("Organization deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete.");
    }
    setIsDeleteModalOpen(false);
    setSelectedOrganization(null);
  };

  const toggleLocationFilter = (location: string) => {
    setLocationFilters(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const clearFilters = () => {
    setStatusFilters([]);
    setLocationFilters([]);
  };

  const hasActiveFilters = statusFilters.length > 0 || locationFilters.length > 0;

  const filteredAndSortedData = organizations
    .filter((org) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          org.name.toLowerCase().includes(query) ||
          org.location.toLowerCase().includes(query) ||
          org.status.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      // Status filter
      if (statusFilters.length > 0 && !statusFilters.includes(org.status)) {
        return false;
      }
      // Location filter
      if (locationFilters.length > 0 && !locationFilters.includes(org.location)) {
        return false;
      }
      return true;
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

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Location", "Employees", "Devices", "Status"];
    const csvRows = [
      headers.join(","),
      ...filteredAndSortedData.map(org => 
        [org.id, org.name, `"${org.location}"`, org.employees, org.devices, org.status].join(",")
      )
    ];
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.href = url;
    link.download = `Organizations_${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="px-6 py-6 flex items-center justify-center min-h-[40vh]">
          <p className="text-muted-foreground text-sm">Loading organizations...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="px-4 py-4 md:px-6 md:py-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Organizations</h1>
            <p className="text-sm text-muted-foreground">Manage offices and biometric devices</p>
          </div>
          <Button
            className="bg-primary text-primary-foreground"
            onClick={() => {
              setModalMode("add");
              setSelectedOrganization(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Organization
          </Button>
        </div>

        {/* Search and View Toggle */}
        <div className="widget-card mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 flex-1 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full sm:w-[260px] lg:w-[320px] min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search organizations..." 
                  className="pl-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 mt-2 md:mt-0">
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
                          {statusFilters.length + locationFilters.length}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="start">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Filters</h4>
                        {hasActiveFilters && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Clear all
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                          Status
                        </Label>
                        {allStatuses.map(status => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`org-status-${status}`}
                              checked={statusFilters.includes(status)}
                              onCheckedChange={() => toggleStatusFilter(status)}
                            />
                            <label htmlFor={`org-status-${status}`} className="text-sm cursor-pointer">
                              {status}
                            </label>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                          Location
                        </Label>
                        {allLocations.map(location => (
                          <div key={location} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`org-loc-${location}`}
                              checked={locationFilters.includes(location)}
                              onCheckedChange={() => toggleLocationFilter(location)}
                            />
                            <label htmlFor={`org-loc-${location}`} className="text-sm cursor-pointer">
                              {location}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg mt-3 lg:mt-0">
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

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {statusFilters.map(status => (
                <span key={status} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {status}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleStatusFilter(status)} />
                </span>
              ))}
              {locationFilters.map(location => (
                <span key={location} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {location}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleLocationFilter(location)} />
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card View */}
        {viewMode === "card" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSortedData.map((org) => (
              <div key={org.id} className="widget-card hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      org.status === 'Active' ? 'badge-success' : 'badge-danger'
                    }`}>
                      {org.status}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 text-primary hover:text-primary hover:bg-primary/10"
                        onClick={(e) => { e.stopPropagation(); handleEdit(org); }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => { e.stopPropagation(); handleDelete(org); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-semibold text-foreground mb-1">{org.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  {org.location}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{org.employees}</span>
                    <span className="text-muted-foreground">employees</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-foreground">{org.devices}</span>
                    <span className="text-muted-foreground"> devices</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <div className="widget-card">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                <TableRow className="bg-primary hover:bg-primary dark:bg-card dark:hover:bg-card">
                    <TableHead 
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Organization Name
                        {getSortIcon("name")}
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
                      onClick={() => handleSort("employees")}
                    >
                      <div className="flex items-center">
                        Employees
                        {getSortIcon("employees")}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-primary-foreground cursor-pointer select-none"
                      onClick={() => handleSort("devices")}
                    >
                      <div className="flex items-center">
                        Devices
                        {getSortIcon("devices")}
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
                  {filteredAndSortedData.map((org) => (
                    <TableRow key={org.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building className="w-4 h-4 text-primary" />
                          </div>
                          {org.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          {org.location}
                        </div>
                      </TableCell>
                      <TableCell>{org.employees}</TableCell>
                      <TableCell>{org.devices}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          org.status === 'Active' ? 'badge-success' : 'badge-danger'
                        }`}>
                          {org.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-8 h-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleEdit(org)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(org)}
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
      </main>

      <OrganizationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        organization={selectedOrganization}
        onAddSuccess={(response, orgFormData) => {
          setOrganizations((prev) => [...prev, buildOrgFromCreate(response, orgFormData)]);
        }}
        onEditSave={handleEditSave}
      />
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Organization"
        description={`Are you sure you want to delete "${selectedOrganization?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Organizations;
