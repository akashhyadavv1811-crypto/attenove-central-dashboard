import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Organization {
  id: number;
  name: string;
  location: string;
  address?: string;
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
    address: "",
    devices: "",
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        location: organization.location,
        address: organization.address || "",
        devices: organization.devices.toString(),
      });
    }
  }, [organization]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (organization) {
      onSave({
        ...organization,
        name: formData.name,
        location: formData.location,
        address: formData.address,
        devices: parseInt(formData.devices) || 0,
      });
    }
    onOpenChange(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen && organization) {
      setFormData({
        name: organization.name,
        location: organization.location,
        address: organization.address || "",
        devices: organization.devices.toString(),
      });
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogDescription>
            Update the organization details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-org-name">Organization Name</Label>
              <Input
                id="edit-org-name"
                placeholder="e.g. Headquarters, Tech Park Office"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">City/Location</Label>
              <Input
                id="edit-location"
                placeholder="e.g. Mumbai, India"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Full Address</Label>
              <Textarea
                id="edit-address"
                placeholder="Enter complete address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-devices">Number of Biometric Devices</Label>
              <Input
                id="edit-devices"
                type="number"
                placeholder="e.g. 2"
                min="1"
                value={formData.devices}
                onChange={(e) => setFormData({ ...formData, devices: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-row justify-between sm:justify-between">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
