import { useState, Fragment } from "react";
import { Header } from "@/components/dashboard/Header";
import { 
  Search, Plus, Filter, Download, Pencil, Trash2, ArrowUpDown, 
  ChevronUp, ChevronDown, X, Shield, Users, Key, Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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
import { AddRoleModal } from "@/components/modals/AddRoleModal";
import { EditRoleModal } from "@/components/modals/EditRoleModal";
import { AddUserModal } from "@/components/modals/AddUserModal";
import { EditUserModal } from "@/components/modals/EditUserModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { format } from "date-fns";

// Types
interface Permission {
  module: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
  filter: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  usersCount: number;
  createdAt: Date;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: string;
  customPermissions: Permission[] | null;
  lastLogin: Date;
}

// Initial Data
const modules = ["Dashboard", "Employees", "Organizations", "Shifts", "Reports", "Access Control"];

const defaultPermissions: Permission[] = modules.map(module => ({
  module,
  create: false,
  read: false,
  update: false,
  delete: false,
  export: false,
  filter: false,
}));

const initialRoles: Role[] = [
  {
    id: "ROLE001",
    name: "Super Admin",
    description: "Full access to all modules and features",
    permissions: modules.map(module => ({
      module,
      create: true,
      read: true,
      update: true,
      delete: true,
      export: true,
      filter: true,
    })),
    usersCount: 2,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "ROLE002",
    name: "Manager",
    description: "Can manage employees and view reports",
    permissions: modules.map(module => ({
      module,
      create: module !== "Access Control",
      read: true,
      update: module !== "Access Control",
      delete: module === "Employees" || module === "Shifts",
      export: true,
      filter: true,
    })),
    usersCount: 5,
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "ROLE003",
    name: "Employee",
    description: "Basic access to view own data",
    permissions: modules.map(module => ({
      module,
      create: false,
      read: module !== "Access Control",
      update: false,
      delete: false,
      export: false,
      filter: module !== "Access Control",
    })),
    usersCount: 45,
    createdAt: new Date("2024-01-25"),
  },
  {
    id: "ROLE004",
    name: "HR Executive",
    description: "Full access to employee management",
    permissions: modules.map(module => ({
      module,
      create: module === "Employees" || module === "Organizations",
      read: true,
      update: module === "Employees" || module === "Organizations",
      delete: module === "Employees",
      export: true,
      filter: true,
    })),
    usersCount: 3,
    createdAt: new Date("2024-02-01"),
  },
];

const initialUsers: User[] = [
  { id: "USR001", name: "Priya Sharma", email: "priya.sharma@company.com", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", role: "Super Admin", status: "Active", customPermissions: null, lastLogin: new Date("2024-12-20") },
  { id: "USR002", name: "Rahul Verma", email: "rahul.verma@company.com", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", role: "Manager", status: "Active", customPermissions: null, lastLogin: new Date("2024-12-19") },
  { id: "USR003", name: "Sneha Patel", email: "sneha.patel@company.com", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", role: "Employee", status: "Active", customPermissions: null, lastLogin: new Date("2024-12-18") },
  { id: "USR004", name: "Amit Singh", email: "amit.singh@company.com", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", role: "Manager", status: "On Leave", customPermissions: null, lastLogin: new Date("2024-12-15") },
  { id: "USR005", name: "Kavita Reddy", email: "kavita.reddy@company.com", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", role: "HR Executive", status: "Active", customPermissions: [
    { module: "Employees", create: true, read: true, update: true, delete: true, export: true, filter: true },
    { module: "Reports", create: false, read: true, update: false, delete: false, export: true, filter: true },
  ], lastLogin: new Date("2024-12-20") },
  { id: "USR006", name: "Vikram Joshi", email: "vikram.joshi@company.com", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100", role: "Super Admin", status: "Active", customPermissions: null, lastLogin: new Date("2024-12-20") },
];

type RoleSortField = "name" | "usersCount" | "createdAt";
type UserSortField = "name" | "email" | "role" | "status" | "lastLogin";
type SortDirection = "asc" | "desc" | null;

const AccessControl = () => {
  const [activeTab, setActiveTab] = useState("roles");
  
  // Roles State
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [roleSortField, setRoleSortField] = useState<RoleSortField | null>(null);
  const [roleSortDirection, setRoleSortDirection] = useState<SortDirection>(null);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [isDeleteRoleModalOpen, setIsDeleteRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  
  // Users State
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSortField, setUserSortField] = useState<UserSortField | null>(null);
  const [userSortDirection, setUserSortDirection] = useState<SortDirection>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilters, setRoleFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  // Role Sorting
  const handleRoleSort = (field: RoleSortField) => {
    if (roleSortField === field) {
      if (roleSortDirection === "asc") {
        setRoleSortDirection("desc");
      } else if (roleSortDirection === "desc") {
        setRoleSortField(null);
        setRoleSortDirection(null);
      }
    } else {
      setRoleSortField(field);
      setRoleSortDirection("asc");
    }
  };

  const getRoleSortIcon = (field: RoleSortField) => {
    if (roleSortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (roleSortDirection === "asc") return <ChevronUp className="h-4 w-4" />;
    return <ChevronDown className="h-4 w-4" />;
  };

  // User Sorting
  const handleUserSort = (field: UserSortField) => {
    if (userSortField === field) {
      if (userSortDirection === "asc") {
        setUserSortDirection("desc");
      } else if (userSortDirection === "desc") {
        setUserSortField(null);
        setUserSortDirection(null);
      }
    } else {
      setUserSortField(field);
      setUserSortDirection("asc");
    }
  };

  const getUserSortIcon = (field: UserSortField) => {
    if (userSortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (userSortDirection === "asc") return <ChevronUp className="h-4 w-4" />;
    return <ChevronDown className="h-4 w-4" />;
  };

  // Filtered and Sorted Roles
  const filteredAndSortedRoles = roles
    .filter(role => {
      const matchesSearch = role.name.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(roleSearchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (!roleSortField || !roleSortDirection) return 0;
      let comparison = 0;
      switch (roleSortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "usersCount":
          comparison = a.usersCount - b.usersCount;
          break;
        case "createdAt":
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }
      return roleSortDirection === "asc" ? comparison : -comparison;
    });

  // Filtered and Sorted Users
  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(userSearchQuery.toLowerCase());
      const matchesRole = roleFilters.length === 0 || roleFilters.includes(user.role);
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(user.status);
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      if (!userSortField || !userSortDirection) return 0;
      let comparison = 0;
      switch (userSortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "role":
          comparison = a.role.localeCompare(b.role);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "lastLogin":
          comparison = a.lastLogin.getTime() - b.lastLogin.getTime();
          break;
      }
      return userSortDirection === "asc" ? comparison : -comparison;
    });

  // Filter Options
  const uniqueRoles = [...new Set(users.map(u => u.role))];
  const uniqueStatuses = [...new Set(users.map(u => u.status))];

  // Role Filter Handlers
  const toggleRoleFilter = (role: string) => {
    setRoleFilters(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const clearAllFilters = () => {
    setRoleFilters([]);
    setStatusFilters([]);
  };

  const hasActiveFilters = roleFilters.length > 0 || statusFilters.length > 0;

  // Export Functions
  const exportRolesToCSV = () => {
    const headers = ["ID", "Name", "Description", "Users Count", "Created At"];
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedRoles.map(role => [
        role.id,
        `"${role.name}"`,
        `"${role.description}"`,
        role.usersCount,
        format(role.createdAt, "yyyy-MM-dd"),
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `roles_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const exportUsersToCSV = () => {
    const headers = ["ID", "Name", "Email", "Role", "Status", "Has Custom Permissions", "Last Login"];
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedUsers.map(user => [
        user.id,
        `"${user.name}"`,
        user.email,
        user.role,
        user.status,
        user.customPermissions ? "Yes" : "No",
        format(user.lastLogin, "yyyy-MM-dd"),
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `users_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  // Role CRUD Handlers
  const handleAddRole = (newRole: Omit<Role, "id" | "usersCount" | "createdAt">) => {
    const role: Role = {
      ...newRole,
      id: `ROLE${String(roles.length + 1).padStart(3, "0")}`,
      usersCount: 0,
      createdAt: new Date(),
    };
    setRoles([...roles, role]);
    setIsAddRoleModalOpen(false);
  };

  const handleEditRole = (updatedRole: Role) => {
    setRoles(roles.map(r => r.id === updatedRole.id ? updatedRole : r));
    setIsEditRoleModalOpen(false);
    setSelectedRole(null);
  };

  const handleDeleteRole = () => {
    if (selectedRole) {
      setRoles(roles.filter(r => r.id !== selectedRole.id));
      setIsDeleteRoleModalOpen(false);
      setSelectedRole(null);
    }
  };

  // User CRUD Handlers
  const handleAddUser = (newUser: Omit<User, "id" | "lastLogin">) => {
    const user: User = {
      ...newUser,
      id: `USR${String(users.length + 1).padStart(3, "0")}`,
      lastLogin: new Date(),
    };
    setUsers([...users, user]);
    setIsAddUserModalOpen(false);
  };

  const handleEditUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setIsEditUserModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setIsDeleteUserModalOpen(false);
      setSelectedUser(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "On Leave": return "bg-yellow-100 text-yellow-800";
      case "Inactive": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Access Control</h1>
          </div>
          <p className="text-muted-foreground">Manage roles, permissions, and user access</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-2 md:w-auto">
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Roles & Permissions
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
            </TabsList>

            {activeTab === "roles" && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end w-full md:w-auto">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search roles..."
                    value={roleSearchQuery}
                    onChange={(e) => setRoleSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={exportRolesToCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm" onClick={() => setIsAddRoleModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Role
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end w-full md:w-auto">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                        {hasActiveFilters && (
                          <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                            {roleFilters.length + statusFilters.length}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 bg-popover" align="end">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Role</h4>
                          <div className="space-y-2">
                            {uniqueRoles.map((role) => (
                              <div key={role} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`role-${role}`}
                                  checked={roleFilters.includes(role)}
                                  onCheckedChange={() => toggleRoleFilter(role)}
                                />
                                <Label htmlFor={`role-${role}`} className="text-sm">{role}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Status</h4>
                          <div className="space-y-2">
                            {uniqueStatuses.map((status) => (
                              <div key={status} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`status-${status}`}
                                  checked={statusFilters.includes(status)}
                                  onCheckedChange={() => toggleStatusFilter(status)}
                                />
                                <Label htmlFor={`status-${status}`} className="text-sm">{status}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        {hasActiveFilters && (
                          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="w-full">
                            Clear all filters
                          </Button>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button variant="outline" size="sm" onClick={exportUsersToCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm" onClick={() => setIsAddUserModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-4">
            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary dark:bg-card dark:hover:bg-card">
                    <TableHead 
                      className="text-primary-foreground cursor-pointer"
                      onClick={() => handleRoleSort("name")}
                    >
                      <div className="flex items-center gap-2">
                        Role Name {getRoleSortIcon("name")}
                      </div>
                    </TableHead>
                    <TableHead className="text-primary-foreground">Description</TableHead>
                    <TableHead 
                      className="text-primary-foreground cursor-pointer"
                      onClick={() => handleRoleSort("usersCount")}
                    >
                      <div className="flex items-center gap-2">
                        Users {getRoleSortIcon("usersCount")}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-primary-foreground cursor-pointer"
                      onClick={() => handleRoleSort("createdAt")}
                    >
                      <div className="flex items-center gap-2">
                        Created {getRoleSortIcon("createdAt")}
                      </div>
                    </TableHead>
                    <TableHead className="text-primary-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedRoles.map((role) => (
                    <Fragment key={role.id}>
                      <TableRow 
                        className="cursor-pointer"
                        onClick={() => setExpandedRoleId(expandedRoleId === role.id ? null : role.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <span className="font-medium">{role.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{role.description}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{role.usersCount} users</Badge>
                        </TableCell>
                        <TableCell>{format(role.createdAt, "MMM dd, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedRole(role);
                                setIsEditRoleModalOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedRole(role);
                                setIsDeleteRoleModalOpen(true);
                              }}
                              disabled={role.name === "Super Admin"}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedRoleId === role.id && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-muted/30 p-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold flex items-center gap-2">
                                <Settings2 className="h-4 w-4" />
                                Permissions Matrix
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left p-2 font-medium">Module</th>
                                      <th className="text-center p-2 font-medium">Create</th>
                                      <th className="text-center p-2 font-medium">Read</th>
                                      <th className="text-center p-2 font-medium">Update</th>
                                      <th className="text-center p-2 font-medium">Delete</th>
                                      <th className="text-center p-2 font-medium">Export</th>
                                      <th className="text-center p-2 font-medium">Filter</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {role.permissions.map((perm) => (
                                      <tr key={perm.module} className="border-b last:border-0">
                                        <td className="p-2 font-medium">{perm.module}</td>
                                        <td className="text-center p-2">
                                          <Checkbox checked={perm.create} disabled />
                                        </td>
                                        <td className="text-center p-2">
                                          <Checkbox checked={perm.read} disabled />
                                        </td>
                                        <td className="text-center p-2">
                                          <Checkbox checked={perm.update} disabled />
                                        </td>
                                        <td className="text-center p-2">
                                          <Checkbox checked={perm.delete} disabled />
                                        </td>
                                        <td className="text-center p-2">
                                          <Checkbox checked={perm.export} disabled />
                                        </td>
                                        <td className="text-center p-2">
                                          <Checkbox checked={perm.filter} disabled />
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {roleFilters.map((role) => (
                  <Badge key={role} variant="secondary" className="flex items-center gap-1">
                    {role}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleRoleFilter(role)} />
                  </Badge>
                ))}
                {statusFilters.map((status) => (
                  <Badge key={status} variant="secondary" className="flex items-center gap-1">
                    {status}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleStatusFilter(status)} />
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear all
                </Button>
              </div>
            )}

            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary dark:bg-card dark:hover:bg-card">
                    <TableHead 
                      className="text-primary-foreground cursor-pointer"
                      onClick={() => handleUserSort("name")}
                    >
                      <div className="flex items-center gap-2">
                        User {getUserSortIcon("name")}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-primary-foreground cursor-pointer"
                      onClick={() => handleUserSort("email")}
                    >
                      <div className="flex items-center gap-2">
                        Email {getUserSortIcon("email")}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-primary-foreground cursor-pointer"
                      onClick={() => handleUserSort("role")}
                    >
                      <div className="flex items-center gap-2">
                        Role {getUserSortIcon("role")}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-primary-foreground cursor-pointer"
                      onClick={() => handleUserSort("status")}
                    >
                      <div className="flex items-center gap-2">
                        Status {getUserSortIcon("status")}
                      </div>
                    </TableHead>
                    <TableHead className="text-primary-foreground">Custom Permissions</TableHead>
                    <TableHead 
                      className="text-primary-foreground cursor-pointer"
                      onClick={() => handleUserSort("lastLogin")}
                    >
                      <div className="flex items-center gap-2">
                        Last Login {getUserSortIcon("lastLogin")}
                      </div>
                    </TableHead>
                    <TableHead className="text-primary-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.customPermissions ? (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <Key className="h-3 w-3" />
                            Custom
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Inherits from role</span>
                        )}
                      </TableCell>
                      <TableCell>{format(user.lastLogin, "MMM dd, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditUserModalOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteUserModalOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <AddRoleModal
        isOpen={isAddRoleModalOpen}
        onClose={() => setIsAddRoleModalOpen(false)}
        onAdd={handleAddRole}
        modules={modules}
      />

      <EditRoleModal
        isOpen={isEditRoleModalOpen}
        onClose={() => {
          setIsEditRoleModalOpen(false);
          setSelectedRole(null);
        }}
        onSave={handleEditRole}
        role={selectedRole}
        modules={modules}
      />

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onAdd={handleAddUser}
        roles={roles}
        modules={modules}
      />

      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => {
          setIsEditUserModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleEditUser}
        user={selectedUser}
        roles={roles}
        modules={modules}
      />

      <DeleteConfirmationModal
        open={isDeleteRoleModalOpen}
        onOpenChange={(open) => {
          setIsDeleteRoleModalOpen(open);
          if (!open) setSelectedRole(null);
        }}
        onConfirm={handleDeleteRole}
        title="Delete Role"
        description={`Are you sure you want to delete the role "${selectedRole?.name}"? This action cannot be undone.`}
      />

      <DeleteConfirmationModal
        open={isDeleteUserModalOpen}
        onOpenChange={(open) => {
          setIsDeleteUserModalOpen(open);
          if (!open) setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        description={`Are you sure you want to delete the user "${selectedUser?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default AccessControl;
