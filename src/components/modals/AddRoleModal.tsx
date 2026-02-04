import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (role: { name: string; description: string; permissions: Permission[] }) => void;
  modules: string[];
}

export const AddRoleModal = ({ isOpen, onClose, onAdd, modules }: AddRoleModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>(
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
    if (name.trim()) {
      onAdd({ name, description, permissions });
      handleClose();
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setPermissions(
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
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Role</DialogTitle>
          <DialogDescription>Create a new role with specific permissions for each module.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Team Lead"
                  required
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
              </ScrollArea>
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-between">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Add Role</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
