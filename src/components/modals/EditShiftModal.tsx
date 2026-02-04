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

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  breakTime: string;
  employees: number;
  status: string;
}

interface EditShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift | null;
  onSave: (shift: Shift) => void;
}

export function EditShiftModal({ open, onOpenChange, shift, onSave }: EditShiftModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    breakTime: "",
    status: "Active",
  });

  useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        breakTime: shift.breakTime,
        status: shift.status,
      });
    }
  }, [shift]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shift) {
      onSave({
        ...shift,
        ...formData,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Shift</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Shift Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter shift name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startTime">Start Time</Label>
              <Input
                id="edit-startTime"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                placeholder="e.g. 09:00 AM"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endTime">End Time</Label>
              <Input
                id="edit-endTime"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                placeholder="e.g. 06:00 PM"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-breakTime">Break Duration</Label>
              <Input
                id="edit-breakTime"
                value={formData.breakTime}
                onChange={(e) => setFormData({ ...formData, breakTime: e.target.value })}
                placeholder="e.g. 60 min"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
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
