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

interface Organization {
  id: number;
  name: string;
  location: string;
  employees: number;
  devices: number;
  status: string;
}

interface EditOrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization | null;
  onSave: (organization: Organization) => void;
}

export function EditOrganizationModal({ open, onOpenChange, organization, onSave }: EditOrganizationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    devices: 0,
    status: "Active",
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        location: organization.location,
        devices: organization.devices,
        status: organization.status,
      });
    }
  }, [organization]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (organization) {
      onSave({
        ...organization,
        ...formData,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-org-name">Organization Name</Label>
            <Input
              id="edit-org-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter organization name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-org-location">Location</Label>
            <Input
              id="edit-org-location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter location"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-org-devices">Number of Devices</Label>
              <Input
                id="edit-org-devices"
                type="number"
                value={formData.devices}
                onChange={(e) => setFormData({ ...formData, devices: parseInt(e.target.value) || 0 })}
                placeholder="Enter device count"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-org-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
