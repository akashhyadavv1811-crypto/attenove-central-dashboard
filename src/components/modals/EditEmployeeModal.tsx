import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { updateEmployee, getProfilePicUrl, fetchDesignations } from "@/lib/api";
import type { DesignationOption } from "@/lib/api";
import { toast } from "sonner";
import { DESIGNATION_FALLBACK, GOVERNMENT_ID_TYPES } from "@/constants/employee";
import { useEmployeeDuplicateCheck } from "@/hooks";
import { getDobValidationError } from "@/lib/utils";

export interface Employee {
  id: number;
  organizationId: number;
  officeId: number;
  empCode: string;
  name: string;
  designation: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  governmentIdType?: string;
  governmentIdValue?: string;
  profilePic: string | null;
  status: string;
  organizationName?: string;
  officeName?: string;
}

interface EditEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  offices: { id: number; name: string; organizationId: number }[];
  onSave: (employee: Employee) => void;
}

export function EditEmployeeModal({
  open,
  onOpenChange,
  employee,
  offices,
  onSave,
}: EditEmployeeModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    gender: "",
    dateOfBirth: "",
    email: "",
    phoneNumber: "",
    empCode: "",
    officeId: "" as string | number,
    status: "Active",
    governmentIdType: "",
    governmentIdValue: "",
  });
  const [designations, setDesignations] = useState<DesignationOption[]>([]);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dobError, setDobError] = useState<string | undefined>(undefined);

  const { duplicateErrors, setDuplicateErrors, checkDuplicates } = useEmployeeDuplicateCheck({
    getOfficeId: () => (formData.officeId !== "" ? formData.officeId : (employee?.officeId ?? "")),
    getPhone: () => formData.phoneNumber,
    getEmail: () => formData.email,
    getGovernmentIdValue: () => formData.governmentIdValue,
    getExcludeEmployeeId: () => employee?.id,
  });

  const designationOptions = designations.length > 0 ? designations : DESIGNATION_FALLBACK;
  const officesForOrg = employee
    ? offices.filter((o) => o.organizationId === employee.organizationId)
    : [];

  useEffect(() => {
    if (open && employee) {
      setFormData({
        name: employee.name,
        designation: employee.designation ?? "",
        gender: employee.gender ?? "",
        dateOfBirth: employee.dateOfBirth ?? "",
        email: employee.email ?? "",
        phoneNumber: employee.phoneNumber ?? "",
        empCode: employee.empCode,
        officeId: employee.officeId,
        status: employee.status,
        governmentIdType: employee.governmentIdType ?? "",
        governmentIdValue: employee.governmentIdValue ?? "",
      });
      setProfilePicFile(null);
      setPhotoPreview(null);
      setDuplicateErrors({});
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchDesignations().then(setDesignations).catch(() => {});
    }
  }, [open, employee]);

  useEffect(() => {
    setDuplicateErrors({});
  }, [formData.officeId]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen && employee) {
      setFormData({
        name: employee.name,
        designation: employee.designation ?? "",
        gender: employee.gender ?? "",
        dateOfBirth: employee.dateOfBirth ?? "",
        email: employee.email ?? "",
        phoneNumber: employee.phoneNumber ?? "",
        empCode: employee.empCode,
        officeId: employee.officeId,
        status: employee.status,
        governmentIdType: employee.governmentIdType ?? "",
        governmentIdValue: employee.governmentIdValue ?? "",
      });
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
    if (!employee) return;
    const dobErr = formData.dateOfBirth.trim() ? getDobValidationError(formData.dateOfBirth) : undefined;
    setDobError(dobErr);
    if (dobErr) {
      toast.error(dobErr);
      return;
    }
    if (duplicateErrors.phone || duplicateErrors.email || duplicateErrors.governmentIdValue) {
      toast.error("Please fix duplicate phone, email, or government ID before saving.");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const updatedApi = await updateEmployee(
        employee.id,
        {
          name: formData.name.trim(),
          designation: formData.designation.trim() || undefined,
          gender: formData.gender && ["M", "F", "O"].includes(formData.gender) ? formData.gender : undefined,
          date_of_birth: formData.dateOfBirth.trim() || undefined,
          email: formData.email.trim() || undefined,
          phone_number: formData.phoneNumber.trim() || undefined,
          emp_code: formData.empCode.trim() || undefined,
          office_id: formData.officeId !== "" ? Number(formData.officeId) : undefined,
          is_active: formData.status === "Active",
          government_id_type: formData.governmentIdType.trim() || undefined,
          government_id_value: formData.governmentIdValue.trim() || undefined,
        },
        profilePicFile || undefined
      );
      const updated: Employee = {
        ...employee,
        name: formData.name.trim(),
        designation: formData.designation.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        empCode: formData.empCode.trim(),
        officeId: formData.officeId !== "" ? Number(formData.officeId) : employee.officeId,
        status: formData.status,
        governmentIdType: formData.governmentIdType.trim() || undefined,
        governmentIdValue: formData.governmentIdValue.trim() || undefined,
        profilePic: updatedApi.profile_pic ?? employee.profilePic,
      };
      toast.success("Employee updated.");
      onSave(updated);
      handleClose(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] min-h-[50vh] flex flex-col p-0 gap-0">
        <div className="bg-primary text-primary-foreground px-6 pt-10 pb-3 shrink-0 rounded-t-lg sm:rounded-t-lg">
          <DialogTitle className="text-lg font-semibold text-white">Edit Employee</DialogTitle>
          <DialogDescription className="text-xs text-white/70 mt-0.5">
            Update the employee details below.
          </DialogDescription>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="overflow-y-auto min-h-0 flex-1 max-h-[calc(90vh-11rem)] scrollbar-modal px-6 pr-5">
          <div className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="w-20 h-20 border-2 border-dashed border-muted-foreground/50">
                <AvatarImage src={photoPreview ?? getProfilePicUrl(employee.profilePic) ?? undefined} />
                <AvatarFallback className="bg-muted text-lg">
                  {employee.name.slice(0, 2).toUpperCase()}
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
                id="edit-emp-photo"
                onChange={handlePhotoChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4 mr-2" />
                {photoPreview || employee.profilePic ? "Change Photo" : "Upload Photo"}
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-emp-name">Full Name</Label>
            <Input
              id="edit-emp-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-emp-code">Emp Code</Label>
            <Input
              id="edit-emp-code"
              value={formData.empCode}
              onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
              placeholder="Emp code"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-emp-designation">Designation</Label>
            <Select
              value={formData.designation || "none"}
              onValueChange={(v) => setFormData({ ...formData, designation: v === "none" ? "" : v })}
            >
              <SelectTrigger id="edit-emp-designation">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-emp-gender">Gender</Label>
              <Select
                value={formData.gender || "none"}
                onValueChange={(v) => setFormData({ ...formData, gender: v === "none" ? "" : v })}
              >
                <SelectTrigger id="edit-emp-gender">
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
              <Label htmlFor="edit-emp-dob">Date of Birth</Label>
              <Input
                id="edit-emp-dob"
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
          <div className="grid gap-2">
            <Label htmlFor="edit-emp-email">Email</Label>
            <Input
              id="edit-emp-email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (duplicateErrors.email) setDuplicateErrors((p) => ({ ...p, email: undefined }));
              }}
              onBlur={() => formData.email.trim() && checkDuplicates("email")}
              placeholder="email@company.com"
              className={duplicateErrors.email ? "border-destructive" : ""}
            />
            {duplicateErrors.email && (
              <p className="text-xs text-destructive">{duplicateErrors.email}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-emp-phone">Phone Number</Label>
            <Input
              id="edit-emp-phone"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => {
                setFormData({ ...formData, phoneNumber: e.target.value });
                if (duplicateErrors.phone) setDuplicateErrors((p) => ({ ...p, phone: undefined }));
              }}
              onBlur={() => formData.phoneNumber.trim() && checkDuplicates("phone")}
              placeholder="+91 98765 43210"
              className={duplicateErrors.phone ? "border-destructive" : ""}
            />
            {duplicateErrors.phone && (
              <p className="text-xs text-destructive">{duplicateErrors.phone}</p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-emp-gov-id-type">Government ID Type</Label>
              <Select
                value={formData.governmentIdType || "none"}
                onValueChange={(v) => setFormData({ ...formData, governmentIdType: v === "none" ? "" : v })}
              >
                <SelectTrigger id="edit-emp-gov-id-type">
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
              <Label htmlFor="edit-emp-gov-id-value">Government ID Value</Label>
              <Input
                id="edit-emp-gov-id-value"
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
          <div className="grid gap-2">
            <Label htmlFor="edit-emp-office">Office</Label>
            <Select
              value={formData.officeId !== "" ? String(formData.officeId) : ""}
              onValueChange={(v) => setFormData({ ...formData, officeId: v ? Number(v) : "" })}
              disabled={officesForOrg.length === 0}
            >
              <SelectTrigger id="edit-emp-office">
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
          <div className="grid gap-2">
            <Label htmlFor="edit-emp-status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => setFormData({ ...formData, status: v })}
            >
              <SelectTrigger id="edit-emp-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          </div>
          </div>
          <DialogFooter className="flex flex-row justify-between sm:justify-between px-6 py-4 border-t border-border shrink-0">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
