import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { updateShift, type ApiShift, type UpdateShiftPayload } from "@/lib/api";

export interface ShiftForEdit {
  id: number;
  officeId: number;
  officeName?: string;
  name: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  isNightShift: boolean;
  isActive: boolean;
  status: string;
}

interface EditShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: ShiftForEdit | null;
  onSave: (updated: ApiShift) => void;
}

// Normalize "HH:MM" or "HH:MM:SS" to "HH:MM" for time input
function toTimeInput(value: string | null | undefined): string {
  if (!value) return "";
  const s = value.trim();
  const part = s.split(":")[0];
  const part2 = s.split(":")[1];
  if (part !== undefined && part2 !== undefined) {
    return `${part.padStart(2, "0")}:${part2.padStart(2, "0")}`;
  }
  return s.length >= 5 ? s.slice(0, 5) : s;
}

export function EditShiftModal({ open, onOpenChange, shift, onSave }: EditShiftModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    graceMinutes: 0,
    isNightShift: false,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name,
        startTime: toTimeInput(shift.startTime),
        endTime: toTimeInput(shift.endTime),
        graceMinutes: shift.graceMinutes,
        isNightShift: shift.isNightShift,
        isActive: shift.isActive,
      });
    }
  }, [shift]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shift) return;
    setError(null);
    if (!formData.name.trim() || !formData.startTime || !formData.endTime) {
      setError("Name, start time and end time are required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload: UpdateShiftPayload = {
        name: formData.name.trim(),
        start_time: formData.startTime,
        end_time: formData.endTime,
        grace_minutes: Math.max(0, formData.graceMinutes),
        is_night_shift: formData.isNightShift,
        is_active: formData.isActive,
      };
      const updated = await updateShift(shift.id, payload);
      onSave(updated);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update shift");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) setError(null);
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] p-0 gap-0">
        <div className="bg-primary text-primary-foreground px-6 pt-10 pb-3 rounded-t-lg sm:rounded-t-lg">
          <DialogTitle className="text-lg font-semibold text-white">Edit Shift</DialogTitle>
          <DialogDescription className="text-xs text-white/70 mt-0.5">
            Update the shift details below.
          </DialogDescription>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 px-6 py-5">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
            )}
            {shift && (
              <p className="text-sm text-muted-foreground">
                Office: {shift.officeName ?? `ID ${shift.officeId}`}
              </p>
            )}
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
            <div className="grid gap-2">
              <Label htmlFor="edit-grace-minutes">Grace period (minutes)</Label>
              <Input
                id="edit-grace-minutes"
                type="number"
                min={0}
                value={formData.graceMinutes}
                onChange={(e) => setFormData({ ...formData, graceMinutes: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-is-night-shift"
                  checked={formData.isNightShift}
                  onCheckedChange={(c) => setFormData({ ...formData, isNightShift: !!c })}
                />
                <Label htmlFor="edit-is-night-shift" className="cursor-pointer">Night shift</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-is-active"
                  checked={formData.isActive}
                  onCheckedChange={(c) => setFormData({ ...formData, isActive: !!c })}
                />
                <Label htmlFor="edit-is-active" className="cursor-pointer">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-row justify-between sm:justify-between border-t border-border px-6 py-4 bg-muted/20">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
