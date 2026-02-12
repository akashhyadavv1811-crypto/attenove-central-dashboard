import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { createOffice, updateOffice } from "@/lib/api";
import type { ApiOffice } from "@/lib/api";
import { toast } from "sonner";

export interface Office {
  id: number;
  name: string;
  organizationId: number;
  organizationName?: string;
  location: string;
  fullAddress: string;
  numBiometricDevices: number;
  status: string;
}

type Mode = "add" | "edit";

interface OfficeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  /** Required when mode is "edit" */
  office?: Office | null;
  /** List of organizations for the dropdown (add) and display (edit) */
  organizations: { id: number; name: string }[];
  onAddSuccess?: (office: ApiOffice) => void;
  onEditSave?: (office: Office) => void;
}

const emptyForm = {
  organizationId: "" as string | number,
  name: "",
  location: "",
  fullAddress: "",
  numBiometricDevices: 0,
  isActive: true,
};

export function OfficeModal({
  open,
  onOpenChange,
  mode,
  office = null,
  organizations,
  onAddSuccess,
  onEditSave,
}: OfficeModalProps) {
  const isAdd = mode === "add";
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (office) {
        setFormData({
          organizationId: office.organizationId,
          name: office.name,
          location: office.location ?? "",
          fullAddress: office.fullAddress ?? "",
          numBiometricDevices: office.numBiometricDevices ?? 0,
          isActive: office.status === "Active",
        });
      } else {
        setFormData({
          ...emptyForm,
          organizationId: organizations[0]?.id ?? "",
        });
      }
    }
  }, [open, office, organizations]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(emptyForm);
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdd) {
      const orgId = Number(formData.organizationId);
      if (!orgId || !formData.name.trim()) {
        toast.error("Organization and Office name are required.");
        return;
      }
      setIsSubmitting(true);
      try {
        const created = await createOffice({
          organization_id: orgId,
          name: formData.name.trim(),
          location: formData.location.trim() || undefined,
          full_address: formData.fullAddress.trim() || undefined,
          num_biometric_devices: Math.max(0, Number(formData.numBiometricDevices) || 0),
        });
        toast.success("Office created.");
        onAddSuccess?.(created);
        handleClose(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create office.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!office) return;
      if (!formData.name.trim()) {
        toast.error("Office name is required.");
        return;
      }
      setIsSubmitting(true);
      try {
        await updateOffice(office.id, {
          name: formData.name.trim(),
          location: formData.location.trim() || undefined,
          full_address: formData.fullAddress.trim() || undefined,
          num_biometric_devices: Math.max(0, Number(formData.numBiometricDevices) || 0),
          is_active: formData.isActive,
        });
        const updated: Office = {
          ...office,
          name: formData.name.trim(),
          location: formData.location.trim(),
          fullAddress: formData.fullAddress.trim(),
          numBiometricDevices: Math.max(0, Number(formData.numBiometricDevices) || 0),
          status: formData.isActive ? "Active" : "Inactive",
        };
        toast.success("Office updated.");
        onEditSave?.(updated);
        handleClose(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden [&>button]:right-5 [&>button]:top-5 [&>button]:z-10">
        <div className="border-b border-border bg-primary text-primary-foreground px-6 pt-8 pb-4">
          <h2 className="text-lg font-semibold text-white">
            {isAdd ? "Add Office" : "Edit Office"}
          </h2>
          <p className="text-sm text-white/80 mt-0.5">
            {isAdd
              ? "Create a new office under an organization."
              : "Update office details."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 px-6 py-5 max-h-[60vh] overflow-y-auto">
            {isAdd ? (
              <div className="grid gap-2">
                <Label htmlFor="office-org">Organization</Label>
                <Select
                  value={String(formData.organizationId)}
                  onValueChange={(v) => setFormData({ ...formData, organizationId: v ? Number(v) : "" })}
                  required
                >
                  <SelectTrigger id="office-org">
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={String(org.id)}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label>Organization</Label>
                <p className="text-sm text-muted-foreground py-2">
                  {office?.organizationName ?? "—"}
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="office-name">Office Name</Label>
              <Input
                id="office-name"
                placeholder="e.g. Headquarters, Branch Office"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="office-location">Location</Label>
              <Input
                id="office-location"
                placeholder="e.g. Mumbai, Andheri East"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="office-full-address">Full Address</Label>
              <Input
                id="office-full-address"
                placeholder="e.g. 123 Main St, Building A"
                value={formData.fullAddress}
                onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="office-devices">Number of Biometric Devices</Label>
              <Input
                id="office-devices"
                type="number"
                min={0}
                placeholder="0"
                value={formData.numBiometricDevices === 0 ? "" : formData.numBiometricDevices}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numBiometricDevices: Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
              />
            </div>

            {!isAdd && (
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label htmlFor="office-active">Active</Label>
                  <p className="text-sm text-muted-foreground">Inactive offices are hidden from normal use.</p>
                </div>
                <Switch
                  id="office-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-border px-6 py-4 bg-muted/20">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (isAdd ? "Creating..." : "Saving...") : isAdd ? "Create Office" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
