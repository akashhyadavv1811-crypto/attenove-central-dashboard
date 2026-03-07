import { useState, useEffect } from "react";
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
import { updateBiometricDevice, type ApiBiometricDevice, type UpdateBiometricDevicePayload } from "@/lib/api";

export type BiometricDeviceForEdit = {
  id: number;
  officeId: number;
  officeName: string;
  deviceId: string;
  name: string;
  isActive: boolean;
  status: string;
};

interface EditBiometricDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: BiometricDeviceForEdit | null;
  onSuccess?: (device: ApiBiometricDevice) => void;
}

export function EditBiometricDeviceModal({
  open,
  onOpenChange,
  device,
  onSuccess,
}: EditBiometricDeviceModalProps) {
  const [formData, setFormData] = useState({
    deviceId: "",
    name: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (device) {
      setFormData({
        deviceId: device.deviceId,
        name: device.name ?? "",
        isActive: device.isActive,
      });
      setError(null);
    }
  }, [device, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!device) return;
    setError(null);
    if (!formData.deviceId.trim()) {
      setError("Device ID is required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload: UpdateBiometricDevicePayload = {
        device_id: formData.deviceId.trim(),
        name: formData.name.trim() || undefined,
        is_active: formData.isActive,
      };
      const updated = await updateBiometricDevice(device.id, payload);
      onSuccess?.(updated);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update device");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) setError(null);
    onOpenChange(isOpen);
  };

  if (!device) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] p-0 gap-0">
        <div className="bg-primary text-primary-foreground px-6 pt-10 pb-3 rounded-t-lg sm:rounded-t-lg">
          <DialogTitle className="text-lg font-semibold text-white">Edit Biometric Device</DialogTitle>
          <DialogDescription className="text-xs text-white/70 mt-0.5">
            {device.officeName} — update device ID, name or status.
          </DialogDescription>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 px-6 py-5">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="edit-device-id">Device ID</Label>
              <Input
                id="edit-device-id"
                placeholder="e.g. 119, 103"
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-device-name">Name (optional)</Label>
              <Input
                id="edit-device-name"
                placeholder="e.g. Reception terminal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <Label htmlFor="edit-device-active" className="cursor-pointer">Active</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Inactive devices are excluded from sync.</p>
              </div>
              <Switch
                id="edit-device-active"
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
              {submitting ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
