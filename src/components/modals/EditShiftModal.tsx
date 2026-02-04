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
  type?: string;
}

interface EditShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift | null;
  onSave: (shift: Shift) => void;
}

// Helper to convert "09:00 AM" format to "09:00" for time input
const convertToTimeInput = (timeStr: string): string => {
  if (!timeStr) return "";
  // If already in 24h format
  if (!timeStr.includes("AM") && !timeStr.includes("PM")) {
    return timeStr;
  }
  const [time, period] = timeStr.split(" ");
  const [hours, minutes] = time.split(":");
  let h = parseInt(hours);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${h.toString().padStart(2, "0")}:${minutes}`;
};

// Helper to convert "60 min" format to "60" for select
const convertToBreakValue = (breakStr: string): string => {
  if (!breakStr) return "";
  const match = breakStr.match(/(\d+)/);
  return match ? match[1] : "";
};

export function EditShiftModal({ open, onOpenChange, shift, onSave }: EditShiftModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    breakDuration: "",
    type: "",
  });

  useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name,
        startTime: convertToTimeInput(shift.startTime),
        endTime: convertToTimeInput(shift.endTime),
        breakDuration: convertToBreakValue(shift.breakTime),
        type: shift.type || "fixed",
      });
    }
  }, [shift]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shift) {
      // Convert back to display format
      const formatTime = (time: string) => {
        if (!time) return "";
        const [hours, minutes] = time.split(":");
        let h = parseInt(hours);
        const period = h >= 12 ? "PM" : "AM";
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        return `${h.toString().padStart(2, "0")}:${minutes} ${period}`;
      };

      onSave({
        ...shift,
        name: formData.name,
        startTime: formatTime(formData.startTime),
        endTime: formatTime(formData.endTime),
        breakTime: formData.breakDuration ? `${formData.breakDuration} min` : shift.breakTime,
        type: formData.type,
      });
    }
    onOpenChange(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen && shift) {
      setFormData({
        name: shift.name,
        startTime: convertToTimeInput(shift.startTime),
        endTime: convertToTimeInput(shift.endTime),
        breakDuration: convertToBreakValue(shift.breakTime),
        type: shift.type || "fixed",
      });
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Shift</DialogTitle>
          <DialogDescription>
            Update the shift details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-shift-name">Shift Name</Label>
              <Input
                id="edit-shift-name"
                placeholder="e.g. Morning Shift, Night Shift"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-start-time">Start Time</Label>
                <Input
                  id="edit-start-time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-end-time">End Time</Label>
                <Input
                  id="edit-end-time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-break-duration">Break Duration</Label>
                <Select
                  value={formData.breakDuration}
                  onValueChange={(value) => setFormData({ ...formData, breakDuration: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-shift-type">Shift Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                    <SelectItem value="rotational">Rotational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
