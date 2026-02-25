import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (user: {
    name: string;
    email: string;
    avatar: string;
    role: string;
    status: string;
    customPermissions: Permission[] | null;
  }) => void;
  roles: Role[];
  modules: string[];
}

export const AddUserModal = ({ isOpen, onClose, onAdd, roles, modules }: AddUserModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [status, setStatus] = useState("Active");
  const [useCustomPermissions, setUseCustomPermissions] = useState(false);
  const [customPermissions, setCustomPermissions] = useState<Permission[]>(
    modules.map(module => ({
      module,
      create: false,
      read: false,
      update: false,
      delete: false,
      export: false,
      filter: false,
    }))
  );

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
    if (name.trim() && email.trim() && selectedRole) {
      onAdd({
        name,
        email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        role: selectedRole,
        status,
        customPermissions: useCustomPermissions ? customPermissions : null,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setSelectedRole("");
    setStatus("Active");
    setUseCustomPermissions(false);
    setCustomPermissions(
      modules.map(module => ({
        module,
        create: false,
        read: false,
        update: false,
        delete: false,
        export: false,
        filter: false,
      }))
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
        <div className="bg-primary text-primary-foreground px-6 pt-10 pb-3 shrink-0 rounded-t-lg sm:rounded-t-lg">
          <DialogTitle className="text-lg font-semibold text-white">Add New User</DialogTitle>
          <p className="text-xs text-white/70 mt-0.5">Create a new user and assign a role with optional custom permissions.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[60vh] px-6 pr-4">
            <div className="space-y-4 py-5">
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
                  <Select value={selectedRole} onValueChange={setSelectedRole} required>
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

          <DialogFooter className="flex justify-between border-t border-border px-6 py-4 bg-muted/20">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Add User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
