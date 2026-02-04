import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user: User | null;
  roles: Role[];
  modules: string[];
}

export const EditUserModal = ({ isOpen, onClose, onSave, user, roles, modules }: EditUserModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [status, setStatus] = useState("Active");
  const [useCustomPermissions, setUseCustomPermissions] = useState(false);
  const [customPermissions, setCustomPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setSelectedRole(user.role);
      setStatus(user.status);
      setUseCustomPermissions(user.customPermissions !== null);
      setCustomPermissions(
        user.customPermissions || modules.map(module => ({
          module,
          create: false,
          read: false,
          update: false,
          delete: false,
          export: false,
          filter: false,
        }))
      );
    }
  }, [user, modules]);

  const handlePermissionChange = (moduleIndex: number, field: keyof Omit<Permission, "module">, value: boolean) => {
    const updated = [...customPermissions];
    updated[moduleIndex] = { ...updated[moduleIndex], [field]: value };
    setCustomPermissions(updated);
  };

  const handleSelectAllForModule = (moduleIndex: number, selectAll: boolean) => {
    const updated = [...customPermissions];
    updated[moduleIndex] = {
      ...updated[moduleIndex],
      create: selectAll,
      read: selectAll,
      update: selectAll,
      delete: selectAll,
      export: selectAll,
      filter: selectAll,
    };
    setCustomPermissions(updated);
  };

  const isAllSelected = (perm: Permission) => {
    return perm.create && perm.read && perm.update && perm.delete && perm.export && perm.filter;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && name.trim() && email.trim() && selectedRole) {
      onSave({
        ...user,
        name,
        email,
        role: selectedRole,
        status,
        customPermissions: useCustomPermissions ? customPermissions : null,
      });
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Modify user details and permissions.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="flex-1 min-h-0 pr-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@company.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-md bg-muted/30">
                <div>
                  <Label htmlFor="custom-permissions" className="font-medium">Custom Permissions</Label>
                  <p className="text-sm text-muted-foreground">Override role permissions for this user</p>
                </div>
                <Switch
                  id="custom-permissions"
                  checked={useCustomPermissions}
                  onCheckedChange={setUseCustomPermissions}
                />
              </div>

              {useCustomPermissions && (
                <div className="space-y-2">
                  <Label>Custom Permission Matrix</Label>
                  <div className="border rounded-md p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Module</th>
                          <th className="text-center p-2 font-medium">All</th>
                          <th className="text-center p-2 font-medium">Create</th>
                          <th className="text-center p-2 font-medium">Read</th>
                          <th className="text-center p-2 font-medium">Update</th>
                          <th className="text-center p-2 font-medium">Delete</th>
                          <th className="text-center p-2 font-medium">Export</th>
                          <th className="text-center p-2 font-medium">Filter</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customPermissions.map((perm, index) => (
                          <tr key={perm.module} className="border-b last:border-0">
                            <td className="p-2 font-medium">{perm.module}</td>
                            <td className="text-center p-2">
                              <Checkbox
                                checked={isAllSelected(perm)}
                                onCheckedChange={(checked) => handleSelectAllForModule(index, !!checked)}
                              />
                            </td>
                            <td className="text-center p-2">
                              <Checkbox
                                checked={perm.create}
                                onCheckedChange={(checked) => handlePermissionChange(index, "create", !!checked)}
                              />
                            </td>
                            <td className="text-center p-2">
                              <Checkbox
                                checked={perm.read}
                                onCheckedChange={(checked) => handlePermissionChange(index, "read", !!checked)}
                              />
                            </td>
                            <td className="text-center p-2">
                              <Checkbox
                                checked={perm.update}
                                onCheckedChange={(checked) => handlePermissionChange(index, "update", !!checked)}
                              />
                            </td>
                            <td className="text-center p-2">
                              <Checkbox
                                checked={perm.delete}
                                onCheckedChange={(checked) => handlePermissionChange(index, "delete", !!checked)}
                              />
                            </td>
                            <td className="text-center p-2">
                              <Checkbox
                                checked={perm.export}
                                onCheckedChange={(checked) => handlePermissionChange(index, "export", !!checked)}
                              />
                            </td>
                            <td className="text-center p-2">
                              <Checkbox
                                checked={perm.filter}
                                onCheckedChange={(checked) => handlePermissionChange(index, "filter", !!checked)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="mt-6 flex justify-between">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
