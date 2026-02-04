import { Header } from "@/components/dashboard/Header";
import { Search, Plus, Building, MapPin, Users, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const organizations = [
  { id: 1, name: "Headquarters", location: "Mumbai, India", employees: 120, devices: 4, status: "Active" },
  { id: 2, name: "Tech Park Office", location: "Bangalore, India", employees: 85, devices: 3, status: "Active" },
  { id: 3, name: "Sales Office", location: "Delhi, India", employees: 32, devices: 2, status: "Active" },
  { id: 4, name: "Support Center", location: "Hyderabad, India", employees: 45, devices: 2, status: "Inactive" },
  { id: 5, name: "R&D Center", location: "Pune, India", employees: 28, devices: 2, status: "Active" },
  { id: 6, name: "Branch Office", location: "Chennai, India", employees: 18, devices: 1, status: "Active" },
];

const Organizations = () => {
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
          <Button className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Organization
          </Button>
        </div>

        {/* Search */}
        <div className="widget-card mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search organizations..." className="pl-9" />
          </div>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {organizations.map((org) => (
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
      </main>
    </div>
  );
};

export default Organizations;
