import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: string;
  avatar: string;
}

interface EditEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSave: (employee: Employee) => void;
}

export function EditEmployeeModal({ open, onOpenChange, employee, onSave }: EditEmployeeModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    role: "",
    status: "Active",
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        department: employee.department,
        role: employee.role,
        status: employee.status,
      });
    }
  }, [employee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (employee) {
      onSave({
        ...employee,
        ...formData,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-emp-name">Full Name</Label>
            <Input
              id="edit-emp-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-emp-email">Email</Label>
            <Input
              id="edit-emp-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-emp-department">Department</Label>
              <Input
                id="edit-emp-department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Enter department"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emp-role">Role</Label>
              <Input
                id="edit-emp-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Enter role"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-emp-status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="flex flex-row justify-between sm:justify-between">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
