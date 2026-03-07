import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createBiometricDevice,
  type ApiBiometricDevice,
  type CreateBiometricDevicePayload,
} from "@/lib/api";

export type OfficeOption = { id: number; name: string };

interface AddBiometricDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offices: OfficeOption[];
  onSuccess?: (device: ApiBiometricDevice) => void;
}

export function AddBiometricDeviceModal({
  open,
  onOpenChange,
  offices,
  onSuccess,
}: AddBiometricDeviceModalProps) {
  const [formData, setFormData] = useState({
    officeId: "" as string | number,
    deviceId: "",
    name: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const officeId = typeof formData.officeId === "string" ? parseInt(formData.officeId, 10) : formData.officeId;
    if (!officeId || !formData.deviceId.trim()) {
      setError("Office and Device ID are required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateBiometricDevicePayload = {
        office_id: officeId,
        device_id: formData.deviceId.trim(),
        name: formData.name.trim() || undefined,
        is_active: formData.isActive,
      };
      const created = await createBiometricDevice(payload);
      onSuccess?.(created);
      onOpenChange(false);
      setFormData({
        officeId: "",
        deviceId: "",
        name: "",
        isActive: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add device");
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
      <DialogContent className="sm:max-w-[500px] w-[95vw] p-0 gap-0">
        <div className="bg-primary text-primary-foreground px-6 pt-10 pb-3 rounded-t-lg sm:rounded-t-lg">
          <DialogTitle className="text-lg font-semibold text-white">Add Biometric Device</DialogTitle>
          <DialogDescription className="text-xs text-white/70 mt-0.5">
            Register a biometric device for an office. Device ID is the ID shown in ESSL logs (e.g. 119, 103).
          </DialogDescription>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 px-6 py-5">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="device-office">Office</Label>
              <Select
                value={String(formData.officeId)}
                onValueChange={(v) => setFormData({ ...formData, officeId: v })}
                required
              >
                <SelectTrigger id="device-office">
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
              <Label htmlFor="device-id">Device ID</Label>
              <Input
                id="device-id"
                placeholder="e.g. 119, 103"
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="device-name">Name (optional)</Label>
              <Input
                id="device-name"
                placeholder="e.g. Reception terminal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <Label htmlFor="device-active" className="cursor-pointer">Active</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Inactive devices are excluded from sync.</p>
              </div>
              <Switch
                id="device-active"
                checked={formData.isActive}
                onCheckedChange={(c) => setFormData({ ...formData, isActive: !!c })}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-row justify-between sm:justify-between border-t border-border px-6 py-4 bg-muted/20">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add Device"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
