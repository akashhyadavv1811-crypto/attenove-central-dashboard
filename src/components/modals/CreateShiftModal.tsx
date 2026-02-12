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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createShift, type ApiShift, type CreateShiftPayload } from "@/lib/api";

export type OfficeOption = { id: number; name: string };

interface CreateShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offices: OfficeOption[];
  onSuccess?: (shift: ApiShift) => void;
}

export function CreateShiftModal({ open, onOpenChange, offices, onSuccess }: CreateShiftModalProps) {
  const [formData, setFormData] = useState({
    officeId: "" as string | number,
    name: "",
    startTime: "",
    endTime: "",
    graceMinutes: 0,
    isNightShift: false,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const officeId = typeof formData.officeId === "string" ? parseInt(formData.officeId, 10) : formData.officeId;
    if (!officeId || !formData.name.trim() || !formData.startTime || !formData.endTime) {
      setError("Office, name, start time and end time are required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateShiftPayload = {
        office_id: officeId,
        name: formData.name.trim(),
        start_time: formData.startTime,
        end_time: formData.endTime,
        grace_minutes: Math.max(0, formData.graceMinutes),
        is_night_shift: formData.isNightShift,
        is_active: formData.isActive,
      };
      const created = await createShift(payload);
      onSuccess?.(created);
      onOpenChange(false);
      setFormData({
        officeId: "",
        name: "",
        startTime: "",
        endTime: "",
        graceMinutes: 0,
        isNightShift: false,
        isActive: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create shift");
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Shift</DialogTitle>
          <DialogDescription>
            Configure shift timings and grace period for an office.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="shift-office">Office</Label>
              <Select
                value={String(formData.officeId)}
                onValueChange={(v) => setFormData({ ...formData, officeId: v })}
                required
              >
                <SelectTrigger id="shift-office">
                  <SelectValue placeholder="Select office" />
                </SelectTrigger>
                <SelectContent>
                  {offices.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shift-name">Shift Name</Label>
              <Input
                id="shift-name"
                placeholder="e.g. Morning Shift, Night Shift"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="grace-minutes">Grace period (minutes)</Label>
              <Input
                id="grace-minutes"
                type="number"
                min={0}
                value={formData.graceMinutes}
                onChange={(e) => setFormData({ ...formData, graceMinutes: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-night-shift"
                  checked={formData.isNightShift}
                  onCheckedChange={(c) => setFormData({ ...formData, isNightShift: !!c })}
                />
                <Label htmlFor="is-night-shift" className="cursor-pointer">Night shift</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-active"
                  checked={formData.isActive}
                  onCheckedChange={(c) => setFormData({ ...formData, isActive: !!c })}
                />
                <Label htmlFor="is-active" className="cursor-pointer">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-row justify-between sm:justify-between">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create Shift"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
