import { useState, useEffect, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, X } from "lucide-react";
import { createEmployee, fetchShifts } from "@/lib/api";
import type { ApiEmployee, ApiShift } from "@/lib/api";
import { toast } from "sonner";
import { ADD_EMPLOYEE_DESIGNATION_OPTIONS, GOVERNMENT_ID_TYPES } from "@/constants/employee";
import { useEmployeeDuplicateCheck } from "@/hooks";
import { getDobValidationError } from "@/lib/utils";

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
  designation: "EMPLOYEE",
  gender: "",
  dateOfBirth: "",
  email: "",
  phone: "",
  governmentIdType: "",
  governmentIdValue: "",
};

export function AddEmployeeModal({
  open,
  onOpenChange,
  organizations,
  offices,
  onSuccess,
}: AddEmployeeModalProps) {
  const [formData, setFormData] = useState(emptyForm);
  const [shifts, setShifts] = useState<ApiShift[]>([]);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dobError, setDobError] = useState<string | undefined>(undefined);

  const { duplicateErrors, setDuplicateErrors, checkDuplicates } = useEmployeeDuplicateCheck({
    getOfficeId: () => formData.officeId,
    getPhone: () => formData.phone,
    getEmail: () => formData.email,
    getGovernmentIdValue: () => formData.governmentIdValue,
  });

  const designationOptions = ADD_EMPLOYEE_DESIGNATION_OPTIONS;
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
    }
  }, [open, organizations]);

  useEffect(() => {
    if (formData.organizationId !== "" && officesForOrg.length > 0 && formData.officeId === "") {
      setFormData((prev) => ({ ...prev, officeId: officesForOrg[0].id }));
    }
  }, [formData.organizationId, officesForOrg.length]);

  useEffect(() => {
    setDuplicateErrors({});
  }, [formData.officeId]);

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
      setDuplicateErrors({});
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
    const dobErr = formData.dateOfBirth.trim() ? getDobValidationError(formData.dateOfBirth) : undefined;
    setDobError(dobErr);
    if (dobErr) {
      toast.error(dobErr);
      return;
    }
    if (duplicateErrors.phone || duplicateErrors.email || duplicateErrors.governmentIdValue) {
      toast.error("Please fix duplicate phone, email, or government ID before submitting.");
      return;
    }
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
          government_id_type: formData.governmentIdType.trim() || undefined,
          government_id_value: formData.governmentIdValue.trim() || undefined,
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
      <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] min-h-[50vh] flex flex-col p-0 gap-0">
        <div className="bg-primary text-primary-foreground px-6 pt-10 pb-3 shrink-0 rounded-t-lg sm:rounded-t-lg">
          <DialogTitle className="text-lg font-semibold text-white">Add New Employee</DialogTitle>
          <DialogDescription className="text-xs text-white/70 mt-0.5">
            Select organization and office, then fill in employee details.
          </DialogDescription>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="overflow-y-auto min-h-0 flex-1 max-h-[calc(90vh-11rem)] scrollbar-modal px-6 pr-5">
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
                  value={formData.designation || "EMPLOYEE"}
                  onValueChange={(v) => setFormData({ ...formData, designation: v })}
                >
                  <SelectTrigger id="add-emp-designation">
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
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
              <Label htmlFor="add-emp-shift">Shift</Label>
              <Select
                value={formData.shiftId !== "" ? String(formData.shiftId) : "none"}
                onValueChange={(v) => setFormData({ ...formData, shiftId: v === "none" ? "" : Number(v) })}
                disabled={!formData.officeId}
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
                <Label htmlFor="add-emp-email">Email</Label>
                <Input
                  id="add-emp-email"
                  type="email"
                  placeholder="employee@company.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (duplicateErrors.email) setDuplicateErrors((p) => ({ ...p, email: undefined }));
                  }}
                  onBlur={() => formData.email.trim() && checkDuplicates("email")}
                  className={duplicateErrors.email ? "border-destructive" : ""}
                />
                {duplicateErrors.email && (
                  <p className="text-xs text-destructive">{duplicateErrors.email}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-emp-phone">Phone Number</Label>
                <Input
                  id="add-emp-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (duplicateErrors.phone) setDuplicateErrors((p) => ({ ...p, phone: undefined }));
                  }}
                  onBlur={() => formData.phone.trim() && checkDuplicates("phone")}
                  className={duplicateErrors.phone ? "border-destructive" : ""}
                />
                {duplicateErrors.phone && (
                  <p className="text-xs text-destructive">{duplicateErrors.phone}</p>
                )}
              </div>
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
                  onChange={(e) => {
                    setFormData({ ...formData, dateOfBirth: e.target.value });
                    if (dobError) setDobError(getDobValidationError(e.target.value));
                  }}
                  onBlur={() => setDobError(formData.dateOfBirth.trim() ? getDobValidationError(formData.dateOfBirth) ?? undefined : undefined)}
                  className={dobError ? "border-destructive" : ""}
                />
                {dobError && <p className="text-xs text-destructive">{dobError}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-emp-gov-id-type">Government ID Type</Label>
                <Select
                  value={formData.governmentIdType || "none"}
                  onValueChange={(v) => setFormData({ ...formData, governmentIdType: v === "none" ? "" : v })}
                >
                  <SelectTrigger id="add-emp-gov-id-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOVERNMENT_ID_TYPES.map((opt) => (
                      <SelectItem key={opt.value || "none"} value={opt.value || "none"}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-emp-gov-id-value">Government ID Value</Label>
                <Input
                  id="add-emp-gov-id-value"
                  placeholder="ID number"
                  value={formData.governmentIdValue}
                  onChange={(e) => {
                    setFormData({ ...formData, governmentIdValue: e.target.value });
                    if (duplicateErrors.governmentIdValue) setDuplicateErrors((p) => ({ ...p, governmentIdValue: undefined }));
                  }}
                  onBlur={() => formData.governmentIdValue.trim() && checkDuplicates("governmentIdValue")}
                  className={duplicateErrors.governmentIdValue ? "border-destructive" : ""}
                />
                {duplicateErrors.governmentIdValue && (
                  <p className="text-xs text-destructive">{duplicateErrors.governmentIdValue}</p>
                )}
              </div>
            </div>
          </div>
          </div>
          <DialogFooter className="flex flex-row justify-between sm:justify-between px-6 py-4 border-t border-border shrink-0">
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
