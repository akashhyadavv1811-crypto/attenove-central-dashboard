import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Search, Plus, Building, MapPin, Users, MoreHorizontal, LayoutGrid, List, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddOrganizationModal } from "@/components/modals/AddOrganizationModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const organizations = [
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
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

  const filteredAndSortedData = organizations
    .filter((org) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        org.name.toLowerCase().includes(query) ||
        org.location.toLowerCase().includes(query) ||
        org.status.toLowerCase().includes(query)
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
            <h1 className="text-2xl font-semibold text-foreground">Organizations</h1>
            <p className="text-sm text-muted-foreground">Manage offices and biometric devices</p>
          </div>
          <Button className="bg-primary text-primary-foreground" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Organization
          </Button>
        </div>

        {/* Search and View Toggle */}
        <div className="widget-card mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search organizations..." 
                className="pl-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                    <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
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
                    <TableHead className="text-primary-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedData.map((org) => (
                    <TableRow key={org.id}>
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
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>

      <AddOrganizationModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
};

export default Organizations;
