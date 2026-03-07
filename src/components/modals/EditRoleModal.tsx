import { useState, useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: Role) => void;
  role: Role | null;
  modules: string[];
}

export const EditRoleModal = ({ isOpen, onClose, onSave, role, modules }: EditRoleModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setPermissions(role.permissions);
    }
  }, [role]);

  const handlePermissionChange = (moduleIndex: number, field: keyof Omit<Permission, "module">, value: boolean) => {
    const updated = [...permissions];
    updated[moduleIndex] = { ...updated[moduleIndex], [field]: value };
    setPermissions(updated);
  };

  const handleSelectAllForModule = (moduleIndex: number, selectAll: boolean) => {
    const updated = [...permissions];
    updated[moduleIndex] = {
      ...updated[moduleIndex],
      create: selectAll,
      read: selectAll,
      update: selectAll,
      delete: selectAll,
      export: selectAll,
      filter: selectAll,
    };
    setPermissions(updated);
  };

  const isAllSelected = (perm: Permission) => {
    return perm.create && perm.read && perm.update && perm.delete && perm.export && perm.filter;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role && name.trim()) {
      onSave({
        ...role,
        name,
        description,
        permissions,
      });
    }
  };

  if (!role) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <div className="bg-primary text-primary-foreground px-6 pt-10 pb-3 rounded-t-lg sm:rounded-t-lg">
          <DialogTitle className="text-lg font-semibold text-white">Edit Role</DialogTitle>
          <DialogDescription className="text-xs text-white/70 mt-0.5">
            Modify the role details and permissions.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Team Lead"
                  required
                  disabled={role.name === "Super Admin"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the role"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <ScrollArea className="h-[300px] border rounded-md p-4">
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
                    {permissions.map((perm, index) => (
                      <tr key={perm.module} className="border-b last:border-0">
                        <td className="p-2 font-medium">{perm.module}</td>
                        <td className="text-center p-2">
                          <Checkbox
                            checked={isAllSelected(perm)}
                            onCheckedChange={(checked) => handleSelectAllForModule(index, !!checked)}
                            disabled={role.name === "Super Admin"}
                          />
                        </td>
                        <td className="text-center p-2">
                          <Checkbox
                            checked={perm.create}
                            onCheckedChange={(checked) => handlePermissionChange(index, "create", !!checked)}
                            disabled={role.name === "Super Admin"}
                          />
                        </td>
                        <td className="text-center p-2">
                          <Checkbox
                            checked={perm.read}
                            onCheckedChange={(checked) => handlePermissionChange(index, "read", !!checked)}
                            disabled={role.name === "Super Admin"}
                          />
                        </td>
                        <td className="text-center p-2">
                          <Checkbox
                            checked={perm.update}
                            onCheckedChange={(checked) => handlePermissionChange(index, "update", !!checked)}
                            disabled={role.name === "Super Admin"}
                          />
                        </td>
                        <td className="text-center p-2">
                          <Checkbox
                            checked={perm.delete}
                            onCheckedChange={(checked) => handlePermissionChange(index, "delete", !!checked)}
                            disabled={role.name === "Super Admin"}
                          />
                        </td>
                        <td className="text-center p-2">
                          <Checkbox
                            checked={perm.export}
                            onCheckedChange={(checked) => handlePermissionChange(index, "export", !!checked)}
                            disabled={role.name === "Super Admin"}
                          />
                        </td>
                        <td className="text-center p-2">
                          <Checkbox
                            checked={perm.filter}
                            onCheckedChange={(checked) => handlePermissionChange(index, "filter", !!checked)}
                            disabled={role.name === "Super Admin"}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter className="flex justify-between border-t border-border px-6 py-4 bg-muted/20">
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
