import { useState, useEffect, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, X } from "lucide-react";
import { createEmployee, fetchDesignations, fetchShifts } from "@/lib/api";
import type { ApiEmployee, ApiShift, DesignationOption } from "@/lib/api";
import { toast } from "sonner";

const DESIGNATION_FALLBACK: DesignationOption[] = [
  { value: "ORG_ADMIN", label: "Org Admin" },
  { value: "OFFICE_ADMIN", label: "Office Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "EMPLOYEE", label: "Staff" },
  { value: "SUPPORT_STAFF", label: "Support Staff" },
];

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizations: { id: number; name: string }[];
  offices: { id: number; name: string; organizationId: number }[];
  onSuccess?: (employee: ApiEmployee) => void;
}

const emptyForm = {
  organizationId: "" as string | number,
  officeId: "" as string | number,
  shiftId: "" as string | number,
  empCode: "",
  name: "",
  designation: "",
  gender: "",
  dateOfBirth: "",
  email: "",
  phone: "",
};

export function AddEmployeeModal({
  open,
  onOpenChange,
  organizations,
  offices,
  onSuccess,
}: AddEmployeeModalProps) {
  const [formData, setFormData] = useState(emptyForm);
  const [designations, setDesignations] = useState<DesignationOption[]>([]);
  const [shifts, setShifts] = useState<ApiShift[]>([]);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const designationOptions = designations.length > 0 ? designations : DESIGNATION_FALLBACK;
  const officesForOrg =
    formData.organizationId !== ""
      ? offices.filter((o) => o.organizationId === Number(formData.organizationId))
      : [];

  useEffect(() => {
    if (open) {
      setFormData({
        ...emptyForm,
        organizationId: organizations[0]?.id ?? "",
        officeId: "",
      });
      setProfilePicFile(null);
      setPhotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchDesignations().then(setDesignations).catch(() => {});
    }
  }, [open, organizations]);

  useEffect(() => {
    if (formData.organizationId !== "" && officesForOrg.length > 0 && formData.officeId === "") {
      setFormData((prev) => ({ ...prev, officeId: officesForOrg[0].id }));
    }
  }, [formData.organizationId, officesForOrg.length]);

  useEffect(() => {
    if (formData.officeId === "") {
      setShifts([]);
      return;
    }
    fetchShifts(Number(formData.officeId)).then(setShifts).catch(() => setShifts([]));
  }, [formData.officeId]);

  useEffect(() => {
    if (formData.officeId !== "" && formData.shiftId !== "" && !shifts.some((s) => s.id === Number(formData.shiftId))) {
      setFormData((prev) => ({ ...prev, shiftId: "" }));
    }
  }, [formData.officeId, formData.shiftId, shifts]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(emptyForm);
      setProfilePicFile(null);
      setPhotoPreview(null);
    }
    onOpenChange(isOpen);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePicFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const orgId = Number(formData.organizationId);
    const officeId = Number(formData.officeId);
    if (!orgId || !officeId || !formData.empCode.trim() || !formData.name.trim()) {
      toast.error("Organization, Office, Emp Code, and Name are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const shiftIdNum = formData.shiftId !== "" ? Number(formData.shiftId) : undefined;
      const created = await createEmployee(
        {
          organization_id: orgId,
          office_id: officeId,
          shift_id: shiftIdNum ?? null,
          emp_code: formData.empCode.trim(),
          name: formData.name.trim(),
          designation: formData.designation.trim() || undefined,
          gender: formData.gender && ["M", "F", "O"].includes(formData.gender) ? formData.gender : undefined,
          date_of_birth: formData.dateOfBirth.trim() || undefined,
          email: formData.email.trim() || undefined,
          phone_number: formData.phone.trim() || undefined,
        },
        profilePicFile || undefined
      );
      toast.success("Employee added.");
      onSuccess?.(created);
      handleClose(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add employee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Select organization and office, then fill in employee details. Manager can be assigned when editing the office.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar className="w-20 h-20 border-2 border-dashed border-muted-foreground/50">
                  <AvatarImage src={photoPreview ?? undefined} />
                  <AvatarFallback className="bg-muted">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                {photoPreview && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full"
                    onClick={handleRemovePhoto}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="add-emp-photo"
                  onChange={handlePhotoChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoPreview ? "Change Photo" : "Upload Photo"}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-emp-org">Organization</Label>
                <Select
                  value={String(formData.organizationId)}
                  onValueChange={(v) =>
                    setFormData({ ...formData, organizationId: v ? Number(v) : "", officeId: "", shiftId: "" })
                  }
                  required
                >
                  <SelectTrigger id="add-emp-org">
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
              <div className="grid gap-2">
                <Label htmlFor="add-emp-office">Office</Label>
                <Select
                  value={formData.officeId !== "" ? String(formData.officeId) : ""}
                  onValueChange={(v) => setFormData({ ...formData, officeId: v ? Number(v) : "", shiftId: "" })}
                  required
                  disabled={officesForOrg.length === 0}
                >
                  <SelectTrigger id="add-emp-office">
                    <SelectValue placeholder={officesForOrg.length === 0 ? "No offices" : "Select office"} />
                  </SelectTrigger>
                  <SelectContent>
                    {officesForOrg.map((office) => (
                      <SelectItem key={office.id} value={String(office.id)}>
                        {office.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-emp-shift">Shift</Label>
              <Select
                value={formData.shiftId !== "" ? String(formData.shiftId) : "none"}
                onValueChange={(v) => setFormData({ ...formData, shiftId: v === "none" ? "" : Number(v) })}
                disabled={!formData.officeId || shifts.length === 0}
              >
                <SelectTrigger id="add-emp-shift">
                  <SelectValue placeholder={!formData.officeId ? "Select office first" : shifts.length === 0 ? "No shifts" : "Select shift (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {shifts.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} {s.start_time && s.end_time ? `(${s.start_time} – ${s.end_time})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-emp-code">Emp Code</Label>
                <Input
                  id="add-emp-code"
                  placeholder="e.g. EMP001"
                  value={formData.empCode}
                  onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-emp-designation">Designation</Label>
                <Select
                  value={formData.designation || "none"}
                  onValueChange={(v) => setFormData({ ...formData, designation: v === "none" ? "" : v })}
                >
                  <SelectTrigger id="add-emp-designation">
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    {designationOptions.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-emp-name">Full Name</Label>
              <Input
                id="add-emp-name"
                placeholder="Enter employee name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-emp-gender">Gender</Label>
                <Select
                  value={formData.gender || "none"}
                  onValueChange={(v) => setFormData({ ...formData, gender: v === "none" ? "" : v })}
                >
                  <SelectTrigger id="add-emp-gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="O">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-emp-dob">Date of Birth</Label>
                <Input
                  id="add-emp-dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-emp-email">Email</Label>
                <Input
                  id="add-emp-email"
                  type="email"
                  placeholder="employee@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-emp-phone">Phone Number</Label>
                <Input
                  id="add-emp-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-row justify-between sm:justify-between">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
