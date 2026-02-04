import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Search, Plus, Building, MapPin, Users, LayoutGrid, List, ArrowUpDown, ChevronUp, ChevronDown, Pencil, Trash2, Filter, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AddOrganizationModal } from "@/components/modals/AddOrganizationModal";
import { EditOrganizationModal } from "@/components/modals/EditOrganizationModal";
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

interface Organization {
  id: number;
  name: string;
  location: string;
  employees: number;
  devices: number;
  status: string;
}

const initialOrganizations: Organization[] = [
  { id: 1, name: "Headquarters", location: "Mumbai, India", employees: 120, devices: 4, status: "Active" },
  { id: 2, name: "Tech Park Office", location: "Bangalore, India", employees: 85, devices: 3, status: "Active" },
  { id: 3, name: "Sales Office", location: "Delhi, India", employees: 32, devices: 2, status: "Active" },
  { id: 4, name: "Support Center", location: "Hyderabad, India", employees: 45, devices: 2, status: "Inactive" },
  { id: 5, name: "R&D Center", location: "Pune, India", employees: 28, devices: 2, status: "Active" },
  { id: 6, name: "Branch Office", location: "Chennai, India", employees: 18, devices: 1, status: "Active" },
];

type SortField = "name" | "location" | "employees" | "devices" | "status";
type SortDirection = "asc" | "desc" | null;

const Organizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [locationFilters, setLocationFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const allStatuses = Array.from(new Set(organizations.map(o => o.status)));
  const allLocations = Array.from(new Set(organizations.map(o => o.location)));

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

  const handleEdit = (org: Organization) => {
    setSelectedOrganization(org);
    setIsEditModalOpen(true);
  };

  const handleDelete = (org: Organization) => {
    setSelectedOrganization(org);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = (updatedOrg: Organization) => {
    setOrganizations(organizations.map(o => o.id === updatedOrg.id ? updatedOrg : o));
  };

  const handleConfirmDelete = () => {
    if (selectedOrganization) {
      setOrganizations(organizations.filter(o => o.id !== selectedOrganization.id));
    }
    setIsDeleteModalOpen(false);
    setSelectedOrganization(null);
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="px-6 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Organizations</h1>
            <p className="text-sm text-muted-foreground">Manage offices and biometric devices</p>
          </div>
          <Button className="bg-primary text-primary-foreground" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Organization
          </Button>
        </div>

        {/* Search and View Toggle */}
        <div className="widget-card mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search organizations..." 
                  className="pl-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={hasActiveFilters ? "border-primary text-primary" : ""}>
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
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">
                          Clear all
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Status</Label>
                      {allStatuses.map(status => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`org-status-${status}`}
                            checked={statusFilters.includes(status)}
                            onCheckedChange={() => toggleStatusFilter(status)}
                          />
                          <label htmlFor={`org-status-${status}`} className="text-sm cursor-pointer">{status}</label>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Location</Label>
                      {allLocations.map(location => (
                        <div key={location} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`org-loc-${location}`}
                            checked={locationFilters.includes(location)}
                            onCheckedChange={() => toggleLocationFilter(location)}
                          />
                          <label htmlFor={`org-loc-${location}`} className="text-sm cursor-pointer">{location}</label>
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
              <div key={org.id} className="widget-card hover:shadow-md transition-shadow cursor-pointer group">
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
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <TableRow className="bg-primary hover:bg-primary">
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

      <AddOrganizationModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      <EditOrganizationModal 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen} 
        organization={selectedOrganization}
        onSave={handleSaveEdit}
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
